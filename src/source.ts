import type { Source } from "./types";

export function resolveSource(): Source | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;

  // Node, Bun, and any runtime exposing process.env all satisfy this.
  if (g.process?.env && typeof g.process.env === "object") {
    return g.process.env as Source;
  }

  if (g.Deno?.env?.toObject) {
    try {
      return g.Deno.env.toObject() as Source;
    } catch {
      // Deno with --allow-env not granted throws; fall through to null.
      return null;
    }
  }

  return null;
}
