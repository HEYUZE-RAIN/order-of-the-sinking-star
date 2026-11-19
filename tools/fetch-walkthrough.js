/**
 * 抓取 sinkingstarwalkthrough.com 的各关卡页，供后续与本地关卡做图片匹配。
 * 产物：tools/raw/walkthrough/<slug>.html
 * 单独运行：node tools/fetch-walkthrough.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const OUT = path.join(__dirname, "raw", "walkthrough");
const BASE = "https://sinkingstarwalkthrough.com/zh/";

const SLUGS = [
  "heroes-of-hauling-solutions", "mirror-isles-solutions", "skipping-stones-solutions",
  "vault-of-the-beamcasters-solutions", "mirrors-and-stones-solutions",
  "heroes-and-mirrors-solutions", "heroes-and-stones-east-solutions",
  "heroes-and-stones-west-solutions", "heroes-and-water-solutions",
  "heroes-and-artifacts-solutions", "heroes-and-light-solutions",
  "heroes-and-light-advanced-solutions", "heroes-doubled-solutions",
  "heroes-2-monsters-solutions", "heroes-3-bard-druid-solutions",
  "torc-solutions", "light-follows-the-mirror-solutions",
  "beams-reflected-solutions", "reflected-beams-solutions", "changing-beams-solutions",
  "cart-and-rod-solutions", "stones-illuminated-solutions",
  "dragons-squeezed-solutions", "high-beamcasters-solutions",
  "high-heroes-solutions", "high-mirrors-solutions", "high-skipping-stones-solutions",
  "low-beamcasters-solutions", "low-heroes-solutions", "low-mirrors-solutions",
  "low-skipping-stones-solutions", "antipode-solutions", "antipode-high", "antipode-low",
  "endgame-high-solutions", "endgame-low-solutions",
  "gold-rooms-solutions", "crossovers", "shifting-beams-solutions",
  "mirrors-in-mirrors-solutions", "beams-reflected-solutions",
];

function get(url, tries = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Encoding": "gzip, deflate"
      },
      timeout: 45000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return get(new URL(res.headers.location, url).href, tries).then(resolve, reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      const zlib = require("zlib");
      const enc = res.headers["content-encoding"];
      let stream = res;
      if (enc === "gzip") stream = res.pipe(zlib.createGunzip());
      else if (enc === "deflate") stream = res.pipe(zlib.createInflate());
      else if (enc === "br") stream = res.pipe(zlib.createBrotliDecompress());
      const chunks = [];
      stream.on("data", c => chunks.push(c));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      stream.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", e => {
      if (tries > 1) setTimeout(() => get(url, tries - 1).then(resolve, reject), 1200);
      else reject(e);
    });
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const uniq = [...new Set(SLUGS)];
  let ok = 0, fail = [];
  for (const s of uniq) {
    const file = path.join(OUT, s + ".html");
    if (fs.existsSync(file) && fs.statSync(file).size > 5000) { ok++; continue; }
    try {
      const html = await get(BASE + s + "/");
      fs.writeFileSync(file, html);
      const n = (html.match(/<h2 id="第-\d+-题"/g) || []).length;
      console.log(`✓ ${s}  ${(html.length / 1024).toFixed(0)}KB  题数 ${n}`);
      ok++;
    } catch (e) {
      console.log(`✗ ${s}  ${e.message}`);
      fail.push(s);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(`\n完成 ${ok}/${uniq.length}`, fail.length ? "失败：" + fail.join(", ") : "");
})();
