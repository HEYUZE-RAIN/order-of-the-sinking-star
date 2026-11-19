#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
补齐本站需要的图片资源（不进仓库，属游戏版权内容）：

  assets/levels/*.jpg   920 张关卡棋盘截图
  assets/maps/*.jpg     三层大地图底图

上游把原图放在 joric/ootss_tileset（与数据源 joric/ootss 同一作者）：
  images/levels/<关卡名>.webp   2048×1152
  images/ground.jpg / sky.jpg / under.jpg

本站前端引用的是 560×315 的缩略图，脚本会一并缩放压缩，
避免直接把 2048 宽的原图塞进页面（体积会大 3 倍以上）。

用法：
  python tools/fetch-assets.py            补齐缺失
  python tools/fetch-assets.py --force    全部重下
"""
import io
import json
import os
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

try:
    from PIL import Image
except ImportError:
    print('需要 Pillow：pip install pillow')
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEVELS = os.path.join(ROOT, 'assets', 'levels')
MAPS = os.path.join(ROOT, 'assets', 'maps')
BASE = 'https://joric.github.io/ootss_tileset/images'
MAP_NAMES = ['ground', 'sky', 'under']

THUMB_W = 560        # 前端棋盘缩略图宽度
JPEG_Q = 75          # 与仓库内既有文件一致
FORCE = '--force' in sys.argv
UA = {'User-Agent': 'ootss-map-assets/1.0'}


def get(url, timeout=45):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def level_names():
    """从 data/levels.js 取真正的关卡名。数据是单行 JSON，剥掉前缀直接解析，
    不要用正则 —— areas 里也有 "n" 字段，正则会把区域名当成关卡名。"""
    txt = open(os.path.join(ROOT, 'data', 'levels.js'), encoding='utf-8').read()
    i = txt.index('window.MAPDATA')
    obj = json.loads(txt[txt.index('{', i):].rstrip().rstrip(';'))
    # 只要前端真正引用的（有棋盘 i 字段）
    return list(dict.fromkeys(l['n'] for l in obj['levels'] if l.get('i')))


def save_thumb(data, dest, width=THUMB_W):
    """原图缩放 + 转 jpg，控制在仓库既有文件的体积水平。"""
    im = Image.open(io.BytesIO(data)).convert('RGB')
    h = round(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    im.save(dest, 'JPEG', quality=JPEG_Q, optimize=True, progressive=True)


def one_level(name):
    dest = os.path.join(LEVELS, name + '.jpg')
    if not FORCE and os.path.exists(dest) and os.path.getsize(dest) > 4096:
        return 'skip'
    data = get(f'{BASE}/levels/{name}.webp')
    if len(data) < 2048:
        raise ValueError(f'文件过小 {len(data)}B')
    save_thumb(data, dest)
    return 'ok'


def main():
    os.makedirs(LEVELS, exist_ok=True)
    os.makedirs(MAPS, exist_ok=True)

    names = level_names()
    if not names:
        print('✗ 没能从 data/levels.js 解析到关卡名')
        sys.exit(1)

    print(f'关卡截图 {len(names)} 张 → assets/levels/')
    ok = skip = 0
    fails = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(one_level, n): n for n in names}
        for i, f in enumerate(futs, 1):
            n = futs[f]
            try:
                r = f.result()
                if r == 'ok':
                    ok += 1
                else:
                    skip += 1
            except Exception as e:
                fails.append((n, str(e)[:60]))
            if i % 50 == 0:
                print(f'  {i}/{len(names)}', end='\r')
    print(f'  新下载 {ok}，已存在 {skip}，失败 {len(fails)}')

    print('大地图底图 3 张 → assets/maps/')
    for m in MAP_NAMES:
        dest = os.path.join(MAPS, m + '.jpg')
        if not FORCE and os.path.exists(dest) and os.path.getsize(dest) > 65536:
            print(f'  {m}.jpg 已存在，跳过')
            continue
        try:
            data = get(f'{BASE}/{m}.jpg', timeout=120)
            # 底图前端按原尺寸显示，不缩放
            open(dest, 'wb').write(data)
            print(f'  {m}.jpg  {len(data) / 1024 / 1024:.1f} MB')
        except Exception as e:
            print(f'  ✗ {m}.jpg  {e}')

    if fails:
        print('\n失败的关卡图（重跑本脚本会跳过已下好的）：')
        for n, e in fails[:12]:
            print(f'  {n}: {e}')
        if len(fails) > 12:
            print(f'  … 另有 {len(fails) - 12} 个')
        sys.exit(1)
    print('\n✓ 资源齐备，直接用浏览器打开 index.html')


if __name__ == '__main__':
    main()
