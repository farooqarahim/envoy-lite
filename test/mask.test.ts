import { describe, it, expect } from "vitest";
import { envoy } from "../src/envoy";
import { mask } from "../src/mask";
import { str } from "../src/validators/str";
import { secret } from "../src/validators/secret";

describe("mask", () => {
  it("redacts sensitive fields", () => {
    const env = envoy(
      { NAME: str(), API_KEY: secret() },
      { source: { NAME: "alice", API_KEY: "supersecret" } }
    );
    const masked = mask(env);
    expect(masked.NAME).toBe("alice");
    expect(masked.API_KEY).toBe("[REDACTED]");
  });
  it("returns shallow copy unchanged for non-envoy objects", () => {
    const other = { X: "y" };
    const masked = mask(other);
    expect(masked).toEqual({ X: "y" });
    expect(masked).not.toBe(other);
  });
});
