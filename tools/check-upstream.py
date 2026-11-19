#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查本站的 markers.json 是否落后于上游 joric/ootss。

用法：python tools/check-upstream.py
- 比 git blob sha（上游 API 直接给），本地算一遍，相等就是同一版本
- 有更新时打印上游最新提交日期，并提示重新抓取

本项目的数据快照曾是 Release_v1；上游随时可能加新关卡或修正坐标，
所以定期跑一次，别让坐标悄悄过期。
"""
import json, os, sys, hashlib, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL = os.path.join(ROOT, 'tools', 'raw', 'markers.json')
API = 'https://api.github.com/repos/joric/ootss'
UA = {'User-Agent': 'ootss-index-check', 'Accept': 'application/vnd.github+json'}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))


def blob_sha(path):
    """Git 计算 blob 哈希的方式：sha1("blob <len>\\0" + content)"""
    b = open(path, 'rb').read()
    return hashlib.sha1(b'blob %d\0' % len(b) + b).hexdigest(), len(b)


def main():
    if not os.path.exists(LOCAL):
        print('缺少 tools/raw/markers.json'); sys.exit(1)
    local_sha, local_size = blob_sha(LOCAL)
    print(f'本地  {local_sha[:12]}  {local_size:,} 字节')

    try:
        files = get(f'{API}/contents/data')
        upstream = next((f for f in files if f['name'] == 'markers.json'), None)
        if not upstream:
            print('上游没找到 data/markers.json'); sys.exit(1)
        print(f'上游  {upstream["sha"][:12]}  {upstream["size"]:,} 字节')

        if upstream['sha'] == local_sha:
            print('\n✓ 已是最新，与上游 joric/ootss 完全一致')
            return

        print('\n✗ 本地快照落后于上游，需要重新抓取：')
        commits = get(f'{API}/commits?path=data/markers.json&per_page=3')
        for c in commits:
            print(f"   {c['commit']['author']['date'][:10]}  {c['commit']['message'].splitlines()[0][:60]}")
        print('\n更新步骤：重新下载 data/markers.json 覆盖 tools/raw/markers.json，')
        print('然后依次运行 node tools/build-maps.js && node tools/build-solutions.js')
    except Exception as e:
        print(f'查询失败（网络受限？）：{e}')
        sys.exit(2)


if __name__ == '__main__':
    main()
