---
layout: page
sidebar: false
outline: false
editLink: false
search: false
head:
  - - meta
    - name: robots
      content: noindex, follow
  - - link
    - rel: canonical
      href: https://hpoenixf.com/eff-agent-article/articles/025-agent-langfuse-from-trace-to-trustworthy-observability
---

# Trace 显示 Complete，为什么 Agent 还是无法完整复盘？

本文于 **2026-11-02** 合并至[Agent 可观测全景：从一次模型请求到可回查的研究事实](025-agent-langfuse-from-trace-to-trustworthy-observability.md)。2026 年 10 月 30—31 日的阶段性 Trace 缺口、流式事件容量、分类遗漏回执，以及“追踪没有发布事件但原 Publication 有正文”的反例已纳入主文。

旧网址保留供历史引用，不再单独出现在目录或搜索中。原始详尽实验记录、示例和事件分支图可在 Git 历史中阅读；合并不表示过去丢失的观测被恢复。

## 旧章节入口

以下入口指向主稿中相关的承接章节，不是原章节全文的副本。

<div>
<span id="一、先给-complete-补上宾语"></span>
<span id="一先给-complete-补上宾语"></span>

[一、先给 complete 补上宾语 →](025-agent-langfuse-from-trace-to-trustworthy-observability.md#三、记录可以不完整-缺口不能伪装成结论)

</div>

<div>
<span id="二、为什么流式工具调用特别容易耗尽观测容量"></span>
<span id="二为什么流式工具调用特别容易耗尽观测容量"></span>

[二、为什么流式工具调用特别容易耗尽观测容量 →](025-agent-langfuse-from-trace-to-trustworthy-observability.md#三、记录可以不完整-缺口不能伪装成结论)

</div>

<div>
<span id="三、这次修复的重点-让遗漏可以解释-而不是假装没有遗漏"></span>
<span id="三这次修复的重点让遗漏可以解释而不是假装没有遗漏"></span>

[三、这次修复的重点：让遗漏可以解释，而不是假装没有遗漏 →](025-agent-langfuse-from-trace-to-trustworthy-observability.md#三、记录可以不完整-缺口不能伪装成结论)

</div>

<div>
<span id="四、追踪缺失时-应当去哪里找事实"></span>
<span id="四追踪缺失时应当去哪里找事实"></span>

[四、追踪缺失时，应当去哪里找事实 →](025-agent-langfuse-from-trace-to-trustworthy-observability.md#三、记录可以不完整-缺口不能伪装成结论)

</div>

<div>
<span id="五、下一步不是一个更大的布尔值"></span>
<span id="五下一步不是一个更大的布尔值"></span>

[五、下一步不是一个更大的布尔值 →](025-agent-langfuse-from-trace-to-trustworthy-observability.md#七、回到那份报告-先补哪一个缺口)

</div>

[阅读合并前的完整版本](https://github.com/hpoenixf/eff-agent-article/blob/32c3a4a1b9ab3e02452af3cc2f8875953796d670/articles/agent-trace-complete-observation-gaps.md)。
