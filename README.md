<div align="center">

# ETF Agent · Engineering Notes

**从真实开发与故障出发，读懂一套 Agent 系统如何运行、演化与交付。**

模块机制 × 架构思考 × AI Agent 研发工程 · **66 篇正文，三条主线**

[**首要必读 · 六层调用全景 V3**](https://hpoenixf.com/eff-agent-article/articles/017-prompt-to-answer-six-layer-panorama-v3) · [**架构原则 · 九条核心判断**](https://hpoenixf.com/eff-agent-article/principles) · [**模块维度**](https://hpoenixf.com/eff-agent-article/modules) · [**架构设计与系统思考**](https://hpoenixf.com/eff-agent-article/thinking) · [**AI Agent 研发工程实践**](https://hpoenixf.com/eff-agent-article/engineering) · [**金融可信工程专题：合规·安全·韧性·留痕·审查**](https://hpoenixf.com/eff-agent-article/fintech) · [全部文章](https://hpoenixf.com/eff-agent-article/catalog) · [**开源运行代码（MIT）**](https://github.com/hpoenixf/open-etf-agent) · [个人博客](https://hpoenixf.com/)

</div>

---

## 最近更新

- [《断线不是崩溃：为什么 Agent 不必恢复原来的执行图？》](articles/agent-disconnect-is-not-crash-recovery-contract.md) · [English](en/articles/agent-disconnect-is-not-crash-recovery-contract.md)
- [金融 Agent 全景：连接研究、业务与责任的系统架构](articles/financial-agent-system-panorama.md) · [English](en/articles/financial-agent-system-panorama.md)
- [AI Coding 最贵的不是写代码，而是决定什么值得验证](articles/ai-coding-judgment-and-verification.md) · [English](en/articles/ai-coding-judgment-and-verification.md)

<details>
<summary>最近更新完整记录（展开查看）</summary>

## 2026-10-27 · Agent 研究恢复与专家交接

新增[《断线不是崩溃：为什么 Agent 不必恢复原来的执行图？》](articles/agent-disconnect-is-not-crash-recovery-contract.md)与[完整英文版](en/articles/agent-disconnect-is-not-crash-recovery-contract.md)，明确客户端重连、服务中断结算、受控 Human/Child 唤醒和新 Run 复用原材料之间的产品承诺。同期更新[自定义专家](articles/agent-custom-expert-from-prompt-to-recovery.md)、[Subagent](articles/agent-subagent-context-specialization.md)、[评测证据](articles/honest-agent-evaluation.md)和[终结权](articles/agent-veto-authority-and-run-termination.md)已有中英文主稿。工程验证不等于自然模型研究质量证明，旧文章保留原路径与图表。

## 2026-10-27 · 金融 Agent 系统全景

[金融 Agent 全景：连接研究、业务与责任的系统架构](articles/financial-agent-system-panorama.md)从用户、机构与监管三个视角，讲清四个责任领域、研究与业务双生命周期，以及可追溯的事实关系。配套三张可放大 SVG，并提供[完整英文正文与英文图件](en/articles/financial-agent-system-panorama.md)。这是独立的金融主题主稿，不替换六层调用全景；机构目标能力与现有个人研究系统明确区分。

## 2026-10-27 · AI Coding：把验证投入到真正重要的问题

[AI Coding 最贵的不是写代码，而是决定什么值得验证](articles/ai-coding-judgment-and-verification.md)从最近两个月 ETF Agent 的金融比较误判、Reviewer 材料缺口与精确计算反例出发，讨论正确性、反例与验证投入。提供[完整英文版](en/articles/ai-coding-judgment-and-verification.md)。同批深化[引用可信度](articles/ai-citations-do-not-prove-reliability.md)和[测试评测](articles/honest-agent-evaluation.md)原文，保留旧链接、事实与图示；不把它们改成重复的新文章。

## 2026-10-26 · 研究推进的第二种阅读视角

[六层调用全景 V3](articles/017-prompt-to-answer-six-layer-panorama-v3.md)微调了研究推进的三个时间尺度；新增[投研 Agent 的关键不是多调用工具：Model、Harness 与 Loop](articles/etf-agent-model-harness-research-loop.md)沿同一基金问题讲清模型判断、真实工具回执、重开研究问题、停放接续与交付。它不是六层的替代版本，也不新增独立研究调度器。两篇均提供完整中文与英文正文。

## 2026-10-26 · 一次重构，两种阅读视角

[一个 Subagent 改动，为什么拖住了我们整整一天？](articles/agent-runtime-refactor-one-day-blocked.md)复盘职责耦合、旧测试入口与并行整合的真实代价；[Agent 架构如何做到该稳定的稳定，该变化的变化？](articles/agent-differentiated-evolution-contracts.md)用 Child、Memory、金融计算与 Provider 案例解释差异化演进契约。两篇均有完整英文版，分别收录于研发工程与架构思考，开头和文末互相引用。

## 新增架构原则：局部改善与系统进步

- [局部改善不等于整体进步](articles/local-improvement-is-not-system-progress.md)——结合工具结果投影、Trace 与独立 Judge 的真实案例，区分局部修复、测量修正和完整任务的收益；对应[第九核心原则](principles.md#principle-9)。

## 新增模块实践：让用户自定义专家真正可用

- [自定义专家，不应该只是一个 Prompt 输入框](articles/agent-custom-expert-from-prompt-to-recovery.md)：个人研究方法如何保存、冻结版本、正确送入 Child，并在 History 中保留真实归属；包含用户 Prompt 请求层级与设置页并发编辑的工程教训。原 [Subagent 专文](articles/agent-subagent-context-specialization.md) 继续解释通用执行底座。

## 最近的 Owner 专文：控制事件与 Provider 容量

- [A08：Agent 收到控制指令后，为什么不能立刻执行](articles/agent-control-events-durable-owner-adoption.md) · [A30：模型返回 HTTP 200，为什么下一次还要排队](articles/agent-provider-admission-capacity-lease.md)。两个独立模块案例均提供中文及完整英文版本；[A32 模型目录边界](articles/agent-provider-architecture-and-admission.md)则深化在既有 Provider 专文中，不增重复文章。

## 最近的机制文章：人机协作、时间与用量

- [持久 HIL：回答怎样回到原研究](articles/agent-durable-human-interaction-response-adoption.md) · [Temporal semantics：用户的今天与美股交易日](articles/agent-temporal-semantics-market-calendar.md) · [Shadow Credits：用量事实与未知](articles/agent-personal-credits-shadow-accounting.md)。三篇均已准备完整中英正文；主分类归模块维度，真实模型质量和生产资格不由文章入库证明。

## 多 Agent 投研系列：机制、视角与展望

- [当两个 Agent 开始直接对话](articles/bounded-bull-bear-peer-dialogue.md)：从反方价值读到真实消息、预算和恢复。
- [多视角 Agent 如何共同检验投资假设](articles/investment-perspectives-and-thesis-falsification.md)：六种投资方法怎样选择、共享事实、挑战关键前提并由 Main 综合。
- [从多个专家到一份研究：2026 架构展望](articles/multi-layer-agent-collaboration-outlook.md)：跨能力协作的目标、缺口和未来与单 Main 对照的验收标准。

自定义 Agent 仍是独立草稿，暂不纳入正式目录；展望文章不代表完整协作效果已验收。

</details>

## 初次访问：90 秒找到最相关的工程证据

**两篇首要必读：** [六层调用全景 V3](https://hpoenixf.com/eff-agent-article/articles/017-prompt-to-answer-six-layer-panorama-v3) 是运行地图，沿一次请求讲清会话、Main/Subagent、可选工具、发布与界面；[Agent 架构原则与系统方法](https://hpoenixf.com/eff-agent-article/principles) 是设计判断地图，归纳跨模块原则和按需工程方法。两篇共同服务后续模块精讲，不增加第四个文章分类。

本仓库是一套**公开可读的 Agent 工程案例与技术文集**，而不是 ETF Agent 的可执行开源实现。作者的前端背景见[个人博客 About](https://hpoenixf.com/about)；下表按读者的关注点推荐最短路径。

| 关注方向 | 建议先读 | 可以观察到什么 |
| --- | --- | --- |
| **AI-native 前端与交互** | [渐进式回答](articles/agent-progressive-answer-coherence.md) → [异步研究的前端交付](articles/agent-asynchronous-research-time-bound-delivery.md) → [答案发布与版本](articles/019-agent-answer-publication.md) → [HTML/文件交付](articles/agent-html-evolution-challenges.md) | 分段正文、后台通知、重连重读、事件去重与 Host 交付边界；可另读[Relay 数据建模案例](https://hpoenixf.com/blog/relay-id-issue) |
| **Agent 应用开发** | [六层调用全景 V3](articles/017-prompt-to-answer-six-layer-panorama-v3.md) → [Model / Harness / Loop 研究推进](articles/etf-agent-model-harness-research-loop.md) → [Subagent](articles/agent-subagent-context-specialization.md) → [自定义专家](articles/agent-custom-expert-from-prompt-to-recovery.md) → [Python 工作台](articles/agent-python-compute-workbench-evolution.md) | 工具调用、任务协作、资料处理、计算、错误恢复与产物交接 |
| **Agent 系统架构** | [模型/Runtime/MCP/Skill 分工](articles/agent-model-runtime-mcp-skill-boundaries.md) → [工具可见性与 A34](articles/agent-model-capability-presentation-tool-surface.md) → [A35 内容信任](articles/agent-content-trust-prompt-injection.md) → [授权与事实归属](articles/011-model-understands-code-authorizes.md) → [否决权治理](articles/agent-veto-authority-and-run-termination.md) → [架构演化与五不原则](articles/code-cheaper-systems-harder-to-evolve.md) | 为什么划分职责、如何控制局部失败影响、怎样降低长期复杂度 |
| **AI 辅助工程研发** | [Spec 与 Evidence](articles/026-agent-spec-evidence-workflow.md) → [分期交付](articles/agent-weekly-review-staged-delivery.md) → [知识退役](articles/027-agent-context-document-history.md) → [测试生命周期](articles/test-lifecycle-refactoring-retirement-and-spec.md) → [真实任务收敛](articles/032-ai-development-from-bug-loop-to-task-convergence.md) | 如何让 Coding Agent 从完整设计走向首份交付，同时不被旧规范与测试束缚 |

**两种公开资产，两个仓库：** 本仓库 [eff-agent-article](https://github.com/hpoenixf/eff-agent-article) 是工程文章、图册与阅读站源码；[open-etf-agent](https://github.com/hpoenixf/open-etf-agent) 是独立 MIT 开源、可运行的分阶段教学实现（截至 2026-10-27 为 v0.9），提供合成离线 Demo、测试及交付回读。后者**不是内部完整 ETF Agent 产品的开源替代品**，其通过的 Runtime 测试不代表真实模型语义质量、投资服务或生产就绪；内部产品源码、凭据和完整生产运行证据仍不公开。两套资产均不能单独证明第三方复核过长期成功率或用户收益。

[从在线阅读站开始](https://hpoenixf.com/eff-agent-article/) · [博客与作者简介](https://hpoenixf.com/about) · [金融领域案例专题](fintech.md)

## 按问题选择阅读主线

| 阅读入口 | 回答的问题 | 范围 |
| --- | --- | --- |
| [模块维度](modules.md) | Agent 如何运行？ | **31 篇 / 4 组**，Entry、Web、PDF、MCP、Portfolio、Provider、Python、Memory、Runtime 与交付 |
| [架构设计与系统思考](thinking.md) | 为什么这样设计？ | **27 篇 / 4 组**，Owner、授权、复杂度、恢复与演化 |
| [AI Agent 研发工程实践](engineering.md) | 如何持续开发和验证？ | **8 篇 / 2 组**，Spec、分期交付、工程知识、History、假绿与任务收敛 |
| [金融科技 × Agent 专题](fintech.md) | 这些机制怎样进入金融业务？ | 跨分类风险与控制阅读地图；不作为第四个一级分类，不重复正文 |

![ETF Agent 43 个能力 Owner 与主要交接](visuals/owner-architecture/overview.svg)

[交互式 Owner 架构图册](https://hpoenixf.com/eff-agent-article/gallery)：按完整能力及最终效果归属分类，保留已核实的专文与相关文章映射。研发规范文章不因涉及 Agent 就强行挂到运行时 Owner。

### 推荐起点

**原则与方法：** [核心判断与外围方法](https://hpoenixf.com/eff-agent-article/principles) · [现有文章深化与新题预告](https://hpoenixf.com/eff-agent-article/roadmap)。两者是阅读导航，不计入 66 篇正文；仍以 [book.mjs](book.mjs) 为唯一文章分类与顺序来源。

**模块：** [A08 持久控制](articles/agent-control-events-durable-owner-adoption.md) · [A30 容量租约](articles/agent-provider-admission-capacity-lease.md) · [Provider 共享准入](articles/agent-provider-architecture-and-admission.md) · [定时研究](articles/agent-autonomous-scheduled-research.md) · [Main 压缩](articles/agent-main-run-context-compaction.md) · [Python 计算工作台](articles/agent-python-compute-workbench-evolution.md) · [Memory 持久效果](articles/026-agent-memory-forget-durable-effects.md) · [Publication 独立发布](articles/019-agent-answer-publication.md)

**架构：** [想聊就聊：异步后台研究](articles/agent-background-research-collaborative-experience.md) · [故障域感知切换](articles/agent-provider-failover-without-resetting-the-run.md) · [模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md) · [否决权与 Run 终结权](articles/agent-veto-authority-and-run-termination.md) · [架构演化与五不原则](articles/code-cheaper-systems-harder-to-evolve.md)

**研发：** [Spec 与 Evidence](articles/026-agent-spec-evidence-workflow.md) · [周报分期交付](articles/agent-weekly-review-staged-delivery.md) · [文档、History 与知识退役](articles/027-agent-context-document-history.md) · [测试生命周期](articles/test-lifecycle-refactoring-retirement-and-spec.md) · [任务收敛](articles/032-ai-development-from-bug-loop-to-task-convergence.md)

**金融：** [金融 Agent 系统全景](articles/financial-agent-system-panorama.md) · [投顾与交易边界](articles/030-fintech-from-research-to-investment-advice.md) · [金融数字复算](articles/031-fintech-data-time-and-reproducible-numbers.md) · [Python 结果消费](articles/financial-agent-python-result-consumption.md) · [可信证据链](articles/financial-agent-trustworthy-evidence-chain.md) · [持续投资研究的历史与论点](articles/agent-weekly-thesis-history-continuous-research.md)

## 全部文章

阅读次序、侧栏与上一篇／下一篇的唯一结构来源是 [book.mjs](book.mjs)。同一读者问题由一篇主稿承接；旧链接保留合稿说明，不作为独立文章重复计数。

### 1 / 模块维度

[进入在线目录 →](https://hpoenixf.com/eff-agent-article/modules)

<details>
<summary><b>01 · 研究入口、阅读与计算</b>（10 篇）</summary>

- [Entry：为什么入口越来越简单](articles/022-agent-entry-from-intent-to-direct-research.md)
- [Web：从搜索到连续阅读](articles/021-agent-web-research-from-search-to-deep-reading.md)
- [Agent 说“今天”时，到底是哪一天](articles/agent-temporal-semantics-market-calendar.md)
- [PDF：从文本到证据](articles/024-agent-pdf-from-text-to-evidence.md)
- [Subagent：从隔离到专业化协作](articles/agent-subagent-context-specialization.md)
- [自定义专家，不应该只是一个 Prompt 输入框](articles/agent-custom-expert-from-prompt-to-recovery.md)
- [Adaptive Research 与 Python](articles/adaptive-research-python-workbench.md)
- [Python：从工具到计算工作台](articles/agent-python-compute-workbench-evolution.md)
- [把个人持仓接入 Agent：我们怎样设计一个只读金融 MCP](articles/portfolio-mcp-readonly-investment-data.md)
- [数据过期后的受控刷新](articles/unavailable-is-correct.md)

</details>

<details>
<summary><b>02 · 上下文、研究资产与知识</b>（4 篇）</summary>

- [结果外置与完整性：模型到底读到了多少](articles/tool-results-outside-model-context.md)
- [Main 压缩：摘要不改写原始事实](articles/agent-main-run-context-compaction.md)
- [Memory：遗忘已提交，回答却失败](articles/026-agent-memory-forget-durable-effects.md)
- [RAG：文档撤权与历史回放](articles/027-rag-revocation-publish-replay.md)

</details>

<details>
<summary><b>03 · 运行时、扩展与观测</b>（13 篇）</summary>

- [Provider：统一接口之后，为什么还需要共享准入](articles/agent-provider-architecture-and-admission.md)
- [模型返回 HTTP 200，为什么下一次还要排队](articles/agent-provider-admission-capacity-lease.md)
- [Extension Host：从功能机到智能机](articles/020-agent-extension-host-smartphone.md)
- [从接上 MCP 到真正用上工具：Agent 的接入链路怎样构建](articles/mcp-host-from-discovery-to-consumption.md)
- [Tool Surface：Agent 有工具，模型为什么看不到](articles/agent-model-capability-presentation-tool-surface.md)
- [A35 内容信任：Prompt Injection 不只是恶意文本](articles/agent-content-trust-prompt-injection.md)
- [多生态 Hook：Claude、Pi 与 Codex](articles/agent-multi-ecosystem-hook-execution.md)
- [工具调用到模型输入的观测链](articles/agent-tool-lifecycle-and-model-input.md)
- [Run 预算与约束治理](articles/agent-runtime-constraint-governance-v2.md)
- [Agent 的请求数、Token 与 Credits 记账](articles/agent-personal-credits-shadow-accounting.md)
- [Agent 收到控制指令后，为什么不能立刻执行](articles/agent-control-events-durable-owner-adoption.md)
- [定时研究：会话结束后继续](articles/agent-autonomous-scheduled-research.md)
- [Langfuse：从 Trace 到可信观测](articles/025-agent-langfuse-from-trace-to-trustworthy-observability.md)

</details>

<details>
<summary><b>04 · 答案、发布与恢复</b>（4 篇）</summary>

- [Publication：为什么需要独立发布系统](articles/019-agent-answer-publication.md)
- [渐进式回答如何保持连贯](articles/agent-progressive-answer-coherence.md)
- [异步研究：离开页面后怎样按时交付](articles/agent-asynchronous-research-time-bound-delivery.md)
- [Agent 问完用户之后：持久人机交互](articles/agent-durable-human-interaction-response-adoption.md)

</details>

### 2 / 架构设计与系统思考

[进入在线目录 →](https://hpoenixf.com/eff-agent-article/thinking)

按 Roadmap 的三项技术攻坚与金融业务价值验证方向组织成四组；每篇文章只收录一次，V1/V2 历史链接保持可访问。

<details>
<summary><b>01 · 深度持续研究</b>（5 篇）</summary>

- [想聊就聊，没收 AI 对话框的中止按钮！一天让你的 Agent 支持异步后台深度研究](articles/agent-background-research-collaborative-experience.md)
- [一份周报过去后，Agent 还记得为什么这样判断吗？](articles/agent-weekly-thesis-history-continuous-research.md)
- [HTML 保存了，为什么还是交付失败](articles/agent-html-evolution-challenges.md)
- [故障切换：换路线，不重置任务](articles/agent-provider-failover-without-resetting-the-run.md)
- [Run 终结权、阶段预算与安全恢复](articles/agent-veto-authority-and-run-termination.md)

</details>

<details>
<summary><b>02 · Subagent 与专家</b>（3 篇）</summary>

- [不止一个投资专家：多视角 Agent 如何共同检验投资假设](articles/investment-perspectives-and-thesis-falsification.md)
- [当两个 Agent 开始直接对话：有界多空协作的 Runtime 设计](articles/bounded-bull-bear-peer-dialogue.md)
- [从多个专家到一份研究：多层 Agent 协作的下一站（2026 展望）](articles/multi-layer-agent-collaboration-outlook.md)

**关联阅读（以下两篇主分类为「模块维度」，不计入本组篇数）：**

- [Subagent：从隔离到专业化协作](articles/agent-subagent-context-specialization.md)
- [自定义专家，不应该只是一个 Prompt 输入框](articles/agent-custom-expert-from-prompt-to-recovery.md)

</details>

<details>
<summary><b>03 · 金融与工程</b>（14 篇）</summary>

- [金融 Agent 全景：连接研究、业务与责任的系统架构](articles/financial-agent-system-panorama.md)
- [金融数据 MCP 为什么变成决策系统](articles/mcp-market-responsibility-retrospective.md)
- [从投资研究到投顾与交易的边界](articles/030-fintech-from-research-to-investment-advice.md)
- [金融数字的时点、口径与复算](articles/031-fintech-data-time-and-reproducible-numbers.md)
- [Python 算过了，投研报告为什么还会错](articles/financial-agent-python-result-consumption.md)
- [金融 Agent 的可信证据链](articles/financial-agent-trustworthy-evidence-chain.md)
- [投研 Agent 的关键不是多调用工具：Model、Harness 与 Loop](articles/etf-agent-model-harness-research-loop.md)
- [很多引用为什么不等于可靠](articles/ai-citations-do-not-prove-reliability.md)
- [一个 ETF 投资助手的工程起点](articles/001-one-week-4-billion-tokens-etf-investment-agent.md)
- [代码越来越便宜，为什么系统却越来越难升级？](articles/code-cheaper-systems-harder-to-evolve.md)
- [AI Coding 最贵的不是写代码，而是决定什么值得验证](articles/ai-coding-judgment-and-verification.md)
- [Agent 架构如何做到该稳定的稳定，该变化的变化？](articles/agent-differentiated-evolution-contracts.md)
- [别把每个失败都算给模型](articles/agent-failure-is-a-boundary-problem.md)
- [局部改善不等于整体进步：怎样判断 Agent 真的变好了？](articles/local-improvement-is-not-system-progress.md)

</details>

<details>
<summary><b>04 · 其他</b>（4 篇）</summary>

- [六层调用全景 V3：从提问到答案可见](articles/017-prompt-to-answer-six-layer-panorama-v3.md)
- [模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md)
- [别让模型当状态机](articles/runtime-model-protocol-boundary-agent-article-v2.md)
- [Model / Runtime / MCP / Skill 的分工](articles/agent-model-runtime-mcp-skill-boundaries.md)

</details>

### 3 / AI Agent 研发工程实践

[进入在线目录 →](https://hpoenixf.com/eff-agent-article/engineering)

<details>
<summary><b>01 · Spec、证据与工程记忆</b>（3 篇）</summary>

- [Spec、Evidence 与可验证研发关闭](articles/026-agent-spec-evidence-workflow.md)
- [周报做了整晚，为何首份交付还没完成？](articles/agent-weekly-review-staged-delivery.md)
- [工程知识：按需加载、长期记忆与退役](articles/027-agent-context-document-history.md)

</details>

<details>
<summary><b>02 · 真实验证与任务收敛</b>（5 篇）</summary>

- [Open ETF Agent v0.1：从第一份可回读报告开始](articles/open-etf-agent-v01-first-readable-report.md)
- [测试与评测：绿灯究竟证明什么](articles/honest-agent-evaluation.md)
- [测试也会过期：把重构、退役和删除前移到 Spec](articles/test-lifecycle-refactoring-retirement-and-spec.md)
- [一个 Subagent 改动，为什么拖住了我们整整一天？](articles/agent-runtime-refactor-one-day-blocked.md)
- [从 Bug 循环到完整任务收敛](articles/032-ai-development-from-bug-loop-to-task-convergence.md)

</details>

## 延伸阅读与边界

- [金融科技 × Agent 主题阅读](fintech.md)：跨分类精选，不另外生成文章副本。
- [Agent 架构原则速查](principles.md)：用于设计、重构与 Code Review 的判断清单，不计入 66 篇正文。
- [架构图册](gallery.md) · [工程选题预告](roadmap.md) · [六层系统图文版](https://hpoenixf.com/eff-agent-article/visuals/017-prompt-to-answer-six-layer-panorama/index.html)
- [个人博客](https://hpoenixf.com/)：按时间阅读的文章；此仓库用于主题与连续阅读。新收录的 Spec、History 文章保留博客原文链接。

正文记录特定时间点的工程事实、问题和验证边界；内部通过、正式关闭、公开发布和真实业务效果是不同事实。本文集不构成投资或法律建议。

### 本地检查

```bash
npm install
npm run check:catalog
npm run docs:build
```

## 六层架构的历史版本

当前目录仅收录[六层调用全景 V3](articles/017-prompt-to-answer-six-layer-panorama-v3.md)。[V2 全文（2026-10-23）](articles/017-prompt-to-answer-six-layer-panorama.md)与[V1 全文（2026-10-20）](articles/017-prompt-to-answer-six-layer-panorama-v1.md)保留独立网址、原始正文和版本演进说明，**不计为新增当前文章**；历史全文与合并到主稿的旧入口是两种不同处理方式。

正式阅读入口为 [hpoenixf.com/eff-agent-article](https://hpoenixf.com/eff-agent-article/)（[English](https://hpoenixf.com/eff-agent-article/en/)）；仓库维护与发布约定见 [MAINTENANCE.md](MAINTENANCE.md)。
