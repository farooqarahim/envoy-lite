import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

export function email(): Validator<string> {
  return makeValidator<string>(parseEmail);
}

function parseEmail(input: string | undefined): ParseResult<string> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (!EMAIL_RE.test(trimmed)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_EMAIL",
        message: `Expected a valid email address. Received: ${input}.`,
        meta: { received: input }
      }
    };
  }
  return { ok: true, value: trimmed };
}
