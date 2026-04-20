import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export function enum_<T extends readonly [string, ...string[]]>(
  values: T
): Validator<T[number]> {
  return makeValidator<T[number]>((input) => parseEnum(input, values));
}

function parseEnum<T extends readonly [string, ...string[]]>(
  input: string | undefined,
  values: T
): ParseResult<T[number]> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  if (input.trim().length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (!values.includes(input as T[number])) {
    return {
      ok: false,
      issue: {
        code: "INVALID_ENUM",
        message: `Expected one of: ${values.join(", ")}. Received: ${input}.`,
        meta: { allowed: values.slice(), received: input }
      }
    };
  }
  return { ok: true, value: input as T[number] };
}
