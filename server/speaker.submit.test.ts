import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createSpeakerApplication: vi.fn().mockResolvedValue({ id: 42 }),
  findRecentSpeakerApplication: vi.fn().mockResolvedValue(undefined),
  storagePut: vi.fn().mockResolvedValue({ key: "photo-key", url: "/manus-storage/photo-key" }),
}));

vi.mock("./db", () => ({
  createSpeakerApplication: mocks.createSpeakerApplication,
  findRecentSpeakerApplication: mocks.findRecentSpeakerApplication,
}));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

import { appRouter } from "./routers";

function context(ip = "test-ip"): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, ip } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validApplication = {
  fullName: "Amina Ben Ali",
  email: "amina@example.com",
  phone: "+216 20 000 000",
  age: 22,
  cityCountry: "Tunis, Tunisia",
  currentStatus: "Student",
  currentWork: "Design student and community organizer",
  links: "https://example.com",
  idea: "Young people can redesign how their cities listen to them.",
  disagreement: "Most people might disagree that small local actions can reshape public life.",
  oneThing: "Your first act of participation can change the room.",
  area: "Youth & Society",
  spokenBefore: "Yes" as const,
  speakingWhere: "University events",
  whySpeak: "I want to turn a lived experience into a useful question for other young people.",
  photoName: "portrait.jpg",
  photoMimeType: "image/jpeg" as const,
  photoData: "data:image/jpeg;base64," + Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(80)]).toString("base64"),
  anythingElse: "Thank you for considering this application.",
  honeypot: "",
  consent: true as const,
};

describe("speaker.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findRecentSpeakerApplication.mockResolvedValue(undefined);
    mocks.createSpeakerApplication.mockResolvedValue({ id: 42 });
    mocks.storagePut.mockResolvedValue({ key: "photo-key", url: "/manus-storage/photo-key" });
  });

  it("rejects a bot-filled honeypot before storing anything", async () => {
    const caller = appRouter.createCaller(context("honeypot-ip"));
    await expect(caller.speaker.submit({ ...validApplication, honeypot: "filled" })).rejects.toThrow();
    expect(mocks.createSpeakerApplication).not.toHaveBeenCalled();
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });

  it("rejects malformed long answers through the input contract", async () => {
    const caller = appRouter.createCaller(context("invalid-input-ip"));
    await expect(caller.speaker.submit({ ...validApplication, idea: "Too short" })).rejects.toThrow();
    expect(mocks.createSpeakerApplication).not.toHaveBeenCalled();
  });

  it("rejects photo bytes that do not match the declared MIME type", async () => {
    const caller = appRouter.createCaller(context("invalid-photo-ip"));
    await expect(caller.speaker.submit({ ...validApplication, photoData: "data:image/jpeg;base64," + Buffer.alloc(90).toString("base64") })).rejects.toThrow("Photo content does not match");
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });

  it("rejects a recent duplicate application", async () => {
    mocks.findRecentSpeakerApplication.mockResolvedValueOnce({ id: 7 });
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = "";
    const caller = appRouter.createCaller(context("duplicate-ip"));
    await expect(caller.speaker.submit(validApplication)).rejects.toThrow("already submitted recently");
    expect(mocks.storagePut).not.toHaveBeenCalled();
  });

  it("limits repeated submissions from the same IP", async () => {
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = "";
    const caller = appRouter.createCaller(context("rate-limit-ip"));
    await caller.speaker.submit(validApplication);
    await expect(caller.speaker.submit({ ...validApplication, email: "second@example.com" })).rejects.toThrow("Please wait before submitting again");
  });

  it("returns an error when the photo storage fails", async () => {
    mocks.storagePut.mockRejectedValueOnce(new Error("storage unavailable"));
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = "";
    const caller = appRouter.createCaller(context("storage-error-ip"));
    await expect(caller.speaker.submit(validApplication)).rejects.toThrow("storage unavailable");
    expect(mocks.createSpeakerApplication).not.toHaveBeenCalled();
  });

  it("returns an error when the sheet webhook fails", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/test/exec";
    const caller = appRouter.createCaller(context("sheet-error-ip"));
    await expect(caller.speaker.submit(validApplication)).rejects.toThrow("Google Sheets submission failed");
    expect(mocks.createSpeakerApplication).toHaveBeenCalledOnce();
    globalThis.fetch = originalFetch;
  });

  it("stores a valid application and forwards it to the sheet webhook", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({ ok: true }) }) as unknown as typeof fetch;
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/test/exec";

    const caller = appRouter.createCaller(context("success-ip"));
    const result = await caller.speaker.submit(validApplication);

    expect(result).toMatchObject({ success: true, applicationId: 42, sheetSynced: true });
    expect(mocks.storagePut).toHaveBeenCalledOnce();
    expect(mocks.createSpeakerApplication).toHaveBeenCalledOnce();
    expect(globalThis.fetch).toHaveBeenCalledOnce();

    globalThis.fetch = originalFetch;
  });
});
