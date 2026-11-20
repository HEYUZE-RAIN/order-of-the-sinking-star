# 部署

本项目**推送代码即自动部署**，两份托管同时在线，无需任何令牌。

## 在线地址

| 平台 | 地址 | 说明 |
|---|---|---|
| **Cloudflare Pages** | https://order-of-the-sinking-star-map.pages.dev | 国内访问较快，无限带宽 |
| **GitHub Pages** | https://heyuze-rain.github.io/order-of-the-sinking-star/ | 备份 |

生产分支均为 `main`。

---

## Cloudflare Pages

已配置 Git 集成，`git push` 后自动构建上线。

构建配置（在 Cloudflare 控制台 → Settings → Build）：

| 字段 | 值 |
|---|---|
| Build command | `node tools/build-public.js` |
| Build output directory | `public` |

工作原理：`tools/build-public.js` 只把 `index.html` + `data/` + `assets/`
复制到 `public/`，仓库里的工具与文档不会被发布。

详细步骤与踩坑记录见 **[CLOUDFLARE-GIT.md](CLOUDFLARE-GIT.md)**。

---

## GitHub Pages

在仓库 Settings → Pages 里设为 `main` 分支 `/ (root)`，推送后自动更新。

注意：GitHub Pages 会发布仓库根目录的所有文件（`tools/`、`README.md` 等
也能通过网页访问）。由于仓库本身是公开的，这不构成额外泄露，故未处理。

---

## 本地开发

不需要构建，直接打开即可：

```bash
# 方式一：双击 index.html
# 方式二：起个静态服务器
python -m http.server 8000
```

---

## 历史：直传方式（已弃用）

早期用 `tools/deploy-cf.js` 直连 Cloudflare API 上传，需要 API 令牌。
连续两次因令牌被删导致无法部署，后改为 Git 集成，现不再使用。

相关脚本保留在 `tools/` 下（`pack-dist.js`、`deploy-cf.js`），
`package.json` 里对应 `npm run deploy:cf`。如将来需要临时直传仍可用。

踩过的坑记录在此，避免重犯：

| 问题 | 表现 | 解决 |
|---|---|---|
| Pages 配置不支持 `account_id` | 配置校验报错 | 改走环境变量 |
| 单批 8MB 上传中断 | `fetch failed`，无有效信息 | 降到 2MB 分批 |
| manifest 传法错误 | `8000096 manifest field expected` | 必须是普通文本字段，不能当文件传 |
| `api.cloudflare.com` 间歇性阻断 | TLS 握手被掐 | 脚本内置指数退避重试 |

---

## 换到其他托管

站点是纯静态的，`public/`（或仓库里的 `index.html` + `data/` + `assets/`）
可直接部署到任何静态托管：

| 平台 | 免费额度 | 特点 |
|---|---|---|
| Cloudflare Pages | 无限带宽 | 国内相对快 |
| Netlify | 100GB/月 | 拖拽部署最省事 |
| Vercel | 100GB/月 | 与 Next.js 生态好 |
| 自建 nginx | — | 完全可控 |

换平台不需要改 `index.html` 任何一行。
