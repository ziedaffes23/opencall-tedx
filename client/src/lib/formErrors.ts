export type SpeakerField = "fullName" | "email" | "phone" | "age" | "cityCountry" | "status" | "currentWork" | "links" | "idea" | "disagreement" | "oneThing" | "area" | "spokenBefore" | "speakingWhere" | "whySpeak" | "anythingElse";

export function mapSpeakerSubmitError(error: unknown) {
  const serverError = error as { message?: string; data?: { zodError?: { fieldErrors?: Record<string, string[]> } } };
  const serverFieldErrors = serverError.data?.zodError?.fieldErrors ?? {};
  const fieldErrors: Partial<Record<SpeakerField, string>> = {};

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
    formError: serverError.message || "Something went wrong while sending your application. Please try again.",
  };
}
