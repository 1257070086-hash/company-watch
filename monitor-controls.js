// One reading toolbar; source management lives in a separate, keyboard-accessible dialog.
workspace.period='all';workspace.homeAll=true;
const management=document.createElement('dialog');management.className='rss-dialog';management.setAttribute('aria-labelledby','rss-title');document.body.append(management);
let rssRegistry={sources:[],legacy:[]},rssToken='',rssUnavailable=false,readingLoadedAt=null;
const previousCompany=getCompany;
getCompany=function(id){const src=sourceMap[id];return src?.sourceKind?(src.sourceKind==='official'?src.company:'行业资讯'):previousCompany(id);};
const previousUnclassified=getUnclassified;
getUnclassified=function(){return previousUnclassified().filter(s=>!s.sourceKind);};
const previousSegments=rebuildSegmentButtons;
rebuildSegmentButtons=function(){previousSegments();const industry=document.querySelector('.seg-btn[data-company="行业资讯"]');if(industry)document.getElementById('company-segment').append(industry);};
const rssTime=t=>t?new Date(t*1000).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Shanghai'}):'尚未检查';
async function rssAPI(path,form){
  if(usingSnapshot)throw Error('云端版本由定时任务自动更新');
  const options={cache:'no-store'};
  if(form){options.method='POST';options.body=new URLSearchParams({...form,csrf:rssToken});}
  const response=await fetch(WEWE_BASE+'/api/rss/'+path,options);
  const data=await response.json();if(!response.ok)throw Error(data.error||'来源服务暂不可用');return data;
}
async function loadRegistry(){rssRegistry=await rssAPI('registry');rssToken=rssRegistry.csrf;rssUnavailable=false;return rssRegistry;}
const originalSources=fetchSources;
fetchSources=async function(){
  await originalSources();
  if(!usingSnapshot){try{await loadRegistry();for(const s of rssRegistry.sources){let src=sources.find(x=>x.id===s.id);if(!src){src={id:s.id,name:s.name,cover:'',intro:''};sources.push(src);}Object.assign(src,{name:s.name,sourceKind:s.kind,company:s.company});sourceMap[src.id]=src;}}
  catch{rssUnavailable=true;}}
  rebuildSegmentButtons();syncWorkspace();
};
const priorHistory=fetchArticleHistory;
let rssItems={};
fetchArticleHistory=async function(src){
  let old=[];
  if(!src.id.startsWith('rss_')){try{old=await priorHistory(src);}catch(e){if(!rssItems[src.id])throw e;}}
  const fresh=(rssItems[src.id]||[]).map(i=>({...mapArticleItems([i],src)[0],bodyText:i.body_text||'',sourceKind:src.sourceKind,company:src.company||getCompany(src.id)}));
  return mergeArticleHistory(fresh,old).map(a=>({...a,sourceKind:src.sourceKind||a.sourceKind,company:src.company||a.company}));
};
const priorArticles=fetchArticles;
fetchArticles=async function(){
  if(!usingSnapshot){try{rssItems=(await rssAPI('articles')).feeds||{};}catch{rssUnavailable=true;}}
  await priorArticles();
  readingLoadedAt=new Date();
  if(usingSnapshot){try{const response=await fetch(`${SNAPSHOT_BASE}/meta.json?v=${Date.now()}`,{cache:'no-store'});if(response.ok){const meta=await response.json();readingLoadedAt=new Date((meta.generatedAt||0)*1000);}}catch{}}
  render();
};

