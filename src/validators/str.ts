import type { EnvoyIssue, ParseResult, Validator } from "../types";
import { makeValidator, type MakeValidatorOptions } from "./base";

export interface StrOptions {
  min?: number;
  max?: number;
  pattern?: RegExp;
  trim?: boolean;
}

export function str(opts: StrOptions = {}): Validator<string> {
  return buildStr(opts);
}

export function buildStr(
  opts: StrOptions,
  base: MakeValidatorOptions = {}
): Validator<string> {
  const sensitive = base.sensitive ?? false;
  return makeValidator<string>((input) => parseStr(input, opts, sensitive), base);
}

function parseStr(
  input: string | undefined,
  opts: StrOptions,
  sensitive: boolean
): ParseResult<string> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const value = opts.trim ? input.trim() : input;
  if (value.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (opts.min !== undefined && value.length < opts.min) {
    return {
      ok: false,
      issue: {
        code: "TOO_SHORT",
        message: `Expected length >= ${opts.min}. Received length ${value.length}.`,
        meta: { min: opts.min, received: value.length }
      }
    };
  }
  if (opts.max !== undefined && value.length > opts.max) {
    return {
      ok: false,
      issue: {
        code: "TOO_LONG",
        message: `Expected length <= ${opts.max}. Received length ${value.length}.`,
        meta: { max: opts.max, received: value.length }
      }
    };
  }
  if (opts.pattern !== undefined && !opts.pattern.test(value)) {
    const issue: Omit<EnvoyIssue, "name"> = {
      code: "PATTERN_MISMATCH",
      message: sensitive
        ? `Value does not match required pattern.`
        : `Value does not match required pattern ${opts.pattern}.`
    };
    if (!sensitive) issue.meta = { pattern: opts.pattern.toString() };
    return { ok: false, issue };
  }
  return { ok: true, value };
}
