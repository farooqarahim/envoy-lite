import { describe, it, expect } from "vitest";
import { envoy, str } from "../../src";

describe("Deno runtime", () => {
  it("reads env via resolver", () => {
    // Under vitest this uses process.env; under `deno test` it uses Deno.env.
    const env = envoy({ PATH: str().optional() });
    expect(typeof env.PATH === "string" || env.PATH === undefined).toBe(true);
  });
});
