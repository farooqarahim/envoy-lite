import { envoy, str, enum_, secret } from "envoy-lite";

interface Env {
  API_KEY: string;
  ENVIRONMENT: string;
}

export default {
  fetch(_req: Request, env: Env): Response {
    const cfg = envoy(
      {
        API_KEY: secret(),
        ENVIRONMENT: enum_(["development", "production"] as const),
        UNUSED: str().optional()
      },
      { source: env as unknown as Record<string, string | undefined> }
    );
    return new Response(JSON.stringify({ mode: cfg.ENVIRONMENT }), {
      headers: { "content-type": "application/json" }
    });
  }
};
