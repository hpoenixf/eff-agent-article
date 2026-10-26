---
layout: page
sidebar: false
title: 架构图册 · 43 个能力 Owner
description: 按完整能力及最终效果归属展示 ETF Agent 的 43 个 Owner、最新状态与交互流程。
---

<div class="vp-doc owner-gallery">

# 能力 Owner · 架构图册

**能力图册与六层全景是两种互补入口。** 想先了解整个 Agent 如何完成一次研究，请阅读[六层调用全景 V3：从提问到可见答案](/articles/017-prompt-to-answer-six-layer-panorama-v3)；要逐一定位模块及最终责任，再使用本页的交互式 Owner 图册。

**2026-10-25 状态对账：43 个能力 Owner。** 按完整能力及其负责效果的最终归属划分；分组只用于阅读，不增加父级裁决权。旧 V2 的 26 个环节是历史叙事视角；V3 使用六个请求处理阶段与跨层能力柱，不作为模块计数。本文区分 **源码已交付、限定验收通过、Spec 归档、真实模型质量**，不以其中一项替代其他项。

## 交互式能力总览

[全屏打开：43 个 Owner 与主要交接](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html) · [下载 SVG 总览](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/overview.svg) · [阅读系统全景](/articles/017-prompt-to-answer-six-layer-panorama-v3)

<iframe class="owner-map-frame" src="/eff-agent-article/visuals/owner-architecture/index.html" title="ETF Agent 43 个能力 Owner 交互架构图"></iframe>

点击任意能力 Owner，可查看职责、局部拒绝范围、交接关系，以及 **专题文章 / 相关文章**。未有独立专文时显示「敬请期待」；相关文章不能冒充专文。可按 Owner ID 或名称搜索，桌面支持交接高亮，手机可按分组阅读。

**个人自定义专家工程实践：** [自定义专家，不应该只是一个 Prompt 输入框](/articles/agent-custom-expert-from-prompt-to-recovery)新增为 A07 的相关文章，说明账户方法、Child 绑定和 History 真实归属；A07 原 [Subagent 专文](/articles/agent-subagent-context-specialization) 仍为 primary，不新增 Owner。

**新增 Owner 专文入口：A08 与 A30。** [A08 持久控制事件](/articles/agent-control-events-durable-owner-adoption) 独立讲事件入箱、Claim/Fence、原 Owner 回执优先、ACK/unknown 的交接；[A30 Provider 容量准入](/articles/agent-provider-admission-capacity-lease) 独立讲共享端点组、排队、租约、流式终止与未知占用。两项均保留已有 43 个 Owner 身份，不因新增文章增加模块数量。[打开 A08](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A08) · [打开 A30](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A30)。

**A32 模型目录边界**已深化在[既有 Provider 主稿](/articles/agent-provider-architecture-and-admission)，保留 related 而非独立 primary；登记模型不表示模型的真实研究质量或调用容量获准。

**新增 A34「模型能力呈现与工具表面」**：Entry 负责向模型呈现当前、有界的 Host 能力摘要；Research 在最终送模前核对已准入的有序逻辑 Tool Surface（名称、顺序、描述与 Schema）。它消费 A04 的原授权、A31 的 MCP 描述、A12 的方法与 A18 的真实可用性；**A14 仍管输入材料拟合，A10 仍管协议与请求发送**。A34 已在受控场景验证最终工具描述的一致性，并于 2026-10-22 归档；真实模型的工具选择与投研效果仍需独立观察。详见[A34 的历史驱动模块精讲](/articles/agent-model-capability-presentation-tool-surface)，或在交互图中打开 [A34](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A34)。

**本轮正式新增 A36「时间语义与市场 Session」**：独立拥有 A03 已选时间意图之后的确定性解析；用户 IANA 时区从可信请求/账户绑定而来，B01 仍拥有经资格核实的交易日历，行情 `dataAsOf` 仍归原来源。其 P0 真实普通认证研究尚未验收，日历默认关闭。[打开 A36](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A36) · [A36 专文](/articles/agent-temporal-semantics-market-calendar)。

**本轮正式新增 A37「持久人机交互 Human Interaction Owner」**：一个双向 Owner 负责请求接纳、原回复身份与精准交接，业务授权、Effect 执行、Human Park/Wake 与正文交付仍由原 A04/A06/Recovery/Publication 等 Owner 拥有。Stage A–D 本地 provider-free close 已完成，生产 Human Park 默认关闭；真实模型提问质量仍未验收。[打开 A37](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A37) · [HIL 专文](/articles/agent-durable-human-interaction-response-adoption)。

