import { envoy, port, enum_ } from "envoy-lite";

const env = envoy({
  PORT: port(),
  MODE: enum_(["development", "production"] as const)
});

const server = Bun.serve({
  port: env.PORT,
  fetch() {
    return new Response(JSON.stringify({ mode: env.MODE }), {
      headers: { "content-type": "application/json" }
    });
  }
});

console.error(`listening on :${server.port}`);
