import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const entryUrl = pathToFileURL(join(process.cwd(), "dist", "server", "server.js"));
const { default: handler } = await import(entryUrl.href);
const clientDir = join(process.cwd(), "dist", "client");

function serveAsset(pathname, response) {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  const file = join(clientDir, relative);
  if (!file.startsWith(clientDir) || !existsSync(file) || !statSync(file).isFile()) return false;
  response.writeHead(200, {
    "cache-control": relative.startsWith("assets/") ? "public, max-age=31536000, immutable" : "public, max-age=0",
    "content-type": mimeTypes[extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
  return true;
}

const server = createServer(async (request, response) => {
  try {
    const origin = `http://${request.headers.host ?? "localhost"}`;
    const url = new URL(request.url ?? "/", origin);
    if ((request.method === "GET" || request.method === "HEAD") && serveAsset(url.pathname, response)) return;

    const body = request.method === "GET" || request.method === "HEAD" ? undefined : Readable.toWeb(request);
    const webRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body,
      duplex: body ? "half" : undefined,
    });
    const webResponse = await handler.fetch(webRequest);
    const headers = Object.fromEntries(webResponse.headers);
    const cookies = webResponse.headers.getSetCookie?.();
    if (cookies?.length) headers["set-cookie"] = cookies;
    response.writeHead(webResponse.status, headers);
    if (!webResponse.body || request.method === "HEAD") return response.end();
    Readable.fromWeb(webResponse.body).pipe(response);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Internal server error");
  }
});

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
server.listen(port, host, () => console.log(`RustaBase app listening on ${host}:${port}`));