import { describe, expect, it } from "vitest";

describe("Google Sheets webhook configuration", () => {
  it("reaches the configured Apps Script endpoint without exposing the URL in application code", async () => {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    expect(webhookUrl).toMatch(/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/);

    const response = await fetch(webhookUrl!, { method: "GET", redirect: "follow" });
    expect(response.url).toContain("script.google.com/macros/s/");
    expect(response.status).toBeLessThan(500);
  }, 15_000);
});
