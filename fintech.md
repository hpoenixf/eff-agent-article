---
title: 金融科技 × Agent · 可信金融软件工程地图
description: 从业务合规、内容信任、可控效果、数值正确、运行韧性、留痕、可审查与第三方治理理解金融 Agent。
---

# 金融科技 × Agent：从安全、可靠、可控，到留痕与审查

<small>TRUSTWORTHY FINANCIAL SOFTWARE · 2026-10-22 · 跨分类专题，不是第四个一级分类</small>

金融软件需要的不只是一个“回答正确”的模型。一项组合研究可能读取私有持仓、分析外部报告、计算资金约束、形成建议、保存结果，还要在用户离开或进程重启后继续。我们需要同时回答：**资料从哪里来？谁允许读取？谁能授权实际动作？什么效果已经发生？用户最终拿到了什么？事后如何复核？**

**合规不等于安全；安全不等于可靠；日志不等于完整审计证据；模型说“已批准”也不等于用户授权。** 这些问题相关，却不能交给一个全局 Safety Manager 或一组全绿测试代替。

本页把现有 45 篇工程文集中的相关案例按金融软件的关切重新串联。**每篇仍属于原来的唯一主分类**，这里仅提供跨类链接，不复制正文、不新增 Runtime Owner。A35 内容信任值得进入金融专题，但其 provider-free 结构证据并不证明真实模型已经免疫提示注入。

## 八个值得分别核验的工程关注点

| 关注点 | 金融业务为什么在意 | 已有文章与尚未证明的部分 |
| --- | --- | --- |
| **合规与投资者保护** | 知识解释、组合研究、个性化建议、交易指令有不同的业务责任和用户承诺。 | [研究、投顾与交易边界](/articles/030-fintech-from-research-to-investment-advice)、[模型理解，代码授权](/articles/011-model-understands-code-authorizes)。**技术分层不是资质、适当性审查或法律合规证明。** |
| **安全、隐私和内容信任** | 外部网页、PDF、MCP、历史 Memory 不能靠自报角色、权限或“用户同意”越权；读取与披露也不同。 | [A35：Prompt Injection 与内容信任](/articles/agent-content-trust-prompt-injection)、[RAG 撤权与历史回放](/articles/027-rag-revocation-publish-replay)、[Memory 的持久效果](/articles/026-agent-memory-forget-durable-effects)。RAG 文章含历史方案；**未证明真实模型抗注入能力或全部数据流安全。** |
| **授权、可控与最小效果** | 看见工具不等于获准调用；模型提议不等于批准、执行或成交；局部拒绝不应抹掉独立合法研究。 | [Run grant 与效果授权](/articles/011-model-understands-code-authorizes)、[Run 终结权和局部拒绝](/articles/agent-veto-authority-and-run-termination)、[A34 Tool Surface](/articles/agent-model-capability-presentation-tool-surface)。保护由原效果 Owner 执行，**不引入新的全局否决者**。 |
| **数据准确、完整与可复算** | 金额、单位、币种、费用、时点、基金穿透覆盖率和来源限制，会改变风险与配置判断。 | [金融数字与精度](/articles/031-fintech-data-time-and-reproducible-numbers)、[Python 结果真正被消费](/articles/financial-agent-python-result-consumption)、[金融可信证据链](/articles/financial-agent-trustworthy-evidence-chain)、[只读 Portfolio MCP](/articles/portfolio-mcp-readonly-investment-data)。**局部公式正确不代表整题研究建议正确。** |
| **可靠、韧性与持续交付** | 工具超时、模型不可用、浏览器断开、PostgreSQL 重启后，已结算的效果和已发布正文不能靠重试猜测。 | [Publication：答案的持久事实](/articles/019-agent-answer-publication)、[异步研究的到期交付](/articles/agent-asynchronous-research-time-bound-delivery)、[受控刷新](/articles/unavailable-is-correct)、[阶段预算与安全恢复](/articles/agent-veto-authority-and-run-termination)。**定向回归不是生产 SLA 或灾难恢复演练。** |
| **可记录、可追溯** | 要说明一次模型/工具请求、原始来源、派发与效果、版本和交付分别发生了什么；记录缺失要保留未知。 | [Langfuse：从 Trace 到可信观测](/articles/025-agent-langfuse-from-trace-to-trustworthy-observability)、[工具调用到模型输入](/articles/agent-tool-lifecycle-and-model-input)、[发布修订与历史](/articles/019-agent-answer-publication)。**Trace 存在不代表形成不可篡改、满足保存期限的审计账。** |
| **可审查、可解释与可纠错** | 审查者需要重建当时数据、研究假设、用户更正、模型提议和实际效果；也要知道用户收到哪个版本。 | [周报 Investment Thesis 历史](/articles/agent-weekly-thesis-history-continuous-research)、[真实评测与假 Green](/articles/honest-agent-evaluation)、[金融证据链](/articles/financial-agent-trustworthy-evidence-chain)。**可重建工程事实不等于看见模型内部推理或证明建议有效。** |
| **第三方依赖与变更退出** | 模型供应商、MCP 数据源、插件和执行平台更换或失效时，数据用途、权限、版本与退出责任不能丢失。 | [MCP Host 的接入合同](/articles/mcp-host-from-discovery-to-consumption)、[市场数据 MCP 与供应商职责](/articles/mcp-market-responsibility-retrospective)、[Extension Host](/articles/020-agent-extension-host-smartphone)、[多生态 Hook](/articles/agent-multi-ecosystem-hook-execution)。**这些接缝不等于完成外包尽调、数据出境或供应商退出验收。** |

