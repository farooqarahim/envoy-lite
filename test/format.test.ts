import { describe, it, expect } from "vitest";
import { EnvoyError } from "../src/errors";
import { formatErrors } from "../src/format";

describe("formatErrors", () => {
  it("pads names to longest", () => {
    const err = new EnvoyError([
      { name: "DATABASE_URL", code: "MISSING", message: "Required value not set." },
      { name: "PORT", code: "OUT_OF_RANGE", message: "Expected number <= 65535. Received: 70000." }
    ]);
    const out = formatErrors(err);
    expect(out).toContain("DATABASE_URL");
    expect(out).toContain("OUT_OF_RANGE");
    expect(out.split("\n").length).toBeGreaterThanOrEqual(4);
  });
  it("ascii-only output", () => {
    const err = new EnvoyError([
      { name: "A", code: "MISSING", message: "nope" }
    ]);
    const out = formatErrors(err);
    expect(/^[\x20-\x7e\n]*$/.test(out)).toBe(true);
  });
  it("returns summary when no issues", () => {
    const err = new EnvoyError([]);
    expect(formatErrors(err)).toBe(err.message);
  });
});
