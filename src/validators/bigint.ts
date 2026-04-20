import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface BigIntOptions {
  min?: bigint;
  max?: bigint;
}

const BIGINT_RE = /^-?(0|[1-9][0-9]*)$/;

export function bigint(opts: BigIntOptions = {}): Validator<bigint> {
  return makeValidator<bigint>((input) => parseBigInt(input, opts));
}

function parseBigInt(input: string | undefined, opts: BigIntOptions): ParseResult<bigint> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  if (input.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (!BIGINT_RE.test(input)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_BIGINT",
        message: `Expected a bigint literal. Received: ${input}.`,
        meta: { received: input }
      }
    };
  }
  let value: bigint;
  try {
    value = BigInt(input);
  } catch {
    return {
      ok: false,
      issue: {
        code: "INVALID_BIGINT",
        message: `Expected a bigint literal. Received: ${input}.`,
        meta: { received: input }
      }
    };
  }
  if (opts.min !== undefined && value < opts.min) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected bigint >= ${opts.min}. Received: ${value}.`,
        meta: { min: opts.min.toString(), received: value.toString() }
      }
    };
  }
  if (opts.max !== undefined && value > opts.max) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected bigint <= ${opts.max}. Received: ${value}.`,
        meta: { max: opts.max.toString(), received: value.toString() }
      }
    };
  }
  return { ok: true, value };
}
