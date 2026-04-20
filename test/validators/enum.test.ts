import { describe, it, expect } from "vitest";
import { enum_ } from "../../src/validators/enum";

describe("enum_", () => {
  const mode = enum_(["dev", "prod"] as const);
  it("accepts allowed values", () => {
    expect(mode.parse("dev")).toEqual({ ok: true, value: "dev" });
    expect(mode.parse("prod")).toEqual({ ok: true, value: "prod" });
  });
  it("MISSING undefined", () => {
    expect(mode.parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY for empty string", () => {
    expect(mode.parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("INVALID_ENUM for out-of-set value", () => {
    expect(mode.parse("staging")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_ENUM", meta: { allowed: ["dev", "prod"] } }
    });
  });
  it("is case-sensitive", () => {
    expect(mode.parse("DEV")).toMatchObject({ ok: false, issue: { code: "INVALID_ENUM" } });
  });
});
