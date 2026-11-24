#!/usr/bin/env python3
"""
把 6400x5600 的整张底图切成 256px 瓦片，供 Leaflet 分块加载。

为什么这么做：原先每层要一次性下载 ~5MB 的整图，且缩放时是整张位图重绘，
两者都很重。切成瓦片后首屏只需十几张小图，缩放时按需取用。

输出结构（Leaflet 的 CRS.Simple 惯例，z0 一块覆盖整图）：
  assets/tiles/<layer>/0/0_0.jpg        1600x1400 的缩略图（首屏用）
  assets/tiles/<layer>/1/x_y.jpg        每块覆盖 3200x2800 源像素
  ...
  assets/tiles/<layer>/<zmax>/x_y.jpg   最细一级

用法：
  python tools/make-tiles.py              # 生成三张底图
  python tools/make-tiles.py --layer ground   # 只做一层
"""
import os
import sys
import io
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPS_DIR = os.path.join(ROOT, "assets", "maps")
OUT_DIR = os.path.join(ROOT, "assets", "tiles")

LAYERS = {
    "ground": "ground.jpg",
    "sky": "sky.jpg",
    "under": "under.jpg",
}

TILE = 256          # 输出瓦片边长
# 层级与显示倍率的对应（见 index.html 的 CRS 定义）：
#   z 级时整图显示为 6400 * (256/6400) * 2^z = 256 * 2^z px
#   z0=256  z1=512  z2=1024  z3=2048  z4=4096  z5=8192
# z5 时整图 8192px，略大于源图 6400px，是 1:1 附近的最佳层级，
# 再往上不会有更多细节（源图就那么大），所以停在 5。
ZMAX = 5
QUALITY = 80        # JPEG 质量，兼顾体积与观感
MAP_BG = (13, 18, 32)   # 与页面背景 #0d1220 一致，超出边界的部分用它填
THUMB_SIZE = 1024   # z0 缩略图边长。首屏必加载，压到 ~150KB 让进入页面几乎是瞬间


def tiles_for(z, W, H):
    """返回该 zoom 下的 (cols, rows)。

    必须是正方形网格 n x n（n = 2^z）。Leaflet 按 tileSize 等分整个视野，
    若这里按图片宽高比缩减行数（比如 16x14），瓦片拼出来的整体高度
    就和 Leaflet 算的不一致，标点与底图会整体错位 —— 缩得越小越明显。
    每块覆盖的区域也不必是正方形，按 W/n、H/n 各自等分即可。
    """
    n = 2 ** z
    return n, n


def make_layer(layer, filename):
    src_path = os.path.join(MAPS_DIR, filename)
    if not os.path.exists(src_path):
        print(f"  跳过 {layer}：找不到 {src_path}")
        return 0

    img = Image.open(src_path).convert("RGB")
    W, H = img.size
    out_root = os.path.join(OUT_DIR, layer)
    total = 0
    total_bytes = 0

    for z in range(0, ZMAX + 1):
        cols, rows = tiles_for(z, W, H)
        # 每块必须是「正方形」源区域：Leaflet 认为一个瓦片覆盖等宽等高的世界方形，
        # 若按 W/cols、H/rows 取（不是正方形），缩放到 256x256 时图像会被压扁，
        # 底部就会出现几十像素的错位 —— 这正是「小比例地图和标点不匹配」的原因。
        span = W / cols
        zw = zh = span
        zdir = os.path.join(out_root, str(z))
        os.makedirs(zdir, exist_ok=True)

        for cx in range(cols):
            for cy in range(rows):
                left = cx * zw
                top = cy * zh
                right = left + zw
                bottom = top + zh
                # 因为图高 H < 宽 W，最下面一行会超出源图。
                # 做法：先把这一格对应区域裁到源图范围内，再贴到正方形画布上，
                # 超出部分用页面底色填 —— 不做越界 crop。
                n = round(span)
                L = max(0, min(round(left), W))
                T = max(0, min(round(top), H))
                R = max(L, min(round(right), W))
                B = max(T, min(round(bottom), H))
                tile = Image.new("RGB", (n, n), MAP_BG)
                if R > L and B > T:
                    tile.paste(img.crop((L, T, R, B)), (L - round(left), T - round(top)))
                # z0 直接给缩略图尺寸；其余 level 统一缩放到 256 见方
                if z == 0:
                    tile.thumbnail((THUMB_SIZE, THUMB_SIZE), Image.LANCZOS)
                else:
                    tile = tile.resize((TILE, TILE), Image.LANCZOS)

                buf = io.BytesIO()
                # z0 是首屏唯一要等的图，单独压得更狠
                # z5 只是对源图的放大、没有新增信息，压得紧一点也不损失观感，
                # 而它占全部瓦片体积的大头
                if z == 0:
                    q = 72          # 首屏必加载，压得最狠
                elif z >= 5:
                    q = 74          # 只是放大源图，无新增信息，体积却占大头
                else:
                    q = QUALITY
                tile.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
                data = buf.getvalue()
                path = os.path.join(zdir, f"{cx}_{cy}.jpg")
                with open(path, "wb") as f:
                    f.write(data)
                total += 1
                total_bytes += len(data)

        print(f"    z{z}: {cols}x{rows} = {cols * rows} 块")

    print(f"  {layer}: 共 {total} 块，{total_bytes / 1024 / 1024:.1f} MB")
    return total_bytes


def main():
    only = None
    if "--layer" in sys.argv:
        i = sys.argv.index("--layer")
        if i + 1 < len(sys.argv):
            only = sys.argv[i + 1]

    os.makedirs(OUT_DIR, exist_ok=True)
    grand = 0
    for layer, fn in LAYERS.items():
        if only and layer != only:
            continue
        print(f"切 {layer} …")
        grand += make_layer(layer, fn)

    print(f"\n合计 {grand / 1024 / 1024:.1f} MB -> {OUT_DIR}")
    print("下一步：把 index.html 的底图换成 Leaflet TileLayer（见 tools/README-tiles.md）")


if __name__ == "__main__":
    main()
