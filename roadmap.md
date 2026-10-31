---
title: 写作预告 · 已有文章的深化与待选题
description: 区分可立即深化的已发表文章、需要新工程证据的独立议题与仍未成文的模块专题。
---

# 接下来写什么

<small>更新：2026-10-31 · 这是编辑选题；文章入库不等于产品完成整体效果验收。</small>

我们不再按每次故障或每条设计原则新增文章。优先让已有作品回答更完整的问题，只有**新的读者问题、不能被已有主稿吸收、并有足够独立证据**时才开新篇。

先看[九条核心原则与七组外围系统方法](/principles)，再决定是深化原文、积累案例，还是形成新文章。

## 2026-10-31 · E04/A33 专文和三篇旧文实质翻新

[E04 研究调用证据留存与回读](/articles/agent-research-evidence-store-lifecycle)首次独立解释被动采集、隐私准入、有限队列、来源复核、历史回读与清除；[A33 精确数值核](/articles/agent-numeric-kernel-exact-units-rounding)独立讲单位、负向 tie、精确比较与不可行约束。两篇均有完整中英文正文和各两张语言对应的 Mermaid 机制图。

[工具调用到模型输入](/articles/agent-tool-lifecycle-and-model-input)增补 E04/A11 区分，[金融数字 031](/articles/031-fintech-data-time-and-reproducible-numbers)补 A33 与领域资格的反例，[报告成本归因](/articles/agent-report-cost-attribution)补调用证据、计量、分摊和对账四者分离；三篇均保留原 slug 与完整英文正文。拟更新的公开 Owner 阅读映射为 **35 项 primary、11 项仅 related、1 项 A27 未写（47 项）**；这是文章覆盖，而非正式运行与金融质量验收。旧来源覆盖表仍保留其 10 月 27 日历史快照，待来源仓自身再对账。

## 2026-10-27 · A40/A41 独立机制稿已补齐

[A41 跨 Run 会话历史压缩](/articles/agent-conversation-history-compaction-source-boundaries)和[A40 回答反馈事实](/articles/agent-feedback-facts-not-automatic-learning)已单独成文，均有完整中英文版。文章覆盖口径现为 47 个 Owner 中 33 项已有独立专文、13 项部分覆盖、1 项未写（A27）；这个数字是**内容覆盖**，不是生产验收覆盖。A40 的精确读回仍待实际浏览器、隔离 PostgreSQL 和 formal close；A41 仍缺真实模型摘要质量与成本收益对照。10 月 24 日的 43 项统计保留为当时历史快照。


## 2026-10-26 · 六层地图与研究推进专文

[六层调用全景 V3](/articles/017-prompt-to-answer-six-layer-panorama-v3)本轮只在 Native Loop 段落补充“回合内观察—同一 Run 研究判断—跨时间安全接续”三种阅读尺度，不改变六层、Owner 数量或 V1/V2 的原版本身份。

独立新增[投研 Agent 的关键不是多调用工具：Model、Harness 与 Loop](/articles/etf-agent-model-harness-research-loop)。文章不再写成实现状态盘点，而是借基金行业与汇率研究串起三个可迁移的工程判断：模型能被反证修正、执行事实有唯一 Owner、交付优先于内部完成标记。V3 回答**责任如何组织**，这篇回答**怎样让研究判断真正进步**。文章配四组原创中英 SVG：研究路径、原生循环、金融时间语义及实际交付；在金融专题 B3「研究质量与反证方法」精选，不复制正文。

**后续更新原则：** 只拿真实新证据深化两篇主稿，尤其是金融时点与披露口径、矛盾来源导致的研究修订、Reviewer／人类意见的不同权威、以及已经可取得的报告和 History。当前金融质量剩余付费试跑已停止，不能把本文提出的反例写成已运行的模型测试；也不新建 Outer Loop、Workflow Manager 或金融合规总闸。

## 2026-10-26 · 先维护现有正文，再扩大目录

最新主干已把 **Runtime 局部职责收拢**推进到原任务 1.1、2.1、3.1、3.2 的限定进度：Child/HIO 规则、Run-local Memory、Access/Exposure 和 Skill 会话私有化有实现或原范围证据；Factory Memory 内部状态的删除及组合职责回归已在限定范围核实；PG/Memory 广泛恢复、重复 Codec/Store 规则删除、其余字段迁移和总体验收仍在途。站点应更新[10 月 25 日重构复盘](/articles/agent-runtime-refactor-one-day-blocked)的进度附记，不应把那天的历史阻塞直接改写成已完成。

