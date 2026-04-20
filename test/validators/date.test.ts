import { describe, it, expect } from "vitest";
import { date } from "../../src/validators/date";

describe("date", () => {
  it("parses date-only ISO", () => {
    const r = date().parse("2024-01-15");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toISOString().startsWith("2024-01-15")).toBe(true);
  });
  it("parses full ISO with Z", () => {
    const r = date().parse("2024-01-15T12:34:56Z");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toISOString()).toBe("2024-01-15T12:34:56.000Z");
  });
  it("parses ISO with offset", () => {
    const r = date().parse("2024-01-15T12:34:56+05:30");
    expect(r.ok).toBe(true);
  });
  it("rejects bad format", () => {
    expect(date().parse("January 15, 2024")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_DATE" }
    });
  });
  it("rejects invalid date", () => {
    expect(date().parse("2024-13-45")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_DATE" }
    });
  });
  it("MISSING undefined", () => {
    expect(date().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY", () => {
    expect(date().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("OUT_OF_RANGE before min", () => {
    const min = new Date("2024-01-01");
    expect(date({ min }).parse("2023-12-31")).toMatchObject({
      ok: false,
      issue: { code: "OUT_OF_RANGE" }
    });
  });
});
