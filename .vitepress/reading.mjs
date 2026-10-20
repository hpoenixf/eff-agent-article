// Single source for reading order and category navigation.
export const chapters = [
  {
    "key": "01",
    "title": "从一个问题开始",
    "subtitle": "理解整个 Agent 和安全边界",
    "items": [
      {
        "slug": "001-one-week-4-billion-tokens-etf-investment-agent",
        "title": "一个 ETF 投资助手，为什么先变成工程问题"
      },
      {
        "slug": "017-prompt-to-answer-six-layer-panorama",
        "title": "一次提问怎样穿过六层系统"
      },
      {
        "slug": "010-agent-first-brakes",
        "title": "一个 Agent 为什么必须先装刹车"
      },
      {
        "slug": "011-model-understands-code-authorizes",
        "title": "模型会理解，代码才授权"
      }
    ]
  },
  {
    "key": "02",
    "title": "Runtime 与治理",
    "subtitle": "谁负责状态、资源、授权和终结",
    "items": [
      {
        "slug": "runtime-model-protocol-boundary-agent-article-v2",
        "title": "别再让模型当状态机"
      },
      {
        "slug": "runtime-natural-language-boundary-article-v2",
        "title": "Runtime 不知道的，不该假装知道"
      },
      {
        "slug": "agent-model-runtime-mcp-skill-boundaries",
        "title": "Model / Runtime / MCP / Skill 的边界"
      },
      {
        "slug": "agent-runtime-constraint-governance-v2",
        "title": "资源预算为什么要统一治理"
      },
      {
        "slug": "agent-veto-authority-and-run-termination",
        "title": "收回散落在各模块的否决权"
      },
      {
        "slug": "honest-agent-failure-semantics",
        "title": "失败终态与安全恢复"
      },
      {
        "slug": "agent-subagent-context-specialization",
        "title": "Subagent：隔离与专业化协作"
      }
    ]
  },
  {
    "key": "03",
    "title": "资料、证据与计算",
    "subtitle": "从搜索、文档到可追溯结论",
    "items": [
      {
        "slug": "021-agent-web-research-from-search-to-deep-reading",
        "title": "Web：从搜索到连续阅读"
      },
      {
        "slug": "024-agent-pdf-from-text-to-evidence",
        "title": "PDF：从文本到证据"
      },
      {
        "slug": "mcp-market-responsibility-retrospective",
        "title": "金融数据 MCP 的职责膨胀"
      },
      {
        "slug": "adaptive-research-python-workbench",
        "title": "Adaptive Research 与 Python 接续"
      },
      {
        "slug": "tool-results-outside-model-context",
        "title": "工具结果不必全部给模型看"
      },
      {
        "slug": "ai-citations-do-not-prove-reliability",
        "title": "引用很多，为什么回答仍不可靠"
      },
      {
        "slug": "unavailable-is-correct",
        "title": "资料过期后的受控刷新"
      },
      {
        "slug": "partial-is-not-complete",
        "title": "静默截断：部分不是完整事实"
      }
    ]
  },
  {
    "key": "04",
    "title": "扩展、入口与交付",
    "subtitle": "让系统生长，也能完成交付",
    "items": [
      {
        "slug": "020-agent-extension-host-smartphone",
        "title": "从功能机到智能手机：Extension Host"
      },
      {
        "slug": "022-agent-entry-from-intent-to-direct-research",
        "title": "为什么 Entry 越做越简单"
      },
      {
        "slug": "019-agent-answer-publication",
        "title": "答案为什么需要独立发布系统"
      },
      {
        "slug": "023-agent-publication-governance-retrospective",
        "title": "发布治理为什么做了两次"
      },
      {
        "slug": "agent-progressive-answer-coherence",
        "title": "从研究日志到自然对话"
      }
    ]
  },
  {
    "key": "05",
    "title": "工程验证与演进",
    "subtitle": "不用局部绿测冒充用户任务成功",
    "items": [
      {
        "slug": "honest-agent-evaluation",
        "title": "模型有返回不等于任务完成"
      },
      {
        "slug": "green-tests-can-lie",
        "title": "绿测不等于生产能力"
      },
      {
        "slug": "agent-failure-is-a-boundary-problem",
        "title": "别再把失败都算给模型"
      },
      {
        "slug": "025-agent-langfuse-from-trace-to-trustworthy-observability",
        "title": "从 Trace 到可信观测"
      },
      {
        "slug": "agent-tool-lifecycle-and-model-input",
        "title": "工具调用到模型输入的观测链"
      }
    ]
  }
];
export const articles = chapters.flatMap(chapter => chapter.items.map(item => ({ ...item, chapter: chapter.key })));