**新增 A35「内容安全策略与信任」**：保留原生产者的 Host／用户指令身份，在 A14 可变装配与 Hook 后，由 A10 的最终 SDK 映射接缝核对；A35 只提供有界结构事实，不获得 Run／Child 终结、工具派发、发布否决、Memory 效果等权力。第一阶段在受控场景验证了最终请求映射、定时克隆、Schema 与局部安全拒绝，并观察过一次跨进程恢复；已获准有界归档，真实模型抗注入能力仍待检验。见 [A35 内容信任专题](/articles/agent-content-trust-prompt-injection)，或在交互图中打开 [A35](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A35)。

**A28 Main 上下文压缩已于 2026-10-21 按用户批准的例外人工归档。** 已有可恢复的增量摘要、checkpoint 和后继 Main 投影的离线证据；另观察到至少一次真实自然摘要请求与 checkpoint 提交。这次归档不意味着真实摘要一定被后继模型正确消费，多次压缩的语义质量仍需验证。见[Main 压缩专文](/articles/agent-main-run-context-compaction)。

**43 项 = A01–A37 + B01–B05 + E04。** A33 仍只负责显式十进制、单位与舍入残差，金融方法在原领域；Deep 归 A05，收尾归 A06，插件归 A13，Hook 归 A29，MCP 连接归 A31，工具调用归 A11。遥测、服务健康、评测三个工程导航另列，不计入 Owner 总数。能力列入图册不等于所有场景都通过真实模型或部署验收。

## 2026-10-26 · 主干证据补记：限定交付与未完成范围 {#daily-status-20261026}

本节只补充最新代码和原任务证据，不重写下方 10 月 25 日的历史快照。**模块代码已进入主干、某个任务勾选、有限场景验收和生产级整体能力合格，分别是不同结论。**

| 主题 | 10 月 26 日已能确认 | 仍不能升级成的结论 |
| --- | --- | --- |
| **Runtime 职责收拢** | 已有 Child/HIO 交接规则的首批归属调整、Run-local Memory 会话、Access/Exposure 首个纵向切片与 Skill 会话状态私有化；八组 Run 可变字段的实际 Owner/写者对账已完成。原变更任务 **1.1、2.1、3.1、3.2** 分别有其自身限定证据，Factory 的 Memory Map/Set 等重复内部状态已收回原 Memory Owner。 | Memory/PG 全恢复矩阵、旧 Codec/Store 重复规则退出、剩余可变状态私有化及整个变更关闭仍开放（1.2、1.3、2.2、4.1、E.1）。不能宣称 Runtime 已完成整体解耦或维护成本已下降。 |
| **Web 动态正文读取** | 原 Source 阅读链已接入按条件触发的受治理默认渲染兜底，保留原来源、安全和资源限制；中间渲染 HTML 有 **1 MiB** 上限。渲染失败但存在合法静态文本时可以保留静态依据并警告，完全没有可读内容不能假装成功。 | 有限定实现与 Source 验收证据，不等于所有 JavaScript 站点可读、能够绕过登录/挑战页面、真实基金研究或线上浏览器成功率已获验收。 |
| **Sidecar 参考侧聊** | Stage A 默认关闭的基础接线已在主干；当前 Stage A/B/C 的任务均未获得原场景整体验收。 | 不得把 Sidecar 与已完成限定资格化的正常前后台并发会话混为一项上线功能，不能宣称 Sidecar 可用于正式用户研究。 |
| **前台插问与后台研究** | 正常并发对话的限定真实链路资格化已于 10 月 26 日完成并归档；短答、研究及控制请求仍沿原 Conversation/Run 权限和效果身份处理。 | 复杂基金研究的完整正文、计算、附件、History 与用户最终质量仍需独立验收；不把并发交互资格化解释成所有后台研究已成功交付。 |

最新工程状态需要回到原任务与限定证据判断；站点不把局部通过数字累计成一次全系统验收。

## 2026-10-25：今日更新与等待协作 {#daily-status-20261025}

根据本日主干提交、原 Owner 的任务与证据、以及站点发布记录同步。**「已完成」只针对明确的工程验收范围；「等待协作」指原 Owner 仍需实施或验收，不推断执行者已认领、后台正在运行或功能已经上线。** 下文 10 月 24 日记录保留为历史快照。

