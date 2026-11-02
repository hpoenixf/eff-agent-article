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
      href: https://hpoenixf.com/eff-agent-article/articles/docs-code-tests-evolve-together
---

# 测试也会过期：把重构、退役和删除前移到 Spec

本文已于 **2026-11-02** 合并至[测试比实现还多之后：怎样让文档、代码和测试一起向前](docs-code-tests-evolve-together.md)。主稿保留了旧测试的**保留、重构、合并、退役、删除**五种处置方式，以及恢复候选资格和 LangGraph 迁移扫描的真实反例。

本页保留历史 URL，不再进入文章目录或搜索，原文完整案例、头像上传教学表格与详细论证仍可在 Git 历史中阅读。合并不是按测试数量或通过率机械删除用例。

## 旧章节入口

以下入口指向主稿中相关的承接章节，不是原章节全文的副本。

<div>
<span id="一、失败之后-先找行为依据"></span>
<span id="一失败之后先找行为依据"></span>

[一、失败之后，先找行为依据 →](docs-code-tests-evolve-together.md#旧测试不能整组推倒-先分清它保护什么)

</div>

<div>
<span id="二、不要整组删除-逐项看它还保护什么"></span>
<span id="二不要整组删除逐项看它还保护什么"></span>

[二、不要整组删除，逐项看它还保护什么 →](docs-code-tests-evolve-together.md#旧测试不能整组推倒-先分清它保护什么)

</div>

<div>
<span id="三、已有测试-不只有保留和删除两种选择"></span>
<span id="三已有测试不只有保留和删除两种选择"></span>

[三、已有测试，不只有保留和删除两种选择 →](docs-code-tests-evolve-together.md#旧测试不能整组推倒-先分清它保护什么)

</div>

<div>
<span id="四、旧库已经迁走-迁移检查还要跑多久"></span>
<span id="四旧库已经迁走迁移检查还要跑多久"></span>

[四、旧库已经迁走，迁移检查还要跑多久 →](docs-code-tests-evolve-together.md#六、同步工作为什么也会拖后腿)

</div>

<div>
<span id="五、把处置提前到设计里-实际写到文件上"></span>
<span id="五把处置提前到设计里实际写到文件上"></span>

[五、把处置提前到设计里，实际写到文件上 →](docs-code-tests-evolve-together.md#七、明天接到需求-可以怎样开始)

</div>

<div>
<span id="六、测试慢-先找能消掉的重复工作"></span>
<span id="六测试慢先找能消掉的重复工作"></span>

[六、测试慢，先找能消掉的重复工作 →](docs-code-tests-evolve-together.md#六、同步工作为什么也会拖后腿)

</div>

<div>
<span id="七、下一次遇到旧测试失败-先问它还在守什么"></span>
<span id="七下一次遇到旧测试失败先问它还在守什么"></span>

[七、下一次遇到旧测试失败，先问它还在守什么 →](docs-code-tests-evolve-together.md#七、明天接到需求-可以怎样开始)

</div>

<div>
<span id="延伸阅读与交流"></span>

[延伸阅读与交流 →](docs-code-tests-evolve-together.md#延伸阅读与交流)

</div>

[阅读合并前的完整版本](https://github.com/hpoenixf/eff-agent-article/blob/32c3a4a1b9ab3e02452af3cc2f8875953796d670/articles/test-lifecycle-refactoring-retirement-and-spec.md)。
