# Order of the Sinking Star — Interactive Map

《沉星之序》（**Order of the Sinking Star**）的**全关卡交互地图**：920 个关卡位置、每关的棋盘截图与逐步走法、区域攻略、通关进度追踪，中英双语。

An interactive full-level map for **Order of the Sinking Star**: 920 level positions, per-level boards and step-by-step routes, area notes, progress tracking. Chinese and English.

> 非官方玩家工具 / Unofficial fan project. 与 Thekla, Inc. 无隶属关系。

---

## 功能 / Features

- **920 关全覆盖** — 三层大地图（主世界 / 天空 / 地下），按坐标精确定位
- **逐步走法** — 社区逐格复演校准的解法串，含主解与备用解；动作键按当前平台显示真实按键（PC / Xbox / PlayStation / Switch 一键切换）
- **停顿分级** — 区分「等一拍」与「必须等满 N 拍」，拿放后的长停顿单独提示
- **长关分阶段** — 超过 90 步自动切段，段首标出步数范围
- **区域攻略** — 58 个区域，每处一段机制说明 + 实战要点
- **外部攻略** — 定位到具体题目（图文）、精确到分P与秒数（B站）、YouTube 搜索
- **进度追踪** — 逐关标记，支持整组 / 整层批量操作，数据只存本地
- **中英双语** — 右上角切换，首次访问跟随浏览器语言

---

## 快速开始 / Getting started

这是一个**纯静态单页**，没有构建步骤，也不需要后端。

```bash
git clone <this-repo>
cd order-of-the-sinking-star

# 补齐图片资源（必做，见下方说明）
python tools/fetch-assets.py

# 用浏览器打开
# 直接双击 index.html 即可
```

> ⚠️ 仓库**不包含**图片资源。不跑 `fetch-assets.py` 的话，地图和棋盘会是空白。

---

## 为什么仓库里没有图片 / Why no images

`assets/levels/`（920 张关卡棋盘截图）和 `assets/maps/`（三层大地图底图）都是**游戏画面，版权归 Thekla, Inc.**，不适合放进开源仓库。

它们都能从上游公开地址拉取：

```bash
python tools/fetch-assets.py          # 补齐缺失
python tools/fetch-assets.py --force  # 全部重下
```

脚本会自动把 2048×1152 的原图缩放成页面用的 560×315 缩略图（约 28KB/张）。

---

## 重建数据 / Rebuilding data

`data/` 下的文件是**生成物**，源头是社区开源项目 [joric/ootss](https://github.com/joric/ootss)。

```bash
python tools/fetch-data.py                  # 拉原始数据 → tools/raw/
node tools/build-maps.js                    # 坐标与区域名 → data/levels.js
node tools/build-solutions.js               # 解法与视频链接 → data/levels.js
node tools/build-i18n.js                    # 英文词典与区域名 → data/i18n.js
```

外部攻略锚点（可选，需要联网抓取并做截图比对）：

```bash
node tools/fetch-walkthrough.js
node tools/fetch-wtimg.js
python tools/hash-wtimg.py
python tools/build-walkthrough.py
```

检查坐标数据是否落后于上游：

```bash
python tools/check-upstream.py
```

---

## 项目结构 / Layout

```
index.html              单页应用（HTML + CSS + JS 全在这一个文件里）
data/
  levels.js             关卡坐标、区域名、解法（生成物）
  guides.js             58 个区域的攻略正文
  walkthrough.js        外部攻略锚点（生成物）
  i18n.js               英文词典 + 区域英文名（生成物）
assets/
  maps/                 三层底图（不进仓库）
  levels/               920 张关卡棋盘（不进仓库）
local/                  游戏本地化文本（不进仓库）
tools/
  fetch-assets.py       拉图片资源
  fetch-data.py         拉上游原始数据
  build-*.js / *.py     构建脚本
  i18n-*.js             英文词典源文件
```

---

## 数据来源 / Credits

| 内容 | 来源 |
|---|---|
| 关卡坐标、解法、区域标注 | [joric/ootss](https://github.com/joric/ootss)（**Unlicense** 公有领域） |
| 大地图瓦片、关卡截图 | [joric/ootss_tileset](https://github.com/joric/ootss_tileset) |
| B站视频时间点 | [OotSS_Sand](https://github.com/Jimmyzzt/OotSS_Sand) by @Jimmyzzt（B站 @落日晖华） |
| 图文攻略锚点 | [sinkingstarwalkthrough.com](https://sinkingstarwalkthrough.com/) |
| 区域名与动作名 | 游戏内置本地化文本 |

**游戏内容版权归 Thekla, Inc. 所有。** 本仓库的代码以 MIT 许可发布，但**不包含**任何游戏素材的授权——地名、截图、音乐等仍属原权利人。

---

## AI 参与说明 / AI disclosure

本项目的**代码与文案主要由 AI 辅助生成**，期间由人工提出需求、审阅与纠错。

事实类内容（坐标、解法、区域名、按键）均锚定数据源并做了机器校验：

- 82 个区域名与游戏本地化文本逐字比对，构建时不一致即报错退出
- 英文区域名取自游戏官方解锁文本
- 叙述类内容（机制解释、难度判断、区域攻略）由 AI 根据解法分布推断，**可能存在偏差**

发现问题欢迎提 issue。

---

## 许可 / License

代码：[MIT](LICENSE)

游戏内容（《Order of the Sinking Star》的名称、地名、截图、术语等）© Thekla, Inc.，本仓库仅出于介绍与玩家检索目的作有限引用。
