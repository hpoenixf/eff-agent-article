---
title: Agent 架构原则与系统方法
description: Agent 架构九条核心原则：语义与事实、Owner 归属、授权与效果、局部失败、Context、最小机制、可替换性、任务成功与整体进步；附七组工程方法和深入文章。
---

# Agent 架构判断：核心原则与外围方法

这是一张**思考与阅读地图**，不计入文章篇数，也不是新的审批流程。核心原则应当少、稳定、能够改变跨模块设计判断；外围方法是具体问题出现时才使用的工具。必要的权限、安全和持久化约束仍应由实际能力的 Owner 负责。

**如何使用：** 从下面的原则或方法进入精选工程案例；在正文涉及相应取舍的位置，读者可以沿语义链接回到本页对应的编号条目。其他文章不必强制归类，仍可通过文末入口回到整张地图。每条原则与方法都有稳定锚点，便于分享和复盘。

与本页并列的首要必读是[六层系统全景](/articles/017-prompt-to-answer-six-layer-panorama-v3)：这里解释**为什么要这样设计**，全景文章解释**一次研究实际怎样跨层运行**。可以先读全景，再回来用九条原则复核具体模块。

<FlagshipEntry compact />

## 第一层 · 九条核心判断

**价值总纲：** Agent 架构的最终价值，是持续、可靠地完成用户的真实任务。为此，要分清语义解释、客观事实、权威归属与执行效果，用最小充分、可恢复、可替换的机制交付成果，并检验局部改善是否真正传递为整体进步。

**阅读顺序：** ①—④ 可信性（认知、权威、效果、局部失败）→ ⑤—⑦ 可演进性（上下文、最小机制、替换退出）→ ⑧—⑨ 有效性（任务成功、系统进步）。这是设计推理顺序，不是新增的 Runtime 流水线、审批或强制评测门。


