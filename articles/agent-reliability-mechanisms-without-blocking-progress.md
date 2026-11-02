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
      href: https://hpoenixf.com/eff-agent-article/articles/agent-veto-authority-and-run-termination
---

# 给 Agent 加上可靠性机制后，为什么反而交不出结果？

本文已于 **2026-11-02** 合并退役。关于局部失败、恢复检查点与 Run 是否继续的判断，已纳入[Run 终结权与安全恢复](agent-veto-authority-and-run-termination.md)；关于**异步证据留存引发数据库锁竞争**的独有案例，已纳入[研究证据的采集、留存与回读](agent-research-evidence-store-lifecycle.md)。

保留这个旧链接供历史引用。本文不再计入当前文章目录或搜索，原始全文可在 Git 历史中查阅。合并不意味着所有检查点失败都可以忽略，也不意味着可靠性已经经过生产认证。

## 旧章节入口

以下入口指向主稿中相关的承接章节，不是原章节全文的副本。

<div>
<span id="一、先问清楚-用户究竟在等什么"></span>
<span id="一先问清楚用户究竟在等什么"></span>

[一、先问清楚，用户究竟在等什么 →](agent-veto-authority-and-run-termination.md#一、先分清-这一步失败-和-整个任务结束)

</div>

<div>
<span id="二、已经异步保存-为什么还会卡住正文"></span>
<span id="二已经异步保存为什么还会卡住正文"></span>

[二、已经异步保存，为什么还会卡住正文？ →](agent-research-evidence-store-lifecycle.md#四、队列是有限的-且不能向模型请求施加背压)

</div>

<div>
<span id="三、动作已经完成-为什么恢复记录还能让它失败"></span>
<span id="三动作已经完成为什么恢复记录还能让它失败"></span>

[三、动作已经完成，为什么恢复记录还能让它失败？ →](agent-veto-authority-and-run-termination.md#七、恢复的第一步不是重做-而是确认已经发生了什么)

</div>

<div>
<span id="四、可靠性能力-也要接受反向验证"></span>
<span id="四可靠性能力也要接受反向验证"></span>

[四、可靠性能力，也要接受反向验证 →](agent-veto-authority-and-run-termination.md#九、把原则落到下一次评审)

</div>

<div>
<span id="五、下一次增加可靠性机制-先写下它失败后的样子"></span>
<span id="五下一次增加可靠性机制先写下它失败后的样子"></span>

[五、下一次增加可靠性机制，先写下它失败后的样子 →](agent-veto-authority-and-run-termination.md#九、把原则落到下一次评审)

</div>

<div>
<span id="延伸阅读"></span>

[延伸阅读 →](agent-veto-authority-and-run-termination.md#九、把原则落到下一次评审)

</div>

[阅读合并前的完整版本](https://github.com/hpoenixf/eff-agent-article/blob/32c3a4a1b9ab3e02452af3cc2f8875953796d670/articles/agent-reliability-mechanisms-without-blocking-progress.md)。
