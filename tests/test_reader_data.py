import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('reader',Path(__file__).resolve().parents[1]/'scripts/build_reader_data.py')
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)

class ReaderDataTests(unittest.TestCase):
    def test_all_records_survive_in_bounded_immutable_pages_without_bodies(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            (root/'feeds.json').write_text(json.dumps([{'id':'one','name':'招聘'}]))
            (root/'meta.json').write_text(json.dumps({'generatedAt':1800000000}))
            items=[{'id':str(i),'title':f'标题{i}','url':f'https://example.com/{i}',
                    'date_published':'2026-11-04T12:00:00+08:00','summary':'摘要',
                    'content_html':'private body'*1000,'body_text':'body'*1000} for i in range(205)]
            (root/'one.json').write_text(json.dumps({'items':items}))
            manifest=reader.build(root)
            self.assertEqual([c['count'] for c in manifest['chunks']],[100,100,5])
            rows=[r for c in manifest['chunks'] for r in json.loads((root/c['path']).read_text())['items']]
            self.assertEqual({r['id'] for r in rows},{r['id'] for r in items})
            self.assertTrue(all('content_html' not in r and 'body_text' not in r for r in rows))
            self.assertEqual(rows[0]['url'],items[0]['url'])
            self.assertEqual(reader.build(root)['chunks'],manifest['chunks'])
            self.assertEqual(json.loads((root/'one.json').read_text())['items'],items)

if __name__=='__main__':unittest.main()
