// Local editorial material and archived-body excerpts. No external generation calls.
let contentData={items:{}}, editorialData=null, editorialSources={}, contentLoadError=false;
const contentReady=Promise.allSettled([
  fetch('monitor-summaries.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>contentData=d),
  fetch('monitor-editorial.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>editorialData=d),
  fetch('monitor-editorial-sources.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>editorialSources=d)
]).then(results=>{contentLoadError=results[0].status==='rejected';});
function articleSummary(a){
  const edited=editorialData?.summaries?.[a.id], stored=contentData.items?.[a.id];
  const generated=a.summaryMeta?.status==='done'&&a.summaryMeta?.basis==='full_body'?a.summary:'';
  // Editorial copy remains the highest-priority override. New cloud summaries
  // are full-body based; the local archive remains a compatibility fallback.
  if(!edited&&!generated&&stored?.kind==='image_only')return '';
  const text=edited||generated||stored?.text;
  if(!text)return '';
  return `<p class="article-abstract">${safeText(text)}</p>`;
}
const fetchWithHealth=fetchArticles;
fetchArticles=async function(){await Promise.all([fetchWithHealth(),contentReady]);render();};
const displayView=switchView;
switchView=function(view){displayView(view==='articles'?'brief':view);document.getElementById('view-description').textContent='';};
document.getElementById('view-description').textContent='';
const homeToolbar=document.querySelector('#panel-articles .article-toolbar');
document.getElementById('panel-brief').prepend(homeToolbar);
homeToolbar.querySelector('h2').textContent='';
homeToolbar.insertAdjacentHTML('afterbegin','<select class="filter-select" id="home-scope" aria-label="首页内容范围"><option value="focus">招聘与公司动态</option><option value="all">全部公司内容</option></select>');
document.getElementById('home-scope').onchange=e=>{workspace.homeAll=e.target.value==='all';curPage=1;render();};
document.getElementById('density-select').onchange=e=>{workspace.density=e.target.value;document.getElementById('panel-brief').classList.toggle('compact',e.target.value==='compact');};
document.getElementById('density-select').value=workspace.density;
document.getElementById('panel-brief').classList.toggle('compact',workspace.density==='compact');
const resetBeforeContent=resetWorkspace;
resetWorkspace=function(){workspace.homeAll=false;document.getElementById('home-scope').value='focus';resetBeforeContent();};
function editorialArticle(id){return allArticles.find(a=>a.id===id)||editorialSources[id];}
function editorialEvidence(ids){return ids.map(id=>{const a=editorialArticle(id);return a?articleLink(a,'insight-evidence',safeText(a.title)):'';}).join('');}
const countsAndCharts=renderCharts;
renderCharts=function(){
  countsAndCharts();
};
window.monitorWeeklyData=async function(){
  await contentReady;if(!editorialData)throw Error('editorial unavailable');
  const e=editorialData;
  const sources=ids=>ids.map(id=>{const a=editorialArticle(id);return a?{name:a.title,url:a.url}:null;}).filter(Boolean);
  const headlineIds=[e.companies[0].evidence[0],e.companies[1].evidence[0],e.companies[2].evidence[0]];
  return {week:e.edition,range:e.range,meta:e.scope,
    headlines:headlineIds.map(id=>{const a=editorialArticle(id);return {title:a?.title||'正文观察',url:a?.url||'',summary:e.summaries[id],tag:'重点内容'};}),
    industry:{sections:{'本周内容观察':{content:e.overview}}},
    companies:e.companies.map(c=>({id:c.id,name:c.company,color:COMPANY_COLORS[c.company],summary:c.title,sections:{
      '具体内容':{content:c.facts,sources:sources(c.evidence)},'分析与判断':{content:c.analysis},'可借鉴的做法':{content:c.takeaway,isInsight:true}
    }}))};
};
