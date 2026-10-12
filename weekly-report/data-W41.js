// W41 周报数据 · 2026年10.05 — 10.11
window.REPORT_DATA = {
  "week": "2026 W41",
  "range": "10.05 — 10.11",
  "meta": "来源为云端归档截至 2026 年 10 月 12 日的官方账号文章，按北京时间归入 10 月 5—11 日。假期周收录较少；晚点 LatePost 与阿里技术两个监测源本次同步失败，已保留旧文，本期不据此推断其本周发文情况。",
  "headlines": [
    {
      "title": "别只盯着AI Coding，真正的变化发生在整个研发流程",
      "summary": "腾讯 OK 平台案例将需求评审、方案、编码、审查和部署串成完整流程；安全中心项目空间在 4—6 月的 254 条需求中，172 条由 AI 端到端完成。",
      "url": "https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA%3D%3D&mid=2649804241&idx=1&sn=9938f93cb8517ac9dafb033f20535936&chksm=bf2798a8aa35aeacf12ffc9c31cf2d8280bc42688364da3888b000c9b49234259e37e9f2049e",
      "tag": "研发流程"
    },
    {
      "title": "三篇重磅论文，拆解 OpenViking 核心技术",
      "summary": "字节以记忆写入、目录检索与分层读取三项研究解释 OpenViking 的上下文能力，并给出各自的评测条件。",
      "url": "https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247523063&idx=1&sn=70910f0ca4b9f5fb519c7d4d94f481f6",
      "tag": "Agent 记忆"
    },
    {
      "title": "RED OHC 开源：刷新 Java 堆外缓存 SOTA，多线程性能最高达基线 3.38 倍",
      "summary": "小红书开源 Java 堆外缓存 RED OHC，披露搜推链路应用和对 Cassandra OHC 的多线程基准结果。",
      "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496567&idx=1&sn=707a1262ada97313ce809fadbed18c69&chksm=ceef417de9d0f9342168c46c80535f55737e502fdccb40af9099364217833deb1e3fe020ccab",
      "tag": "基础设施"
    }
  ],
  "industry": {
    "sections": {
      "本周判断": {
        "content": [
          "本周内容围绕“系统怎样可靠运行”展开：腾讯写研发全流程，字节写记忆和可回溯诊断，小红书写高并发缓存实现与验证。",
          "三篇技术文章都给出了可追问的范围：腾讯是安全中心项目空间，OpenViking 是分项研究评测，小红书是特定读写比与线程数的缓存基准。",
          "招聘端在样本中以具体业务为入口：阿里国际围绕 Accio 电商业务招应届生；美团 Keeta 发布巴西岗位。页面只记录可核对的公开信息。"
        ],
        "sources": [
          {
            "name": "别只盯着AI Coding，真正的变化发生在整个研发流程",
            "url": "https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA%3D%3D&mid=2649804241&idx=1&sn=9938f93cb8517ac9dafb033f20535936&chksm=bf2798a8aa35aeacf12ffc9c31cf2d8280bc42688364da3888b000c9b49234259e37e9f2049e"
          },
          {
            "name": "三篇重磅论文，拆解 OpenViking 核心技术",
            "url": "https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247523063&idx=1&sn=70910f0ca4b9f5fb519c7d4d94f481f6"
          },
          {
            "name": "RED OHC 开源：刷新 Java 堆外缓存 SOTA，多线程性能最高达基线 3.38 倍",
            "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496567&idx=1&sn=707a1262ada97313ce809fadbed18c69&chksm=ceef417de9d0f9342168c46c80535f55737e502fdccb40af9099364217833deb1e3fe020ccab"
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
      "summary": "从代码生成延伸到研发全流程。",
      "sections": {
        "内容观察": {
          "content": [
            "OK 平台案例覆盖需求评审到部署；文中 68% 的 AI 端到端完成率对应 2026 年 4—6 月安全中心项目空间的 254 条需求。"
          ],
          "sources": [
            {
              "name": "别只盯着AI Coding，真正的变化发生在整个研发流程",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA%3D%3D&mid=2649804241&idx=1&sn=9938f93cb8517ac9dafb033f20535936&chksm=bf2798a8aa35aeacf12ffc9c31cf2d8280bc42688364da3888b000c9b49234259e37e9f2049e"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "展示 AI 研发成果时说明项目范围和人参与的决策点，便于他人判断是否可复用。"
          ]
        }
      }
    },
    {
      "id": "bytedance",
      "name": "字节跳动",
      "color": "#18a7b5",
      "summary": "讨论 Agent 的长期记忆与证据链诊断。",
      "sections": {
        "内容观察": {
          "content": [
            "OpenViking 文章以三项研究解释记忆组织、检索和分层读取。",
            "OpenBMC 诊断文章先把日志映射回源码和执行路径，再由 Agent 形成含验证步骤的可回溯报告。"
          ],
          "sources": [
            {
              "name": "三篇重磅论文，拆解 OpenViking 核心技术",
              "url": "https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247523063&idx=1&sn=70910f0ca4b9f5fb519c7d4d94f481f6"
            },
            {
              "name": "从看日志猜问题到基于证据链调试：Agentic AI 如何重塑 OpenBMC 软件诊断",
              "url": "https://mp.weixin.qq.com/s?__biz=MzI1MzYzMjE0MQ==&mid=2247523100&idx=1&sn=b5ad83d4997a6f503ff106af2d9cae2f"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "技术案例可突出“人如何核对 AI 判断”：保留证据、定位过程和验证步骤。"
          ]
        }
      }
    },
    {
      "id": "xiaohongshu",
      "name": "小红书",
      "color": "#ff3157",
      "summary": "开源成果对应真实搜推链路。",
      "sections": {
        "内容观察": {
          "content": [
            "RED OHC 采用无锁读路径与后台异步维护；在原文 32 线程纯读测试中吞吐为 Cassandra OHC 基线的 3.38 倍。",
            "文章还交代灰度验证与搜推核心召回链路的上线状态。"
          ],
          "sources": [
            {
              "name": "RED OHC 开源：刷新 Java 堆外缓存 SOTA，多线程性能最高达基线 3.38 倍",
              "url": "https://mp.weixin.qq.com/s?__biz=Mzg4OTc2MzczNg%3D%3D&mid=2247496567&idx=1&sn=707a1262ada97313ce809fadbed18c69&chksm=ceef417de9d0f9342168c46c80535f55737e502fdccb40af9099364217833deb1e3fe020ccab"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "性能数字应始终带测试条件，并说明它改善的是哪段真实用户链路。"
          ]
        }
      }
    },
    {
      "id": "alibaba",
      "name": "阿里巴巴",
      "color": "#ff6a00",
      "summary": "以具体业务组织应届生招聘。",
      "sections": {
        "内容观察": {
          "content": [
            "阿里国际招聘文章以 Accio 电商业务为主题，面向应届生。",
            "阿里云另发布管培生招聘内容；本期阿里技术监测源同步失败，未比较其技术内容。"
          ],
          "sources": [
            {
              "name": "阿里国际丨应届生热招，用Accio重做一遍电商，就差你了！",
              "url": "https://mp.weixin.qq.com/s?__biz=MzUzNDc1MDg1Ng%3D%3D&mid=2247503926&idx=1&sn=9552ee9de0c7fa1e14cfb9284920a219&chksm=fb0f31dfcdba76cc6b657896bc9dddfd00af9a5f1361b21d466a5217496d96cdc30efc9dbbb4"
            },
            {
              "name": "阿里云丨阿里云管培生招人啦！",
              "url": "https://mp.weixin.qq.com/s?__biz=MzUzNDc1MDg1Ng%3D%3D&mid=2247503926&idx=2&sn=22cd5abbac81ba7cbf3780e62ba74395&chksm=fb2f88846dfc68fe14d161fcc71dded752e5ec4057146a1e7e7d530982e320f428d1e31c9b08"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "招聘文章可接上团队成员的实际任务与用户场景，使业务主题更容易转化为岗位理解。"
          ]
        }
      }
    },
    {
      "id": "meituan",
      "name": "美团",
      "color": "#e9a400",
      "summary": "岗位信息指向 Keeta 巴西业务。",
      "sections": {
        "内容观察": {
          "content": [
            "美团招聘号发布 Keeta 巴西岗位信息；当前归档正文较少，本期仅记录公开标题与链接。"
          ],
          "sources": [
            {
              "name": "Keeta 巴西大量岗位正在热招！",
              "url": "https://mp.weixin.qq.com/s?__biz=MjM5NzYyMzIwMg%3D%3D&mid=2792304228&idx=1&sn=33e376db5da5a652179d6718aa1b75b7&chksm=840078a77aa932f19e9842a20e5d0d0a7c69dbf1589cfe2f927bca07e4e45472a7a75a238ef1"
            }
          ]
        },
        "可借鉴点": {
          "isInsight": true,
          "content": [
            "后续若补充团队、任务和候选人条件，可再形成可比较的雇主内容案例。"
          ]
        }
      }
    }
  ]
};
