import { envoy, str, port, url, enum_, bool, secret } from "envoy-lite";

export const env = envoy({
  DATABASE_URL: url({ protocols: ["postgres", "postgresql"] }),
  PORT: port(),
  NODE_ENV: enum_(["development", "production", "test"] as const),
  LOG_LEVEL: str().default("info"),
  DEBUG: bool().default(false),
  API_KEY: secret()
});
