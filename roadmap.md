---
title: 写作预告
description: 新文章的独立读者问题、准备状态及需要补齐的证据，不代表已发布。
---

# 下一篇写什么？

<p class="eyebrow">EDITORIAL PIPELINE · 2026.10.20</p>

这里记录的不是功能许愿清单，而是**值得独立写成一篇文章的问题**。已有草稿也不等于成熟度评估通过；不会凭空承诺发布日期，更不会把内部故障记录直接公开。新的文章只有在形成独立读者价值、复核事实和脱敏之后，才进入[正式目录](./contents.md)。

## 已有素材，等待编辑复核

### 01 · Python 为什么不该变成另一套取数系统？

<span class="preview-tag">已有草稿 · 待评估</span>

隔离计算、受控输入、研究工作区、文件导出和原有数据授权的接缝。模型可以自由计算，但不能顺带获得服务器凭据、任意网络权限或投资账本写入权。

读前：[Adaptive Research 与 Python 接续](./articles/adaptive-research-python-workbench.md)。

### 02 · 遗忘已提交，模型回答却失败，算谁失败？

<span class="preview-tag">已有草稿 · 待修改</span>

Memory 保存、更正、遗忘的持久回执，与新会话真实消费、旧版本撤权之间的三种事实。不把受控测试的成功冒称所有 Live 使用场景已经验收。

读前：[失败终态与恢复](./articles/honest-agent-failure-semantics.md)。

### 03 · 文档撤权之后，旧答案还能不能继续披露？

<span class="preview-tag">已有草稿 · 待修改</span>

检索、首发和历史回放具有不同的来源与读权限问题。精修时需区别历史 RAG 授权方案与当前的 Run 授权生命周期，避免过时机制被当作现行合同。

读前：[模型会理解，代码才授权](./articles/011-model-understands-code-authorizes.md)。

### 04 · 为什么评测、日志和护栏也会教坏 Agent？

<span class="preview-tag">已有草稿 · 待修改</span>

反馈错误归因、不可见的执行链路与评估对象混淆。不再重复“多记日志”，而是解释哪些观察能改变真实工程决策。

读前：[从 Trace 到可信观测](./articles/025-agent-langfuse-from-trace-to-trustworthy-observability.md)。

### 05 · 修了许多 Bug，为什么真实研究仍不收敛？

<span class="preview-tag">已有草稿 · 待修改</span>

局部回归、真实任务成功、失败归因和研发路径税。重点是把用户任务的完成证据接回开发流程，而非晒一串局部测试数字。

读前：[大模型返回不等于 Agent 运行成功](./articles/honest-agent-evaluation.md)。

## 有架构方向，等待独立案例

### 06 · Context Compaction：摘要不能重新创造历史

<span class="preview-tag">待成文 · 需案例</span>

候选摘要、采纳、来源谱系、checkpoint 和失败保留原材料。与工具结果外置不同，不能再次包装成同一篇文章。

### 07 · Artifact：做出了图，为什么不等于交付了文件？

<span class="preview-tag">待成文 · 需案例</span>

生成、持久保存、不可变 revision、访问授权、定向分享与前端接收，不同效果需要不同的回执。

### 08 · Task、控制事件和 Hook 究竟是不是一套事件循环？

<span class="preview-tag">待成文 · 需案例</span>

日历定义、持久控制命令、生命周期回调与会话交付可以共享部分基础设施，却不必合并为一个新的全局裁决模块。

---

## 公开规则

只公开经过内容成熟度评估、出处与验证边界复核、隐私检查的材料。不引入私有仓库链接、真实用户持仓、敏感标识、凭据或原始运行载荷。历史长文不为追赶当前主干而重写为“当时已经做到”。

发现值得独立讨论的问题，欢迎从[公开仓库 Issues](https://github.com/hpoenixf/eff-agent-article/issues)留言。
