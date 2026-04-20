import { describe, it, expect } from "vitest";
import { EnvoyError } from "../src/errors";

describe("EnvoyError", () => {
  it("stores frozen issues", () => {
    const err = new EnvoyError([{ name: "A", code: "MISSING", message: "nope" }]);
    expect(err.issues).toHaveLength(1);
    expect(Object.isFrozen(err.issues)).toBe(true);
  });
  it("message contains count", () => {
    const err = new EnvoyError([
      { name: "A", code: "MISSING", message: "nope" },
      { name: "B", code: "EMPTY", message: "nope" }
    ]);
    expect(err.message).toContain("2 environment variable");
  });
  it("message contains context when given", () => {
    const err = new EnvoyError([{ name: "A", code: "MISSING", message: "nope" }], "boot");
    expect(err.message).toContain("[boot]");
  });
  it("name is EnvoyError", () => {
    const err = new EnvoyError([]);
    expect(err.name).toBe("EnvoyError");
  });
});
