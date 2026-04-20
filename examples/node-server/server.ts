import { createServer } from "node:http";
import { env } from "./env";

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: true, mode: env.NODE_ENV }));
});

server.listen(env.PORT, () => {
  console.error(`listening on :${env.PORT}`);
});
