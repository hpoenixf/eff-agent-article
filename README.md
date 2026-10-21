<div align="center">

# ETF Agent · Engineering Notes

**从真实开发与故障出发，读懂一套 Agent 系统如何运行、演化与交付。**

模块机制 × 架构思考 × AI Agent 研发工程 · **37 篇正文，三条主线**

[**模块维度**](https://hpoenixf.github.io/eff-agent-article/modules) · [**架构设计与系统思考**](https://hpoenixf.github.io/eff-agent-article/thinking) · [**AI Agent 研发工程实践**](https://hpoenixf.github.io/eff-agent-article/engineering) · [**金融科技 × Agent 专题**](https://hpoenixf.github.io/eff-agent-article/fintech) · [全部文章](https://hpoenixf.github.io/eff-agent-article/catalog) · [个人博客](https://hpoenixf.com/)

</div>

---

## 按问题选择阅读主线

| 阅读入口 | 回答的问题 | 范围 |
| --- | --- | --- |
| [模块维度](modules.md) | Agent 如何运行？ | **18 篇 / 4 组**，Entry、Web、PDF、Python、Memory、Runtime 与交付 |
| [架构设计与系统思考](thinking.md) | 为什么这样设计？ | **14 篇 / 3 组**，Owner、授权、复杂度、恢复与演化 |
| [AI Agent 研发工程实践](engineering.md) | 如何持续开发和验证？ | **5 篇 / 2 组**，Spec、Evidence、History、假绿与任务收敛 |
| [金融科技 × Agent 专题](fintech.md) | 这些机制怎样进入金融业务？ | **4 篇跨分类精选**；不作为第四个一级分类，不重复正文 |

![ETF Agent 38 个能力 Owner 与主要交接](visuals/owner-architecture/overview.svg)

[交互式 Owner 架构图册](https://hpoenixf.github.io/eff-agent-article/gallery)：按完整能力及最终效果归属分类，保留已核实的专文与相关文章映射。研发规范文章不因涉及 Agent 就强行挂到运行时 Owner。

### 推荐起点

**模块：** [Python 计算工作台](articles/agent-python-compute-workbench-evolution.md) · [Memory 持久效果](articles/026-agent-memory-forget-durable-effects.md) · [Publication 独立发布](articles/019-agent-answer-publication.md)

**架构：** [模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md) · [否决权与 Run 终结权](articles/agent-veto-authority-and-run-termination.md)

**研发：** [Spec 与 Evidence](articles/026-agent-spec-evidence-workflow.md) · [文档与 History](articles/027-agent-context-document-history.md) · [任务收敛](articles/032-ai-development-from-bug-loop-to-task-convergence.md)

**金融：** [投顾与交易边界](articles/030-fintech-from-research-to-investment-advice.md) · [金融数字复算](articles/031-fintech-data-time-and-reproducible-numbers.md) · [可信证据链](articles/financial-agent-trustworthy-evidence-chain.md)

## 全部文章

阅读次序、侧栏与上一篇／下一篇的唯一结构来源是 [book.mjs](book.mjs)。此处仅做入口展示；同一篇正文仅归属一个一级分类，跨主题只放链接。

### 1 / 模块维度

[进入在线目录 →](https://hpoenixf.github.io/eff-agent-article/modules)

<details>
<summary><b>01 · 研究入口、阅读与计算</b>（7 篇）</summary>

- [Entry：为什么入口越来越简单](articles/022-agent-entry-from-intent-to-direct-research.md)
- [Web：从搜索到连续阅读](articles/021-agent-web-research-from-search-to-deep-reading.md)
- [PDF：从文本到证据](articles/024-agent-pdf-from-text-to-evidence.md)
- [Subagent：从隔离到专业化协作](articles/agent-subagent-context-specialization.md)
- [Adaptive Research 与 Python](articles/adaptive-research-python-workbench.md)
- [Python：从工具到计算工作台](articles/agent-python-compute-workbench-evolution.md)
- [数据过期后的受控刷新](articles/unavailable-is-correct.md)

</details>

<details>
<summary><b>02 · 上下文、研究资产与知识</b>（4 篇）</summary>

- [工具结果为什么不必全部入上下文](articles/tool-results-outside-model-context.md)
- [静默截断：真实数据为什么变少](articles/partial-is-not-complete.md)
- [Memory：遗忘已提交，回答却失败](articles/026-agent-memory-forget-durable-effects.md)
- [RAG：文档撤权与历史回放](articles/027-rag-revocation-publish-replay.md)

</details>

<details>
<summary><b>03 · 运行时、扩展与观测</b>（4 篇）</summary>

- [Extension Host：从功能机到智能机](articles/020-agent-extension-host-smartphone.md)
- [工具调用到模型输入的观测链](articles/agent-tool-lifecycle-and-model-input.md)
- [Run 预算与约束治理](articles/agent-runtime-constraint-governance-v2.md)
- [Langfuse：从 Trace 到可信观测](articles/025-agent-langfuse-from-trace-to-trustworthy-observability.md)

</details>

<details>
<summary><b>04 · 答案、发布与恢复</b>（3 篇）</summary>

- [Publication：为什么需要独立发布系统](articles/019-agent-answer-publication.md)
- [渐进式回答如何保持连贯](articles/agent-progressive-answer-coherence.md)
- [失败终态与安全恢复](articles/honest-agent-failure-semantics.md)

</details>

### 2 / 架构设计与系统思考

[进入在线目录 →](https://hpoenixf.github.io/eff-agent-article/thinking)

<details>
<summary><b>01 · 系统全景与职责边界</b>（7 篇）</summary>

- [从一句问题到六层系统全景](articles/017-prompt-to-answer-six-layer-panorama.md)
- [一个 Agent 为什么先装刹车](articles/010-agent-first-brakes.md)
- [模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md)
- [别让模型当状态机](articles/runtime-model-protocol-boundary-agent-article-v2.md)
- [Model / Runtime / MCP / Skill 的分工](articles/agent-model-runtime-mcp-skill-boundaries.md)
- [散落的否决权与 Run 终结权](articles/agent-veto-authority-and-run-termination.md)
- [金融数据 MCP 为什么变成决策系统](articles/mcp-market-responsibility-retrospective.md)

</details>

<details>
<summary><b>02 · 可靠性、反馈与系统治理</b>（2 篇）</summary>

- [很多引用为什么不等于可靠](articles/ai-citations-do-not-prove-reliability.md)
- [别把每个失败都算给模型](articles/agent-failure-is-a-boundary-problem.md)

</details>

<details>
<summary><b>03 · 工程演化与金融边界</b>（5 篇）</summary>

- [HTML 保存了，为什么还是交付失败](articles/agent-html-evolution-challenges.md)
- [一个 ETF 投资助手的工程起点](articles/001-one-week-4-billion-tokens-etf-investment-agent.md)
- [从投资研究到投顾与交易的边界](articles/030-fintech-from-research-to-investment-advice.md)
- [金融数字的时点、口径与复算](articles/031-fintech-data-time-and-reproducible-numbers.md)
- [金融 Agent 的可信证据链](articles/financial-agent-trustworthy-evidence-chain.md)

</details>

### 3 / AI Agent 研发工程实践

[进入在线目录 →](https://hpoenixf.github.io/eff-agent-article/engineering)

<details>
<summary><b>01 · Spec、证据与工程记忆</b>（2 篇）</summary>

- [Spec、Evidence 与可验证研发关闭](articles/026-agent-spec-evidence-workflow.md)
- [文档按需加载与长期工程记忆](articles/027-agent-context-document-history.md)

</details>

<details>
<summary><b>02 · 真实验证与任务收敛</b>（3 篇）</summary>

- [绿测不等于生产能力](articles/green-tests-can-lie.md)
- [模型有输出不等于评测通过](articles/honest-agent-evaluation.md)
- [从 Bug 循环到完整任务收敛](articles/032-ai-development-from-bug-loop-to-task-convergence.md)

</details>

## 延伸阅读与边界

- [金融科技 × Agent 主题阅读](fintech.md)：跨分类精选，不另外生成文章副本。
- [Agent 架构原则速查](principles.md)：用于设计、重构与 Code Review 的判断清单，不计入 37 篇正文。
- [架构图册](gallery.md) · [工程选题预告](roadmap.md) · [六层系统图文版](https://hpoenixf.github.io/eff-agent-article/visuals/017-prompt-to-answer-six-layer-panorama/index.html)
- [个人博客](https://hpoenixf.com/)：按时间阅读的文章；此仓库用于主题与连续阅读。新收录的 Spec、History 文章保留博客原文链接。

正文记录特定时间点的工程事实、问题和验证边界；内部通过、正式关闭、公开发布和真实业务效果是不同事实。本文集不构成投资或法律建议。

### 本地检查

```bash
npm install
npm run check:catalog
npm run docs:build
```

## 已合并文章的旧链接

旧版 023 发布治理、runtime-natural-language-boundary 和 028 反馈专题仍保留指向现有主稿的合稿引导，**不另算正文**。不为分类调整创建旧文章副本。
