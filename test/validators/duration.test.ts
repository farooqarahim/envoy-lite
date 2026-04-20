import { describe, it, expect } from "vitest";
import { duration } from "../../src/validators/duration";

describe("duration", () => {
  it("parses 5m as 300000 ms", () => {
    expect(duration().parse("5m")).toEqual({ ok: true, value: 300_000 });
  });
  it("parses 1h30m as sum", () => {
    expect(duration().parse("1h30m")).toEqual({ ok: true, value: 3_600_000 + 1_800_000 });
  });
  it("parses 500ms", () => {
    expect(duration().parse("500ms")).toEqual({ ok: true, value: 500 });
  });
  it("parses 1d", () => {
    expect(duration().parse("1d")).toEqual({ ok: true, value: 86_400_000 });
  });
  it("parses 2w", () => {
    expect(duration().parse("2w")).toEqual({ ok: true, value: 2 * 604_800_000 });
  });
  it("parses decimal magnitude", () => {
    expect(duration().parse("1.5s")).toEqual({ ok: true, value: 1500 });
  });
  it("rejects bare number", () => {
    expect(duration().parse("5000")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_DURATION" }
    });
  });
  it("rejects unknown unit", () => {
    expect(duration().parse("5y")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_DURATION" }
    });
  });
  it("rejects empty string", () => {
    expect(duration().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("MISSING undefined", () => {
    expect(duration().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("min/max enforced", () => {
    expect(duration({ min: 1000 }).parse("500ms")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
    expect(duration({ max: 1000 }).parse("2s")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
  });
});
