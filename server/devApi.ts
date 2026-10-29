import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";

import type { Plugin, ViteDevServer } from "vite";

type Handler = (request: Request) => Response | Promise<Response>;

/**
 * Serves the Vercel functions in `api/` from the Vite dev server, so `npm run dev`
 * runs the full stack without the Vercel CLI. In production Vercel serves them directly.
 */
export function devApi(): Plugin {
  return {
    name: "dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api", (req, res, next) => {
        handle(server, req, res).catch(next);
      });
    },
  };
}

async function handle(server: ViteDevServer, req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const name = url.pathname.replace(/^\/+|\/+$/g, "");
  const file = path.resolve(server.config.root, "api", `${name}.ts`);

  if (!/^[\w-]+$/.test(name) || !fs.existsSync(file)) {
    return send(res, Response.json({ error: "Not found." }, { status: 404 }));
  }

  const mod = (await server.ssrLoadModule(file)) as Record<string, Handler | undefined>;
  const handler = mod[req.method ?? "GET"];
  if (!handler) {
    return send(res, Response.json({ error: "Method not allowed." }, { status: 405 }));
  }

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
  const request = new Request(new URL(`/api/${name}${url.search}`, `http://${req.headers.host}`), {
    method: req.method,
    headers: req.headers as Record<string, string>,
    ...(body && { body: new Uint8Array(body) }),
  });
  await send(res, await handler(request));
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
