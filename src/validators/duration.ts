import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface DurationOptions {
  min?: number;
  max?: number;
}

const UNITS_MS: Readonly<Record<string, number>> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000
};

const SEGMENT_RE = /(\d+(?:\.\d+)?)(ms|s|m|h|d|w)/g;
const STRICT_RE = /^(\d+(?:\.\d+)?(?:ms|s|m|h|d|w))+$/;

export function duration(opts: DurationOptions = {}): Validator<number> {
  return makeValidator<number>((input) => parseDuration(input, opts));
}

function parseDuration(input: string | undefined, opts: DurationOptions): ParseResult<number> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (!STRICT_RE.test(trimmed)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_DURATION",
        message: `Expected a duration like "5m" or "1h30m". Received: ${input}.`,
        meta: { received: input }
      }
    };
  }
  let total = 0;
  SEGMENT_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SEGMENT_RE.exec(trimmed)) !== null) {
    const magnitude = Number(match[1]);
    const unit = match[2]!;
    const unitMs = UNITS_MS[unit];
    if (unitMs === undefined || !Number.isFinite(magnitude)) {
      return {
        ok: false,
        issue: {
          code: "INVALID_DURATION",
          message: `Expected a valid duration. Received: ${input}.`,
          meta: { received: input }
        }
      };
    }
    total += magnitude * unitMs;
  }
  if (opts.min !== undefined && total < opts.min) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected duration >= ${opts.min} ms. Received: ${total} ms.`,
        meta: { min: opts.min, received: total }
      }
    };
  }
  if (opts.max !== undefined && total > opts.max) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected duration <= ${opts.max} ms. Received: ${total} ms.`,
        meta: { max: opts.max, received: total }
      }
    };
  }
  return { ok: true, value: total };
}
