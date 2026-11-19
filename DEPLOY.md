# 部署到 Cloudflare Pages

GitHub Pages 够用的情况下这是**可选**的第二份托管。用途：

- 国内访问通常比 `github.io` 快
- **无限带宽**（GitHub Pages 是 100GB/月软限）
- 两份托管互为备份，一边挂了另一边还在

全程免费，不需要信用卡。

---

## 已上线地址

**https://order-of-the-sinking-star-389.pages.dev**

生产分支 `main`，当前部署 ID `89c4722b`。

---

## 一次性准备

### 1. 注册 Cloudflare

https://dash.cloudflare.com/sign-up

邮箱 + 密码即可，不绑卡。

### 2. 创建 API Token

https://dash.cloudflare.com/profile/api-tokens → **Create Custom Token**

| Type | 权限 | 级别 |
|---|---|---|
| Account | Cloudflare Pages | Edit |
| Account | Cloudflare Pages | Read |

Account Resources 选自己的账号。

### 3. 拿到 Account ID

后台首页右栏，或 https://dash.cloudflare.com/ 的 URL 里（32 位十六进制）。

### 4. 设环境变量

```bash
export CLOUDFLARE_API_TOKEN="你的 token"
export CLOUDFLARE_ACCOUNT_ID="你的 account id"
```

Windows CMD：

```cmd
set CLOUDFLARE_API_TOKEN=你的token
set CLOUDFLARE_ACCOUNT_ID=你的accountid
```

---

## 部署

```bash
npm run deploy
```

做两件事：

1. `tools/pack-dist.js` 打包 → `dist/`（929 文件 / 40MB，只含站点文件）
2. `tools/deploy-cf.js` 直连 Cloudflare API 上传

流程是：拿上传 JWT → `check-missing` 去重 → 分批上传 → `upsert-hashes` → 创建 deployment。
所以**再次部署只会传改动过的文件**，通常几秒钟完成。

---

## 为什么不用 wrangler

一开始用 `wrangler pages deploy`，遇到三个坑：

| 问题 | 表现 | 解决 |
|---|---|---|
| `account_id` 不支持 | Pages 配置校验报错 | 改走环境变量 |
| 单批 8MB 上传中断 | `fetch failed`，无有效信息 | 降到 2MB 分批 |
| manifest 传法错误 | `8000096 manifest field expected` | **必须是普通文本字段**，不能当文件传 |

最后一条最坑：`formData.append("manifest", JSON.stringify(manifest))`，
用 `Blob` 或 curl 的 `@file` 都报错，只有纯字符串才行。

另外本机网络对 `api.cloudflare.com` 是**间歇性阻断**（TLS 握手被掐），
`deploy-cf.js` 因此内置了指数退避重试。

---

## 注意事项

**wrangler 仍保留在 devDependencies**

`npm run login` 还能用来自查账号状态，但部署不走它。

**缓存**

`_headers` 给 `/assets/*` 设了 7 天缓存。换图但文件名不变时，访客可能看到旧图 ——
去 Cloudflare 后台 Purge Cache，或给文件名加版本号。

**图片必须先在本地**

`pack-dist.js` 会检查：少于 920 张关卡图或缺底图会警告。

**换到其他托管**

`dist/` 是纯静态目录。GitHub Pages 与 Cloudflare Pages 两份已同时在线，互为备份。
