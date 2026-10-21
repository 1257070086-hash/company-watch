const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
function setup(){
  const select={value:'42',addEventListener(){}};
  const content={innerHTML:'',setAttribute(){},removeAttribute(){}};
  const shadow={innerHTML:'',querySelector:s=>s==='select'?select:content,addEventListener(){}};
  const context={URL,window:{},document:{getElementById(){return null}},HTMLElement:class{attachShadow(){this.shadowRoot=shadow;}},customElements:{define(_,C){this.C=C}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'weekly-report/embedded.js'),'utf8'),context);
  const element=new context.customElements.C();
  return {element,content,select,context};
}
const data=JSON.parse(fs.readFileSync(path.join(root,'weekly-report/data-W42.json'),'utf8'));
test('W42 renders all sections and traceable sources on one issue',()=>{
 const {element}=setup();const html=element.issueMarkup(data,true);
 for(const name of ['10月12日','10月18日','可借鉴点','编辑观察'])assert(html.includes(name));
 const ids=[...html.matchAll(/data-section="([^"]+)"/g)].map(m=>m[1]);
 for(const id of ids)assert(html.includes(`id="${id}"`));
 assert.equal((html.match(/class="weekly-issue"/g)||[]).length,1);
 assert(!html.includes('数据覆盖说明'));assert(!html.includes('数据口径与缺口'));assert(!html.includes('周内未命中条目'));assert(html.includes('查看来源'));assert(!html.includes('来源待核实'));
 assert(html.includes('2026-10-16'));assert(html.includes('rel="noopener noreferrer"'));
});
test('untrusted text and non-HTTP source URLs cannot execute markup',()=>{
 const {element}=setup();const bad={...data,headlines:[{title:'<img src=x onerror=alert(1)>',summary:'<script>alert(1)</script><strong>safe</strong>',url:'javascript:alert(1)'}]};
 const html=element.issueMarkup(bad,true);assert(!html.includes('<img'));assert(!html.includes('<script>'));assert(!html.includes('href="javascript:'));assert(html.includes('<strong>safe</strong>'));
});
test('rapid switches only render the last selection, without older autoload',async()=>{
 const {element,content,select}=setup();const pending={};const calls=[];
 element.issueData=w=>{calls.push(w);return new Promise(r=>pending[w]=r)};
 const first=element.load();select.value='41';const second=element.load();
 pending['41']({...data,week:'2026 W41'});await second;pending['42'](data);await first;
 assert(content.innerHTML.includes('data-week="41"'));assert(!content.innerHTML.includes('data-week="42"'));assert.deepEqual(calls,['42','41']);
 assert(content.innerHTML.includes('data-week-target="42"'));assert(content.innerHTML.includes('data-week-target="40"'));
});
test('failed load is retryable and latest issue has no newer link',async()=>{
 const {element,content}=setup();element.issueData=async()=>{throw new Error('offline')};await element.load();assert(content.innerHTML.includes('data-retry'));assert.equal(element.loaded,null);
 element.issueData=async()=>data;await element.load();assert(content.innerHTML.includes('已是最新一期'));assert(content.innerHTML.includes('data-week-target="41"'));assert(!content.innerHTML.includes('data-week-target="43"'));
});
test('primary text colors exceed 4.5:1 on their reading backgrounds',()=>{
 const luminance=hex=>{const rgb=hex.match(/\w\w/g).map(h=>parseInt(h,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb.reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)};
 for(const [text,bg] of [['243247','ffffff'],['17263c','ffffff'],['526177','ffffff'],['2155a3','edf3fc'],['645025','fff8e9'],['3b4b60','f4f7fc']])assert((luminance(bg)+.05)/(luminance(text)+.05)>=4.5,`${text}/${bg}`);
});
