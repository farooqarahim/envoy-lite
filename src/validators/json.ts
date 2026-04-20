import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface JsonOptions<T> {
  validate?: (value: unknown) => value is T;
}

export function json<T = unknown>(opts: JsonOptions<T> = {}): Validator<T> {
  return makeValidator<T>((input) => parseJson(input, opts));
}

function parseJson<T>(input: string | undefined, opts: JsonOptions<T>): ParseResult<T> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return {
      ok: false,
      issue: { code: "INVALID_JSON", message: "Expected valid JSON." }
    };
  }
  if (opts.validate && !opts.validate(parsed)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_TYPE",
        message: "Parsed JSON failed custom validation.",
        meta: { expected: "validated json" }
      }
    };
  }
  return { ok: true, value: parsed as T };
}
