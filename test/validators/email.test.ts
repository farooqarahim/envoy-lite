import { describe, it, expect } from "vitest";
import { email } from "../../src/validators/email";

describe("email", () => {
  it("accepts a typical email", () => {
    expect(email().parse("alice@example.com")).toEqual({ ok: true, value: "alice@example.com" });
  });
  it("MISSING undefined", () => {
    expect(email().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY empty string", () => {
    expect(email().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("INVALID_EMAIL when missing @", () => {
    expect(email().parse("aliceexample.com")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_EMAIL" }
    });
  });
  it("INVALID_EMAIL when missing dot in domain", () => {
    expect(email().parse("alice@example")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_EMAIL" }
    });
  });
});
