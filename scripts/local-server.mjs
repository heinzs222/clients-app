import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import provisioner from "../netlify/functions/create-client-capi.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 8888);

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();
process.env.NETLIFY_DEV = "true";
process.env.CONTEXT = "dev";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function requestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 512000) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function runFunction(req, res) {
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await requestBody(req);
  const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: body?.length ? body : undefined,
    duplex: body?.length ? "half" : undefined
  });
  const result = await provisioner(request, {});
  res.statusCode = result.status;
  result.headers.forEach((value, key) => res.setHeader(key, value));
  const output = Buffer.from(await result.arrayBuffer());
  res.end(output);
}

function serveFile(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
  const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  let filePath = path.resolve(dist, relative);
  if (!filePath.startsWith(dist) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(dist, "index.html");
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream");
  res.setHeader("Cache-Control", filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600");
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    if (new URL(req.url, `http://127.0.0.1:${port}`).pathname === "/api/workspace") {
      await runFunction(req, res);
      return;
    }
    serveFile(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, error: error.message || "Local server error." }));
  }
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Simple CAPI local server: http://localhost:${port}\n`);
});
