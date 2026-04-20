import { describe, it, expect } from "vitest";
import { port } from "../../src/validators/port";

describe("port", () => {
  it("accepts 3000", () => {
    expect(port().parse("3000")).toEqual({ ok: true, value: 3000 });
  });
  it("OUT_OF_RANGE for 0", () => {
    expect(port().parse("0")).toMatchObject({ ok: false, issue: { code: "OUT_OF_RANGE" } });
  });
  it("OUT_OF_RANGE for 65536", () => {
    expect(port().parse("65536")).toMatchObject({ ok: false, issue: { code: "OUT_OF_RANGE" } });
  });
  it("INVALID_TYPE for 3.14", () => {
    expect(port().parse("3.14")).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
  });
});