const advanced=document.createElement('details');advanced.className='filter-options';advanced.innerHTML='<summary>筛选 ☰</summary><div class="filter-options-box"><label id="source-filter-slot">公众号</label><label>关键词<div id="keyword-filter-slot"></div></label><button class="quiet-button" data-action="reset">清除筛选</button></div>';
filterBar.append(advanced);
advanced.querySelector('#source-filter-slot').append(document.getElementById('source-select'));
advanced.querySelector('#keyword-filter-slot').append(document.getElementById('kw-pills'));
filterBar.querySelector('[data-action="reset"]')?.remove(); // remove the original always-visible reset
const sourceInline=document.createElement('div');sourceInline.id='industry-source-slot';filterBar.insertBefore(sourceInline,advanced);
filterBar.insertBefore(document.getElementById('type-select'),document.getElementById('period-select'));
document.getElementById('type-select').options[0].text='全部内容';
const settings=document.createElement('details');settings.className='monitor-settings';settings.innerHTML='<summary aria-label="阅读设置">设置 ⚙</summary><div class="monitor-settings-box"><label id="density-slot">列表密度</label></div>';
const right=document.querySelector('.topbar-right');right.append(settings);
const settingsBox=settings.querySelector('div');settingsBox.prepend(backgroundControl);settingsBox.append(document.querySelector('.status-pill'),document.getElementById('btn-refresh'));
settings.querySelector('#density-slot').append(document.getElementById('density-select'));
const manageButton=document.createElement('button');manageButton.className='quiet-button';manageButton.textContent='监测账号';manageButton.onclick=openSources;right.insertBefore(manageButton,settings);
if(usingSnapshot){manageButton.hidden=true;document.getElementById('btn-refresh').hidden=true;document.querySelector('.status-pill').title='云端数据每 20 分钟自动更新';}
for(const detail of [settings,advanced]){document.addEventListener('click',e=>{if(!detail.contains(e.target))detail.open=false;});detail.addEventListener('keydown',e=>{if(e.key==='Escape'){detail.open=false;detail.querySelector('summary').focus();}});}
const priorSync=syncWorkspace;
syncWorkspace=function(){
  const sourceSelect=document.getElementById('source-select');
  const eligible=sources.filter(s=>curCompany==='all'||(curCompany==='行业资讯'?(s.sourceKind?s.sourceKind==='media':!companyLogoFiles[getCompany(s.id)]):(s.company===curCompany||getCompany(s.id)===curCompany||allArticles.some(a=>a.sourceId===s.id&&relatedCompanies(a).includes(curCompany)))));
  sourceSelect.innerHTML='<option value="">全部公众号</option>'+eligible.map(s=>`<option value="${safeText(s.id)}">${safeText(s.name)}</option>`).join('');
  if(curSourceId&&!eligible.some(s=>s.id===curSourceId))curSourceId=null;
  (curCompany==='行业资讯'?sourceInline:advanced.querySelector('#source-filter-slot')).append(sourceSelect);
  priorSync();
  advanced.querySelector('#source-filter-slot').hidden=curCompany==='行业资讯';
  const reset=advanced.querySelector('[data-action="reset"]');if(reset)reset.hidden=!(curSearch||curSourceId||activeKws.size||workspace.type!=='all'||workspace.period!=='all'||curCompany!=='all');
};
resetWorkspace=function(){curCompany='all';curSourceId=null;curSearch='';activeKws.clear();workspace.period='all';workspace.type='all';workspace.day=null;workspace.homeAll=true;curPeriodArts=null;curPage=1;document.getElementById('search-input').value='';render();};
const oldTimeline=renderBrief;
renderBrief=function(){oldTimeline();const count=document.getElementById('timeline-count');count.className='monitor-meta';count.innerHTML=`<strong>共 ${getFiltered().length.toLocaleString()} 篇</strong><span>${readingLoadedAt?'数据读取于 '+readingLoadedAt.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}):'正在读取'}${rssUnavailable?' · RSS 管理服务暂不可用':''}</span>`;};

