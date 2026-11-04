// Bounded list payloads. Full-text collection archives stay separate from reading.
const readerState={manifest:null,pages:new Map(),loading:false,error:'',started:null,epoch:0};
async function readerJSON(url, options={}) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try {
    const response=await fetch(url,{...options,signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }finally{clearTimeout(timeout);}
}
function readerRemaining(){return readerState.manifest?.chunks.filter(c=>!readerState.pages.has(c.path))||[];}
function readerNotice(){
  const total=readerState.manifest?.total;
  const count=allArticles.length;
  const dates=allArticles.filter(a=>a.date&&Number.isFinite(+a.date)).map(a=>+a.date);
  const oldest=dates.length?new Date(Math.min(...dates)).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'}):'';
  const remaining=readerRemaining().length;
  const message=readerState.error||(!total?'正在读取近期动态…':`已载入 ${count.toLocaleString()} 篇${oldest?' · 自 '+oldest+' 起':''}。${remaining?'搜索和统计基于已载入范围，可继续加载历史。':'已载入全部历史。'}`);
  for(const panel of ['panel-brief','panel-articles','panel-charts']){
    let notice=document.querySelector(`#${panel} .reader-history`);
    if(!notice){
      notice=document.createElement('div');notice.className='reader-history';
      notice.style.cssText='padding:18px 0;display:flex;flex-wrap:wrap;gap:12px;align-items:center;color:#526177;font-size:13px';
      notice.innerHTML='<span role="status"></span><button class="btn-load-more" data-reader-older>加载更早动态</button><button class="quiet-button" data-reader-all>加载全部历史</button>';
      document.getElementById(panel).append(notice);
      notice.querySelector('[data-reader-older]').onclick=()=>loadReaderHistory(false);
      notice.querySelector('[data-reader-all]').onclick=()=>loadReaderHistory(true);
    }
    notice.querySelector('span').textContent=message;
    notice.querySelector('[data-reader-older]').hidden=!remaining&&!readerState.error;
    notice.querySelector('[data-reader-older]').textContent=readerState.error?'重试读取':readerState.loading?'正在加载…':'加载更早动态';
    notice.querySelector('[data-reader-all]').hidden=!remaining;
    notice.querySelectorAll('button').forEach(b=>b.disabled=readerState.loading);
  }
}
const renderBeforeReader=render;
render=function(){renderBeforeReader();if(usingSnapshot&&curView!=='archive')readerNotice();};
function applyReaderPages(){
  const rows=[...readerState.pages.values()].flatMap(p=>p.items||[]);
  const bySource=new Map();
  rows.forEach(row=>{if(!bySource.has(row.sourceId))bySource.set(row.sourceId,[]);bySource.get(row.sourceId).push(row);});
  allArticles=[...bySource].flatMap(([id,items])=>mergeArticleHistory(mapArticleItems(items,sourceMap[id]||{id,name:id}),[]))
    .sort((a,b)=>(+b.date||0)-(+a.date||0));
  readingLoadedAt=new Date((readerState.manifest.generatedAt||0)*1000);
  updateStats();updateCounts();renderSidebar();render();
  setStatus(`已载入 ${allArticles.length} 篇 · ${readerRemaining().length?'历史可继续加载':'全部历史'}`);
}
async function readPages(chunks,epoch){
  const failures=[];
  // At most three small pages at once; one failure never hides successful pages.
  for(let i=0;i<chunks.length;i+=3){
    await Promise.all(chunks.slice(i,i+3).map(async chunk=>{
      try {
        const page=await readerJSON(`${SNAPSHOT_BASE}/${chunk.path}`);
        if(!Array.isArray(page.items))throw Error('invalid page');
        if(readerState.epoch!==epoch)return;
        readerState.pages.set(chunk.path,page);applyReaderPages();
      }catch(error){failures.push(chunk.path);}
    }));
    if(readerState.epoch!==epoch)return;
  }
  if(failures.length)throw Error('部分动态未能读取，已保留成功加载的内容，请重试。');
}
if(usingSnapshot){
  fetchSources=async function(){
    if(readerState.loading&&readerState.manifest)return;
    // Only this small manifest revalidates; immutable content pages use browser cache.
    const manifest=await readerJSON(`${SNAPSHOT_BASE}/reader/manifest.json`,{cache:'no-cache'});
    if(manifest.schemaVersion!==1||!Array.isArray(manifest.chunks)||!Array.isArray(manifest.feeds))throw Error('invalid manifest');
    readerState.manifest=manifest;
    sources=manifest.feeds;sourceMap={};sources.forEach(s=>sourceMap[s.id]=s);
    rebuildSegmentButtons();
    document.getElementById('stat-sources').textContent=sources.length;
    document.getElementById('source-select').innerHTML='<option value="">全部公众号</option>'+sources.map(s=>`<option value="${safeText(s.id)}">${safeText(s.name)}</option>`).join('');
    syncWorkspace();
  };
  fetchArticles=async function(){
    if(readerState.loading)return;
    readerState.loading=true;readerState.error='';
    const epoch=++readerState.epoch;
    try{
      if(!readerState.manifest)await fetchSources();
      const manifest=readerState.manifest;
      const cutoff=manifest.generatedAt-30*24*3600;
      let count=0;
      const initial=manifest.chunks.filter(c=>{const take=count<200||c.newest>=cutoff;count+=c.count;return take;});
      // Preserve already-open history across periodic snapshot refreshes.
      const loadedCount=allArticles.length;
      let covered=0;
      const target=manifest.chunks.filter(c=>{const keep=covered<loadedCount||initial.includes(c);covered+=c.count;return keep;});
      const current=new Set(manifest.chunks.map(c=>c.path));
      for(const key of readerState.pages.keys())if(!current.has(key))readerState.pages.delete(key);
      await readPages(target.filter(c=>!readerState.pages.has(c.path)),epoch);
      applyReaderPages();
    }catch(error){readerState.error='动态暂时无法完整读取，已保留现有内容，请重试。';setStatus('读取未完成 · 可重试');}
    finally{readerState.loading=false;readerNotice();}
  };
}
async function loadReaderHistory(all){
  if(readerState.loading)return;
  if(!readerState.manifest){readerState.started=null;return ensureReaderStarted();}
  readerState.loading=true;readerState.error='';readerNotice();
  try{
    const chunks=readerRemaining();
    await readPages(all?chunks:chunks.slice(0,2),readerState.epoch);
    curPage++;render();
  }catch(error){readerState.error=error.message;}
  finally{readerState.loading=false;readerNotice();}
}
async function ensureReaderStarted(){
  if(!readerState.started){
    readerState.started=init().catch(error=>{readerState.started=null;readerState.error='动态暂时无法读取，请重试。';readerNotice();});
  }
  return readerState.started;
}
let chartReady=null;
function ensureCharts(){
  if(typeof Chart!=='undefined')return Promise.resolve();
  if(!chartReady)chartReady=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='assets/vendor/chart.umd.min.js';
    const timer=setTimeout(()=>{script.remove();chartReady=null;reject(Error('chart timeout'));},15000);
    script.onload=()=>{clearTimeout(timer);resolve();};
    script.onerror=()=>{clearTimeout(timer);script.remove();chartReady=null;reject(Error('chart unavailable'));};
    document.head.append(script);
  });
  return chartReady;
}
const renderChartsBeforeLazy=renderCharts;
renderCharts=function(){
  if(typeof Chart==='undefined'){
    document.getElementById('chart-summary').textContent='正在加载图表…';
    ensureCharts().then(()=>{if(curView==='charts')render();}).catch(()=>{
      const host=document.getElementById('chart-summary');host.textContent='图表暂时无法加载。';
      const retry=document.createElement('button');retry.textContent='重试';retry.onclick=()=>render();host.append(retry);
    });return;
  }
  renderChartsBeforeLazy();
};
const switchBeforeReader=switchView;
switchView=function(view){
  switchBeforeReader(view);
  if(view!=='archive')ensureReaderStarted();
};
