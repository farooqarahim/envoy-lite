import { describe, it, expect } from "vitest";
import { envoy, str } from "../../src";

describe("Node runtime", () => {
  it("reads process.env by default", () => {
    process.env.ENVOY_TEST_KEY = "hello";
    const env = envoy({ ENVOY_TEST_KEY: str() });
    expect(env.ENVOY_TEST_KEY).toBe("hello");
    delete process.env.ENVOY_TEST_KEY;
  });
});
