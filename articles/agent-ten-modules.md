---
title: "Agent 进阶：读懂 Open ETF Agent 的十个核心模块"
description: "以 Open ETF Agent v0.15 的实际代码为底座，分组认识运行循环、工具与方法、资料与记忆、会话和专家协作。"
---

# Agent 进阶：读懂 Open ETF Agent 的十个核心模块

> **进阶 · 第 2 站**　[入门](./agent-in-15-minutes.md) → 进阶 → [深入](./open-etf-agent-v010-system-design.md) → 全景

上一篇已经走过一个 Agent Loop：**AI 根据当前信息选择动作，工具返回结果，AI 再决定下一步。**

现在打开 Open ETF Agent 的源码，你会看到更多名字：Gateway、Skill、MCP、Memory、Session、Child。它们为什么出现？怎样接回刚刚看懂的循环？

我们以 [v0.15 固定版本](https://github.com/hpoenixf/open-etf-agent/tree/74bd5aa455ccaeb2994eb22aa744affde660bfa2)为底座，按学习顺序分成十组能力。继续用同一个任务理解它们：比较 Atlas Notes A、B 两版指南，整理免费版导出的变化与共同条件。这是仓库里的合成教学资料。

**先看前三项怎样工作，再看后面的能力怎样逐步接进来。** 十组能力是阅读源码的分组，可以在同一个程序里协作。

## 一、先把循环跑起来

### 1. 模型接入：把一次判断交给 AI

模型负责理解问题、选择工具和组织回答。Gateway 则处理模型服务的请求与响应，让运行程序拿到“调用工具”或“给出答案”这样的结果。

在文档比较中，AI 可以先选择读 A，得到内容后再选择读 B。开发者关心两件事：这次给模型哪些材料，以及怎样接收它提出的动作。

源码入口：[gateway.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/gateway.mjs)。

### 2. Runtime：让一轮判断接上下一轮

Runtime 驱动循环：调用模型，接收动作，交给工具执行，再把结果送入下一轮。一次用户请求里，可以发生多轮这样的往返。

**AI 决定任务接下来做什么，Runtime 负责让这些动作按程序约定运行。** 它也管理工具范围和运行额度。已有结果返回后，AI 才有新材料继续判断。

源码入口：[runtime.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/runtime.mjs)。

### 3. 工具宿主：把模型的请求接到函数

读取页面、计算变化、保存报告，都是具体操作。工具宿主（Tool Host）集中提供这些能力的说明、参数检查和执行入口。

比如 `read_page` 接收文档标识和页码，返回该页内容；`save_report` 接收正文与来源，保存报告。前后端开发者可以从已有函数或 API 开始，再补齐让模型使用的说明。

源码入口：[tools.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/tools.mjs)。

![模型选择下一步，Runtime 串起过程，工具执行具体动作](../visuals/agent-in-15-minutes/03-three-roles-zh.svg)

这三项构成主干。接下来增加的能力，仍然围绕这条循环工作。

## 二、给助手方法，再接上资料

### 4. Skill：告诉助手这一类问题怎样做

比较产品指南，可以先统一版本范围，再整理变化与共同条件，最后按表格表达。把这种可复用的做法写成 Skill，模型就能按需读到方法。

Open ETF Agent 包含比较用的技能说明和辅助清单。读它时，重点看“方法怎样进入任务”，再看模型如何用已有工具完成操作。Skill 的通用格式可以参考 [Agent Skills](https://agentskills.io/home)。

源码入口：[skills.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/skills.mjs)。

### 5. MCP：连接另一个程序提供的工具

当文档由独立服务提供，应用需要发现服务的工具，并按约定调用。MCP 就提供这样的连接协议。

仓库的 `skill-mcp` 示例会读取方法说明，再通过本地 MCP 服务取得合成文档。模型看到的是可用的读页能力，程序负责建立连接与交换结果。[官方架构说明](https://modelcontextprotocol.io/docs/learn/architecture)介绍了这一客户端与服务端关系。

源码入口：[mcp.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/mcp.mjs)。

### 6. 资料与上下文：保存取得的内容，选进下一轮

读取工具取得原文后，Result 保存内容及其来源；Context 组织下一次模型调用需要的材料。资料变多时，检索帮助找到相关位置，压缩帮助整理当前工作的笔记。

可以把原始资料想成书架，把上下文想成工作桌。AI 当前要比较导出功能，就把对应页面放上桌；继续问离线使用时，再寻找相关内容。

源码入口：[context.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/context.mjs)。先理解资料如何进入一次调用，再按需要展开 Result、检索和压缩。

### 7. Memory：让合适的信息跨任务使用

例如用户允许保存“产品比较先给表格”的偏好，后面的任务就可以召回它，再放进当前上下文。

公开实现既有显式保存、更正和遗忘，也有 v0.14 加入的只读记忆消费入口。学习时先关注“保存什么、何时召回、怎样进入本轮输入”。这类偏好与产品指南有不同用途：一个指导表达，一个提供产品事实。

源码入口：[memory.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/memory.mjs)。

## 三、把研究变成能继续使用的工作

### 8. 报告与产物：把分析留下来

用户需要的可能是一段回答，也可能是一份 Markdown 或 CSV。报告与产物模块保存这些内容，阅读入口让人再次查看已经生成的结果。

在 T1 示例里，可以直接打开 `report.md`；涉及表格时，另有 CSV 示例。此时只需理解“模型组织内容、工具保存产物”，具体的版本管理留到相应专文。

源码入口：[artifacts.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/artifacts.mjs)。

### 9. Session 与 Worker：让任务跨一次命令继续

最早的示例在一个进程里完成。任务变长以后，需要保存当前进展，再交给后续执行者继续。Session 记录任务，Worker 驱动选定任务，核心执行仍交给 Runtime。

公开代码还提供普通回复示例：程序提出一个问题，用户通过 CLI 提交回答，再继续原任务。这里可以先体验“任务有自己的进展，用户回答能接回去”，以后再研究更细的持久运行设计。

源码入口：[session.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/session.mjs)。

### 10. 专家 Child：把一块工作交给专门的助手

v0.15 的重点是串行来源核对专家。Main 把核对问题交给 Child；Child 在自己的上下文里读取 A、B 原文，返回资料与核对意见；Main 接着整理报告。

这里最值得理解的是**两个 Loop 怎样交接**：主任务负责整体问题，子任务负责范围更小的核对。Child 使用同一套 Runtime，收到的任务说明和工具范围更专注。

源码入口：[specialist-child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/74bd5aa455ccaeb2994eb22aa744affde660bfa2/src/specialist-child.mjs)。下一篇会沿这条真实代码路径展开。

## 用同一个 v0.15，分三次体验

在[入门篇安装好的 v0.15 环境](./agent-in-15-minutes.md#自己跑一次五分钟体验)中，先分别运行以下命令：

```bash
# 方法说明和 MCP 文档工具
npm run demo -- --case skill-mcp

# 查找并阅读离线使用的相关资料
npm run demo -- --case retrieve-reread --query "offline editing"

# Main 委派一个来源核对专家
node src/specialist-cli.mjs run --session runs/learning-specialist
```

前两次会输出各自的运行目录，可以查看报告。第三次使用一个新的专属 session 目录；它的报告与交接结果，我们在下一篇一起看。默认命令用脚本模拟模型动作，读资料、调用工具、保存文件等程序操作实际执行，无需模型密钥。

这三条是**独立示例**，各自展示一组能力。更多入口见[当前项目指南](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/module-guide.zh-CN.md)。

## 下一站：把资料、执行与协作串起来

现在，你既认识名字，也知道它们接到哪段代码。最有价值的下一步，是跟着一个具体任务看信息怎样穿过这些模块。

**继续阅读：[Agent 深入：从一份报告到持续执行与专家协作](./open-etf-agent-v010-system-design.md)。** 走完这条路径，再进入完整系统全景。

[返回入门](./agent-in-15-minutes.md) · [English](../en/articles/agent-ten-modules.md) · [Open ETF Agent（欢迎 Star）](https://github.com/hpoenixf/open-etf-agent)
