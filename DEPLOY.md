# 部署到 Cloudflare Pages

GitHub Pages 够用的情况下这是**可选**的第二份托管。用途：

- 国内访问通常比 `github.io` 快
- **无限带宽**（GitHub Pages 是 100GB/月软限）
- 两份托管互为备份，一边挂了另一边还在

全程免费，不需要信用卡。

---

## 一次性准备

### 1. 注册 Cloudflare

https://dash.cloudflare.com/sign-up

只需要邮箱 + 密码，不用绑卡、不用买域名。

### 2. 登录 CLI

在项目根目录：

```bash
npm install          # 装 wrangler
npx wrangler login   # 会打开浏览器，点 Allow 授权
```

---

## 部署

```bash
npm run deploy
```

这条命令做两件事：

1. `tools/pack-dist.js` 打包出 `dist/`（只含 `index.html` + `data/` + `assets/`，约 40MB，不含 git 历史和工具脚本）
2. `wrangler` 把 `dist/` 直传上去

首次会问你项目名，填：

```
order-of-the-sinking-star
```

部署完成会打印一个地址，形如：

```
https://order-of-the-sinking-star.pages.dev
```

**这个地址就是永久链接**，以后每次 `npm run deploy` 会更新它。

---

## 预览部署（不覆盖正式站）

```bash
npm run deploy:preview
```

会得到一个带随机前缀的预览地址。适合先看效果再决定要不要上线。

---

## 为什么是直传而不是关联 Git 仓库

Cloudflare 也能像 Vercel 那样「连你的 GitHub 仓库，push 自动部署」。这里没用那种方式，原因：

- 需要对 Cloudflare 授权读取你的 GitHub 私有数据
- 国内网络下 Cloudflare 拉取 GitHub 可能失败
- 直传更可控：**你什么时候推、推什么内容，完全由这条命令决定**

代价是每次改完要手动跑一次 `npm run deploy`。如果想自动化，可以在 GitHub 仓库加 Actions（需要把 Cloudflare 的 API Token 存到仓库 Secrets 里）。

---

## 注意事项

**wrangler.toml 里没有账号 ID**

`account_id` 留空。执行 `wrangler login` 后会自动使用当前账号，多人协作时才有必要写死。

**图片必须先在本地**

`assets/` 里的图不在 git 里（`assets/levels` 和 `assets/maps` 虽已入库，但如果你 clone 的是精简分支就要跑 `python tools/fetch-assets.py`）。
`pack-dist.js` 会检查：少于 920 张关卡图或缺底图时会警告。

**缓存策略**

`wrangler.toml` 里给 `/assets/*` 设置了 7 天强缓存。如果你替换了图片但文件名没变，访客可能看到的还是旧图——改图后建议给文件名加版本后缀，或者在 Cloudflare 后台 Purge Cache。

---

## 换到其他托管

`dist/` 是纯静态目录，任何静态托管都能用：

| 平台 | 免费额度 | 特点 |
|---|---|---|
| Cloudflare Pages | 无限带宽 | 国内相对快 |
| Netlify | 100GB/月 | 拖拽部署最省事 |
| Vercel | 100GB/月 | 与 Next.js 生态好 |
| 自建 nginx | — | 完全可控 |

换平台不需要改 `index.html` 任何一行。
