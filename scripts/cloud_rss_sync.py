#!/usr/bin/env python3
"""Fetch private RSS sources into a public, credential-free snapshot directory."""

from __future__ import annotations

import argparse
import email.utils
import hashlib
import html
import json
import os
import re
import sqlite3
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit, urlunsplit


ATOM = "{http://www.w3.org/2005/Atom}"
CONTENT = "{http://purl.org/rss/1.0/modules/content/}encoded"
MAX_ITEMS_PER_REQUEST = 10
MAX_STORED_PER_SOURCE = 5000
RATE_LIMIT_COOLDOWN = 60 * 60
MIN_RUN_INTERVAL = 19 * 60
MAX_CONTENT_HTML = 200_000
PRIVATE_FEED_HOSTS = {"i.hhbboo.com", "plink.anyfeeder.com", "supsub.net", "wechat2rss.xlab.app"}


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.image = ""

    def handle_data(self, data: str) -> None:
        value = data.strip()
        if value:
            self.parts.append(value)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "img" and not self.image:
            self.image = dict(attrs).get("src") or ""


def read_json(path: Path, default):
    try:
        return json.loads(path.read_text("utf-8"))
    except (OSError, ValueError):
        return default


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", "utf-8")
    os.replace(temp, path)


def child_text(node: ET.Element, *names: str) -> str:
    for name in names:
        value = node.findtext(name)
        if value:
            return value.strip()
    return ""


def iso_date(value: str) -> str | None:
    if not value:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(value)
    except (TypeError, ValueError):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def public_asset_url(value: str) -> str:
    """Turn known image-proxy URLs into their original public image URLs."""
    if not value:
        return ""
    parts = urlsplit(html.unescape(value))
    host = (parts.hostname or "").lower()
    if host == "i.hhbboo.com" and parts.path.startswith("/mm/"):
        segments = parts.path.split("/", 3)
        if len(segments) == 4 and "." in segments[2]:
            return urlunsplit(("https", segments[2], "/" + segments[3], parts.query, ""))
    if host == "wechat2rss.xlab.app":
        upstream = parse_qs(parts.query).get("u", [""])[0]
        if urlsplit(upstream).scheme in {"http", "https"}:
            return unquote(upstream)
    return "" if host in PRIVATE_FEED_HOSTS else value


def public_content_html(value: str) -> str:
    if not value:
        return ""
    return re.sub(
        r"https?://[^\s\"'<>]+",
        lambda match: public_asset_url(match.group(0)),
        value,
        flags=re.IGNORECASE,
    )


def parse_feed(payload: bytes) -> tuple[str, list[dict]]:
    if b"<!DOCTYPE" in payload.upper() or b"<!ENTITY" in payload.upper():
        raise ValueError("unsupported XML entity")
    root = ET.fromstring(payload)
    channel = root.find("channel") if root.tag == "rss" else root if root.tag == ATOM + "feed" else None
    if channel is None:
        raise ValueError("unsupported RSS format")
    entries = channel.findall("item") if root.tag == "rss" else channel.findall(ATOM + "entry")
    result = []
    for entry in entries[:MAX_ITEMS_PER_REQUEST]:
        title = child_text(entry, "title", ATOM + "title") or "无标题"
        link = child_text(entry, "link")
        if not link:
            for candidate in entry.findall(ATOM + "link"):
                if candidate.get("rel", "alternate") == "alternate":
                    link = candidate.get("href", "")
                    break
        if urlsplit(link).scheme not in {"http", "https"}:
            link = ""
        body = public_content_html(child_text(entry, CONTENT, ATOM + "content"))
        description = child_text(entry, "description", ATOM + "summary")
        extractor = TextExtractor()
        extractor.feed(body or description)
        body_text = " ".join(extractor.parts)
        published = iso_date(child_text(
            entry, "pubDate", ATOM + "published", ATOM + "updated",
            "{http://purl.org/dc/elements/1.1/}date",
        ))
        guid = child_text(entry, "guid", ATOM + "id") or link or title
        item_id = hashlib.sha256(guid.encode("utf-8")).hexdigest()
        result.append({
            "id": item_id,
            "title": html.unescape(title),
            "url": link,
            "content_html": body[:MAX_CONTENT_HTML],
            "description": re.sub(r"\s+", " ", body_text)[:4000],
            "body_text": re.sub(r"\s+", " ", body_text)[:20000],
            "image": public_asset_url(extractor.image) or None,
            "date_modified": published,
            "date_published": published,
        })
    return child_text(channel, "title", ATOM + "title") or "未命名订阅", result


