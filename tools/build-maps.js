/**
 * 把三层地图坐标、官方区域标注写入 data/levels.js
 * 底图由 tiles/overworld_64k、sky_64k、underworld_64k 拼接，输出到 assets/maps/
 * 重新生成：node tools/build-maps.js
 *
 * 坐标系标定：以 3840×2160 官方地图截图与 zoom4 拼接图做特征匹配，
 * 得到世界坐标 → 6400×5600 底图的线性投影（误差 < 1 像素）。
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
global.window = {};
require(path.join(root, "data", "levels.js"));
const D = window.MAPDATA;

const W = 6400, H = 5600;
const S = 33.622;          // 像素 / 世界单位
const X0 = 830.6;          // 世界 x=0 的像素
const Y0 = 5340.0;         // 世界 y=0 的像素（y 向上）

const projX = x => +(X0 + S * x).toFixed(1);
const projY = y => +(Y0 - S * y).toFixed(1);

// 官方 region 配置的高度分界（见 joric/ootss index.html）
const layerOf = z => (z < -4 ? "under" : z > 10 ? "sky" : "ground");

// 地图上的官方区域标注（Area_Pin）。
// 中文一律取自游戏自带的简中本地化文件 data/strings/s-cn.localization，
// 键名为 markers 里的 local_area_name（如 area_s_towers），逐条对应、无一条意译。
// 若日后游戏更新，把新的 s-cn.localization 覆盖到 local/ 再重跑即可。
const LOCALIZATION = path.join(__dirname, "..", "local", "s-cn.localization");

function parseLocalization(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("`")) continue;
    const key = line.replace(/^`+/, "").trim();
    const vals = [];
    let j = i + 1;
    while (j < lines.length) {
      const s = lines[j].trim();
      if (s.startsWith("`")) break;
      if (s) vals.push(s);
      j++;
    }
    out[key] = vals.join("\n");
    i = j - 1;
  }
  return out;
}

const ZH = fs.existsSync(LOCALIZATION) ? parseLocalization(LOCALIZATION) : {};

const PIN_CN = {
  // ── 主世界 ──
  crossroads: "交汇之地", promise_3: "变形光束", mm: "光随镜转",
  skipping_stones: "飞石成径", stones_illuminated_3: "巨龙挤一挤",
  heroes_3: "英雄3：吟游诗人与德鲁伊", mirrors_and_light_south: "反射光束",
  heroes_and_artifacts: "英雄与神器", heroes_duplicated: "英雄，成双",
  heroes_and_mirrors: "英雄与魔镜", heroes_and_stones_west: "英雄与飞石：西部",
  antipode: "对映之地", heroes_together: "英雄齐聚", mirror_isles: "镜之群岛",
  heroes_and_light: "英雄与光", mirrors_and_light_north: "映照之光",
  extended_promise_south: "项环", exit: "出口",
  heroes_and_light_extended: "英雄与光：进阶", promise_extended_north: "推车与短杖",
  heroes_and_water_north: "英雄与水：北部", mirrorable_mirrors: "镜中之镜",
  heroes_initial: "搬运英雄", heroes_2: "英雄2：怪物",
  stones_illuminated: "光照之石", heroes_and_stones_east: "英雄与飞石：东部",
  promise_1: "光束发射器之库", heroes_and_water: "英雄与水",
  mirrors_and_stones: "魔镜与飞石",

  // ── 天空 ──
  towers: "坠落之镜", spinning_beams: "旋转光束", antipode_high: "对映之地：高处",
  mirrors_and_buttons: "魔镜与按钮", skipping_stacks: "堆叠与飞跃",
  top: "世界之巅", mines: "升降机", bard_stacks: "魅惑与堆叠",
  strength: "力量", mirror_way: "镜之路", highgrounds: "双倍光束坠落",
  startle_reflex: "转身的哥布林", beam_way: "光束之路",
  upper_crossroads: "交汇之地：高处", archways: "拱门",
  heroes_3d: "英雄与第三维度", skipping_way: "飞跃之路", stacks: "堆叠与水",
  heroes_way: "英雄之路", vertical_mirrors: "竖直之镜", porphyry: "竖直端点",
  mirror_rotation: "头顶一面镜", vertical_priestess: "防护与支撑",
  vertical_mirror_skipping: "竖直之镜与飞跃", falls: "飞跃与坠落",

  // ── 地下 ──
  zachtronics: "光束演算", river: "无尽飞跃", double_beams: "双倍光束",
  gems_as_obstacles: "宝石挡道", "3wc": "三者齐上阵", gem_beams: "宝石光束",
  exit_low: "出口：低处", beam_rotation_on_lilies: "睡莲上的旋转光束",
  antipode_low: "对映之地：低处", endpoint_skipping: "端点飞跃",
  monsters_through: "怪物穿行", "4wc": "四方共合力",
  skipping_misc_beams: "飞跃与各式光束", gate_opening: "开启界门",
  moving_flat_things: "扁平物件挪一挪", mirrors_and_rivers: "魔镜与河流",
  wrapping_wizard: "环绕法师", wrapping_mirrors: "环绕镜子",
  heterogeneous_stacks: "混合堆叠", mirrors_and_artifacts: "魔镜与神器",
  mirrors_as_obstacles: "魔镜挡道", partial_resets: "局部重置",
  bard_and_water: "吟游诗人与水", alter_smash: "变形与粉碎",
  crystal_carts: "水晶推车", endpoint_falling: "端点坠落",
  lemonade: "镜中之镜：集锦", crossroads_low: "交汇之地：低处",
};

const EN = JSON.parse(fs.readFileSync(path.join(__dirname, "raw", "en.json"), "utf8"));
const markers = JSON.parse(fs.readFileSync(path.join(__dirname, "raw", "markers.json"), "utf8"));

const pins = markers.features
  .filter(f => f.properties && f.properties.type === "Area_Pin")
  .map(f => {
    const raw = f.properties.local_area_name;       // area_s_towers
    const ly = { s: "sky", g: "ground", u: "under" }[raw.slice(5, 6)];
    const key = raw.replace(/^area_[sgu]_/, "");
    const x = f.properties.position.x, y = f.properties.position.y;
    return {
      k: key,
      ly,
      en: EN[raw] || key,
      cn: ZH[raw] || PIN_CN[key] || (EN[raw] || key),
      x, y,
      px: projX(x), py: projY(y),
      major: ["heroes_initial", "mirror_isles", "skipping_stones", "promise_1", "crossroads",
      "top", "heroes_3d", "mirror_way", "skipping_way",
      "crossroads_low", "zachtronics", "river", "4wc", "crystal_carts"].includes(key) ? 1 : 0,
    };
  })
  .sort((a, b) => a.ly.localeCompare(b.ly) || b.major - a.major || a.cn.localeCompare(b.cn));

const missing = pins.filter(p => !PIN_CN[p.k]).map(p => p.k);
if (missing.length) console.warn("缺少中文译名的区域：", missing.join(", "));

// 校验：内嵌表必须与游戏本地化文件完全一致，避免日后改字改出偏差
if (Object.keys(ZH).length) {
  const drift = [];
  for (const f of markers.features) {
    if (!f.properties || f.properties.type !== "Area_Pin") continue;
    const raw = f.properties.local_area_name;
    const key = raw.replace(/^area_[sgu]_/, "");
    if (!PIN_CN[key]) continue;
    if (ZH[raw] && ZH[raw] !== PIN_CN[key]) drift.push(`${key}: 表「${PIN_CN[key]}」≠ 官方「${ZH[raw]}」`);
  }
  if (drift.length) {
    console.error("区域译名与 s-cn.localization 不一致：\n  " + drift.join("\n  "));
    process.exitCode = 1;
  } else {
    console.log(`区域译名校验通过：${pins.length} 个标注全部与游戏简中原文一致`);
  }
} else {
  console.warn("未找到 local/s-cn.localization，使用内嵌译名表（可能与官方有出入）");
}

// 关卡：写入新投影与所属层
let cnt = { ground: 0, sky: 0, under: 0 };
D.levels = D.levels.map(l => {
  const ly = layerOf(l.z);
  cnt[ly]++;
  return { ...l, ly, px: projX(l.x), py: projY(l.y) };
});

// 关卡组中文名。游戏本地化里没有关卡组（.level_set）的专有条目，
// 所以这里沿用官方术语：mirror→魔镜、skip→飞跃、stone→飞石、endpoint→端点、
// alter→变形。「诺言」是 Promesst 的通行译法。
const AREA_CN_FIX = {
  heroes1: "搬运英雄",
  mirror: "镜之群岛",
  skipping_stones: "飞石成径",
  heroes3: "英雄3：吟游诗人与德鲁伊",
  promesst1_and_2: "诺言 1 与 2",
  promesst3: "诺言 3",
  vertical_promesst: "竖直诺言",
  sky_promesst_misc: "天空中的诺言杂项",
  orange_beam_highway_mirrors_and_promesst: "橙色光束通道：魔镜与诺言",
  orange_beam_highway_stones_and_promesst: "橙色光束通道：飞石与诺言",
  lily_highway_stones_and_promesst: "睡莲通道：飞石与诺言",
  lily_highway_mirrors_and_stones: "睡莲通道：魔镜与飞石",
  lily_highway_heroes_and_stones: "睡莲通道：英雄与飞石",
  underworld_mirrors_and_promesst: "地下魔镜与诺言",
  underworld_heroes_and_promesst: "地下英雄与诺言",
  underworld_skipping_and_promesst: "地下飞跃与诺言",
  underworld_heroes_and_mirrors: "地下英雄与魔镜",
  underworld_crossroads: "交汇之地：低处",
  zachtronics: "光束演算",
  goblin_rotation: "转身的哥布林",
  flat_things: "扁平物件",
  mirrorable_stones: "可镜像飞石",
  mirrors_and_stones: "魔镜与飞石",
  heroes_and_artifacts: "英雄与神器",
  heroes_and_mirrors: "英雄与魔镜",
  vertical_mirrors: "竖直之镜",
  vertical_reflection: "竖直反射",
  vertical_endpoint: "竖直端点",
  advanced_bard_and_water: "吟游诗人与水：进阶",
  elevators: "升降机",
  endgame1: "终局 1", endgame2: "终局 2", endgame3: "终局 3",
  beams_and_mirrors: "光束与魔镜",
  beaming_objects: "光束与物件",
  double_beam_falling: "双倍光束坠落",
  double_beam_falling_dropdown: "双倍光束坠落与落差",
};
Object.entries(AREA_CN_FIX).forEach(([k, v]) => { if (D.areas[k]) D.areas[k].cn = v; });

D.meta = {
  ...D.meta,
  w: W, h: H, img: "assets/maps/ground.jpg",
  maps: {
    ground: { cn: "主世界", en: "Overworld", img: "assets/maps/ground.jpg", n: cnt.ground },
    sky:    { cn: "天空",   en: "Sky",       img: "assets/maps/sky.jpg",    n: cnt.sky },
    under:  { cn: "地下",   en: "Underworld", img: "assets/maps/under.jpg",  n: cnt.under },
  },
};
D.pins = pins;

const out = `/* 由 tools/build-maps.js + tools/build-solutions.js 生成，请勿手改。
 * 坐标来自 joric/ootss，底图由游戏瓦片拼接，区域名来自游戏内 Area_Pin */\nwindow.MAPDATA = ${JSON.stringify(D)};\n`;
fs.writeFileSync(path.join(root, "data", "levels.js"), out);

console.log(`层：主世界 ${cnt.ground} · 天空 ${cnt.sky} · 地下 ${cnt.under}；区域标注 ${pins.length} 个`);
console.log("levels.js", (fs.statSync(path.join(root, "data", "levels.js")).size / 1024).toFixed(0) + "KB");
