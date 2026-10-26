---
layout: home
title: ETF Agent · 工程手记
hero:
  name: ETF Agent · Notes
  text: 一套 Agent，三条阅读主线。
  tagline: 62 篇工程长文：看模块如何运行、架构如何演化，以及 Coding Agent 如何持续开发和验证。金融专题提供跨分类阅读入口。
  actions:
    - theme: brand
      text: 先看六层调用全景 V3 →
      link: /articles/017-prompt-to-answer-six-layer-panorama-v3
    - theme: alt
      text: 再读九条架构原则 →
      link: /principles
    - theme: alt
      text: 浏览全部文章 →
      link: /catalog
    - theme: alt
      text: ☆ 去 GitHub 点个 Star
      link: https://github.com/hpoenixf/eff-agent-article
      target: _blank
      rel: noopener noreferrer
features:
  - title: 模块维度 · How it works
    details: Entry、Web、PDF、MCP、Portfolio、Provider、Memory、RAG、Python、Extension、Runtime、Publication 等核心机制，沿输入与效果追踪能力。
    link: /modules
    linkText: 深入模块
  - title: 架构与系统思考 · Why it works
    details: 从模型与 Runtime 的边界、Owner 裁决、复杂度删减、可靠性反馈到真实任务收敛。
    link: /thinking
    linkText: 阅读架构
  - title: AI Agent 研发工程实践 · How we build
    details: Spec、Evidence、按需加载的工程文档、真实验证与完整任务收敛。
    link: /engineering
    linkText: 走进研发流程
---

::: tip 联系作者 · 技术交流与合作

**邮箱：** [hpoenixf@foxmail.com](mailto:hpoenixf@foxmail.com)　 **微信：** `hpoenixf0510`

:::

<ContinueReading />

<FlagshipEntry />

## 2026-10-26 · 一次重构，两种阅读视角

[一个 Subagent 改动，为什么拖住了我们整整一天？](/articles/agent-runtime-refactor-one-day-blocked)保留当天的时间线、关键数字和失败代价；[Agent 架构如何做到该稳定的稳定，该变化的变化？](/articles/agent-differentiated-evolution-contracts)用 Child、Memory、金融计算与 Provider 案例解释差异化演进契约。两篇互相引用，并提供完整英文版。

## 2026-10-25 · 今日更新与等待协作

**已确认：** [自定义专家双语案例](/articles/agent-custom-expert-from-prompt-to-recovery)已发布；Shadow Credits 账户用量的限定 P0 工程验收已关闭；统一专家已有真实 General/Python 与投资方法协作结果。**仍在推进：** 完整专家对话／恢复及复杂研究的前后台协作质量验收。

