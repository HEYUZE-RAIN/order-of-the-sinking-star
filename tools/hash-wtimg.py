#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把攻略站截图压成 dHash 指纹，生成 tools/raw/wtimg/_hashes.json。
之后 build-walkthrough.py 只读这份指纹，不再需要 41MB 原图，可以直接删掉 wtimg/*.webp。

指纹内容：{ 图片URL: 64 位 hex }（16x16 = 256 bit）
本地棋盘的指纹每次现算（图在 assets/levels 里，本来就要留着）。

运行：python tools/hash-wtimg.py
"""
import json, os, sys
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WTIMG = os.path.join(ROOT, 'tools', 'raw', 'wtimg')
OUT = os.path.join(WTIMG, '_hashes.json')
SIZE = 16


def dhash(im, s=SIZE):
    im = im.convert('L').resize((s + 1, s), Image.LANCZOS)
    a = np.asarray(im, dtype=np.int16)
    bits = (a[:, 1:] > a[:, :-1]).flatten()
    # 256 bit -> 64 hex
    v = 0
    for b in bits:
        v = (v << 1) | int(b)
    return format(v, '064x')


def main():
    man_path = os.path.join(WTIMG, '_manifest.json')
    if not os.path.exists(man_path):
        print('缺少 _manifest.json，先跑 node tools/fetch-wtimg.js'); sys.exit(1)
    manifest = json.load(open(man_path, encoding='utf-8'))
    out, miss = {}, 0
    for url, fn in manifest.items():
        p = os.path.join(WTIMG, fn)
        if not os.path.exists(p):
            miss += 1
            continue
        try:
            out[url] = dhash(Image.open(p))
        except Exception:
            miss += 1
    json.dump(out, open(OUT, 'w', encoding='utf-8'), separators=(',', ':'))
    print(f'指纹 {len(out)} 条，跳过 {miss} 条，{os.path.getsize(OUT)/1024:.0f} KB -> {OUT}')


if __name__ == '__main__':
    main()
