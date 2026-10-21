---
title: 写作预告 · 下一批独立问题
description: 已完成正文进入正式目录；尚未成文的模块与系统设计问题在这里保留选题。
---

# 接下来写什么

<small>更新：2026-10-21 · 选题与文章状态，不是产品功能已实现的声明。</small>

这次将 Memory、RAG、Python、反馈归因、工程任务收敛和两篇金融边界文章全部移入正式目录。预告页只保留**尚未独立成文**、但值得探索的读者问题。

## 模块维度 · 候选专题

| 主题 | 下一篇要回答什么 | 状态 |
| --- | --- | --- |
| **持久控制事件** | 入箱、claim/fence、去重、ack 与实际效果如何归属？ | 待成文 |
| **Artifact 访问与分享** | 从沙箱文件到固定 revision、私有下载与定向 Share Grant，谁控制实际访问？ | 待成文 |
| **模型目录与 Provider 容量** | 请求配置、容量租约、排队、未知占用与释放分别属于谁？ | 待成文 |
| **每日个性研究** | 一天一份个人化研究，如何保证去重、时效、归属与真正有用？ | 待业务证据 |

## 架构设计与系统思考 · 候选专题

| 主题 | 下一篇要回答什么 | 状态 |
| --- | --- | --- |
| **事件、Hook 和消息不是一种事件** | 控制权、扩展生命周期与客户端投递为什么不能共用同一个裁决者？ | 待独立案例 |
| **Agent 怎样持续升级而不被旧复杂度拖垮？** | 创造、维护、替代、删除及回退的成本如何成为明确架构决策？ | 待成文 |

## AI Agent 研发工程实践 · 已有主线

[Spec、Evidence 与研发关闭](/articles/026-agent-spec-evidence-workflow) 和 [文档按需加载与工程 History](/articles/027-agent-context-document-history) 已从博客补齐至独立阅读站；[真实评测](/articles/honest-agent-evaluation)、[假绿测试](/articles/green-tests-can-lie) 与 [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) 归入这一主线。新增文章应先证明独立问题与工程证据，不按工具名称填坑。

## 本轮从预告转为正文

[定时研究：会话结束后继续](/articles/agent-autonomous-scheduled-research) · [Main 上下文压缩：摘要不改写事实](/articles/agent-main-run-context-compaction)。这两篇已具备独立机制和限定工程证据；完整 Weekly Review 业务质量仍待验证。

[Memory 持久效果](/articles/026-agent-memory-forget-durable-effects) · [RAG 撤权历史复盘](/articles/027-rag-revocation-publish-replay) · [Python 计算工作台](/articles/agent-python-compute-workbench-evolution) · [反馈误归因](/articles/agent-failure-is-a-boundary-problem) · [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) · [金融服务边界](/articles/030-fintech-from-research-to-investment-advice) · [金融数值复算](/articles/031-fintech-data-time-and-reproducible-numbers)。

这些文章各自保留其原始时间点、实现状态与验收限制，不把真实个案扩大为系统全局指标。

**写作原则：** 每篇要有独立读者问题、可复述的工程判断和相应证据。不为填满目录重复包装同一结论；已经写好的题目不再占着“预告”坑位。

[模块维度](/modules) · [架构设计与系统思考](/thinking) · [AI Agent 研发工程实践](/engineering) · [金融专题](/fintech) · [全部文章](/catalog)
