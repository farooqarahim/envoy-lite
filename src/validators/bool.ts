import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface BoolOptions {
  truthy?: readonly string[];
  falsy?: readonly string[];
}

const DEFAULT_TRUTHY = ["true", "1", "yes", "on"] as const;
const DEFAULT_FALSY = ["false", "0", "no", "off"] as const;

export function bool(opts: BoolOptions = {}): Validator<boolean> {
  const truthy = opts.truthy ?? DEFAULT_TRUTHY;
  const falsy = opts.falsy ?? DEFAULT_FALSY;
  return makeValidator<boolean>((input) => parseBool(input, truthy, falsy));
}

function parseBool(
  input: string | undefined,
  truthy: readonly string[],
  falsy: readonly string[]
): ParseResult<boolean> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const normalized = input.trim().toLowerCase();
  if (normalized.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (truthy.includes(normalized)) return { ok: true, value: true };
  if (falsy.includes(normalized)) return { ok: true, value: false };
  return {
    ok: false,
    issue: {
      code: "INVALID_BOOL",
      message: `Expected a boolean string. Received: ${input}.`,
      meta: {
        truthy: truthy.slice(),
        falsy: falsy.slice(),
        received: input
      }
    }
  };
}
