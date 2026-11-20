# Cloudflare Pages 自动部署（Git 集成）

推送代码即上线，**不需要 API 令牌**。

---

## ⚠️ 先看这条：别建错类型

Cloudflare 控制台里 **Workers** 和 **Pages** 是两个不同入口，建错了就会报：

```
Missing entry-point to Worker script or to assets directory
```

因为 Workers 的默认部署命令是 `npx wrangler deploy`，它找的是 Worker 入口脚本或
`[assets] directory`，不认 Pages 的 `pages_build_output_dir`。

**必须走 Pages 页签**，不是 Workers。

---

## 正确步骤

1. 打开 https://dash.cloudflare.com/?to=/%3Aaccount/workers-and-pages
2. 点 **Create application**
3. **切到 `Pages` 页签**（关键，默认可能停在 Workers）
4. 选 **Import an existing Git repository**
5. 授权 GitHub，选 `HEYUZE-RAIN/order-of-the-sinking-star`
6. **Begin setup**，按下表填：

| 配置项 | 值 |
|---|---|
| Project name | `ootss-map`（随便，决定域名） |
| Production branch | `main` |
| Framework preset | **None** |
| **Build command** | **`node tools/build-public.js`** |
| **Build output directory** | **`public`** |
| Root directory | 留空 |

7. **Save and Deploy**

### 为什么要跑 build-public.js

输出目录若直接指向仓库根，`tools/`、`README.md`、`package.json` 也会被当成
静态资源公开（实测过：`https://<站点>/tools/build-maps.js` 能直接访问）。

`.assetsignore` **对 Pages 无效** —— 它只作用于 Workers 静态资源，Pages 构建不读取。

所以用 `tools/build-public.js` 把 `index.html` + `data/` + `assets/` 复制到 `public/`，
输出目录指向 `public/`，其余一概不发布。脚本还会检查图片是否齐全，并生成 `_headers`。

---

## 已做的准备

**`tools/build-public.js`**

构建命令本身。只复制 `index.html` + `data/` + `assets/` 到 `public/`，
并生成缓存头。已用脚本验证：必需文件全保留，脚本文档全排除。

**仓库里没有 `wrangler.toml`**

这个坑踩过一次，记录在此：Pages 构建时会读取仓库里的 `wrangler.toml`，
其中的 `pages_build_output_dir` **会覆盖控制台里填的 Build output directory**。

之前该字段是 `./dist`（直传用），而 `dist` 在 `.gitignore` 里、Git 构建时并不存在，
于是报 `Error: Output directory "dist" not found.`

现已删除该文件。直传改用 `tools/deploy-cf.js`（走 Cloudflare API，不依赖配置文件）。

**`package.json` 里没有 `deploy` 脚本**

原本有 `npm run deploy`，Workers 构建会把它识别成部署命令去执行。
现已改名为 `deploy:cf`，避免被自动调用。

---

## 构建后的检查

- 构建日志里应当**没有** `wrangler` 字样
- 应看到 `✓ public/ 就绪 · 底图 3 · 关卡图 920 · 40.1 MB`
- 构建后 `https://<站点>/README.md` 应当返回 **404**
- 打开 `https://<你的项目名>.pages.dev`，底图与 920 个点位都要正常显示

---

## 与旧项目的区别

| | 旧项目 `order-of-the-sinking-star` | 新项目（Git 集成） |
|---|---|---|
| 部署方式 | 直传（`npm run deploy:cf`） | 推送自动构建 |
| 需要令牌 | 是 | **否** |
| 域名 | order-of-the-sinking-star-389.pages.dev | 取决于项目名 |
| 当前版本 | v0.11.7（停止更新） | 首次构建后即为最新 |

旧项目不用删，留着当快照。

> Cloudflare 规定 Git 集成的项目**无法切回直传**。
> 所以 `tools/deploy-cf.js` 只对旧项目或将来新建的直传项目有效。

---

## 本地开发

不受影响：双击 `index.html`，或

```bash
python -m http.server 8000
```
