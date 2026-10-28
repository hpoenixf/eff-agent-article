---
title: 从第一份可回读报告开始：Open ETF Agent v0.1
description: 从固定源码运行离线示例，理解资料身份、工具执行、部分写入与独立文件回读，并区分真实模型拒绝观察的已知和未知。
---

# 从第一份可回读报告开始：Open ETF Agent v0.1

> 想了解后续的系统设计，可先读[从第一份报告到可恢复的研究程序：Open ETF Agent 的第二个阶段](./open-etf-agent-v010-system-design.md)。本文保留 v0.1 的工程起点。

读完一篇 Agent 架构文章，最容易留下的问题是：这些模块放在一起，究竟怎样运行？

我们已经写过工具调用、上下文、记忆、子代理和发布系统。但如果从第一天就把它们全部装进公开工程，读者很难分清：哪一部分是完成任务必需的，哪一部分是在后来的问题里才长出来的。

所以，Open ETF Agent 从一件更小的事开始：**读取两份资料，完成一次比较，把报告保存下来，并让另一个进程读回同一份文件。**

v0.1 已经公开了这条工程路径。默认示例使用脚本代替模型选择动作，真实执行读取、计算与保存；它让我们检查程序怎样工作，还不能据此判断真实模型会不会读懂资料。这篇先把第一条路径讲清楚，后续再回到已有的模块文章，逐步补上对应源码。

## 当前可以从哪里继续（截至 2026-10-28）

