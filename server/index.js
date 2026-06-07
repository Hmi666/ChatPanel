import express from "express";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "..");
const distDir = join(rootDir, "dist");

const port = Number(process.env.PORT || 6001);
const apiBaseURL = (process.env.AI_API_BASE_URL || "https://ai.netclip.cloud").replace(/\/+$/, "");

const app = express();

const staticTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function normalizeProxyPath(path) {
  return path.replace(/^\/api\/openai\/?/, "").replace(/^\/+/, "");
}

app.use("/api/openai", async (req, res) => {
  const upstreamPath = normalizeProxyPath(req.originalUrl.split("?")[0]);
  const query = req.originalUrl.includes("?") ? `?${req.originalUrl.split("?").slice(1).join("?")}` : "";
  const upstreamURL = `${apiBaseURL}/${upstreamPath}${query}`;

  const headers = new Headers();

  if (req.headers.authorization) {
    headers.set("Authorization", req.headers.authorization);
  }
  if (req.headers["content-type"]) {
    headers.set("Content-Type", String(req.headers["content-type"]));
  }

  try {
    const upstream = await fetch(upstreamURL, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
      duplex: "half",
      signal: AbortSignal.timeout(Number(process.env.PROXY_TIMEOUT_MS || 0) || 3600000),
    });

    res.status(upstream.status);

    upstream.headers.forEach((value, key) => {
      if (["content-encoding", "content-length"].includes(key.toLowerCase())) {
        return;
      }
      res.setHeader(key, value);
    });

    if (!upstream.body) {
      res.end();
      return;
    }

    await pipeline(upstream.body, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(502).json({
        error: {
          message: error instanceof Error ? error.message : "Proxy request failed",
        },
      });
    } else {
      res.end();
    }
  }
});

app.get("*", (req, res) => {
  const requestedPath = req.path === "/" ? "/index.html" : req.path;
  const safePath = resolve(join(distDir, requestedPath));
  const targetPath = safePath.startsWith(distDir) && existsSync(safePath)
    ? safePath
    : join(distDir, "index.html");

  const type = staticTypes.get(extname(targetPath));
  if (type) {
    res.setHeader("Content-Type", type);
  }

  if (targetPath !== join(distDir, "index.html")) {
    res.setHeader("Cache-Control", "public, immutable, max-age=2592000");
  }

  createReadStream(targetPath).pipe(res);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Local Chat Panel server listening on 0.0.0.0:${port}`);
  console.log(`Proxy upstream: ${apiBaseURL}`);
});
