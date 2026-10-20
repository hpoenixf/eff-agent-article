<div align="center">

# ETF Agent · Engineering Notes

**从真实开发与故障出发，读懂一套 Agent 系统如何运行、演化与交付。**

模块机制 × 架构思考 · 34 篇文章 · 两条阅读主线

[**模块维度**](https://hpoenixf.github.io/eff-agent-article/modules) · [**架构设计与系统思考**](https://hpoenixf.github.io/eff-agent-article/thinking) · [全部文章](https://hpoenixf.github.io/eff-agent-article/catalog) · [个人博客](https://hpoenixf.com/)

</div>

---

## 选择你的阅读角度

| 🔧 模块维度 · How it works | 🧭 架构设计与系统思考 · Why it works |
| --- | --- |
| 从 Entry、Web、PDF、Python、Memory、RAG、Runtime、Publication 等具体机制入手。 | 从六层全景、模型与 Host 的权责、复杂度治理、反馈归因到完整研究任务收敛。 |
| **18 篇 / 4 个主题** | **16 篇 / 3 个主题** |
| [从 Entry 开始 →](articles/022-agent-entry-from-intent-to-direct-research.md) | [从六层全景开始 →](articles/017-prompt-to-answer-six-layer-panorama.md) |

![ETF Agent 38 个能力 Owner 与主要交接](visuals/owner-architecture/overview.svg)

[交互式 Owner 架构图册](https://hpoenixf.github.io/eff-agent-article/gallery)：按完整能力及最终效果归属划分；Runtime 不另算模块，工程导航单列，收尾协调已深化到 A06。

### 值得先读的几篇

**模块维度：** [Python 从工具到工作台](articles/agent-python-compute-workbench-evolution.md) · [Memory 持久遗忘](articles/026-agent-memory-forget-durable-effects.md) · [PDF 研究阅读](articles/024-agent-pdf-from-text-to-evidence.md) · [Publication 独立发布](articles/019-agent-answer-publication.md) · [A22 文件下载与分享](articles/agent-html-evolution-challenges.md)

**架构设计与系统思考：** [代码才授权](articles/011-model-understands-code-authorizes.md) · [否决权与终结权](articles/agent-veto-authority-and-run-termination.md) · [失败诊断与反馈误归因](articles/agent-failure-is-a-boundary-problem.md) · [研发任务收敛](articles/032-ai-development-from-bug-loop-to-task-convergence.md)

## 全部文章 · 按两大类展开

点击主题标题展开相应正文。每篇只归属一个主类，交叉主题靠正文链接连通。

## 1 / 模块维度

从输入、执行、状态到交付，拆解具体能力如何运作。 [**进入在线目录 →**](https://hpoenixf.github.io/eff-agent-article/modules)

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

## 2 / 架构设计与系统思考

跨模块看 Owner、边界、可靠性、演化与真实用户价值。 [**进入在线目录 →**](https://hpoenixf.github.io/eff-agent-article/thinking)

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
<summary><b>02 · 可靠性、反馈与系统治理</b>（4 篇）</summary>

- [很多引用为什么不等于可靠](articles/ai-citations-do-not-prove-reliability.md)
- [有模型输出不等于任务成功](articles/honest-agent-evaluation.md)
- [绿测不等于生产能力](articles/green-tests-can-lie.md)
- [别把每个失败都算给模型](articles/agent-failure-is-a-boundary-problem.md)

</details>

<details>
<summary><b>03 · 工程演化与金融边界</b>（5 篇）</summary>

- [用 Agent 开发 Agent：从 Bug 循环到任务收敛](articles/032-ai-development-from-bug-loop-to-task-convergence.md)
- [HTML 都保存了，为什么还是交付失败？](articles/agent-html-evolution-challenges.md)
- [一个 ETF 投资助手的工程起点](articles/001-one-week-4-billion-tokens-etf-investment-agent.md)
- [从投资研究到投顾与交易的边界](articles/030-fintech-from-research-to-investment-advice.md)
- [金融数字的时点、口径与复算](articles/031-fintech-data-time-and-reproducible-numbers.md)

</details>

## 附：工程参考与未来写作

- [Agent 架构原则速查](principles.md)：设计、重构、Code Review 时的职责与演化检查表（参考资料，不算入 34 篇长文）
- [写作预告](roadmap.md)：尚未独立成文的模块与系统思考专题
- [六层系统全景 HTML 图文版](https://hpoenixf.github.io/eff-agent-article/visuals/017-prompt-to-answer-six-layer-panorama/index.html) · [15 张 SVG 架构图](https://github.com/hpoenixf/eff-agent-article/tree/main/visuals/017-prompt-to-answer-six-layer-panorama/diagrams)
- [个人博客](https://hpoenixf.com/)：按时间阅读的文章站；此仓库提供可复用 Markdown、专题顺序与连续阅读站

## 本地运行

```bash
npm install
npm run check:catalog
npm run docs:dev
npm run docs:build
```

正文保存在 `articles/`；`book.mjs` 是两大类、侧栏、目录与上一篇/下一篇唯一的阅读顺序来源，不维护多套文章表。

> 阅读站使用独立仓库的 GitHub Pages，不与既有博客冲突。首次部署前需要在仓库 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions**，再手动运行 `Article Library · Build & Pages`。未启用时可直接使用本 README 的 Markdown 链接。

原始文章记录特定时期的工程事实、问题与验证边界；历史实践不自动成为现行合同，受控验证不等于最终研究质量证明。本文集不构成投资或法律建议。

## 文章合并

2026-10-20 将“Runtime 不知道的，不要假装知道”并入“别让模型当状态机”，将“反馈系统为什么可能越改越偏”并入“别把每个失败都算给模型”。独有的语义检查、评测器、遥测缺失和修订持久化案例均保留在主稿；旧网址保留合稿指引，目录只收录 34 篇独立正文。

Publication 的机制与两轮治理也已合稿；否决权与渐进回答分别保留 Run 控制流和写作连贯性的独有内容。旧页只作阅读指引，不计入正文。
