// W36 周报数据 · 2026-08-31 — 2026-09-06
window.REPORT_DATA = {
  week: '2026 W36',
  range: '08.31 — 09.06',
  meta: '依据本地归档补录：覆盖字节跳动、腾讯、阿里巴巴、美团、小红书的官方技术与招聘内容，并以可核验原文作为本期来源。',
  headlines: [
    {
      title: 'OpenViking 让研发上下文在工具与 Agent 之间持续流动',
      summary: '字节介绍 OpenViking：将代码仓库、决策记录、评审规范和历史经验统一沉淀，使不同工具与 Agent 能复用同一份上下文。重点从“换一个更强 Agent”转向“让组织上下文不丢失”。',
      url: 'https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247522116&idx=1&sn=12549be2892dea3b03f75bb06b9d61c8&chksm=e8e4108313d37418a232db7daf771c0387b63f6de5175ba29155d5adcb22ae7ce93fbfd62fb0#rd',
      tag: '研发效率',
    },
    {
      title: '阿里用 Spec-Driven Development 重新组织 AI 编程协作',
      summary: '阿里技术以“5 人 7 天完成传统 20 人数周工作”为案例讨论 Spec-Driven Development。传播重点不在单次生成速度，而在规格、分工和交付标准如何约束 AI 协作。',
      url: 'https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511376&idx=1&sn=24f1d3ed57ccb6b4faad4a1aaac091bd&scene=58&subscene=0',
      tag: 'AI Coding',
    },
    {
      title: '小红书与 vivo 打通 3D 图片从生成到社交消费的完整链路',
      summary: '双方共同覆盖 3D 内容生成、编码、上传、分发、解码与端侧渲染，让 3D 图片从相册进入内容平台。文章用完整链路解释跨端协作，而非只展示最终效果。',
      url: 'https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg==&mid=2247496302&idx=1&sn=cff53d02e6effd993cb6dd43ec976cce&chksm=cea159ee635e044aa681e2b265c55fbefb6a1747a33e4ddf56c172ee9cdcd55ddcaed231879b#rd',
      tag: '多媒体',
    },
    {
      title: '腾讯拆解 DeepSeek Harness 核心组件 Cordis',
      summary: '腾讯继续追踪 DeepSeek Harness，将关注点落到核心组件 Cordis。相比泛泛谈框架，围绕关键组件解释设计选择，更适合形成可复用的工程知识。',
      url: 'https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803959&idx=1&sn=9d18ecc2139e8ab90a44515ca64b0db5&scene=58&subscene=0',
      tag: 'Agent 工程',
    },
  ],
  industry: {
    sections: {
      '本周判断': {
        content: [
          'AI 编程的竞争焦点进一步上移：上下文管理、规格驱动、评测体系与组件设计比单次代码生成更受重视。',
          '技术内容开始更多解释跨系统链路。OpenViking处理跨 Agent 上下文，小红书与 vivo 处理跨端 3D 内容，美团智播处理数字人直播链路。',
          '招聘内容继续从统一校招入口细分到业务、岗位和“原生职场”体验，候选人需要的不是更多口号，而是更具体的工作场景。',
        ],
        sources: [
          {name:'OpenViking',url:'https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247522116&idx=1&sn=12549be2892dea3b03f75bb06b9d61c8&chksm=e8e4108313d37418a232db7daf771c0387b63f6de5175ba29155d5adcb22ae7ce93fbfd62fb0#rd'},
          {name:'Spec-Driven Development',url:'https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511376&idx=1&sn=24f1d3ed57ccb6b4faad4a1aaac091bd&scene=58&subscene=0'},
          {name:'小红书 3D 图片链路',url:'https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg==&mid=2247496302&idx=1&sn=cff53d02e6effd993cb6dd43ec976cce&chksm=cea159ee635e044aa681e2b265c55fbefb6a1747a33e4ddf56c172ee9cdcd55ddcaed231879b#rd'},
        ],
      },
    },
  },
  companies: [
    {
      id:'bytedance', name:'字节跳动', color:'#18a7b5',
      summary:'以 OpenViking 和 CloudLens 展示研发上下文与可观测性，内容集中在基础设施。',
      sections:{
        '内容观察':{content:['OpenViking 把代码、决策、评审规范和历史经验作为可持续上下文，让多个 Agent 围绕同一份组织知识协作。','CloudLens for TOS 则从日志分析和数据透视切入对象存储治理，延续工具化、平台化表达。'],sources:[{name:'OpenViking',url:'https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247522116&idx=1&sn=12549be2892dea3b03f75bb06b9d61c8&chksm=e8e4108313d37418a232db7daf771c0387b63f6de5175ba29155d5adcb22ae7ce93fbfd62fb0#rd'}]},
        '可借鉴点':{isInsight:true,content:['研发工具内容需要说明它如何进入团队工作流，以及解决的是哪一种长期摩擦，而不只是罗列功能。']},
      },
    },
    {
      id:'tencent', name:'腾讯', color:'#176fd1',
      summary:'技术侧持续拆解 Harness 与沙箱基础设施，招聘侧用“原生职场”讨论新人体验。',
      sections:{
        '内容观察':{content:['Cordis 文章把 Harness 讨论推进到核心组件层，增强工程读者的可操作性。','“什么样的地方，适合成为一个人的原生职场”从新人视角讨论第一份工作的成长环境，是比福利清单更完整的雇主叙事。'],sources:[{name:'Cordis 技术拆解',url:'https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803959&idx=1&sn=9d18ecc2139e8ab90a44515ca64b0db5&scene=58&subscene=0'},{name:'原生职场',url:'https://mp.weixin.qq.com/s?__biz=MTkyNTM0MzA4MQ==&mid=2650971077&idx=1&sn=be668310901843496deffb5dc2c319c9&chksm=406ad2322ee614d1dd48f3de3a4f99102a7c354819d607cc323d0191f28e8d357bbf8401deee#rd'}]},
        '可借鉴点':{isInsight:true,content:['技术内容与新人体验内容可以共同回答“加入后做什么、怎样成长”，比各自孤立传播更有说服力。']},
      },
    },
    {
      id:'alibaba', name:'阿里巴巴', color:'#ff6a00',
      summary:'从 Agent 评测到 Spec-Driven Development，连续讨论 AI 工程质量与协作标准。',
      sections:{
        '内容观察':{content:['Agent 精细化评测关注评测体系设计和工程实践，补足“能做”之后如何判断“做得好”。','Spec-Driven Development 用团队规模和交付周期做案例入口，把规范化协作讲成直观的效率故事。'],sources:[{name:'Agent 精细化评测',url:'https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511370&idx=1&sn=c9f4ff1d054cb229ac2f8c1462fcb05e&scene=58&subscene=0'},{name:'Spec-Driven Development',url:'https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511376&idx=1&sn=24f1d3ed57ccb6b4faad4a1aaac091bd&scene=58&subscene=0'}]},
        '可借鉴点':{isInsight:true,content:['用可核查的项目规模、周期和质量标准讲 AI 效率，远比“提效数倍”的抽象表述更可信。']},
      },
    },
    {
      id:'meituan', name:'美团', color:'#e9a400',
      summary:'技术内容聚焦数字人直播，招聘则细分到核心商业、战略投资与 Keeta 全球业务。',
      sections:{
        '内容观察':{content:['美团智播围绕数字人直播的技术创新与实践展开，业务目标清晰，便于读者理解技术价值。','招聘内容按业务单元分发，候选人可以直接看到本地商业、战略投资与全球业务的差异。'],sources:[{name:'美团智播',url:'https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651783277&idx=1&sn=69b406db34fc05f4a17b0310dcf3a7f5&scene=58&subscene=0'}]},
        '可借鉴点':{isInsight:true,content:['技术品牌内容若能把模型或系统放进具体业务链路，更容易同时吸引工程人才和业务人才。']},
      },
    },
    {
      id:'xiaohongshu', name:'小红书', color:'#ff3157',
      summary:'一周两篇技术内容分别覆盖搜索生成式召回与跨端 3D 图片，场景差异鲜明。',
      sections:{
        '内容观察':{content:['GR-Inference 面向“长 Context、短 Decode、大 Beam”的生成式召回推理需求，展示小红书与 NVIDIA 的联合优化。','与 vivo 的 3D 图片合作覆盖生成、编码、上传、分发、解码和渲染，技术链路完整且用户体验直观。'],sources:[{name:'GR-Inference',url:'https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg==&mid=2247496301&idx=1&sn=c06125bed8f45cfc3a3c868e454d8172&chksm=ce5f991b014f4a44555e380b6cdeba4a9d6b9a91126895d8168e8fa5746a625296d25c37e506#rd'},{name:'3D 图片技术实践',url:'https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg==&mid=2247496302&idx=1&sn=cff53d02e6effd993cb6dd43ec976cce&chksm=cea159ee635e044aa681e2b265c55fbefb6a1747a33e4ddf56c172ee9cdcd55ddcaed231879b#rd'}]},
        '可借鉴点':{isInsight:true,content:['一篇偏底层性能、一篇偏用户体验，组合起来能同时证明技术深度和产品影响力。']},
      },
    },
  ],
};
