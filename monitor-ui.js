// Shared workspace presentation and filtering. Loaded before the initial data fetch.
const workspace = {period:'all',type:'all',day:null,chartDays:14,scroll:{},density:'compact'};
const landscape=document.createElement('div');landscape.className='landscape-backdrop';landscape.setAttribute('aria-hidden','true');document.body.prepend(landscape);
const backgroundControl=document.createElement('details');backgroundControl.className='background-control';
backgroundControl.innerHTML='<summary>背景</summary><div class="background-popover"><label for="background-strength">风景浓淡 <output id="background-value">55%</output></label><input id="background-strength" type="range" min="0" max="85" step="5" value="55"><div class="background-scale"><span>淡</span><span>浓</span></div><button class="quiet-button" type="button" id="background-reset">恢复默认</button></div>';
document.querySelector('.topbar-right').prepend(backgroundControl);
function setLandscapeStrength(value){const n=Number(value);const strength=Number.isFinite(n)?Math.max(0,Math.min(85,n)):55;document.documentElement.style.setProperty('--landscape-opacity',String(strength/100));const slider=document.getElementById('background-strength');slider.value=String(strength);slider.setAttribute('aria-valuetext',strength===0?'隐藏风景':`风景浓度 ${strength}%`);document.getElementById('background-value').value=`${strength}%`;return strength;}
try{const saved=localStorage.getItem('monitor-landscape-strength');setLandscapeStrength(saved===null?55:saved);}catch{setLandscapeStrength(55);}
document.getElementById('background-strength').addEventListener('input',e=>{const n=setLandscapeStrength(e.target.value);try{localStorage.setItem('monitor-landscape-strength',String(n));}catch{}});
document.getElementById('background-reset').onclick=()=>{setLandscapeStrength(55);try{localStorage.removeItem('monitor-landscape-strength');}catch{}};
document.addEventListener('click',e=>{if(!backgroundControl.contains(e.target))backgroundControl.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backgroundControl.open){backgroundControl.open=false;backgroundControl.querySelector('summary').focus();}});
const safeText = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeHref = value => {try {const u=new URL(value);return /^https?:$/.test(u.protocol)?safeText(u.href):'';}catch{return '';}};
const dayKey = date => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
const weekStart = () => {const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d;};
const articleType = a => RECRUIT_KW.some(k=>a.title.includes(k))?'招聘':PERSON_KW.some(k=>a.title.includes(k))?'人事':/AI|大模型|算法|技术|开源|模型|芯片|智能|架构|工程|研发|数据库|编程/i.test(a.title)?'技术':'其他';
COMPANY_COLORS['字节跳动']='#089caa';
COMPANY_COLORS['行业资讯']='#278366';
const heading=document.createElement('section');
heading.className='workspace-heading';
heading.innerHTML='<div><h1 id="view-title">资讯概览</h1><p id="view-description">跟进招聘、技术与组织动向</p></div><div class="heading-actions"><button class="quiet-button" data-action="sources">监测账号</button></div>';
document.querySelector('.segment-wrap').before(heading);
const filterBar=document.getElementById('search-bar');
filterBar.insertAdjacentHTML('beforeend','<select class="filter-select" id="period-select" aria-label="时间范围"><option value="all">全部</option><option value="today">今天</option><option value="week">本周</option><option value="7">近 7 天</option><option value="30">近 30 天</option></select><select class="filter-select" id="type-select" aria-label="资讯类型"><option value="all">全部类型</option><option>招聘</option><option>技术</option><option>人事</option><option>其他</option></select><button class="quiet-button" data-action="reset">重置筛选</button>');
document.getElementById('search-input').setAttribute('aria-label','搜索文章标题');
filterBar.style.display='flex';
const chips=document.createElement('div');chips.className='active-filters';filterBar.after(chips);
document.getElementById('panel-brief').insertAdjacentHTML('afterbegin','<div id="overview-intro"></div>');
document.getElementById('panel-brief').insertAdjacentHTML('beforeend','<details class="source-directory"><summary>监测账号与收录情况</summary></details>');
document.querySelector('.source-directory').append(document.getElementById('src-list'));
document.getElementById('brief-grid').innerHTML='<div class="skeleton-card"></div>'.repeat(3);
document.getElementById('panel-articles').insertAdjacentHTML('afterbegin','<div class="article-toolbar"><h2 id="list-heading">全部资讯</h2><div><select class="filter-select" id="source-select" aria-label="按公众号筛选"><option value="">全部公众号</option></select> <select class="filter-select" id="density-select" aria-label="列表密度"><option value="comfortable">舒适阅读</option><option value="compact">紧凑列表</option></select></div></div>');
document.getElementById('panel-charts').insertAdjacentHTML('afterbegin','<div class="article-toolbar"><h2>发布与话题趋势</h2><select class="filter-select" id="chart-range" aria-label="图表统计范围"><option value="7">近 7 天</option><option value="14" selected>近 14 天</option><option value="30">近 30 天</option></select></div><div id="chart-summary" class="metric-strip"></div>');
const drawer=document.createElement('dialog');drawer.className='company-drawer';drawer.setAttribute('aria-labelledby','drawer-title');
drawer.innerHTML='<div class="drawer-head"><strong id="drawer-title">公司动态</strong><button class="quiet-button" data-action="close-drawer" aria-label="关闭公司详情">关闭 ×</button></div><div class="drawer-body"></div>';
document.body.append(drawer);
const progress=document.createElement('div');progress.className='reading-progress';document.body.append(progress);

