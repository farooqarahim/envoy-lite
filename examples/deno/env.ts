import { envoy, port, enum_, str } from "envoy-lite";

export const env = envoy({
  PORT: port(),
  MODE: enum_(["development", "production"] as const),
  LOG_LEVEL: str().default("info")
});
