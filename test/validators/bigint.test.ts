import { describe, it, expect } from "vitest";
import { bigint } from "../../src/validators/bigint";

describe("bigint", () => {
  it("parses positive integer", () => {
    expect(bigint().parse("42")).toEqual({ ok: true, value: 42n });
  });
  it("parses negative integer", () => {
    expect(bigint().parse("-42")).toEqual({ ok: true, value: -42n });
  });
  it("parses zero", () => {
    expect(bigint().parse("0")).toEqual({ ok: true, value: 0n });
  });
  it("parses very large integers", () => {
    const big = "99999999999999999999999999";
    expect(bigint().parse(big)).toEqual({ ok: true, value: BigInt(big) });
  });
  it("MISSING on undefined", () => {
    expect(bigint().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY on empty", () => {
    expect(bigint().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("INVALID_BIGINT for decimals", () => {
    expect(bigint().parse("1.5")).toMatchObject({ ok: false, issue: { code: "INVALID_BIGINT" } });
  });
  it("INVALID_BIGINT for leading zeros", () => {
    expect(bigint().parse("007")).toMatchObject({ ok: false, issue: { code: "INVALID_BIGINT" } });
  });
  it("INVALID_BIGINT for hex", () => {
    expect(bigint().parse("0x10")).toMatchObject({ ok: false, issue: { code: "INVALID_BIGINT" } });
  });
  it("OUT_OF_RANGE below min", () => {
    expect(bigint({ min: 10n }).parse("5")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
  });
  it("OUT_OF_RANGE above max", () => {
    expect(bigint({ max: 10n }).parse("11")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
  });
});
