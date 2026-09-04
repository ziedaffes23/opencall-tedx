type SpeakerApplicationForSheet = {
  applicationId: number;
  submittedAt: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  cityCountry: string;
  currentStatus: string;
  currentWork: string;
  links: string | null;
  idea: string;
  disagreement: string;
  oneThing: string;
  area: string;
  spokenBefore: "Yes" | "No";
  speakingWhere: string | null;
  whySpeak: string;
  photoUrl: string;
  photoName?: string;
  photoMimeType?: "image/jpeg" | "image/png";
  photoData?: string;
  anythingElse: string | null;
  consent: number;
  status: string;
};

const SYNC_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 2;

export async function syncApplicationToGoogleSheets(application: SpeakerApplicationForSheet): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return false;

  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim();
  const payload = JSON.stringify({ ...application, ...(secret ? { secret } : {}) });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: controller.signal,
      });
      const responseText = await response.text();
      let responseBody: { ok?: boolean; error?: string } = {};
      try {
        responseBody = JSON.parse(responseText) as { ok?: boolean; error?: string };
      } catch {
        // Treat a non-JSON response as a failed webhook acknowledgement.
      }
      if (response.ok && responseBody.ok === true) return true;
      if (attempt === MAX_ATTEMPTS) {
        console.error(`[Google Sheets] webhook returned ${response.status}: ${responseBody.error || responseText.slice(0, 200)}`);
      }
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        console.error("[Google Sheets] webhook request failed:", error);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return false;
}
