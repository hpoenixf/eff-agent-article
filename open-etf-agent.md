---
layout: page
title: "Open ETF Agent：可运行的开源 Agent 教学项目"
description: "从文档比较到持续研究，沿 Open ETF Agent 的固定代码与模块文章学习 Agent 开发，区分已验证能力、教学切片与待完成工作。"
---

<OpenEtfTopic language="zh">
<template #module-map>

<!-- open-module-map:start -->
<div class="vp-doc" style="max-width: 1440px; margin: 24px auto; padding: 0 24px;">

<a id="module-map"></a>
## 按模块与能力阅读六层地图

点击图内卡片进入对应文章；可全屏展开、缩放和滚动。图中是 Open 的有界公开实现，不代表专文所述全部能力已开源或通过验收。

当前范围: **v0.30.0** · [固定导航源](https://github.com/hpoenixf/open-etf-agent/tree/d3822ab07186ab16f3d57e60a7bbf91fea3eb9d5) · [代码与验证边界](https://github.com/hpoenixf/open-etf-agent/blob/d3822ab07186ab16f3d57e60a7bbf91fea3eb9d5/docs/module-status.zh-CN.md)

<PanoramaViewer src="/eff-agent-article/visuals/open-etf-agent/module-map.zh-CN.svg" label="Open ETF Agent 六层模块地图：点击模块阅读对应文章" :canvas-width="2240" :canvas-height="2034">
<div style="overflow: auto; max-width: 100%;">
<object type="image/svg+xml" data="/eff-agent-article/visuals/open-etf-agent/module-map.zh-CN.svg" style="display:block;width:1320px;max-width:none;height:1199px;" aria-label="Open ETF Agent 六层模块地图：点击模块阅读对应文章">
<a href="/eff-agent-article/visuals/open-etf-agent/module-map.zh-CN.svg">打开可点击 SVG</a>
</object>
</div>
</PanoramaViewer>

[在独立页面打开图](https://hpoenixf.com/eff-agent-article/visuals/open-etf-agent/module-map.zh-CN.svg)

<details>
<summary>逐模块文章入口（与图内链接一致）</summary>

### L1 · 任务输入与触发

- **CLI** → [十五分钟入门 Agent](https://hpoenixf.com/eff-agent-article/articles/agent-in-15-minutes) · 导读
- **Research Project** → [把自己的资料交给 Agent：从第一份报告到可恢复的研究项目](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-research-project-workshop) · 专题练手篇
- **Schedule** → [Agent 不必一直在线思考：我们怎样让研究在对话结束后按时继续？](https://hpoenixf.com/eff-agent-article/articles/agent-autonomous-scheduled-research) · 模块专文

### L2 · 身份、会话与上下文

- **Session** → [Agent 运行身份全景：从一次聊天到 Model Turn，系统到底在继续什么？](https://hpoenixf.com/eff-agent-article/articles/agent-task-session-run-worker-schedule) · 导读
- **Conversation** → [“接着聊”不等于“接着执行”：Agent 对话接纳与任务接续的设计](https://hpoenixf.com/eff-agent-article/articles/agent-conversation-admission-task-continuation) · 模块专文
- **Temporal** → [Agent 说“今天”时，到底是哪一天：任务时间、用户时间与市场交易日](https://hpoenixf.com/eff-agent-article/articles/agent-temporal-semantics-market-calendar) · 模块专文
- **Context** → [Agent 上下文治理全景·行动篇：从首轮输入到长期记忆，怎样真正落地](https://hpoenixf.com/eff-agent-article/articles/agent-context-governance-actions) · 导读
- **Compaction** → [上下文快满时，为什么不能直接把历史交给模型摘要？](https://hpoenixf.com/eff-agent-article/articles/agent-main-run-context-compaction) · 模块专文
- **Memory** → [Agent Memory 的完整生命周期：从记住偏好到安全遗忘](https://hpoenixf.com/eff-agent-article/articles/026-agent-memory-forget-durable-effects) · 模块专文
- **Human Interaction** → [Agent 问完用户之后：持久人机交互如何接回原研究](https://hpoenixf.com/eff-agent-article/articles/agent-durable-human-interaction-response-adoption) · 模块专文
- **Specialist Profile** → [自定义专家，不应该只是一个 Prompt 输入框](https://hpoenixf.com/eff-agent-article/articles/agent-custom-expert-from-prompt-to-recovery) · 模块专文
- **Skill** → [Skill 与普通 Prompt 有什么不同？从按需加载到脚本执行](https://hpoenixf.com/eff-agent-article/articles/agent-skill-from-markdown-to-callable-research) · 模块专文

### L3 · Agent 决策与运行

- **Worker** → [Agent 深入：从一份报告到持续执行与专家协作](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-v010-system-design) · Open 练手篇
- **Admission** → [模型返回了 HTTP 200，为什么下一次请求还得排队？Provider 容量准入的租约与未知占用](https://hpoenixf.com/eff-agent-article/articles/agent-provider-admission-capacity-lease) · 模块专文
- **Gateway** → [Agent 供应商模块精讲：为什么统一接口之后，还需要共享准入](https://hpoenixf.com/eff-agent-article/articles/agent-provider-architecture-and-admission) · 模块专文
- **Runtime** → [投研 Agent 的关键不是多调用工具：从 Model、Harness 到会修正判断的 Loop](https://hpoenixf.com/eff-agent-article/articles/etf-agent-model-harness-research-loop) · 导读
- **Hooks** → [从 Claude、Pi 到 Codex：我们如何在自己的 Agent Runtime 中实现多生态 Hook？](https://hpoenixf.com/eff-agent-article/articles/agent-multi-ecosystem-hook-execution) · 模块专文
- **Run Control** → [当每个模块都能说“不”：Agent 的终结权、阶段预算与安全恢复](https://hpoenixf.com/eff-agent-article/articles/agent-veto-authority-and-run-termination) · 模块专文
- **Main → Child** → [Subagent 全景：独立上下文、专业协作与真实成果交接](https://hpoenixf.com/eff-agent-article/articles/agent-subagent-context-specialization) · 导读
- **Child Lifecycle** → [Subagent 全景：独立上下文、专业协作与真实成果交接](https://hpoenixf.com/eff-agent-article/articles/agent-subagent-context-specialization) · 导读

### L4 · 工具与领域能力

- **Tool Host** → [从工具调用到模型输入：把 Agent 的观测链路接起来](https://hpoenixf.com/eff-agent-article/articles/agent-tool-lifecycle-and-model-input) · 模块专文
- **MCP** → [从接上 MCP 到真正用上工具：Agent 的接入链路怎样构建](https://hpoenixf.com/eff-agent-article/articles/mcp-host-from-discovery-to-consumption) · 模块专文
- **Trusted Plugin** → [Agent 扩展如何接入 Host：插件生命周期与运行时边界](https://hpoenixf.com/eff-agent-article/articles/020-agent-extension-host-smartphone) · 模块专文
- **Web Acquisition** → [从“搜得到”到“读得下去”：我们怎样让 Agent 学会浏览网页](https://hpoenixf.com/eff-agent-article/articles/021-agent-web-research-from-search-to-deep-reading) · 模块专文
- **PDF** → [从能读取到能研究：我们如何把 PDF 阅读升级为可追溯的多模态能力](https://hpoenixf.com/eff-agent-article/articles/024-agent-pdf-from-text-to-evidence) · 模块专文
- **Result / ResultRef** → [工具查到的数据，为什么不一定要给大模型看？](https://hpoenixf.com/eff-agent-article/articles/tool-results-outside-model-context) · 模块专文
- **Retrieval** → [RAG 全链路：从文档入库到可引用回答](https://hpoenixf.com/eff-agent-article/articles/agent-knowledge-retrieval-end-to-end) · 导读
- **Knowledge** → [RAG 全链路：从文档入库到可引用回答](https://hpoenixf.com/eff-agent-article/articles/agent-knowledge-retrieval-end-to-end) · 模块专文
- **Calculation** → [Agent 深入：从一份报告到持续执行与专家协作](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-v010-system-design) · Open 练手篇
- **Child Results** → [多专家 Agent：怎么证明专家的结论真的被主 Agent 用到了？](https://hpoenixf.com/eff-agent-article/articles/agent-subagent-contribution-evidence) · 模块专文

### L5 · 结果发布与交付

- **Main → Report** → [从第一份可回读报告开始：Open ETF Agent v0.1](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-v01-first-readable-report) · Open 练手篇
- **Report** → [从第一份可回读报告开始：Open ETF Agent v0.1](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-v01-first-readable-report) · Open 练手篇
- **Artifact / Revision** → [报告已经生成，为什么还不能直接分享？](https://hpoenixf.com/eff-agent-article/articles/agent-artifact-version-access-sharing) · 模块专文
- **Publication** → [Agent 已经生成答案，为什么还需要一个独立的发布系统？](https://hpoenixf.com/eff-agent-article/articles/019-agent-answer-publication) · 模块专文
- **Report Review** → [报告写完以后：让 Agent 查证、协作，再独立复核](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-report-review-workshop) · 专题练手篇

### L6 · 用户界面

- **Loopback Reader** → [Agent 深入：从一份报告到持续执行与专家协作](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-v010-system-design) · Open 练手篇
- **CLI Readback** → [从第一份可回读报告开始：Open ETF Agent v0.1](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-v01-first-readable-report) · Open 练手篇

</details>

虚线卡片是同一 Owner 的调用位置，不另算独立模块。文章链接属于阅读导航，不改变已有文章覆盖资格与历史验收记录。GitHub README 中的图仅作预览，图内交互在本页提供。

</div>
<!-- open-module-map:end -->

</template>
</OpenEtfTopic>
