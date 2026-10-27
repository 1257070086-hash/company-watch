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
        text = '团队发布六项机器人研究成果，探索将人类数据转化为真实机器人的操作能力。'
        with patch.object(m, 'request_summary', side_effect=[error, (text, {})]) as call, patch.object(m.time, 'sleep'):
            self.assertEqual(m.request_with_retry('secret', 'title', 'account', 'body'),
                             (text, {'prompt_tokens': 0, 'completion_tokens': 0}))
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

    def test_invalid_outputs_rewritten_with_feedback(self):
        text = '团队发布六项机器人研究成果，探索将人类数据转化为真实机器人的操作能力。'
        invalid_outputs = ['短摘要', '长' * 321, None, [],
                           '作者：某某，来源：某公众号，这是一段需要被拒绝的署名内容。']
        for invalid in invalid_outputs:
            with self.subTest(invalid=invalid):
                with patch.object(m, 'request_summary', side_effect=[
                    (invalid, {'prompt_tokens': 10, 'completion_tokens': 5}),
                    (text, {'prompt_tokens': 20, 'completion_tokens': 10}),
                ]) as call:
                    summary, usage = m.request_with_retry('secret', 'title', 'account', 'body')
                self.assertEqual(summary, text)
                self.assertTrue(call.call_args_list[1].kwargs['feedback'])
                self.assertEqual(usage, {'prompt_tokens': 30, 'completion_tokens': 15})

    def test_malformed_json_is_retried(self):
        text = '团队发布六项机器人研究成果，探索将人类数据转化为真实机器人的操作能力。'
        with patch.object(m, 'request_summary', side_effect=[
            json.JSONDecodeError('bad JSON', '{', 1), (text, {}),
        ]) as call:
            self.assertEqual(m.request_with_retry('secret', 'title', 'account', 'body')[0], text)
        self.assertEqual(call.call_count, 2)

    def test_feedback_sent_to_model(self):
        text = '团队发布六项机器人研究成果，探索将人类数据转化为真实机器人的操作能力。'
        with patch.object(m.urllib.request, 'urlopen') as open_request:
            response = open_request.return_value.__enter__.return_value
            response.read.return_value = json.dumps({
                'choices': [{'message': {'content': json.dumps({'summary': text})}}],
            }).encode()
            m.request_summary('secret', 'title', 'account', 'body', feedback='actual: 400')
            payload = json.loads(open_request.call_args.args[0].data)
        self.assertIn('actual: 400', payload['messages'][-1]['content'])
        self.assertIn('完整正文：\nbody', payload['messages'][1]['content'])

    def test_validation_failure_stays_pending_after_three_calls(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'summary-state.json').write_text('{"known":[]}')
            (root/'feed.json').write_text(json.dumps({'items': [
                {'title': 'article', 'url': 'https://example.com/article', 'body_text': 'a'*400}
            ]}))
            with patch('sys.argv', ['summary', '--snapshot', tmp]), \
                 patch.dict(m.os.environ, {'DEEPSEEK_API_KEY': 'secret'}), \
                 patch.object(m, 'request_summary', return_value=('短', {})) as call, \
                 patch.object(m.time, 'sleep'):
                self.assertEqual(m.main(), 1)
            self.assertEqual(call.call_count, 3)
            meta = json.loads((root/'summary-meta.json').read_text())
            self.assertEqual(meta['status'], 'failed')
            self.assertEqual(meta['pendingAfterRun'], 1)
            self.assertIn('actual: 1', meta['errors'][0]['error'])
            self.assertEqual(json.loads((root/'summary-state.json').read_text())['known'], [])
            self.assertNotIn('summary', json.loads((root/'feed.json').read_text())['items'][0])

    def test_rewritten_summary_is_published(self):
        text = '团队发布六项机器人研究成果，探索将人类数据转化为真实机器人的操作能力。'
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'summary-state.json').write_text('{"known":[]}')
            (root/'feed.json').write_text(json.dumps({'items': [
                {'title': 'article', 'url': 'https://example.com/article', 'body_text': 'a'*400}
            ]}))
            with patch('sys.argv', ['summary', '--snapshot', tmp]), \
                 patch.dict(m.os.environ, {'DEEPSEEK_API_KEY': 'secret'}), \
                 patch.object(m, 'request_summary', side_effect=[('短', {}), (text, {})]), \
                 patch.object(m.time, 'sleep'):
                self.assertEqual(m.main(), 0)
            meta = json.loads((root/'summary-meta.json').read_text())
            self.assertEqual((meta['completed'], meta['failed'], meta['pendingAfterRun']), (1, 0, 0))
            self.assertEqual(json.loads((root/'feed.json').read_text())['items'][0]['summary'], text)

if __name__ == '__main__':
    unittest.main()

