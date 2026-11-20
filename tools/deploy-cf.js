#!/usr/bin/env node
/**
 * 绕过 wrangler，直接调 Cloudflare Pages API 部署 dist/。
 *
 * 为什么不用 wrangler：它依赖的代理配置在本机会让上传中途断掉，
 * 而这个脚本自己控制重试与并发，出错信息也更直白。
 *
 * 需要环境变量：
 *   CLOUDFLARE_API_TOKEN   （权限：Account > Cloudflare Pages > Edit）
 *   CLOUDFLARE_ACCOUNT_ID
 *
 * 用法：
 *   node tools/deploy-cf.js
 *   node tools/deploy-cf.js --project my-name --branch main
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const API = 'https://api.cloudflare.com/client/v4';

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT = arg('project', 'order-of-the-sinking-star');
const BRANCH = arg('branch', 'main');

if (!TOKEN || !ACCOUNT) {
  console.error('缺少 CLOUDFLARE_API_TOKEN 或 CLOUDFLARE_ACCOUNT_ID');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

/** 递归收集 dist 下所有文件 */
function walk(dir, base = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? base + '/' + e.name : e.name;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(abs, rel));
    else {
      const buf = fs.readFileSync(abs);
      out.push({
        rel,
        abs,
        buf,
        size: buf.length,
        // Cloudflare Pages 用 sha256 十六进制前 32 位做资源键
        hash: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 32),
        type: MIME[path.extname(e.name).toLowerCase()] || 'application/octet-stream',
      });
    }
  }
  return out;
}

async function jfetch(url, opts = {}, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(180000) });
      const txt = await res.text();
      let json;
      try { json = JSON.parse(txt); } catch { json = null; }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${txt.slice(0, 200)}`);
      }
      if (json && json.success === false) {
        throw new Error(`API: ${JSON.stringify(json.errors || json).slice(0, 200)}`);
      }
      return json;
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) {
        const wait = Math.pow(2, i) * 1500;
        process.stdout.write(`  重试(${i + 1}/${tries - 1}) ${wait}ms 后…\r`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

const auth = { Authorization: `Bearer ${TOKEN}` };
const jsonHdr = { ...auth, 'Content-Type': 'application/json' };

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('dist/ 不存在或缺少 index.html，先跑 node tools/pack-dist.js');
    process.exit(1);
  }

  // 防呆：dist 里的页面必须与仓库里的 index.html 一致。
  // 之前直接跑本脚本跳过了打包，结果把旧包传上去，线上版本号没变，白查半天。
  const srcHtml = fs.readFileSync(path.join(ROOT, 'index.html'));
  const distHtml = fs.readFileSync(path.join(DIST, 'index.html'));
  if (!srcHtml.equals(distHtml)) {
    console.error('✗ dist/index.html 与 index.html 不一致（忘了打包？）');
    console.error('  请先跑：node tools/pack-dist.js');
    process.exit(1);
  }

  const files = walk(DIST);
  const total = files.reduce((s, f) => s + f.size, 0);
  console.log(`项目 ${PROJECT} · 分支 ${BRANCH}`);
  console.log(`文件 ${files.length} 个，合计 ${(total / 1024 / 1024).toFixed(1)} MB\n`);

  // 1) 拿上传用的 JWT
  const tok = await jfetch(
    `${API}/accounts/${ACCOUNT}/pages/projects/${PROJECT}/upload-token`,
    { headers: auth }
  );
  const jwt = tok.result.jwt;
  const jwtHdr = { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' };

  // 2) 问哪些文件已在服务端（按 hash 去重，重复部署只传新的）
  const missing = await jfetch(`${API}/pages/assets/check-missing`, {
    method: 'POST',
    headers: jwtHdr,
    body: JSON.stringify({ hashes: files.map(f => f.hash) }),
  });
  const need = new Set(missing.result || []);
  const toUpload = files.filter(f => need.has(f.hash));
  console.log(`需上传 ${toUpload.length} 个（${files.length - toUpload.length} 个服务端已有）`);

  // 3) 分批上传，批次控制在 8MB 以内，避免单请求过大被掐断
  const BATCH_BYTES = 2 * 1024 * 1024;
  let uploaded = 0, bytes = 0;
  for (let i = 0; i < toUpload.length;) {
    const batch = [];
    let sz = 0;
    while (i < toUpload.length && (sz + toUpload[i].size <= BATCH_BYTES || batch.length === 0)) {
      batch.push(toUpload[i]);
      sz += toUpload[i].size;
      i++;
    }
    const payload = batch.map(f => ({
      key: f.hash,
      value: f.buf.toString('base64'),
      metadata: { contentType: f.type },
      base64: true,
    }));
    await jfetch(`${API}/pages/assets/upload`, {
      method: 'POST',
      headers: jwtHdr,
      body: JSON.stringify(payload),
    });
    uploaded += batch.length;
    bytes += sz;
    console.log(`  上传 ${uploaded}/${toUpload.length}  (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
  }

  // 4) 登记这些 hash，方便下次部署去重
  await jfetch(`${API}/pages/assets/upsert-hashes`, {
    method: 'POST',
    headers: jwtHdr,
    body: JSON.stringify({ hashes: files.map(f => f.hash) }),
  });

  // 5) 创建部署
  // 注意：Pages 这个接口要 multipart/form-data，manifest 作为「文件」传，
  // 用 JSON 提交会报 8000096 "manifest field was expected"。
  const manifest = {};
  for (const f of files) manifest['/' + f.rel] = f.hash;

  const form = new FormData();
  form.append('branch', BRANCH);
  form.append('commit_dirty', 'true');
  form.append('commit_message', arg('message', 'deploy from tools/deploy-cf.js'));
  // manifest 是普通文本字段，不能当文件（用 Blob/@file 都会报 8000096）
  form.append('manifest', JSON.stringify(manifest));

  const dep = await jfetch(
    `${API}/accounts/${ACCOUNT}/pages/projects/${PROJECT}/deployments`,
    { method: 'POST', headers: auth, body: form }
  );

  const url = dep.result?.url || dep.result?.aliases?.[0] || '';
  console.log('\n✓ 部署完成');
  console.log('  部署 ID:', dep.result?.short_id || dep.result?.id);
  if (url) console.log('  地址:', url);
  console.log(`  生产地址: https://${PROJECT}.pages.dev`);
}

main().catch(e => {
  console.error('\n✗ 部署失败:', e.message);
  process.exit(1);
});
