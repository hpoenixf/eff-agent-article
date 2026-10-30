---
title: "Agent 深入：跟着 v0.15 跑一次专家协作"
description: "沿 Open ETF Agent v0.15 的真实示例，理解 Main 委派 Child、两个 Agent Loop、上下文分工与报告生成，再走向完整系统全景。"
---

# Agent 深入：跟着 v0.15 跑一次专家协作

> **深入 · 第 3 站**　[入门](./agent-in-15-minutes.md) → [进阶](./agent-ten-modules.md) → 深入 → [全景](./017-prompt-to-answer-six-layer-panorama-v3.md)

上一站认识了十个模块。这次我们打开 [Open ETF Agent v0.15](https://github.com/hpoenixf/open-etf-agent/tree/74bd5aa455ccaeb2994eb22aa744affde660bfa2)，沿一条真实存在的示例，看看它们怎样接起来。

任务依然很小：比较 Atlas Notes 两版合成指南，**请一位来源核对专家检查免费导出的限制，再由主助手整理报告。**

这条路径会经过 Main、Child、各自的上下文、工具、Session 和报告模块。默认 CLI 用脚本模拟模型动作，方便直接运行；同时使用项目实际的 Gateway、Runtime 和文件操作。

## 先把任务放在眼前

两份教学指南的第一页已经包含需要的内容：

| 比较项 | A 版免费版 | B 版免费版 |
| --- | --- | --- |
| 导出格式 | CSV | CSV、Markdown |
| 单次导出上限 | 120 行 | 300 行 |
| 导出条件 | 需要联网 | 需要联网 |

资料见[固定版本的文档文件](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/fixtures/documents.json)。Main 负责整体任务，Child 专门查看这些限制与条件。这里采用一个主助手、一个串行专家的分工。

**先记住这条路线：Main 提出核对问题 → Child 读取 A/B → 资料和意见回到 Main → Main 保存报告。**

## 先运行，再沿输出读代码

沿用[入门篇的 v0.15 安装环境](./agent-in-15-minutes.md#自己跑一次五分钟体验)，使用一个新的练习目录：

```bash
node src/specialist-cli.mjs run --session runs/deep-specialist-v015
```

终端输出会包含本次任务的 `runId` 和运行目录。把真实的 `runId` 填入下一条命令：

```bash
node src/specialist-cli.mjs read --session runs/deep-specialist-v015 --run RUN_ID
```

读回结果时，先看三个内容：`child.summary` 是专家的核对说明，`sources` 是取得的原始页面，`report.text` 是报告正文。这份离线示例的报告会列出 Child 的说明和两版原文，适合边看内容边理解交接。

如果已经运行过进阶篇的专家示例，也可以用那个 session 目录和 `runId` 直接查看。重复做新实验时，另选一个新目录。

## 第一步：入口为 Main 准备一次任务

[入口文件 specialist-cli.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-cli.mjs)接收 `run` 或 `read` 命令。真正组装示例的是 [specialist-demo.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-demo.mjs)：它打开 Session，提供任务要求，准备 Gateway，再注册来源核对工具。

Main 可以使用 `source_check`、`save_report` 和 `read_page`。本例先走 `source_check`，把“核对免费导出限制和共同联网要求”交给专家。

这和入门时选择 `read_page` 很相似：**从 Main 的 Loop 看，它提出了一个工具调用，接下来等这个调用返回材料。** 只是这次工具内部会运行一个更专注的 Agent。

## 第二步：把范围明确的小任务交给 Child

[specialist-child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-child.mjs)负责这次交接。Child 得到整体问题、这次核对的具体要求，以及允许读取的 A、B 文档。

Child 的工具范围更小：只有 `read_page`。它专注取得资料和给出核对说明，最终报告留给 Main 整理。

于是，两个助手的工作桌不同。Main 关心完整比较任务；Child 关心导出限制，需要的是核对方法和对应原文。**分工首先发生在问题、上下文和工具范围上。**

这对开发者也很直观：当某块工作有清楚的输入和输出，就可以考虑让一个专门助手处理它。

## 第三步：Child 自己也跑一个 Loop

[child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/child.mjs)继续调用项目原有的 `run`。Child 和 Main 共用执行机制，各自拥有任务输入和上下文。

默认示例的 Child 分三轮推进：

| Child 回合 | 动作 | 进入后续判断的材料 |
| --- | --- | --- |
| 第一轮 | 读取 A 版第一页 | A 版导出格式、上限和条件 |
| 第二轮 | 读取 B 版第一页 | B 版对应内容 |
| 第三轮 | 返回核对说明 | 已查看哪些资料，以及核对意见 |

每次读页后，结果回到 Child 的下一轮输入。接入真实模型时，这些步骤由模型根据当前材料选择；默认演示用固定动作让程序连接容易观察。

**子代理也遵循“选择动作 → 工具执行 → 结果返回”的循环。** 有了入门篇的理解，这里增加的主要是任务分工。

## 第四步：把原文与核对意见交回 Main

Child 结束这段工作后，交接模块把取得的页面和核对说明一起送回 Main。Main 能看到专家说了什么，也能继续使用对应的原文。

可以把它想成同事交来一份调查便签，同时附上查过的材料。便签帮助快速抓住重点，材料帮助主任务形成自己的整体解释。

在代码里，这些内容作为 `source_check` 的结果回到 Main。**Main 随后继续自己的下一轮，而不是从头重新开始一次任务。**

## 第五步：Main 形成报告，结束这次工作

在默认示例里，Main 收到交接内容后提出 `save_report`，把专家说明与原始页面整理进报告；取得保存结果后，再给出最终答复。

把主、子两个循环摊开，就能看到协作发生的位置：

| Main 的推进 | 期间发生的 Child 工作 |
| --- | --- |
| 第一轮：调用 `source_check` | Child 读 A → 读 B → 返回说明和原文 |
| 第二轮：使用交接内容，调用 `save_report` | 本次专家工作已经结束 |
| 第三轮：返回最终答复 | — |

模型服务接入、工具执行、结果进入上下文、报告保存，都在原来的模块之间流转。Session 将父任务和子任务关联起来，让这次协作可以被定位和查看。

这就是 v0.15 比最初单个 Loop 更值得研究的地方：**同一套运行基础，已经能组织两个相互配合的任务。**

## 沿四个文件读，比从目录开始容易

打开代码时，按任务方向读即可：

| 文件 | 先回答这一个问题 |
| --- | --- |
| `specialist-cli.mjs` | 命令怎样进入程序？ |
| `specialist-demo.mjs` | Main 得到了什么任务和工具？ |
| `specialist-child.mjs` | 子任务怎样建立，结果怎样返回？ |
| `child.mjs` | Child 怎样带着自己的输入运行同一套 Loop？ |

然后再进入 `runtime.mjs`，你会更容易辨认模型调用、工具执行和下一轮输入各在什么地方。完整文件都在[固定版本的 src 目录](https://github.com/hpoenixf/open-etf-agent/tree/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src)。

## v0.15 的其他能力，可以按问题继续看

专家协作是一条适合串联模块的主线。需要回答其他问题时，可以换一个独立示例：想看用户怎样补充信息，读[普通回复](./agent-durable-human-interaction-response-adoption.md)；想看后续任务怎样读取偏好，读[记忆](./026-agent-memory-forget-durable-effects.md)；想看报告与计算如何衔接，读[结果消费](./financial-agent-python-result-consumption.md)。具体命令以各篇对应版本为准。

这些能力有自己的入口。先理解眼前这一条主线，再选择需要的扩展，代码会更容易读。

## 下一站：从这条路径走向全景

到这里，你已经逐步看过：一个 Loop 怎样运行，十组能力怎样加入，以及两个任务怎样在同一套程序中协作。

**继续阅读：[从一次提问到答案可见：ETF Agent 六层调用全景](./017-prompt-to-answer-six-layer-panorama-v3.md)。** 先在图里找到入口、上下文、Main/Child 和工具，再按兴趣展开其他部分。全景描绘更大的系统范围，公开版本的具体实现仍按各篇源码入口阅读。

[返回进阶](./agent-ten-modules.md) · [English](../en/articles/agent-loop-to-application.md) · [Open ETF Agent（欢迎 Star）](https://github.com/hpoenixf/open-etf-agent)