getFiltered = function() {
  let arts=allArticles;
  if(curCompany!=='all') arts=arts.filter(a=>a.company===curCompany);
  if(curSourceId) arts=arts.filter(a=>a.sourceId===curSourceId);
  if(curSearch) arts=arts.filter(a=>a.title.toLowerCase().includes(curSearch.toLowerCase()));
  if(activeKws.size) arts=arts.filter(a=>[...activeKws].some(k=>a.title.toLowerCase().includes(k.toLowerCase())));
  if(workspace.type!=='all') arts=arts.filter(a=>articleType(a)===workspace.type);
  if(workspace.day) arts=arts.filter(a=>a.date&&dayKey(a.date)===workspace.day);
  if(workspace.period!=='all') {
    const since=new Date();since.setHours(0,0,0,0);
    if(workspace.period==='week') since.setTime(+weekStart());
    else if(workspace.period!=='today') since.setDate(since.getDate()-Number(workspace.period)+1);
    arts=arts.filter(a=>a.date&&a.date>=since&&a.date<=new Date());
  }
  return arts;
};
function syncWorkspace() {
  document.getElementById('period-select').value=workspace.period;
  document.getElementById('type-select').value=workspace.type;
  document.getElementById('source-select').value=curSourceId||'';
  document.querySelectorAll('.seg-btn').forEach(b=>{b.classList.toggle('active',b.dataset.company===curCompany);b.setAttribute('aria-pressed',String(b.dataset.company===curCompany));});
  document.querySelectorAll('.kw-pill').forEach(b=>{b.classList.toggle('on',activeKws.has(b.dataset.kw));b.setAttribute('aria-pressed',String(activeKws.has(b.dataset.kw)));});
  const tags=[];
  const tag=(key,label,value='')=>tags.push(`<button class="filter-chip" data-clear="${key}" data-value="${safeText(value)}">${safeText(label)} ×</button>`);
  if(curCompany!=='all') tag('company',curCompany);
  if(curSourceId) tag('source',sourceMap[curSourceId]?.name||'公众号');
  if(curSearch) tag('search',curSearch);
  for(const kw of activeKws) tag('kw',kw,kw);
  if(workspace.period!=='all') tag('period',document.getElementById('period-select').selectedOptions[0].textContent);
  if(workspace.day) tag('day',workspace.day);
  if(workspace.type!=='all') tag('type',workspace.type);
  chips.innerHTML=tags.join('');
  document.getElementById('result-count').textContent=`${getFiltered().length.toLocaleString()} 篇`;
}
const originalRender=render;
render=function(){syncWorkspace();originalRender();};
switchView=function(v){
  if(!['brief','articles','charts','archive'].includes(v)) return;
  workspace.scroll[curView]=window.scrollY;curView=v;
  document.body.classList.toggle('weekly-view',v==='archive');
  if(v!=='archive')progress.style.width='0';
  document.querySelectorAll('.topbar-tab').forEach(t=>{t.classList.toggle('active',t.dataset.view===v);t.setAttribute('aria-pressed',String(t.dataset.view===v));});
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===`panel-${v}`));
  filterBar.style.display=v==='archive'?'none':'flex';
  const titles={brief:['资讯概览','跟进招聘、技术与组织动向'],articles:['资讯列表','按公司、时间与主题查找原文'],charts:['数据图表','点击图表中的数据，查看对应文章'],archive:['行业周报','']};
  document.getElementById('view-title').textContent=titles[v][0];document.getElementById('view-description').textContent=titles[v][1];
  render();requestAnimationFrame(()=>window.scrollTo({top:workspace.scroll[v]||0,behavior:'instant'}));
};
switchCompany=function(c){curCompany=c;curSourceId=null;curPage=1;render();};
applyFilters=function(){curSearch=document.getElementById('search-input').value.trim();curPage=1;render();};
filterByPeriod=function(period){workspace.period=period;workspace.day=null;curPage=1;switchView('articles');};
clearPeriodFilter=function(){workspace.period='all';workspace.day=null;curPeriodArts=null;curPage=1;render();};
clearSourceFilter=function(){curSourceId=null;curPage=1;render();};
jumpToSource=function(id,company){curSourceId=id;curCompany=company&&company!=='其他'?company:'all';curPage=1;switchView('articles');};
searchFromBrief=function(kw){curSearch=kw;document.getElementById('search-input').value=kw;activeKws.clear();curPage=1;switchView('articles');};
function resetWorkspace(){curCompany='all';curSourceId=null;curSearch='';activeKws.clear();workspace.period='all';workspace.type='all';workspace.day=null;curPeriodArts=null;curPage=1;document.getElementById('search-input').value='';render();}
function openCompany(company){
  document.getElementById('drawer-title').textContent=company;
  const arts=getFiltered().filter(a=>a.company===company);
  drawer.querySelector('.drawer-body').innerHTML=`<div class="section-line"><h2>${safeText(company)}</h2><span>${arts.length} 篇符合当前条件</span></div><div class="source-cards-grid">${getCompanyIds(company).map(id=>{const src=sourceMap[id];if(!src)return '';const list=arts.filter(a=>a.sourceId===id);return `<section class="source-card"><div class="source-card-head"><button class="company-title" data-source-jump="${safeText(id)}" data-source-company="${safeText(company)}">${safeText(src.name)} ↗</button><span class="source-card-cnt">${list.length} 篇</span></div>${list.slice(0,5).map(a=>articleLink(a,'bc-item',`${safeText(a.title)}<span class="bc-item-meta">${a.date?relTime(a.date):'日期未知'}</span>`)).join('')||'<p class="bc-empty">当前范围暂无文章</p>'}</section>`;}).join('')}</div>`;
  drawer.showModal();
}
function rankedKeywords(arts){const freq={};for(const a of arts) for(const kw of ['AI','大模型','校招','实习','开源','算法','招聘','智能体','人事','研发']) if(a.title.toLowerCase().includes(kw.toLowerCase())) freq[kw]=(freq[kw]||0)+1;return Object.entries(freq).sort((a,b)=>b[1]-a[1]);}
function articleLink(a,cls,content){const href=safeHref(a.url);return href?`<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer">${content}</a>`:`<div class="${cls}" aria-disabled="true">${content}<small>来源待核实</small></div>`;}
const emptyResult=()=>'<div class="empty-state">没有符合当前条件的资讯<button class="quiet-button" data-action="reset">清除筛选，查看全部</button></div>';
const companyLogoFiles={'字节跳动':'bytedance','腾讯':'tencent','阿里':'alibaba','美团':'meituan','小红书':'xiaohongshu'};
function companyLogo(company){
  const file=companyLogoFiles[company];
  return file?`<img class="company-logo" src="assets/company-logos/${file}.jpg" alt="${safeText(company)}招聘公众号标识" width="56" height="56">`:`<span class="company-category" aria-hidden="true">◎</span>`;
}
briefCard=function(company){
  const arts=getFiltered().filter(a=>a.company===company);if(!arts.length)return '';
  const week=arts.filter(a=>a.date&&a.date>=weekStart());
  const items=list=>list.map(a=>articleLink(a,'bc-item',`${safeText(a.title)}<span class="bc-item-meta">${safeText(a.authorName)} · ${a.date?relTime(a.date):'日期未知'}</span>`)).join('')||'<p class="bc-empty">当前范围暂无相关动态</p>';
  return `<article class="brief-card" style="--company-color:${COMPANY_COLORS[company]||'#526176'}"><div class="bc-head">${companyLogo(company)}<div class="bc-info"><button class="company-title" data-company-detail="${safeText(company)}">${safeText(company)}</button><div class="bc-sub">${getCompanyIds(company).length} 个账号 · ${arts.length} 篇匹配</div></div><span class="bc-badge" title="本周收录量">本周 ${week.length}</span></div><div class="bc-section"><div class="bc-section-title">招聘动态</div>${items(arts.filter(a=>articleType(a)==='招聘'&&(company!=='行业资讯'||BIGCO_KW.some(k=>a.title.includes(k)))).slice(0,2))}</div><div class="bc-section"><div class="bc-section-title">技术动态</div>${items(arts.filter(a=>articleType(a)==='技术').slice(0,2))}</div><div class="card-footer">${rankedKeywords(arts).slice(0,3).map(([k])=>`<button data-keyword="${safeText(k)}">${safeText(k)}</button>`).join('')}<button class="view-company" data-company-detail="${safeText(company)}">查看动态 ↗</button></div></article>`;
};
renderBrief=function(){
  const arts=getFiltered(),now=new Date(),today=dayKey(now),week=weekStart();
  const todayArts=arts.filter(a=>a.date&&dayKey(a.date)===today),weekArts=arts.filter(a=>a.date&&a.date>=week&&a.date<=now);
  const metric=(action,label,num,note)=>`<button class="metric" data-action="${action}"><span>${label}</span><strong>${num.toLocaleString()}</strong><small>${note}</small></button>`;
  const focus=[];const seen=new Set();for(const a of todayArts.length?todayArts:arts){if(!seen.has(a.company)){focus.push(a);seen.add(a.company);}if(focus.length===3)break;}
  document.getElementById('overview-intro').innerHTML=`<div class="metric-strip">${metric('today','今日收录',todayArts.length,'查看今天的文章')}${metric('week','本周收录',weekArts.length,'周一至今')}${metric('active','本周活跃公司',new Set(weekArts.map(a=>a.company)).size,'查看本周动态')}${metric('sources','监测账号',sources.length,'查看账号与收录情况')}</div><div class="section-line"><h2>${todayArts.length?'今日更新':'最近更新'}</h2><span>按发布时间 · 每家公司取最新一篇</span></div><div class="focus-grid">${focus.map(a=>articleLink(a,'focus-item',`<span class="focus-label">${safeText(a.company)} / ${articleType(a)}</span><h3>${safeText(a.title)}</h3><small>${safeText(a.authorName)} · ${a.date?relTime(a.date):'日期未知'} ↗</small>`)).join('')}</div><div class="section-line"><h2>公司观察</h2><span>招聘与技术动态</span></div>`;
  const grid=document.getElementById('brief-grid');grid.className='brief-grid';grid.innerHTML=[...new Set(arts.map(a=>a.company))].map(briefCard).join('')||emptyResult();
};
articleCard=function(a){
  let title=safeText(a.title);if(curSearch)title=title.replace(new RegExp(escRe(safeText(curSearch)),'gi'),m=>`<mark>${m}</mark>`);
  const image=safeHref(a.image);
  return articleLink(a,'article-card',`<div><div class="art-meta"><span class="art-company">${safeText(a.company)}</span><span class="art-source">${safeText(a.authorName)}</span><span class="art-kw">${articleType(a)}</span><time class="art-date" title="${a.date?safeText(a.date.toLocaleString('zh-CN')):''}">${a.date?relTime(a.date):'日期未知'}</time></div><div class="art-title">${title}</div></div>${image?`<img class="art-thumb" src="${image}" loading="lazy" referrerpolicy="no-referrer" alt="" onerror="this.remove()">`:''}<span class="art-arrow" aria-hidden="true">↗</span>`);
};
renderArticles=function(){const arts=getFiltered();syncWorkspace();document.getElementById('list-heading').textContent=`${curCompany==='all'?'全部资讯':curCompany} · ${arts.length.toLocaleString()} 篇`;document.getElementById('articles-list').innerHTML=arts.length?arts.slice(0,curPage*PAGE_SZ).map(articleCard).join(''):emptyResult();document.getElementById('load-more').style.display=arts.length>curPage*PAGE_SZ?'block':'none';};
loadMore=function(){curPage++;renderArticles();};
let autoLoading=false;
const moreObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&curView==='articles'&&!autoLoading&&getFiltered().length>curPage*PAGE_SZ){autoLoading=true;loadMore();requestAnimationFrame(()=>autoLoading=false);}},{rootMargin:'0px 0px 180px 0px'});
moreObserver.observe(document.getElementById('load-more'));

