---
title: AI Agent 研发工程实践
description: 7 篇关于 Coding Agent 规范、验证证据、按需加载知识与完整任务收敛的技术文章。
---

# AI Agent 研发工程实践

<small>HOW WE BUILD · 7 篇 · 2 个主题</small>

这一条阅读主线讨论的是：**如何借助 Coding Agent 持续开发、验证和升级复杂工程系统？**

模块机制回答“系统怎样工作”，架构思考回答“为什么这样设计”；这里聚焦研发流程本身，从 Spec、真实执行证据，到文档路由、History、测试边界和任务收敛。

**研发方法索引：** [架构原则的外围六组方法](/principles)覆盖设计四问、首份交付、证据投影、验证强度及旧机制退出；具体约束仍以原 Spec 和 Owner 为准。现有[周报分期交付](/articles/agent-weekly-review-staged-delivery)和[工程知识退役](/articles/agent-engineering-knowledge-lifecycle)给出了两类真实踩坑；[后续选题](/roadmap)不重复计入已有文章。

**建议阅读路线：** [Spec 与 Evidence](/articles/026-agent-spec-evidence-workflow) → [先交付第一份结果](/articles/agent-weekly-review-staged-delivery) → [文档与长期工程记忆](/articles/027-agent-context-document-history) → [让过时知识退出](/articles/agent-engineering-knowledge-lifecycle) → [假绿测试](/articles/green-tests-can-lie) → [评测与交付](/articles/honest-agent-evaluation) → [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence)。

<ChapterCatalog category="engineering" />

这类文章不自动对应 Agent 产品内的某个 Owner；研发工程的证据纪律和产品 Runtime 的效果归属各有自己的边界。

[返回全部目录](/catalog) · [查看架构思考](/thinking) · [金融科技 × Agent 专题](/fintech)
