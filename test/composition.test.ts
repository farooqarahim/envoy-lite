import { describe, it, expect } from "vitest";
import {
  envoy,
  safeEnvoy,
  pickSchema,
  extendSchema,
  partialSchema,
  str,
  num,
  EnvoyError
} from "../src";

describe("safeEnvoy", () => {
  it("returns ok with data when valid", () => {
    const result = safeEnvoy({ X: str() }, { source: { X: "hi" } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({ X: "hi" });
      expect(Object.keys(result.data)).toEqual(["X"]);
    }
  });

  it("returns error instead of throwing when invalid", () => {
    const result = safeEnvoy({ X: str() }, { source: {} });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(EnvoyError);
      expect(result.error.issues[0]!.code).toBe("MISSING");
    }
  });
});

describe("pickSchema", () => {
  it("picks the requested keys", () => {
    const schema = { A: str(), B: num(), C: str() };
    const picked = pickSchema(schema, ["A", "C"] as const);
    const env = envoy(picked, { source: { A: "a", C: "c" } });
    expect(env).toMatchObject({ A: "a", C: "c" });
    expect(Object.keys(env).sort()).toEqual(["A", "C"]);
  });

  it("ignores keys not in schema", () => {
    const schema = { A: str() };
    // Passing a non-existent key should just skip it.
    const picked = pickSchema(schema, ["A", "ZZ" as keyof typeof schema]);
    expect(Object.keys(picked)).toEqual(["A"]);
  });
});

describe("extendSchema", () => {
  it("merges two schemas", () => {
    const base = { A: str() };
    const extra = { B: num() };
    const merged = extendSchema(base, extra);
    const env = envoy(merged, { source: { A: "a", B: "3" } });
    expect(env).toMatchObject({ A: "a", B: 3 });
    expect(Object.keys(env).sort()).toEqual(["A", "B"]);
  });

  it("later schema overrides earlier", () => {
    const base = { A: str() };
    const override = { A: num() };
    const merged = extendSchema(base, override);
    const env = envoy(merged, { source: { A: "42" } });
    expect(env.A).toBe(42);
  });
});

describe("partialSchema", () => {
  it("makes every field optional", () => {
    const schema = { A: str(), B: num() };
    const partial = partialSchema(schema);
    const env = envoy(partial, { source: {} });
    expect(env.A).toBeUndefined();
    expect(env.B).toBeUndefined();
    expect(Object.keys(env).sort()).toEqual(["A", "B"]);
  });
});