const oldFetchSources=fetchSources;
const readArticles=fetchArticles;
fetchArticles=async function(){
  await readArticles();
  if(usingSnapshot)return;
  try{
    const response=await fetch(`${WEWE_BASE}/api/health`,{cache:'no-store'});
    if(!response.ok)throw new Error('status unavailable');
    const {sync}=await response.json();if(!sync)return;
    const last=sync.last_success_at?new Date(sync.last_success_at*1000).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'暂无';
    setStatus(`${sync.label} · 今日新增 ${sync.today_new_articles} 篇`);
    document.getElementById('status-text').title=`最后成功：${last}；下一次尝试：${new Date(sync.next_attempt_at*1000).toLocaleString('zh-CN')}`;
    if(sync.cooling_down){document.getElementById('warn-text').textContent=`WeWe ${sync.label}。最后成功：${last}；当前展示已收录文章，刷新页面不会触发上游同步。下次尝试不早于 ${new Date(sync.next_attempt_at*1000).toLocaleString('zh-CN')}。`;document.getElementById('warn-bar').style.display='flex';}
  }catch{setStatus('文章已读取 · 同步状态暂不可用');}
};
fetchSources=async function(){await oldFetchSources();document.getElementById('source-select').innerHTML='<option value="">全部公众号</option>'+sources.map(s=>`<option value="${safeText(s.id)}">${safeText(s.name)}</option>`).join('');const pills=document.getElementById('kw-pills');pills.innerHTML=['校招','实习','招聘','AI','大模型'].map(k=>`<button class="kw-pill" data-kw="${k}" aria-pressed="false">${k}</button>`).join('');syncWorkspace();};
document.getElementById('kw-pills').addEventListener('click',e=>{const b=e.target.closest('[data-kw]');if(!b)return;activeKws.has(b.dataset.kw)?activeKws.delete(b.dataset.kw):activeKws.add(b.dataset.kw);curPage=1;render();});
document.getElementById('period-select').onchange=e=>{workspace.period=e.target.value;workspace.day=null;curPage=1;render();};
document.getElementById('type-select').onchange=e=>{workspace.type=e.target.value;curPage=1;render();};
document.getElementById('source-select').onchange=e=>{curSourceId=e.target.value||null;curPage=1;render();};
document.getElementById('density-select').onchange=e=>{workspace.density=e.target.value;document.getElementById('panel-articles').classList.toggle('compact',e.target.value==='compact');};
document.getElementById('chart-range').onchange=e=>{workspace.chartDays=Number(e.target.value);renderCharts();};
document.addEventListener('click',e=>{
  const source=e.target.closest('[data-source-jump]');if(source){if(drawer.open)drawer.close();jumpToSource(source.dataset.sourceJump,source.dataset.sourceCompany);return;}
  const company=e.target.closest('[data-company-detail]');if(company){openCompany(company.dataset.companyDetail);return;}
  const keyword=e.target.closest('[data-keyword]');if(keyword){searchFromBrief(keyword.dataset.keyword);return;}
  const clear=e.target.closest('[data-clear]');if(clear){const k=clear.dataset.clear;if(k==='company')curCompany='all';if(k==='source')curSourceId=null;if(k==='search'){curSearch='';document.getElementById('search-input').value='';}if(k==='kw')activeKws.delete(clear.dataset.value);if(k==='period')workspace.period='all';if(k==='day')workspace.day=null;if(k==='type')workspace.type='all';curPage=1;render();return;}
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='reset')resetWorkspace();
  if(action==='today'||action==='week')filterByPeriod(action);
  if(action==='active'){workspace.period='week';workspace.day=null;curPage=1;render();}
  if(action==='sources'){switchView('brief');const directory=document.querySelector('.source-directory');directory.open=true;directory.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  if(action==='close-drawer')drawer.close();
});
drawer.addEventListener('click',e=>{if(e.target===drawer){const r=drawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)drawer.close();}});
window.addEventListener('scroll',()=>{const range=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=curView==='archive'&&range>0?`${Math.min(100,window.scrollY/range*100)}%`:'0';},{passive:true});
new ResizeObserver(entries=>{document.documentElement.style.setProperty('--nav-height',`${entries[0].target.getBoundingClientRect().height}px`);}).observe(document.querySelector('.topbar'));

