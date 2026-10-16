# ETF Agent 技术文章

围绕 ETF Agent 的系统设计、授权边界、研究流程、失败恢复、评测和答案交付。正文为 Markdown，文章间引用使用仓库内相对链接。

## 全景导读

- [一句“帮我看看组合”，怎样走过 ETF Agent 的六层系统](articles/017-prompt-to-answer-six-layer-panorama.md)

## 四篇主线

- [010 一个 Agent 为什么必须先装刹车](articles/010-agent-first-brakes.md)
- [011 模型会理解，代码才授权](articles/011-model-understands-code-authorizes.md)
- [别让兜底回答伪装成功：流式 Agent 的阶段预算、失败终态与安全恢复](articles/honest-agent-failure-semantics.md)
- [大模型有返回等于 Agent 成功运行吗？](articles/honest-agent-evaluation.md)

## 专题文章

- [一个 ETF 投资助手，为什么先变成了工程问题](articles/001-one-week-4-billion-tokens-etf-investment-agent.md)
- [源端有 50 条，模型只看到了 20 条：一次 Agent 静默截断排查](articles/partial-is-not-complete.md)
- [数据过期后，Agent 应该怎样刷新，而不是反复重试？](articles/unavailable-is-correct.md)
- [绿了，但并不是真的：如何让测试无法伪造生产边界](articles/green-tests-can-lie.md)
- [别再把 Agent 失败都算给模型：一次从粗错误码到失败链的排查](articles/agent-failure-is-a-boundary-problem.md)
- [Agent 查了很多资料，为什么还是交不出答案？](articles/agent-runtime-constraint-governance-v2.md)
- [Runtime 不知道的，不要因为能写一个规则，就假装它知道](articles/runtime-natural-language-boundary-article-v2.md)
- [为什么 AI 明明有很多引用，回答还是不够可靠？](articles/ai-citations-do-not-prove-reliability.md)
- [从“搜得到”到“读得下去”：我们怎样让 Agent 学会浏览网页](articles/021-agent-web-research-from-search-to-deep-reading.md)
- [为什么我们把 Agent 的 Entry 越做越简单？](articles/022-agent-entry-from-intent-to-direct-research.md)
- [别再让模型当状态机：一次 Agent 协议减负实践](articles/runtime-model-protocol-boundary-agent-article-v2.md)
- [从让模型少想一点，到让 Runtime 少管一点：重新理解 Agent、Runtime、MCP 与 Skill 的分工](articles/agent-model-runtime-mcp-skill-boundaries.md)
- [一个金融数据 MCP，为什么长成了研究决策系统](articles/mcp-market-responsibility-retrospective.md)
- [工具查到的数据，为什么不一定要给大模型看？](articles/tool-results-outside-model-context.md)
- [从工具调用到模型输入：把 Agent 的观测链路接起来](articles/agent-tool-lifecycle-and-model-input.md)
- [从工具调用到自适应研究：让 Agent 边查、边算、边调整](articles/adaptive-research-python-workbench.md)
- [Agent 扩展如何接入 Host：插件生命周期与运行时边界](articles/020-agent-extension-host-smartphone.md)
- [Agent 已经生成答案，为什么还需要一个独立的发布系统？](articles/019-agent-answer-publication.md)
- [Agent 发布治理为什么做了两次？问题不只是校验太严格](articles/023-agent-publication-governance-retrospective.md)
- [Agent 的渐进式回答：怎样保持研究过程连贯](articles/agent-progressive-answer-coherence.md)

## 架构图与图文版

[六层系统全景 HTML 图文版](visuals/017-prompt-to-answer-six-layer-panorama/index.html) 包含 15 张内嵌 SVG 架构图，可下载后离线阅读。

![ETF Agent 六层职责与一次研究的交接全景](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/overview.svg)

单图目录：

- [overview](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/overview.svg)
- [identity](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/identity.svg)
- [research](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/research.svg)
- [subagent](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/subagent.svg)
- [context](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/context.svg)
- [background](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/background.svg)
- [execution](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/execution.svg)
- [hooks](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/hooks.svg)
- [evidence](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/evidence.svg)
- [calculation](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/calculation.svg)
- [delivery](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/delivery.svg)
- [continuity](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/continuity.svg)
- [control](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/control.svg)
- [observation](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/observation.svg)
- [evaluation](visuals/017-prompt-to-answer-six-layer-panorama/diagrams/evaluation.svg)