原 Web Source 已接入受治理的条件式默认渲染兜底；优先深化[Web 深度阅读原文](/articles/021-agent-web-research-from-search-to-deep-reading)，不增一篇“浏览器能力已成功”的新稿。正常前后台并发对话已完成限定真实链路资格化，优先在[图册](/gallery)区分它与**尚待复核的完整复杂基金研究**。来源、计算、附件、History 的最终质量结论不能由这些进度替代。

**目录清理约束：** 已合并的旧文章继续保留可用链接；六层全景 V3 作为当前主阅读入口，V1/V2 作为带时点的完整历史版本，不得直接删除。其余近题文章先去除重复段落并明确各自 Owner，只有读者问题、核心论证和证据实际重复时才正式合稿。

## 2026-10-25 · 今日状态与下一轮协作

[自定义专家工程案例](/articles/agent-custom-expert-from-prompt-to-recovery)已发布完整中英文正文；它属于 A07 相关文章，不新增 Owner。Shadow Credits 的 P0 用量工程已在原限定范围关闭，不再把 P0 写为待关闭；费用归因仍归独立 E04。

下一轮写作优先等待**完整可复核基金研究**、统一专家完整真实对话／恢复、A36 合格市场日历、个人 Profile 正常账户验收及 E04 交付成本证据。Runtime 解耦已有静态评审和 Spec 草案，但尚无已实施效果或质量对照；不将设计写成升级已完成。见[架构图册](/gallery)。

## 已有正文 · 优先在主稿中深化

[做了一整晚，周报还停在外围：我们为什么把一个大 Spec 拆成三期？](/articles/agent-weekly-review-staged-delivery)完整复盘首份交付、二三期、通用 HTML 能力，以及写进研发流程的防复发措施。

[工程 Context、长期记忆与知识退役](/articles/027-agent-context-document-history)已吸收旧评测命令、旧设计、测试兼容层与历史检查误判的案例。两条阅读线都属于[AI Agent 研发工程实践](/engineering)，知识退役不再单独占一篇。

[供应商模块：统一接口与共享准入](/articles/agent-provider-architecture-and-admission)与[安全故障切换：换路线，不重置任务](/articles/agent-provider-failover-without-resetting-the-run)现已分别进入模块和架构主线，均有完整英文版。前者解释配置、协议与容量生命周期，后者解释故障域、原 Run 授权和恢复；故障切换的完整应用验收与部署限制仍在正文中保留，不再作为待写新题。

## 2026-10-24 补齐 A08 与 A30 专文

[**A08 持久控制事件**](/articles/agent-control-events-durable-owner-adoption) 聚焦原效果已提交、投递 ACK 却丢失时如何读取回执、识别失效 Claim 和保护 unknown；[**A30 Provider 容量准入**](/articles/agent-provider-admission-capacity-lease) 聚焦 HTTP 200 与远端真实完成的差距，以及多进程共享容量的 Lease/隔离。两篇均提供完整中英文正文，继续区分源码机制、限定工程证据和生产资格。

**A32 模型目录与路由配置** 沿 [既有 Provider 专文](/articles/agent-provider-architecture-and-admission) 新增章节深化，保留部分覆盖；**A27 每日个性研究** 继续等待可复核的真实用户结果。43 项 Owner 中有 29 个已形成独立主线、13 个部分覆盖、1 个尚未写，避免把这一数字误读为产品验收覆盖。

## 已发布展望 · 等真实结果后再写对照复盘

[从多个专家到一份研究：多层 Agent 协作的下一站（2026 展望）](/articles/multi-layer-agent-collaboration-outlook)记录截至 2026-10-24 的模块实现前提、尚未验收的整体协作价值及将来对照单 Main 的方法。未来完整任务、真实金融质量和成本证据取得后，应另写复盘并保留原展望版本，不能在旧文里事后改写预测。

## 2026-10-24 已补齐的三篇独立机制稿

