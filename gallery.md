---
layout: page
sidebar: false
title: 架构图册 · 41 个能力 Owner
description: 按完整能力及最终效果归属展示 ETF Agent 的 41 个 Owner、最新状态与交互流程。
---

<div class="vp-doc owner-gallery">

# 能力 Owner · 架构图册

**2026-10-22 更新：41 个能力 Owner。** 按完整能力及其负责效果的最终归属划分；分组只用于阅读，不增加父级裁决权。六层文章中的 26 个环节是叙事视角，不作为模块清单。本文区分 **源码已交付、限定验收通过、Spec 归档、真实模型质量**，不以其中一项替代其他项。

## 交互式能力总览

[全屏打开：41 个 Owner 与主要交接](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html) · [下载 SVG 总览](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/overview.svg) · [阅读系统全景](/articles/017-prompt-to-answer-six-layer-panorama)

<iframe class="owner-map-frame" src="/eff-agent-article/visuals/owner-architecture/index.html" title="ETF Agent 41 个能力 Owner 交互架构图"></iframe>

点击任意能力 Owner，可查看职责、局部拒绝范围、交接关系，以及 **专题文章 / 相关文章**。未有独立专文时显示「敬请期待」；相关文章不能冒充专文。可按 Owner ID 或名称搜索，桌面支持交接高亮，手机可按分组阅读。

**新增 A34「模型能力呈现与工具表面」**：Entry 负责向模型呈现当前、有界的 Host 能力摘要；Research 在最终送模前核对已准入的有序逻辑 Tool Surface（名称、顺序、描述与 Schema）。它消费 A04 的原授权、A31 的 MCP 描述、A12 的方法与 A18 的真实可用性；**A14 仍管输入材料拟合，A10 仍管协议与请求发送**。A34 已完成原送模接缝的无 Hook / 有 Hook 回归、provider-free 正式关闭和 2026-10-22 归档，未宣称线上或 live 投研质量。详见[A34 的历史驱动模块精讲](/articles/agent-model-capability-presentation-tool-surface)，或在交互图中打开 [A34](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A34)。

**新增 A35「内容安全策略与信任」**：保留原生产者的 Host／用户指令身份，在 A14 可变装配与 Hook 后，由 A10 的最终 SDK 映射接缝核对；A35 只提供有界结构事实，不获得 Run／Child 终结、工具派发、发布否决、Memory 效果等权力。Phase 1 的 late projection 对照、定时克隆、Schema、局部效果与一例跨进程 PG 恢复已限定验证并有界归档；formal executor close 与真实模型抗注入资格未完成。见 [A35 内容信任专题](/articles/agent-content-trust-prompt-injection)，或在交互图中打开 [A35](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A35)。

**A28 Main 上下文压缩已于 2026-10-21 按用户批准的例外人工归档。** 已有可恢复的增量摘要、checkpoint 和后继 Main 投影的离线证据；另观察到至少一次真实自然摘要请求与 checkpoint 提交。它不是标准 formal-close PASS，真实自然摘要的后继实际入模、反复压缩语义质量仍留证据边界；不再把 A28 误列为“尚未归档”。见[Main 压缩专文](/articles/agent-main-run-context-compaction)。

**41 项 = A01–A35 + B01–B05 + E04。** A33 仍只负责显式十进制、单位与舍入残差，金融方法在原领域；Deep 归 A05，收尾归 A06，插件归 A13，Hook 归 A29，MCP 连接归 A31，工具调用归 A11。遥测、服务健康、评测三个工程导航另列，不计入 Owner 总数。能力列入图册不等于所有场景都通过真实模型或部署验收。

## 今天深化了哪些既有能力

| Owner | 2026-10-21～22 的增量与状态 | 仍需保留的边界 |
| --- | --- | --- |
| **A34 能力呈现（新增）** | 建立独立逻辑 Owner；最终 pre-wire 工具描述一致性在原请求接缝完成 RED/GREEN；原 provider-free close、accepted Spec 同步及归档均完成。 | 只能拒绝本次不一致的请求组装；不新增权限、资源账或 Manager，不替 A06 结束 Run，也不否决 A23 已可发布的正文；无 live 质量结论。 |
| **A35 内容安全与信任（新增）** | Producer identity 在 Hook 前绑定、最终 SDK 载体在 A10 送模前核对；定时克隆／Schema 绕行、局部拒绝与一例 PG 冷恢复已有定向证据，按授权有界归档。 | 不新增全局 Safety Manager、效果否决或必调模型；正式 executor close、真实模型对抗、部署资格未取得。 |
| **A28 Main 压缩** | 安全历史区间、非递归摘要、来源绑定、增量 checkpoint 和后继投影已有实现及离线验证；真实自然摘要至少有一次已提交。10 月 21 日按例外**人工归档**。 | 标准 D.1/E.1 未全部通过；真实后继入模与金融语义质量不冒称完整验收。A14 仍负责材料拟合。 |
| **A26 长期记忆** | Personal / Test 物理隔离、generation/reset、原来源与送模前有效性校验合入 main；授权开发环境中完成本地自动学习、自用与有限真实模型安全验证。 | 独立 Memory change 的 **正式 close 尚未成功**（旧评测入口阻塞）；通用多用户默认仍关闭，外部 live 生命周期 Phase 3 未验完。 |
| **A03 / A07 投资视角 Child** | 原三种投资视角的版本绑定、Recovery、真实 Child→Main 合成与 History 保存已验收并归档；随后在注册表扩至六种，新增 Bogle、Howard Marks、Fama–French。 | 扩充三种方法的独立回归 / close 仍待完成；真实单例不代表六种方法的语义质量。视角是 A03/A07 的可选方法，不是新的 Run/Child Owner。 |
| **A07 / A10 Child 与模型输出** | 修复 Child 调用回合脚本归属、已知响应失败的结算与诊断；取消普通模型请求默认输出 token cap 的强制注入，保留显式授权配置。实现已合入 main。 | 这组修复的独立正式关闭仍需原验收；不能据此宣布所有 Child 恢复、长文质量和供应商行为通过。 |
| **A08 / A09 定时与后台研究** | 补齐有界 Timer、原 Task 唤醒和后台 at/by 目标交接的实现与局部验证；周报 HTML 的先前正式 Runtime 范围已独立归档。 | App 侧完整状态与取消、治理对账、正式 close，以及周报订阅/论题/深度 Phase 3 仍独立进行。 |