## 三条短阅读路径

**做安全与合规架构：** [研究／投顾／交易的业务边界](/articles/030-fintech-from-research-to-investment-advice) → [A35 指令来源身份](/articles/agent-content-trust-prompt-injection) → [受保护文档撤权](/articles/027-rag-revocation-publish-replay) → [动作授权](/articles/011-model-understands-code-authorizes)。

**做高可靠、可控的 Agent：** [Run 终结和局部拒绝](/articles/agent-veto-authority-and-run-termination) → [Publication](/articles/019-agent-answer-publication) → [后台研究的时间约定](/articles/agent-asynchronous-research-time-bound-delivery) → [可信观测](/articles/025-agent-langfuse-from-trace-to-trustworthy-observability)。

**做可复核的金融研究：** [持仓事实](/articles/portfolio-mcp-readonly-investment-data) → [金融数值复算](/articles/031-fintech-data-time-and-reproducible-numbers) → [计算结果消费](/articles/financial-agent-python-result-consumption) → [历史投资论点](/articles/agent-weekly-thesis-history-continuous-research) → [真实评测](/articles/honest-agent-evaluation)。

## 监管与行业框架：先确认适用主体

以下是可供设计和审查时参考的**官方坐标**，不是所有地区金融软件共用的法定清单，也不是 ETF Agent 合规认证：

- **中国证券基金机构：** 证监会《[证券基金经营机构信息技术管理办法](https://www.csrc.gov.cn/csrc/c106256/c1653896/content.shtml)》（2018 年发布，2021 年修订）包含适用主体的信息技术治理、权限、安全、审计、应急与信息技术服务方责任。是否适用取决于经营主体与具体服务。
- **欧盟金融机构：** ESMA [DORA 介绍](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/digital-operational-resilience-act-dora)说明该法规自 2025 年 1 月 17 日起适用，并覆盖金融实体 ICT 风险和第三方依赖。
- **银行业：** 巴塞尔委员会[运行韧性原则](https://www.bis.org/committees/bcbs/basel-consolidated-guidelines/module/orr/20)涉及关键业务、连续性演练、外部依赖、事件与恢复；不自动等于每个投研应用的强制义务。
- **跨行业安全与 AI 风险：** NIST [CSF 2.0](https://www.nist.gov/cyberframework/faqs)采用 Govern、Identify、Protect、Detect、Respond、Recover；[AI RMF 1.0](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)采用 Govern、Map、Measure、Manage。它们是风险治理参考而非合规证书。
- **资本市场模型风险：** IOSCO [Artificial Intelligence in Capital Markets（2025）](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD788.pdf)讨论模型、数据、客户沟通及第三方风险，具体法定义务仍应由适用监管和机构要求确认。

## 下一步补什么，而不是再建一个万能管理器？

这些是**优先取证和工程建设候选**，尚未实施，也不自动成为承诺的产品 Roadmap。

| 方向 | 最小可验证交付 | 关键缺口 |
| --- | --- | --- |
| **P0：只读的任务审查证据包** | 由获授权的审查者沿原 Run、grant、source/resultRef、工具提议/派发/效果、发布修订、交付与恢复回执，重建一个真实或合成研究任务；缺失的事实明确标未知 | 现有 Trace、结果与回执分散在原 Owner，尚未证明外部审查者能合法、完整复核。**优先补只读消费路径，不建第二份 Audit Manager 或权威账。** |
| **P0：A35 真实模型对抗评测** | 在现有 E03/评测路径用 Web/PDF/MCP、Child、摘要、Memory 进行来源冒充、伪授权和外传诱导测试；同时保留普通研报、合法 PDF 读图和攻击引用的放行对照 | 现有 A35 为 provider-free 结构与局部效果验证，**没有真实模型注入防御率、误拒率**。 |
| **P1：第三方数据流和退出验证** | 清点敏感数据类别、模型/工具供应商路由、外发与日志存留、销毁和替换路径；用合成数据核对故障和供应商切换 | 工具已接入不等于完成供应商尽调、隐私目的限制和退出演练。 |
| **P1：韧性演练与用户可见恢复** | 进程终止、数据库暂不可用、工具超时、正文已提交但通知失败时，按原 Owner 回读效果；只有实际测量后再谈恢复目标 | 单例冷恢复和局部回归不证明真实生产 RTO/RPO、长期可用率。 |
| **P1：金融研究独立质量验收** | 用获准合成组合或公开数据评价时点、费用、覆盖、压力情景、反证和建议边界，同时验证用户是否真正拿到结果 | 计算正确、报告生成与用户决策增益之间仍有证据缺口。 |

可以把它们合成一条**未来验收用例**：用户要求组合风险研究；外部资料冒充“用户已经批准交易”；Agent 继续合法分析，但未获授权的动作没有执行；中途故障后正确恢复或记录未知；审查者能从原回执重建整个过程。**这只是建议的端到端测试场景，尚未执行。**

## 边界与导航

这份地图讨论工程责任，不构成投资建议、执业资质声明、法律意见或产品安全认证。留痕与合规审计要分别考虑权限、不可抵赖、保留期限、访问审查和适用主体。A35 仍是一篇[模块精讲](/modules)，在这里仅新增金融专题关联；所有文章以[唯一目录](/catalog)为准。

[后续写作与取证](/roadmap) · [系统架构](/thinking) · [研发实践](/engineering) · [为公开文集点 Star](https://github.com/hpoenixf/eff-agent-article)
