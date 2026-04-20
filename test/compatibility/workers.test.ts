import { describe, it, expect } from "vitest";
import { envoy, str } from "../../src";

describe("Workers binding compatibility", () => {
  it("handles non-string bindings on env", () => {
    const workerEnv = {
      API_KEY: "abc",
      KV_NAMESPACE: { get: () => null } as unknown as string
    };
    const env = envoy({ API_KEY: str() }, { source: workerEnv });
    expect(env.API_KEY).toBe("abc");
  });
});
