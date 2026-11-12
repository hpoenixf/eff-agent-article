# ETF Agent · Engineering Notes

**从一次聊天到持续研究：把 Agent 的概念、运行机制和工程取舍串起来。**

中文 · [English](https://github.com/hpoenixf/eff-agent-article/blob/main/README.en.md)

**[开始阅读 →](https://hpoenixf.com/eff-agent-article/) · [全部文章](https://hpoenixf.com/eff-agent-article/catalog) · [全景系列](https://hpoenixf.com/eff-agent-article/panorama) · [运行开源示例](https://github.com/hpoenixf/open-etf-agent)**

这里是 ETF Agent 的双语工程文集、图解与阅读站源码。面向想上手 Agent 的开发者、梳理系统边界的架构师，以及使用 AI 辅助研发的工程师：从真实用户场景出发，讲清机制如何协作、为什么这样设计，以及实现和验证还到哪里为止。

## 从哪里开始

| 你想解决的问题 | 建议路线 |
| --- | --- |
| 第一次接触 Agent，先建立直觉 | [十五分钟入门](articles/agent-in-15-minutes.md) → [输入从哪里来](articles/prompt-context-rag-memory.md) → [工具如何执行](articles/tools-function-calling-mcp-skill.md) |
| 多轮聊天、继续任务、恢复运行有什么不同 | [历史、记忆与检查点](articles/conversation-context-memory-checkpoints.md) → [运行身份全景](articles/agent-task-session-run-worker-schedule.md) |
| 想边读边做出一份可回读的报告 | [研究项目练手篇](articles/open-etf-agent-research-project-workshop.md) → [报告复核练手篇](articles/open-etf-agent-report-review-workshop.md) → [可运行教学项目](https://github.com/hpoenixf/open-etf-agent#quickstart) |
| 已有系统，想看整体设计与长期演进 | [六层调用全景 V3](articles/017-prompt-to-answer-six-layer-panorama-v3.md) → [架构原则](principles.md) → [Spec 研发全景](articles/agent-spec-driven-development-panorama.md) |

入门系列并非互不相关的名词表：沿每篇的系列导航，从概念、深入和练手走向全景。需要查具体机制时，再进入下面的分类。

## 按主题与分类阅读

### 三条主线

{{COLLECTIONS}}

### 跨分类专题

{{TOPICS}}

专题与标签是同一批文章的不同入口，不是额外分类或重复正文。[目录筛选](https://hpoenixf.com/eff-agent-article/catalog)支持组合标签、日期排序和完整索引。

**[架构图册](https://hpoenixf.com/eff-agent-article/gallery)**把各项能力与交接关系连起来；**[原则速查](https://hpoenixf.com/eff-agent-article/principles)**用于设计与审查；**[选题路线图](https://hpoenixf.com/eff-agent-article/roadmap)**区分已有文章深化与计划中的内容。

## 最近更新

{{RECENT}}

仅预览最近三篇，按中文正文在 main 的可见内容变更排序，同一文章不因双语重复计入。日期是仓库内容更新日期，不代表首次创作或线上部署时间。**[完整文章与历史排序 →](https://hpoenixf.com/eff-agent-article/catalog)**

## 读完之后，运行一个实现

[Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) 是独立的 MIT 开源教学实现，从合成离线示例到真实报告回读，按模块逐步演进。本仓库负责文章与图解；两者不是同一套源码，也不承诺功能完全对齐。

### 最近三个版本入口

{{VERSIONS}}

版本来自既有代码版本谱系，链接固定源码；不是本 README 重新认证的发布或完整能力承诺。**[全部版本与资格说明](https://hpoenixf.com/eff-agent-article/open-etf-agent) · [项目 Quickstart](https://github.com/hpoenixf/open-etf-agent#quickstart)**

### 最近三个模块阅读

<!-- open-etf-recent-modules:start -->
{{MODULES}}
<!-- open-etf-recent-modules:end -->

以上按公开模块演进与既有覆盖证据选取，不按文章日期排序。机制文章、有限实现、离线验证、真实模型验收和站点发布是不同事实；完整边界见[文章与代码对应说明](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/articles-and-code.zh-CN.md)。

## 本地开发与贡献

阅读无需安装。修改文集时使用 Node.js 22，并在仓库根目录执行：

```bash
npm install
npm run readme:sync
npm run check:catalog
npm run docs:build
```

构建包含静态 Mermaid 图渲染，需要可用的 Chrome/Chromium；完整 Git 历史用于真实文章日期。双语 README 的编辑源是 [data/readme](https://github.com/hpoenixf/eff-agent-article/tree/main/data/readme)，分类与顺序来自 [book.mjs](book.mjs)，英文标题和译文资格来自 [book.en.mjs](book.en.mjs)，版本来自既有 Open 专题。请改源头再生成，勿手工维护第二份文章或版本清单。

[维护与发布约定](MAINTENANCE.md) · [反馈问题](https://github.com/hpoenixf/eff-agent-article/issues)：附文章链接、具体段落及建议，不上传凭据、私人数据或原始日志。文档讨论与测试通过不等于生产就绪或投资效果；本文集不构成投资、法律建议，独立代码仓库的 MIT 许可不自动适用于本文集及引用材料。

## 作者与交流

[hpoenixf · 作者与博客](https://hpoenixf.com/about)。全栈偏前端，关注金融业务与 Agent 工程实践。

<details>
<summary>微信公众号 · 小飞的 AI 投研工坊</summary>

在微信里继续阅读与交流。手机端可保存图片后在微信识别。

<img src="https://raw.githubusercontent.com/hpoenixf/eff-agent-article/main/public/images/wechat-public-account.jpg" alt="小飞的 AI 投研工坊微信公众号二维码" width="180" height="180" />

</details>

## 历史导航与更新记录

文章原链接与历史全文继续保留：[六层 V2](articles/017-prompt-to-answer-six-layer-panorama.md) · [六层 V1](articles/017-prompt-to-answer-six-layer-panorama-v1.md)。当前主目录采用 V3；历史全文与合稿引导不是新增当前文章。

{{LEGACY}}
