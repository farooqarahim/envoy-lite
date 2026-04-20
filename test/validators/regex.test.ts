import { describe, it, expect } from "vitest";
import { regex } from "../../src/validators/regex";

describe("regex", () => {
  it("accepts matches", () => {
    expect(regex(/^[a-z]+$/).parse("abc")).toEqual({ ok: true, value: "abc" });
  });
  it("rejects non-matches", () => {
    expect(regex(/^[a-z]+$/).parse("ABC")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_REGEX" }
    });
  });
  it("custom message", () => {
    expect(regex(/^[a-z]+$/, { message: "lowercase only" }).parse("ABC")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_REGEX", message: "lowercase only" }
    });
  });
  it("trim option", () => {
    expect(regex(/^[a-z]+$/, { trim: true }).parse("  abc  ")).toEqual({
      ok: true,
      value: "abc"
    });
  });
  it("global flag does not leak state between calls", () => {
    const v = regex(/a+/g);
    expect(v.parse("aa").ok).toBe(true);
    expect(v.parse("aa").ok).toBe(true);
    expect(v.parse("aa").ok).toBe(true);
  });
  it("MISSING undefined", () => {
    expect(regex(/a/).parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY empty", () => {
    expect(regex(/a/).parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
});
