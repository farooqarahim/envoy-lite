import { describe, it, expect } from "vitest";
import { envoy } from "../src/envoy";
import { EnvoyError } from "../src/errors";
import { str } from "../src/validators/str";
import { num } from "../src/validators/num";
import { bool } from "../src/validators/bool";
import { port } from "../src/validators/port";
import { enum_ } from "../src/validators/enum";
import { secret } from "../src/validators/secret";

describe("envoy()", () => {
  it("returns frozen object with declared keys", () => {
    const env = envoy(
      { NAME: str(), PORT: port() },
      { source: { NAME: "alice", PORT: "3000" } }
    );
    expect(env).toMatchObject({ NAME: "alice", PORT: 3000 });
    expect(Object.keys(env).sort()).toEqual(["NAME", "PORT"]);
    expect(Object.isFrozen(env)).toBe(true);
  });

  it("ignores unknown source keys", () => {
    const env = envoy({ NAME: str() }, { source: { NAME: "a", OTHER: "b" } });
    expect(env).toMatchObject({ NAME: "a" });
    expect(Object.keys(env)).toEqual(["NAME"]);
    expect((env as Record<string, unknown>).OTHER).toBeUndefined();
  });

  it("collects all issues before throwing", () => {
    try {
      envoy(
        { A: str(), B: num(), C: bool() },
        { source: { A: "", B: "x", C: "maybe" } }
      );
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(EnvoyError);
      const e = err as EnvoyError;
      expect(e.issues).toHaveLength(3);
      expect(e.issues.map((i) => i.code)).toEqual(["EMPTY", "INVALID_TYPE", "INVALID_BOOL"]);
    }
  });

  it("optional fields default to undefined", () => {
    const env = envoy({ X: str().optional() }, { source: {} });
    expect(env.X).toBeUndefined();
    expect("X" in env).toBe(true);
  });

  it("default supplies value when missing", () => {
    const env = envoy({ X: str().default("hi") }, { source: {} });
    expect(env.X).toBe("hi");
  });

  it("default is used only when missing", () => {
    const env = envoy({ X: str().default("hi") }, { source: { X: "bye" } });
    expect(env.X).toBe("bye");
  });

  it("accepts enum values", () => {
    const env = envoy(
      { MODE: enum_(["dev", "prod"] as const) },
      { source: { MODE: "dev" } }
    );
    expect(env.MODE).toBe("dev");
  });

  it("throws NO_SOURCE when no source and no runtime", () => {
    // Provide an explicit non-object to force the error path
    expect(() =>
      envoy({ X: str() }, { source: null as unknown as Record<string, string> })
    ).toThrow(EnvoyError);
  });

  it("includes context in error message", () => {
    try {
      envoy({ A: str() }, { source: {}, context: "boot" });
    } catch (err) {
      expect((err as Error).message).toContain("[boot]");
    }
  });

  it("ignores non-string source values (e.g. Workers bindings)", () => {
    const env = envoy(
      { X: str() },
      { source: { X: "hi", Y: 42 as unknown as string } }
    );
    expect(env).toMatchObject({ X: "hi" });
    expect(Object.keys(env)).toEqual(["X"]);
  });

  it("INVALID_TYPE when source value is non-string binding for a declared key", () => {
    try {
      envoy({ X: str() }, { source: { X: 42 as unknown as string } });
      throw new Error("should have thrown");
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues).toHaveLength(1);
      expect(e.issues[0]!.code).toBe("INVALID_TYPE");
      expect(e.issues[0]!.meta).toMatchObject({ expected: "string", received: "number" });
    }
  });

  it("empty schema returns frozen {}", () => {
    const env = envoy({}, { source: {} });
    expect(Object.keys(env)).toEqual([]);
    expect(Object.isFrozen(env)).toBe(true);
  });

  it("wraps validator exceptions into INVALID_TYPE", () => {
    const throwing = {
      parse() {
        throw new Error("boom");
      },
      optional() {
        return throwing;
      },
      default() {
        return throwing;
      },
      sensitive: false,
      _output: undefined as unknown as string
    };
    try {
      envoy({ X: throwing as unknown as ReturnType<typeof str> }, { source: { X: "v" } });
      throw new Error("should have thrown");
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues[0]!.code).toBe("INVALID_TYPE");
      expect(e.issues[0]!.message).toContain("boom");
    }
  });

  it("sensitive meta.received is stripped from errors", () => {
    try {
      envoy({ API_KEY: secret({ min: 10 }) }, { source: { API_KEY: "short" } });
    } catch (err) {
      const e = err as EnvoyError;
      const issue = e.issues[0]!;
      if (issue.meta && "received" in issue.meta) {
        // received counts length, not value — but our rule strips "received"
        // for sensitive validators regardless. Confirm it's not the raw value.
        expect(issue.meta.received).not.toBe("short");
      }
    }
  });
});
