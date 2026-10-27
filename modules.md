---
title: 模块维度 · 机制精讲
description: 33 篇 Agent 模块文章：研究入口、MCP、Portfolio、Provider、工具、Main 压缩、定时任务、Memory、RAG、Runtime、Publication 与 Python。
---

# 模块维度

<small>HOW IT WORKS · 33 篇 · 4 个主题</small>

从一条能力链的具体问题出发：**输入是谁、有哪些事实、做了哪些真实动作、什么时候交付、失败以后剩下什么。**

这里不是 API 手册，也不是为了每个代码模块机械写一篇文章。每一篇都围绕独立故障、设计选择和可核查的工程结果；相关跨模块论证留给[架构与系统思考](/thinking)。

**A41 跨 Run 会话历史压缩：** [为什么 Agent 不能直接总结历史对话？](/articles/agent-conversation-history-compaction-source-boundaries)——精确问答对、来源哈希、原子 Claim、不可变摘要与后续 Run 的容量拟合；不同于同 Run Main Checkpoint。

**A40 用户回答反馈事实：** [用户点了踩，Agent 就该学习吗？](/articles/agent-feedback-facts-not-automatic-learning)——回答身份、Scope、幂等写入和保存状态重开；精确读取的隔离 PG／真实浏览器完整验收仍待完成，点踩不是自动训练。

**个人自定义专家专题：** [自定义专家，不应该只是一个 Prompt 输入框](/articles/agent-custom-expert-from-prompt-to-recovery)——账户私有研究方法怎样保存、冻结、选用并在 History 中准确归属；对照 Octop 的持久专家实例，解释为什么这里复用 General Child。

**HIO 专题：** [Agent 问完用户之后，回答如何回到原研究](/articles/agent-durable-human-interaction-response-adoption)——真正区分请求接纳、回复保存、原消费者采用与 Effect；HIL 本地工程已关闭，生产停放仍默认关闭。

**A36 专题：** [Agent 说“今天”时，到底是哪一天](/articles/agent-temporal-semantics-market-calendar)——用户时区、冻结任务锚点、市场排期与实际报价时点；完整真实研究仍在资格化。

**Credits 专题：** [请求数、Token 与个人 Credits 为何不能混账](/articles/agent-personal-credits-shadow-accounting)——Shadow 物理尝试、已知与 unknown、个人只读视图；非强制额度或真实发票。

**A08 专题：** [Stop 指令为什么不能直接执行？](/articles/agent-control-events-durable-owner-adoption)——持久意图、Claim/Fence、原 Owner 回执与 unknown 只对账；不是通用 EventBus。

**A30 专题：** [模型返回 HTTP 200，为什么还要排队？](/articles/agent-provider-admission-capacity-lease)——共享端点组、短事务、容量租约与安全释放；模型质量、Run 预算仍分账。

**A10 专题：** [统一模型接口之后，为什么还需要共享准入？](/articles/agent-provider-architecture-and-admission)——新增 A32 模型目录／路由资格的边界段落；配置身份和协议适配仍由原稿说明，具体跨进程租约详见 A30 新文。

**A24 专题：** [用户离开后，异步研究如何按时交付？](/articles/agent-asynchronous-research-time-bound-delivery)——从 at/by 交付时间、partial→final 到浏览器重读，说明 A24 与 A25 的交接。

**A34 专题：** [Agent 有工具，模型为什么还是看不到？](/articles/agent-model-capability-presentation-tool-surface)——从 Skill、MCP 和 Runtime 多轮演进，理解最终 Tool Surface 为什么需要独立准入基准与校验。

**A35 专题：** [Prompt Injection 不只是恶意文本](/articles/agent-content-trust-prompt-injection)——从原生产者身份绑定、最终请求一致性和冷恢复证据，解释为什么数据不能成为指令，安全检查也不能夺取效果权。

**入门路线：** [Entry](/articles/022-agent-entry-from-intent-to-direct-research) → [Web](/articles/021-agent-web-research-from-search-to-deep-reading) → [Subagent](/articles/agent-subagent-context-specialization) → [Python](/articles/agent-python-compute-workbench-evolution) → [Publication](/articles/019-agent-answer-publication)。

<ChapterCatalog category="modules" />

[回到全部目录](/catalog) · [AI Agent 研发工程实践](/engineering) · [金融科技 × Agent 专题](/fintech) · [查看未来模块文章预告](/roadmap)
