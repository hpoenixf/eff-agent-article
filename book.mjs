// Canonical reading order. Reuse in sidebar and catalogue to avoid two indexes.
export const chapters = [
  {
    "title": "01 · 从全景开始",
    "desc": "先理解一个问题为什么会穿过这么多边界。",
    "items": [
      [
        "017-prompt-to-answer-six-layer-panorama",
        "一句问题走过六层系统"
      ],
      [
        "010-agent-first-brakes",
        "为什么 Agent 必须先装刹车"
      ],
      [
        "011-model-understands-code-authorizes",
        "模型会理解，代码才授权"
      ],
      [
        "001-one-week-4-billion-tokens-etf-investment-agent",
        "ETF 投资助手的工程起点"
      ]
    ]
  },
  {
    "title": "02 · 模型、Runtime 与边界",
    "desc": "分清谁提出语义判断，谁对客观事实负责。",
    "items": [
      [
        "runtime-model-protocol-boundary-agent-article-v2",
        "别让模型当状态机"
      ],
      [
        "runtime-natural-language-boundary-article-v2",
        "Runtime 不知道的，别假装知道"
      ],
      [
        "agent-model-runtime-mcp-skill-boundaries",
        "Model / Runtime / MCP / Skill 分工"
      ],
      [
        "agent-veto-authority-and-run-termination",
        "收回散落的否决权"
      ],
      [
        "agent-runtime-constraint-governance-v2",
        "预算与约束怎样收口"
      ]
    ]
  },
  {
    "title": "03 · 研究、工具与扩展",
    "desc": "从入口判断、工具调用到专业化协作。",
    "items": [
      [
        "022-agent-entry-from-intent-to-direct-research",
        "Entry 为什么越做越简单"
      ],
      [
        "021-agent-web-research-from-search-to-deep-reading",
        "Web：从搜索到连续阅读"
      ],
      [
        "024-agent-pdf-from-text-to-evidence",
        "PDF：从文本到证据"
      ],
      [
        "agent-subagent-context-specialization",
        "Subagent：隔离与专业化"
      ],
      [
        "adaptive-research-python-workbench",
        "Adaptive Research 与 Python"
      ],
      [
        "tool-results-outside-model-context",
        "工具结果为什么不必全部入上下文"
      ],
      [
        "agent-tool-lifecycle-and-model-input",
        "工具调用到模型输入的观测链"
      ],
      [
        "020-agent-extension-host-smartphone",
        "Extension Host：从功能机到智能机"
      ],
      [
        "mcp-market-responsibility-retrospective",
        "金融数据 MCP 的职责膨胀"
      ],
      [
        "unavailable-is-correct",
        "数据过期后的受控刷新"
      ]
    ]
  },
  {
    "title": "04 · 证据与可观测性",
    "desc": "引用、完整性、可回读的运行事实各自成立。",
    "items": [
      [
        "ai-citations-do-not-prove-reliability",
        "很多引用不等于可靠"
      ],
      [
        "partial-is-not-complete",
        "警惕静默截断"
      ],
      [
        "025-agent-langfuse-from-trace-to-trustworthy-observability",
        "Langfuse：从 Trace 到可信观测"
      ]
    ]
  },
  {
    "title": "05 · 答案、发布与恢复",
    "desc": "生成内容、获准发表和真正交付是不同事实。",
    "items": [
      [
        "019-agent-answer-publication",
        "为什么要独立发布系统"
      ],
      [
        "023-agent-publication-governance-retrospective",
        "为什么发布治理做了两次"
      ],
      [
        "agent-progressive-answer-coherence",
        "渐进回答如何保持连贯"
      ],
      [
        "honest-agent-failure-semantics",
        "失败终态与安全恢复"
      ]
    ]
  },
  {
    "title": "06 · 测试、评测与迭代",
    "desc": "把局部绿测带回真实用户目标。",
    "items": [
      [
        "honest-agent-evaluation",
        "有模型输出不等于任务成功"
      ],
      [
        "green-tests-can-lie",
        "绿测不等于生产能力"
      ],
      [
        "agent-failure-is-a-boundary-problem",
        "从粗错误码走向因果链"
      ]
    ]
  }
];
export const articleCount = chapters.reduce((n, section) => n + section.items.length, 0);
