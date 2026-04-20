import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface DateOptions {
  min?: Date;
  max?: Date;
}

const ISO_RE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})?)?$/;

export function date(opts: DateOptions = {}): Validator<Date> {
  return makeValidator<Date>((input) => parseDate(input, opts));
}

function parseDate(input: string | undefined, opts: DateOptions): ParseResult<Date> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (!ISO_RE.test(trimmed)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_DATE",
        message: `Expected an ISO-8601 date. Received: ${input}.`,
        meta: { received: input }
      }
    };
  }
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_DATE",
        message: `Expected an ISO-8601 date. Received: ${input}.`,
        meta: { received: input }
      }
    };
  }
  const value = new Date(ms);
  if (opts.min && value < opts.min) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected date >= ${opts.min.toISOString()}. Received: ${value.toISOString()}.`,
        meta: { min: opts.min.toISOString(), received: value.toISOString() }
      }
    };
  }
  if (opts.max && value > opts.max) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected date <= ${opts.max.toISOString()}. Received: ${value.toISOString()}.`,
        meta: { max: opts.max.toISOString(), received: value.toISOString() }
      }
    };
  }
  return { ok: true, value };
}
