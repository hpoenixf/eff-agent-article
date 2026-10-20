<div align="center">

# ETF Agent · Engineering Notes

**从一个投资问题，到一套可以验证、可以维护、可以升级的 Agent 系统。**

不是框架宣传册。这里记录我们如何处理授权、运行时、工具、证据、交付与评测，以及为什么有些复杂度必须被删掉。

[**📚 在线连续阅读**](https://hpoenixf.github.io/eff-agent-article/) · [**🧭 全部章节**](https://hpoenixf.github.io/eff-agent-article/catalog) · [**🏛 架构导读**](https://hpoenixf.github.io/eff-agent-article/architecture) · [**✍️ 写作预告**](https://hpoenixf.github.io/eff-agent-article/roadmap) · [个人博客](https://hpoenixf.com/)

</div>

---

## 从哪里开始

**第一次读：** [六层系统全景](articles/017-prompt-to-answer-six-layer-panorama.md) → [模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md) → [别让模型当状态机](articles/runtime-model-protocol-boundary-agent-article-v2.md) → [独立发布系统](articles/019-agent-answer-publication.md)。

**已经在开发 Agent：** [收回否决权](articles/agent-veto-authority-and-run-termination.md) → [Web 从搜索到深读](articles/021-agent-web-research-from-search-to-deep-reading.md) → [可信观测](articles/025-agent-langfuse-from-trace-to-trustworthy-observability.md) → [任务成功怎样评测](articles/honest-agent-evaluation.md)。

![ETF Agent 六层交接图](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/overview.svg)

## 六章文章主线

当前 **6 章 · 29 篇**。在线站点有全文搜索、侧栏目录、章节连续阅读、Mermaid 图表与手机适配。

### 01 · 从全景开始

先理解一个问题为什么会穿过这么多边界。

- [一句问题走过六层系统](articles/017-prompt-to-answer-six-layer-panorama.md)
- [为什么 Agent 必须先装刹车](articles/010-agent-first-brakes.md)
- [模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md)
- [ETF 投资助手的工程起点](articles/001-one-week-4-billion-tokens-etf-investment-agent.md)

### 02 · 模型、Runtime 与边界

分清谁提出语义判断，谁对客观事实负责。

- [别让模型当状态机](articles/runtime-model-protocol-boundary-agent-article-v2.md)
- [Runtime 不知道的，别假装知道](articles/runtime-natural-language-boundary-article-v2.md)
- [Model / Runtime / MCP / Skill 分工](articles/agent-model-runtime-mcp-skill-boundaries.md)
- [收回散落的否决权](articles/agent-veto-authority-and-run-termination.md)

> 本章其余文章可在[站点目录](https://hpoenixf.github.io/eff-agent-article/catalog)中按顺序阅读。

### 03 · 研究、工具与扩展

从入口判断、工具调用到专业化协作。

- [Entry 为什么越做越简单](articles/022-agent-entry-from-intent-to-direct-research.md)
- [Web：从搜索到连续阅读](articles/021-agent-web-research-from-search-to-deep-reading.md)
- [PDF：从文本到证据](articles/024-agent-pdf-from-text-to-evidence.md)
- [Subagent：隔离与专业化](articles/agent-subagent-context-specialization.md)

> 本章其余文章可在[站点目录](https://hpoenixf.github.io/eff-agent-article/catalog)中按顺序阅读。

### 04 · 证据与可观测性

引用、完整性、可回读的运行事实各自成立。

- [很多引用不等于可靠](articles/ai-citations-do-not-prove-reliability.md)
- [警惕静默截断](articles/partial-is-not-complete.md)
- [Langfuse：从 Trace 到可信观测](articles/025-agent-langfuse-from-trace-to-trustworthy-observability.md)

### 05 · 答案、发布与恢复

生成内容、获准发表和真正交付是不同事实。

- [为什么要独立发布系统](articles/019-agent-answer-publication.md)
- [为什么发布治理做了两次](articles/023-agent-publication-governance-retrospective.md)
- [渐进回答如何保持连贯](articles/agent-progressive-answer-coherence.md)
- [失败终态与安全恢复](articles/honest-agent-failure-semantics.md)

### 06 · 测试、评测与迭代

把局部绿测带回真实用户目标。

- [有模型输出不等于任务成功](articles/honest-agent-evaluation.md)
- [绿测不等于生产能力](articles/green-tests-can-lie.md)
- [从粗错误码走向因果链](articles/agent-failure-is-a-boundary-problem.md)

## 图册与独立阅读

- [15 张 SVG 架构图](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/) · [HTML 完整图文版](visuals/017-prompt-to-answer-six-layer-panorama/index.html)
- [最新架构导读](architecture.md)：区分模型语义、Runtime 客观事实、Run 授权、证据、Publication 与评测
- [八个待写选题及预告](roadmap.md)：明确“选题中 / 待复评”，不把未成文的内容冒充已发布
- [个人博客](https://hpoenixf.com/)：按时间更新；本仓库提供连续阅读与可复用 Markdown

## 写作原则

每篇只回答一个足够独立的问题。**提议 ≠ 批准 ≠ 执行 ≠ 实际效果**；历史观察、设计意图、局部测试、真实用户任务也不能互相替代。

文章来自不同开发阶段，具体机制请以文内取材时间和验证范围为准。**待评估或待修改的内部草稿不自动进入本公开仓库。**

## 本地运行阅读站

```bash
npm install
npm run check:catalog
npm run docs:dev
npm run docs:build
```

文章正文继续保存在 `articles/`；`book.mjs` 是侧栏和目录组件共用的唯一阅读顺序源。GitHub Pages 发布工作流在 `.github/workflows/pages.yml`，目标为项目站点 `/eff-agent-article/`，不修改已有博客部署。

<sub>Built from engineering evidence · Not investment advice.</sub>
