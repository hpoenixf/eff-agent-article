---
title: "十五分钟入门 Agent"
description: "写给有一点前后端基础的开发者。用一个可运行的文档比较案例，轻松理解 Agent 的工作方式、模型、Runtime 与工具。"
---

# 十五分钟入门 Agent

如果你写过接口、调过 API，或者用 JavaScript 做过自动化脚本，就能很快理解 Agent。

**你可以把 Agent 想成一个会推进任务的助手：它理解目标，选择下一步，使用工具，再根据得到的信息继续工作。**

下面只用一个例子、三张图，把这件事讲清楚。

![一眼看懂 Agent：用户提问、选择下一步、使用工具、整理结果](../visuals/agent-in-15-minutes/01-agent-at-a-glance-zh.svg)

## 一个熟悉的任务：比较两份文档

假设你收到一个需求：

> **“帮我对比 A、B 两版产品指南：免费版支持哪些导出格式？两版有什么共同限制？”**

这是 [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) 开源项目里的合成教学案例，产品叫 *Atlas Notes*。两份文档里的信息很简单：

- **A 版：** 免费版支持 CSV 导出。
- **B 版：** 免费版支持 CSV 和 Markdown 导出。
- **共同条件：** 导出时都需要联网。

如果让你处理，大概也会先读 A 版，再读 B 版，接着整理变化和共同点。Agent 也是沿着这条思路推进任务。

![文档比较示例：读 A 版、读 B 版、比较变化与共同点、生成简明说明](../visuals/agent-in-15-minutes/02-document-compare-zh.svg)

**最终可以得到这样一段说明：**

> B 版在 CSV 之外新增了 Markdown 导出。两版免费导出都需要联网。

这个例子很小，却已经包含了 Agent 的基本动作：理解要求、读取资料、整理信息、生成结果。

## Agent 里面，谁在做这些事？

把一个基础 Agent 拆开，只需要先认识三个角色。

![三个关键角色：模型决定下一步，Runtime 组织过程，工具执行动作](../visuals/agent-in-15-minutes/03-three-roles-zh.svg)

**模型（Model）**负责理解问题，并选择下一步。它可能决定先读取文档，拿到内容后再整理回答。

**运行程序（Runtime）**负责把步骤串起来。它把用户的问题、已有资料和工具结果组成下一轮要用的**上下文（Context）**，让 Agent 能接着刚才的工作继续。

**工具（Tools）**负责做具体的事。读取文件、查询数据库、调用接口或计算，都可以封装成工具。对前后端开发者来说，它们就是有明确输入和输出的函数。

三者配合后，就形成了最常见的工作过程：**模型选择动作 → 程序调用工具 → 工具返回信息 → 模型继续处理。**

理解了这个循环，再看其他 Agent 框架，就容易抓住主线。

## 自己跑一次：五分钟体验

上面的文档比较有可运行的开源示例。使用 [Open ETF Agent v0.6](https://github.com/hpoenixf/open-etf-agent/tree/7480b656b18192e6d6b44aab65255b970d58e6f8)，准备好 Node.js 26.11.1–26.x，然后在终端执行：

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout v0.6.0-dev.0
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run demo -- --case T1
```

运行后，终端会给出本次任务的目录。打开其中的 `report.md`，就能看到刚才的文档比较结果和对应来源。

这个版本的默认示例用**脚本模拟模型选择动作**，让你不用配置模型密钥也能体验完整的工具执行过程。以后接入真实模型时，仍然围绕同一套“选择下一步、使用工具、利用结果”的思路开发。

## 接下来，读懂完整 Agent 系统

到这里，你已经有了一张入门地图：**用户给目标，模型想下一步，Runtime 组织过程，工具完成动作。**

如果你想继续了解多轮对话、上下文管理、子代理和前端交互，可以再读进阶版：[**《从一次提问到答案可见：ETF Agent 六层调用全景》**](/articles/017-prompt-to-answer-six-layer-panorama-v3)。它会把这里的简单流程扩展成完整系统。

[Open ETF Agent 源码与示例](https://github.com/hpoenixf/open-etf-agent) · [English version](/en/articles/agent-in-15-minutes) · [工程文集（欢迎 Star）](https://github.com/hpoenixf/eff-agent-article)