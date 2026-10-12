// W40 周报数据 · 2026年09.28 — 10.04
window.REPORT_DATA = {
  "week": "2026 W40",
  "range": "09.28 — 10.04",
  "meta": "来源为云端归档中上述五家公司相关官方账号在本周发布的内容，按北京时间计。该周部分账号无新增文章；未出现的公司不代表停止发布或无相关工作。",
  "headlines": [
    {
      "title": "小红书推荐系统的 Agentic 发布：跨昼夜任务 Harness 实践",
      "summary": "小红书推荐团队展示跨昼夜发布任务的 Harness 实践，并交代大规模发布仍需人工介入的边界。",
      "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496545&idx=1&sn=3ad93a13a794c91de818fa7ffd0c121c&chksm=ce3b6abe965fd4e02f963ef85da9a4879dd81c439bdc070b54271a18bdb3b41de386fecb7411",
      "tag": "Agent 工程"
    },
    {
      "title": "从榜单走向真实业务负载：Kernel Agent 刷新 Qwen3.8-Max 核心推理算子性能",
      "summary": "阿里用真实推理业务负载评价 Kernel Agent，而非只引用通用榜单；文中给出三条算子线与 60 个 shape 的测试范围。",
      "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511604&idx=1&sn=a0132c351d49f0508db1e20e3952d4dd&chksm=cebc4537bfce2e60800ac725a85d86b97b4e2b90d3e3042ef45cbc85522e9fd74fc3ba2eded1",
      "tag": "AI Infra"
    },
    {
      "title": "🤩 揭秘校招生加入美团的 36 个真实理由（内含热招 AI 岗位）",
      "summary": "美团招聘以“36 个真实理由”组织校招生表达，并关联热招 AI 岗位；长图细节以原文为准。",
      "url": "https://mp.weixin.qq.com/s?__biz=MjM5NzYyMzIwMg%3D%3D&mid=2792304054&idx=1&sn=33f832573f7ef61efae4e571bbf988ee&chksm=84ad642c9312ca1ab8b03ef76f6e9dc979fd78b141268ec4b421197eae90801c86515cd72b90",
      "tag": "校招内容"
    }
  ],
  "industry": {
    "sections": {
      "本周判断": {
        "content": [
          "小红书与阿里都把 Agent 放在高约束工程任务中讨论：前者处理长时发布与人工核验，后者以真实负载检验算子优化。",
          "这一周的招聘内容更多以校招生视角和业务入口组织。美团使用“真实理由”，字节回顾校园宣讲并介绍不同业务团队。",
          "技术文章保留尚需人工介入、测试负载等条件，能让“AI 提效”主张更可信。"
        ],
        "sources": [
          {
            "name": "小红书推荐系统的 Agentic 发布：跨昼夜任务 Harness 实践",
            "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496545&idx=1&sn=3ad93a13a794c91de818fa7ffd0c121c&chksm=ce3b6abe965fd4e02f963ef85da9a4879dd81c439bdc070b54271a18bdb3b41de386fecb7411"
          },
          {
            "name": "从榜单走向真实业务负载：Kernel Agent 刷新 Qwen3.8-Max 核心推理算子性能",
            "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511604&idx=1&sn=a0132c351d49f0508db1e20e3952d4dd&chksm=cebc4537bfce2e60800ac725a85d86b97b4e2b90d3e3042ef45cbc85522e9fd74fc3ba2eded1"
          },
          {
            "name": "🤩 揭秘校招生加入美团的 36 个真实理由（内含热招 AI 岗位）",
            "url": "https://mp.weixin.qq.com/s?__biz=MjM5NzYyMzIwMg%3D%3D&mid=2792304054&idx=1&sn=33f832573f7ef61efae4e571bbf988ee&chksm=84ad642c9312ca1ab8b03ef76f6e9dc979fd78b141268ec4b421197eae90801c86515cd72b90"
          }
        ]
      }
    }
  },
  "companies": [
    {
      "id": "xiaohongshu",
      "name": "小红书",
      "color": "#ff3157",
      "summary": "聚焦长时 Agent 任务与直播交付。",
      "sections": {
        "内容观察": {
          "content": [
            "推荐服务发布跨度十多个部署组、数千 Pod，团队为跨昼夜任务设计状态保存、模板约束和结果核验；文章也说明当前平均仍需约两次人工介入。",
            "世界杯专题梳理三周交付 40 多项需求的直播项目技术组织。"
          ],
          "sources": [
            {
              "name": "小红书推荐系统的 Agentic 发布：跨昼夜任务 Harness 实践",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496545&idx=1&sn=3ad93a13a794c91de818fa7ffd0c121c&chksm=ce3b6abe965fd4e02f963ef85da9a4879dd81c439bdc070b54271a18bdb3b41de386fecb7411"
            },
            {
              "name": "【世界杯专题02】直播的三套技术底座，如何实现 3 周交付 40+ 需求、千万级 PCU 零事故",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496515&idx=1&sn=3262cf5c22fc2264cbe093b71387127a&chksm=ce14bf759ae05cb7d1fc607d2a665f24903c5f906cb9056042a8eb8d136874a24db5a9762ee3"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "把 AI 自动化的人工检查点写清楚，能让工程难题和进展同时被看见。"
          ]
        }
      }
    },
    {
      "id": "alibaba",
      "name": "阿里巴巴",
      "color": "#ff6a00",
      "summary": "用真实负载和稳定性改造说明 AI 工程。",
      "sections": {
        "内容观察": {
          "content": [
            "Kernel Agent 在 Qwen3.8-Max 的三条关键算子线、60 个真实 shape 上与基线比较。",
            "稳定性前端复盘说明规则包与插件如何进入代码生成流程，并给出项目内指标。"
          ],
          "sources": [
            {
              "name": "从榜单走向真实业务负载：Kernel Agent 刷新 Qwen3.8-Max 核心推理算子性能",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511604&idx=1&sn=a0132c351d49f0508db1e20e3952d4dd&chksm=cebc4537bfce2e60800ac725a85d86b97b4e2b90d3e3042ef45cbc85522e9fd74fc3ba2eded1"
            },
            {
              "name": "AI Native 回忆录：稳定性前端 S1 实践复盘",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA%3D%3D&mid=2247511817&idx=1&sn=5284ab741c2a5ccd9520c86e9261770d&chksm=ce20c31bf0e6f2a87f4f235701f4d1d6bf95786bd99c919c19a22d8af3cdb559f96a77a82f49"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "介绍效率时交代基线、任务范围和验证方式，避免把单团队成果泛化。"
          ]
        }
      }
    },
    {
      "id": "meituan",
      "name": "美团",
      "color": "#e9a400",
      "summary": "以校招生表达连接岗位。",
      "sections": {
        "内容观察": {
          "content": [
            "招聘号发布“36 个真实理由”主题内容，并指向 AI 热招岗位。",
            "软硬件服务 2027 届校招另设业务入口。"
          ],
          "sources": [
            {
              "name": "🤩 揭秘校招生加入美团的 36 个真实理由（内含热招 AI 岗位）",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5NzYyMzIwMg%3D%3D&mid=2792304054&idx=1&sn=33f832573f7ef61efae4e571bbf988ee&chksm=84ad642c9312ca1ab8b03ef76f6e9dc979fd78b141268ec4b421197eae90801c86515cd72b90"
            },
            {
              "name": "校招｜美团软硬件服务 2027 届校园招聘全球热招中",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5NzYyMzIwMg%3D%3D&mid=2792304054&idx=2&sn=5278257fa6b21e1ce9101a32f9c05e56&chksm=840f053ffb0db4c6731e7bdee622ecd33c8b3a4c6a7ea8fef6d87b6560ac8926099d9e312708"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "进一步访谈其中几位校招生，补足选择时的具体顾虑和入职后的实际工作。"
          ]
        }
      }
    },
    {
      "id": "bytedance",
      "name": "字节跳动",
      "color": "#18a7b5",
      "summary": "业务团队拆分校招入口。",
      "sections": {
        "内容观察": {
          "content": [
            "招聘号回顾 9 月校园宣讲中校友和业务 Leader 对 AI 时代岗位的分享。",
            "剪映 CapCut、红果短剧等团队分别发布 2027 届校招。"
          ],
          "sources": [
            {
              "name": "没赶上字节跳动2027校园宣讲会？看这篇就够了",
              "url": "https://mp.weixin.qq.com/s?__biz=MzIzMTIzMTUwOQ%3D%3D&mid=2650114991&idx=1&sn=50c0463a9fcd480d23ed98b5dd38ad39&chksm=f16f08552db932818f9a19e1e899f9405448dc726db0017792726006fcd242e7913408547798"
            },
            {
              "name": "剪映CapCut 2027 校园招聘，邀你一起让 AI 创作触手可及",
              "url": "https://mp.weixin.qq.com/s?__biz=MzIzMTIzMTUwOQ%3D%3D&mid=2650114991&idx=5&sn=38d50c580b0c8db1baee1ca51708832f&chksm=f14cb5606b01c6af19d9c785c4d68c2e5efc03d95a1f9133f84bcca62206096ccb9b4b755279"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "团队介绍若能连到某个可感知的产品变化，候选人更容易判断岗位与自身兴趣的关系。"
          ]
        }
      }
    }
  ]
};
