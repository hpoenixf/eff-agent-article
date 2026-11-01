---
layout: page
sidebar: false
title: 架构图册 · 47 个能力 Owner
description: 浏览 ETF Agent 的能力 Owner、职责与交接关系。
---

<div class="vp-doc owner-gallery">

# 能力 Owner · 架构图册

图册展示已登记的 47 个能力 Owner 及其职责与交接。Research Workspace 已进入主干，本图尚未为其分配节点，见下方说明。分组仅用于阅读；列入图册不代表所有场景已通过真实模型或部署验收。

## 交互式能力总览

[全屏打开图册](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html) · [下载 SVG 总览](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/overview.svg) · [阅读系统全景](/articles/017-prompt-to-answer-six-layer-panorama-v3)

<iframe class="owner-map-frame" src="/eff-agent-article/visuals/owner-architecture/index.html" title="ETF Agent 47 个能力 Owner 交互架构图"></iframe>

点击 Owner 查看职责、局部拒绝范围、交接关系和相关文章；也可按名称或 Owner ID 搜索。图册于 2026-11-01 对照现有能力盘点与限定验收记录更新模块说明，仍沿用 47 项能力清单。当前 **A40 用户回答反馈事实**的[独立专文](/articles/agent-feedback-facts-not-automatic-learning)与 **A41 跨 Run 会话压缩**的[独立专文](/articles/agent-conversation-history-compaction-source-boundaries)已纳入图册 primary 阅读入口。

## 近期模块变化

**Research Workspace 待纳入总览：** 已合入的工作空间组织长期目标、版本与原有研究成果的关联；执行、原始来源、正文和文件仍由各自原 Owner 负责。当前功能未宣称启用、正式关闭或真实用户验收。可先阅读[独立专题](/articles/agent-research-workspace-goal-continuity)；以下 47 项是原能力清单，不是对最新全部模块数量的断言。

- **A28 Main 上下文压缩：** 已按缩小后的范围完成实际验收；真实研究中两次摘要被后续请求采用并持久回读。研究中断后的端到端续传不在该验收范围，摘要质量和部署另算。
- **A36 时间语义：** 区分可信时区、任务时点、市场排期和行情时点；普通认证研究消费合格市场日历仍待验收。
- **A19 PDF 与 A20 知识检索：** 可选结构化提取和检索通道保留各自条件与降级；真实样本表格缺口、本地重排的实际 Run 观察和质量资格仍需分别验证。
- **A40 反馈与 A41 跨 Run 历史压缩：** 分别记录回答身份与反馈、已完成消息的摘要任务和来源；反馈第一期有本地受控浏览器与数据库验证，不代表模型已消费反馈。A41 不接管 A28 的同 Run 压缩。
- **A38 Credits 与 E04 调用证据：** Credits 仍是 Shadow 观察；Runtime 成本证据有范围限定的关闭记录，完整账单与交付物费用归属仍可能未知。

以上是既有 Owner 的职责或限定状态更新，本次未增加图中节点；列入图册不代表全图源码、真实模型效果或部署已经验收。

## 能力清单 {#owner-inventory}

| 阅读分组 | Owner（点击定位详情） |
| --- | --- |
| 交互与 Run 准入 | [A25 客户端交互与阅读](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A25)；[A01 账户身份](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A01)；[A02 对话接纳与任务接续](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A02)；[A04 Run 授权与能力准入](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A04) |
| 方法、插件与受控执行 | [A12 Skill 方法与资源](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A12)；[A13 插件准入与生命周期](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A13)；[A29 生命周期事件与 Hook 执行](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A29)；[A31 MCP 服务接入](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A31)；[A11 受控工具调用](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A11)；[A21 隔离分析](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A21)；[A33 精确数值运算](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A33)；[A34 模型能力呈现与工具表面](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A34) |
| 研究决策与运行控制 | [A03 研究决策与综合](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A03)；[A05 Run 资源管理（含 Deep）](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A05)；[A06 Run 继续与终结（含收尾协调）](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A06)；[A07 Child 执行生命周期](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A07)；[A37 持久人机交互 HIO](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A37)；[A08 持久控制事件](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A08)；[A09 定时任务](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A09)；[A15 行动提醒协调](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A15)；[A38 个人 Credits 账户与用量归属](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A38) |
| 正文、文件与交付 | [A23 正文发布与内容准备](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A23)；[A22 私有产物保存、访问与分享](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A22)；[A24 会话事件与历史交付](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A24)；[E04 研究调用证据留存与回读](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=E04)；[A40 用户回答反馈事实](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A40) |
| 研究材料、时间与结果 | [A17 研究资料资产](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A17)；[A18 Web 研究读取](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A18)；[A36 时间语义与市场 Session](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A36)；[A19 PDF 文档读取](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A19)；[A20 知识检索](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A20)；[A16 研究结果与引用管理](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A16) |
| 独立投资权威 · Agent 只读 | [B01 市场证据采集](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=B01)；[B02 投资事实读取](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=B02)；[B03 确定性投资计算](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=B03)；[B04 投资账本与确认](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=B04)；[B05 原子报告生产](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=B05) |
| 模型配置与调用 | [A32 模型目录与路由配置](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A32)；[A10 模型调用与请求配置](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A10)；[A30 Provider 容量准入](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A30)；[A35 内容安全与信任](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A35) |
| 上下文装配 | [A14 上下文投影与拟合](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A14)；[A28 Main 上下文压缩](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A28)；[A41 跨 Run 会话历史压缩](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A41) |
| 个性化能力 | [A26 长期记忆](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A26)；[A27 每日个性研究](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A27)；[A39 用户专家配置与组合](https://hpoenixf.com/eff-agent-article/visuals/owner-architecture/index.html#owner=A39) |

[架构原则](/principles) · [图册资源](https://github.com/hpoenixf/eff-agent-article/tree/main/visuals)

</div>

<style>
.owner-gallery { max-width: 1480px; margin: 0 auto; padding: 32px 24px 72px; }
.owner-gallery .owner-map-frame { display: block; width: 100%; height: 720px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); }
@media (max-width: 700px) { .owner-gallery { padding: 24px 16px 48px; } .owner-gallery .owner-map-frame { height: 760px; } }
</style>
