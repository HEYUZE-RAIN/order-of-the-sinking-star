/**
 * 英文界面词典。key -> 英文。
 * 生成：node tools/build-i18n.js（会把这份 + areas.en.json 合并成 data/i18n.js）
 *
 * 约定：
 *   - 占位符写成 {name}，和中文里的 ${...} 一一对应
 *   - 术语跟游戏英文版：Activate / CharacterSwitch / TakeOrDrop / FriendlyDragon
 *   - 不译的东西：关卡英文名（本来就英文）、键位字母、BV 号
 */
module.exports = {
  // ── 顶栏 ──
  "brand.sub": "Order of the Sinking Star · Interactive Map",
  "layer.ground": "Overworld",
  "layer.sky": "Sky",
  "layer.under": "Under",
  "search.placeholder": "Search levels…",
  "btn.about": "Guide",
  "btn.about.tip": "Names & controls",
  "btn.colophon": "About",
  "btn.colophon.tip": "Sources & changelog",
  "btn.fit": "Reset",
  "btn.fit.tip": "Reset view",
  "btn.close": "Close",
  "btn.done": "Mark as cleared",
  "lang.tip": "Switch language (中文)",

  // ── 图例 ──
  "legend.hub": "Hub",
  "legend.north": "North",
  "legend.east": "East",
  "legend.south": "South",
  "legend.west": "West",
  "legend.hybrid": "Hybrid",
  "legend.3d": "3D",
  "legend.end": "Endgame",

  // ── 底图 / 放大 ──
  "map.alt": "Order of the Sinking Star overworld map",
  "lb.alt": "Enlarged level board",
  "mapname": "Order of the Sinking Star {layer} map",

  // ── 索引 ──
  "index.title": "Level index",
  "index.sum": "Grouped by area · current map layer only",
  "index.markLayer": "Mark this whole layer as cleared",
  "index.clear": "Clear all records",
  "index.showAll": "Show all",
  "index.summary": "{areas} areas · {done}/{total} cleared",
  "index.empty": "No level data for this layer",
  "index.nomatch": "No matching levels",
  "index.toggleGroup": "Expand / collapse this area's levels",
  "index.expandGroup": "Expand level list",
  "index.onlyThis": "Show only “{area}” on the map",
  "idx.tip": "Collapse index (←)",
  "idx.aria": "Collapse level index",
  "idx.collapse": "Collapse index (←)",
  "idx.expand": "Expand index (→)",
  "idx.collapseAria": "Collapse level index",
  "idx.expandAria": "Expand level index",

  // ── 确认框 ──
  "confirm.unmarkLayer": "All {n} levels in “{layer}” are marked. Remove every mark in this layer?",
  "confirm.markLayer": "Mark all {left} uncleared levels in “{layer}”?\n({total} levels in this layer, {done} already marked)",
  "confirm.clearAll": "Clear all {n} cleared records? This cannot be undone.",
  "mark.groupAll": "Mark this whole group as cleared",
  "mark.groupNone": "Clear this group's marks",

  // ── 区域组标题 ──
  "grp.hub": "Hub",
  "grp.north": "North · Heroes of Hauling",
  "grp.east": "East · The Mirror Isles",
  "grp.south": "South · Skipping Stones",
  "grp.west": "West · Vault of the Beamcasters",
  "grp.gold": "Gold Rooms · Hybrid",
  "grp.3d": "3D areas",
  "grp.end": "Endgame",

  // ── 平台 ──
  "plat.pc": "PC keyboard",
  "plat.xbox": "Xbox",
  "plat.ps": "PlayStation",
  "plat.sw": "Switch",
  "plat.stick": "Left stick",

  // ── 动作 ──
  "act.X": "Activate",
  "act.C": "Switch",
  "act.V": "Take/Drop",
  "act.F": "Dragon",
  "act.X.short": "Activate",
  "act.C.short": "Switch",
  "act.V.short": "Take",
  "act.F.short": "Dragon",
  "act.wait": "Wait a beat",
  "act.tip": "Action",
  "act.tip.instant": "Instant",
  "act.tip.timed": "Timed",
  "act.tip.few": "Few pauses",
  "act.tip.some": "Has pauses",
  "act.waitOne": "Wait one beat for the animation to finish (a marker in recordings, not a key)",

  // ── 英雄职业 ──
  "hero.1": "Warrior",
  "hero.2": "Thief",
  "hero.3": "Wizard",
  "hero.4": "Priest",
  "hero.5": "Bard",
  "hero.6": "Druid",
  "hero.7": "Merchant",
  "hero.current": "Current hero",
  "hero.num": "{n}",
  "hero.byNum": "Press {n} · {name}",
  "hero.byCycle": "{key} until · {name}",
  "hero.switchTo": "Switch to “{name}” · {plat} {key}",
  "hero.switchNext": "Switch to next hero",
  "hero.orNumber": "or pick by number",
  "hero.onlySwitch": "Switch only, no movement",
  "hero.numTip": "Digits pick a hero directly",
  "hero.rotation": "{n} hero switches, in order from top to bottom (scrolls)",
  "hero.rotationShort": "{n} hero switches",

  // ── 停顿 / 节奏 ──
  "pace.longAfterV": "After a Take/Drop, wait the full {n} beats (~{sec}s) for the object to settle. Pressing early fails.",
  "pace.long": "Wait the full {n} beats (~{sec}s) before continuing; don't press anything in between.",
  "pace.longHint": "{n} long pause(s) (max {beats} beats)",
  "pace.shortHint": "{short} short pause(s)",
  "pace.instantDetail": "Timing is tight — pauses are dense, stay on the beat",
  "pace.timedDetail": "Wait for it to settle after Take/Drop, don't rush",
  "pace.fewDetail": "comfortable rhythm",
  "pace.someDetail": "{short} short pause(s) — wait a beat after pressing",
  "pace.longN": "{n} long pause(s) (max {beats} beats)",

  // ── 走法统计 ──
  "sol.steps": "{n} steps",
  "sol.moved": "{n} tiles moved",
  "sol.segs": "{n} segments",
  "sol.activate": "{n} Activate",
  "sol.other": "{n} other actions",
  "sol.dragon": "{n} Dragon",
  "sol.shortWaits": "{short} short waits",
  "sol.stages": "{n} stages",
  "sol.rank": "shortest of {n} in this area",
  "sol.rawShow": "Show raw string",
  "sol.rawHide": "Hide raw string",
  "sol.copied": "Copied ✓",
  "sol.alt": "Alternative solution ({n} steps, different route)",
  "sol.none": "No public step-by-step solution for this level yet. Try the area notes below, or jump to the full area guide.",

  // ── 分段 ──
  "stage.head": "Stage {i}",
  "stage.range": "steps {from}–{to}",
  "stage.count": "{n} steps",

  // ── 面板 ──
  "panel.board": "Level board",
  "panel.boardNote": "Community-captured layout. Click to enlarge — check the opening terrain against your version.",
  "panel.area": "{area} · how to play",
  "panel.tips": "Field notes",
  "panel.walk": "Step-by-step",
  "panel.walkNote": "← → ↑ ↓ are movement directions. Action keys are written as <b>current platform key + action</b> — e.g. PC <b>V</b> Take/Drop, Xbox <b>A</b>, PS <b>✕</b>. Switch platforms above and the keys update. Numbers are repeat counts.",
  "panel.walkNote2": "<b>Two kinds of pause:</b> a grey dot <b>·</b> means wait one beat for the animation (roughly forgiving); an amber <b>Wait N</b> means <b>wait the full N beats</b> (1 beat ≈ 0.25s) before the next key — especially the 4 beats after a Take/Drop, wait for the object to settle. Keys in the wrong beat fail. “Switch hero” gets its own line: press the switch key shown there first.",
  "panel.walkNote3": "<b>Heroes are labelled by class:</b> each segment starts with who acts. <b>PC shows “Press 6 · Druid”</b> — digits pick directly; mapping: <b>1 Warrior, 2 Thief, 3 Wizard, 4 Priest, 5 Bard, 6 Druid, 7 Merchant</b>. <b>Consoles show “B until · Druid”</b> (A on Switch, ○ on PS) — no digit keys, so cycle with the switch key.",
  "panel.walkNote4": "<b>Long levels are staged:</b> anything over 90 steps is split into stages (usually right after a “Wait N” or on an Activate/Dragon), at most 70 steps each. The stage header shows “Stage N / steps a–b” so you always know where you are.",
  "panel.walkNote5": "Step counts are calibrated by community replay; follow them and you'll clear the level. Stuck midway? Try the alternative route or the video — version differences can break old routes.",
  "panel.done": "Cleared",
  "panel.undo": "Cleared (click to undo)",
  "panel.notDone": "Not recorded",
  "panel.meta": "#{id} · coords {x}, {y}{z}",
  "panel.height": " · height {z}",
  "panel.close": "Close",
  "panel.prev": "Previous level",
  "panel.next": "Next level",

  // ── 外部攻略 ──
  "guide.title": "External guides",
  "guide.article": "Walkthrough (step by step)",
  "guide.article.sub": "{label} · jumps to this puzzle",
  "guide.bili": "Bilibili commentary",
  "guide.biliPart": "Part {i}",
  "guide.partTitle": "{title}",
  "guide.part": "P{p} · {t}",
  "guide.dur": "~{d}",
  "guide.rough": "position approximate",
  "guide.noVideo": "No matching video segment for this level.",
  "guide.yt": "YouTube {what}",
  "guide.yt.this": "video",
  "guide.yt.search": "search",
  "guide.yt.rec": "Community recording",
  "guide.yt.byName": "Search by level name",
  "guide.more": "More",
  "guide.player": "Community player auto-demo",
  "guide.site": "Walkthrough home",

  "credit.disc": "Disclaimer & AI note",

  // ── 说明页 ──
  "about.title": "Names & controls",
  "colophon.title": "Sources & changelog",
};
