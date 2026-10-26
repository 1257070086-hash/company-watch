// Native weekly-report panel. Shadow DOM keeps report styles out of the dashboard.
class IndustryWeekly extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.cache = new Map();
    this.issues = [
      ['43','10.19 至 10.25'],['42','10.12 至 10.18'],['41','10.05 至 10.11'],['40','09.28 至 10.04'],
      ['39','09.21 至 09.27'],['38','09.14 至 09.20'],
      ['37','09.07 至 09.13'],['36','08.31 至 09.06'],['35','08.24 至 08.30'],
      ['34','08.17 至 08.23'],['33','08.10 至 08.16'],['32','08.04 至 08.10'],
      ['31','07.28 至 08.03'],['30','07.21 至 07.27'],['29','07.14 至 07.20'],
      ['28','07.07 至 07.13'],['27','06.30 至 07.06'],['26','06.23 至 06.29'],
      ['25','06.16 至 06.22'],['24','06.09 至 06.15'],['23','06.02 至 06.08'],
      ['22','05.26 至 06.01'],['21','05.19 至 05.25'],['20','05.13 至 05.19'],
      ['19','05.06 至 05.12'],['18','04.28 至 05.05'],['17','04.21 至 04.27'],
      ['16','04.14 至 04.19']
    ];
    const options = this.issues.map(([week,range],index) =>
      `<option value="${week}">${this.pickerRange(range)} · 第${week}期${index===0?'（最新）':''}</option>`
    ).join('');
    this.shadowRoot.innerHTML = `<link rel="stylesheet" href="weekly-report/embedded.css?v=20261026-w43"><link rel="stylesheet" href="weekly-report/embedded-layout.css?v=20261026-w43"><div class="masthead" id="report-top"><div><h1>行业周报</h1><p>招聘 · 技术 · 企业文化 · 行业趋势</p></div><div class="issue-picker"><label for="week-picker">选择期数</label><select id="week-picker" aria-label="选择周报日期">${options}</select></div></div><div class="content" aria-live="polite"></div>`;
    this.shadowRoot.querySelector('select').addEventListener('change', () => this.load(true));
    this.shadowRoot.addEventListener('click', event => {
      const button = event.target.closest('[data-section]');
      if (button) { this.shadowRoot.querySelectorAll('[data-section]').forEach(b => b.removeAttribute('aria-current')); button.setAttribute('aria-current','location'); }
      if (button) {
        const target = this.shadowRoot.getElementById(button.dataset.section);
        target?.setAttribute('tabindex','-1');
        target?.focus({preventScroll:true});
        target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      }
      if (event.target.closest('[data-retry]')) this.load(true);
      const page = event.target.closest('[data-week-target]');
      if (page) { this.shadowRoot.querySelector('select').value = page.dataset.weekTarget; this.load(); this.shadowRoot.getElementById('report-top').scrollIntoView({block:'start'}); }
      const company = event.target.closest('[data-company-view]');
      if (company && window.switchCompany && window.switchView) { window.switchCompany(company.dataset.companyView); window.switchView('brief'); }
    });
  }

  pickerRange(range) {
    const [start,end] = range.split(/\s*(?:至|—)\s*/);
    const readable = value => {
      const [month,day] = String(value || '').split('.').map(Number);
      return month && day ? `${month}月${day}日` : value;
    };
    return `${readable(start)}—${readable(end)}`;
  }

  displayRange(range) {
    return `2026年${this.pickerRange(String(range || '').replace(/—/g,'至'))}`;
  }

  async issueData(week) {
    if (this.cache.has(week)) return this.cache.get(week);
    this.pending = (this.pending || Promise.resolve()).catch(() => {}).then(async () => {
      if (this.cache.has(week)) return;
      if (week === '37') {
        this.cache.set(week, await window.monitorWeeklyData());
        return;
      }
      await new Promise((resolve,reject) => {
        const script = document.createElement('script');
        script.src = week === '34' ? 'weekly-report/data.js' : `weekly-report/data-W${week}.js`;
        script.src += '?v=20261026-w43';
        window.REPORT_DATA = undefined;
        script.onload = () => {
          if (!window.REPORT_DATA || !Array.isArray(window.REPORT_DATA.companies)) { script.remove(); reject(new Error('invalid report')); return; }
          this.cache.set(week, window.REPORT_DATA);
          script.remove();
          resolve();
        };
        script.onerror = () => { script.remove(); reject(new Error('load failed')); };
        document.head.appendChild(script);
      });
    });
    await this.pending;
    return this.cache.get(week);
  }

  async load(force = false) {
    const week = this.shadowRoot.querySelector('select').value;
    if (this.loaded === week && !force) return;
    this.loaded = week;
    this.sectionObserver?.disconnect();
    const request = this.request = (this.request || 0) + 1;
    const content = this.shadowRoot.querySelector('.content');
    content.setAttribute('aria-busy', 'true');
    content.innerHTML = '<p class="feed-loading" role="status">正在加载周报…</p>';
    try {
      const data = await this.issueData(week);
      if (this.request !== request) return;
      const index = this.issues.findIndex(([value]) => value === week);
      const page = (offset, label) => this.issues[index + offset] ? `<button data-week-target="${this.issues[index + offset][0]}">${label} · W${this.issues[index + offset][0]}</button>` : `<span>${offset < 0 ? '已是最新一期' : '已是最早一期'}</span>`;
      content.innerHTML = this.issueMarkup(data, index === 0) + `<nav class="pagination" aria-label="切换周报">${page(1,'← 上一期')}${page(-1,'下一期 →')}</nav>`;
      this.watchSections();
      const status = document.getElementById('weekly-status');
      if (status) status.textContent = `${this.displayRange(data.range)} · W${week}`;
    } catch (error) {
      if (this.request === request) {
        this.loaded = null;
        content.innerHTML = '<div class="error" role="alert">周报加载失败，请重试。<button data-retry>重新加载</button></div>';
      }
    } finally {
      if (this.request === request) content.removeAttribute('aria-busy');
    }
  }

  disconnectedCallback() { this.sectionObserver?.disconnect(); }

  watchSections() {
    if (!('IntersectionObserver' in window)) return;
    this.sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      const id = visible[0].target.id;
      this.shadowRoot.querySelectorAll('[data-section]').forEach(button => {
        if (button.dataset.section === id) button.setAttribute('aria-current','location');
        else button.removeAttribute('aria-current');
      });
    }, {rootMargin:'-100px 0px -55% 0px', threshold:0});
    this.shadowRoot.querySelectorAll('.reading [id]').forEach(section => this.sectionObserver.observe(section));
  }

  issueMarkup(data, latest) {
    const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const url = value => { try { const u=new URL(value); return /^https?:$/.test(u.protocol)?escape(u.href):'#'; } catch { return '#'; } };
    const rich = value => escape(value).replace(/&lt;(\/?)(strong|b|em)&gt;/gi, '<$1$2>');
    const link = (value, label, cls = '') => {
      const href = url(value);
      return href !== '#' ? `<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer" title="${escape(label)}">${escape(label)} <span aria-hidden="true">↗</span></a>` : `<span class="${cls}" aria-disabled="true">${escape(label)} · 来源待核实</span>`;
    };
    const issue = String(data.week || '').match(/W(\d+)/i)?.[1] || '';
    const prefix = `issue-${issue}`;
    const sections = items => Object.entries(items || {}).filter(([title, section]) => section.display !== false && !/数据口径|数据缺口|核验说明/.test(title)).map(([title, section]) => {
      const insight = section.isInsight || title.includes('启示');
      return `<section class="report-section${insight ? ' insight' : ''}"><h3>${escape(title)}</h3>${Array.isArray(section.content) ? `<ul>${section.content.map(t => `<li>${rich(t)}</li>`).join('')}</ul>` : `<p>${rich(section.content)}</p>`}${section.sources?.length ? `<details class="sources"><summary>查看来源 · ${section.sources.length} 篇</summary><ul>${section.sources.map(s => `<li>${link(s.url, s.name, 'source-link')}${s.published_at ? `<span class="source-date">${escape(s.published_at.slice(0,10))}</span>` : ''}</li>`).join('')}</ul></details>` : ''}</section>`;
    }).join('');
    const companies = (data.companies || []).filter(co => Object.values(co.sections || {}).some(s => s.display !== false));
    const card = co => `<article class="company" data-node="${escape(co.name)}" id="${prefix}-section-${escape(co.id)}" style="--brand:${/^#[a-f\d]{6}$/i.test(co.color) ? co.color : '#245bba'}"><header class="company-header"><h2>${escape(co.name)}</h2>${co.summary ? `<p class="company-summary">${escape(co.summary)}</p>` : ''}${co.id!=='industry'?`<button class="company-view" data-company-view="${escape(co.name.includes('阿里')?'阿里':co.name)}">查看最新动态 ↗</button>`:''}</header>${sections(co.sections)}${co.takeaway ? `<aside class="takeaway"><h3><span aria-hidden="true">↗</span> 可借鉴点 <small>编辑观察</small></h3><p>${escape(co.takeaway)}</p></aside>` : ''}</article>`;
    const nav = [{id:'headlines', name:'本周头条'}, {id:'industry', name:'行业综合'}, ...companies];
    return `<section class="weekly-issue" data-week="${escape(issue)}">
      <header class="issue-header"><div class="eyebrow"><span>W${escape(issue)}${latest?' · 最新':''}</span></div><h2>2026年第${escape(issue)}周</h2><p class="issue-date">${escape(this.displayRange(data.range))}${data.updatedAt ? ` · <time datetime="${escape(data.updatedAt)}">${escape(data.updatedAt.replace(/-/g,'/'))} 更新</time>` : ''}</p>
</header>
      <div class="issue-body">
        <aside class="directory"><nav class="issue-toc" aria-label="第${escape(issue)}期目录"><p>本期目录</p>${nav.map((co,i) => `<button data-section="${prefix}-section-${escape(co.id)}"${i===0?' aria-current="location"':''}>${escape(co.name)}</button>`).join('')}</nav></aside>
        <main class="reading">
          <section class="block" id="${prefix}-section-headlines"><div class="section-heading"><h2>本周头条</h2></div>
          ${(data.headlines || []).map((h, i) => `<article class="headline" data-node="重点 ${String(i+1).padStart(2, '0')}"><div class="headline-top"><span class="rank">${i === 0 ? '本期焦点 / 01' : String(i+1).padStart(2, '0')}</span><span class="tag">${escape(h.tag)}</span>${h.published_at ? `<time>${escape(h.published_at.slice(0,10))}</time>` : ''}</div><h3>${link(h.url, h.title)}</h3><p class="excerpt">${rich(h.summary)}</p>${link(h.url, '阅读原文', 'original')}</article>`).join('')}
          </section>
          <section class="block">${card({id:'industry',name:'行业综合',color:'#245bba',summary:'',sections:data.industry?.sections})}</section>
          <div class="section-heading"><h2>公司观察</h2></div>${companies.map(card).join('')}
          <p class="report-end">${escape(this.displayRange(data.range))} · 第${escape(issue)}期完</p>
        </main>
      </div>
    </section>`;
  }
}
customElements.define('industry-weekly',IndustryWeekly);