// Chart interactions use the exact same filtered collection as the list.
const baseCharts=renderCharts;
renderCharts=function(){
  const arts=getChartArticles();
  const counts=Object.entries(arts.reduce((m,a)=>(m[a.company]=(m[a.company]||0)+1,m),{})).sort((a,b)=>b[1]-a[1]);
  const words=rankedKeywords(arts);
  document.getElementById('chart-summary').innerHTML=[['统计文章',arts.length,`近 ${workspace.chartDays} 天 · 当前筛选`],['发文最多',counts[0]?.[0]||'暂无',`${counts[0]?.[1]||0} 篇`],['热门主题',words[0]?.[0]||'暂无',`${words[0]?.[1]||0} 篇标题命中`],['覆盖公司',counts.length,'包括行业资讯']].map(([label,value,note])=>`<div class="metric"><span>${label}</span><strong style="font-size:26px">${value}</strong><small>${note}</small></div>`).join('');
  if(typeof Chart==='undefined'){document.getElementById('chart-summary').innerHTML='<div class="empty-state">图表组件暂时未加载，请刷新页面重试。</div>';return;}
  baseCharts();
  const trend=charts['chart-trend'];trend.options.onClick=(_,els)=>{if(!els.length)return;const el=els[0];const day=chartDayKeys()[el.index];curCompany=trend.data.datasets[el.datasetIndex].label;workspace.day=day;curPage=1;switchView('articles');};trend.update();
  const bar=charts['chart-kw'];bar.options.onClick=(_,els)=>{if(els.length){applyChartRange();searchFromBrief(bar.data.labels[els[0].index]);}};bar.update();
};
function chartDayKeys(){return Array.from({length:workspace.chartDays},(_,i)=>{const d=new Date();d.setDate(d.getDate()-workspace.chartDays+1+i);return dayKey(d);});}
function getChartArticles(){const days=new Set(chartDayKeys());return getFiltered().filter(a=>a.date&&days.has(dayKey(a.date)));}
function applyChartRange(){if(workspace.period==='all')workspace.period=String(workspace.chartDays);if(!document.querySelector(`#period-select option[value="${workspace.period}"]`)){const option=new Option(`近 ${workspace.period} 天`,workspace.period);document.getElementById('period-select').add(option);}}
const baseHeatmap=renderHeatmap;
renderHeatmap=function(arts,companies){baseHeatmap(arts,companies);document.querySelectorAll('#chart-heatmap tbody tr').forEach((tr,i)=>{tr.querySelectorAll('td').forEach((td,j)=>{if(!j)return;const kw=document.querySelectorAll('#chart-heatmap thead th')[j].textContent;const value=td.textContent;td.innerHTML=`<button class="heat-button" aria-label="${safeText(companies[i])}，${safeText(kw)}，${value} 篇，查看文章">${value}</button>`;td.querySelector('button').onclick=()=>{curCompany=companies[i];applyChartRange();searchFromBrief(kw);};});});};
const baseWordCloud=renderWordCloud;
renderWordCloud=function(arts){baseWordCloud(arts);document.querySelectorAll('#wordcloud-container .wc-word').forEach(span=>{const b=document.createElement('button');b.className=span.className;b.style.cssText=span.style.cssText;b.textContent=span.textContent;b.title=span.title;b.onclick=()=>{applyChartRange();searchFromBrief(b.textContent);};span.replaceWith(b);});};

