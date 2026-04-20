import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface NumOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

const NUM_RE = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?$/;
const INT_RE = /^-?(0|[1-9][0-9]*)$/;

export function num(opts: NumOptions = {}): Validator<number> {
  return makeValidator<number>((input) => parseNum(input, opts));
}

function parseNum(input: string | undefined, opts: NumOptions): ParseResult<number> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  if (input.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  const re = opts.integer ? INT_RE : NUM_RE;
  if (!re.test(input)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_TYPE",
        message: `Expected ${opts.integer ? "integer" : "number"}. Received: ${input}.`,
        meta: { expected: opts.integer ? "integer" : "number", received: input }
      }
    };
  }
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_TYPE",
        message: `Expected finite ${opts.integer ? "integer" : "number"}. Received: ${input}.`,
        meta: { expected: opts.integer ? "integer" : "number", received: input }
      }
    };
  }
  if (opts.integer && !Number.isInteger(parsed)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_TYPE",
        message: `Expected integer. Received: ${input}.`,
        meta: { expected: "integer", received: input }
      }
    };
  }
  if (opts.min !== undefined && parsed < opts.min) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected number >= ${opts.min}. Received: ${parsed}.`,
        meta: { min: opts.min, received: parsed }
      }
    };
  }
  if (opts.max !== undefined && parsed > opts.max) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected number <= ${opts.max}. Received: ${parsed}.`,
        meta: { max: opts.max, received: parsed }
      }
    };
  }
  return { ok: true, value: parsed };
}
