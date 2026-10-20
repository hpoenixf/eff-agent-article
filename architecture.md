---
title: 架构地图 · 2026.10
description: ETF Agent 最新主干的职责归属、架构演进主线与可公开阅读入口。
---

# 架构地图：Agent 的持续演进，靠什么保持秩序？

<p class="eyebrow">ARCHITECTURE NOTES · 2026.10</p>

> **阅读时点：2026-10-20。** 本页根据 ETF Agent 主干的能力归属盘点与工程原则整理，供公开阅读。它是责任边界地图，不是生产验收公告；不同文章有自己的创作和核对日期。

最初的问题看上去是怎样让 Agent 多做一点：搜索网页、阅读 PDF、计算金融风险、装载新插件、逐步交付研究结果。推进到真实任务后，问题逐渐变成：**谁有资格认为动作已经发生？谁能拒绝哪一种效果？某个模块失败，为什么不能直接终止整轮？**

## 一、先看一次研究的六个观察视角

~~~mermaid
flowchart LR
  U["用户问题"] --> E["身份与研究入口"]
  E --> M["模型研究决策"]
  M --> G["Host 授权与资源准入"]
  G --> T["Web / PDF / MCP / Python"]
  T --> R["证据与结果管理"]
  R --> M
  M --> P["正文发布"]
  P --> D["会话交付与前端"]
  D --> U
  O["观测与验收"] -.-> G
  O -.-> T
  O -.-> P
  O -.-> D
~~~

| 阅读视角 | 具体追问 | 从哪里读 |
| --- | --- | --- |
| 交互与研究 | 谁的请求、查什么、是否委派 Child？ | [Entry](./articles/022-agent-entry-from-intent-to-direct-research.md) · [Subagent](./articles/agent-subagent-context-specialization.md) |
| 上下文与方法 | 模型拿到什么材料，哪些该留在上下文之外？ | [模型协议](./articles/runtime-model-protocol-boundary-agent-article-v2.md) · [结果外置](./articles/tool-results-outside-model-context.md) |
| 治理与执行 | 谁有权批准、扣预算、执行、继续和终结？ | [授权](./articles/011-model-understands-code-authorizes.md) · [否决权](./articles/agent-veto-authority-and-run-termination.md) |
| 证据与计算 | 资料怎么读，哪些数字能追溯？ | [Web](./articles/021-agent-web-research-from-search-to-deep-reading.md) · [PDF](./articles/024-agent-pdf-from-text-to-evidence.md) |
| 发布与连续性 | 候选回答怎样成为可读的持久结果？ | [Publication](./articles/019-agent-answer-publication.md) · [渐进回答](./articles/agent-progressive-answer-coherence.md) |
| 观测与评估 | 系统发生了什么，用户任务完成了什么？ | [Langfuse](./articles/025-agent-langfuse-from-trace-to-trustworthy-observability.md) · [真实评测](./articles/honest-agent-evaluation.md) |

六层只是理解研究的视角，**不是六个部署服务，也不是六个必经阶段**。普通问题可以直接回答，复杂研究可能多轮调用工具与 Child。

## 二、模型、Host 与业务账本不是同一种权威

**模型负责语义判断。** 理解用户意图、选择研究策略、评估材料相关性、提出下一步动作。但提出调用不等于已经获准执行。

**Runtime / Host 负责客观执行事实。** Run 授权、资源、Tool 与 Child 执行、持久回执、技术终态必须由各自明确的 Owner 管理；不该只凭输出文字猜测操作已经生效。

**业务系统维护投资事实。** 沙箱可以分析和模拟，却不能用一次模型计算覆盖真实账户、投资确认与根账本。生成建议不等于可以执行交易。

这套边界的难点不是造一个万能 Runtime，而是让**每一种事实和效果只有明确的最终裁决者**。某次 PDF 读取失败，可以说明解析缺口；不应因此自动删除另一条合法正文。

延伸阅读：[自然语言与运行时边界](./articles/runtime-natural-language-boundary-article-v2.md) · [Model / Runtime / MCP / Skill](./articles/agent-model-runtime-mcp-skill-boundaries.md)。

## 三、架构从“继续加机制”转向“能删除、能替换”

2026 年 10 月的一系列重构讨论，形成几条贯穿模块的原则：

1. **提议、批准、执行、实际效果、交付是五种不同的事实。** Tool Call 和模型的“已完成”都不能代替持久回执。
2. **决定权属于效果 Owner，不属于最容易写规则的位置。** Runtime 不会因为能写一个 if 就获得语义裁决权。
3. **隔离执行不能复制第二套治理。** Subagent 和插件可拥有局部上下文、工具与产物，但不能再建一套 Run 授权、资源账本和终结权。
4. **替换旧机制比叠加新机制更重要。** 插件化首先要让开发时引入、移除和替换的代价局部化，不是把所有函数包装成可热插拔单元。
5. **验证按不确定性定强度。** Owner 收拢主要验证不变量与接缝；Prompt 效果、研究质量和实际业务增益需要真实任务证据，不要求每一次架构取舍都进行统计 A/B。

相关实践：[Extension Host](./articles/020-agent-extension-host-smartphone.md) · [发布治理的两轮重构](./articles/023-agent-publication-governance-retrospective.md) · [测试替身不能冒充生产边界](./articles/green-tests-can-lie.md)。

## 四、最新的能力方向与公开文章的缺口

主干能力盘点已经明确 Run 资源、Run 终结、持久控制事件、定时任务、Provider 容量准入、模型配置、Main 上下文压缩、Artifact 交付、长期记忆与知识检索等逻辑 Owner。**Owner 已存在不等于每项都通过同等强度的真实验收。**

Python 计算工作台、Memory、RAG 撤权、反馈错误归因与完整任务收敛已有内部稿件，但仍需要成熟度复评。上下文压缩、Artifact 保存与控制/Hook/任务调度还需要独立的可公开案例，详见[写作预告](./roadmap.md)。

更长的交接细节和历史示意图请读[六层全景长文](./articles/017-prompt-to-answer-six-layer-panorama.md)。那篇文章保留原先核对的时点，本页不能反过来证明旧版本当时已经实现今天的每一个 Owner。

> 能力让 Agent 扩张，明确的 Owner、最少必要机制和可撤退性，才让它长期演进。
