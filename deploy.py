#!/usr/bin/env python3
"""
Vercel 静态网站部署脚本
"""
import os
import json
import base64
import hashlib
import requests
from pathlib import Path

TOKEN = "vcp_0MGyEPX6pnsp0SEFHti08FPPEBsiRmNsBiQjPXLQvcbJxAYHQ14I3y0Q"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}
API = "https://api.vercel.com"
TEAM_ID = "ZypaLxbZ4thpzQiAupmE4j4w"

PROJECT_NAME = "taizhou-yiyuan"
PROJECT_DIR = Path(r"c:\Users\ASUS\WorkBuddy\20260424022149")

def get_files(dir_path):
    """获取目录下所有文件"""
    files = []
    skip = {'.workbuddy', 'website.zip'}
    for root, dirs, filenames in os.walk(dir_path):
        dirs[:] = [d for d in dirs if d not in skip]
        for f in filenames:
            if f in skip:
                continue
            full = Path(root) / f
            files.append(full)
    return files

def sha256_file(path):
    """计算文件 SHA256"""
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def create_project():
    """创建 Vercel 项目"""
    url = f"{API}/v13/projects?teamId={TEAM_ID}"
    payload = {"name": PROJECT_NAME}
    r = requests.post(url, headers=HEADERS, json=payload)
    data = r.json()
    if r.status_code in (200, 201):
        print(f"[OK] Project created: {data.get('name')} (ID: {data.get('id')})")
        return data.get('id')
    elif r.status_code == 409:
        print("[INFO] Project already exists, fetching...")
        list_url = f"{API}/v6/projects?teamId={TEAM_ID}"
        r2 = requests.get(list_url, headers=HEADERS)
        projects = r2.json().get('projects', [])
        for p in projects:
            if p.get('name') == PROJECT_NAME:
                print(f"[OK] Found project: {p.get('name')} (ID: {p.get('id')})")
                return p.get('id')
        print(f"[ERROR] Cannot find project: {data}")
        return None
    else:
        print(f"[ERROR] Failed to create project: {data}")
        return None

def file_dict(path, base):
    """生成文件字典"""
    with open(path, 'rb') as f:
        content = f.read()
    return {
        "file": str(path.relative_to(base)),
        "data": content.decode('utf-8', errors='replace'),
        "encoding": "utf-8"
    }

def deploy(project_id):
    """部署网站"""
    files = get_files(PROJECT_DIR)
    print(f"\n[PACK] Files to upload: {len(files)}")

    file_items = []
    for f in files:
        rel = str(f.relative_to(PROJECT_DIR))
        with open(f, 'rb') as fp:
            content = fp.read()
        file_items.append({
            "file": rel,
            "data": content.decode('utf-8', errors='replace'),
            "encoding": "utf-8"
        })
        print(f"  + {rel}")

    # Build deployment payload
    payload = {
        "name": PROJECT_NAME,
        "project": project_id,
        "target": "production",
        "files": file_items
    }

    print("\n[DEPLOY] Uploading files, please wait...")
    url = f"{API}/v13/deployments?teamId={TEAM_ID}"
    r = requests.post(url, headers=HEADERS, json=payload)
    data = r.json()

    if r.status_code in (200, 201):
        print(f"\n[SUCCESS] Deployment created!")
        print(f"   URL: https://{data.get('url')}")
        print(f"   Public: https://{PROJECT_NAME}.vercel.app")
        return data.get('url')
    else:
        print(f"\n[ERROR] Deployment failed: {json.dumps(data, ensure_ascii=False)}")
        return None

if __name__ == "__main__":
    print("=" * 50)
    print("Taizhou Yiyuan Website - Vercel Deploy Script")
    print("=" * 50)

    project_id = create_project()
    if project_id:
        url = deploy(project_id)
        if url:
            print("\n[DONE] Website is live!")
    else:
        print("\n[ABORT] Deployment failed")