[HIO：持久人机交互怎样接回原研究](/articles/agent-durable-human-interaction-response-adoption) 已覆盖原回复、重复接纳、Human Park、Correction/Continue 和 Child 原文消费；本地关闭不代表生产默认开启。 [A36：用户日期与市场交易日](/articles/agent-temporal-semantics-market-calendar) 解释当前时钟、冻结任务锚点、市场日历和行情时点，仍保留普通真实请求验收缺口。[Shadow Credits：请求与用量身份](/articles/agent-personal-credits-shadow-accounting) 专注账户自身用量与物理尝试，非支付或额度硬拒绝；E04 已有受限成本证据投影与读回代码，完整来源归因与自身验收仍独立进行。

这三篇属于同一次选题补漏，而不是三个新增运行时 Manager；图册已按明确决定新增 A36、A37 为独立逻辑 Owner，当前共 43 项；Credits 仍不单独增设执行 Owner。专题入库不替代源码实现、真实模型质量或站点线上验收。

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
| **专家之间的依赖，该由 Prompt、Main 还是 Runtime 管理？** | [Subagent](/articles/agent-subagent-context-specialization)、[多层协作展望](/articles/multi-layer-agent-collaboration-outlook)，已有 [`relationHint` 软关系 Spec](https://github.com/hpoenixf/etf-agent/blob/main/openspec/changes/agent-add-expert-usage-guidance/design.md) 与委派指南/自主任务修订设计 | 先取得一条上游真实产物→下游合法 `inputRefs` 消费→Main 综合及恢复链，再收集漏等/错引/错误编排反例；同题比较无提示、软关系和明确接力的质量、成本与等待。暂不新建正文或 DAG |

## 金融 AI 深度研究 · 单一选题清单

金融专题已经按**证券投资与财富管理业务问题**重组为 [4 个一级领域、15 个二级专题](/fintech)。精选上限每专题三篇，可以留空；满额先审查合并或替换，有独立专业问题才拆分。

全部 F01–F15 的选题、证据缺口与研究状态维护在**[金融研究 Backlog](/financial-research-backlog)**，这里不重复创建任务台账。[F01 金融研究质量评价](https://github.com/hpoenixf/eff-agent-article/issues/12)已开 Task，后续优先方向包括金融错误资产、券商 APP AI 产品和员工端工作流。

这些是**写作研究方向，不是 ETF Agent 已完成的业务验收、工程 OpenSpec 或新文章交付承诺**。

## 模块维度 · 仍可取材的独立专题

| 主题 | 真正要回答的问题 | 状态 |
| --- | --- | --- |
| [**A08 持久控制事件**](/articles/agent-control-events-durable-owner-adoption) | 入箱、claim/fence、去重、ack 与真实效果怎样保持相同身份？ | 已形成独立中英文专文；后续只补新的跨进程证据 |
| **Artifact 访问与分享** | 静态文件的原身份、当前访问权限与分享授权如何区分？ | 有现有 HTML 实例，先去重 |
| **每日个性化研究** | 定时触发能否持续带来有用、可比较的研究价值？ | 等业务效果证据，不能只用定时成功替代 |

## 已有完整正文，不再占预告位置

[A08 持久控制](/articles/agent-control-events-durable-owner-adoption) · [A30 共享容量](/articles/agent-provider-admission-capacity-lease) · [供应商共享准入](/articles/agent-provider-architecture-and-admission) · [故障域感知切换](/articles/agent-provider-failover-without-resetting-the-run) · [架构演化与“五不”](/articles/code-cheaper-systems-harder-to-evolve) · [Tool Surface](/articles/agent-model-capability-presentation-tool-surface) · [A35 内容信任边界](/articles/agent-content-trust-prompt-injection) · [Main 上下文压缩](/articles/agent-main-run-context-compaction) · [后台定时研究](/articles/agent-autonomous-scheduled-research) · [HTML 交付](/articles/agent-html-evolution-challenges) · [工程 Context / History](/articles/027-agent-context-document-history)。

**编辑约定：** 上述“深化”指对既有作品取材、校准和修改，不自动创建新 slug、改变已分享状态或承诺具体上线日期。只有完成正文、核验、入正式目录后才计为新文章。

[核心原则与外围方法](/principles) · [架构思考](/thinking) · [研发实践](/engineering) · [全部文章](/catalog)
