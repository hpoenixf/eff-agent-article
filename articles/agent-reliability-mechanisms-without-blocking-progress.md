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
