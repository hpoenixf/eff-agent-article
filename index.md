---
layout: home
title: ETF Agent · 工程手记
hero:
  name: ETF Agent · Notes
  text: 一套 Agent，两种深度。
  tagline: 顺着具体模块看清怎么做，或者跨越模块研究架构为何如此演化。35 篇工程长文，既能按问题查找，也能沿着章节连续阅读。
  actions:
    - theme: brand
      text: 阅读模块精讲 →
      link: /modules
    - theme: alt
      text: 架构设计与系统思考 →
      link: /thinking
    - theme: alt
      text: ☆ 去 GitHub 点个 Star
      link: https://github.com/hpoenixf/eff-agent-article
      target: _blank
      rel: noopener noreferrer
features:
  - title: 模块维度 · How it works
    details: Entry、Web、PDF、Memory、RAG、Python、Extension、Runtime、Publication 等核心机制，沿输入与效果追踪能力。
    link: /modules
    linkText: 深入模块
  - title: 架构与系统思考 · Why it works
    details: 从模型与 Runtime 的边界、Owner 裁决、复杂度删减、可靠性反馈到真实任务收敛。
    link: /thinking
    linkText: 阅读架构
  - title: 连续阅读 · Keep going
    details: 全文搜索、目录、架构图、上一篇与下一篇；自动记住上次阅读的文章。
    link: /catalog
    linkText: 全部文章
---

<ContinueReading />

## 推荐从这里开始

想理解系统整体架构：从 [38 个能力 Owner 架构图册](/gallery)及[六层研究全景](/articles/017-prompt-to-answer-six-layer-panorama) 出发，接着看 [模型与代码的职责](/articles/011-model-understands-code-authorizes) 和 [Runtime 为什么不该猜语义](/articles/runtime-model-protocol-boundary-agent-article-v2)。

想解决工程难题：从 [Python 计算工作台](/articles/agent-python-compute-workbench-evolution)、[Memory 遗忘的持久效果](/articles/026-agent-memory-forget-durable-effects)、[Publication 独立发布](/articles/019-agent-answer-publication) 或 [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) 切入。

## 两条阅读主线

一篇正文只在一条主线中占一个位置，但两种维度并不互相排斥：**模块文章讲清机制，架构文章解释跨模块的取舍与代价。**

<ChapterCatalog compact />

## 接下来的八个问题

持久控制事件、Schedule、Main 上下文压缩、文件访问与分享、多模型容量、个人化研究等主题已经预留[写作预告](/roadmap)。已写好的正文不再留在“待写”目录；预告只记录尚未成文的独立问题。

浏览[架构图册](/gallery) · 阅读[架构原则速查](/principles) · 返回[个人博客](https://hpoenixf.com/)。
