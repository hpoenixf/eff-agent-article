// One canonical reading tree. Historical editions remain fully readable.
// Finance is a curated subject, not a substitute for engineering or a fourth perspective.
export const collections = [
  {
    "id": "modules",
    "title": "模块维度",
    "subtitle": "沿六层请求链阅读具体机制；按主要交接定位，保留跨层 Owner 与关联阅读。",
    "label": "MODULE DEEP DIVES",
    "chapters": [
      {
        "id": "l1",
        "title": "L1 · 任务输入与触发",
        "desc": "工作从定时任务或其他获准触发开始；输入不代替后续研究决策。",
        "items": [
          ["agent-autonomous-scheduled-research", "定时研究：会话结束后继续"]
        ]
      },
      {
        "id": "l2",
        "title": "L2 · 身份、会话与上下文",
        "desc": "按原 Owner 主层阅读身份、能力准入、上下文和持久交互；跨层参与不改变事实归属。",
        "items": [
          ["020-agent-extension-host-smartphone", "Extension Host：从功能机到智能机"],
          ["tool-results-outside-model-context", "结果外置与完整性：模型到底读到了多少"],
          ["agent-main-run-context-compaction", "Main 压缩：摘要不改写原始事实"],
          ["agent-conversation-history-compaction-source-boundaries", "跨 Run 会话压缩：旧助手摘要不能替代用户原文"],
          ["026-agent-memory-forget-durable-effects", "Memory：从保存、召回到安全遗忘"],
          ["agent-content-trust-prompt-injection", "A35 内容信任：Prompt Injection 不只是恶意文本"],
          ["agent-control-events-durable-owner-adoption", "Agent 收到控制指令后，为什么不能立刻执行"],
          ["agent-durable-human-interaction-response-adoption", "Agent 问完用户之后：持久人机交互"],
          ["agent-custom-expert-from-prompt-to-recovery", "自定义专家，不应该只是一个 Prompt 输入框"],
          ["agent-personal-credits-shadow-accounting", "Agent 的请求数、Token 与 Credits 记账"]
        ]
      },
      {
        "id": "l3",
        "title": "L3 · Agent 决策与运行",
        "desc": "Entry 与 Main 选择研究动作，Child、Provider、工具表面和预算支撑有边界的执行。",
        "items": [
          ["022-agent-entry-from-intent-to-direct-research", "Entry：为什么入口越来越简单"],
          ["adaptive-research-python-workbench", "Adaptive Research 与 Python"],
          ["agent-subagent-context-specialization", "Subagent 全景：独立上下文、专业协作与真实成果交接"],
          ["agent-provider-architecture-and-admission", "Provider：统一接口之后，为什么还需要共享准入"],
          ["agent-provider-admission-capacity-lease", "模型返回 HTTP 200，为什么下一次还要排队"],
          ["agent-model-capability-presentation-tool-surface", "Tool Surface：Agent 有工具，模型为什么看不到"],
          ["agent-multi-ecosystem-hook-execution", "多生态 Hook：Claude、Pi 与 Codex"],
          ["agent-runtime-constraint-governance-v2", "Run 预算与约束治理"]
        ],
        "related": [
          ["025-agent-langfuse-from-trace-to-trustworthy-observability", "Agent 可观测全景：从一次模型请求到可回查的研究事实"]
        ]
      },
      {
        "id": "l4",
        "title": "L4 · 工具与领域能力",
        "desc": "受控读取、隔离计算、MCP、市场时间与投资事实；工具回执不自动成为研究结论。",
        "items": [
          ["021-agent-web-research-from-search-to-deep-reading", "Web：从搜索到连续阅读"],
          ["024-agent-pdf-from-text-to-evidence", "PDF：从文本到证据"],
          ["agent-temporal-semantics-market-calendar", "Agent 说“今天”时，到底是哪一天"],
          ["agent-python-compute-workbench-evolution", "Python：从工具到计算工作台"],
          ["portfolio-mcp-readonly-investment-data", "把个人持仓接入 Agent：我们怎样设计一个只读金融 MCP"],
          ["unavailable-is-correct", "数据过期后的受控刷新"],
          ["027-rag-revocation-publish-replay", "RAG：文档撤权与历史回放"],
          ["mcp-host-from-discovery-to-consumption", "从接上 MCP 到真正用上工具：Agent 的接入链路怎样构建"],
          ["agent-tool-lifecycle-and-model-input", "工具调用到模型输入的观测链"]
        ],
        "related": [
          ["tool-results-outside-model-context", "结果外置与完整性：模型到底读到了多少"]
        ]
      },
      {
        "id": "l5",
        "title": "L5 · 结果发布与交付",
        "desc": "区分正文接纳、版本提交、会话交付与用户反馈事实。",
        "items": [
          ["019-agent-answer-publication", "Publication：为什么需要独立发布系统"],
          ["agent-asynchronous-research-time-bound-delivery", "异步研究：离开页面后怎样按时交付"],
          ["agent-feedback-facts-not-automatic-learning", "用户点了踩，Agent 就该学习吗？"]
        ]
      },
      {
        "id": "l6",
        "title": "L6 · 用户界面",
        "desc": "围绕客户端实际可见的回答、进度与正确 Run 归属阅读；不等同于独占前端 Owner。",
        "items": [
          ["agent-progressive-answer-coherence", "渐进式回答如何保持连贯"]
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
          ["agent-long-horizon-research-panorama", "超长研究全景：让 Agent 跨越上下文、中断与时间继续交付"],
          ["agent-background-research-collaborative-experience", "想聊就聊，没收 AI 对话框的中止按钮！一天让你的 Agent 支持异步后台深度研究"],
          ["agent-weekly-thesis-history-continuous-research", "一份周报过去后，Agent 还记得为什么这样判断吗？"],
          ["agent-html-evolution-challenges", "HTML 保存了，为什么还是交付失败"],
          ["agent-provider-failover-without-resetting-the-run", "故障切换：换路线，不重置任务"],
          ["agent-disconnect-is-not-crash-recovery-contract", "断线不是崩溃：为什么 Agent 不必恢复原来的执行图？"],
          ["agent-veto-authority-and-run-termination", "Run 终结权、阶段预算与安全恢复"],
          ["etf-agent-model-harness-research-loop", "投研 Agent 的关键不是多调用工具：Model、Harness 与 Loop"]
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
          ["agent-subagent-context-specialization", "Subagent 全景：独立上下文、专业协作与真实成果交接"],
          ["agent-subagent-contribution-evidence", "多专家 Agent：怎么证明专家的结论真的被主 Agent 用到了？"],
          ["agent-custom-expert-from-prompt-to-recovery", "自定义专家，不应该只是一个 Prompt 输入框"]
        ]
      },
      {
        "title": "金融研究与业务责任",
        "desc": "金融数据与计算口径、投研服务边界，以及投资业务的真实责任。",
        "items": [
          ["financial-agent-system-panorama", "金融 Agent 全景：连接研究、业务与责任的系统架构"],
          ["mcp-market-responsibility-retrospective", "金融数据 MCP 为什么变成决策系统"],
          ["030-fintech-from-research-to-investment-advice", "从投资研究到投顾与交易的边界"],
          ["031-fintech-data-time-and-reproducible-numbers", "金融数字的时点、口径与复算"],
          ["financial-agent-python-result-consumption", "Python 算过了，投研报告为什么还会错"]
        ]
      },
      {
        "title": "架构学习路线",
        "desc": "从十五分钟入门、十模块进阶，到可运行的深入实践和六层全景；按认知难度逐步阅读。",
        "items": [
          ["agent-in-15-minutes", "十五分钟入门 Agent"],
          ["agent-ten-modules", "Agent 进阶：读懂 Open ETF Agent 的十个核心模块"],
          ["open-etf-agent-v010-system-design", "Agent 深入：从一份报告到持续执行与专家协作"],
          ["017-prompt-to-answer-six-layer-panorama-v3", "六层调用全景：从提问到答案可见"],
          ["agent-context-governance-principles", "Agent 上下文治理全景·原则篇：让每一步判断围绕目标展开"],
          ["agent-context-governance-actions", "Agent 上下文治理全景·行动篇：从首轮输入到长期记忆，怎样真正落地"]
        ]
      },
      {
        "title": "系统边界与演进",
        "desc": "跨模块证据关系、职责边界、故障归因、可靠性与长期架构演化。",
        "items": [
          ["one-report-nine-architecture-judgments", "一份报告背后的九个架构判断"],
          ["011-model-understands-code-authorizes", "模型会理解，代码才授权"],
          ["runtime-model-protocol-boundary-agent-article-v2", "别让模型当状态机"],
          ["agent-model-runtime-mcp-skill-boundaries", "Model / Runtime / MCP / Skill 的分工"],
          ["financial-agent-trustworthy-evidence-chain", "金融 Agent 的可信证据链"],
          ["agent-thinking-fast-slow-research-needs", "为什么 AI Agent 也需要《思考，快与慢》？"],
          ["ai-citations-do-not-prove-reliability", "Agent 引用全景：从原始资料到可核查的结论"],
          ["code-cheaper-systems-harder-to-evolve", "代码越来越便宜，为什么系统却越来越难升级？"],
          ["agent-differentiated-evolution-contracts", "Agent 架构如何做到该稳定的稳定，该变化的变化？"],
          ["agent-failure-is-a-boundary-problem", "别把每个失败都算给模型"],
          ["local-improvement-is-not-system-progress", "局部改善不等于整体进步：怎样判断 Agent 真的变好了？"],
          ["025-agent-langfuse-from-trace-to-trustworthy-observability", "Agent 可观测全景：从一次模型请求到可回查的研究事实"],
          ["agent-report-cost-attribution", "Agent 生成一份报告，到底应该怎么算成本？"]
        ]
      }
    ]
  },
  {
    "id": "engineering",
    "title": "AI Agent 研发工程实践",
    "subtitle": "从 Coding Agent 辅助开发到 Agent Runtime 的真实验证，围绕规范、测试、协议、故障复盘与任务收敛持续改进系统。",
    "label": "AI-ASSISTED ENGINEERING",
    "chapters": [
      {
        "title": "Spec、证据与工程记忆",
        "desc": "从规范到真实执行证据，再到按需加载的长期工程历史。",
        "items": [
          ["agent-engineering-suite", "Agent Engineering Suite：让 Agent 从需求一路接到发布"],
          ["docs-code-tests-evolve-together", "测试比实现还多之后：怎样让文档、代码和测试一起向前"],
          ["agent-article-code-evidence-contract", "文章说能运行，代码真的支持吗？——技术文章与开源实现的证据契约"],
          ["026-agent-spec-evidence-workflow", "Spec、Evidence 与可验证研发关闭"],
          ["agent-weekly-review-staged-delivery", "周报做了整晚，为何首份交付还没完成？"],
          ["027-agent-context-document-history", "工程知识：按需加载、长期记忆与退役"]
        ]
      },
      {
        "title": "真实验证与任务收敛",
        "desc": "核对 Runtime 协议、追踪、专家交接与研究质量，区分局部测试通过、运行完成和最终任务价值。",
        "items": [
          ["open-etf-agent-v01-first-readable-report", "Open ETF Agent v0.1：从第一份可回读报告开始"],
          ["honest-agent-evaluation", "Agent 测评全景：从测试绿灯到真实任务价值"],
          ["agent-trace-complete-observation-gaps", "Trace 显示 Complete，为什么 Agent 还是无法完整复盘？"],
          ["agent-subagent-contribution-evidence", "多专家 Agent：怎么证明专家的结论真的被主 Agent 用到了？"],
          ["agent-stream-tool-call-null-continuation", "一个 null 如何让 Agent 工具调用失败：流式协议兼容性实战"],
          ["rag-retrieval-evaluation-evidence", "RAG 召回率很好看，为什么仍不能证明 Agent 找对了金融证据？"],
          ["test-lifecycle-refactoring-retirement-and-spec", "测试也会过期：把重构、退役和删除前移到 Spec"],
          ["agent-runtime-refactor-one-day-blocked", "一个 Subagent 改动，为什么拖住了我们整整一天？"],
          ["032-ai-development-from-bug-loop-to-task-convergence", "从 Bug 循环到完整任务收敛"],
          ["etf-assistant-engineering-origins", "一个 ETF 投资助手的工程起点"],
          ["ai-coding-judgment-and-verification", "AI Coding 最贵的不是写代码，而是决定什么值得验证"]
        ]
      }
    ]
  }
];
export const chapters = collections.flatMap(collection => collection.chapters);
export const articleCount = chapters.reduce((n, chapter) => n + chapter.items.length, 0);

// #全景系列 is a cross-category tag: curated existing essays, never a fourth canonical collection.
export const panoramaSeriesSlugs = Object.freeze([
  '017-prompt-to-answer-six-layer-panorama-v3',
  'financial-agent-system-panorama',
  'one-report-nine-architecture-judgments',
  'agent-context-governance-principles',
  'agent-context-governance-actions',
  '025-agent-langfuse-from-trace-to-trustworthy-observability',
  'honest-agent-evaluation',
  'ai-citations-do-not-prove-reliability',
  'agent-subagent-context-specialization',
  'agent-long-horizon-research-panorama'
]);

// A curated subset of the canonical catalogue, not a second classification tree.
export const learningPathSlugs = [
  'agent-in-15-minutes',
  'agent-ten-modules',
  'open-etf-agent-v010-system-design',
  '017-prompt-to-answer-six-layer-panorama-v3'
];

// Previously published URLs remain readable, without duplicating essays in search/navigation.
export const mergedArticles = {
  "agent-loop-to-application": "open-etf-agent-v010-system-design",
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