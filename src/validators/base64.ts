import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export interface Base64Options {
  urlSafe?: boolean;
  requirePadding?: boolean;
  minBytes?: number;
  maxBytes?: number;
}

const STD_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const URL_RE = /^[A-Za-z0-9_-]+={0,2}$/;

export function base64(opts: Base64Options = {}): Validator<string> {
  return makeValidator<string>((input) => parseBase64(input, opts));
}

function parseBase64(input: string | undefined, opts: Base64Options): ParseResult<string> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  if (input.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  const urlSafe = opts.urlSafe ?? false;
  const requirePadding = opts.requirePadding ?? false;
  const re = urlSafe ? URL_RE : STD_RE;

  if (!re.test(input)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_BASE64",
        message: `Expected ${urlSafe ? "url-safe " : ""}base64. Received invalid characters.`,
        meta: { urlSafe }
      }
    };
  }

  const totalLenWithPadding = requirePadding ? input.length : padLength(input);
  if (totalLenWithPadding % 4 !== 0) {
    return {
      ok: false,
      issue: {
        code: "INVALID_BASE64",
        message: `Expected base64 length to be a multiple of 4${
          requirePadding ? " with padding" : ""
        }.`,
        meta: { length: input.length }
      }
    };
  }

  const byteLen = decodedByteLength(input);
  if (opts.minBytes !== undefined && byteLen < opts.minBytes) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected decoded length >= ${opts.minBytes} bytes. Received: ${byteLen}.`,
        meta: { min: opts.minBytes, received: byteLen }
      }
    };
  }
  if (opts.maxBytes !== undefined && byteLen > opts.maxBytes) {
    return {
      ok: false,
      issue: {
        code: "OUT_OF_RANGE",
        message: `Expected decoded length <= ${opts.maxBytes} bytes. Received: ${byteLen}.`,
        meta: { max: opts.maxBytes, received: byteLen }
      }
    };
  }
  return { ok: true, value: input };
}

function padLength(input: string): number {
  const rem = input.length % 4;
  return rem === 0 ? input.length : input.length + (4 - rem);
}

function decodedByteLength(input: string): number {
  const stripped = input.replace(/=+$/, "");
  const pad = input.length - stripped.length;
  return Math.floor((stripped.length * 3) / 4) - (pad > 0 ? 0 : 0);
}
