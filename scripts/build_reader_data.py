"""Build bounded, immutable reading pages without changing full-text archives."""
import argparse
import hashlib
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

FIELDS = ('id', 'title', 'url', 'image', 'summary', 'summary_meta', 'date_published', 'date_modified')

def encode(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode('utf-8')

def build(snapshot):
    snapshot = Path(snapshot)
    feeds = json.loads((snapshot / 'feeds.json').read_text())
    meta = json.loads((snapshot / 'meta.json').read_text())
    legacy_path = Path(__file__).resolve().parent.parent / 'monitor-summaries.json'
    legacy = json.loads(legacy_path.read_text()).get('items', {}) if legacy_path.exists() else {}
    rows = []
    for feed in feeds:
        payload = json.loads((snapshot / (feed['id'] + '.json')).read_text())
        for item in payload.get('items', []):
            row = {key: item[key] for key in FIELDS if key in item}
            stored = legacy.get(str(item.get('id')), {})
            if stored.get('kind') != 'image_only' and stored.get('text'):
                row['reader_excerpt'] = stored['text']
            row['sourceId'] = feed['id']
            rows.append(row)
    def timestamp(row):
        try:
            return datetime.fromisoformat(str(row.get('date_published') or row.get('date_modified')).replace('Z', '+00:00')).timestamp()
        except (ValueError, TypeError):
            return 0
    rows.sort(key=timestamp, reverse=True)
    # Keep every record; runtime URL/ID deduplication retains existing semantics.
    directory = snapshot / 'reader'
    directory.mkdir(exist_ok=True)
    chunks = []
    for start in range(0, len(rows), 100):
        items = rows[start:start + 100]
        data = encode({'items': items})
        digest = hashlib.sha256(data).hexdigest()[:20]
        name = f'page-{digest}.json'
        (directory / name).write_bytes(data)
        chunks.append({'path': 'reader/' + name, 'count': len(items), 'bytes': len(data),
                       'newest': timestamp(items[0]), 'oldest': timestamp(items[-1])})
    manifest = {'schemaVersion': 1, 'generatedAt': meta['generatedAt'], 'feeds': feeds,
                'total': len(rows), 'chunks': chunks, 'sources': meta.get('sources', {}),
                'errors': meta.get('errors', 0)}
    (directory / 'manifest.json').write_bytes(encode(manifest))
    # Retain old immutable chunks: an already-open reader can finish its manifest.
    print(json.dumps({'articles': len(rows), 'pages': len(chunks),
                      'manifestBytes': len(encode(manifest)),
                      'listBytes': sum(c['bytes'] for c in chunks)}))
    return manifest

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--snapshot', required=True)
    build(parser.parse_args().snapshot)
