import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface RegexOptions {
  trim?: boolean;
  message?: string;
}

export function regex(pattern: RegExp, opts: RegexOptions = {}): Validator<string> {
  return makeValidator<string>((input) => parseRegex(input, pattern, opts));
}

function parseRegex(
  input: string | undefined,
  pattern: RegExp,
  opts: RegexOptions
): ParseResult<string> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const value = opts.trim ? input.trim() : input;
  if (value.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  // Use a fresh RegExp to avoid lastIndex state leaking across calls when /g is set.
  const testable = pattern.global || pattern.sticky
    ? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""))
    : pattern;
  if (!testable.test(value)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_REGEX",
        message: opts.message ?? `Value does not match required pattern ${pattern}.`,
        meta: { pattern: pattern.toString() }
      }
    };
  }
  return { ok: true, value };
}