截至 **2026-10-28**，最新公开的编号版本是 **v0.13.0 普通持久回复**：一个问题先保存并让出执行租约，收到的原回复再由同一个 Run 显式恢复采用，沿原工具结果进入请求和报告。日常入口见[当前 main README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md)，本例对应[固定 v0.13 源码](https://github.com/hpoenixf/open-etf-agent/tree/300f78f7066ab76fcc4e9efb54137ff021ecc278)；具体命令和“收到不等于采用”的分界见[既有人机交互文章](./agent-durable-human-interaction-response-adoption.md)。这一最小路径不包含 Human Park、自动唤醒、审批或账号身份平台，等待也不刷新预算与截止时间。此前的[固定 v0.12 Temporal 源码](https://github.com/hpoenixf/open-etf-agent/tree/46c2822be9865b99696bb70fb9e0ff1b5257ff35)、[固定 v0.11 PDF 源码](https://github.com/hpoenixf/open-etf-agent/tree/b11f70e57121f5c80a15893d6ba5e10d447d4e6c)、[固定 v0.10 Result / Reference 快照](https://github.com/hpoenixf/open-etf-agent/tree/ff5b9273ef0d239e804f61792702cd2e94174be7)与[固定 v0.9 Worker 快照](https://github.com/hpoenixf/open-etf-agent/tree/dad9c6e64f32c3d7579aea96613776b40917ec6d)仍保留。时间冻结的例子仍见[时间语义文章](./agent-temporal-semantics-market-calendar.md)；下面保留 v0.1 的起点与当时边界，不把后来的能力写回第一版。

[v0.11 PDF 固定资格快照](https://github.com/hpoenixf/open-etf-agent/tree/1de10d40b69db9a83ff990c32e8e272121052814)保留对应的[固定执行证据](https://github.com/hpoenixf/open-etf-agent/tree/e1b8e4edde724548fab16d8ca4b205379bfa7f30)，不是随 main 浮动的 HEAD。具体可运行范围与排除项见[既有 PDF 文章](./024-agent-pdf-from-text-to-evidence.md)。这里的稳定仅指有边界的无模型 Runtime 与交付验证，不等于正式 Release、云部署、模型质量保证或完整 PDF Reader；OCR、页图、布局、多模态与活跃解析恢复均不在本版范围内。

公开实现已经从文件回读，走到不可变附件、SQLite 检查点恢复和持久正文。Publication 保留原正文块、投递位置与修订回执，提交后的正文不会被后续 Run 失败抹掉；机制仍见既有[正文发布文章](https://hpoenixf.com/eff-agent-article/articles/019-agent-answer-publication)。v0.9 增加的 **单 Run Worker** 让提交进程先退出，再由另一进程按原身份、额度和截止时间驱动同一个 Runtime；它不是一套新队列，也没有顺带实现整套定时研究。

选定上述快照并按 README 安装构建后，依次执行 `node dist/src/session-cli.mjs submit --session runs/article-v09 --run original-example --case durable-publication`、`node dist/src/session-cli.mjs work --session runs/article-v09 --run original-example`，再以 `node dist/src/session-cli.mjs publication --session runs/article-v09 --run original-example` 读取原正文与回执。示例的 30 秒截止时间从提交开始；[对应的进程用例](https://github.com/hpoenixf/open-etf-agent/blob/dad9c6e64f32c3d7579aea96613776b40917ec6d/test/worker-process.test.mjs)还检查了停止、竞争与提交后退出的边界。资料和模型动作仍是合成脚本，SQLite 提交与进程间回读则真实发生；下文的真实模型观察仍只属于它原来的版本。

Worker 停止不等于用户取消，未知请求也不能靠换一个进程自动重试。这层最小机制已补进既有[定时研究文章](https://hpoenixf.com/eff-agent-article/articles/agent-autonomous-scheduled-research)，而日历、条件触发与通知不在本版范围内。旧 0.10 只读适配因没有独立消费者而取消，不改名为 Web。已完成的 **Result / Reference 消费模块**按顺序编号为[v0.10 固定公开代码](https://github.com/hpoenixf/open-etf-agent/tree/ff5b9273ef0d239e804f61792702cd2e94174be7)：从明确的原始选区计算，让下一请求、报告与 CSV 使用同一结果；示例和边界补进[结果消费文章](https://hpoenixf.com/eff-agent-article/articles/financial-agent-python-result-consumption)。原计划 1.1 的这项最小增量已纳入 v0.10，不再排第二遍；1.0 仍是尚未宣布完成的稳定里程碑。升级前须阅读 [`tool-host@2` 恢复兼容说明](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/result-reference-consumption/design.md)。

## 先选一个能核对的问题

示例不是个人持仓，也没有调用行情服务。我们编写了两份合成产品指南，分别描述 Atlas A、B 两个版本。

问题很简单：

> 免费版的导出能力有什么变化？哪些条件没有变化？把比较结果和来源一起保存。

A 支持 CSV，B 增加 Markdown，两者导出时都需要联网。指南同时写了企业版能力，因此“B 支持某功能”不能自动推出“B 的免费版支持该功能”。

另一道问题比较导出上限：A 每次 120 行，B 每次 300 行。这里必须保留三个不同结果：

| 问题 | 结果 |
| --- | --- |
| B 比 A 多多少？ | 180 行/次 |
| B 是 A 的多少倍？ | 2.5 倍 |
| 增量相对于 A 是多少？ | 1.5，即 150% |

这些数字的作用不是证明系统会投资，而是让读者看到：原始输入、单位、分母和报告表达需要分别核对。换成金融资料，这些区分同样重要，但这个阶段不借合成产品例子声称已经完成真实投研。

本阶段只验 Runtime：参数和来源是否保真，执行或拒绝是否合法，预算、状态、部分效果与文件回执是否准确。模型把一句话说错了，可以留下观察，但不据此判 Runtime 失败，也不靠反复改 Prompt 把答案刷成“通过”。

完整问题与材料都在[固定版本的 fixtures](https://github.com/hpoenixf/open-etf-agent/tree/f9370b81beef84199293120ee23d245bb0129553/fixtures)里，读者不必先准备账号或私人数据。

## 只留下三项核心职责

这一版没有数据库、后台服务或插件系统。CLI 接收任务，循环围绕三个组件工作：

- **模型网关（Gateway）**：将响应整理成“提出工具调用”或“给出最终文本”。协议没结束、参数 JSON 不完整，都不能变成可执行动作。
- **运行时（Runtime）**：保留消息、配对调用与结果，检查轮数、工具额度、超时和取消。
- **工具宿主（Tool Host）**：定义可用工具，验证参数，执行读取、计算和保存，并返回真实效果。

模型可以提出 `read_page`、`calculate_change`、`save_report`。它不能自选文件路径，也不能只在回答里写一句“报告已保存”，就让运行时产生成功回执。

这延续了“先用足够简单的组合，再按需要增加复杂度”的思路。Anthropic 在 2024 年的 [Building effective agents](https://www.anthropic.com/research/building-effective-agents) 中也讨论过这种取舍。这里的具体选择，是让第一版只解决本地资料到报告的交接；以后新增能力，要有新的问题支持，而不预先搭一整套平台。

源码入口可以直接按执行方向阅读：[cli.mjs](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/cli.mjs) → [runtime.mjs](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/runtime.mjs) → [tools.mjs](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/tools.mjs)。不需要先理解几十个模块名。

## “读过”需要留下具体身份

`read_page` 返回的不只是一段正文，还包括文档标识、版本、物理页码和正文哈希。工具宿主记录本次运行实际取得的页面。

保存时，模型只能引用这个集合里的来源标识。未知来源、重复来源、模型自己拼出的文件路径，都不会成为合法保存请求。

这解决了一个很具体的问题：报告交到另一个人手里后，他能够找到当时取得的页面内容，而不是重新打开已经变化的“最新版本”。

不过，**一页资料确实被读过，仍不意味着报告中的每一句话都由它支持。** v0.1 的保存检查负责来源身份，不替模型判断语义。报告是否混淆免费版和企业版、是否遗漏“必须联网”，仍是另外的阅读与内容判断。

示例中的动作和文字由[透明的脚本适配器](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/src/fixture-gateway.mjs)给出。它会先提出读页，再通过真实工具计算或保存；没有把预先准备的报告文件直接复制成“运行成果”。这样的脚本能稳定暴露工程接缝，但不能被当成真实模型理解材料的证据。

## 一个真实修复：文件已经写了，任务却失败了

最早做保存路径时，我们希望报告和来源清单一起出现：`report.md` 保存正文，`manifest.json` 保存来源快照与文件回执。

独立审查构造了一个小故障：预先占住 manifest 的目标位置。运行后，报告文件确实写成了，第二步却因不能覆盖已有文件而失败。

如果只返回“工具失败”，调用方就看不到磁盘上已经发生的变化；如果返回完整成功，又会把缺失的来源清单隐藏起来。自动重试也不合适，因为第一次写入的文件仍然存在。

修复没有把两次文件写入包装成一场不存在的事务，而是让已知的部分效果一路传到 Runtime：

```json
{
  "status": "failed",
  "receipt": null,
  "partialEffects": [
    {
      "callId": "save",
      "name": "save_report",
      "partialPaths": ["report.md"]
    }
  ]
}
```

这是测试中实际返回结果的节选：报告保留，原先占位的 manifest 不被覆盖，完整保存回执为空。调用方知道应该先查看已有文件，而不是盲目再写一次。

对应的[回归用例](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/test/review.test.mjs)保留了这个故障。它是本地受控实验，不是生产事故。对这个小版本来说，重要的进展是：失败结果终于能够准确描述已经发生的事情。

同一次审查还发现，拒绝符号链接祖先之前，不应先创建后代目录。当前实现先检查已有祖先，再逐层创建目录。这个保护面向单用户可信输出根，并不是对抗同一用户恶意进程的操作系统沙箱。

## 怎么确认读到的是刚才保存的文件

一次正常运行会生成独立目录，其中有：

```text
report.md
manifest.json
run.jsonl
```

manifest 保存来源快照，也保存报告的字节长度和 SHA-256。验证时，先让 CLI 子进程退出，再由测试读取报告原字节，与回执核对。这个读取过程不会再次调用模型，也不会重新生成一份看起来相同的答案。

这里的“独立回读”是测试实际做的事，不是 CLI 隐藏启动了一个阅读服务，也不能说明用户已经在浏览器中打开报告。JSONL 用来诊断过程，还不是能恢复执行的检查点。

这个区别决定了下一阶段应该补什么：需要浏览器阅读，就增加阅读和下载路径；需要中断续跑，再增加执行身份和恢复协议。不能因为文件已存在，就把这些能力一并算上。

## 在固定版本上运行

以下命令面向一个新的本地目录。使用 Node 26.11.1–26.x；v0.1 没有第三方依赖。

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git switch --detach f9370b81beef84199293120ee23d245bb0129553

npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm test
npm run demo -- --case document-compare --output runs/article-v01
```

查看 CLI 输出中的各个 `directory`，就能找到报告、来源清单和诊断记录。只想看数字口径，可以运行 `npm run demo -- --case T3`；只关注原文件回读，可以阅读 `test/cli.test.mjs` 中进程退出后的校验。

这些离线命令已有[固定版本的执行记录](https://github.com/hpoenixf/open-etf-agent/blob/f9370b81beef84199293120ee23d245bb0129553/docs/verification/observations.md)。该快照的 CLI 仍阻止 live 请求，默认示例不会偷偷调用模型。下面的真实观察来自另一个受限验证入口，不能拿来改写默认命令的性质。

## 接上真实模型以后：一次没有报告的观察

后续验证用单独的适配器调用了原 v0.1 的 Gateway 和 Runtime，而不是把新版实现套在旧版名字下。适配器限制请求与输出，使用同一份合成资料；它不是上述固定快照的默认 CLI。过程与范围保留在[验证摘要](https://github.com/hpoenixf/open-etf-agent/blob/d075068ac99a6c798d012c46bff4fe0c33eb9979/docs/verification/live-v01-v05-first-batch.md)和[安全记录](https://github.com/hpoenixf/open-etf-agent/blob/d075068ac99a6c798d012c46bff4fe0c33eb9979/docs/verification/live-v01-v05-first-batch.safe.json)里。

这次运行实际取得了 A、B 的第一页。两次模型请求都返回 HTTP 200，随后提出的 `calculate_change` 却在 Tool Host 校验时被拒绝，没有进入计算执行，也没有生成报告。运行停在 `TOOL_REJECTED`，没有拿“请求成功”冒充“任务完成”。

但原诊断记录没有留下被拒绝的具体参数和精确校验错误。我们因此只能确认“拒绝发生在派发前”，不能复盘那份输入究竟是否合法，更不能倒推一个听起来合理的根因。拒绝本身不是 Runtime Bug；没有派发，也不足以证明那一次拒绝完全正确。这一缺口必须保留。

后续适配器已经补上安全的提议追踪：记录必填字段是否齐全、数值是否有限、字段类型和单位形状等事实，不保存任意模型正文、凭据或请求头。这能让下一次相同路径更容易核对，但不能补回过去丢失的参数。下一步要检查的是 Host 有没有按原规则执行或拒绝，而不是重试到模型交出一份好看的报告。

这次真实运行没有验证出报告保存路径，更没有触达后续版本的 Skill、MCP、Child、Memory 或压缩。离线示例中的真实文件回读，和这次真实模型下未完成的保存，是两份不同的证据；两者都保留原样，才知道还缺什么。

## 接下来，沿着原来的模块文章继续

v0.1 单独成篇，是为了给整个系列一个能开始动手的入口。它回答的是：最少保留哪些职责，才能把资料、一次执行和一份可回读报告连起来。

后续不必每个版本再写一篇同义架构总论。方法与工具接入回到 [MCP 文章](https://hpoenixf.com/eff-agent-article/articles/mcp-host-from-discovery-to-consumption)，原文外置回到[结果与上下文文章](https://hpoenixf.com/eff-agent-article/articles/tool-results-outside-model-context)，摘要和长期偏好分别回到 [Main 压缩](https://hpoenixf.com/eff-agent-article/articles/agent-main-run-context-compaction)与 [Memory](https://hpoenixf.com/eff-agent-article/articles/026-agent-memory-forget-durable-effects)。

这些文章会保留自己的问题和历史，再补对应版本的最小可运行实现。高级机制尚未进入公开代码时，就继续明确它的范围，不用一个相似的函数名充当完整覆盖。

希望读者每次读完，都能找到一条具体路径：运行例子，读懂关键分支，再改动它观察结果。[公开工程仓库](https://github.com/hpoenixf/open-etf-agent)会保留这些固定阶段；如果这种从小问题逐步展开的方式对你有帮助，欢迎 Star 或提出可复现的问题。

<!-- agent-article-sync:guidance:start -->
完整英文版：[Start with a Report You Can Read Back](../en/articles/open-etf-agent-v01-first-readable-report.md?lang=en)。更多文章见[阅读目录](../catalog.md)与[公开文集](https://github.com/hpoenixf/eff-agent-article)，欢迎 Star 关注后续模块与代码的对照。
<!-- agent-article-sync:guidance:end -->