// A single glass indicator follows navigation intent, not the mouse coordinates.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const glassNav=document.querySelector('.topbar-tabs');
function moveGlassTab(button=glassNav.querySelector('.active')){
  if(!button)return;
  glassNav.style.setProperty('--tab-x',`${button.offsetLeft}px`);
  glassNav.style.setProperty('--tab-y',`${button.offsetTop}px`);
  glassNav.style.setProperty('--tab-w',`${button.offsetWidth}px`);
  glassNav.style.setProperty('--tab-h',`${button.offsetHeight}px`);
}
glassNav.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')moveGlassTab(e.target.closest('.topbar-tab'));});
glassNav.addEventListener('pointerleave',()=>moveGlassTab());
glassNav.addEventListener('focusin',e=>moveGlassTab(e.target.closest('.topbar-tab')));
glassNav.addEventListener('focusout',()=>requestAnimationFrame(()=>moveGlassTab()));
glassNav.addEventListener('click',()=>requestAnimationFrame(()=>moveGlassTab()));
new ResizeObserver(()=>moveGlassTab()).observe(glassNav);
new MutationObserver(()=>moveGlassTab()).observe(glassNav,{subtree:true,attributes:true,attributeFilter:['class']});
document.fonts?.ready.then(()=>moveGlassTab());
requestAnimationFrame(()=>moveGlassTab());
const revealedSurfaces=new WeakSet();
const entranceObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){if(!motionPreference.matches)entry.target.classList.add('surface-enter');entranceObserver.unobserve(entry.target);}});
},{threshold:.08});
function registerSurfaces(root){
  root.querySelectorAll('.brief-card,.focus-item,.article-card,.chart-card,.headline,.company').forEach((el,i)=>{
    if(revealedSurfaces.has(el))return;
    revealedSurfaces.add(el);el.style.setProperty('--entry-delay',`${Math.min(i%3,2)*65}ms`);entranceObserver.observe(el);
    el.addEventListener('animationend',()=>el.classList.remove('surface-enter'),{once:true});
  });
}
let entranceFrame=0;
const watchSurfaces=root=>{registerSurfaces(root);new MutationObserver(()=>{if(entranceFrame)return;entranceFrame=requestAnimationFrame(()=>{registerSurfaces(document);const shadow=document.querySelector('industry-weekly')?.shadowRoot;if(shadow)registerSurfaces(shadow);entranceFrame=0;});}).observe(root,{childList:true,subtree:true});};
watchSurfaces(document.querySelector('.main-layout'));
customElements.whenDefined('industry-weekly').then(()=>{const shadow=document.querySelector('industry-weekly')?.shadowRoot;if(shadow)watchSurfaces(shadow);});
