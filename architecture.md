---
title: 架构导读 · 从模型语义到真实交付
description: ETF Agent 的六层读法与 Model、Runtime、Host、MCP、Skill 的责任分界。
---

# 从模型语义到真实交付

<small>架构导读更新：2026-10-20 · 基于已经公开的工程文章整理，**不是**私有代码的实时验收证明。</small>

这一套 Agent 的关键变化不是接入了更多工具，而是逐渐弄清了：**谁提出研究判断，谁批准动作，谁保存事实，谁能够宣布交付。**

## 一次问题的六层视角

| 层 | 要回答的问题 | 主要边界 |
| --- | --- | --- |
| 01 · 交互与研究驱动 | 用户到底要求什么，是否需要进入研究？ | Entry / Main Loop / Root-owned Subagent |
| 02 · 上下文与方法 | 哪些材料可以交给模型，哪些方法按需启用？ | Projector / Skill / Memory |
| 03 · 能力接入与执行 | 模型提出的调用何时变成真实动作？ | Host / Run 授权 / MCP / Hook |
| 04 · 证据与计算 | 搜到的信息是否完整、可追溯、可复算？ | Web / PDF / 资料身份 / Python / 确定性计算 |
| 05 · 交付与连续性 | 生成了文字是否就等于用户收到？ | Publication / Client / Recovery / Task |
| 06 · 观测与评测 | 发生了什么，是否真正解决用户问题？ | Trace / Evidence / Evals |

![六层职责关系](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/overview.svg)

**2026-10-19 的完整全景已细化为六层、26 个职责。** 六层只是阅读视角，不是六个服务或六个统一裁决者。详细交接与 Mermaid 图见[系统全景文章](/articles/017-prompt-to-answer-six-layer-panorama)。

## 三条贯穿整套系统的原则

**模型负责语义，运行时负责客观事实。** 模型适合研究、解释、提出下一步。Host/Runtime 应基于显式授权、真实工具结果和持久化回执管理执行状态，而不是从自然语言中猜一个状态机。

**提议、批准、执行、实际效果是四种不同的事实。** 提议一个 Tool Call 不代表已获准；执行成功不代表效果已经被接纳；正文生成也不代表正文已经发布到可重读的历史里。

**升级靠替代旧结构，而不是无限叠加护栏。** 增加一个机制时，必须知道它属于哪个 Owner、替代掉什么、怎样回退，以及有什么可验证的净增益。

## 从这些专题继续深入

- [Model / Runtime / MCP / Skill 分工](/articles/agent-model-runtime-mcp-skill-boundaries)：语义、准入、协议与方法的责任分割
- [否决权与 Run 终结权](/articles/agent-veto-authority-and-run-termination)：局部拒绝为什么不应随意终结全局任务
- [独立发布系统](/articles/019-agent-answer-publication)：候选答案、可见预览与持久提交的差别
- [Subagent 协作](/articles/agent-subagent-context-specialization)：专业化执行不能复制一套新的权威
- [真实评测](/articles/honest-agent-evaluation)：模型输出、测试通过与完成用户目标的分母不是一回事

## 2026 年 10 月的新增方向

新的 Owner 覆盖梳理把**持久控制事件、定时任务、上下文压缩、Provider 容量、模型请求链、文件分享和个人化研究**单列出来。它们在 [写作预告](/roadmap) 中有自己的问题定义；有专题覆盖或设计 Spec，不自动意味着当前版本已实现、已验证或可以向外提供。

**历史文稿的判断需要保留时点。** 例如早期 RAG 撤权、授权与发布合同可能已经随架构调整，不应用旧文章给新合同背书。

> 这是一份公开可读的架构理解索引。私有项目里的测试报告、状态台账、研发日志和未审定草稿没有被复制到这里。
