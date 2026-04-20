import { describe, it, expect } from "vitest";
import { envoy, str } from "../../src";

describe("Bun runtime", () => {
  it("reads process.env", () => {
    const env = envoy({ PATH: str() });
    expect(typeof env.PATH).toBe("string");
  });
});