**等待原 Owner：** 首份真实基金研究的来源、金融数字、正文、实际附件与 History；个人 Profile、A36 日历真实资格；E04 交付成本与 Sidecar 分期。**Runtime 补充：** 当日已记录 Child/HIO 首批有限集成，完整重构与轻恢复不能据此视为完成；过程见[当日复盘](/articles/agent-runtime-refactor-one-day-blocked)。[查看原状态与协作缺口](/gallery#daily-status-20261025)。

## 核心必读：系统全景与架构原则

建议先读[六层调用全景 V3](/articles/017-prompt-to-answer-six-layer-panorama-v3)：沿一次提问看 Native Loop、工具、证据和交付怎样真正协作。再读[九条架构原则](/principles)：理解语义、授权、Owner 与系统演化的设计判断。**全景是运行地图，原则是判断地图，两篇共同构成后续 62 篇文章的入口。**

## 新增架构原则 · 局部改善与整体进步

[第九原则：局部改善不等于整体进步](/articles/local-improvement-is-not-system-progress)用工具投影、可信观测和 Judge 评测三个案例，解释怎样判断一次改动是否真正改善了端到端研究，而不把局部绿灯当成用户收益。

## 新增模块实践 · 用户自定义专家

[自定义专家，不应该只是一个 Prompt 输入框](/articles/agent-custom-expert-from-prompt-to-recovery)解释用户自己的研究方法怎样安全、稳定地进入原 Subagent 执行与历史读取，并保留真实的版本冲突、请求层级和 History 迁移教训。原 [Subagent 专文](/articles/agent-subagent-context-specialization) 继续介绍统一执行底座。

## 新增模块深读 · 控制事件与共享容量

[A08：Stop 命令为什么不能直接执行](/articles/agent-control-events-durable-owner-adoption)讲原事件、Claim/Fence 与原业务 ACK；[A30：HTTP 200 后为什么还要排队](/articles/agent-provider-admission-capacity-lease)讲跨进程租约与未知占用。A32 模型目录的适用范围已补进 [Provider 原文](/articles/agent-provider-architecture-and-admission)，不另开第三篇重复稿。

## 最近补齐 · 人工交互、时间与用量

[持久 HIL](/articles/agent-durable-human-interaction-response-adoption)讲用户的回答怎样真正进入原研究；[A36 时间语义](/articles/agent-temporal-semantics-market-calendar)区分用户自然日、市场 Session 与数据 `dataAsOf`；[Shadow Credits](/articles/agent-personal-credits-shadow-accounting)解释 Token、物理模型尝试和未知用量。这三篇都是独立机制稿，不表示功能已在生产默认开放。

## 第一次访问：从你关心的问题开始

- **AI-native 前端：** [渐进式回答与实时内容修订](/articles/agent-progressive-answer-coherence) → [答案发布与可追溯版本](/articles/019-agent-answer-publication) → [HTML 与文件交付](/articles/agent-html-evolution-challenges)。这些是交互与交付机制文章，不代替公开可操作的前端 Demo。
- **Agent 应用开发：** [六层运行链路](/articles/017-prompt-to-answer-six-layer-panorama-v3) → [Subagent](/articles/agent-subagent-context-specialization) → [Python 计算工作台](/articles/agent-python-compute-workbench-evolution)。
- **Agent 系统架构：** [模型、运行时与协议职责](/articles/agent-model-runtime-mcp-skill-boundaries) → [代码授权](/articles/011-model-understands-code-authorizes) → [Run 终结权](/articles/agent-veto-authority-and-run-termination) → [代码与架构演化](/articles/code-cheaper-systems-harder-to-evolve) → [Tool Surface 的真实演进](/articles/agent-model-capability-presentation-tool-surface) → [A35 内容信任](/articles/agent-content-trust-prompt-injection)。
- **用 AI 研发 Agent：** [Spec 与执行证据](/articles/026-agent-spec-evidence-workflow) → [周报分期交付](/articles/agent-weekly-review-staged-delivery) → [旧知识退役](/articles/027-agent-context-document-history) → [测试生命周期](/articles/test-lifecycle-refactoring-retirement-and-spec) → [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence)。

本阅读站公开的是工程文章、示意图和阅读站自身的源码。完整 Agent 产品代码、运行凭据与生产指标不在这里公开；文中的局部验证不等于生产级验收。作者的背景见[个人博客 About](https://hpoenixf.com/about)。

## 推荐从这里开始

**Owner 最新对账（2026-10-25）：** [架构图册](/gallery)已补充并发后台研究、可审阅结果、个人 Subagent Profile、时间语义与评测目录的主干实现及验收边界；当前为 43 项独立职责（新增 A36 时间语义与 A37 HIO），但代码与图册收录仍不构成真实模型或生产验收，新代码不自动成为已验证的研究质量或已上线功能。

想理解系统整体架构：从 [43 个能力 Owner 架构图册](/gallery)及[六层研究全景](/articles/017-prompt-to-answer-six-layer-panorama-v3) 出发，接着看 [模型与代码的职责](/articles/011-model-understands-code-authorizes) 和 [Runtime 为什么不该猜语义](/articles/runtime-model-protocol-boundary-agent-article-v2)。

想解决 Agent 产品运行难题：从 [Python 计算工作台](/articles/agent-python-compute-workbench-evolution)、[Memory 遗忘的持久效果](/articles/026-agent-memory-forget-durable-effects)、[Publication 独立发布](/articles/019-agent-answer-publication) 或 [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) 切入。

**供应商与安全故障切换：** [统一接口、共享准入与请求生命周期](/articles/agent-provider-architecture-and-admission) → [换路线，不重置任务](/articles/agent-provider-failover-without-resetting-the-run)。两篇分别解释模块机制与跨模块架构选择，不把有限验证写成生产高可用承诺。

**可持续自主研究：** [定时任务与后台研究](/articles/agent-autonomous-scheduled-research) → [Main 长上下文压缩](/articles/agent-main-run-context-compaction)。

**MCP 与金融数据：** 从 [Host 的工具接入链路](/articles/mcp-host-from-discovery-to-consumption)，到 [Portfolio 的只读投资事实](/articles/portfolio-mcp-readonly-investment-data)，再看 [Market 的多供应商支持与职责演进](/articles/mcp-market-responsibility-retrospective)。

## 三条阅读主线

一篇正文只在一个一级分类占一个位置：**模块文章讲机制，架构文章讲系统取舍，研发工程文章讲怎样持续交付。** [金融科技 × Agent](/fintech) 以精选链接跨分类组织相关案例，不重复文章。

<ChapterCatalog compact />

## 金融专题与后续选题

[金融可信工程阅读地图](/fintech)现在按业务合规、内容信任、可控效果、数据正确、运行韧性、留痕、可审查和第三方风险交叉连接已有文章。A35 只增加金融专题关联，保留模块精讲唯一主分类。

[金融科技 × Agent](/fintech) 汇集真实数据口径、投顾与交易授权、可信证据、金融数据 MCP、Python 研究结果消费等跨分类文章；现有讨论稿不意味着金融业务价值已经验证。

## 多 Agent 投研：从有界对话到完整协作展望

投资者真正需要的是：不同研究者围绕同一组事实检查不同问题，重要反证能够被原论证者回应，而最终结论保留仍未查明的条件。

先读[两个 Agent 如何展开有界质询](/articles/bounded-bull-bear-peer-dialogue)，再看[六种投资方法如何按需协作、共同检验假设](/articles/investment-perspectives-and-thesis-falsification)。最后阅读[2026 多层 Agent 协作展望](/articles/multi-layer-agent-collaboration-outlook)：它公开记录尚未通过整体效果验收的目标，未来再依据真实对照复盘。

## 接下来仍值得探索的问题

持久控制事件、文件访问与分享、个人化研究等主题已经预留[写作预告](/roadmap)。已写好的正文不再留在“待写”目录；预告只记录尚未成文的独立问题。

浏览[架构图册](/gallery) · 阅读[架构原则速查](/principles) · 返回[个人博客](https://hpoenixf.com/)。

新近文章：[多层 Agent 协作的 2026 展望](/articles/multi-layer-agent-collaboration-outlook) · [多视角 Agent 如何共同检验投资假设](/articles/investment-perspectives-and-thesis-falsification) · [多空直接对话与恢复](/articles/bounded-bull-bear-peer-dialogue)。[异步后台研究](/articles/agent-background-research-collaborative-experience)继续保留独立入口。
