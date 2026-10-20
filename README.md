<div align="center">

# ETF Agent · Engineering Notes

**Agent 工程实践：从能工作，到可靠交付，再到持续演进。**

[![Read the collection](https://img.shields.io/badge/READ-Continuous%20Reading-08786D?style=for-the-badge)](https://hpoenixf.github.io/eff-agent-article/)
[![Visit blog](https://img.shields.io/badge/BLOG-hpoenixf.com-37474F?style=for-the-badge)](https://hpoenixf.com/)

*29 篇公开长文 · 5 章阅读主线 · 15 张 SVG 图 · 选题持续更新*

</div>

![ETF Agent 六层职责总览](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/overview.svg)

> **这不是一份 Agent 功能清单。** 我们记录的是复杂投研 Agent 在真实任务中的工程问题：授权与执行为什么不能混在一起、失败为何容易假装成功、插件怎样避免复制一套 Runtime、如何让新能力接入后仍能撤退和替换。

## 从哪里读起？

| 你想回答的问题 | 推荐文章 |
| --- | --- |
| **整个 Agent 究竟怎样运行？** | [一次提问怎样经过六层系统](articles/017-prompt-to-answer-six-layer-panorama.md) |
| **模型和代码各掌握什么权力？** | [模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md) |
| **为什么要收回四散的否决权？** | [Run 终结权与模块边界](articles/agent-veto-authority-and-run-termination.md) |
| **插件如何让 Agent 持续进化？** | [Extension Host：从功能机到智能手机](articles/020-agent-extension-host-smartphone.md) |
| **模型有输出就算任务完成吗？** | [真实评测与假 Green](articles/honest-agent-evaluation.md) |

## 系列阅读路线

| 章节 | 关注重点 | 先读哪一篇 |
| --- | --- | --- |
| **01 · 从一个问题开始** | 全景、授权与安全 | [一个 Agent 为什么必须先装刹车](articles/010-agent-first-brakes.md) |
| **02 · Runtime 与治理** | 状态、资源、终结与 Child | [别再让模型当状态机](articles/runtime-model-protocol-boundary-agent-article-v2.md) |
| **03 · 资料、证据与计算** | Web、PDF、来源与计算 | [Web 从搜索到深度阅读](articles/021-agent-web-research-from-search-to-deep-reading.md) |
| **04 · 扩展、入口与交付** | 插件体系与正式发布 | [答案为什么需要 Publication](articles/019-agent-answer-publication.md) |
| **05 · 工程验证与演进** | 真实评测、诊断与观测 | [从 Trace 到可信观测](articles/025-agent-langfuse-from-trace-to-trustworthy-observability.md) |
| **06 · 下一篇正在酝酿** | 未公开选题与证据缺口 | [选题预告](roadmap.md) |

**[📖 打开连续阅读站 →](https://hpoenixf.github.io/eff-agent-article/)** · [完整目录](contents.md) · [近期架构地图](architecture.md) · [SVG 图册](atlas.md) · [写作预告](roadmap.md)

> 阅读站基于 VitePress，支持中文全文搜索、章节侧栏、页内标题、上下篇、移动端导航、深色模式和上次阅读位置。首次发布须在仓库 Settings → Pages 选择 **GitHub Actions**；在此之前可直接阅读以上 Markdown 链接。

## 为什么已有博客，还要一个独立阅读站？

| 渠道 | 职责 |
| --- | --- |
| [个人博客](https://hpoenixf.com/) | 按发布时间展示文章与个人写作 |
| **此仓库 / GitHub Pages** | 按问题组织可连续阅读的工程文集，保留 Markdown、图和公开修订历史 |
| ETF Agent 内部文档 | 实现、规范、受保护证据与尚未通过公开审查的素材 |

**不维护第二份正文。** 文章本体在 articles 目录里，站点直接渲染 Markdown。新增已经确认可公开的文章，只需增加文件并在 .vitepress/reading.mjs 中登记阅读顺序。

## 新架构与写作预告

[2026 年 10 月架构导读](architecture.md)按模型语义、Host 执行事实、Publication、业务投资账本等 Owner 梳理职责。Python 计算工作台、Memory、RAG、反馈系统和研发收敛等已有内部素材，但尚需复评；[写作预告](roadmap.md)只保留选题，不自动公开草稿。

全景图文版源文件可从 [visuals](visuals/017-prompt-to-answer-six-layer-panorama/index.html) 查看，15 张 SVG 架构图保留在 [diagrams](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/)。

欢迎在 [Issues](https://github.com/hpoenixf/eff-agent-article/issues) 反馈不清楚的边界、失效链接或新的独立读者问题。

<sub>记录工程实践与验证边界，不构成投资建议。</sub>
