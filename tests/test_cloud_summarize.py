import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

script = Path(__file__).resolve().parents[1] / 'scripts/cloud_summarize.py'
if not script.exists():
    script = Path(__file__).with_name('cloud_summarize.py')
spec = importlib.util.spec_from_file_location('summarize', script)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class SummaryTests(unittest.TestCase):
    def test_author_as_subject_is_valid(self):
        text = '作者通过具体实践说明善良在人际关系中有实际用途，并讨论其影响。'
        self.assertEqual(m.valid_summary(text), text)
        with self.assertRaises(ValueError):
            m.valid_summary('作者：某某，来源：某公众号，这是一段需要被拒绝的署名内容。')

    def test_transient_retry(self):
        error = HTTPError('https://example.com', 503, 'busy', {}, io.BytesIO(b'busy'))
        with patch.object(m, 'request_summary', side_effect=[error, ('valid', {})]) as call, patch.object(m.time, 'sleep'):
            self.assertEqual(m.request_with_retry('secret', 'title', 'account', 'body'), ('valid', {}))
            self.assertEqual(call.call_count, 2)

    def test_permanent_no_retry(self):
        error = HTTPError('https://example.com', 400, 'bad', {}, io.BytesIO(b'bad'))
        with patch.object(m, 'request_summary', side_effect=error) as call:
            with self.assertRaises(HTTPError):
                m.request_with_retry('secret', 'title', 'account', 'body')
            self.assertEqual(call.call_count, 1)

    def test_retry_exhaustion(self):
        with patch.object(m, 'request_summary', side_effect=TimeoutError('timeout')) as call, patch.object(m.time, 'sleep'):
            with self.assertRaises(TimeoutError):
                m.request_with_retry('secret', 'title', 'account', 'body')
            self.assertEqual(call.call_count, 3)

    def test_failure_saved_pending_and_nonzero(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'summary-state.json').write_text('{"known":[]}')
            (root/'feed.json').write_text(json.dumps({'items':[{'title':'article','url':'https://example.com/article','body_text':'a'*400}]}))
            error = HTTPError('https://example.com',400,'bad',{},io.BytesIO(b'bad secret'))
            with patch('sys.argv', ['summary','--snapshot',tmp]), patch.dict(m.os.environ, {'DEEPSEEK_API_KEY':'secret'}), patch.object(m,'request_summary',side_effect=error), patch.object(m.time,'sleep'):
                self.assertEqual(m.main(),1)
            meta=json.loads((root/'summary-meta.json').read_text())
            self.assertEqual(meta['failed'],1)
            self.assertEqual(meta['errors'][0]['httpStatus'],400)
            self.assertNotIn('secret',meta['errors'][0]['error'])
            self.assertEqual(json.loads((root/'summary-state.json').read_text())['known'],[])

if __name__ == '__main__':
    unittest.main()
