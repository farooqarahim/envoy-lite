import { describe, it, expect } from "vitest";
import type { EnvoyError } from "../src";
import { envoy, mask, secret, str, url } from "../src";

describe("secret redaction in errors", () => {
  it("does not leak the raw secret value in error messages", () => {
    try {
      envoy(
        { DB_URL: secret({ min: 1000 }) },
        { source: { DB_URL: "postgres://user:pw@my.db.example.com/prod" } }
      );
    } catch (err) {
      const e = err as EnvoyError;
      const msg = e.issues[0]!.message;
      expect(msg).not.toContain("my.db.example.com");
      expect(msg).not.toContain("user:pw");
    }
  });

  it("redacts Received: payload for sensitive pattern mismatches", () => {
    try {
      envoy(
        { TOKEN: secret({ pattern: /^tok_[A-Z0-9]+$/ }) },
        { source: { TOKEN: "leaked.value.here" } }
      );
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues[0]!.message).not.toContain("leaked.value.here");
    }
  });

  it("drops meta entirely for sensitive issues", () => {
    try {
      envoy(
        { PW: secret({ min: 50 }) },
        { source: { PW: "short-password" } }
      );
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues[0]!.meta).toBeUndefined();
    }
  });

  it("does not redact non-sensitive validators", () => {
    try {
      envoy({ HOST: url() }, { source: { HOST: "not-a-url" } });
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues[0]!.message).toContain("not-a-url");
    }
  });
});

describe("mask() robustness", () => {
  it("masks sensitive values on the original object", () => {
    const env = envoy(
      { NAME: str(), API_KEY: secret() },
      { source: { NAME: "alice", API_KEY: "super-secret-value" } }
    );
    const masked = mask(env);
    expect(masked.NAME).toBe("alice");
    expect(masked.API_KEY).toBe("[REDACTED]");
  });

  it("survives spread because sensitivity is attached as a Symbol", () => {
    const env = envoy(
      { NAME: str(), API_KEY: secret() },
      { source: { NAME: "alice", API_KEY: "super-secret-value" } }
    );
    const spread = { ...env };
    const masked = mask(spread);
    expect(masked.NAME).toBe("alice");
    expect(masked.API_KEY).toBe("[REDACTED]");
  });
});
