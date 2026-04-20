import { describe, it, expect } from "vitest";
import { bool } from "../../src/validators/bool";

describe("bool", () => {
  it("parses true variants", () => {
    for (const v of ["true", "True", "TRUE", "1", "yes", "YES", "on"]) {
      expect(bool().parse(v)).toEqual({ ok: true, value: true });
    }
  });
  it("parses false variants", () => {
    for (const v of ["false", "False", "0", "no", "off"]) {
      expect(bool().parse(v)).toEqual({ ok: true, value: false });
    }
  });
  it("MISSING undefined", () => {
    expect(bool().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY for empty string", () => {
    expect(bool().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("INVALID_BOOL for unknown", () => {
    expect(bool().parse("maybe")).toMatchObject({ ok: false, issue: { code: "INVALID_BOOL" } });
  });
  it("custom truthy/falsy", () => {
    const b = bool({ truthy: ["y"], falsy: ["n"] });
    expect(b.parse("y")).toEqual({ ok: true, value: true });
    expect(b.parse("n")).toEqual({ ok: true, value: false });
    expect(b.parse("true")).toMatchObject({ ok: false, issue: { code: "INVALID_BOOL" } });
  });
});
