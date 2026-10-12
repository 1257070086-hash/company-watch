// W39 周报数据 · 2026年09.21 — 09.27
window.REPORT_DATA = {
  "week": "2026 W39",
  "range": "09.21 — 09.27",
  "meta": "来源为云端归档中上述五家公司相关官方账号在本周发布的内容，按北京时间计。长图招聘信息只记录可核对的标题与正文文字，技术数据保留原文实验和业务范围。",
  "headlines": [
    {
      "title": "错误码排查从 3～8 小时到分钟级，Agent怎么做到的？",
      "summary": "腾讯以错误码治理 Agent 展示知识库、代码关系、可观测数据与代码仓库如何共同进入排查流程；文中给出 50 条 case 对照和线上运行指标。",
      "url": "https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA%3D%3D&mid=2649804239&idx=1&sn=877bddfed68e73a327c4c25e836d8258&chksm=bf92c2b853586e9d5230a8dd4699d91ea502153f68925d616e781b2c701277d7c27867dd45c8",
      "tag": "研发效率"
    },
    {
      "title": "MTFM：美团统一推荐基座大模型在外卖多业务场景的落地实践 | 送中秋礼盒",
      "summary": "美团技术团队发布跨外卖多业务的统一推荐精排模型，并披露对应业务的订单量与推理成本变化。",
      "url": "https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651783470&idx=1&sn=da5e4ae285f534a2687fce77543806b0",
      "tag": "推荐系统"
    },
    {
      "title": "《AI Native 研发范式实践手册》重磅发布",
      "summary": "阿里从三个业务实践案例出发，整理环境验证、知识库、Sandbox、权限和可观测等企业级 AI 研发基础能力。",
      "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511562&idx=1&sn=489d57fcf7c339c36e0cbfad429fcd1e&chksm=ceec142088b63ca9321ba667194c6a0df2523f66699bea735613a779c415c6a605a20731d7a3",
      "tag": "研发范式"
    }
  ],
  "industry": {
    "sections": {
      "本周判断": {
        "content": [
          "这一周的技术内容更重视完整交付链路：腾讯把 Agent 接入错误码治理，阿里将研发手册落到环境、权限和验证，美团用业务指标检验统一推荐模型。",
          "雇主叙事出现“成长路径”的具体材料：腾讯工程师转向大模型推理的个人经历、字节 AI 产品经理岗位解读，能回答候选人如何进入新方向。",
          "案例数字应保留原文条件。美团的订单变化对应外卖多个业务；腾讯的排查效率来自错误码治理场景，均不能外推为全公司收益。"
        ],
        "sources": [
          {
            "name": "错误码排查从 3～8 小时到分钟级，Agent怎么做到的？",
            "url": "https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA%3D%3D&mid=2649804239&idx=1&sn=877bddfed68e73a327c4c25e836d8258&chksm=bf92c2b853586e9d5230a8dd4699d91ea502153f68925d616e781b2c701277d7c27867dd45c8"
          },
          {
            "name": "MTFM：美团统一推荐基座大模型在外卖多业务场景的落地实践 | 送中秋礼盒",
            "url": "https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651783470&idx=1&sn=da5e4ae285f534a2687fce77543806b0"
          },
          {
            "name": "《AI Native 研发范式实践手册》重磅发布",
            "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511562&idx=1&sn=489d57fcf7c339c36e0cbfad429fcd1e&chksm=ceec142088b63ca9321ba667194c6a0df2523f66699bea735613a779c415c6a605a20731d7a3"
          }
        ]
      }
    }
  },
  "companies": [
    {
      "id": "tencent",
      "name": "腾讯",
      "color": "#176fd1",
      "summary": "工程案例与个人转型故事相互补充。",
      "sections": {
        "内容观察": {
          "content": [
            "错误码治理 Agent 连接四类工具，原文给出人工排查 3～8 小时与分钟级处理的场景对照。",
            "一位 15 年后台工程师讲述转向大模型推理工程的学习和实践路径。"
          ],
          "sources": [
            {
              "name": "错误码排查从 3～8 小时到分钟级，Agent怎么做到的？",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA%3D%3D&mid=2649804239&idx=1&sn=877bddfed68e73a327c4c25e836d8258&chksm=bf92c2b853586e9d5230a8dd4699d91ea502153f68925d616e781b2c701277d7c27867dd45c8"
            },
            {
              "name": "腾讯15年资深后台工程师，转战大模型推理的抉择",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA%3D%3D&mid=2649804238&idx=1&sn=5071d1c07d4c99fac83cbfe0a3860344&chksm=bf8261353f2ef7174be1920582f9a4904cc5076b17ef58689fd897dba72e9019add37ed93784"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "把工作问题与个人选择放在一起，能让有经验的工程师看到进入新领域的可行路径。"
          ]
        }
      }
    },
    {
      "id": "meituan",
      "name": "美团",
      "color": "#e9a400",
      "summary": "统一模型与高校合作并行。",
      "sections": {
        "内容观察": {
          "content": [
            "MTFM 文章把模型设计与外卖多业务的订单量、推理成本联系起来。",
            "清华—美团论坛公布具身智能方向的高校支持计划。"
          ],
          "sources": [
            {
              "name": "MTFM：美团统一推荐基座大模型在外卖多业务场景的落地实践 | 送中秋礼盒",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651783470&idx=1&sn=da5e4ae285f534a2687fce77543806b0"
            },
            {
              "name": "清华大学-美团学术论坛举办，两项高校支持计划同步发布",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651783470&idx=2&sn=071ad0eeeb070cd3759487d3333455b5"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "讲成果时分别说明业务使用范围和研究合作对象，避免把局部成果写成普遍效果。"
          ]
        }
      }
    },
    {
      "id": "alibaba",
      "name": "阿里巴巴",
      "color": "#ff6a00",
      "summary": "云栖大会集中输出 AI 基础设施和研发方法。",
      "sections": {
        "内容观察": {
          "content": [
            "AI Native 手册归纳三个业务案例和企业级研发基础能力。",
            "RoboFlywheel 首发仿真资产底座与跨引擎平台，说明具身数据生产和评测的组织方式。"
          ],
          "sources": [
            {
              "name": "《AI Native 研发范式实践手册》重磅发布",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511562&idx=1&sn=489d57fcf7c339c36e0cbfad429fcd1e&chksm=ceec142088b63ca9321ba667194c6a0df2523f66699bea735613a779c415c6a605a20731d7a3"
            },
            {
              "name": "百万级仿真资产，正在重构机器人训练场：阿里巴巴RoboFlywheel首发",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511569&idx=2&sn=2572283725cf86c25f42f32a134cfb71&chksm=ce47ea17690eb49a0f50f709e0a84c284e2c041ecce063ad85c9de025edbe04c567770bb4dfd"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "发布基础设施时，把实际业务、验证环境与可复用边界一起交代清楚。"
          ]
        }
      }
    },
    {
      "id": "bytedance",
      "name": "字节跳动",
      "color": "#18a7b5",
      "summary": "Agent 工作空间与岗位解释同步推进。",
      "sections": {
        "内容观察": {
          "content": [
            "ADrive 内容展示授权项目空间如何供 Agent 读取文件、保存结果。",
            "招聘号拆解 AI 产品经理岗位，涉及日常工作、能力要求及面试准备。"
          ],
          "sources": [
            {
              "name": "Agent 已经进入工作流，文件还要靠人传来传去？",
              "url": "https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247522794&idx=1&sn=f78bb16a0448933da06fcc4d353de927"
            },
            {
              "name": "一篇笔记读懂字节跳动 AI 产品经理！",
              "url": "https://mp.weixin.qq.com/s?__biz=MzIzMTIzMTUwOQ%3D%3D&mid=2650114859&idx=1&sn=bc66ab7b6e66699440ddb9a928b16d17&chksm=f1864747676a37eaeef9457ed6984e88790fb9b161df47bb165f60c2cfabab51b4c31a4e5617"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "岗位内容可借用真实协作工具与任务，帮助候选人理解 AI 产品的日常判断。"
          ]
        }
      }
    },
    {
      "id": "xiaohongshu",
      "name": "小红书",
      "color": "#ff3157",
      "summary": "把多媒体体验还原为技术链路。",
      "sections": {
        "内容观察": {
          "content": [
            "4K Live Photo 文章解释发布、转码、消费等环节如何兼顾清晰度与流畅度。",
            "世界杯直播文章用时间戳与链路指标拆解降延迟实践。"
          ],
          "sources": [
            {
              "name": "livephoto 4K 全链路技术实践",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496484&idx=1&sn=7152fd758dcecbc8289699aff27f9313&chksm=ce651c6cc562957c27ac99e9e33897efae6e851c086738811a09b724b6bd37c4d035866c943a"
            },
            {
              "name": "【世界杯专题01】体育直播全链路降延迟实践",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496454&idx=1&sn=97fa58649811d064335c89dddd5bb644&chksm=cebcf531502f615e10fb55cfcbc439e6002f01d93a2e865eee4962e96784f4c48650b8eb250f"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "从用户可感知的体验出发，再给出端到端技术环节，便于不同背景的候选人理解工作价值。"
          ]
        }
      }
    }
  ]
};
