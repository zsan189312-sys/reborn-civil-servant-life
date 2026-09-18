"use strict";

// Generates the source-code document for the software copyright (软著)
// application: 50 lines per page, page header with name + version, first 30
// and last 30 pages. Run `node scripts/gen-copyright-source.js` after any
// change to game.js or src/.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const NAME = "重生之我是公务员的一生（游戏软件）";
const VERSION = "V1.0";

const order = [
  "game.js",
  "src/platform/wechat.js",
  "src/core/constants.js",
  "src/core/random.js",
  "src/core/life.js",
  "src/core/accounts.js",
  "src/core/accountability.js",
  "src/core/competition.js",
  "src/core/engine.js",
  "src/data/endings.js",
  "src/data/events.js",
  "src/data/assessments.js",
  "src/data/followups.js",
  "src/data/career-followups.js",
  "src/data/career-stories.js",
  "src/data/child-stories.js",
  "src/data/department-stories.js",
  "src/data/duty-stories.js",
  "src/data/engaging-work-stories.js",
  "src/data/ethics-stories.js",
  "src/data/inspection-crisis-stories.js",
  "src/data/integrity-assessments.js",
  "src/data/life-dilemmas.js",
  "src/data/more-sector-stories.js",
  "src/data/sector-stories.js",
  "src/data/senior-events.js",
  "src/ui/app.js"
];

const all = [];
for (const rel of order) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, "utf8").split("\n");
  all.push("/* ===== 文件：" + rel + " ===== */");
  for (const line of lines) all.push(line);
}

const PER_PAGE = 50;
const pages = [];
for (let i = 0; i < all.length; i += PER_PAGE) pages.push(all.slice(i, i + PER_PAGE));
const total = pages.length;
const merged = pages.slice(0, 30).concat(pages.slice(Math.max(30, total - 30)));

const out = [];
merged.forEach((page, index) => {
  out.push(NAME + " " + VERSION + "    第 " + (index + 1) + " 页");
  for (const line of page) out.push(line);
  out.push("");
});

const target = path.join(ROOT, "docs", "著作权", "源代码.txt");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, out.join("\n") + "\n");

console.log("source pages total:", total);
console.log("submitted pages (front 30 + back 30):", merged.length);
console.log("total lines:", all.length);
console.log("written:", path.relative(ROOT, target));
