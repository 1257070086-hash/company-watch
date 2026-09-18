// Native weekly-report panel. Shadow DOM keeps report styles out of the dashboard.
class IndustryWeekly extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.cache = new Map();
    this.issues = [
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
    this.shadowRoot.innerHTML = `<link rel="stylesheet" href="weekly-report/embedded.css?v=20260916-quiet"><link rel="stylesheet" href="weekly-report/embedded-layout.css?v=20260918-issue-timeline"><div class="masthead" id="report-top"><div><h1>行业周报</h1><p>按日期连续阅读，向下滚动查看往期</p></div><div class="issue-picker"><label for="week-picker">快速跳转</label><select id="week-picker" aria-label="选择周报日期">${options}</select></div></div><div class="content" aria-live="polite"></div>`;
    this.shadowRoot.querySelector('select').addEventListener('change', () => this.load(true));
    this.shadowRoot.addEventListener('click', event => {
      const button = event.target.closest('[data-section]');
      if (button) this.shadowRoot.getElementById(button.dataset.section)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      if (event.target.closest('[data-retry]')) this.load(true);
      if (event.target.closest('[data-load-older]')) this.appendOlder();
      const company = event.target.closest('[data-company-view]');
      if (company) { window.switchCompany(company.dataset.companyView); window.switchView('brief'); }
    });
  }

  pickerRange(range) {
    const [start,end] = range.split(/\s*(?:至|—)\s*/);
    const readable = value => {
      const [month,day] = value.split('.').map(Number);
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
        script.src += '?links=20260908-complete';
        script.onload = () => {
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
    this.nextIssueIndex = this.issues.findIndex(([value]) => value === week);
    const content = this.shadowRoot.querySelector('.content');
    content.innerHTML = '<div class="feed-loading">正在加载周报…</div>';
    this.feedObserver?.disconnect();
    try {
      const data = await this.issueData(week);
      if (this.loaded !== week) return;
      content.innerHTML = '<div class="issue-feed"></div><div class="older-sentinel" aria-live="polite"></div>';
      this.appendIssue(data, this.nextIssueIndex === 0);
      this.nextIssueIndex += 1;
      await this.appendOlder();
      this.watchFeedEnd();
      const status = document.getElementById('weekly-status');
      if (status) status.textContent = `${this.displayRange(data.range)} · 第${week}期`;
    } catch (error) {
      if (this.loaded === week) {
        this.loaded = null;
        content.innerHTML = '<div class="error">周报加载失败，请重试。<button data-retry>重新加载</button></div>';
      }
    }
  }

  watchFeedEnd() {
    this.feedObserver?.disconnect();
    const sentinel = this.shadowRoot.querySelector('.older-sentinel');
    if (!sentinel || !('IntersectionObserver' in window)) return;
    this.feedObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) this.appendOlder();
    }, {rootMargin:'500px 0px'});
    this.feedObserver.observe(sentinel);
  }

  async appendOlder() {
    if (this.loadingOlder) return;
    const sentinel = this.shadowRoot.querySelector('.older-sentinel');
    if (!sentinel) return;
    if (this.nextIssueIndex >= this.issues.length) {
      sentinel.innerHTML = '<p class="feed-end">已显示全部周报</p>';
      this.feedObserver?.disconnect();
      return;
    }
    this.loadingOlder = true;
    const [week] = this.issues[this.nextIssueIndex];
    sentinel.innerHTML = '<button class="load-older" data-load-older disabled>正在载入更早周报…</button>';
    try {
      const data = await this.issueData(week);
      if (!this.shadowRoot.querySelector(`.weekly-issue[data-week="${week}"]`)) this.appendIssue(data, false);
      this.nextIssueIndex += 1;
      sentinel.innerHTML = this.nextIssueIndex < this.issues.length
        ? '<button class="load-older" data-load-older>继续查看更早周报</button>'
        : '<p class="feed-end">已显示全部周报</p>';
    } catch {
      sentinel.innerHTML = '<button class="load-older" data-load-older>载入失败，点击重试</button>';
    } finally {
      this.loadingOlder = false;
    }
  }

  appendIssue(data, latest) {
    const feed = this.shadowRoot.querySelector('.issue-feed');
    if (!feed || !data) return;
    feed.insertAdjacentHTML('beforeend', this.issueMarkup(data, latest));
  }

  issueMarkup(data, latest) {
    const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const url = value => { try { const u=new URL(value); return /^https?:$/.test(u.protocol)?escape(u.href):'#'; } catch { return '#'; } };
    const rich = value => escape(value).replace(/&lt;(\/?)(strong|b|em)&gt;/gi, '<$1$2>');
    const link = (value, label, cls = '') => {
      const href = url(value);
      return href !== '#' ? `<a class="${cls}" href="${href}" target="_blank" rel="noopener" title="${escape(label)}">${escape(label)} <span aria-hidden="true">↗</span></a>` : `<span class="${cls}" aria-disabled="true">${escape(label)} · 来源待核实</span>`;
    };
    const issue = String(data.week || '').match(/W(\d+)/i)?.[1] || '';
    const prefix = `issue-${issue}`;
    const sections = items => Object.entries(items || {}).map(([title, section]) => {
      const insight = section.isInsight || title.includes('启示');
      return `<section class="report-section${insight ? ' insight' : ''}"><h3>${escape(title)}</h3>${Array.isArray(section.content) ? `<ul>${section.content.map(t => `<li>${rich(t)}</li>`).join('')}</ul>` : `<p>${rich(section.content)}</p>`}${section.sources?.length ? `<div class="sources"><span class="sources-label">来源</span>${section.sources.map(s => link(s.url, s.name, 'source-link')).join('')}</div>` : ''}</section>`;
    }).join('');
    const card = co => `<article class="company" id="${prefix}-section-${escape(co.id)}" style="--brand:${/^#[a-f\d]{6}$/i.test(co.color) ? co.color : '#245bba'}"><header class="company-header"><h2>${escape(co.name)}</h2>${co.summary ? `<p class="company-summary">${escape(co.summary)}</p>` : ''}${co.id!=='industry'?`<button class="company-view" data-company-view="${escape(co.name.includes('阿里')?'阿里':co.name)}">查看最新动态 ↗</button>`:''}</header>${sections(co.sections)}</article>`;
    const nav = [{id:'headlines', name:'本周头条'}, {id:'industry', name:'行业综合'}, ...(data.companies || [])];
    return `<section class="weekly-issue" data-week="${escape(issue)}">
      <aside class="issue-time"><span class="issue-dot" aria-hidden="true"></span><time><span class="issue-year">2026年</span>${escape(this.pickerRange(String(data.range || '').replace(/—/g,'至')))}</time><span class="issue-number">第${escape(issue)}期${latest?' · 最新':''}</span></aside>
      <div class="issue-body">
        ${data.meta?`<details class="report-scope"><summary>本期收录范围</summary><p>${escape(data.meta)}</p></details>`:''}
        <nav class="issue-toc" aria-label="第${escape(issue)}期目录">${nav.map((co,i) => `<button data-section="${prefix}-section-${escape(co.id)}"${i===0?' class="primary"':''}>${escape(co.name)}</button>`).join('')}</nav>
        <main class="reading">
          <section class="block" id="${prefix}-section-headlines"><div class="section-heading"><h2>本周头条</h2></div>
          ${(data.headlines || []).map((h, i) => `<article class="headline"><div class="headline-top"><span class="rank">${i === 0 ? '本期焦点 / 01' : String(i+1).padStart(2, '0')}</span><span class="tag">${escape(h.tag)}</span></div><h3>${link(h.url, h.title)}</h3><p class="excerpt">${rich(h.summary)}</p>${link(h.url, '阅读原文', 'original')}</article>`).join('')}
          </section>
          <section class="block">${card({id:'industry',name:'行业综合',color:'#245bba',summary:'',sections:data.industry?.sections})}</section>
          <div class="section-heading"><h2>公司观察</h2></div>${(data.companies || []).map(card).join('')}
          <p class="report-end">${escape(this.displayRange(data.range))} · 第${escape(issue)}期完</p>
        </main>
      </div>
    </section>`;
  }
}
customElements.define('industry-weekly',IndustryWeekly);