function sourceShell(){management.innerHTML='<header><h2 id="rss-title">监测账号</h2><div class="rss-actions"><button class="primary" id="rss-add">＋ 添加 RSS</button><button id="rss-close" aria-label="关闭来源管理">关闭</button></div></header><div class="rss-dialog-content"><div id="rss-message" class="rss-notice" role="status"></div><div id="rss-form"></div><div id="rss-list"></div></div>';management.querySelector('#rss-close').onclick=()=>management.close();management.querySelector('#rss-add').onclick=()=>showSourceForm();}
function sourceNotice(message,error=false){const el=management.querySelector('#rss-message');if(el){el.textContent=message;el.classList.toggle('error',error);}}
async function openSources(){sourceShell();if(!management.open)management.showModal();sourceNotice('读取监测账号…');try{await loadRegistry();renderSourceList();sourceNotice('RSS 每 20 分钟串行检查，每个源读取最新 10 篇；无新文章不等于链接异常。');}catch{sourceNotice('无法连接本地来源管理服务。请确认采集器正在运行，再重新打开。',true);}}
function renderSourceList(){
  const labels={ok:'正常',error:'连接/格式异常',unchecked:'待检查'};
  const row=s=>`<tr><td><strong>${safeText(s.name)}</strong><small>${safeText(s.url_label||'微信读书采集 · 非外部 RSS')}</small></td><td>${s.kind==='official'?safeText(s.company)+' · 公司账号':s.kind==='media'?'行业媒体':'原采集账号'}<small>${safeText(s.content_kind||'')}</small></td><td><span class="rss-state ${safeText(s.status)}">${!s.enabled?'已暂停':labels[s.status]||(s.status==='never'?'待同步':s.status==='risk_control'?'上游限频':s.status==='auth_expired'?'登录失效':s.status==='running'?'同步中':s.status)}</span><small>${safeText(s.message||'')}</small></td><td>${rssTime(s.success_at)}<small>${s.count||0} 篇已保存</small></td><td>${s.kind==='legacy'?'<a href="http://127.0.0.1:8080/" target="_blank" rel="noopener">采集器管理 ↗</a>':`<div class="rss-actions"><button data-rss-action="check" data-id="${s.id}" ${!s.enabled?'disabled':''}>检查</button><button data-rss-action="edit" data-id="${s.id}">编辑</button><button data-rss-action="${s.enabled?'pause':'resume'}" data-id="${s.id}">${s.enabled?'暂停':'恢复'}</button><button class="danger" data-rss-action="remove" data-id="${s.id}">移除</button></div>`}</td></tr>`;
  const table=rows=>`<div class="rss-table-wrap"><table class="rss-table"><thead><tr><th>账号</th><th>归属</th><th>连接状态</th><th>最近成功检查</th><th>操作</th></tr></thead><tbody>${rows.map(row).join('')}</tbody></table></div>`;
  management.querySelector('#rss-list').innerHTML=(rssRegistry.sources.length?table(rssRegistry.sources):'<div class="rss-empty">尚未添加 RSS，点击右上角添加。</div>')+(rssRegistry.legacy.length?'<h3 class="rss-section-label">现有采集账号</h3>'+table(rssRegistry.legacy):'');
}
function showSourceForm(s=null){
  const host=management.querySelector('#rss-form');
  host.innerHTML=`<form id="rss-editor"><h3>${s?'编辑订阅':'添加 RSS'}</h3><div class="rss-form-grid"><label class="rss-form-wide">RSS 地址<input name="url" type="url" ${s?'':'required'} placeholder="${s?'留空保留现有链接；填写则替换':'https://…'}" autocomplete="off"></label><label>账号名称<input name="name" value="${safeText(s?.name||'')}" maxlength="100" placeholder="检查后自动填写"></label><label>来源类型<select name="kind"><option value="media">行业媒体</option><option value="official" ${s?.kind==='official'?'selected':''}>公司官方账号</option></select></label><label>归属公司<select name="company"><option value="">请选择</option>${Object.keys(companyLogoFiles).map(c=>`<option ${s?.company===c?'selected':''}>${c}</option>`).join('')}</select></label></div><div id="rss-preview"></div><div class="rss-actions"><button type="submit" class="primary">${s?'保存修改':'检查并预览'}</button><button type="button" id="rss-cancel">取消</button></div></form>`;
  const form=host.querySelector('form');let preview=null;
  const kind=form.elements.kind;const company=form.elements.company;
  const updateKind=()=>{company.closest('label').hidden=kind.value!=='official';company.required=kind.value==='official';};kind.onchange=updateKind;updateKind();
  form.elements.url.oninput=()=>{preview=null;form.querySelector('[type="submit"]').textContent=s?'保存修改':'检查并预览';host.querySelector('#rss-preview').innerHTML='';};
  host.querySelector('#rss-cancel').onclick=()=>host.replaceChildren();
  form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;const values=Object.fromEntries(new FormData(form));sourceNotice('正在处理…');
    try{if(s){await rssAPI('edit',{...values,id:s.id,action:'edit'});}else if(!preview){preview=await rssAPI('preview',{url:values.url});if(!form.elements.name.value)form.elements.name.value=preview.name;host.querySelector('#rss-preview').innerHTML=`<div class="rss-preview"><strong>${safeText(preview.name)}</strong> · ${safeText(preview.content_kind)}<ul>${preview.items.map(i=>`<li>${safeText(i.title)}</li>`).join('')||'<li>当前没有文章，仍可订阅</li>'}</ul></div>`;button.textContent='确认添加';sourceNotice('链接可用，请确认名称和归属后添加。');return;}else{await rssAPI('add',{...values,preview_token:preview.preview_token});}
      host.replaceChildren();await loadRegistry();renderSourceList();await fetchSources();await fetchArticles();sourceNotice(s?'修改已保存。':'已添加，后续自动检查。');
    }catch(error){sourceNotice(error.message,true);}finally{button.disabled=false;}
  };form.elements.url.focus();
}
management.addEventListener('click',async e=>{const button=e.target.closest('[data-rss-action]');if(!button)return;const action=button.dataset.rssAction,s=rssRegistry.sources.find(x=>x.id===button.dataset.id);if(!s)return;if(action==='edit'){showSourceForm(s);return;}if(action==='remove'&&!confirm(`移除“${s.name}”的监测？已保存文章保留在本机数据库。`))return;button.disabled=true;try{await rssAPI(action==='check'?'check':'edit',{id:s.id,action});await loadRegistry();renderSourceList();if(action==='check'||action==='remove'){await fetchSources();await fetchArticles();}sourceNotice(action==='remove'?'已移除监测，历史数据保留。':'状态已更新。');}catch(error){sourceNotice(error.message,true);}finally{button.disabled=false;}});
management.addEventListener('click',e=>{if(e.target===management)management.close();});

