import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createSpeakerApplication, findRecentSpeakerApplication } from "./db";
import { storagePut } from "./storage";
import { syncApplicationToGoogleSheets } from "./googleSheets";

const recentSubmissions = new Map<string, number>();

const applicationInput = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(5).max(40),
  age: z.number().int().min(13).max(100),
  cityCountry: z.string().trim().min(2).max(160),
  currentStatus: z.string().trim().min(1).max(80),
  currentWork: z.string().trim().min(2).max(320),
  links: z.string().trim().max(700).optional().or(z.literal("")),
  idea: z.string().trim().min(20).max(10000),
  disagreement: z.string().trim().min(20).max(10000),
  oneThing: z.string().trim().min(10).max(5000),
  area: z.string().trim().min(1).max(100),
  spokenBefore: z.enum(["Yes", "No"]),
  speakingWhere: z.string().trim().max(500).optional().or(z.literal("")),
  whySpeak: z.string().trim().min(20).max(10000),
  photoName: z.string().trim().min(1).max(180),
  photoMimeType: z.enum(["image/jpeg", "image/png"]),
  photoData: z.string().min(100),
  anythingElse: z.string().trim().max(10000).optional().or(z.literal("")),
  honeypot: z.string().max(0).optional().or(z.literal("")),
  consent: z.literal(true),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  speaker: router({
    submit: publicProcedure.input(applicationInput).mutation(async ({ input, ctx }) => {
      if (input.honeypot) throw new Error("Invalid submission");
      const ip = ctx.req.ip || ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0] || "unknown";
      const now = Date.now();
      const previous = recentSubmissions.get(ip);
      if (previous && now - previous < 20_000) throw new Error("Please wait before submitting again");
      recentSubmissions.set(ip, now);
      if (recentSubmissions.size > 5000) {
        recentSubmissions.forEach((value, key) => {
          if (now - value > 60 * 60 * 1000) recentSubmissions.delete(key);
        });
      }
      const duplicate = await findRecentSpeakerApplication(input.email, input.idea);
      if (duplicate) throw new Error("This application was already submitted recently");
      const dataUrlMatch = input.photoData.match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/);
      if (!dataUrlMatch || dataUrlMatch[1] !== input.photoMimeType) throw new Error("Invalid photo format");
      const rawBase64 = dataUrlMatch[2];
      const photoBuffer = Buffer.from(rawBase64, "base64");
      if (!photoBuffer.length || photoBuffer.length > 5 * 1024 * 1024) {
        throw new Error("Photo must be between 1 byte and 5 MB");
      }
      const isJpeg = input.photoMimeType === "image/jpeg" && photoBuffer.length >= 3 && photoBuffer[0] === 0xff && photoBuffer[1] === 0xd8 && photoBuffer[2] === 0xff;
      const isPng = input.photoMimeType === "image/png" && photoBuffer.length >= 8 && photoBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      if (!isJpeg && !isPng) throw new Error("Photo content does not match its file type");
      const safeName = input.photoName.replace(/[^a-zA-Z0-9._-]/g, "-");
      let photoUrl = "Photo upload unavailable";
      try {
        ({ url: photoUrl } = await storagePut(
          `speaker-applications/${Date.now()}-${safeName}`,
          photoBuffer,
          input.photoMimeType,
        ));
      } catch (error) {
        if (!(error instanceof Error) || !error.message.startsWith("Storage config missing:")) throw error;
        console.warn("[Speaker application] Photo storage is not configured; continuing without photo URL");
      }
      const application = {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        age: input.age,
        cityCountry: input.cityCountry,
        currentStatus: input.currentStatus,
        currentWork: input.currentWork,
        links: input.links || null,
        idea: input.idea,
        disagreement: input.disagreement,
        oneThing: input.oneThing,
        area: input.area,
        spokenBefore: input.spokenBefore,
        speakingWhere: input.speakingWhere || null,
        whySpeak: input.whySpeak,
        photoUrl,
        anythingElse: input.anythingElse || null,
        consent: 1,
        status: "new" as const,
      };
      const saved = await createSpeakerApplication(application);
      const sheetSynced = await syncApplicationToGoogleSheets({
        ...application,
        applicationId: saved.id,
        submittedAt: new Date().toISOString(),
      });
      if (process.env.GOOGLE_SHEETS_WEBHOOK_URL && !sheetSynced) {
        throw new Error("Google Sheets submission failed");
      }
      return { success: true, applicationId: saved.id, sheetSynced } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
