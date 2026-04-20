import { describe, it, expect } from "vitest";
import { base64 } from "../../src/validators/base64";

describe("base64", () => {
  it("accepts plain standard base64", () => {
    // "abc" -> "YWJj" (no padding needed)
    expect(base64().parse("YWJj")).toEqual({ ok: true, value: "YWJj" });
  });
  it("accepts padded standard base64", () => {
    // "ab" -> "YWI="
    expect(base64().parse("YWI=")).toEqual({ ok: true, value: "YWI=" });
  });
  it("accepts base64 with +/", () => {
    expect(base64().parse("YWJjZD+/").ok).toBe(true);
  });
  it("rejects url-safe by default when +/ used", () => {
    // Char `-` not valid in standard alphabet
    expect(base64().parse("YWJj-Q==")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_BASE64" }
    });
  });
  it("url-safe accepts - and _", () => {
    expect(base64({ urlSafe: true }).parse("YWJj-Q==").ok).toBe(true);
  });
  it("rejects bad length (not multiple of 4 without padding)", () => {
    expect(base64({ requirePadding: true }).parse("YWI")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_BASE64" }
    });
  });
  it("MISSING undefined", () => {
    expect(base64().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY empty", () => {
    expect(base64().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("minBytes enforced", () => {
    expect(base64({ minBytes: 100 }).parse("YWJj")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
  });
});
