---
title: AI Agent 研发工程实践
description: 从 Coding Agent 辅助研发到 Agent Runtime 故障复盘、协议验证和真实任务收敛的工程实践。
---

# AI Agent 研发工程实践

<small>HOW WE BUILD</small>

这一条阅读主线讨论的是：**怎样开发、验证和持续改进 Agent 系统，而不把局部绿灯当成最终交付？**

这里有两条相辅相成的实践路径：一条是利用 Coding Agent 维护 Spec、代码、测试和工程知识；另一条是从 Agent Runtime 的真实协议、调用追踪、故障复盘与研究结果中寻找可验证的证据。模块维度解释“系统怎样工作”，架构思考解释“为什么这样分工”；本栏目专注“怎样发现问题并证明改进”。

**研发方法索引：** [架构原则的外围七组方法](/principles)覆盖设计四问、首份交付、证据投影、验证强度及旧机制退出；具体约束仍以原 Spec 和 Owner 为准。现有[周报分期交付](/articles/agent-weekly-review-staged-delivery)和[工程知识退役](/articles/027-agent-context-document-history)给出了两类真实踩坑；[后续选题](/roadmap)不重复计入已有文章。

**从普通需求开始：** [测试比实现还多之后：怎样让文档、代码和测试一起向前](/articles/docs-code-tests-evolve-together)用导出 Excel 的教学案例说明改哪里、保留什么、怎样检查最终结果。

**建议阅读路线：** [Spec 与 Evidence](/articles/026-agent-spec-evidence-workflow) → [先交付第一份结果](/articles/agent-weekly-review-staged-delivery) → [工程知识的加载、记忆与退役](/articles/027-agent-context-document-history) → [测试与评测究竟证明什么](/articles/honest-agent-evaluation) → [测试也会过期：重构与退役前移到 Spec](/articles/test-lifecycle-refactoring-retirement-and-spec) → [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence)。

**运行时验证案例：** [Trace 为何无法完整复盘](/articles/agent-trace-complete-observation-gaps) → [专家贡献怎样取证](/articles/agent-subagent-contribution-evidence) → [流式工具调用 null 续片](/articles/agent-stream-tool-call-null-continuation) → [RAG 召回与真实金融证据](/articles/rag-retrieval-evaluation-evidence)。这些文章保留真实观察与未验证边界，不是产品质量认证。

<ChapterCatalog category="engineering" />

通用研发方法不自动对应产品 Owner；真实运行案例可以关联原有 Owner 作为延伸阅读，但不会取得该 Owner 的效果或授权责任。

[返回全部目录](/catalog) · [查看架构思考](/thinking) · [金融科技 × Agent 专题](/fintech)
