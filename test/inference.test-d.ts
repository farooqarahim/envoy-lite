import { describe, it, expectTypeOf } from "vitest";
import {
  envoy,
  safeEnvoy,
  str,
  num,
  bool,
  enum_,
  csv,
  bigint,
  date,
  duration,
  base64,
  regex,
  type Infer,
  type SafeEnvoyResult
} from "../src";

describe("type inference", () => {
  it("infers a basic schema", () => {
    const env = envoy(
      { NAME: str(), PORT: num() },
      { source: { NAME: "x", PORT: "1" } }
    );
    expectTypeOf(env.NAME).toEqualTypeOf<string>();
    expectTypeOf(env.PORT).toEqualTypeOf<number>();
  });

  it("optional infers union with undefined", () => {
    const env = envoy({ X: str().optional() }, { source: {} });
    expectTypeOf(env.X).toEqualTypeOf<string | undefined>();
  });

  it("default narrows to literal", () => {
    const env = envoy({ X: str().default("hi") }, { source: {} });
    expectTypeOf(env.X).toEqualTypeOf<"hi">();
  });

  it("enum infers union", () => {
    const env = envoy(
      { MODE: enum_(["dev", "prod"] as const) },
      { source: { MODE: "dev" } }
    );
    expectTypeOf(env.MODE).toEqualTypeOf<"dev" | "prod">();
  });

  it("bool infers boolean", () => {
    const env = envoy({ X: bool() }, { source: { X: "true" } });
    expectTypeOf(env.X).toEqualTypeOf<boolean>();
  });

  it("csv(num()) infers number[]", () => {
    const env = envoy({ X: csv(num()) }, { source: { X: "1,2,3" } });
    expectTypeOf(env.X).toEqualTypeOf<number[]>();
  });

  it("bigint infers bigint", () => {
    const env = envoy({ X: bigint() }, { source: { X: "42" } });
    expectTypeOf(env.X).toEqualTypeOf<bigint>();
  });

  it("date infers Date", () => {
    const env = envoy({ X: date() }, { source: { X: "2024-01-01" } });
    expectTypeOf(env.X).toEqualTypeOf<Date>();
  });

  it("duration infers number (ms)", () => {
    const env = envoy({ X: duration() }, { source: { X: "5m" } });
    expectTypeOf(env.X).toEqualTypeOf<number>();
  });

  it("base64 infers string", () => {
    const env = envoy({ X: base64() }, { source: { X: "YWJj" } });
    expectTypeOf(env.X).toEqualTypeOf<string>();
  });

  it("regex infers string", () => {
    const env = envoy({ X: regex(/^[a-z]+$/) }, { source: { X: "abc" } });
    expectTypeOf(env.X).toEqualTypeOf<string>();
  });

  it("transform changes output type", () => {
    const env = envoy(
      { X: str().transform((v) => v.length) },
      { source: { X: "abc" } }
    );
    expectTypeOf(env.X).toEqualTypeOf<number>();
  });

  it("safeEnvoy returns discriminated union", () => {
    const result = safeEnvoy({ X: str() }, { source: { X: "hi" } });
    expectTypeOf(result).toMatchTypeOf<SafeEnvoyResult<{ X: string }>>();
  });

  it("Infer extracts schema type", () => {
    type Env = Infer<{ X: ReturnType<typeof str>; Y: ReturnType<typeof num> }>;
    expectTypeOf<Env>().toEqualTypeOf<{ X: string; Y: number }>();
  });
});
