/**
 * 把社区解包数据合并进 data/levels.js
 * 数据来源：github.com/joric/ootss  data/solutions.json（主解）、data/solutions.txt（另解）、data/youtube.txt（视频）
 * 重新生成：node tools/build-solutions.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const raw = p => path.join(__dirname, "raw", p);

global.window = {};
require(path.join(root, "data", "levels.js"));
const D = window.MAPDATA;

const primary = new Map();
for (const o of JSON.parse(fs.readFileSync(raw("solutions.json"), "utf8"))) {
  if (o && o.name) primary.set(o.name, (o.solution || "").trim());
}

const alt = new Map();
for (const line of fs.readFileSync(raw("solutions.txt"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([a-z0-9_.]+):(.*)$/);
  if (m && m[2].trim()) alt.set(m[1], m[2].trim());
}

const video = new Map();
for (const line of fs.readFileSync(raw("youtube.txt"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([a-z0-9_.]+),(https?:\/\/\S+)$/);
  if (m) video.set(m[1], m[2].trim());
}

const boardDir = path.join(root, "assets", "levels");
const boards = new Set(fs.existsSync(boardDir) ? fs.readdirSync(boardDir).filter(f => f.endsWith(".jpg")).map(f => f.slice(0, -4)) : []);

let nSol = 0, nAlt = 0, nVid = 0, nMissing = 0;
const missing = [];

D.levels = D.levels.map(l => {
  const s = primary.get(l.n) || "";
  const a = alt.get(l.n) || "";
  const y = video.get(l.n) || "";
  if (s) nSol++; else { nMissing++; missing.push(l.n); }
  if (a && a !== s) nAlt++;
  if (y) nVid++;
  return {
    ...l,
    i: boards.has(l.n) ? 1 : 0,
    s,
    s2: a && a !== s ? a : undefined,
    yt: y || undefined
  };
});

D.meta.sol = nSol;
D.meta.alt = nAlt;
D.meta.vid = nVid;
D.meta.board = boards.size;
D.meta.built = new Date().toISOString().slice(0, 10);

const out = `/* 由 tools/build-solutions.js 生成，请勿手改。关卡坐标来自 joric/ootss，解法来自社区整理 */\nwindow.MAPDATA = ${JSON.stringify(D)};\n`;
fs.writeFileSync(path.join(root, "data", "levels.js"), out);

console.log(`关卡 ${D.levels.length} 个：主解 ${nSol}，另解 ${nAlt}，视频 ${nVid}，缺主解 ${nMissing}`);
if (missing.length) console.log("缺主解:", missing.slice(0, 20).join(", "));
console.log("levels.js", (fs.statSync(path.join(root, "data", "levels.js")).size / 1024).toFixed(0) + "KB");
