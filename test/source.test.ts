import { describe, it, expect } from "vitest";
import { resolveSource } from "../src/source";

describe("resolveSource", () => {
  it("resolves process.env in Node", () => {
    const src = resolveSource();
    expect(src).not.toBeNull();
  });
});
