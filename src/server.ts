import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { ReflectionOrchestrator } from "./orchestrator.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = 3000;
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

const orchestrator = new ReflectionOrchestrator();

function getMimeType(path: string): string {
  const ext = extname(path);
  return MIME_TYPES[ext] || "application/octet-stream";
}

function serveStatic(path: string): Buffer | null {
  try {
    const fullPath = join(__dirname, "../public", path);
    const stats = statSync(fullPath);
    if (stats.isFile()) {
      return readFileSync(fullPath);
    }
  } catch {
    // File not found
  }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoint
  if (url.pathname === "/api/reflect" && req.method === "POST") {
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
      }

      const { theme } = JSON.parse(body);
      if (!theme) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Theme is required" }));
        return;
      }

      const result = await orchestrator.reflect(theme);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error("Error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error:
            error instanceof Error ? error.message : "Internal server error",
        })
      );
    }
    return;
  }

  // Serve static files
  const path = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = serveStatic(path);

  if (file) {
    res.writeHead(200, { "Content-Type": getMimeType(path) });
    res.end(file);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
