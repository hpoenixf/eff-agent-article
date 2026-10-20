// One canonical reading tree: two perspectives, themed sequences, and 34 unique essays.
// A topic has exactly one home; other connections are made through links, not duplicate entries.
export const collections = [
  {
    "id": "modules",
    "title": "模块维度",
    "subtitle": "从输入、执行、状态到交付，拆解具体能力如何运作。",
    "label": "MODULE DEEP DIVES",
    "chapters": [
      {
        "title": "研究入口、阅读与计算",
        "desc": "研究不是一次工具调用：Entry、Web、PDF、Subagent 与隔离计算各自负责什么。",
        "items": [
          [
            "022-agent-entry-from-intent-to-direct-research",
            "Entry：为什么入口越来越简单"
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
            "Subagent：从隔离到专业化协作"
          ],
          [
            "adaptive-research-python-workbench",
            "Adaptive Research 与 Python"
          ],
          [
            "agent-python-compute-workbench-evolution",
            "Python：从工具到计算工作台"
          ],
          [
            "unavailable-is-correct",
            "数据过期后的受控刷新"
          ]
        ]
      },
      {
        "title": "上下文、研究资产与知识",
        "desc": "模型真正看到什么，以及记忆和知识的使用资格如何改变。",
        "items": [
          [
            "tool-results-outside-model-context",
            "工具结果为什么不必全部入上下文"
          ],
          [
            "partial-is-not-complete",
            "静默截断：真实数据为什么变少"
          ],
          [
            "026-agent-memory-forget-durable-effects",
            "Memory：遗忘已提交，回答却失败"
          ],
          [
            "027-rag-revocation-publish-replay",
            "RAG：文档撤权与历史回放"
          ]
        ]
      },
      {
        "title": "运行时、扩展与观测",
        "desc": "能力如何被接入、授权、执行、限额与观察。",
        "items": [
          [
            "020-agent-extension-host-smartphone",
            "Extension Host：从功能机到智能机"
          ],
          [
            "agent-tool-lifecycle-and-model-input",
            "工具调用到模型输入的观测链"
          ],
          [
            "agent-runtime-constraint-governance-v2",
            "Run 预算与约束治理"
          ],
          [
            "025-agent-langfuse-from-trace-to-trustworthy-observability",
            "Langfuse：从 Trace 到可信观测"
          ]
        ]
      },
      {
        "title": "答案、发布与恢复",
        "desc": "候选正文、持久效果、用户实际收到的东西不能合并成一个状态。",
        "items": [
          [
            "019-agent-answer-publication",
            "Publication：为什么需要独立发布系统"
          ],
          [
            "agent-progressive-answer-coherence",
            "渐进式回答如何保持连贯"
          ],
          [
            "honest-agent-failure-semantics",
            "失败终态与安全恢复"
          ]
        ]
      }
    ]
  },
  {
    "id": "thinking",
    "title": "架构设计与系统思考",
    "subtitle": "跨模块看 Owner、边界、可靠性、演化与真实用户价值。",
    "label": "ARCHITECTURE & SYSTEMS THINKING",
    "chapters": [
      {
        "title": "系统全景与职责边界",
        "desc": "回答谁理解、谁授权、谁拥有事实，以及为什么必须能收回旧结构。",
        "items": [
          [
            "017-prompt-to-answer-six-layer-panorama",
            "从一句问题到六层系统全景"
          ],
          [
            "010-agent-first-brakes",
            "一个 Agent 为什么先装刹车"
          ],
          [
            "011-model-understands-code-authorizes",
            "模型会理解，代码才授权"
          ],
          [
            "runtime-model-protocol-boundary-agent-article-v2",
            "别让模型当状态机"
          ],
          [
            "agent-model-runtime-mcp-skill-boundaries",
            "Model / Runtime / MCP / Skill 的分工"
          ],
          [
            "agent-veto-authority-and-run-termination",
            "散落的否决权与 Run 终结权"
          ],
          [
            "mcp-market-responsibility-retrospective",
            "金融数据 MCP 为什么变成决策系统"
          ]
        ]
      },
      {
        "title": "可靠性、反馈与系统治理",
        "desc": "弄清哪个环节真的失败，以及评测、追踪和护栏何时会制造误诊。",
        "items": [
          [
            "ai-citations-do-not-prove-reliability",
            "很多引用为什么不等于可靠"
          ],
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
            "别把每个失败都算给模型"
          ]
        ]
      },
      {
        "title": "工程演化与金融边界",
        "desc": "让研发回到完整任务，区分研究、建议与实际交易，保持数字可以复算。",
        "items": [
          [
            "032-ai-development-from-bug-loop-to-task-convergence",
            "用 Agent 开发 Agent：从 Bug 循环到任务收敛"
          ],
          [
            "agent-html-evolution-challenges",
            "HTML 保存了，为什么还是交付失败"
          ],
          [
            "001-one-week-4-billion-tokens-etf-investment-agent",
            "一个 ETF 投资助手的工程起点"
          ],
          [
            "030-fintech-from-research-to-investment-advice",
            "从投资研究到投顾与交易的边界"
          ],
          [
            "031-fintech-data-time-and-reproducible-numbers",
            "金融数字的时点、口径与复算"
          ]
        ]
      }
    ]
  }
];
export const chapters = collections.flatMap(collection => collection.chapters);
export const articleCount = chapters.reduce((n, chapter) => n + chapter.items.length, 0);

// Previously published URLs remain readable, without duplicating essays in search/navigation.
export const mergedArticles = {
  "023-agent-publication-governance-retrospective": "019-agent-answer-publication",
  "runtime-natural-language-boundary-article-v2": "runtime-model-protocol-boundary-agent-article-v2",
  "028-agent-feedback-system-without-false-learning": "agent-failure-is-a-boundary-problem"
};
