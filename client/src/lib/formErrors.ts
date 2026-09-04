export type SpeakerField = "fullName" | "email" | "phone" | "age" | "cityCountry" | "status" | "currentWork" | "links" | "idea" | "disagreement" | "oneThing" | "area" | "spokenBefore" | "speakingWhere" | "whySpeak" | "anythingElse";

export function mapSpeakerSubmitError(error: unknown) {
  const serverError = error as { message?: string; data?: { zodError?: { fieldErrors?: Record<string, string[]> } } };
  const serverFieldErrors = serverError.data?.zodError?.fieldErrors ?? {};
  const fieldErrors: Partial<Record<SpeakerField, string>> = {};

  let friendlyMessage = serverError.message || "Something went wrong while sending your application. Please try again.";
  try {
    const raw = JSON.parse(friendlyMessage);
    if (Array.isArray(raw)) {
      raw.forEach((issue: { path?: string[]; code?: string; minimum?: number; message?: string }) => {
        const key = issue.path?.[0];
        if (key && !fieldErrors[key as SpeakerField]) {
          const label = key === "oneThing" ? "the one thing your audience should remember" : key === "whySpeak" ? "why you want to speak" : "this field";
          fieldErrors[key as SpeakerField] = issue.code === "too_small" && issue.minimum ? `Please write at least ${issue.minimum} characters about ${label}.` : `Please check ${label}.`;
        }
      });
      friendlyMessage = "Please correct the highlighted fields before submitting.";
    }
  } catch {
    // Keep the normal server message when it is not a serialized validation payload.
  }

  Object.entries(serverFieldErrors).forEach(([key, messages]) => {
    const formKey = key === "currentStatus" ? "status" : key;
    if (formKey in {
      fullName: true, email: true, phone: true, age: true, cityCountry: true, status: true,
      currentWork: true, links: true, idea: true, disagreement: true, oneThing: true,
      area: true, spokenBefore: true, speakingWhere: true, whySpeak: true, anythingElse: true,
    }) {
      fieldErrors[formKey as SpeakerField] = messages?.[0] || "Please check this field.";
    }
  });

  return {
    fieldErrors,
    formError: friendlyMessage,
  };
}
