import { describe, it, expect } from "vitest";
import type { EnvoyError } from "../src";
import { envoy, str } from "../src";

describe("strict mode", () => {
  it("does nothing when strict=false (default)", () => {
    const env = envoy(
      { A: str() },
      { source: { A: "a", EXTRA: "ignored" } }
    );
    expect(env).toMatchObject({ A: "a" });
    expect(Object.keys(env)).toEqual(["A"]);
  });

  it("emits UNKNOWN_KEY for each unknown source key when strict=true", () => {
    try {
      envoy(
        { A: str() },
        { source: { A: "a", B: "b", C: "c" }, strict: true }
      );
      throw new Error("should have thrown");
    } catch (err) {
      const e = err as EnvoyError;
      const codes = e.issues.map((i) => i.code);
      expect(codes).toContain("UNKNOWN_KEY");
      expect(e.issues.filter((i) => i.code === "UNKNOWN_KEY")).toHaveLength(2);
    }
  });

  it("suggests closest schema key when typo is near", () => {
    try {
      envoy(
        { DATABASE_URL: str() },
        { source: { DATABASE_URL: "postgres://x", DATABSE_URL: "typo" }, strict: true }
      );
    } catch (err) {
      const e = err as EnvoyError;
      const unknown = e.issues.find((i) => i.code === "UNKNOWN_KEY")!;
      expect(unknown.message).toContain("DATABASE_URL");
      expect(unknown.meta).toMatchObject({ suggestion: "DATABASE_URL" });
    }
  });

  it("does not suggest when no key is close", () => {
    try {
      envoy(
        { API_KEY: str() },
        { source: { API_KEY: "k", COMPLETELY_UNRELATED: "x" }, strict: true }
      );
    } catch (err) {
      const e = err as EnvoyError;
      const unknown = e.issues.find((i) => i.code === "UNKNOWN_KEY")!;
      expect(unknown.meta).toBeUndefined();
    }
  });
});
