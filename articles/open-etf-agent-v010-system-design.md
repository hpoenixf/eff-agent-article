---
title: "Agent 深入：从一份报告到持续执行与专家协作"
description: "合并原 v0.10 系统设计与 v0.15 专家协作，沿资料、执行和任务分工理解 Open ETF Agent，再进入六层全景。"
---

# Agent 深入：从一份报告到持续执行与专家协作

> **深入 · 第 3 站**　[入门](./agent-in-15-minutes.md) → [进阶](./agent-ten-modules.md) → 深入 → [全景](./017-prompt-to-answer-six-layer-panorama-v3.md)

前两篇已经解释了 AI 怎样决定 Loop 的下一步，以及十个模块各自负责什么。这一篇往前走一步：**资料经过多个工具、任务交给另一个进程、部分工作交给另一个助手时，怎样继续完成同一件事？**

这也是 Open ETF Agent 从 v0.10 演进到 v0.15 的一条阅读主线。原来的系统设计文章与新增专家协作内容在这里合为一篇，保留原链接；[v0.10 原稿](https://github.com/hpoenixf/eff-agent-article/blob/a377164e53e5f63b7a6114d54e2635c084dfbbcd/articles/open-etf-agent-v010-system-design.md)仍可按固定版本阅读。

我们看三个具体问题：资料怎样变成报告，任务怎样持续执行，专家怎样参与主任务。它们对应独立示例，共享同一套执行基础。默认公开命令使用合成资料和脚本模拟的模型动作，实际执行工具、存储与进程交接。

## 一、资料怎样经过计算，进入一份报告？

先看 v0.10 的小例子。一张合成表里有三行数值：**100、999、250**，币种都是 USD，数据日期都是 2026-10-01。任务比较第一行与最后一行，中间的 999 不参与计算。

最直观的做法是把 100 和 250 交给计算器。但当后面还有模型解释、报告和 CSV，这两个数字需要保留来路。

这项能力把过程连起来：**读取原表 → 选定两行 → 计算一次 → 下一轮模型、报告与 CSV 使用同一个结果。**

`read_comparison` 取得资料，Result 保存原始内容。计算请求引用这份结果，指出要使用的选区和行位置。计算器从已保存的原文中取数，得到差值 150、当前值为基准的 2.5 倍、相对增幅 150%，同时保留单位、币种和日期。

生成报告和 CSV 时，程序沿这份计算结果取值。于是，读者能从报告里的数字回到计算，再回到原来的两行资料。模型仍负责解释这些数值意味着什么。

这里的设计选择很实用：已有工具能读取、计算和保存，就补上它们之间的引用关系，让同一个结果继续往下走。[原始提案](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/result-reference-consumption/proposal.md)保留了这个来路。

<details>
<summary>进一步看：v0.10 的选区与计算口径</summary>

计算请求的形状如下，真实 `resultRef` 由读取工具返回：

```json
{
  "resultRef": "读取原表后得到的结果引用",
  "selection": { "offset": 0, "limit": 3 },
  "baselineRow": 0,
  "currentRow": 2
}
```

选区需要覆盖两个操作数。只取得前两行时，第三行就不能作为已取得的输入；日期、币种或分母不符合该计算方法时，也应保持相应限制。数值部分来自原计算，自由叙述仍需结合资料判断。

[独立回读记录](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/docs/verification/result-consumption-independent.safe.json)检查原报告与 CSV；网关编码检查只说明相应材料进入了请求，不替代真实模型的理解评估。

</details>

## 二、提交任务的程序退出了，谁继续工作？

一个短任务可以在一次命令中完成。工作变长后，提交与执行可以分开：先登记任务，再让一个 Worker 接手它。

这个场景里，三个熟悉的模块分工如下：

| 组成部分 | 负责什么 |
| --- | --- |
| Session | 保存任务、已有进展和执行约定 |
| Worker | 驱动一个明确选定的任务 |
| Runtime | 继续原来的模型与工具循环 |

Worker 复用 Session 已有的执行记录，再调用同一套 Runtime。[单 Run 的原始提案](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/openspec/changes/v09-single-run-worker/proposal.md)把方案收窄到这一条清晰路径，避免另建一套重复的任务状态。

这样，命令窗口关掉与研究任务的生命周期就可以分别处理。后续进程接手的是同一个任务，原来的允许范围、已用预算和截止时间一起保留。

原文的 `durable-publication` 用例展示这段交接。它与上一节的计算示例各自运行，帮助我们从两个角度理解同一套程序。

<details>
<summary>进一步看：持续执行的边界</summary>

可恢复的依据是已有执行事实和受支持的检查点。已派发但结果未知的请求不会自动重放；停止 Worker 也不自动成为用户取消。已经提交的正文与已有文件分别保留，后续任务变化不会凭空抹掉它们。

v0.10 使用 `tool-host@2`，持久化的 `tool-host@1` 快照不能由新版 Runtime 续跑或重放，包括已终结的旧 Run。升级前应让活动任务在原版本完成，或隔离保留旧代码与数据。原 Result、Artifact、Publication 的独立读取与执行恢复分别处理。[升级清单](https://github.com/hpoenixf/open-etf-agent/blob/d943dd8452e4a97fbca5e5c74537a05655e73837/docs/upgrade-guide.zh-CN.md)保留具体条件；其中合成旧标签测试不等于真实旧快照迁移验收。

</details>

## 三、再加一位专家，两个 Loop 怎样协作？

v0.15 增加了一个串行来源核对专家。继续用入门篇的 Atlas Notes：Main 负责比较两版指南，Child 专门查看免费导出的限制与条件。

原始资料仍然很简单：A 免费版支持 CSV、上限 120 行；B 支持 CSV 和 Markdown、上限 300 行；两版导出都需要联网。它们来自[固定的合成文档](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/fixtures/documents.json)。

先记住这条路线：**Main 发出核对任务 → Child 读取 A/B → 原文和核对意见回到 Main → Main 整理报告。**

### Main 先提出一个工具调用

[specialist-demo.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-demo.mjs)为 Main 准备任务和可用工具。本例选择 `source_check`，把“核对免费导出限制和共同联网要求”交出去。

从 Main 的 Loop 看，这和选择读页工具很相似：提出动作，等执行结果返回。这里的工具内部会运行一个范围更明确的助手。

### Child 带着自己的材料运行

[specialist-child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-child.mjs)建立交接。Child 得到整体问题、本次核对要求，以及允许读取的 A/B 文档。它只有 `read_page` 工具，最终报告由 Main 组织。

[child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/child.mjs)继续调用项目原有的 `run`。两个助手共用执行机制，各自拥有任务输入和上下文。

| Child 回合 | 动作 | 新得到的材料 |
| --- | --- | --- |
| 第一轮 | 读取 A 版第一页 | A 的导出格式、上限和条件 |
| 第二轮 | 读取 B 版第一页 | B 的对应内容 |
| 第三轮 | 返回核对说明 | 已查看的资料与核对意见 |

每次工具结果进入下一轮输入。接入真实模型时，模型结合当前材料选择后续动作；默认示例用固定动作，让这一连接过程容易观察。

### Main 接回材料，继续自己的下一轮

Child 返回核对说明时，也把取得的原始页面交回来。可以把它想成同事递来一份调查便签，附上查过的原文。Main 既能看重点，也能结合材料形成整体报告。

这些内容作为 `source_check` 的结果进入 Main 上下文。默认示例随后选择 `save_report`，再返回最终答复：

| Main 的推进 | Child 在哪里参与 |
| --- | --- |
| 第一轮：调用 `source_check` | Child 读 A、读 B，返回说明与原文 |
| 第二轮：整理交接内容，调用 `save_report` | 本次专家工作已经结束 |
| 第三轮：给出最终答复 | — |

**AI 的任务选择、Runtime 的循环、工具的执行没有换一套；现在它们可以组织两个相互配合的任务。** Session 关联父任务与子任务，Result 保留原文，报告模块把输出留下来。进阶篇的模块在这里接成了一条可读的路径。

## 四、在同一份 v0.15 代码上体验主线

沿用[入门篇安装好的 v0.15 环境](./agent-in-15-minutes.md#自己跑一次五分钟体验)，使用一个新的专属目录：

```bash
node src/specialist-cli.mjs run --session runs/deep-specialist-v015
```

终端会给出实际的 `runId`。把它填入下面的命令：

```bash
node src/specialist-cli.mjs read --session runs/deep-specialist-v015 --run RUN_ID
```

先看 `child.summary`、`sources`、`report.text`：分别是专家说明、取得的页面和报告正文。默认报告会列出核对说明和两版原文，适合对照交接过程。已经跑过进阶篇的专家示例，也可以直接使用那个目录与 `runId`。

读源码时按四个入口走：**[specialist-cli.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-cli.mjs) → specialist-demo.mjs → specialist-child.mjs → child.mjs**。先弄清谁把什么交给谁，再进入 `runtime.mjs`。

<details>
<summary>复现原 v0.10：计算结果与独立 Worker 两个示例</summary>

以下保留原文的固定版本。另建目录，避免与上面的 v0.15 工作区混用；Node.js 26.11.1 可对齐该历史验证环境。

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-v010
cd open-etf-agent-v010
git switch --detach ff5b9273ef0d239e804f61792702cd2e94174be7
npm ci --ignore-scripts --no-audit --no-fund
npm run build
node dist/src/cli.mjs --case result-consumption --output runs/article-v010
```

沿实际输出目录查看报告、来源清单与 CSV。Worker 示例使用另一个新的 Session 目录，连续执行：

```bash
node dist/src/session-cli.mjs submit --session runs/article-worker --run original-example --case durable-publication
node dist/src/session-cli.mjs work --session runs/article-worker --run original-example
node dist/src/session-cli.mjs publication --session runs/article-worker --run original-example
```

这个示例的 30 秒截止时间从提交开始计算。它展示提交进程退出、独立进程执行、原正文读取；原有恢复条件见[Worker 用例](https://github.com/hpoenixf/open-etf-agent/blob/ff5b9273ef0d239e804f61792702cd2e94174be7/test/worker-process.test.mjs)。默认示例离线运行，安装依赖可能访问 npm。

</details>

## 下一站：把具体路径放回全景

现在可以从三个角度理解系统：**资料沿引用关系继续使用，执行沿同一个任务继续推进，专家围绕清楚的问题参与协作。** 前两篇认识的模块，因此有了具体位置。

继续阅读：[**从一次提问到答案可见：ETF Agent 六层调用全景**](./017-prompt-to-answer-six-layer-panorama-v3.md)。先找到入口、上下文、Main/Child 和工具，再按需要展开其他部分。全景覆盖更大的系统范围，公开实现以各篇的固定代码为准。

[返回进阶](./agent-ten-modules.md) · [当前开源入口](https://github.com/hpoenixf/open-etf-agent) · [English](../en/articles/open-etf-agent-v010-system-design.md) · [工程文集（欢迎 Star）](https://github.com/hpoenixf/eff-agent-article)