| 原则 | 核心问题 | 值得记住的一句话 | 深入文章 |
| --- | --- | --- | --- |
| <span id="principle-1"></span> **1. 模型负责语义，系统负责客观事实** | **谁负责理解？** | 模型理解任务、研究与解释；Host/Runtime 管权限、执行和真实回执。代码能写规则，不代表代码理解自然语言。 | [别让模型当状态机](/articles/runtime-model-protocol-boundary-agent-article-v2) · [职责分工](/articles/agent-model-runtime-mcp-skill-boundaries) · [六层全景中的执行链](/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| <span id="principle-2"></span> **2. 复杂度必须归属正确的 Owner** | **谁拥有决定权？** | 真正的封装是收拢知识和决定权，不是增加一个包住所有东西的 Manager。 | [Owner 分工](/articles/agent-model-runtime-mcp-skill-boundaries) · [工具表面归属](/articles/agent-model-capability-presentation-tool-surface) · [一次 Runtime 重构的真实代价](/articles/agent-runtime-refactor-one-day-blocked) |
| <span id="principle-3"></span> **3. 提议、批准、执行、生效是不同事实** | **什么才算真正发生？** | 工具提议不等于许可，执行返回不等于持久效果；恢复时不能把 unknown 当作未发生。 | [独立 Publication](/articles/019-agent-answer-publication) · [Memory 持久效果](/articles/026-agent-memory-forget-durable-effects) |
| <span id="principle-4"></span> **4. 局部失败不能取得全局否决权** | **失败影响到哪里？** | 模块只能拒绝自己负责的效果；引用或附件局部失效不能自动抹掉独立合法正文。 | [否决权与 Run 终结权](/articles/agent-veto-authority-and-run-termination) |
| <span id="principle-5"></span> **5. Context 是工作台，不是事实数据库** | **事实如何在长任务中保留？** | 当前上下文是容量受限、可能有损的工作投影；工具回执、来源、历史和 Memory 不能只靠摘要保存。 | [工具结果外置](/articles/tool-results-outside-model-context) · [Main 压缩](/articles/agent-main-run-context-compaction) |
| <span id="principle-6"></span> **6. 坚持最小充分机制** | **需要多少机制才够？** | 模型本可处理的研究选择，不必总被固定 Planner、Validator、Hook 和状态机取代；先看既有机制够不够。 | [Entry 做减法](/articles/022-agent-entry-from-intent-to-direct-research) · [五不原则](/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="principle-7"></span> **7. 能力应当容易引入、撤退和替换** | **怎样持续升级而不堆积旧结构？** | 架构升级是让新结构替代旧结构，而不是永远叠加兼容层；不等于万物插件化或运行时热卸载。 | [代码与架构演化](/articles/code-cheaper-systems-harder-to-evolve) · [Extension Host](/articles/020-agent-extension-host-smartphone) |
| <span id="principle-8"></span> **8. 系统内部成功不等于用户任务成功** | **用户任务是否真正完成？** | 工具能调用、模型能写、文件能保存，均不能单独证明用户获得了正确且可用的结果。 | [真实任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) · [HTML 交付](/articles/agent-html-evolution-challenges) · [全景中的结果与恢复](/articles/017-prompt-to-answer-six-layer-panorama-v3) |
| <span id="principle-9"></span> **9. 局部改善不等于整体进步** | **怎样证明整体变好了？** | 工具投影、观测和评测的改善，应按原身份追到实际模型输入、持久结果与用户任务；区分局部修复、测量修正与端到端收益；核对完整工具说明等正常路径成本，明确质量、成本、延迟之间的取舍。 | [局部改善与整体进步](/articles/local-improvement-is-not-system-progress) |

**为什么保留第八和第九条？** 第八条界定成功是否真正到达用户任务；第九条进一步核对一次改动是否产生可比较的端到端净收益，明确质量、成本、延迟与风险的取舍。不要把局部绿灯当作整体进步。

**不轻易加第十条：** 只有新认知真正改变一类问题的判断、可以跨多个模块使用、而且无法自然归入已有原则时，才考虑晋升。Budget 收尾、Memory 世代锁、特定 Schema parity 等属于值得查阅的实现经验，不必占据核心层。

## 第二层 · 七组外围系统方法

| 遇到的场景 | 按需使用的方法 | 已有正文 |
| --- | --- | --- |
| <span id="method-1"></span> **1. 新功能取舍** | 用“五不”审查新增机制、复杂度外溢、影子否决、正常路径税和退出成本。即使不调用某项能力，它仍可能让所有任务承担 Prompt、工具声明或检查成本。 | [五不与系统演化](/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="method-2"></span> **2. 职责设计与拒绝评审** | 从**事实、权力、故障、价值**四个角度讨论；出现新拒绝时追问谁有权、影响是否局部、是否复制其他 Owner 的裁决。它们是设计思考，不是新的 Runtime Gate。 | [Model/Runtime/Skill 分工](/articles/agent-model-runtime-mcp-skill-boundaries) · [否决权复盘](/articles/agent-veto-authority-and-run-termination) · [Subagent 重构事件复盘](/articles/agent-runtime-refactor-one-day-blocked) |
| <span id="method-3"></span> **3. 证据传递与投影** | 分开存储、可见投影、实际执行输入、安全依赖和输出级依据；转述、压缩与引用都不能凭空创造事实。 | [金融 Agent 证据链](/articles/financial-agent-trustworthy-evidence-chain) · [A34 Tool Surface](/articles/agent-model-capability-presentation-tool-surface) |
| <span id="method-4"></span> **4. 完整设计与分期交付** | 可以考虑完整方案，但实施先沿**首份用户可取得的结果**排序必要依赖；外围能力不自动提前，阶段完成和整个产品完成分开。 | [周报三期交付复盘](/articles/agent-weekly-review-staged-delivery) · [Spec 与 Evidence](/articles/026-agent-spec-evidence-workflow) · [任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) |
| <span id="method-5"></span> **5. 验证与故障归因** | 确定性不变量用工程判断和边界回归；模型行为及用户效果按风险选择实际对照；诊断必须先定位真正失败的 Owner。 | [假绿测试](/articles/honest-agent-evaluation) · [失败归因](/articles/agent-failure-is-a-boundary-problem) · [Spec 研发流程](/articles/026-agent-spec-evidence-workflow) |
| <span id="method-6"></span> **6. 机制退出与工程知识** | 旧方案不仅存在于代码，也可能留在 Spec、Skill、Prompt 与测试中；现行约束有唯一维护处，历史原样保留，知识按任务加载。 | [工程知识的加载、记忆与退役](/articles/027-agent-context-document-history) · [五不与删除成本](/articles/code-cheaper-systems-harder-to-evolve) |
| <span id="method-7"></span> **7. 按 Interface 区分稳定性与演进方式** | 不按整个模块或目录打稳定等级。对具体接口区分**受保护效果、持久成果、演进中的研究行为、可替换 Adapter**：如 Child 交接与遗忘事实必须可靠，Prompt、召回算法可迭代；明确使用者后选择必要验证，不新设上级 Owner。 | [差异化演进契约：稳定什么，改变什么](/articles/agent-differentiated-evolution-contracts) · [产生这一思考的 Runtime 重构](/articles/agent-runtime-refactor-one-day-blocked) |

## 下一步怎么读、怎么写

已经有正文的观点优先**深化原文章**，不为了增加原则或篇数重复包装。“首份交付”的[周报大 Spec 分期复盘](/articles/agent-weekly-review-staged-delivery)已有独立文章；“知识退役”的案例已并入[工程 Context 与 History 主稿](/articles/027-agent-context-document-history)。其他新选题先在[写作预告](/roadmap)登记，不把预告计为发表。

**边界：** 这张速查不代表所有文章的工程状态实时有效，也不会因添加一条判断就增加 Runtime 规则、模型强制自检或新的项目审批系统。

[阅读架构文章](/thinking) · [进入研发工程实践](/engineering) · [查看写作预告](/roadmap) · [完整目录](/catalog)
