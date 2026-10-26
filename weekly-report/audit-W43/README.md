# W43 取材与接入说明

统计期：2026-10-19 00:00（北京时间）至2026-10-26 00:00（不含）。

固定数据版本：cloud-data 的 `74acf313c489f9713be9e2107d5fe05f59f27850`。读取全部24个源文件，18个源命中104条，16条无正文；45篇进入报告引用。以微信 `__biz:mid:idx` 去除链接参数重复，本期删除0条；三组跨账号同题合并分析，原始链接分别保留。

正文有无、字符数、来源文件、北京时间、原文链接、固定提交下的快照链接、取舍理由及文件SHA-256，见 `articles.json`。正文主要来自 `body_text`，若为空则使用去标签后的 `content_html`；不以AI摘要代替原文。未逐张核验图片、视频、报名页；短文本和域名占位不补写为完整正文或链接。少数外部研究及产品数据只按官方文章自述，不宣称独立验证。

`meta.json` 和 `summary-meta.json` 是固定版本的原样状态：北京时间20:12:28采集、20:13:04摘要。后者completed=0、failed=0、pendingAfterRun=0，表示该次无新增待摘要条目，不否定19:33前一次completed=5的状态。未重做历史摘要排障。

## 文件

- `../2026-W43.md`：完整Markdown，沿用W42栏目并加入可见的证据边界和快手建议。
- `../data-W43.json`：结构化数据，兼容现有headlines、industry、companies字段。
- `../data-W43.js`：同一数据封装为 `window.REPORT_DATA`，供现有组件加载。
- `articles.json`：104条逐条审计与全部24源的覆盖表。
- `meta.json`、`summary-meta.json`、`feeds.json`：该版监测状态和源目录。

## 接入

1. 将上述W43文件和audit-W43目录放入仓库weekly-report。
2. 在weekly-report/embedded.js的issues数组首位加入 `['43','10.19 至 10.25']`。
3. 将该组件资源版本及index.html中的embedded.js版本更新为 `20261026-w43`。
4. 运行 `node --test tests/weekly-reader.test.cjs`、两个JS文件的 `node --check` 和 `git diff --check`。
5. 发布后打开 `/?view=weekly&v=20261026-w43`，核对默认W43、日期、正文、证据边界及W42往返切换。

本次改动仅新增周报、素材审计和入口版本，未改动RSS采集、摘要任务及历史周报正文。
