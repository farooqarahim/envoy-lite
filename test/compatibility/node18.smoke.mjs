import assert from "node:assert/strict";
import {
  envoy,
  safeEnvoy,
  str,
  num,
  bool,
  port,
  enum_,
  url,
  email,
  json,
  csv,
  secret,
  mask,
  formatErrors,
  EnvoyError
} from "../../dist/index.js";

const source = {
  APP_NAME: "envoy-lite",
  PORT: "8080",
  DEBUG: "true",
  RETRIES: "3",
  MODE: "production",
  API_URL: "https://example.com",
  OWNER_EMAIL: "owner@example.com",
  FEATURE_FLAGS: '{"beta":true}',
  ALLOWED_ORIGINS: "a.com,b.com",
  API_KEY: "sk-secret-12345",
  LOG_LEVEL: "info"
};

const schema = {
  APP_NAME: str(),
  PORT: port(),
  DEBUG: bool(),
  RETRIES: num({ int: true, min: 0 }),
  MODE: enum_(["development", "production"]),
  API_URL: url(),
  OWNER_EMAIL: email(),
  FEATURE_FLAGS: json(),
  ALLOWED_ORIGINS: csv(str()),
  API_KEY: secret(),
  LOG_LEVEL: str({ default: "info" })
};

const env = envoy(schema, { source });

assert.equal(env.APP_NAME, "envoy-lite");
assert.equal(env.PORT, 8080);
assert.equal(env.DEBUG, true);
assert.equal(env.RETRIES, 3);
assert.equal(env.MODE, "production");
assert.equal(env.API_URL, "https://example.com");
assert.equal(env.OWNER_EMAIL, "owner@example.com");
assert.deepEqual(env.FEATURE_FLAGS, { beta: true });
assert.deepEqual(env.ALLOWED_ORIGINS, ["a.com", "b.com"]);
assert.equal(env.API_KEY, "sk-secret-12345");
assert.equal(env.LOG_LEVEL, "info");

const safe = safeEnvoy({ PORT: port() }, { source: { PORT: "not-a-port" } });
assert.equal(safe.ok, false);
assert.ok(safe.error instanceof EnvoyError);
assert.ok(safe.error.issues.length > 0);

const formatted = formatErrors(safe.error);
assert.equal(typeof formatted, "string");
assert.ok(formatted.length > 0);

const masked = mask(env);
assert.equal(masked.API_KEY, "[REDACTED]");
assert.equal(masked.APP_NAME, "envoy-lite");

console.log(`Node ${process.version} smoke test passed.`);
