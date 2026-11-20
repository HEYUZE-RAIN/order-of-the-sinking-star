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
| **Build command** | **`exit 0`** |
| **Build output directory** | **`/`** |
| Root directory | 留空 |

7. **Save and Deploy**

### 为什么 Build command 是 `exit 0` 而不是留空

官方对纯静态站的说明：`exit 0` 表示「没有构建步骤，直接成功」。
留空在某些版本的界面上会让构建流程拿不到命令、回退到默认的 `wrangler deploy`，
正是上面那个报错的来源。填 `exit 0` 是明确、无歧义的选择。

### 为什么输出目录是 `/`

`index.html` 就在仓库根目录，资源全用相对路径，根目录即站点根。
（之前写的 `./dist` 是直传用的，Git 构建时 `dist` 根本不存在，因为它在 `.gitignore` 里。）

---

## 已做的准备

**`.assetsignore`**

构建时排除 `tools/`、`README.md`、`package.json` 等，只发布
`index.html` + `data/` + `assets/`。
已用脚本验证：必需文件全部保留，脚本文档全部排除。

**`package.json` 里没有 `deploy` 脚本**

原本有 `npm run deploy`，Workers 构建会把它识别成部署命令去执行。
现已改名为 `deploy:cf`，避免被自动调用。

---

## 构建后的检查

- 构建日志里应当**没有** `wrangler` 字样
- 日志应显示上传了约 928 个文件
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
