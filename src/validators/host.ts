import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

const IPV4_RE = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const HOSTNAME_LABEL_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export function host(): Validator<string> {
  return makeValidator<string>(parseHost);
}

function parseHost(input: string | undefined): ParseResult<string> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, issue: { code: "EMPTY", message: "Value must not be empty." } };
  }
  if (isValidHost(trimmed)) return { ok: true, value: trimmed };
  return {
    ok: false,
    issue: {
      code: "INVALID_HOST",
      message: `Expected a valid host (IPv4, IPv6, or hostname). Received: ${input}.`,
      meta: { received: input }
    }
  };
}

function isValidHost(value: string): boolean {
  if (IPV4_RE.test(value)) return true;
  if (isIPv6(value)) return true;
  return isHostname(value);
}

function isIPv6(value: string): boolean {
  let candidate = value;
  if (candidate.startsWith("[") && candidate.endsWith("]")) {
    candidate = candidate.slice(1, -1);
  }
  // Strip optional zone id (e.g. "fe80::1%eth0") before validation.
  const pct = candidate.indexOf("%");
  if (pct !== -1) candidate = candidate.slice(0, pct);

  if (!candidate.includes(":")) return false;
  return isCanonicalIPv6(candidate);
}

function isCanonicalIPv6(value: string): boolean {
  // Split on "::" — at most one occurrence allowed.
  const doubleColonCount = (value.match(/::/g) ?? []).length;
  if (doubleColonCount > 1) return false;

  const [head, tail] = value.includes("::") ? value.split("::") : [value, undefined];
  if (head === undefined) return false;

  const headParts = head.length === 0 ? [] : head.split(":");
  const tailParts = tail === undefined ? undefined : tail.length === 0 ? [] : tail.split(":");

  const totalParts = headParts.length + (tailParts?.length ?? 0);
  if (doubleColonCount === 0) {
    if (totalParts !== 8) return false;
  } else {
    // With "::", total non-compressed parts must be <8 to leave room for compression.
    if (totalParts >= 8) return false;
  }

  const h16 = /^[0-9a-fA-F]{1,4}$/;
  for (const part of headParts) {
    if (!h16.test(part)) return false;
  }
  if (tailParts) {
    for (let i = 0; i < tailParts.length; i++) {
      const part = tailParts[i]!;
      // Allow last tail part to be IPv4-mapped form (e.g. ::ffff:192.0.2.1).
      if (i === tailParts.length - 1 && IPV4_RE.test(part)) continue;
      if (!h16.test(part)) return false;
    }
  } else if (headParts.length > 0) {
    const last = headParts[headParts.length - 1]!;
    // No tail; if last is an IPv4 form, re-validate remaining head.
    if (IPV4_RE.test(last)) {
      for (let i = 0; i < headParts.length - 1; i++) {
        if (!h16.test(headParts[i]!)) return false;
      }
    }
  }
  return true;
}

function isHostname(value: string): boolean {
  if (value.length > 253) return false;
  const lower = value.toLowerCase();
  const labels = lower.split(".");
  for (const label of labels) {
    if (!HOSTNAME_LABEL_RE.test(label)) return false;
  }
  // RFC 3696: the last label (TLD) must not be all-numeric. Rejects
  // IPv4-shaped strings with invalid octets (e.g. "256.0.0.0").
  const last = labels[labels.length - 1]!;
  if (/^[0-9]+$/.test(last)) return false;
  return true;
}