| 状态 | 今日确认的进展 | 下一步／等待协作 |
| --- | --- | --- |
| **限定 P0 已完成** · Shadow Credits | 账户用量展示、账户隔离及选定 PG／浏览器非干扰性有原范围 provider-free close 与归档。 | 不等于 Provider 发票、完整交付成本、付费额度硬门或生产部署。[机制说明](/articles/agent-personal-credits-shadow-accounting) |
| **中英文章已发布** · 自定义专家 | [自定义专家工程案例](/articles/agent-custom-expert-from-prompt-to-recovery)已入站，解释私有方法、冻结版本、Child 绑定及 History；[Subagent 原文](/articles/agent-subagent-context-specialization)继续深化专家资源与编排依赖。 | 文章发布不替代个人 Profile 原任务的普通账户、PG 恢复及端到端研究验收。 |
| **持续验收** · 统一专家 / A07 | General/Python 文件交付与两组投资方法协作有 **3 条符合本轮标准的真实对话**；Reviewer 顺序与提前 HIL 已有定向工程修复。 | Peer／Reviewer／HIL 完整自然对话、Native 跨进程与整项 close 未完成；此前 partial 与失败保留。 |
| **已接线，质量待验** · 前后台协作 | 后台长研究与前台短答的有界并发沿原 Conversation／Run／History 接线。 | 复杂研究仍有 partial／轮次耗尽；默认开关、完整研究结果、质量与部署须独立验收。 |
| **P0 等待真实结果** · 来源／计算／交付 | 来源身份、可审阅结果、确定性数值和保存通路各有实现或有限证据。 | **首份真实公开基金研究**须由普通入口完整核对来源、数字口径、可读正文、实际文件与 fresh History，并独立复核；工具调用成功不是交付成功。 |
| **部分实现，原验收开放** · Profile / A36 | 个人 Subagent Profile 的账户、版本化 Child/History 与 A36 时间语义已存在主干实现。 | Profile 的原账户／PG／正常研究闭环，A36 的合格市场日历来源、认证请求和 formal close 仍开放；日历默认关闭。 |
| **设计／部分候选** · E04 / Sidecar | E04 成本归因存在局部候选接线，Sidecar Conversation 已有分期 Spec。 | E04 原任务及周报 costEvidence 完整回读未关闭；Sidecar A/B/C 尚未实施，不作为已开放产品交互。 |
| **评审与 Spec** · Runtime 解耦 | 已完成 Child/HIL、Recovery、共享状态与 Memory 耦合的静态评审；深度重构另有 Spec 草案。 | 待原执行者对账在途改动、分期实施和验收；**没有生产重构已完成的依据**。 |

**最高优先级仍是可复核的真实金融研究结果。** 当前仍是 **43 个能力 Owner**；不要因 Spec、可调用模块或单项 close 增设裁决者或宣布金融质量合格。

## 2026-10-24：哪些能力已经进入主干，哪些仍待验证

本轮以**已提交的实现**与原责任方的验收记录为依据，更新图册的状态说明；并不声称已审查或运行完整产品。本轮由用户批准把独立 A36（时间语义）与 A37（持久 HIO）正式纳入交互图，**能力清单现为 43 项**。两个 Owner 的负责事实与局部拒绝不同于其依赖的 A03/B01/Recovery/Authorization；列入图册只确认职责，不替代 P0 验收与默认生产启用。

