#!/usr/bin/env node
/**
 * Cloudflare Pages 构建用：把站点文件筛到 public/，只留该公开的部分。
 *
 * 为什么需要它：Pages 的 Build output directory 如果直接填仓库根，
 * tools/、README.md、package.json 也会被当成静态资源发布上去
 * （.assetsignore 只对 Workers 静态资源有效，Pages 不读它）。
 *
 * Cloudflare 上的 Build command 填：
 *   node tools/build-public.js
 * Build output directory 填：
 *   public
 *
 * 本地也能跑，跑完直接用 public/ 起服务验证。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

// 站点真正需要的三样
const ITEMS = ['index.html', 'data', 'assets'];

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyRec(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) copyRec(path.join(src, name), path.join(dst, name));
  } else {
    fs.copyFileSync(src, dst);
  }
}

function dirSize(p) {
  let n = 0;
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else n += fs.statSync(f).size;
    }
  };
  if (fs.existsSync(p)) walk(p);
  return n;
}

rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });

let missing = [];
for (const name of ITEMS) {
  const src = path.join(ROOT, name);
  if (!fs.existsSync(src)) { missing.push(name); continue; }
  copyRec(src, path.join(OUT, name));
}

if (missing.length) {
  console.error('✗ 缺少必需内容：' + missing.join(', '));
  process.exit(1);
}

// 底图与关卡图必须齐，否则站点能开但地图是空的
const mapsDir = path.join(OUT, 'assets', 'maps');
const levelsDir = path.join(OUT, 'assets', 'levels');
const nMaps = fs.existsSync(mapsDir) ? fs.readdirSync(mapsDir).length : 0;
const nLevels = fs.existsSync(levelsDir) ? fs.readdirSync(levelsDir).length : 0;

if (nMaps < 3) console.warn(`⚠ assets/maps 只有 ${nMaps} 个文件（应为 3）`);
if (nLevels < 900) console.warn(`⚠ assets/levels 只有 ${nLevels} 张（应为 920），先跑 python tools/fetch-assets.py`);

// Cloudflare Pages 的响应头配置要放 _headers（不在配置里写 headers 字段）
fs.writeFileSync(path.join(OUT, '_headers'), [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '',
  '# 图片内容不变，长缓存',
  '/assets/*',
  '  Cache-Control: public, max-age=604800',
  '',
].join(String.fromCharCode(10)));

console.log(`✓ public/ 就绪 · 底图 ${nMaps} · 关卡图 ${nLevels} · ${(dirSize(OUT) / 1024 / 1024).toFixed(1)} MB`);
