---
title: 架构设计与系统思考
description: 16 篇关于 Agent 系统边界、职责 Owner、可靠性、反馈归因与工程演化的文章。
---

# 架构设计与系统思考

<small>WHY IT WORKS · 16 篇 · 3 个主题</small>

从一次技术取舍的背后看系统：**模型和 Runtime 各能做什么？谁最终裁决？为什么有些机制应该被删除而不是继续叠加？怎样证明用户目标真的完成？**

关注的是跨模块的权责与演进，而不是重复每个工具的使用说明。

**入门路线：** [六层系统全景](/articles/017-prompt-to-answer-six-layer-panorama) → [模型会理解，代码才授权](/articles/011-model-understands-code-authorizes) → [收回散落的否决权](/articles/agent-veto-authority-and-run-termination) → [失败诊断与反馈误归因](/articles/agent-failure-is-a-boundary-problem) → [研发任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence)。

<ChapterCatalog category="thinking" />

## 工程参考和延伸阅读

- [Agent 架构原则速查](/principles)：用于设计、Review 与重构时快速核对 Owner、净收益、演化与验证
- [Spec / Evidence 与研发关闭](https://hpoenixf.com/blog/026-agent-spec-evidence-workflow) 与 [按需加载 Context / History](https://hpoenixf.com/blog/027-agent-context-document-history)：已发表在个人博客的两篇独立研发专题，本站不重复存储正文

[回到全部目录](/catalog) · [查看未来系统思考选题](/roadmap)