def fetch(source: dict, state: dict) -> tuple[str, list[dict], dict]:
    source_state = state.get("sources", {}).get(source["id"], {})
    headers = {
        "User-Agent": "CompanyWatch-Cloud/1.0",
        "Accept": "application/rss+xml, application/atom+xml, application/xml",
    }
    if source_state.get("etag"):
        headers["If-None-Match"] = source_state["etag"]
    if source_state.get("modified"):
        headers["If-Modified-Since"] = source_state["modified"]
    request = urllib.request.Request(source["url"], headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read(16_000_001)
            if len(payload) > 16_000_000:
                raise ValueError("RSS payload exceeds 16 MB")
            name, items = parse_feed(payload)
            metadata = {"etag": response.headers.get("ETag", ""), "modified": response.headers.get("Last-Modified", "")}
            return name, items, metadata
    except urllib.error.HTTPError as exc:
        if exc.code == 304:
            return source.get("name", ""), [], {"not_modified": True}
        raise


def merge_items(previous: list[dict], fresh: list[dict]) -> list[dict]:
    merged: dict[str, dict] = {}
    for item in [*previous, *fresh]:
        item = {
            **item,
            "content_html": public_content_html(item.get("content_html") or item.get("body") or "")[:MAX_CONTENT_HTML],
            "image": public_asset_url(item.get("image") or "") or None,
        }
        # Historical snapshots and the new collector may generate different IDs
        # for the same article. Prefer the canonical URL so a migration cannot
        # duplicate every existing item.
        url = (item.get("url") or "").split("#", 1)[0].strip()
        title = (item.get("title") or "").strip()
        key = f"url:{url}" if url else f"title:{title}" if title else item.get("id")
        if not key:
            continue
        merged[key] = {**merged.get(key, {}), **item}
    return sorted(
        merged.values(),
        key=lambda item: item.get("date_modified") or item.get("date_published") or "",
        reverse=True,
    )[:MAX_STORED_PER_SOURCE]


def seed_local_database(output: Path, database: Path, configured: list[dict]) -> None:
    """One-time migration of already collected articles without exposing feed URLs."""
    if not database.exists():
        raise SystemExit(f"seed database not found: {database}")
    configured_ids = {source["id"] for source in configured}
    with sqlite3.connect(database) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            "SELECT source_id, data FROM rss_items ORDER BY source_id"
        ).fetchall()
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        if row["source_id"] not in configured_ids:
            continue
        try:
            item = json.loads(row["data"])
        except (TypeError, ValueError):
            continue
        body = public_content_html(item.get("body") or item.get("content_html") or "")
        extractor = TextExtractor()
        extractor.feed(body)
        body_text = re.sub(r"\s+", " ", item.get("body_text") or " ".join(extractor.parts)).strip()
        published = item.get("date_published") or item.get("date_modified")
        grouped.setdefault(row["source_id"], []).append({
            "id": item.get("id") or hashlib.sha256((item.get("url") or item.get("title") or "").encode("utf-8")).hexdigest(),
            "title": item.get("title") or "无标题",
            "url": item.get("url") or "",
            "content_html": body[:MAX_CONTENT_HTML],
            "description": body_text[:4000],
            "body_text": body_text[:20000],
            "image": public_asset_url(item.get("image") or extractor.image) or None,
            "date_modified": item.get("date_modified") or published,
            "date_published": published,
        })
    source_names = {source["id"]: source.get("name", "未命名订阅") for source in configured}
    for sid, items in grouped.items():
        target = output / f"{sid}.json"
        previous = read_json(target, {"items": []}).get("items", [])
        write_json(target, {
            "version": "https://jsonfeed.org/version/1.1",
            "title": source_names[sid],
            "home_page_url": "",
            "items": merge_items(previous, items),
        })


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--seed-db", help="optional local rss-monitor.db used only for initial migration")
    args = parser.parse_args()
    output = Path(args.output)
    sources = json.loads(os.environ["RSS_SOURCES_JSON"])
    if not isinstance(sources, list) or not sources:
        raise SystemExit("RSS_SOURCES_JSON must contain a non-empty list")
    if args.seed_db:
        seed_local_database(output, Path(args.seed_db), sources)
    state_path = output / "sync-state.json"
    state = read_json(state_path, {"cooldowns": {}, "sources": {}})
    now = int(time.time())
    if not args.seed_db and now - int(state.get("lastRunAt", 0)) < MIN_RUN_INTERVAL:
        print(json.dumps({"skipped": True, "reason": "last run is less than 19 minutes old"}))
        return 0
    previous_feeds = read_json(output / "feeds.json", [])
    feed_meta = {item.get("id"): item for item in previous_feeds if item.get("id")}
    statuses = {}
    errors = 0

    for position, source in enumerate(sources):
        sid = source["id"]
        host = urlsplit(source["url"]).hostname or ""
        host_key = hashlib.sha256(host.encode("utf-8")).hexdigest()
        cooldown_until = int(state.get("cooldowns", {}).get(host_key, 0))
        previous_file = output / f"{sid}.json"
        previous_document = read_json(previous_file, {"items": []})
        previous_items = previous_document.get("items", [])
        sanitized_items = merge_items(previous_items, [])
        if sanitized_items != previous_items:
            previous_items = sanitized_items
            write_json(previous_file, {
                "version": "https://jsonfeed.org/version/1.1",
                "title": source.get("name", "未命名订阅"),
                "home_page_url": "",
                "items": previous_items,
            })
        if cooldown_until > now:
            statuses[sid] = {"status": "cooldown", "checkedAt": now, "successAt": state.get("sources", {}).get(sid, {}).get("successAt", 0), "message": "供应商限频，1小时冷却中", "count": len(previous_items)}
            continue
        try:
            detected_name, fresh, headers = fetch(source, state)
            if headers.get("not_modified"):
                merged = previous_items
                message = "正常，暂无新文章"
            else:
                merged = merge_items(previous_items, fresh)
                new_count = max(0, len(merged) - len(previous_items))
                message = f"新增 {new_count} 篇" if new_count else "正常，暂无新文章"
                document = {
                    "version": "https://jsonfeed.org/version/1.1",
                    "title": source.get("name") or detected_name,
                    "home_page_url": "",
                    "items": merged,
                }
                write_json(previous_file, document)
            state.setdefault("sources", {})[sid] = {
                "etag": headers.get("etag", state.get("sources", {}).get(sid, {}).get("etag", "")),
                "modified": headers.get("modified", state.get("sources", {}).get(sid, {}).get("modified", "")),
                "successAt": now,
            }
            statuses[sid] = {"status": "ok", "checkedAt": now, "successAt": now, "message": message, "count": len(merged)}
        except urllib.error.HTTPError as exc:
            errors += 1
            if exc.code == 429:
                state.setdefault("cooldowns", {})[host_key] = now + RATE_LIMIT_COOLDOWN
                message = "HTTP 429，供应商进入1小时冷却"
            else:
                message = f"HTTP {exc.code}，保留已有文章"
            statuses[sid] = {"status": "error", "checkedAt": now, "successAt": state.get("sources", {}).get(sid, {}).get("successAt", 0), "message": message, "count": len(previous_items)}
        except Exception as exc:
            errors += 1
            statuses[sid] = {"status": "error", "checkedAt": now, "successAt": state.get("sources", {}).get(sid, {}).get("successAt", 0), "message": f"读取失败，保留已有文章：{type(exc).__name__}", "count": len(previous_items)}
        if position + 1 < len(sources):
            time.sleep(1)

    configured_ids = {source["id"] for source in sources}
    feeds = []
    for source in sources:
        old = feed_meta.get(source["id"], {})
        feeds.append({
            "id": source["id"], "name": source["name"],
            "intro": old.get("intro", ""), "cover": old.get("cover", ""),
            "sourceKind": source.get("kind", "media"), "company": source.get("company", ""),
            "updateTime": statuses.get(source["id"], {}).get("successAt", 0),
        })
    # Preserve historical-only accounts in the cloud archive without polling them.
    for old in previous_feeds:
        if old.get("id") not in configured_ids:
            feeds.append({**old, "archived": True})

    write_json(output / "feeds.json", feeds)
    write_json(output / "meta.json", {
        "generatedAt": now, "feedCount": len(feeds), "activeFeedCount": len(sources),
        "intervalMinutes": 20, "maxItemsPerSource": MAX_ITEMS_PER_REQUEST,
        "errors": errors, "sources": statuses,
    })
    state["lastRunAt"] = now
    state["cooldowns"] = {
        (hashlib.sha256(key.encode("utf-8")).hexdigest() if "." in key else key): until
        for key, until in state.get("cooldowns", {}).items() if int(until) > now
    }
    write_json(state_path, state)
    print(json.dumps({"active": len(sources), "errors": errors, "generatedAt": now}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
