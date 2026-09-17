// Presentation-only redesign. Reads the existing local feed; never starts collection.
const companyAliases = {
  '字节跳动':['字节','抖音','豆包','TikTok','Seed'], '腾讯':['腾讯','微信','混元'],
  '阿里':['阿里','淘宝','天猫','通义','蚂蚁'], '美团':['美团'], '小红书':['小红书'],
  '快手':['快手','可灵'], '百度':['百度'], '京东':['京东'], '网易':['网易'],
  '拼多多':['拼多多','Temu'], '滴滴':['滴滴'], '哔哩哔哩':['哔哩哔哩','B站','bilibili'],
  '小米':['小米'], '华为':['华为'], '商汤':['商汤'], '大疆':['大疆']
};
const isOfficial = a => a.sourceKind ? a.sourceKind==='official' : !!companyLogoFiles[a.company];
const relatedCompanies = a => isOfficial(a) ? [a.company] : Object.entries(companyAliases)
  .filter(([company,names]) => !!companyLogoFiles[company] && names.filter(n=>!['微信','Seed'].includes(n)).some(n => a.title.toLowerCase().includes(n.toLowerCase()))).map(([name])=>name);
function contentLabels(a) {
  const title=a.title||'', name=a.authorName||'', labels=[];
  if(/校招|实习|招聘|春招|秋招|offer|社招|应届|招募|人才计划|校园大使|岗位|面试|内推|转正/i.test(title)) labels.push('招聘');
  if(/技术|算法|开源|架构|数据库|工程|研发|论文|模型|编程|AI\b/i.test(title)||/技术|Tech|Seed/i.test(name)) labels.push('技术');
  if(/文化|员工|同学|周年|价值观|公益|志愿|生活|成长|入职|职场|团队故事/.test(title)||/字节范|是小红书人/.test(name)) labels.push('文化');
  if(!isOfficial(a)) labels.push('公司资讯');
  return labels.length?labels:['其他'];
}
const minuteFormat=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
const publishedMinute=a => a.date instanceof Date && Number.isFinite(+a.date)?minuteFormat.format(a.date):'发布时间待核实';
const timelineDate=a => publishedMinute(a).slice(0,10);
const legacyFilter=getFiltered;
getFiltered=function(){
  const company=curCompany,type=workspace.type;
  let arts;
  // Keep search, source, period and keyword filters; apply multi-label classification here.
  try {curCompany='all';workspace.type='all';arts=legacyFilter();}
  finally {curCompany=company;workspace.type=type;}
  // Aggregate views stay focused on tracked companies. Once a reader chooses
  // a specific media account, show that account's full feed instead of hiding
  // valid articles merely because their titles do not contain a company name.
  const selectedSource=curSourceId?sourceMap[curSourceId]:null;
  const explicitMediaSource=selectedSource?.sourceKind==='media';
  if(curView==='brief'&&company!=='行业资讯'&&!explicitMediaSource) arts=arts.filter(a=>isOfficial(a)||relatedCompanies(a).some(c=>!!companyLogoFiles[c]));
  if(curView==='articles'&&company!=='行业资讯'&&!explicitMediaSource) arts=arts.filter(a=>isOfficial(a)||relatedCompanies(a).length>0);
  // The dedicated industry view is an archive of every monitored media feed.
  // Company-keyword filtering belongs only to the mixed "all" view.
  if(company==='行业资讯') arts=arts.filter(a=>!isOfficial(a));
  else if(company!=='all') arts=arts.filter(a=>isOfficial(a)?a.company===company:relatedCompanies(a).includes(company));
  if(type!=='all') arts=arts.filter(a=>contentLabels(a).includes(type));
  const seen=new Set();
  return arts.filter(a=>{const key=a.url||a.id;if(!key)return true;if(seen.has(key))return false;seen.add(key);return true;})
    .sort((a,b)=>(Number.isFinite(+b.date)?+b.date:0)-(Number.isFinite(+a.date)?+a.date:0));
};
document.getElementById('type-select').innerHTML='<option value="all">全部类别</option>'+['招聘','技术','文化','公司资讯','其他'].map(t=>`<option>${t}</option>`).join('');
document.getElementById('view-title').textContent='最新动态';
document.getElementById('view-description').textContent='招聘动向与公司相关资讯 · 按发布时间倒序';
document.getElementById('overview-intro').remove();
document.getElementById('brief-grid').className='timeline';
document.getElementById('panel-brief').insertAdjacentHTML('afterbegin','<div id="timeline-count" class="section-line" aria-live="polite"></div>');
document.getElementById('brief-grid').insertAdjacentHTML('afterend','<div class="load-more-wrap"><button class="btn-load-more" id="timeline-more">查看更多动态</button></div>');
document.getElementById('timeline-more').onclick=()=>{curPage++;renderBrief();};
// A category/search filter can still contain hundreds of articles. Showing only
// 25 made the newest matching article from a quieter company look as if it had
// been excluded (Meituan recruitment was ranked 26th in the combined feed).
// Keep the chronological order, but expose a broader first batch once the
// reader has narrowed the timeline deliberately.
const timelinePageSize=()=>workspace.type!=='all'||activeKws.size||curSearch?Math.max(PAGE_SZ,50):PAGE_SZ;
document.getElementById('panel-articles').insertAdjacentHTML('afterbegin','<div id="company-directory" class="company-directory"></div><div id="company-profile"></div>');
document.getElementById('panel-charts').insertAdjacentHTML('beforeend','<section id="content-insights" class="insight-section"></section>');
function timelineContent(a){
  const companies=relatedCompanies(a), label=isOfficial(a)?a.company:companies.join(' / ');
  return `<article class="timeline-content"><div class="art-meta"><span class="company-identity">${safeText(label||a.company)}</span><span class="origin-badge ${isOfficial(a)?'official':'media'}">${isOfficial(a)?'公司账号':'外部报道'}</span>${contentLabels(a).map(t=>`<span class="art-kw">${t}</span>`).join('')}</div>${articleLink(a,'timeline-title',`${safeText(a.title)}<span aria-hidden="true"> ↗</span>`)}${typeof articleSummary==='function'?articleSummary(a):''}<div class="timeline-source">${safeText(a.authorName)}</div></article>`;
}
function timelineCard(items){
  const a=items[0];
  const valid=a.date instanceof Date&&Number.isFinite(+a.date), full=publishedMinute(a);
  return `<section class="timeline-entry"><time class="timeline-time" ${valid?`datetime="${a.date.toISOString()}"`:''} title="${safeText(full)} 北京时间" aria-label="${safeText(full)} 北京时间">${valid?full.slice(-5):'待核实'}</time><span class="timeline-node" aria-hidden="true"></span><div class="timeline-stack">${items.map(timelineContent).join('')}</div></section>`;
}
const collapsedTimelineDays=new Set();
document.addEventListener('toggle',e=>{
  if(!e.target.matches?.('.timeline-date-group'))return;
  const key=e.target.dataset.timelineKey;
  if(e.target.open)collapsedTimelineDays.delete(key);else collapsedTimelineDays.add(key);
},true);
function timelineHTML(arts){
  if(!arts.length)return emptyResult();
  const groups=new Map();
  for(const a of arts){const day=timelineDate(a);if(!groups.has(day))groups.set(day,[]);groups.get(day).push(a);}
  return [...groups].map(([day,items])=>{
    const valid=/^\d{4}-\d{2}-\d{2}$/.test(day), parts=day.split('-');
    const dateLabel=valid?`${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`:'发布时间待核实';
    const weekday=valid?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',weekday:'long'}).format(items[0].date):'';
    const key=`${curView}:${day}`;
    const batches=[], batchByKey=new Map();
    for(const item of items){
      const minute=publishedMinute(item), validMinute=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(minute);
      const groupKey=validMinute?`${item.sourceId}|${minute}`:`${item.sourceId}|${item.id||item.url||item.title}`;
      let batch=batchByKey.get(groupKey);
      if(!batch){batch=[];batchByKey.set(groupKey,batch);batches.push(batch);}
      batch.push(item);
    }
    return `<details class="timeline-date-group" data-timeline-key="${safeText(key)}" ${collapsedTimelineDays.has(key)?'':'open'}><summary class="timeline-day"><span class="timeline-day-label">${dateLabel}</span><span class="timeline-chevron" aria-hidden="true"></span><span class="timeline-day-meta">${weekday}${weekday?' · ':''}${items.length} 条</span></summary><div class="timeline-day-items">${batches.map(timelineCard).join('')}</div></details>`;
  }).join('');
}
renderBrief=function(){
  const arts=getFiltered();
  const pageSize=timelinePageSize();
  document.getElementById('timeline-count').innerHTML=`<strong>${arts.length.toLocaleString()} 篇动态</strong>`;
  document.getElementById('brief-grid').innerHTML=timelineHTML(arts.slice(0,curPage*pageSize));
  document.getElementById('timeline-more').hidden=arts.length<=curPage*pageSize;
};
renderArticles=function(){
  const arts=getFiltered();
  const pageSize=timelinePageSize();
  const companies=Object.keys(companyLogoFiles);
  document.getElementById('company-directory').innerHTML=companies.map(c=>`<button class="company-tile ${c===curCompany?'selected':''}" data-profile="${safeText(c)}" aria-pressed="${c===curCompany}">${companyLogo(c)}<strong>${safeText(c)}</strong><span>${getCompanyIds(c).length} 个关联账号</span></button>`).join('');
  document.getElementById('company-profile').innerHTML=`<div class="profile-title"><div><span class="eyebrow">COMPANY CHRONICLE</span><h2>${curCompany==='all'?'各家公司的连续动作':safeText(curCompany)}</h2></div><span>${arts.length.toLocaleString()} 篇匹配</span></div><div class="category-tabs">${['all','招聘','技术','文化','公司资讯'].map(t=>`<button data-category="${t}" class="${workspace.type===t?'selected':''}" aria-pressed="${workspace.type===t}">${t==='all'?'全部':t}</button>`).join('')}</div>`;
  document.getElementById('list-heading').textContent='发布时间轴';
  document.getElementById('articles-list').innerHTML=timelineHTML(arts.slice(0,curPage*pageSize));
  document.getElementById('load-more').style.display=arts.length>curPage*pageSize?'block':'none';
};
openCompany=function(c){curCompany=c;curSourceId=null;curPage=1;switchView('articles');};
document.addEventListener('click',e=>{
  const company=e.target.closest('[data-profile]');if(company){openCompany(company.dataset.profile);return;}
  const category=e.target.closest('[data-category]');if(category){workspace.type=category.dataset.category;curPage=1;render();}
});
getChartArticles=function(){const days=new Set(chartDayKeys());return getFiltered().filter(a=>isOfficial(a)&&a.date&&days.has(dayKey(a.date)));};
const chartWithInteractions=renderCharts;
renderCharts=function(){
  chartWithInteractions();
  const arts=getChartArticles();
  const coverage=document.querySelector('#chart-summary .metric:last-child small');if(coverage)coverage.textContent='仅公司账号，不含行业媒体';
  const groups=Object.keys(companyLogoFiles).map(company=>({company,articles:arts.filter(a=>a.company===company)})).filter(g=>g.articles.length);
  document.getElementById('content-insights').innerHTML=`<div class="section-line"><h2>从数据到内容</h2><span>近 ${workspace.chartDays} 天 · 当前筛选</span></div><p class="insight-caveat">基于已收录文章与标题规则的观察，不代表完整发文量；采集缺口不等于公司没有动作。点击文章核对原文。</p><div class="insight-grid">${groups.map(g=>{const counts=['招聘','技术','文化'].map(t=>[t,g.articles.filter(a=>contentLabels(a).includes(t)).length]);const keywords=rankedKeywords(g.articles).slice(0,3);return `<article class="insight-card"><div class="section-line"><h3>${safeText(g.company)}</h3><span>${g.articles.length} 篇</span></div><div class="insight-counts">${counts.map(([t,n])=>`<span>${t} <strong>${n}</strong></span>`).join('')}</div><p>${keywords.length?'标题关注：'+keywords.map(([k,n])=>`${safeText(k)}（${n} 篇）`).join('、'):'当前样本暂无明显高频主题'}</p><h4>最近发布 · 来源依据</h4>${g.articles.slice(0,3).map(a=>articleLink(a,'insight-evidence',`<span>${safeText(a.title)}</span><time>${safeText(publishedMinute(a))}</time>`)).join('')}</article>`;}).join('')||emptyResult()}</div>`;
};
const previousSwitch=switchView;
switchView=function(v){previousSwitch(v);const names={brief:['最新动态','招聘动向与公司相关资讯 · 按发布时间倒序'],articles:['公司档案','按公司追踪招聘、技术与文化'],charts:['数据与洞察','公司发文趋势与可追溯的内容观察'],archive:['行业周报','']};if(!names[v])return;document.getElementById('view-title').textContent=names[v][0];document.getElementById('view-description').textContent=names[v][1];};
const refreshSegments=rebuildSegmentButtons;
rebuildSegmentButtons=function(){refreshSegments();};
