import { describe, expect, it } from "vitest";
import { mapSpeakerSubmitError } from "./formErrors";

describe("mapSpeakerSubmitError", () => {
  it("maps server field names and preserves a useful message", () => {
    const result = mapSpeakerSubmitError({
      message: "Please correct the highlighted fields.",
      data: { zodError: { fieldErrors: { currentStatus: ["Choose a status"], email: ["Invalid email"] } } },
    });

    expect(result).toEqual({
      formError: "Please correct the highlighted fields.",
      fieldErrors: { status: "Choose a status", email: "Invalid email" },
    });
  });

  it("falls back to a global message for non-validation errors", () => {
    expect(mapSpeakerSubmitError(new Error("Please wait before submitting again"))).toEqual({
      formError: "Please wait before submitting again",
      fieldErrors: {},
    });
  });
});