**此前已归档的深化不重复计为今天的新完成：** A06 收尾协调、A07 原生命周期归属、A33 精确数值运算以及 A23/A22 共享 HTML 交付已有相应边界；A24 历史恢复和 A18 Web 读取保留各自的局部验证与真实环境限制。参见[HTML 交付复盘](/articles/agent-html-evolution-challenges)与[金融数值复算](/articles/031-fintech-data-time-and-reproducible-numbers)。

**仍在进行（以原任务和验收为准）：**

- **记忆：** A26 Personal/Test 隔离变更待恢复正式关闭；外部六会话 live 生命周期、未知费用结算与清理仍归独立 Phase 3，不以本地自用验收替代。
- **投资视角与 Child：** 新增三种固定方法的原 Tool Contract / 恢复回归及 close、Child 失败与输出合同修复的独立验收仍开放；方法数量增加不代表研究判断质量提升已测得。
- **复杂研究 → 交付：** Child 连续分析、来源证明 → Python → 同 Run 保存结果回读 → HTML 的完整真实闭环，及周报正式历史、可比资格和更广的语义质量仍须后继真实案例核验；局部保存/下载成功不能替代全链完成。
- **后台与定时：** A.5 App 状态/取消闭环、A.6 治理观测、E.1 正式关闭，以及周报订阅、投资 Thesis 来源版本与自适应深度的 Phase 3 仍在推进。
- **外部能力资格：** Web 搜索与抓取的真实环境 smoke、完整来源有效性、provider 成本/吞吐与线上部署不由本次结构回归自动验收。

A34 的 provider-free 关闭和 A28 的**例外人工归档**已经从“仍在进行”移出；保留其明确未覆盖的 live/质量边界，但不因此重开已关闭的模块工作。

**从组件回到设计原则：** 41 个能力 Owner 是系统分工视角，并不是 40 条架构原则。现在可沿[八条核心原则与六组外围系统方法](/principles)查找“正确 Owner、局部拒绝、最小充分、可撤退”的判断，再通过[写作预告](/roadmap)了解已有文章的深化方向；预告不计入 Owner 或已发表文章。相关已写专题：[否决权](/articles/agent-veto-authority-and-run-termination)、[上下文压缩](/articles/agent-main-run-context-compaction)、[五不与架构演化](/articles/code-cheaper-systems-harder-to-evolve)。

## 能力清单 {#owner-inventory}

| 阅读分组 | Owner（点击定位详情） |
| --- | --- |
| 交互与 Run 准入 | [A25 客户端交互与阅读](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A25)；[A01 账户身份](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A01)；[A02 对话接纳与任务接续](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A02)；[A04 Run 授权与能力准入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A04) |
| 方法、插件与受控执行 | [A12 Skill 方法与资源](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A12)；[A13 插件准入与生命周期](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A13)；[A29 生命周期事件与 Hook 执行](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A29)；[A31 MCP 服务接入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A31)；[A11 受控工具调用](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A11)；[A21 隔离分析](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A21)；[A33 精确数值运算](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A33)；[A34 模型能力呈现与工具表面](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A34) |
| 研究决策与运行控制 | [A03 研究决策与综合](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A03)；[A05 Run 资源管理（含 Deep）](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A05)；[A06 Run 继续与终结（含收尾协调）](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A06)；[A07 Child 执行生命周期](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A07)；[A08 持久控制事件](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A08)；[A09 定时任务](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A09)；[A15 行动提醒协调](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A15) |
| 正文、文件与交付 | [A23 正文发布与内容准备](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A23)；[A22 私有产物保存、访问与分享](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A22)；[A24 会话事件与历史交付](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A24)；[E04 研究调用证据留存与回读](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=E04) |
| 研究材料与结果 | [A17 研究资料资产](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A17)；[A18 Web 研究读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A18)；[A19 PDF 文档读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A19)；[A20 知识检索](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A20)；[A16 研究结果与引用管理](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A16) |
| 独立投资权威 · Agent 只读 | [B01 市场证据采集](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B01)；[B02 投资事实读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B02)；[B03 确定性投资计算](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B03)；[B04 投资账本与确认](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B04)；[B05 原子报告生产](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B05) |
| 模型配置与调用 | [A32 模型目录与路由配置](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A32)；[A10 模型调用与请求配置](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A10)；[A30 Provider 容量准入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A30) |
| 上下文装配 | [A14 上下文投影与拟合](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A14)；[A28 Main 上下文压缩](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A28) |
| 个性化能力 | [A26 长期记忆](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A26)；[A27 每日个性研究](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A27) |

## 六层文章的流程片段

以下 15 张 SVG 继续解释一次研究的局部顺序；每张可以跨多个 Owner，同一个 Owner 也会出现在多条路径中。图中的步骤名不是另一套模块名，模块数量与归属统一看上面的 41 项。

| 流程片段 | 对应 Owner 与阅读边界 |
| --- | --- |
| [01 · 提问到回答](./visuals/017-prompt-to-answer-six-layer-panorama/diagrams/overview.svg) | 跨 Owner 的研究交接；不是完整模块总览。 |
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
