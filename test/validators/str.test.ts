import { describe, it, expect } from "vitest";
import { str } from "../../src/validators/str";

describe("str", () => {
  it("accepts a non-empty string", () => {
    expect(str().parse("hello")).toEqual({ ok: true, value: "hello" });
  });
  it("MISSING when undefined", () => {
    expect(str().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY when empty string", () => {
    expect(str().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("trim option strips whitespace", () => {
    expect(str({ trim: true }).parse("  hi  ")).toEqual({ ok: true, value: "hi" });
  });
  it("EMPTY when trim leaves empty", () => {
    expect(str({ trim: true }).parse("   ")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("TOO_SHORT when length below min", () => {
    expect(str({ min: 5 }).parse("hi")).toMatchObject({ ok: false, issue: { code: "TOO_SHORT" } });
  });
  it("TOO_LONG when length above max", () => {
    expect(str({ max: 2 }).parse("hello")).toMatchObject({ ok: false, issue: { code: "TOO_LONG" } });
  });
  it("PATTERN_MISMATCH when pattern fails", () => {
    expect(str({ pattern: /^[A-Z]+$/ }).parse("abc")).toMatchObject({
      ok: false,
      issue: { code: "PATTERN_MISMATCH" }
    });
  });
  it("passes when pattern matches", () => {
    expect(str({ pattern: /^[A-Z]+$/ }).parse("ABC")).toEqual({ ok: true, value: "ABC" });
  });
});
