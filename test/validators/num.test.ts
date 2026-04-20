import { describe, it, expect } from "vitest";
import { num } from "../../src/validators/num";

describe("num", () => {
  it("parses integers", () => {
    expect(num().parse("42")).toEqual({ ok: true, value: 42 });
  });
  it("parses floats", () => {
    expect(num().parse("3.14")).toEqual({ ok: true, value: 3.14 });
  });
  it("parses negative", () => {
    expect(num().parse("-42")).toEqual({ ok: true, value: -42 });
  });
  it("accepts JSON-style exponent", () => {
    expect(num().parse("1e3")).toEqual({ ok: true, value: 1000 });
    expect(num().parse("1.5e-2")).toEqual({ ok: true, value: 0.015 });
  });
  it("MISSING undefined", () => {
    expect(num().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY empty string", () => {
    expect(num().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("rejects leading whitespace", () => {
    expect(num().parse("  42  ")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_TYPE" }
    });
  });
  it("rejects leading +", () => {
    expect(num().parse("+5")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_TYPE" }
    });
  });
  it("rejects bare decimal like .5", () => {
    expect(num().parse(".5")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_TYPE" }
    });
  });
  it("rejects trailing dot like 5.", () => {
    expect(num().parse("5.")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_TYPE" }
    });
  });
  it("rejects leading zeros", () => {
    expect(num().parse("007")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_TYPE" }
    });
  });
  it("INVALID_TYPE for NaN", () => {
    expect(num().parse("NaN")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
  it("INVALID_TYPE for Infinity", () => {
    expect(num().parse("Infinity")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
  it("INVALID_TYPE for hex 0x10", () => {
    expect(num().parse("0x10")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
  it("INVALID_TYPE for octal 0o10", () => {
    expect(num().parse("0o10")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
  it("INVALID_TYPE for binary 0b10", () => {
    expect(num().parse("0b10")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
  it("INVALID_TYPE for numeric separators", () => {
    expect(num().parse("1_000")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
  it("INVALID_TYPE for trailing chars", () => {
    expect(num().parse("5abc")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
  it("integer rejects decimal", () => {
    expect(num({ integer: true }).parse("3.14")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_TYPE" }
    });
  });
  it("integer rejects exponent form", () => {
    expect(num({ integer: true }).parse("1e3")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_TYPE" }
    });
  });
  it("OUT_OF_RANGE below min", () => {
    expect(num({ min: 10 }).parse("5")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
  });
  it("OUT_OF_RANGE above max", () => {
    expect(num({ max: 10 }).parse("11")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
  });
});
