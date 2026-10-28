// One canonical reading tree: three perspectives and 72 current essays. Historical editions remain fully readable.
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
          ["022-agent-entry-from-intent-to-direct-research", "Entry：为什么入口越来越简单"],
          ["021-agent-web-research-from-search-to-deep-reading", "Web：从搜索到连续阅读"],
          ["agent-temporal-semantics-market-calendar", "Agent 说“今天”时，到底是哪一天"],
          ["024-agent-pdf-from-text-to-evidence", "PDF：从文本到证据"],
          ["agent-subagent-context-specialization", "Subagent：从隔离到专业化协作"],
          ["agent-custom-expert-from-prompt-to-recovery", "自定义专家，不应该只是一个 Prompt 输入框"],
          ["adaptive-research-python-workbench", "Adaptive Research 与 Python"],
          ["agent-python-compute-workbench-evolution", "Python：从工具到计算工作台"],
          ["portfolio-mcp-readonly-investment-data", "把个人持仓接入 Agent：我们怎样设计一个只读金融 MCP"],
          ["unavailable-is-correct", "数据过期后的受控刷新"]
        ]
      },
      {
        "title": "上下文、研究资产与知识",
        "desc": "模型真正看到什么，以及记忆和知识的使用资格如何改变。",
        "items": [
          ["tool-results-outside-model-context", "结果外置与完整性：模型到底读到了多少"],
          ["agent-main-run-context-compaction", "Main 压缩：摘要不改写原始事实"],
          ["agent-conversation-history-compaction-source-boundaries", "跨 Run 会话压缩：旧助手摘要不能替代用户原文"],
          ["026-agent-memory-forget-durable-effects", "Memory：从保存、召回到安全遗忘"],
          ["027-rag-revocation-publish-replay", "RAG：文档撤权与历史回放"]
        ]
      },
      {
        "title": "运行时、扩展与观测",
        "desc": "能力如何被接入、授权、执行、限额与观察。",
        "items": [
          ["agent-provider-architecture-and-admission", "Provider：统一接口之后，为什么还需要共享准入"],
          ["agent-provider-admission-capacity-lease", "模型返回 HTTP 200，为什么下一次还要排队"],
          ["020-agent-extension-host-smartphone", "Extension Host：从功能机到智能机"],
          ["mcp-host-from-discovery-to-consumption", "从接上 MCP 到真正用上工具：Agent 的接入链路怎样构建"],
          ["agent-model-capability-presentation-tool-surface", "Tool Surface：Agent 有工具，模型为什么看不到"],
          ["agent-content-trust-prompt-injection", "A35 内容信任：Prompt Injection 不只是恶意文本"],
          ["agent-multi-ecosystem-hook-execution", "多生态 Hook：Claude、Pi 与 Codex"],
          ["agent-tool-lifecycle-and-model-input", "工具调用到模型输入的观测链"],
          ["agent-runtime-constraint-governance-v2", "Run 预算与约束治理"],
          ["agent-personal-credits-shadow-accounting", "Agent 的请求数、Token 与 Credits 记账"],
          ["agent-control-events-durable-owner-adoption", "Agent 收到控制指令后，为什么不能立刻执行"],
          ["agent-autonomous-scheduled-research", "定时研究：会话结束后继续"],
          ["025-agent-langfuse-from-trace-to-trustworthy-observability", "Langfuse：从 Trace 到可信观测"]
        ]
      },
      {
        "title": "答案、发布与恢复",
        "desc": "候选正文、持久效果、用户实际收到的东西不能合并成一个状态。",
        "items": [
          ["019-agent-answer-publication", "Publication：为什么需要独立发布系统"],
          ["agent-progressive-answer-coherence", "渐进式回答如何保持连贯"],
          ["agent-feedback-facts-not-automatic-learning", "用户点了踩，Agent 就该学习吗？"],
          ["agent-asynchronous-research-time-bound-delivery", "异步研究：离开页面后怎样按时交付"],
          ["agent-durable-human-interaction-response-adoption", "Agent 问完用户之后：持久人机交互"]
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
        "title": "深度持续研究",
        "desc": "后台异步研究、阶段交付、持久恢复和历史论点连续性：让复杂研究跨时间真正完成。",
        "items": [
          ["agent-background-research-collaborative-experience", "想聊就聊，没收 AI 对话框的中止按钮！一天让你的 Agent 支持异步后台深度研究"],
          ["agent-weekly-thesis-history-continuous-research", "一份周报过去后，Agent 还记得为什么这样判断吗？"],
          ["agent-html-evolution-challenges", "HTML 保存了，为什么还是交付失败"],
          ["agent-provider-failover-without-resetting-the-run", "故障切换：换路线，不重置任务"],
          ["agent-disconnect-is-not-crash-recovery-contract", "断线不是崩溃：为什么 Agent 不必恢复原来的执行图？"],
          ["agent-veto-authority-and-run-termination", "Run 终结权、阶段预算与安全恢复"]
        ]
      },
      {
        "title": "Subagent 与专家",
        "desc": "从多视角研究和有界对抗，到专业化协作、独立交接与 Main 综合。",
        "items": [
          ["investment-perspectives-and-thesis-falsification", "不止一个投资专家：多视角 Agent 如何共同检验投资假设"],
          ["bounded-bull-bear-peer-dialogue", "当两个 Agent 开始直接对话：有界多空协作的 Runtime 设计"],
          ["multi-layer-agent-collaboration-outlook", "从多个专家到一份研究：多层 Agent 协作的下一站（2026 展望）"]
        ],
        "related": [
          ["agent-subagent-context-specialization", "Subagent：从隔离到专业化协作"],
          ["agent-custom-expert-from-prompt-to-recovery", "自定义专家，不应该只是一个 Prompt 输入框"]
        ]
      },
      {
        "title": "金融与工程",
        "desc": "金融事实、数字与引用的可信性，以及架构演化、故障归因和端到端质量。",
        "items": [
          ["financial-agent-system-panorama", "金融 Agent 全景：连接研究、业务与责任的系统架构"],
          ["mcp-market-responsibility-retrospective", "金融数据 MCP 为什么变成决策系统"],
          ["030-fintech-from-research-to-investment-advice", "从投资研究到投顾与交易的边界"],
          ["031-fintech-data-time-and-reproducible-numbers", "金融数字的时点、口径与复算"],
          ["financial-agent-python-result-consumption", "Python 算过了，投研报告为什么还会错"],
          ["financial-agent-trustworthy-evidence-chain", "金融 Agent 的可信证据链"],
          ["etf-agent-model-harness-research-loop", "投研 Agent 的关键不是多调用工具：Model、Harness 与 Loop"],
          ["agent-thinking-fast-slow-research-needs", "为什么 AI Agent 也需要《思考，快与慢》？"],
          ["ai-citations-do-not-prove-reliability", "很多引用为什么不等于可靠"],
          ["etf-assistant-engineering-origins", "一个 ETF 投资助手的工程起点"],
          ["code-cheaper-systems-harder-to-evolve", "代码越来越便宜，为什么系统却越来越难升级？"],
          ["agent-engineering-suite", "Agent Engineering Suite：让 Agent 从需求一路接到发布"],
          ["ai-coding-judgment-and-verification", "AI Coding 最贵的不是写代码，而是决定什么值得验证"],
          ["agent-differentiated-evolution-contracts", "Agent 架构如何做到该稳定的稳定，该变化的变化？"],
          ["agent-failure-is-a-boundary-problem", "别把每个失败都算给模型"],
          ["local-improvement-is-not-system-progress", "局部改善不等于整体进步：怎样判断 Agent 真的变好了？"]
        ]
      },
      {
        "title": "其他",
        "desc": "系统全景和通用架构基础：模型与 Runtime 的边界、授权和 Owner 职责。",
        "items": [
          ["one-report-nine-architecture-judgments", "一份报告背后的九个架构判断"],
          ["open-etf-agent-v010-system-design", "从第一份报告到可恢复的研究程序：Open ETF Agent 的第二个阶段"],
          ["017-prompt-to-answer-six-layer-panorama-v3", "六层调用全景 V3：从提问到答案可见"],
          ["011-model-understands-code-authorizes", "模型会理解，代码才授权"],
          ["runtime-model-protocol-boundary-agent-article-v2", "别让模型当状态机"],
          ["agent-model-runtime-mcp-skill-boundaries", "Model / Runtime / MCP / Skill 的分工"]
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
          ["026-agent-spec-evidence-workflow", "Spec、Evidence 与可验证研发关闭"],
          ["agent-weekly-review-staged-delivery", "周报做了整晚，为何首份交付还没完成？"],
          ["027-agent-context-document-history", "工程知识：按需加载、长期记忆与退役"]
        ]
      },
      {
        "title": "真实验证与任务收敛",
        "desc": "区分假绿、模型返回与最终任务完成，让研发从局部修补走向可验证收敛。",
        "items": [
          ["open-etf-agent-v01-first-readable-report", "Open ETF Agent v0.1：从第一份可回读报告开始"],
          ["honest-agent-evaluation", "测试与评测：绿灯究竟证明什么"],
          ["test-lifecycle-refactoring-retirement-and-spec", "测试也会过期：把重构、退役和删除前移到 Spec"],
          ["agent-runtime-refactor-one-day-blocked", "一个 Subagent 改动，为什么拖住了我们整整一天？"],
          ["032-ai-development-from-bug-loop-to-task-convergence", "从 Bug 循环到完整任务收敛"]
        ]
      }
    ]
  }
];
export const chapters = collections.flatMap(collection => collection.chapters);
export const articleCount = chapters.reduce((n, chapter) => n + chapter.items.length, 0);

// Previously published URLs remain readable, without duplicating essays in search/navigation.
export const mergedArticles = {
  "001-one-week-4-billion-tokens-etf-investment-agent": "etf-assistant-engineering-origins",
  "023-agent-publication-governance-retrospective": "019-agent-answer-publication",
  "runtime-natural-language-boundary-article-v2": "runtime-model-protocol-boundary-agent-article-v2",
  "028-agent-feedback-system-without-false-learning": "agent-failure-is-a-boundary-problem",
  "010-agent-first-brakes": "011-model-understands-code-authorizes",
  "partial-is-not-complete": "tool-results-outside-model-context",
  "green-tests-can-lie": "honest-agent-evaluation",
  "agent-engineering-knowledge-lifecycle": "027-agent-context-document-history",
  "honest-agent-failure-semantics": "agent-veto-authority-and-run-termination"
};

// Historical full-text editions remain readable at independent URLs but are not counted as new canonical essays.
export const historicalEditions = {
  "017-prompt-to-answer-six-layer-panorama-v1": "017-prompt-to-answer-six-layer-panorama-v3",
  "017-prompt-to-answer-six-layer-panorama": "017-prompt-to-answer-six-layer-panorama-v3"
};
