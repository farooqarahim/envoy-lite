import { describe, it, expect } from "vitest";
import type { EnvoyError } from "../src";
import { envoy, str, num } from "../src";

describe("transform", () => {
  it("maps parsed value", () => {
    const env = envoy(
      { X: str().transform((v) => v.toUpperCase()) },
      { source: { X: "hi" } }
    );
    expect(env.X).toBe("HI");
  });

  it("transform after num changes type", () => {
    const env = envoy(
      { X: num().transform((v) => v * 2) },
      { source: { X: "3" } }
    );
    expect(env.X).toBe(6);
  });

  it("surfaces thrown errors as INVALID_TYPE", () => {
    try {
      envoy(
        {
          X: str().transform((): string => {
            throw new Error("boom");
          })
        },
        { source: { X: "hi" } }
      );
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues[0]!.code).toBe("INVALID_TYPE");
      expect(e.issues[0]!.message).toContain("boom");
    }
  });
});

describe("refine", () => {
  it("accepts values that pass the predicate", () => {
    const env = envoy(
      { X: str().refine((v) => v.startsWith("hi"), "must start with hi") },
      { source: { X: "hiya" } }
    );
    expect(env.X).toBe("hiya");
  });

  it("REFINE_FAILED when predicate is false", () => {
    try {
      envoy(
        { X: str().refine((v) => v.startsWith("hi"), "must start with hi") },
        { source: { X: "bye" } }
      );
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues[0]!.code).toBe("REFINE_FAILED");
      expect(e.issues[0]!.message).toBe("must start with hi");
    }
  });

  it("REFINE_FAILED surfaces thrown errors", () => {
    try {
      envoy(
        {
          X: str().refine((): boolean => {
            throw new Error("boom");
          })
        },
        { source: { X: "x" } }
      );
    } catch (err) {
      const e = err as EnvoyError;
      expect(e.issues[0]!.code).toBe("REFINE_FAILED");
    }
  });
});

describe("describe", () => {
  it("attaches description", () => {
    const v = str().describe("the X value");
    expect(v.description).toBe("the X value");
  });

  it("describe survives optional and default", () => {
    const v = str().describe("X").optional();
    expect(v.description).toBe("X");

    const v2 = str().describe("Y").default("z");
    expect(v2.description).toBe("Y");
  });
});

describe("default after optional", () => {
  it("throws TypeError at runtime", () => {
    expect(() => {
      // Force past the compile-time `never` check.
      const v = str().optional() as unknown as { default: (value: string) => unknown };
      v.default("x");
    }).toThrow(TypeError);
  });
});
