/**
 * 合并英文词典 + 区域英文名 + 区域攻略英文，生成 data/i18n.js
 * 运行：node tools/build-i18n.js
 *
 * 会校验：
 *   - 58 个区域是否都有英文名
 *   - guides 是否覆盖所有区域、每条 tips 数量是否与原中文一致
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const ui = require('./i18n-ui.en.js');
const areas = require('./raw/areas.en.json');
// guides.js 里带注释，用 vm 跑一遍取结果，别用 JSON.parse
const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'data', 'guides.js'), 'utf8'), sandbox);
const zh = sandbox.window.GUIDES;

// 分批的英文攻略
const guides = Object.assign({},
  require('./i18n-guides-1.en.js'),
  require('./i18n-guides-2.en.js'),
  require('./i18n-guides-3.en.js'),
  require('./i18n-guides-4.en.js'),
  require('./i18n-guides-5.en.js')
);

// ── 校验 ──
const areaKeys = Object.keys(areas);
const zhKeys = Object.keys(zh);
const errs = [];
zhKeys.filter(k => !areas[k]).forEach(k => errs.push(`区域名缺失: ${k}`));
zhKeys.filter(k => !guides[k]).forEach(k => errs.push(`攻略缺失: ${k}`));
Object.keys(guides).filter(k => !zh[k]).forEach(k => errs.push(`攻略多余: ${k}`));
zhKeys.forEach(k => {
  const a = zh[k], b = guides[k];
  if (!b) return;
  if (!b.w) errs.push(`${k}: 缺 w`);
  if ((b.tips || []).length !== (a.tips || []).length)
    errs.push(`${k}: tips 数量 ${(b.tips || []).length} != ${(a.tips || []).length}`);
});
if (errs.length) {
  console.error('✗ 校验失败：\n  ' + errs.join('\n  '));
  process.exit(1);
}

const out = `/* 由 tools/build-i18n.js 生成，请勿手改。
   英文词典：UI 文案 + 区域名 + 区域攻略。语言存 localStorage 的 ootss-lang，首次访问跟随浏览器。 */
window.I18N = {
  "areas": ${JSON.stringify(areas, null, 2).replace(/\n/g, '\n  ')},
  "guides": ${JSON.stringify(guides, null, 2).replace(/\n/g, '\n  ')},
  "ui": ${JSON.stringify(ui, null, 2).replace(/\n/g, '\n  ')}
};
`;
fs.writeFileSync(path.join(root, 'data', 'i18n.js'), out);
const nTips = Object.values(guides).reduce((a, g) => a + (g.tips || []).length, 0);
console.log(`✓ 写出 data/i18n.js：${Object.keys(ui).length} 条 UI，${areaKeys.length} 个区域名，${Object.keys(guides).length} 篇攻略（${nTips} 条要点），${(out.length / 1024).toFixed(0)}KB`);
