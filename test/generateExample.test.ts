import { describe, it, expect } from "vitest";
import { generateExample, str, num, secret } from "../src";

describe("generateExample", () => {
  it("renders a required string key", () => {
    const out = generateExample({ NAME: str() });
    expect(out).toContain("NAME=<REQUIRED>");
  });

  it("renders secrets with a <REDACTED> marker", () => {
    const out = generateExample({ API_KEY: secret() });
    expect(out).toContain("API_KEY=<REDACTED>");
  });

  it("emits descriptions as comments above each key", () => {
    const out = generateExample({
      PORT: num().describe("HTTP listen port")
    });
    expect(out).toContain("# HTTP listen port");
    expect(out.indexOf("# HTTP listen port")).toBeLessThan(out.indexOf("PORT="));
  });

  it("separates keys by a blank line", () => {
    const out = generateExample({ A: str(), B: num() });
    const lines = out.split("\n");
    const aIdx = lines.findIndex((l) => l.startsWith("A="));
    const bIdx = lines.findIndex((l) => l.startsWith("B="));
    expect(lines[aIdx + 1]).toBe("");
    expect(bIdx).toBeGreaterThan(aIdx + 1);
  });

  it("includes optional header", () => {
    const out = generateExample({ A: str() }, { header: "Example config" });
    expect(out.startsWith("# Example config")).toBe(true);
  });
});
