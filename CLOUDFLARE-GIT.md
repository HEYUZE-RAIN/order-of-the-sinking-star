# Cloudflare Pages 构建说明（Git 集成）

本项目已改为**由 Cloudflare 直接拉取 GitHub 仓库自动构建**，不再需要 API 令牌。

## 控制台配置（只需填这几个）

在 Cloudflare 控制台 → Workers & Pages → Create application → Pages → Connect to Git：

| 字段 | 填什么 |
|---|---|
| 项目名 | `ootss-map` （名字随你，会决定域名） |
| 生产分支 | `main` |
| Framework preset | **None** |
| Build command | 留空 |
| Build output directory | `/` |
| Root directory | 留空 |

`Build command` 留空是因为站点是纯静态、无需构建；
`Build output directory` 填 `/` 是因为 `index.html` 就在仓库根目录，资源也用相对路径。

## 为什么需要 .assetsignore

仓库根目录除了站点文件，还有 `tools/`、`README.md`、`DEPLOY.md`、`package.json` 等。
直接以根目录为输出，这些也会被当成静态资源发布上去（虽然不影响页面，但会暴露脚本与依赖）。

构建时 Cloudflare 会读取仓库根目录的 `.assetsignore`（语法同 `.gitignore`）来排除文件。
本文件同级已放好一份。

## 与旧项目的区别

| | 旧项目 `order-of-the-sinking-star` | 新项目（Git 集成） |
|---|---|---|
| 部署方式 | 直传（`tools/deploy-cf.js`） | 推送自动构建 |
| 需要令牌 | 是 | **否** |
| 域名 | order-of-the-sinking-star-389.pages.dev | 取决于项目名 |
| 当前版本 | v0.11.7（停止更新） | 首次构建后即为最新 |

旧项目不用删，留着当快照即可。确认新项目正常后再考虑清理。

## 若以后又想要直传

Git 集成的项目**不能切回直传**（Cloudflare 限制）。
真需要时可以禁用自动部署，再用 `npm run deploy` 推上去 —— 但那样又要令牌了。

## 本地开发

不受影响，照旧双击 `index.html` 或起个静态服务器即可。
