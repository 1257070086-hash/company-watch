import importlib.util
import unittest
from unittest.mock import patch
from pathlib import Path
spec=importlib.util.spec_from_file_location('sync',Path(__file__).parents[1]/'scripts/cloud_rss_sync.py')
sync=importlib.util.module_from_spec(spec);spec.loader.exec_module(sync)
class RecoveryTests(unittest.TestCase):
 def test_overrides_preserve_other_sources(self):
  result=sync.apply_source_overrides([{'id':'MP_WXS_3572959446','url':'https://old.example/rss','company':'行业资讯'},{'id':'other','url':'https://example.com/rss'}])
  self.assertIn('c442206e',result[0]['url']);self.assertEqual(result[0]['company'],'行业资讯');self.assertEqual(result[1]['url'],'https://example.com/rss')
 def test_migration_deduplicates_tracking_but_keeps_distinct_articles(self):
  url='https://mp.weixin.qq.com/s?__biz=abc&mid=1&idx=1'
  items=sync.merge_items([{'id':'old','url':url+'&chksm=old','title':'same'}],[{'id':'new','url':url+'&sn=new','title':'same','body_text':'full'},{'id':'other','url':url.replace('idx=1','idx=2'),'title':'same'}])
  self.assertEqual(len(items),2);self.assertTrue(any(x.get('body_text')=='full' for x in items))
 def test_source_change_resets_conditional_headers(self):
  source={'id':'a','url':'https://new.example/rss','user_agent':'Mozilla/5.0'}
  class Response:
   headers={}
   def __enter__(self):return self
   def __exit__(self,*args):pass
   def read(self,*args):return b'<rss><channel><title>test</title></channel></rss>'
  with patch.object(sync.urllib.request,'urlopen',return_value=Response()) as call:
   sync.fetch(source,{'sources':{'a':{'etag':'OLD','modified':'OLD','sourceFingerprint':'old'}}});req=call.call_args.args[0]
   self.assertFalse(req.has_header('If-none-match'));self.assertFalse(req.has_header('If-modified-since'));self.assertEqual(req.get_header('User-agent'),'Mozilla/5.0')
if __name__=='__main__':unittest.main()
