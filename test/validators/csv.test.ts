import { describe, it, expect } from "vitest";
import { csv } from "../../src/validators/csv";
import { num } from "../../src/validators/num";
import { str } from "../../src/validators/str";

describe("csv", () => {
  it("parses csv of strings", () => {
    expect(csv(str()).parse("a,b,c")).toEqual({ ok: true, value: ["a", "b", "c"] });
  });
  it("parses csv of numbers", () => {
    expect(csv(num()).parse("1,2,3")).toEqual({ ok: true, value: [1, 2, 3] });
  });
  it("MISSING undefined", () => {
    expect(csv(str()).parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("INVALID_ITEM when one item fails", () => {
    expect(csv(num()).parse("1,2,three")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_ITEM", meta: { index: 2 } }
    });
  });
  it("EMPTY_ITEM for empty items by default", () => {
    expect(csv(str()).parse(",,,")).toMatchObject({
      ok: false,
      issue: { code: "EMPTY_ITEM", meta: { index: 0 } }
    });
  });
  it("allowEmpty: 'skip' drops empty entries", () => {
    const result = csv(str(), { allowEmpty: "skip" }).parse("a,,b");
    expect(result).toEqual({ ok: true, value: ["a", "b"] });
  });
  it("allowEmpty: 'skip' with all-empty returns empty array", () => {
    const result = csv(str(), { allowEmpty: "skip" }).parse(",,,");
    expect(result).toEqual({ ok: true, value: [] });
  });
  it("allowEmpty: 'keep' passes empty string to item validator", () => {
    // str() rejects empty strings, so 'keep' surfaces that as EMPTY at index 1.
    const result = csv(str(), { allowEmpty: "keep" }).parse("a,,b");
    expect(result).toMatchObject({
      ok: false,
      issue: { code: "INVALID_ITEM", meta: { index: 1 } }
    });
  });
  it("supports custom separator", () => {
    expect(csv(str(), { separator: "|" }).parse("a|b|c")).toEqual({
      ok: true,
      value: ["a", "b", "c"]
    });
  });
});
