#!/usr/bin/env node
/**
 * 打包一个「只含站点文件」的目录，供 Cloudflare Pages 直传。
 *
 * 为什么不直接用仓库根当输出目录
 * 因为那样会把 .git/、tools/、README 之类一起传上去（几十 MB 的 git 对象纯属浪费）。
 *
 * 产物：dist/  （已在 .gitignore 里）
 *   index.html
 *   data/*.js
 *   assets/**\/*.jpg
 *
 * 用法：node tools/pack-dist.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// 站点真正需要的
const FILES = ['index.html'];
const DIRS = [
  ['data', /\.js$/],
  ['assets', /\.(jpg|jpeg|png|webp|svg)$/],
];

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(srcdir, dstdir, re) {
  if (!fs.existsSync(srcdir)) return { n: 0, bytes: 0 };
  let n = 0, bytes = 0;
  fs.mkdirSync(dstdir, { recursive: true });
  for (const e of fs.readdirSync(srcdir, { withFileTypes: true })) {
    const s = path.join(srcdir, e.name);
    const d = path.join(dstdir, e.name);
    if (e.isDirectory()) {
      const r = copyDir(s, d, re);
      n += r.n; bytes += r.bytes;
    } else if (re.test(e.name)) {
      fs.copyFileSync(s, d);
      n++; bytes += fs.statSync(d).size;
    }
  }
  return { n, bytes };
}

rmrf(DIST);
fs.mkdirSync(DIST, { recursive: true });

// Cloudflare Pages 的响应头配置（必须放 _headers 文件，配置里不支持 headers 字段）
fs.writeFileSync(path.join(DIST, '_headers'), [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '',
  '# 图片内容不变，长缓存',
  '/assets/*',
  '  Cache-Control: public, max-age=604800',
  '',
].join(String.fromCharCode(10)));

let total = 0, count = 0;

for (const f of FILES) {
  const s = path.join(ROOT, f);
  if (!fs.existsSync(s)) {
    console.error(`✗ 缺少必需文件：${f}`);
    process.exit(1);
  }
  fs.copyFileSync(s, path.join(DIST, f));
  total += fs.statSync(s).size;
  count++;
}

for (const [dir, re] of DIRS) {
  const r = copyDir(path.join(ROOT, dir), path.join(DIST, dir), re);
  total += r.bytes;
  count += r.n;
  console.log(`  ${dir}/  ${r.n} 个文件  ${(r.bytes / 1024 / 1024).toFixed(1)} MB`);
}

// 缺图就警告：缺图站点能开但地图空白
const board = path.join(DIST, 'assets', 'levels');
const nBoard = fs.existsSync(board) ? fs.readdirSync(board).length : 0;
if (nBoard < 900) {
  console.warn(`\n⚠ assets/levels 只有 ${nBoard} 张（应为 920），先跑 python tools/fetch-assets.py`);
}
for (const m of ['ground', 'sky', 'under']) {
  if (!fs.existsSync(path.join(DIST, 'assets', 'maps', m + '.jpg'))) {
    console.warn(`⚠ 缺底图 assets/maps/${m}.jpg`);
  }
}

console.log(`\n✓ dist/ 就绪：${count} 个文件，${(total / 1024 / 1024).toFixed(1)} MB`);
console.log('  下一步：npx wrangler pages deploy dist --project-name order-of-the-sinking-star');
