---
title: 架构设计与系统思考
description: 22 篇关于 Agent 系统边界、职责 Owner、可靠性、反馈归因与工程演化的文章。
---

# 架构设计与系统思考

<small>WHY IT WORKS · 22 篇 · 3 个主题</small>

从一次技术取舍的背后看系统：**模型和 Runtime 各能做什么？谁最终裁决？为什么有些机制应该被删除而不是继续叠加？怎样证明用户目标真的完成？**

关注的是跨模块的权责与演进，而不是重复每个工具的使用说明。

<FlagshipEntry compact />

**两层架构判断：** [九条核心原则与六组外围方法](/principles)用于快速找设计边界；核心原则谨慎增加，五不、四问、证据传递、分期交付和验证方法则按需取用。阅读现有[五不与系统演化](/articles/code-cheaper-systems-harder-to-evolve)、[Context 压缩](/articles/agent-main-run-context-compaction)和[否决权治理](/articles/agent-veto-authority-and-run-termination)，再看[尚待取材的文章预告](/roadmap)。

**新增原则深读：** [局部改善不等于整体进步](/articles/local-improvement-is-not-system-progress)——从 50 条持仓只进了 20 条模型输入，到 Trace 缺失和 Judge 格式修复，讲清如何核实修复是否真正传导到完整研究，并考虑代价与反例。

**可靠性案例：** [模型失败之后，Agent 怎么继续？](/articles/agent-provider-failover-without-resetting-the-run)——故障域感知选路、原 Run 授权与预算、数据披露和恢复身份；讨论受控继续，不承诺已经实现生产无感高可用。

**金融科技案例：** [一份周报过去后，Agent 还记得当初为什么这样判断吗？](/articles/agent-weekly-thesis-history-continuous-research)——历史事实、原始 Investment Thesis 和用户修正的不同归属；同时进入[金融科技 × Agent 精选](/fintech)。

**入门路线：** [六层系统全景](/articles/017-prompt-to-answer-six-layer-panorama) → [模型会理解，代码才授权](/articles/011-model-understands-code-authorizes) → [收回散落的否决权](/articles/agent-veto-authority-and-run-termination) → [代码越来越便宜，为什么系统却越来越难升级？](/articles/code-cheaper-systems-harder-to-evolve) → [失败诊断与反馈误归因](/articles/agent-failure-is-a-boundary-problem)。

<ChapterCatalog category="thinking" />

## 工程参考和延伸阅读

- [Agent 架构原则速查](/principles)：用于设计、Review 与重构时快速核对 Owner、净收益、演化与验证
- [AI Agent 研发工程实践](/engineering)：Spec、Evidence、文档按需加载、History、真实评测与任务收敛均已独立收录
- [金融科技 × Agent](/fintech)：金融边界、数字复算、可信证据与金融 MCP 的跨分类阅读路径

[回到全部目录](/catalog) · [查看未来系统思考选题](/roadmap)

[并发交互案例：想聊就聊](/articles/agent-background-research-collaborative-experience)——Personal Agent 的委托、插问与调整如何共享一段对话。
