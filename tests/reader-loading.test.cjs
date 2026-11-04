const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const code=fs.readFileSync('monitor-loading.js','utf8');
function setup(){
 const requests=[];const fail=new Set();
 const chunks=Array.from({length:5},(_,i)=>({path:`reader/p${i}.json`,count:100,newest: i<2?1800000000:1000000000}));
 const manifest={schemaVersion:1,generatedAt:1800000000,total:500,feeds:[{id:'one',name:'招聘'}],chunks};
 const context={console,AbortController,setTimeout,clearTimeout,Date,Map,Set,Promise,Array,Error,
  usingSnapshot:true,curView:'brief',curPage:1,allArticles:[],sources:[],sourceMap:{},SNAPSHOT_BASE:'https://example.test',
  fetch:async url=>{requests.push(url);if(fail.has(url))throw Error('network');return {ok:true,json:async()=>url.endsWith('manifest.json')?manifest:{items:[{id:url,title:'标题',url,sourceId:'one',date_published:'2026-11-04T12:00:00+08:00'}]}};},
  document:{getElementById:()=>({}),querySelector:()=>null},
  render(){},renderCharts(){},switchView(){},init:async()=>{},setStatus(){},updateStats(){},updateCounts(){},renderSidebar(){},rebuildSegmentButtons(){},syncWorkspace(){},safeText:x=>x,
  mapArticleItems:(items,src)=>items.map(i=>({...i,date:new Date(i.date_published),authorName:src.name})),mergeArticleHistory:items=>items};
 vm.createContext(context);vm.runInContext(code,context);vm.runInContext('readerNotice=()=>{};',context);
 return {context,requests,fail,manifest,run:s=>vm.runInContext(s,context)};
}
test('initial loading uses bounded reader pages and older history only loads on demand',async()=>{
 const {run,requests}=setup();await run('fetchSources();');await run('fetchArticles();');
 assert.equal(requests.length,3);assert(requests.every(u=>u.includes('/reader/')));
 assert.equal(run('allArticles.length'),2);await run('loadReaderHistory(false)');
 assert.equal(run('allArticles.length'),4);await run('loadReaderHistory(true)');assert.equal(run('allArticles.length'),5);
});
test('a failed page preserves successful data and remains retryable',async()=>{
 const {run,fail}=setup();fail.add('https://example.test/reader/p1.json');
 await run('fetchSources()');await run('fetchArticles()');assert.equal(run('allArticles.length'),1);
 assert(run('readerState.error'));assert.equal(run('readerState.loading'),false);
 fail.clear();await run('fetchArticles()');assert.equal(run('allArticles.length'),2);assert.equal(run('readerState.error'),'');
});
test('weekly boot exits before starting article loading and chart library is not parser blocking',()=>{
 const html=fs.readFileSync('index.html','utf8');
 assert(html.includes("switchView('archive');\n    return;"));
 assert(!html.includes('fonts.googleapis.com'));assert(!html.includes('<script src="https://cdn.jsdelivr.net'));
 assert(code.includes("script.src='assets/vendor/chart.umd.min.js'"));
});
