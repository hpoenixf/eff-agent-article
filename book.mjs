// One canonical reading tree: three perspectives and 55 unique essays.
// Cross-cutting finance topics are curated links, never a fourth canonical category.
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
            "agent-temporal-semantics-market-calendar",
            "Agent 说“今天”时，到底是哪一天"
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
            "portfolio-mcp-readonly-investment-data",
            "把个人持仓接入 Agent：我们怎样设计一个只读金融 MCP"
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
            "结果外置与完整性：模型到底读到了多少"
          ],
          [
            "agent-main-run-context-compaction",
            "Main 压缩：摘要不改写原始事实"
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
            "agent-provider-architecture-and-admission",
            "Provider：统一接口之后，为什么还需要共享准入"
          ],
          [
            "020-agent-extension-host-smartphone",
            "Extension Host：从功能机到智能机"
          ],
          [
            "mcp-host-from-discovery-to-consumption",
            "从接上 MCP 到真正用上工具：Agent 的接入链路怎样构建"
          ],
          [
            "agent-model-capability-presentation-tool-surface",
            "Tool Surface：Agent 有工具，模型为什么看不到"
          ],
          [
            "agent-content-trust-prompt-injection",
            "A35 内容信任：Prompt Injection 不只是恶意文本"
          ],
          [
            "agent-multi-ecosystem-hook-execution",
            "多生态 Hook：Claude、Pi 与 Codex"
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
            "agent-personal-credits-shadow-accounting",
            "Agent 的请求数、Token 与 Credits 记账"
          ],
          [
            "agent-autonomous-scheduled-research",
            "定时研究：会话结束后继续"
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
            "agent-asynchronous-research-time-bound-delivery",
            "异步研究：离开页面后怎样按时交付"
          ],
          [
            "agent-durable-human-interaction-response-adoption",
            "Agent 问完用户之后：持久人机交互"
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
            "六层系统全景 V2：从一次提问到持续协作"
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
            "Run 终结权、阶段预算与安全恢复"
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
          ["agent-background-research-collaborative-experience", "想聊就聊，没收 AI 对话框的中止按钮！一天让你的 Agent 支持异步后台深度研究"],
          [
            "bounded-bull-bear-peer-dialogue",
            "当两个 Agent 开始直接对话：有界多空协作的 Runtime 设计"
          ],
          [
            "ai-citations-do-not-prove-reliability",
            "很多引用为什么不等于可靠"
          ],
          [
            "agent-failure-is-a-boundary-problem",
            "别把每个失败都算给模型"
          ],
          [
            "agent-provider-failover-without-resetting-the-run",
            "故障切换：换路线，不重置任务"
          ]
        ]
      },
      {
        "title": "工程演化与金融边界",
        "desc": "让研发回到完整任务，区分研究、建议与实际交易，保持数字可以复算。",
        "items": [
          [
            "code-cheaper-systems-harder-to-evolve",
            "代码越来越便宜，为什么系统却越来越难升级？"
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
          ],
          [
            "financial-agent-python-result-consumption",
            "Python 算过了，投研报告为什么还会错"
          ],
          [
            "financial-agent-trustworthy-evidence-chain",
            "金融 Agent 的可信证据链"
          ],
          [
            "agent-weekly-thesis-history-continuous-research",
            "一份周报过去后，Agent 还记得为什么这样判断吗？"
          ],
          [
            "investment-perspectives-and-thesis-falsification",
            "不止一个投资专家：多视角 Agent 如何共同检验投资假设"
          ],
          [
            "multi-layer-agent-collaboration-outlook",
            "从多个专家到一份研究：多层 Agent 协作的下一站（2026 展望）"
          ]
        ]
      }
    ]
  },
  {
    "id": "engineering",
    "title": "AI Agent 研发工程实践",
    "subtitle": "如何让 Coding Agent 在长期项目中持续开发、验证、维护和升级，而不把测试绿灯、文档完成与用户交付混为一谈。",
    "label": "AI-ASSISTED ENGINEERING",
    "chapters": [
      {
        "title": "Spec、证据与工程记忆",
        "desc": "从规范到真实执行证据，再到按需加载的长期工程历史。",
        "items": [
          [
            "026-agent-spec-evidence-workflow",
            "Spec、Evidence 与可验证研发关闭"
          ],
          [
            "agent-weekly-review-staged-delivery",
            "周报做了整晚，为何首份交付还没完成？"
          ],
          [
            "027-agent-context-document-history",
            "工程知识：按需加载、长期记忆与退役"
          ]
        ]
      },
      {
        "title": "真实验证与任务收敛",
        "desc": "区分假绿、模型返回与最终任务完成，让研发从局部修补走向可验证收敛。",
        "items": [
          [
            "honest-agent-evaluation",
            "测试与评测：绿灯究竟证明什么"
          ],
          [
            "test-lifecycle-refactoring-retirement-and-spec",
            "测试也会过期：把重构、退役和删除前移到 Spec"
          ],
          [
            "032-ai-development-from-bug-loop-to-task-convergence",
            "从 Bug 循环到完整任务收敛"
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
  "028-agent-feedback-system-without-false-learning": "agent-failure-is-a-boundary-problem",
  "010-agent-first-brakes": "011-model-understands-code-authorizes",
  "partial-is-not-complete": "tool-results-outside-model-context",
  "green-tests-can-lie": "honest-agent-evaluation",
  "agent-engineering-knowledge-lifecycle": "027-agent-context-document-history",
  "honest-agent-failure-semantics": "agent-veto-authority-and-run-termination"
};

// Historical full-text editions remain readable at independent URLs but are not
// counted as new canonical essays or converted into merge-pointer stubs.
export const historicalEditions = {
  "017-prompt-to-answer-six-layer-panorama-v1": "017-prompt-to-answer-six-layer-panorama"
};