| 既有 Owner | 最新工程状态 | 尚未证明的事 |
| --- | --- | --- |
| **A02 / A24 / A25 · 前台与后台协作** | 后台研究与前台短交互的有界并发已合入主干；正常目标消息、独立短答、纠偏后的研究继续、历史双视图分别沿原 Conversation、Run 和交付机制处理。 | 原复杂研究仍出现 partial／轮次耗尽；并发默认是否启用取决于实际配置，不能宣称完整投研交付或部署可用。 |
| **A09 / A24 / A25 · 定时与异步交付** | 原异步研究 at/by、到点通知、浏览器重开、Stop 与阶段／最终版本已有限定本地验收及归档记录。 | 不推导长周期运行可靠性、实际订阅研究质量或线上通知 SLA；周报后续 Thesis 与来源限制仍独立处理。 |
| **A16 / A23 / A24 / A25 · 可审阅研究结果** | 可选审阅详情已接入主干答案与 History 的读取路径，客户端可沿原来源身份查看；附件损坏仍局部降级，原已发布正文保留。 | 审阅意见不能代替来源核验、金融真值或人工复核，不新增第二个 Result／Publication 裁决者。 |
| **A01 / A07 / A14 / A25 / A34 · 个人 Subagent Profile** | 账户私有配置、版本快照、Child 按已冻结方法选用及历史投影已有集成源代码，不再只是概念设计。 | 正常认证应用、真实 PostgreSQL／跨进程、浏览器及完整研究结果的原任务验收仍开放；设置或模型选择不授予新权限。 |
| **A18 / B01 / A14 · 市场时间与 A36** | 用户时区、当前 UTC 与冻结任务时间，以及可选的 Nasdaq 2026 年度排期日历已经进入原 Web／Market 消费接缝；来源规则归回原数据生产者。 | 日历来源默认关闭；只给有范围的预定交易时段，不能确认突发停市、真实交易发生或行情 `dataAsOf`。普通认证 Agent 的真实消费仍待验收。 |
| **A03 / A07 / A12 · 投资视角方法** | 六种可选研究方法的固定目录已完成限定本地关闭，仍在原 Child 生命周期中按需启用。 | 方法可调用不表示六种观点都正确、提高回报或改善研究质量。 |
| **E03 · 工程评测导航** | 测试问句已统一到唯一精选目录：68 个不同问句，默认仅选 14 个核心题；独立 DeepEval 适配已有局部关闭。 | 题目数量、测试选中、模拟运行、评分器输出都不能替代真实金融研究、来源、计算与人工可用性验收；E03 不成为运行时发布门。 |

**当前最重要的开放工作**仍然是交付一份能独立复核的真实基金研究：正常入口获得正确来源和计算、生成可读正文及可读取的 History，再由独立判断确认其价值。后台复杂研究的 partial 原样保留；Profile 与 A36 分别补原账户/数据来源/跨进程/普通请求验收。

**A37 HIO（双向人机交互，逻辑 Owner）**已完成 Main/Child 问答、非阻塞与安全等待、Effect Approval 和 Permission Request 的声明范围本地 provider-free 正式关闭及归档；原 Conversation、Effect、Authorization、Recovery 仍分别拥有自己的效果。生产 Human Park 默认关闭，真实模型提问质量和线上部署独立未验。完整机制见[持久 HIL 专题](/articles/agent-durable-human-interaction-response-adoption)。**A36 时间语义（独立 Owner）**已有主干实现、仍缺普通真实请求和完整关闭，见[时间语义专题](/articles/agent-temporal-semantics-market-calendar)。**个人 Shadow Credits**已在声明的 P0 账户用量范围完成本地 provider-free close 与归档，含选定 PG／浏览器非干扰性验收；仍不证明真实账单、完整成本归因或生产部署，见[Credits 专题](/articles/agent-personal-credits-shadow-accounting)。**E04 交付物成本归因**已有可选源代码投影与读取接缝，完整来源/正式验收仍在途；不能以 Shadow 或 Tool 计数代替完整发票。

A34 Tool Surface、A35 有界内容信任、A28 Main 压缩等历史收口保留上方专文说明；它们的局部通过不自动转化为金融业务验收。更多判断方法见[架构原则](/principles)，主流程见[六层全景 V2](/articles/017-prompt-to-answer-six-layer-panorama-v3)。

## 能力清单 {#owner-inventory}

| 阅读分组 | Owner（点击定位详情） |
| --- | --- |
| 交互与 Run 准入 | [A25 客户端交互与阅读](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A25)；[A01 账户身份](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A01)；[A02 对话接纳与任务接续](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A02)；[A04 Run 授权与能力准入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A04) |
| 方法、插件与受控执行 | [A12 Skill 方法与资源](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A12)；[A13 插件准入与生命周期](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A13)；[A29 生命周期事件与 Hook 执行](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A29)；[A31 MCP 服务接入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A31)；[A11 受控工具调用](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A11)；[A21 隔离分析](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A21)；[A33 精确数值运算](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A33)；[A34 模型能力呈现与工具表面](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A34) |
| 研究决策与运行控制 | [A03 研究决策与综合](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A03)；[A05 Run 资源管理（含 Deep）](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A05)；[A06 Run 继续与终结（含收尾协调）](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A06)；[A07 Child 执行生命周期](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A07)；[A37 持久人机交互 HIO](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A37)；[A08 持久控制事件](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A08)；[A09 定时任务](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A09)；[A15 行动提醒协调](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A15) |
| 正文、文件与交付 | [A23 正文发布与内容准备](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A23)；[A22 私有产物保存、访问与分享](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A22)；[A24 会话事件与历史交付](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A24)；[E04 研究调用证据留存与回读](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=E04) |
| 研究材料、时间与结果 | [A17 研究资料资产](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A17)；[A18 Web 研究读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A18)；[A36 时间语义与市场 Session](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A36)；[A19 PDF 文档读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A19)；[A20 知识检索](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A20)；[A16 研究结果与引用管理](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A16) |
| 独立投资权威 · Agent 只读 | [B01 市场证据采集](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B01)；[B02 投资事实读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B02)；[B03 确定性投资计算](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B03)；[B04 投资账本与确认](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B04)；[B05 原子报告生产](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B05) |
| 模型配置与调用 | [A32 模型目录与路由配置](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A32)；[A10 模型调用与请求配置](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A10)；[A30 Provider 容量准入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A30)；[A35 内容安全与信任](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A35) |
| 上下文装配 | [A14 上下文投影与拟合](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A14)；[A28 Main 上下文压缩](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A28) |
| 个性化能力 | [A26 长期记忆](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A26)；[A27 每日个性研究](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A27) |

