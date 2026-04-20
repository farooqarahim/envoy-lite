import { describe, it, expect } from "vitest";
import { secret } from "../../src/validators/secret";

describe("secret", () => {
  it("accepts non-empty string", () => {
    expect(secret().parse("shh")).toEqual({ ok: true, value: "shh" });
  });
  it("is marked sensitive", () => {
    expect(secret().sensitive).toBe(true);
  });
  it("preserves sensitive through optional", () => {
    expect(secret().optional().sensitive).toBe(true);
  });
  it("preserves sensitive through default", () => {
    expect(secret().default("x").sensitive).toBe(true);
  });
});
