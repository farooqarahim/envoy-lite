import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface UrlOptions {
  protocols?: readonly string[];
}

const DEFAULT_PROTOCOLS = ["http", "https"] as const;

export function url(opts: UrlOptions = {}): Validator<string> {
  const protocols = opts.protocols ?? DEFAULT_PROTOCOLS;
  return makeValidator<string>((input) => parseUrl(input, protocols));
}

function parseUrl(input: string | undefined, protocols: readonly string[]): ParseResult<string> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  if (input.trim().length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return {
      ok: false,
      issue: {
        code: "INVALID_URL",
        message: `Expected a valid URL. Received: ${input}.`,
        meta: { received: input }
      }
    };
  }
  const scheme = parsed.protocol.endsWith(":") ? parsed.protocol.slice(0, -1) : parsed.protocol;
  if (!protocols.includes(scheme)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_PROTOCOL",
        message: `Expected protocol one of: ${protocols.join(", ")}. Received: ${scheme}.`,
        meta: { allowed: protocols.slice(), received: scheme }
      }
    };
  }
  return { ok: true, value: input };
}
