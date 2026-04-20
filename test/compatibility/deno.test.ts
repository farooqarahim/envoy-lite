import { assert } from "jsr:@std/assert@1";
import { envoy, str } from "../../src/index.ts";

Deno.test("Deno runtime: reads env via resolver", () => {
  const env = envoy({ PATH: str().optional() });
  assert(typeof env.PATH === "string" || env.PATH === undefined);
});
