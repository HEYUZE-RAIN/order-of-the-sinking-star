#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
拉取构建所需的原始数据（不进仓库，都来自上游开源项目）。

  tools/raw/markers.json     上游 joric/ootss:data/markers.json   关卡坐标 + 区域标注（4.3MB）
  tools/raw/solutions.json   上游 joric/ootss:data/solutions.json 社区解法
  tools/raw/solutions.txt    上游 joric/ootss:data/solutions.txt  备用解
  tools/raw/en.json          上游 joric/ootss:data/Localization/en.json  官方英文名

跑完这个，再跑 build-maps.js / build-solutions.js 就能重建 data/。

用法：python tools/fetch-data.py
"""
import json
import os
import sys
import base64
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'tools', 'raw')
REPO = 'joric/ootss'
BRANCH = 'main'
UA = {'User-Agent': 'ootss-map-data/1.0'}

# 本地文件名 -> 上游路径
FILES = {
    'markers.json': 'data/markers.json',
    'solutions.json': 'data/solutions.json',
    'solutions.txt': 'data/solutions.txt',
    'youtube.txt': 'data/youtube.txt',
    'en.json': 'data/Localization/en.json',
}


def api(path):
    url = f'https://api.github.com/repos/{REPO}/contents/{urllib.parse.quote(path)}?ref={BRANCH}'
    req = urllib.request.Request(url, headers={**UA, 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def download(path):
    """优先 raw 域名；连不上就退回 Contents API 的 base64。

    注意：Contents API 对超过 1MB 的文件不返回 content，只给 git_url，
    那种情况要再请求一次 blob 接口，且 base64 串里有换行，必须先剥掉再解码。
    """
    meta = api(path)
    # 注意：超过 1MB 的文件 content 是空字符串（不是 None），必须走 blob 接口
    if meta.get('content'):
        return base64.b64decode(meta['content'])

    req = urllib.request.Request(meta['git_url'],
                                 headers={**UA, 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        blob = json.loads(r.read().decode('utf-8'))
    b64 = blob.get('content')
    if not b64:
        raise ValueError('blob 接口也没给 content')
    # 关键：base64 是分行返回的，直接 b64decode 会得到空内容
    return base64.b64decode(''.join(b64.split()))


def main():
    os.makedirs(RAW, exist_ok=True)
    ok, fail = 0, []
    for local, remote in FILES.items():
        dest = os.path.join(RAW, local)
        try:
            data = download(remote)
            if len(data) < 32:
                raise ValueError(f'内容过小（{len(data)}B），可能不是有效文件')
            open(dest, 'wb').write(data)
            print(f'  {local:16s} {len(data) / 1024:8.0f} KB   ← {remote}')
            ok += 1
        except Exception as e:
            print(f'  {local:16s} ✗ {e}')
            fail.append((local, remote, str(e)))

    if fail:
        print('\n部分文件拉取失败。可以直接手动从 https://github.com/%s/tree/%s/%s 下载：'
              % (REPO, BRANCH, 'data'))
        for local, remote, _ in fail:
            print(f'  {local}  ←  {remote}')
        sys.exit(1)

    print(f'\n✓ {ok} 个原始数据文件已就位。接下来：')
    print('  node tools/build-maps.js && node tools/build-solutions.js')
    print('  node tools/build-i18n.js')


if __name__ == '__main__':
    print(f'从 github.com/{REPO} 拉取原始数据 → tools/raw/')
    main()
