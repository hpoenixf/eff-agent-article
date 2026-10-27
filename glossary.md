---
title: Agent 工程术语速查
description: 解释本站常用的 Owner、Run、Harness、Grant、HIL、Publication、Handoff、Memory、Checkpoint、Evidence 等术语，以及与外部规范的关系。
---

# Agent 工程术语速查

第一次阅读本站，不需要先认识所有模块。先记住一个问题：**模型负责理解与提出方案；具有授权和回执的系统模块负责实际操作与结果**。下表优先解释本站文章中反复出现的术语，而不是建立新的产品标准或 Runtime 契约。

## 运行与职责

| 术语 | 在本站是什么意思 | 从哪里继续读 |
| --- | --- | --- |
| **Model / 模型** | 解释意图、选择下一步研究动作、生成候选回答；不能仅靠文字声明真实操作已生效。 | [六层全景](/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| **Harness** | 承载模型与实际工作之间的执行设施，包括工具可见性、约束与状态等；并非另一种模型。 | [Model、Harness 与 Loop](/articles/etf-agent-model-harness-research-loop) |
| **Native Agent Loop** | 接收模型提议、分派合法工具、纳入真实结果、决定继续或结束的循环。 | [职责分工](/articles/agent-model-runtime-mcp-skill-boundaries) |
| **Run** | 一个带身份、期限、预算和已发生效果的任务执行实例；恢复不是创建一个没有历史的新 Run。 | [Run 终结权](/articles/agent-veto-authority-and-run-termination) |
| **Owner** | 具体事实、状态、决定与效果的最终负责方；不是所有逻辑都必须变成独立微服务。 | [九条架构原则](/principles) |
| **Entry / Research / Finalization** | 入口理解与分流、研究推进、收束与交付这三个处理阶段；不是三个必须独立运行的模型。 | [六层全景](/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| **Main / Subagent / Child** | 主执行者与受限子任务执行者；Child 产物必须按真实身份交回，不把建议冒充 Main 的最终结论。 | [子代理协作](/articles/agent-subagent-context-specialization) |
| **Provider / Gateway** | 调用模型供应商并统一协议结果的基础设施；模型响应 HTTP 200 不是任务完成。 | [Provider 与共享准入](/articles/agent-provider-architecture-and-admission) |
| **Tool Host / Tool Surface** | 前者负责工具声明、校验和真实执行；后者是最终提供给模型的工具可见集合。两者不能混为一谈。 | [Tool Surface](/articles/agent-model-capability-presentation-tool-surface) |
| **MCP / Skill** | MCP 是工具与上下文集成的开放协议；Skill 通常是按需提供的任务指引与资源。接入不等于模型已经可靠使用。 | [MCP 接入到消费](/articles/mcp-host-from-discovery-to-consumption) |

## 权限、证据与交付

| 术语 | 在本站是什么意思 | 从哪里继续读 |
| --- | --- | --- |
| **Grant** | 对一次 Run 允许访问或执行的范围、期限与预算等授权事实；模型提议不自动扩权。 | [模型理解，代码授权](/articles/011-model-understands-code-authorizes) |
| **HIL / HIO** | 人类介入与回复采用；发出提问、收到回复、原消费者采用和最终效果是不同事实。 | [持久人机交互](/articles/agent-durable-human-interaction-response-adoption) |
| **Publication** | 把候选回答变成有身份、可回执、可被用户取得的正文与版本；不等同于工具成功。 | [独立答案发布](/articles/019-agent-answer-publication) |
| **Handoff** | Child 或阶段之间交付结果与身份的动作；必须区分提议、完成与实际采用。 | [子代理协作](/articles/agent-subagent-context-specialization) |
| **Checkpoint / Recovery** | 保存可恢复状态，并在重新运行时核对原任务身份与已经发生的效果；不能把 unknown 当作没有执行。 | [恢复与终结权](/articles/agent-veto-authority-and-run-termination) |
| **ResultRef / Artifact** | 指向已经存储结果或文件的可回读引用；模型当前上下文不等于持久原始事实。 | [工具结果外置](/articles/tool-results-outside-model-context) |
| **Memory / RAG** | Memory 涉及持久化的用户或研究效果；RAG 侧重检索与资料投影，须分别处理来源有效性和撤权。 | [Memory](/articles/026-agent-memory-forget-durable-effects) · [RAG](/articles/027-rag-revocation-publish-replay) |
| **Evidence / Lineage** | 事实、来源、计算与结论之间的可追溯关系；“有引用”不代表引用足以证明结论。 | [金融证据链](/articles/financial-agent-trustworthy-evidence-chain) |
| **Eval / Dogfood** | 面向明确场景的模型或工程质量检查，与本地不变量测试、真实用户效果分别看待。 | [测试与评测](/articles/honest-agent-evaluation) |
| **Effect / unknown** | 真实持久效果与状态未知分别保留；请求已发送但没有回执，不等于没有执行。 | [架构原则三](/principles#principle-3) |

## 与业界术语的关系

本站的 Owner、Publication、Grant 等是**工程讨论用语**，并不全部属于行业标准。外部参照用于理解可迁移的机制，**不是证明我们的实现与它们完全等价**。

- [MCP 官方规范](https://modelcontextprotocol.io/specification)：理解工具、资源与授权范畴。
- [Anthropic · Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)：理解从简单工作流到自主循环的取舍。
- [Temporal · Workflow Execution](https://docs.temporal.io/workflow-execution)：对照持久工作流与执行恢复模型；本站不是 Temporal 实现。
- [ReAct 论文](https://arxiv.org/abs/2210.03629)：对照推理与动作交替的早期研究模型。
- [W3C PROV Overview](https://www.w3.org/TR/prov-overview/)：追溯来源、活动与结果的标准化表述。

[从六层全景开始](/articles/017-prompt-to-answer-six-layer-panorama-v3) · [查看可运行的独立教学项目](https://github.com/hpoenixf/open-etf-agent) · [返回文章目录](/catalog)