// The page refresh now requests a serialized RSS round, waits for the queued
// sources to finish, and only then reloads the local article database.
const readLocalArticles=refresh;
if(!usingSnapshot)refresh=async function(){
  const button=document.getElementById('btn-refresh');button.disabled=true;
  try{
    const batch=await rssAPI('refresh',{});
    const waiting=new Set(batch.source_ids||[]);
    setStatus(`正在刷新 RSS · 0/${waiting.size}`);
    const deadline=Date.now()+5*60*1000;
    while(waiting.size&&Date.now()<deadline){
      await new Promise(resolve=>setTimeout(resolve,5000));
      await loadRegistry();
      for(const source of rssRegistry.sources){
        if(source.checked_at>=batch.started_at)waiting.delete(source.id);
      }
      setStatus(`正在刷新 RSS · ${(batch.queued||0)-waiting.size}/${batch.queued||0}`);
    }
    await readLocalArticles();
    setStatus(`${waiting.size?'部分来源仍在后台刷新':'RSS 刷新完成'} · ${allArticles.length} 篇`);
  }catch(error){
    await readLocalArticles();
    setStatus(`RSS 请求未完成，已显示本地数据 · ${allArticles.length} 篇`);
  }finally{button.disabled=false;}
};

// An open cloud page periodically checks the published snapshot. This is a
// read-only GitHub request and never triggers an upstream RSS fetch.
let cloudSnapshotRefreshPending=false;
async function refreshCloudSnapshot(){
  if(!usingSnapshot||cloudSnapshotRefreshPending||document.visibilityState==='hidden')return;
  cloudSnapshotRefreshPending=true;
  try{
    await fetchSources();
    await fetchArticles();
  }catch(error){
    console.warn('云端快照暂时无法更新，继续显示上次数据',error);
  }finally{
    cloudSnapshotRefreshPending=false;
  }
}
if(usingSnapshot){
  setInterval(refreshCloudSnapshot,5*60*1000);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'&&(!readingLoadedAt||Date.now()-readingLoadedAt.getTime()>5*60*1000))refreshCloudSnapshot();
  });
}
