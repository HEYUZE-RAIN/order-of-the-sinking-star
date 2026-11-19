#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建"外部攻略"数据：关卡 -> 图文攻略锚点 + 视频时间点。

视频时间点来源：sand.zzt.si —— B站作者 @落日晖华 制作的互动大地图，
视频 UP 主在简介里官方推荐。其 level_id 直接对应社区关卡名（joric/ootss），
每关带精确的 start/end 区间、分P 与不确定度，覆盖率 100%。
（比对：截图 dHash 只能对上 84%，且会误配，故以该数据为准。）

图文锚点来源：sinkingstarwalkthrough.com 的题目锚点，靠关卡截图 dHash 比对对应。

输入：tools/raw/sand.json、tools/raw/walkthrough/*.html、tools/raw/wtimg/
产物：data/walkthrough.js   window.WT[关卡名] = {...}
运行：python tools/build-walkthrough.py
"""
import re, os, json, glob
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, 'tools', 'raw', 'walkthrough')
WTIMG = os.path.join(ROOT, 'tools', 'raw', 'wtimg')
LOCAL = os.path.join(ROOT, 'assets', 'levels')
SAND = os.path.join(ROOT, 'tools', 'raw', 'sand.json')
OUT = os.path.join(ROOT, 'data', 'walkthrough.js')
SITE = 'https://sinkingstarwalkthrough.com/zh/'
THRESH = 46


def dhash(im, s=16):
    im = im.convert('L').resize((s + 1, s), Image.LANCZOS)
    a = np.asarray(im, dtype=np.int16)
    return (a[:, 1:] > a[:, :-1]).flatten()


def hex_to_bits(h, s=16):
    """把 _hashes.json 里的 64 位 hex 还原成 0/1 数组，和 dhash() 的输出可直接比。"""
    v = int(h, 16)
    n = s * s
    return np.array([(v >> (n - 1 - i)) & 1 for i in range(n)], dtype=np.int8)


def load_sand():
    """视频片段：level_id -> [{p,t,end,unc}]"""
    d = json.load(open(SAND, encoding='utf-8'))
    parts = {}
    for p in d.get('parts', []):
        # display_part 才是 B 站上显示的分P号（投稿后补传会错位）
        parts[str(p.get('display_part') or p.get('part'))] = {
            'title': p.get('title') or '', 'dur': p.get('duration') or 0}
    out = {}
    for lv in d.get('levels', []):
        key = lv.get('level_id') or lv.get('save_level_id')
        if not key:
            continue
        visits = []
        for v in lv.get('visits', []):
            if v.get('start') is None:
                continue
            visits.append({
                'p': v.get('display_part') or v.get('part'),
                't': round(float(v['start']), 1),
                'end': round(float(v['end']), 1) if v.get('end') is not None else None,
                'unc': v.get('uncertainty'),
            })
        if visits:
            visits.sort(key=lambda x: x['t'])
            out[key] = visits
    return out, parts, d.get('bvid') or 'BV13FH96bE4m'


def parse_page(html):
    heads = [(m.start(), m.group(1), re.sub(r'<[^>]+>', '', m.group(2)).strip())
             for m in re.finditer(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', html, re.S)]
    mstart, mend = html.find('id="main"'), html.find('id="faq"')
    lo = mstart if mstart >= 0 else 0
    hi = mend if mend > lo else len(html)
    heads = [h for h in heads if lo <= h[0] < hi]
    blocks = []
    for i, (pos, anchor, title) in enumerate(heads):
        end = heads[i + 1][0] if i + 1 < len(heads) else pos + 20000
        body = html[pos:end]
        img = re.search(r'<img src="(/img/(?:[a-z0-9-]+/)*(?:puzzle-\d+|(?:hx|mx|sx)[bms]?-\d+)\.webp)"', body)
        blocks.append({'anchor': anchor, 'title': title,
                       'img': img.group(1) if img else None})
    return blocks


def build_article(names):
    """截图 -> 关卡。优先用 _hashes.json（只有指纹，约 130KB）；
    没有缓存时才回退到读 41MB 原图。"""
    man_path = os.path.join(WTIMG, '_manifest.json')
    hash_path = os.path.join(WTIMG, '_hashes.json')
    if not os.path.exists(man_path) and not os.path.exists(hash_path):
        print('⚠ 缺少数码表，跳过图文锚点（只输出视频）')
        return {}
    local = {}
    for n in names:
        p = os.path.join(LOCAL, n + '.jpg')
        if os.path.exists(p):
            try:
                local[n] = dhash(Image.open(p))
            except Exception:
                pass
    hashes = {}
    if os.path.exists(hash_path):
        raw = json.load(open(hash_path, encoding='utf-8'))
        for url, hx in raw.items():
            hashes[url] = hex_to_bits(hx)
        print(f'  用指纹缓存 {len(hashes)} 条（无需原图）')
    else:
        manifest = json.load(open(man_path, encoding='utf-8'))
        for url, fn in manifest.items():
            p = os.path.join(WTIMG, fn)
            if os.path.exists(p):
                try:
                    hashes[url] = dhash(Image.open(p))
                except Exception:
                    pass
        print(f'  现算指纹 {len(hashes)} 条（读原图）')
    result = {}
    for f in sorted(glob.glob(os.path.join(PAGES, '*.html'))):
        page = os.path.basename(f)[:-5]
        for b in parse_page(open(f, encoding='utf-8', errors='ignore').read()):
            if not b['img'] or b['img'] not in hashes or not b['anchor']:
                continue
            h = hashes[b['img']]
            best, bd = None, 10 ** 6
            for n, lh in local.items():
                d = int((h != lh).sum())
                if d < bd:
                    bd, best = d, n
            if bd <= THRESH and best not in result:
                result[best] = {'page': page, 'hash': b['anchor'], 'label': b['title'], 'd': bd}
    return result


def main():
    import subprocess
    levels = json.loads(subprocess.check_output(
        ['node', '-e', 'global.window={};eval(require("fs").readFileSync("data/levels.js","utf8"));'
                        'console.log(JSON.stringify(window.MAPDATA.levels.map(l=>l.n)))'],
        cwd=ROOT).decode())
    names = levels

    sand, parts, bvid = load_sand()
    print(f'视频映射 {len(sand)} 关，分P {len(parts)} 个')
    art = build_article(names)
    print(f'图文锚点 {len(art)} 关（截图比对）')

    result = {}
    for n in names:
        v, g = sand.get(n), art.get(n)
        if not v and not g:
            continue
        item = {}
        if g:
            item['page'], item['hash'], item['label'] = g['page'], g['hash'], g['label']
        if v:
            item['v'] = v
        result[n] = item

    both = sum(1 for x in result.values() if 'v' in x and 'page' in x)
    meta = {'site': SITE, 'bvid': bvid, 'parts': parts,
            'total': len(result), 'both': both}

    js = ('/* 由 tools/build-walkthrough.py 生成，请勿手改。\n'
          '   视频时间点：sand.zzt.si（B站 @落日晖华 的互动大地图，UP 主在简介推荐），\n'
          '               level_id 直接对应社区关卡名，start/end 为精确区间，覆盖全部关卡。\n'
          '   图文锚点：sinkingstarwalkthrough.com，靠关卡截图 dHash 比对对应（阈值 %d）。\n'
          '   WT[n] = { page,hash,label } 图文 ｜ { v:[{p,t,end,unc}] } 视频片段\n'
          '   重新生成：python tools/build-walkthrough.py */\n' % THRESH)
    js += 'window.WT = ' + json.dumps(result, ensure_ascii=False, sort_keys=True) + ';\n'
    js += 'window.WT_META = ' + json.dumps(meta, ensure_ascii=False) + ';\n'
    open(OUT, 'w', encoding='utf-8').write(js)

    print(f'总覆盖 {len(result)}/920 ｜ 图文+视频 {both}')
    print(f'写出 {OUT} {os.path.getsize(OUT)/1024:.0f}KB')


if __name__ == '__main__':
    main()
