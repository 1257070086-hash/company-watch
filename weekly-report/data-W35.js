// W35 周报数据 · 2026-08-24 — 2026-08-30
window.REPORT_DATA = {
  week: '2026 W35',
  range: '08.24 — 08.30',
  meta: '依据本地归档补录：覆盖字节跳动、腾讯、阿里巴巴、美团、小红书的官方技术与招聘内容，并以可核验原文作为本期来源。',
  headlines: [
    {
      title: '腾讯混元 Hy4 preview 开源：超长上下文与生产力任务成为主叙事',
      summary: '腾讯混元发布并开源 Hy4 preview，官方披露总参数 770B、激活参数 49B，上下文长度超过 1M，并将代码、办公和科学任务作为核心应用方向。相比单纯强调榜单，本次传播更突出真实生产力场景。',
      url: 'https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803888&idx=1&sn=d8d6ffd2c6caf69c7f740a238d0f1619&chksm=bfe9965771426846ab4b4bebbb80092719dbf7626085b2c845425358e218734b08565f898217#rd',
      tag: '大模型',
    },
    {
      title: '小红书 REDstar 启动 2027 顶尖人才计划',
      summary: '小红书技术与招聘账号同步发布 REDstar 计划，以“技术进入真实世界”为核心表达，面向顶尖技术人才建立独立于常规校招的识别度。同步发声也让技术议题与人才入口形成闭环。',
      url: 'https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg==&mid=2247496234&idx=1&sn=f74087ea2de12315537f995efc938722&chksm=ce39e5bba7d22d74aeeb447cc46998b988ae0fd6348116ce835087bf10839e85e15b0ec1275b#rd',
      tag: '招聘',
    },
    {
      title: '阿里发布 Qoder，AI Coding 产品叙事从工具进入完整工作流',
      summary: '阿里技术正式发布 Qoder。结合当周腾讯对 AI Coding 深水区的系统讨论，大厂内容重心正在从“模型能否写代码”转向上下文、协作、成本与工程交付等完整研发流程。',
      url: 'https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511307&idx=2&sn=624a79c221ecff44407766522a6a70be&scene=58&subscene=0',
      tag: 'AI Coding',
    },
    {
      title: '美团把校招信息查询做成对话式 Agent',
      summary: '美团校园招聘 Agent 将岗位选择、流程查询等高频问题集中到对话入口。它不只是招聘工具更新，也把候选人服务能力本身变成雇主品牌内容，降低信息查找成本。',
      url: 'https://mp.weixin.qq.com/s?__biz=MjM5NzYyMzIwMg==&mid=2792303005&idx=1&sn=e67b2d359dbd03c06bd235c30d2daa3a&chksm=84a427d09d5fae610f815185cf105e0a16ca6c193a15bfdb7e5cf5a525c4e98488a1836d7f66#rd',
      tag: '招聘体验',
    },
  ],
  industry: {
    sections: {
      '本周判断': {
        content: [
          'Agent 内容开始从能力展示进入“长期运营”：安全、记忆、评测、成本与治理成为高频主题。',
          '校招传播不再只发岗位清单。小红书用顶尖人才计划建立差异化，美团用 Agent 改造候选人服务，招聘产品本身成为内容。',
          'AI Coding 的竞争单位正在从单点工具升级为研发工作流；Qoder、腾讯 AI Coding 长文都在强调真实交付链路。',
        ],
        sources: [
          {name:'腾讯 Agent 自进化',url:'https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803847&idx=1&sn=abe5cab137aac47cb042b6baa1a24191&chksm=bfea380c1738f2e2a6071bc6faf836b62b4f0054d986ae000de72dbcac3e2b223b384a0c312b#rd'},
          {name:'字节 Agent 安全',url:'https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247521453&idx=1&sn=a43b95ca00458d532f29d70e80f0d118&scene=58&subscene=0'},
          {name:'腾讯 AI Coding 深水区',url:'https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803848&idx=1&sn=d61f1e7642a93c81c86fba2cf799f4b3&scene=58&subscene=0'},
        ],
      },
    },
  },
  companies: [
    {
      id:'bytedance', name:'字节跳动', color:'#18a7b5',
      summary:'技术内容集中在 Agent 安全与企业级落地，招聘侧按业务线密集拆分岗位入口。',
      sections:{
        '内容观察':{content:['《Agent 提示词注入攻击》把安全问题定义为需要长期应对的工程挑战，强调防护不是一次性规则配置。','招聘内容按抖音、今日头条、企业服务等业务线拆分，有利于候选人快速定位团队与场景。'],sources:[{name:'Agent 提示词注入攻击',url:'https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247521453&idx=1&sn=a43b95ca00458d532f29d70e80f0d118&scene=58&subscene=0'}]},
        '可借鉴点':{isInsight:true,content:['安全议题适合用“真实攻击面—长期机制—工程权衡”的结构表达，比泛泛强调安全能力更可信。']},
      },
    },
    {
      id:'tencent', name:'腾讯', color:'#176fd1',
      summary:'从 Agent 自进化、AI Coding 到 Hy4，形成模型能力与工程方法并行的内容组合。',
      sections:{
        '内容观察':{content:['Agent 自进化文章将评测、记忆、落地和控制串成闭环，并强调失败样本回流。','Hy4 preview 用模型参数、超长上下文和真实生产力任务建立开源模型定位。'],sources:[{name:'Agent 自进化飞轮',url:'https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803847&idx=1&sn=abe5cab137aac47cb042b6baa1a24191&chksm=bfea380c1738f2e2a6071bc6faf836b62b4f0054d986ae000de72dbcac3e2b223b384a0c312b#rd'},{name:'混元 Hy4 preview',url:'https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803888&idx=1&sn=d8d6ffd2c6caf69c7f740a238d0f1619&chksm=bfe9965771426846ab4b4bebbb80092719dbf7626085b2c845425358e218734b08565f898217#rd'}]},
        '可借鉴点':{isInsight:true,content:['同一周同时提供“方法论长文”和“产品发布”，既服务专业读者，也覆盖更广的技术关注人群。']},
      },
    },
    {
      id:'alibaba', name:'阿里巴巴', color:'#ff6a00',
      summary:'Qoder 正式发布，Agent 架构内容继续向工程化方法推进。',
      sections:{
        '内容观察':{content:['Qoder 将 AI Coding 作为独立产品发布，重点不只在生成代码，而在研发过程的整体协同。','“架构师 Agent”内容延续阿里以系列工程实践建立技术话语体系的方式。'],sources:[{name:'Qoder 正式发布',url:'https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511307&idx=2&sn=624a79c221ecff44407766522a6a70be&scene=58&subscene=0'}]},
        '可借鉴点':{isInsight:true,content:['新产品发布后持续用真实研发场景解释产品，能延长一次发布的内容生命周期。']},
      },
    },
    {
      id:'meituan', name:'美团', color:'#e9a400',
      summary:'招聘 Agent 与技术竞赛、校招岗位并行，候选人体验是本周最清晰的差异点。',
      sections:{
        '内容观察':{content:['校园招聘 Agent 直接回应岗位怎么选、进度怎么查，把分散信息收敛到对话入口。','技术侧围绕无人机、低空与具身智能持续输出，业务场景与人才需求关联明确。'],sources:[{name:'美团校园招聘 Agent',url:'https://mp.weixin.qq.com/s?__biz=MjM5NzYyMzIwMg==&mid=2792303005&idx=1&sn=e67b2d359dbd03c06bd235c30d2daa3a&chksm=84a427d09d5fae610f815185cf105e0a16ca6c193a15bfdb7e5cf5a525c4e98488a1836d7f66#rd'}]},
        '可借鉴点':{isInsight:true,content:['把高频候选人问题产品化，既减少信息摩擦，也能自然展示组织对候选人体验的重视。']},
      },
    },
    {
      id:'xiaohongshu', name:'小红书', color:'#ff3157',
      summary:'REDstar 由技术号与招聘号同步发布，顶尖人才计划成为本周核心叙事。',
      sections:{
        '内容观察':{content:['REDstar 没有把内容停留在岗位列表，而是用“技术进入真实世界”解释人才计划的使命与场景。','双账号同步既保证技术可信度，也提供明确的申请入口。'],sources:[{name:'REDstar 顶尖人才计划',url:'https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg==&mid=2247496234&idx=1&sn=f74087ea2de12315537f995efc938722&chksm=ce39e5bba7d22d74aeeb447cc46998b988ae0fd6348116ce835087bf10839e85e15b0ec1275b#rd'}]},
        '可借鉴点':{isInsight:true,content:['高端人才项目需要一个清楚、可复述的使命句，再由技术案例证明它不是口号。']},
      },
    },
  ],
};
