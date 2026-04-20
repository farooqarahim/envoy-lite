import { getSensitive } from "./envoy";

const REDACTED = "[REDACTED]";

export function mask<T extends Record<string, unknown>>(env: T): T {
  const sensitive = getSensitive(env);
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(env)) {
    const value = env[key];
    if (sensitive && sensitive.has(key)) {
      copy[key] = deepRedact(value);
    } else {
      copy[key] = value;
    }
  }
  return copy as T;
}

function deepRedact(value: unknown): unknown {
  if (value === null || value === undefined) return REDACTED;
  if (typeof value !== "object") return REDACTED;
  if (Array.isArray(value)) return value.map(() => REDACTED);
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    out[key] = REDACTED;
  }
  return out;
}
