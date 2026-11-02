# W44核验记录

固定快照：`33de140895a20936657dedd24fd209ab4015ef3c`。统计采用北京时间左闭右开区间：2026-10-26 00:00至2026-11-02 00:00。

- 全部官方监测账号均读取成功；共20/24个源读取成功，命中65条、10条无正文。另4个大体积媒体文件未读，不将20源统计称为全部采集统计。
- `articles.json`逐条保留原始日期、北京时间、原文URL、正文长度/摘要可用性、正文摘要片段与SHA256、固定快照入口、纳入决定和边界。正文状态从body_text/content_text/description/content_html判断，不用AI摘要补作正文。
- 微信按解码后的__biz、mid、idx去重，未发现重复身份。字节双号同题保留两个原文、只分析一次。阿里跨周公益故事只分析再传播，不视为新项目。
- 未单独打开所有微信原文；核对的是快照的date_published和原文URL，未宣称所有链接当前可达。对图片依赖、正文截断和跨年旧信息逐条标注。
- 65条中39条作为本期可追溯来源，其余保留取舍原因。未使用媒体人事传闻推断招聘政策。
- meta.json、summary-meta.json、feeds.json均保存同一固定快照原文；摘要本次completed=0不等于每条正文齐全。

## 页面接入

沿用W43的industry/headlines/companies结构和现有embedded.css、embedded-layout.css。新增data-W44.json、data-W44.js、2026-W44.md及本目录。embedded.js期数列表首位加入W44（10.26至11.01），index.html更新embedded.js缓存版本。默认最新期和W43/W44翻页由现有组件生成。不修改历史W43内容和页面背景、字体、配色。
