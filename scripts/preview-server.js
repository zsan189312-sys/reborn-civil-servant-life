"use strict";

// Internal Canvas test harness, bound only to this computer. It does not publish the game.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function sourceVersion() {
  const targets = [path.join(root, "game.js"), path.join(root, "src"), __filename, path.join(__dirname, "preview")];
  let latest = 0;
  function visit(target) {
    const stat = fs.statSync(target);
    latest = Math.max(latest, stat.mtimeMs);
    if (stat.isDirectory()) fs.readdirSync(target).forEach((name) => visit(path.join(target, name)));
  }
  targets.forEach(visit);
  return String(Math.floor(latest));
}

function createBundle() {
  const modules = new Map();
  function visit(filename) {
    const id = path.relative(root, filename).split(path.sep).join("/");
    if (modules.has(id)) return id;
    modules.set(id, "");
    const source = fs.readFileSync(filename, "utf8").replace(/require\(["'](\.[^"']*)["']\)/g, (_match, request) => {
      let target = path.resolve(path.dirname(filename), request);
      if (!path.extname(target)) target += ".js";
      if (!target.startsWith(root + path.sep)) throw new Error("Module outside project");
      return `require(${JSON.stringify(visit(target))})`;
    });
    modules.set(id, source);
    return id;
  }
  const entry = visit(path.join(root, "game.js"));
  return `(function(){"use strict"; const modules = {${[...modules].map(([id, source]) => `${JSON.stringify(id)}: function(require,module,exports){\n${source}\n}`).join(",\n")}};
const cache = {}; function require(id){if(cache[id])return cache[id].exports;const module=cache[id]={exports:{}};modules[id](require,module,module.exports);return module.exports;} require(${JSON.stringify(entry)});})();`;
}

function createServer(options = {}) {
  const allowedHosts = new Set(options.allowedHosts || ["127.0.0.1", "localhost"]);
  return http.createServer((request, response) => {
    const requestHost = (request.headers.host || "").replace(/:\d+$/, "");
    if (!allowedHosts.has(requestHost)) {
      response.writeHead(403).end("Preview host not allowed");
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'");
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405).end();
      return;
    }
    try {
      const pathname = new URL(request.url, "http://127.0.0.1").pathname;
      const routes = {
        "/": ["preview.html", "text/html; charset=utf-8"],
        "/preview.js": ["preview.js", "text/javascript; charset=utf-8"],
        "/preview.css": ["preview.css", "text/css; charset=utf-8"]
      };
      let body;
      if (pathname === "/version") {
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        body = sourceVersion();
      } else if (pathname === "/bundle.js") {
        response.setHeader("Content-Type", "text/javascript; charset=utf-8");
        body = createBundle();
      } else if (routes[pathname]) {
        const [filename, type] = routes[pathname];
        response.setHeader("Content-Type", type);
        body = fs.readFileSync(path.join(__dirname, "preview", filename));
      } else { response.writeHead(404).end("Not found"); return; }
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (_error) { response.writeHead(500).end("Preview could not load; run npm run check."); }
  });
}

if (require.main === module) {
  const port = Number(process.env.PREVIEW_PORT || 4173);
  const host = process.env.PREVIEW_HOST || "127.0.0.1";
  const allowedHosts = ["127.0.0.1", "localhost"];
  if (process.env.PREVIEW_PUBLIC_HOST) allowedHosts.push(process.env.PREVIEW_PUBLIC_HOST);
  const server = createServer({ allowedHosts });
  server.on("error", (error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
  server.listen(port, host, () => {
    const displayHost = process.env.PREVIEW_PUBLIC_HOST || host;
    const scope = host === "127.0.0.1" ? "仅本机可访问" : "仅供同一局域网试玩";
    process.stdout.write(`内部试玩：http://${displayHost}:${port}\n${scope}；Ctrl+C 停止。\n`);
  });
}

module.exports = { createBundle, createServer, sourceVersion };
