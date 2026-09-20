#!/usr/bin/env python3
"""Generate concise full-body article summaries for the cloud RSS snapshot."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


API_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-flash"
PROMPT_VERSION = "full-body-v1"
DEFAULT_MIN_BODY_CHARS = 300
DEFAULT_MAX_ITEMS = 20

SYSTEM_PROMPT = """你是中文资讯编辑。请依据文章完整正文写一段可直接展示在资讯列表里的核心摘要。
要求：
1. 用1至3句话讲清文章的核心主旨、关键事实或结论，不复述开头，不写泛泛导语。
2. 不介绍作者、编辑、来源和公众号，不使用“本文介绍了”“文章指出”等套话。
3. 招聘内容优先说明招聘对象、岗位或项目、时间节点和关键条件；技术内容优先说明问题、方法和结果；公司文化内容优先说明具体行动和影响。
4. 只能使用正文已有信息，不猜测、不补充外部事实。
5. 只输出 JSON，格式为 {"summary":"摘要"}，不要输出 Markdown。"""


def read_json(path: Path, default):
    try:
        return json.loads(path.read_text("utf-8"))
    except (OSError, ValueError):
        return default


def write_json(path: Path, value) -> None:
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", "utf-8")
    os.replace(temp, path)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def body_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def published_key(item: dict) -> str:
    return item.get("date_published") or item.get("date_modified") or ""


def valid_summary(value: str) -> str:
    text = clean_text(value).strip('"“”')
    if not 20 <= len(text) <= 320:
        raise ValueError("summary length outside 20-320 characters")
    if text.startswith(("作者", "小编", "编辑：", "来源：")):
        raise ValueError("summary begins with byline or source")
    return text


def request_summary(api_key: str, title: str, account: str, body: str) -> tuple[str, dict]:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"标题：{title}\n公众号：{account}\n完整正文：\n{body}",
            },
        ],
        "thinking": {"type": "disabled"},
        "reasoning_effort": "none",
        "response_format": {"type": "json_object"},
        "max_tokens": 300,
        "temperature": 0.2,
        "stream": False,
    }
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "CompanyWatch-Summary/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        result = json.loads(response.read().decode("utf-8"))
    content = result["choices"][0]["message"]["content"]
    parsed = json.loads(content)
    return valid_summary(parsed.get("summary", "")), result.get("usage") or {}


def snapshot_documents(snapshot: Path) -> list[tuple[Path, dict]]:
    documents = []
    ignored = {"feeds.json", "meta.json", "sync-state.json", "summary-meta.json", "public-feeds.json"}
    for path in snapshot.glob("*.json"):
        if path.name in ignored:
            continue
        document = read_json(path, None)
        if isinstance(document, dict) and isinstance(document.get("items"), list):
            documents.append((path, document))
    return documents


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshot", required=True)
    parser.add_argument("--max-items", type=int, default=DEFAULT_MAX_ITEMS)
    parser.add_argument("--min-body-chars", type=int, default=DEFAULT_MIN_BODY_CHARS)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    snapshot = Path(args.snapshot)
    documents = snapshot_documents(snapshot)
    candidates = []
    skipped_current = 0
    skipped_short = 0

    for path, document in documents:
        account = document.get("title") or ""
        for item in document["items"]:
            body = clean_text(item.get("body_text") or "")
            if len(body) < args.min_body_chars:
                skipped_short += 1
                continue
            digest = body_hash(body)
            meta = item.get("summary_meta") or {}
            if (
                item.get("summary")
                and meta.get("status") == "done"
                and meta.get("body_hash") == digest
                and meta.get("prompt_version") == PROMPT_VERSION
            ):
                skipped_current += 1
                continue
            candidates.append((published_key(item), path, document, account, item, body, digest))

    candidates.sort(key=lambda row: row[0], reverse=True)
    selected = candidates[: max(0, args.max_items)]
    if args.dry_run:
        print(json.dumps({
            "dryRun": True,
            "documents": len(documents),
            "eligiblePending": len(candidates),
            "selected": len(selected),
            "skippedCurrent": skipped_current,
            "skippedShort": skipped_short,
        }, ensure_ascii=False))
        return 0

    api_key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        print(json.dumps({"skipped": True, "reason": "DEEPSEEK_API_KEY is not configured"}))
        return 0

    completed = 0
    failed = 0
    rate_limited = False
    changed_paths: set[Path] = set()
    usage_input = 0
    usage_output = 0
    run_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    for _, path, document, account, item, body, digest in selected:
        try:
            summary, usage = request_summary(
                api_key,
                clean_text(item.get("title") or "无标题"),
                clean_text(account),
                body,
            )
            item["summary"] = summary
            item["summary_meta"] = {
                "status": "done",
                "source": "deepseek",
                "basis": "full_body",
                "model": MODEL,
                "prompt_version": PROMPT_VERSION,
                "body_hash": digest,
                "generated_at": run_at,
            }
            changed_paths.add(path)
            completed += 1
            usage_input += int(usage.get("prompt_tokens") or 0)
            usage_output += int(usage.get("completion_tokens") or 0)
        except urllib.error.HTTPError as exc:
            failed += 1
            if exc.code == 429:
                rate_limited = True
                break
        except (KeyError, TypeError, ValueError, json.JSONDecodeError, urllib.error.URLError, TimeoutError):
            failed += 1
        time.sleep(0.35)

    for path, document in documents:
        if path in changed_paths:
            write_json(path, document)

    metadata = {
        "generatedAt": run_at,
        "model": MODEL,
        "promptVersion": PROMPT_VERSION,
        "basis": "full_body",
        "completed": completed,
        "failed": failed,
        "pendingBeforeRun": len(candidates),
        "skippedCurrent": skipped_current,
        "skippedShort": skipped_short,
        "rateLimited": rate_limited,
        "usage": {"inputTokens": usage_input, "outputTokens": usage_output},
    }
    write_json(snapshot / "summary-meta.json", metadata)
    print(json.dumps(metadata, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
