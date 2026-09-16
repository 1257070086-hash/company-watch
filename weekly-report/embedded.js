// Native weekly-report panel. Shadow DOM keeps report styles out of the dashboard.
class IndustryWeekly extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.cache = new Map();
this.shadowRoot.innerHTML = `<link rel="stylesheet" href="weekly-report/embedded.css?v=20260916-quiet"><link rel="stylesheet" href="weekly-report/embedded-layout.css?v=20260916-quiet"><div class="toolbar"><select aria-label="选择周报"><option value="37">2026 W37 · 最新一期</option>${Array.from({length:21},(_,i)=>36-i).map(w=>`<option value="${w}">2026 W${w}</option>`).join('')}</select></div><div class="content" aria-live="polite"></div>`;
    const picker = this.shadowRoot.querySelector('select');
    picker.id = 'week-picker';
    const toolbar = this.shadowRoot.querySelector('.toolbar');
    toolbar.className = 'masthead';
    toolbar.id = 'report-top';
    toolbar.innerHTML = '<div><h1>行业周报</h1></div><div class="issue-picker"><label for="week-picker">历史刊期</label></div>';
    toolbar.querySelector('.issue-picker').appendChild(picker);
    picker.addEventListener('change', () => this.load(true));
    this.shadowRoot.addEventListener('click', event => {
      const button = event.target.closest('[data-section]');
      if (button) this.shadowRoot.getElementById(button.dataset.section)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      if (event.target.closest('[data-retry]')) this.load(true);
      const company = event.target.closest('[data-company-view]');
      if (company) { window.switchCompany(company.dataset.companyView); window.switchView('brief'); }
    });
  }
  async load(force = false) {
    const week = this.shadowRoot.querySelector('select').value;
    if (this.loaded === week && !force) return;
    this.loaded = week;
    const content = this.shadowRoot.querySelector('.content');
    content.textContent = '正在加载周报…';
    try {
      // Serialize script loading because historical data files share REPORT_DATA.
      this.pending = (this.pending || Promise.resolve()).catch(() => {}).then(async () => {
        if (!this.cache.has(week)) {
          if(week==='37') {
            this.cache.set(week,await window.monitorWeeklyData());
          } else {
          await new Promise((resolve,reject) => {
            const script = document.createElement('script');
            script.src = week === '34' ? 'weekly-report/data.js' : `weekly-report/data-W${week}.js`;
            script.src += '?links=20260908-complete'; script.onload = () => { this.cache.set(week,window.REPORT_DATA); script.remove(); resolve(); };
            script.onerror = () => { script.remove(); reject(new Error('load failed')); };
            document.head.appendChild(script);
          });
          }
        }
        if (this.loaded === week) this.render(this.cache.get(week));
      });
      await this.pending;
    } catch (error) {
      if (this.loaded === week) { this.loaded = null; content.innerHTML = '<div class="error">周报加载失败，请重试。<button data-retry>重新加载</button></div>'; }
    }
  }
  render(data) {
    const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const url = value => { try { const u=new URL(value); return /^https?:$/.test(u.protocol)?escape(u.href):'#'; } catch { return '#'; } };
    // Preserve only the existing emphasis tags; all other source HTML stays escaped.
    const rich = value => escape(value).replace(/&lt;(\/?)(strong|b|em)&gt;/gi, '<$1$2>');
    const link = (value, label, cls = '') => {
      const href = url(value);
      return href !== '#' ? `<a class="${cls}" href="${href}" target="_blank" rel="noopener" title="${escape(label)}">${escape(label)} <span aria-hidden="true">↗</span></a>` : `<span class="${cls}" aria-disabled="true">${escape(label)} · 来源待核实</span>`;
    };
    const sections = items => Object.entries(items || {}).map(([title, section]) => {
      const insight = section.isInsight || title.includes('启示');
      return `<section class="report-section${insight ? ' insight' : ''}"><h3>${escape(title)}</h3>${Array.isArray(section.content) ? `<ul>${section.content.map(t => `<li>${rich(t)}</li>`).join('')}</ul>` : `<p>${rich(section.content)}</p>`}${section.sources?.length ? `<div class="sources"><span class="sources-label">来源</span>${section.sources.map(s => link(s.url, s.name, 'source-link')).join('')}</div>` : ''}</section>`;
    }).join('');
    const card = co => `<article class="company" id="section-${escape(co.id)}" style="--brand:${/^#[a-f\d]{6}$/i.test(co.color) ? co.color : '#245bba'}"><header class="company-header"><h2>${escape(co.name)}</h2>${co.summary ? `<p class="company-summary">${escape(co.summary)}</p>` : ''}${co.id!=='industry'?`<button class="company-view" data-company-view="${escape(co.name.includes('阿里')?'阿里':co.name)}">查看最新动态 ↗</button>`:''}</header>${sections(co.sections)}</article>`;
    const nav = [{id:'headlines', name:'本周头条'}, {id:'industry', name:'行业综合'}, ...data.companies];
    this.shadowRoot.querySelector('.content').innerHTML = `<div class="edition"><strong>${escape(data.week)}</strong><span>${escape(data.range)}</span></div>${data.meta?`<details class="report-scope"><summary>本期收录范围</summary><p>${escape(data.meta)}</p></details>`:''}
      <div class="reading-layout"><main class="reading">
      <section class="block" id="section-headlines"><div class="section-heading"><h2>本周头条</h2><span>THE WEEK IN FOCUS</span></div>
      ${data.headlines.map((h, i) => `<article class="headline"><div class="headline-top"><span class="rank">${i === 0 ? '本期焦点 / 01' : String(i+1).padStart(2, '0')}</span><span class="tag">${escape(h.tag)}</span></div><h3>${link(h.url, h.title)}</h3><p class="excerpt">${rich(h.summary)}</p>${link(h.url, '阅读原文', 'original')}</article>`).join('')}
      </section>
      <section class="block">${card({id:'industry',name:'行业综合',color:'#245bba',summary:'',sections:data.industry?.sections})}</section>
      <div class="section-heading"><h2>公司观察</h2><span>COMPANY WATCH</span></div>${data.companies.map(card).join('')}
      <p class="report-end">${escape(data.week)} · 本期完</p></main>
      <nav class="toc" aria-label="周报章节目录"><p class="toc-label">本期目录</p>${nav.map((co,i) => `<button data-section="section-${escape(co.id)}" aria-current="${i===0}">${escape(co.name)}</button>`).join('')}<button class="back-top" data-section="report-top">↑ 返回刊头</button></nav></div>`;
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        this.shadowRoot.querySelectorAll('.toc button[data-section]').forEach(button => button.setAttribute('aria-current', String(button.dataset.section === entry.target.id)));
      }
    }, {rootMargin:'-80px 0px -65% 0px', threshold:0});
    nav.forEach(co => this.observer.observe(this.shadowRoot.getElementById(`section-${co.id}`)));
    const status = document.getElementById('weekly-status');
    if (status) status.textContent = `${data.week} · ${data.range}`;
  }
}
customElements.define('industry-weekly',IndustryWeekly);
