"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const http = require("node:http");
const { createBundle, createServer } = require("../scripts/preview-server");

test("internal preview bundle parses, and server exposes no project files", async (t) => {
  new vm.Script(createBundle());
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const index = await fetch(base);
  assert.equal(index.status, 200);
  assert.match(await index.text(), /重生之我是公务员的一生/);
  assert.match(index.headers.get("content-security-policy"), /connect-src 'self'/);
  for (const route of ["/bundle.js", "/preview.js", "/preview.css", "/version"]) assert.equal((await fetch(base + route)).status, 200);
  for (const route of ["/.git/config", "/project.config.json", "/src/core/engine.js"]) assert.equal((await fetch(base + route)).status, 404);
  assert.equal((await fetch(base, { method: "POST" })).status, 405);
  const hostStatus = await new Promise((resolve, reject) => {
    http.get(base, { headers: { Host: "attacker.invalid" } }, (response) => { response.resume(); resolve(response.statusCode); }).on("error", reject);
  });
  assert.equal(hostStatus, 403);
});

test("LAN preview accepts only explicitly allowed hosts", async (t) => {
  const server = createServer({ allowedHosts: ["127.0.0.1", "192.168.1.23"] });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [host, expected] of [["192.168.1.23", 200], ["192.168.1.23:4173", 200], ["192.168.1.24", 403]]) {
    const status = await new Promise((resolve, reject) => {
      http.get(base, { headers: { Host: host } }, (response) => { response.resume(); resolve(response.statusCode); }).on("error", reject);
    });
    assert.equal(status, expected);
  }
});
