---
title: 架构导读 · 从模型语义到真实交付
description: ETF Agent 的六层读法与 Model、Runtime、Host、MCP、Skill 的责任分界。
---

# 从模型语义到真实交付

本页是[架构设计与系统思考](/thinking)的总览入口；按能力看机制从[模块维度](/modules)开始，研发验证与工程记忆见[AI Agent 研发工程实践](/engineering)。金融业务相关的跨分类文章另见[金融专题](/fintech)。

<small>架构导读更新：2026-10-24 · 基于已经公开的工程文章整理，**不是**私有代码的实时验收证明。</small>

这一套 Agent 的关键变化不是接入了更多工具，而是逐渐弄清了：**谁提出研究判断，谁批准动作，谁保存事实，谁能够宣布交付。**

<FlagshipEntry compact />

## 一次问题的六层视角

| 层 | 要回答的问题 | 主要边界 |
| --- | --- | --- |
| 01 · 交互与研究驱动 | 用户到底要求什么，是否需要进入研究？ | Entry / Main Loop / Root-owned Subagent |
| 02 · 上下文与方法 | 哪些材料可以交给模型，哪些方法按需启用？ | Projector / Skill / Memory |
| 03 · 能力接入与执行 | 模型提出的调用何时变成真实动作？ | Host / Run 授权 / MCP / Hook |
| 04 · 证据与计算 | 搜到的信息是否完整、可追溯、可复算？ | Web / PDF / 资料身份 / Python / 确定性计算 |
| 05 · 交付与连续性 | 生成了文字是否就等于用户收到？ | Publication / Client / Recovery / Task |
| 06 · 观测与评测 | 发生了什么，是否真正解决用户问题？ | Trace / Evidence / Evals |

![41 个能力 Owner 与主要交接](./visuals/owner-architecture/overview.svg)

**当前模块口径统一为 41 个能力 Owner**，见[交互架构图册](/gallery)。模块拥有完整能力及其负责效果的最终裁决权；Runtime 是执行体系，阅读分组不取得父级裁决权。六层文章的 26 个环节继续用于解释一次研究的路径，不作为模块计数。详细交接见[六层系统全景 V2：从提问到原生研究循环、持久交付与 HIL](/articles/017-prompt-to-answer-six-layer-panorama)。

## 架构判断分为核心与外围两层

[八条核心原则](/principles)保留最有解释力的判断：**模型负责语义、系统负责事实；提议不等于效果；复杂度归属正确 Owner；局部失败不全局否决；Context 是工作台；最小充分；能力可撤退；用户任务成功才是终点。**

外围则是按问题取用的六组方法——[五不与正常路径税](/articles/code-cheaper-systems-harder-to-evolve)、事实/权力/故障/价值设计四问、证据传递、分期交付、验证选择和知识退役。它们用于指导取舍，**不构成新的 Runtime Gate 或必须执行的审批清单**；具体问题和后续写作见[预告页](/roadmap)。

## 从这些专题继续深入

- [Model / Runtime / MCP / Skill 分工](/articles/agent-model-runtime-mcp-skill-boundaries)：语义、准入、协议与方法的责任分割
- [MCP 工具接入链路](/articles/mcp-host-from-discovery-to-consumption)：注册发现、Host 准入与工具执行消费的交接
- [A34 Tool Surface 的形成](/articles/agent-model-capability-presentation-tool-surface)：旧方案为什么合理、后来哪里不够，以及最终模型请求的独立准入校验
- [A35 内容信任：Prompt Injection 不只是恶意文本](/articles/agent-content-trust-prompt-injection)：保存原生产者的指令身份，最终请求只核对客观结构；效果决定留给原 Owner，不宣称真实模型已免疫
- [只读投资事实](/articles/portfolio-mcp-readonly-investment-data)与[多供应商市场数据](/articles/mcp-market-responsibility-retrospective)：组合报告与外部行情分别承担什么数据责任
- [否决权与 Run 终结权](/articles/agent-veto-authority-and-run-termination)：局部拒绝为什么不应随意终结全局任务
- [独立发布系统](/articles/019-agent-answer-publication)：候选答案、可见预览与持久提交的差别
- [Subagent 协作](/articles/agent-subagent-context-specialization)：专业化执行不能复制一套新的权威
- [真实评测](/articles/honest-agent-evaluation)：模型输出、测试通过与完成用户目标的分母不是一回事

## 进一步阅读

[架构原则速查](/principles)单独维护稳定的判断标准；[系统可靠性与验证](/thinking)收入反馈归因、任务收敛与跨模块治理。完整正文和模块间交接仍以各文章的具体取材窗口为准。

## 2026-10-20 的 Owner 深化

收尾阶段、请求意图和结束投影已收拢到既有 **A06**，没有新增 Finalizer。**A23/A16/A22** 将模型直接 HTML 与 Python 工作区 HTML 接入共享内容准备、结果引用、Artifact 保存及认证下载，删除专用周报生成/renderer；直接 HTML 无 Python/Docker 或先发文字前置。

**A07** 的 Child 技术终态与 **A24** 的历史/辅助恢复读取边界完成各自窄范围归档。**A18** 的 DeepSeek Search/Fetch 是既有能力的可选适配，不是新的模块。2026-10-20 时为 39 项，后续 A34 作为独立逻辑 Owner 加入后为 40 项，A35 作为独立内容信任逻辑 Owner 再增加为 41 项；A33 精确数值运算，只负责显式十进制与舍入残差，不继承金融公式、来源或正文发布权，具体关系与当前限制统一看[架构图册](/gallery)。

连续 Child HTML 交接、同 Run 已保存结果回读、周报历史/比较资格和更广质量验收仍在推进；[写作预告](/roadmap)记录文章缺口，不能拿文章或未提交原型当作产品关闭证明。

**历史文稿的判断需要保留时点。** 例如早期 RAG 撤权、授权与发布合同可能已经随架构调整，不应用旧文章给新合同背书。

## 2026-10-24 的主干接线：保留原 Owner，不把代码出现写成验收通过

近期后台研究与前台短答已经能够复用原 Conversation/Run 做有界并发，原复杂研究仍有 partial 结果。可选 Reviewable 审阅细节沿 **A16 结果身份 → A23 正文处置 → A24 History → A25 阅读** 读取；审阅附件和意见不改写正文权威，也不代替金融事实核验。

个人 Subagent Profile 的账户设置、Run 版本冻结、Child 按方法选择及 History 接线已经进入主干；**A01/A07/A14/A25/A34** 各守原职责，真实账户、PostgreSQL、浏览器与完整研究质量仍须独立验收。A36 的时区、冻结任务锚点和选择性 Nasdaq 2026 排期日历也已接线，但来源默认关闭，预定交易时段不等于实际开市、成交或行情时点。这些变化没有自动产生新 Owner、HIO 审批系统或来源权威。

评测问句已归到一份精选目录，默认只选有限核心题；目录覆盖、独立评分与真实业务有效性不是同一种证据。查看[最新的 41 项 Owner 图册及逐模块状态](/gallery)，可在弹窗中阅读上述交接与未验证范围。图册结构图保留其原审阅时点，新增的是现有 Owner 的状态补充。

> 这是一份公开可读的架构理解索引。私有项目里的测试报告、状态台账、研发日志和未审定草稿没有被复制到这里。
