---
layout: home
title: ETF Agent · 工程手记
hero:
  name: ETF Agent · Notes
  text: 一套 Agent，三条阅读主线。
  tagline: 48 篇工程长文：看模块如何运行、架构如何演化，以及 Coding Agent 如何持续开发和验证。金融专题提供跨分类阅读入口。
  actions:
    - theme: brand
      text: 先读八条架构原则 →
      link: /principles
    - theme: alt
      text: 阅读模块精讲 →
      link: /modules
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

<ContinueReading />

## 核心入口：Agent 架构的八条原则

如果只读一个入口，先看[八条架构判断与六组系统方法](/principles)：谁理解语义、谁记录事实、谁有权拒绝、Context 能否保存事实，以及系统如何在保持能力的同时替换旧机制。它是跨越三条文章主线的**思考与阅读地图**，不是新增文章类别或审批流程。阅读任一正文后，都可以通过文章内的返回链接回到这里。

## 第一次访问：从你关心的问题开始

- **AI-native 前端：** [渐进式回答与实时内容修订](/articles/agent-progressive-answer-coherence) → [答案发布与可追溯版本](/articles/019-agent-answer-publication) → [HTML 与文件交付](/articles/agent-html-evolution-challenges)。这些是交互与交付机制文章，不代替公开可操作的前端 Demo。
- **Agent 应用开发：** [六层运行链路](/articles/017-prompt-to-answer-six-layer-panorama) → [Subagent](/articles/agent-subagent-context-specialization) → [Python 计算工作台](/articles/agent-python-compute-workbench-evolution)。
- **Agent 系统架构：** [模型、运行时与协议职责](/articles/agent-model-runtime-mcp-skill-boundaries) → [代码授权](/articles/011-model-understands-code-authorizes) → [Run 终结权](/articles/agent-veto-authority-and-run-termination) → [代码与架构演化](/articles/code-cheaper-systems-harder-to-evolve) → [Tool Surface 的真实演进](/articles/agent-model-capability-presentation-tool-surface) → [A35 内容信任](/articles/agent-content-trust-prompt-injection)。
- **用 AI 研发 Agent：** [Spec 与执行证据](/articles/026-agent-spec-evidence-workflow) → [周报分期交付](/articles/agent-weekly-review-staged-delivery) → [旧知识退役](/articles/027-agent-context-document-history) → [测试生命周期](/articles/test-lifecycle-refactoring-retirement-and-spec) → [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence)。

本阅读站公开的是工程文章、示意图和阅读站自身的源码。完整 Agent 产品代码、运行凭据与生产指标不在这里公开；文中的局部验证不等于生产级验收。作者的背景见[个人博客 About](https://hpoenixf.com/about)。

## 推荐从这里开始

想理解系统整体架构：从 [41 个能力 Owner 架构图册](/gallery)及[六层研究全景](/articles/017-prompt-to-answer-six-layer-panorama) 出发，接着看 [模型与代码的职责](/articles/011-model-understands-code-authorizes) 和 [Runtime 为什么不该猜语义](/articles/runtime-model-protocol-boundary-agent-article-v2)。

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

## 接下来仍值得探索的问题

持久控制事件、文件访问与分享、个人化研究等主题已经预留[写作预告](/roadmap)。已写好的正文不再留在“待写”目录；预告只记录尚未成文的独立问题。

浏览[架构图册](/gallery) · 阅读[架构原则速查](/principles) · 返回[个人博客](https://hpoenixf.com/)。
