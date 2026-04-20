import { describe, it, expect } from "vitest";
import { json } from "../../src/validators/json";

describe("json", () => {
  it("parses object", () => {
    expect(json().parse('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
  });
  it("parses array", () => {
    expect(json().parse("[1,2,3]")).toEqual({ ok: true, value: [1, 2, 3] });
  });
  it("MISSING undefined", () => {
    expect(json().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("INVALID_JSON for bad json", () => {
    expect(json().parse("not json")).toMatchObject({ ok: false, issue: { code: "INVALID_JSON" } });
  });
  it("INVALID_TYPE when validator rejects", () => {
    const v = json<number[]>({ validate: (x): x is number[] => Array.isArray(x) });
    expect(v.parse('{"a":1}')).toMatchObject({ ok: false, issue: { code: "INVALID_TYPE" } });
    expect(v.parse("[1,2,3]")).toEqual({ ok: true, value: [1, 2, 3] });
  });
});
