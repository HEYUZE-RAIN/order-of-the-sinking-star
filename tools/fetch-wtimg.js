/**
 * 下载攻略站的关卡截图，供与本地棋盘的图片匹配使用。
 * 输入：wtimgs.json（由工具生成，列出 /img/... 路径）
 * 产物：tools/raw/wtimg/<hash>.webp
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "raw", "wtimg");
const list = JSON.parse(fs.readFileSync(path.join(ROOT, "wtimgs.json"), "utf8")).all;

const key = u => crypto.createHash("md5").update(u).digest("hex").slice(0, 16);

function get(url, tries = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept": "image/webp,image/*,*/*",
        "Accept-Encoding": "gzip, deflate"
      },
      timeout: 45000
    }, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      const zlib = require("zlib");
      const enc = res.headers["content-encoding"];
      let stream = res;
      if (enc === "gzip") stream = res.pipe(zlib.createGunzip());
      else if (enc === "deflate") stream = res.pipe(zlib.createInflate());
      const chunks = [];
      stream.on("data", c => chunks.push(c));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", e => {
      if (tries > 1) setTimeout(() => get(url, tries - 1).then(resolve, reject), 1500);
      else reject(e);
    });
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let ok = 0, skip = 0, fail = 0;
  const manifest = {};
  for (let i = 0; i < list.length; i++) {
    const u = list[i];
    const f = path.join(OUT, key(u) + ".webp");
    manifest[u] = key(u) + ".webp";
    if (fs.existsSync(f) && fs.statSync(f).size > 1000) { skip++; continue; }
    try {
      const buf = await get("https://sinkingstarwalkthrough.com" + u);
      fs.writeFileSync(f, buf);
      ok++;
      if (ok % 50 === 0) console.log(`  …已下载 ${ok}（${i + 1}/${list.length}）`);
    } catch (e) {
      fail++;
      if (fail <= 5) console.log(`✗ ${u} ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 90));
  }
  fs.writeFileSync(path.join(OUT, "_manifest.json"), JSON.stringify(manifest, null, 1));
  console.log(`\n下载完成：新增 ${ok}，已存在 ${skip}，失败 ${fail}，共 ${list.length}`);
})();
