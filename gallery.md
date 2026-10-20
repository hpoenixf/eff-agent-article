---
layout: page
sidebar: false
title: 架构图册 · 38 个能力 Owner
description: 按完整能力及最终效果归属展示 ETF Agent 的 38 个 Owner，附交互关系与研究流程片段。
---

<div class="vp-doc owner-gallery">

# 能力 Owner · 架构图册

**2026-10-20 更新：统一为 38 个能力 Owner。** 模块按完整能力及其负责效果的最终收口划分；Runtime 是执行体系，分组只供阅读，不增加父级裁决权。六层文章中的 26 个环节是叙事视角，不作为模块清单。

## 交互式能力总览

[全屏打开：38 个 Owner 与主要交接](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html) · [下载 SVG 总览](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/overview.svg) · [阅读系统全景](/articles/017-prompt-to-answer-six-layer-panorama)

<iframe class="owner-map-frame" src="/eff-agent-article/visuals/owner-architecture/index.html" title="ETF Agent 38 个能力 Owner 交互架构图"></iframe>

点击模块查看职责、最终拒绝范围和输入/输出关系；悬停高亮相关能力，支持按名称或 Owner ID 查找。独立窗口适合桌面一屏查看；手机按阅读顺序展开。

Deep 归 **A05 Run 资源管理**；思考强度归 **A10 模型调用与请求配置**。插件 **A13**、生命周期 Hook **A29**、MCP 接入 **A31**、受控工具调用 **A11** 分别收口。投影 **A14** 与压缩 **A28** 分列；请求发送 **A10** 与轨迹证据 **E04** 分列。

**38 项包含 A01–A32、B01–B05 和 E04。** 遥测/诊断、健康、评测三项工程导航另列；收尾执行的独立收口仍待核验，不提前增加模块数量。压缩的验收限制也保留在图中。能力归属不证明实现已全部完成、真实模型质量或部署已经验收。

## 能力清单 {#owner-inventory}

| 阅读分组 | Owner（点击定位详情） |
| --- | --- |
| 交互与 Run 准入 | [A25 客户端交互与阅读](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A25)；[A01 账户身份](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A01)；[A02 对话接纳与任务接续](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A02)；[A04 Run 授权与能力准入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A04) |
| 方法、插件与受控执行 | [A12 Skill 方法与资源](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A12)；[A13 插件准入与生命周期](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A13)；[A29 生命周期事件与 Hook 执行](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A29)；[A31 MCP 服务接入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A31)；[A11 受控工具调用](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A11)；[A21 隔离分析](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A21) |
| 研究决策与运行控制 | [A03 研究决策与综合](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A03)；[A05 Run 资源管理（含 Deep）](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A05)；[A06 Run 继续与终结](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A06)；[A07 Child 执行生命周期](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A07)；[A08 持久控制事件](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A08)；[A09 定时任务](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A09)；[A15 行动提醒协调](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A15) |
| 正文、文件与交付 | [A23 正文发布](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A23)；[A22 私有产物保存、访问与分享](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A22)；[A24 会话事件与历史交付](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A24)；[E04 研究调用证据留存与回读](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=E04) |
| 研究材料与结果 | [A17 研究资料资产](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A17)；[A18 Web 研究读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A18)；[A19 PDF 文档读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A19)；[A20 知识检索](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A20)；[A16 研究结果与引用管理](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A16) |
| 独立投资权威 · Agent 只读 | [B01 市场证据采集](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B01)；[B02 投资事实读取](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B02)；[B03 确定性投资计算](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B03)；[B04 投资账本与确认](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B04)；[B05 原子报告生产](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=B05) |
| 模型配置与调用 | [A32 模型目录与路由配置](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A32)；[A10 模型调用与请求配置](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A10)；[A30 Provider 容量准入](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A30) |
| 上下文装配 | [A14 上下文投影与拟合](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A14)；[A28 Main 上下文压缩](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A28) |
| 个性化能力 | [A26 长期记忆](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A26)；[A27 每日个性研究](https://hpoenixf.github.io/eff-agent-article/visuals/owner-architecture/index.html#owner=A27) |

## 六层文章的流程片段

以下 15 张 SVG 继续解释一次研究的局部顺序；每张可以跨多个 Owner，同一个 Owner 也会出现在多条路径中。图中的步骤名不是另一套模块名，模块数量与归属统一看上面的 38 项。

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
