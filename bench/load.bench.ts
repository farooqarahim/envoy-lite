import { bench, describe } from "vitest";
import { envoy, str, num, bool, url, port, enum_ } from "../src";

const schema = {
  DATABASE_URL: url(),
  PORT: port(),
  NODE_ENV: enum_(["development", "production", "test"] as const),
  LOG_LEVEL: str().default("info"),
  DEBUG: bool().default(false),
  RETRIES: num({ integer: true, min: 0, max: 10 }).default(3)
};

const source = {
  DATABASE_URL: "postgres://x",
  PORT: "3000",
  NODE_ENV: "production"
};

describe("envoy()", () => {
  bench("6-field schema", () => {
    envoy(schema, { source });
  });
});