## 六层文章的流程片段

以下保留的 15 张历史 SVG 继续解释研究局部顺序；V3 另外提供按模块名称阅读的六层主图。每张可以跨多个 Owner，同一个 Owner 也会出现在多条路径中。图中的步骤名不是另一套模块名，模块数量与归属统一看上面的 43 项。

| 流程片段 | 对应 Owner 与阅读边界 |
| --- | --- |
| [V3 · 六层请求处理与能力竖柱](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/v3-owner-map-zh.svg) | 按模块名称聚合，展示主层与跨层参与；不替代 43 个 Owner 的权威图。 |
| [01 · 六层研究闭环（V2）](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/v2-native-loop-zh.svg) | 跨 Owner 的研究交接；不是完整模块总览。 |
| [02 · 消息身份](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/identity.svg) | A02 消息接纳；账户身份另归 A01。 |
| [03 · 研究循环](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/research.svg) | A03 提出策略/完成建议；A11 执行工具，A06 持有技术终结权。 |
| [04 · Child 协作](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/subagent.svg) | A07 管局部执行/交接；Main 的综合仍归 A03。 |
| [05 · 请求材料装配](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/context.svg) | A14 投影与拟合，交 A10 发送；不替 A28 压缩采纳。 |
| [06 · 背景与记忆](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/background.svg) | A26 记忆、A14 背景装配、B02 投资事实读取分别拥有事实。 |
| [07 · 工具执行](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/execution.svg) | A11 调用，消费 A04 准入；A29 执行回调，A31 维护 MCP 连接。 |
| [08 · Hook 与投影](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/hooks.svg) | A29 回调与 A14 投影的交接；不改写工具原执行事实。 |
| [09 · 资料与结果](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/evidence.svg) | A16–A20 的结果身份与材料读取；充分性由 A03 判断。 |
| [10 · 计算与解释](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/calculation.svg) | A21 隔离分析、B03 确定性投资计算、A03 解释；计算权威不互换。 |
| [11 · 正文交付](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/delivery.svg) | A23 发布、A24 历史/事件交付、A25 客户端阅读；文件保存/下载另归 A22。 |
| [12 · 恢复与续聊](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/continuity.svg) | A02 准备关联新 Run；A06 沿原身份恢复同 Run，两者分开。 |
| [13 · 持久控制](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/control.svg) | A08 投递控制事件、A09 管 Task；Run 继续与终结仍归 A06。 |
| [14 · 观测关联](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/observation.svg) | E04 记录请求证据；Langfuse 是工程观测，采集失败不否决请求发送。 |
| [15 · 评测与质量](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/evaluation.svg) | E03 工程导航；评测结论不是生产 Run 的隐式正文否决门。 |

[打开六层 HTML 图文版](https://hpoenixf.github.io/eff-agent-article/visuals/017-prompt-to-answer-six-layer-panorama/index.html) · [在 GitHub 查看图册资源](https://github.com/hpoenixf/eff-agent-article/tree/main/visuals) · [架构原则速查](/principles)

</div>

<style>
.owner-gallery { max-width: 1480px; margin: 0 auto; padding: 32px 24px 72px; }
.owner-gallery .owner-map-frame { display: block; width: 100%; height: 720px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
@media (max-width: 700px) { .owner-gallery { padding: 24px 16px 48px; } .owner-gallery .owner-map-frame { height: 760px; } }
</style>
