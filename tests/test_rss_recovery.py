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
 def test_sogou_search_link_uses_labeled_wechat_original(self):
  search='http://weixin.sogou.com/weixin?type=2&query=example'
  original='http://mp.weixin.qq.com/s?__biz=abc&amp;mid=12&amp;idx=2&amp;sn=xyz#rd'
  body=f'<p><a href="{original}"><span>文章原文</span></a></p>'
  expected='https://mp.weixin.qq.com/s?__biz=abc&mid=12&idx=2&sn=xyz'
  self.assertEqual(sync.preferred_article_url(search,body),expected)
  merged=sync.merge_items([{'id':'old','url':search,'title':'same','content_html':body}],[{'id':'new','url':expected,'title':'same'}])
  self.assertEqual(len(merged),1);self.assertEqual(merged[0]['url'],expected)
  feed=('<rss xmlns:content="http://purl.org/rss/1.0/modules/content/">'
        '<channel><title>机器之心</title><item><title>same</title>'
        f'<link>{search.replace("&", "&amp;")}</link>'
        f'<content:encoded><![CDATA[{body}]]></content:encoded>'
        '</item></channel></rss>')
  self.assertEqual(sync.parse_feed(feed.encode())[1][0]['url'],expected)
 def test_unverified_original_does_not_replace_link(self):
  search='http://weixin.sogou.com/weixin?type=2&query=example'
  self.assertEqual(sync.preferred_article_url(search,'<a href="https://example.com">文章原文</a>'),search)
  self.assertEqual(sync.preferred_article_url(search,'<a href="https://mp.weixin.qq.com/s?mid=12">文章原文</a>'),search)
if __name__=='__main__':unittest.main()
