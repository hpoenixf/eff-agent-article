---
title: 写作预告 · 已有文章的深化与待选题
description: 区分可立即深化的已发表文章、需要新工程证据的独立议题与仍未成文的模块专题。
---

# 接下来写什么

<small>更新：2026-10-24 · 这是编辑选题；展望文章已发布不等于产品完成整体效果验收。</small>

我们不再按每次故障或每条设计原则新增文章。优先让已有作品回答更完整的问题，只有**新的读者问题、不能被已有主稿吸收、并有足够独立证据**时才开新篇。

先看[八条核心原则与六组外围系统方法](/principles)，再决定是深化原文、积累案例，还是形成新文章。

## 已有正文 · 优先在主稿中深化

[做了一整晚，周报还停在外围：我们为什么把一个大 Spec 拆成三期？](/articles/agent-weekly-review-staged-delivery)完整复盘首份交付、二三期、通用 HTML 能力，以及写进研发流程的防复发措施。

[工程 Context、长期记忆与知识退役](/articles/027-agent-context-document-history)已吸收旧评测命令、旧设计、测试兼容层与历史检查误判的案例。两条阅读线都属于[AI Agent 研发工程实践](/engineering)，知识退役不再单独占一篇。

[供应商模块：统一接口与共享准入](/articles/agent-provider-architecture-and-admission)与[安全故障切换：换路线，不重置任务](/articles/agent-provider-failover-without-resetting-the-run)现已分别进入模块和架构主线，均有完整英文版。前者解释配置、协议与容量生命周期，后者解释故障域、原 Run 授权和恢复；故障切换的完整应用验收与部署限制仍在正文中保留，不再作为待写新题。

## 已发布展望 · 等真实结果后再写对照复盘

[从多个专家到一份研究：多层 Agent 协作的下一站（2026 展望）](/articles/multi-layer-agent-collaboration-outlook)记录截至 2026-10-24 的模块实现前提、尚未验收的整体协作价值及将来对照单 Main 的方法。未来完整任务、真实金融质量和成本证据取得后，应另写复盘并保留原展望版本，不能在旧文里事后改写预测。

## P0 · 优先深化已有文章（不是新篇）

| 现有文章 | 值得补充的具体问题 | 计划与限制 |
| --- | --- | --- |
| [从 Bug 循环到真实任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) | 首份交付与分期方法已经有[独立复盘](/articles/agent-weekly-review-staged-delivery)；原文后续应关注真实研究的端到端质量与收敛。 | 仅补新证据与独立结果，不重复周报分期故事 |
| [写了 Spec，为什么还不能说做完了？](/articles/026-agent-spec-evidence-workflow) | Spec 如何帮助做设计取舍，而不是仅管理验证和收尾？ | 融入“事实、权力、故障、价值”四问及验证强度选择，不复制另一份检查清单 |
| [代码越来越便宜，为什么系统却越来越难升级？](/articles/code-cheaper-systems-harder-to-evolve) | 新机制的正常路径税和退出成本怎样在真实案例里发现？ | 优先补确实发生的案例；已写的“五不”不再拆五篇文章 |

## P1 · 有独立增量才考虑成文

| 候选问题 | 现有基础 | 尚欠的素材 |
| --- | --- | --- |
| **Agent 研发什么时候靠推理，什么时候应该做真实实验？** | [Spec 验证流程](/articles/026-agent-spec-evidence-workflow)、[假绿测试](/articles/honest-agent-evaluation)、[任务收敛](/articles/032-ai-development-from-bug-loop-to-task-convergence) | 至少两种不同性质的工程决策和不同验证方式；不能只是重述“测试要真实” |
| **安全依赖、执行输入与结论依据为什么不是一回事？** | [金融证据链](/articles/financial-agent-trustworthy-evidence-chain)、[Result 消费](/articles/financial-agent-python-result-consumption) | 优先把 A/B/C 等有边界的关系例子纳入已有文章；只有出现独立读者问题再拆新稿 |

## 金融 AI 深度研究 · 单一选题清单

金融专题已经按**证券投资与财富管理业务问题**重组为 [4 个一级领域、15 个二级专题](/fintech)。精选上限每专题三篇，可以留空；满额先审查合并或替换，有独立专业问题才拆分。

全部 F01–F15 的选题、证据缺口与研究状态维护在**[金融研究 Backlog](/financial-research-backlog)**，这里不重复创建任务台账。[F01 金融研究质量评价](https://github.com/hpoenixf/eff-agent-article/issues/12)已开 Task，后续优先方向包括金融错误资产、券商 APP AI 产品和员工端工作流。

这些是**写作研究方向，不是 ETF Agent 已完成的业务验收、工程 OpenSpec 或新文章交付承诺**。

## 模块维度 · 仍可取材的独立专题

| 主题 | 真正要回答的问题 | 状态 |
| --- | --- | --- |
| **持久控制事件** | 入箱、claim/fence、去重、ack 与真实效果怎样保持相同身份？ | 待独立成文 |
| **Artifact 访问与分享** | 静态文件的原身份、当前访问权限与分享授权如何区分？ | 有现有 HTML 实例，先去重 |
| **每日个性化研究** | 定时触发能否持续带来有用、可比较的研究价值？ | 等业务效果证据，不能只用定时成功替代 |

## 已有完整正文，不再占预告位置

[供应商共享准入](/articles/agent-provider-architecture-and-admission) · [故障域感知切换](/articles/agent-provider-failover-without-resetting-the-run) · [架构演化与“五不”](/articles/code-cheaper-systems-harder-to-evolve) · [Tool Surface](/articles/agent-model-capability-presentation-tool-surface) · [A35 内容信任边界](/articles/agent-content-trust-prompt-injection) · [Main 上下文压缩](/articles/agent-main-run-context-compaction) · [后台定时研究](/articles/agent-autonomous-scheduled-research) · [HTML 交付](/articles/agent-html-evolution-challenges) · [工程 Context / History](/articles/027-agent-context-document-history)。

**编辑约定：** 上述“深化”指对既有作品取材、校准和修改，不自动创建新 slug、改变已分享状态或承诺具体上线日期。只有完成正文、核验、入正式目录后才计为新文章。

[核心原则与外围方法](/principles) · [架构思考](/thinking) · [研发实践](/engineering) · [全部文章](/catalog)
