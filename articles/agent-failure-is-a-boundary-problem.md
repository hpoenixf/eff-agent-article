# 别再把 Agent 失败都算给模型：一次从粗错误码到失败链的排查

做 Agent 一段时间以后，我越来越不相信简单的一个错误码。

尤其是这种：`PROVIDER_UNAVAILABLE`



它看起来很明确：模型服务不可用。

于是大模型很自然地会做几件事：

- 重试；
- 换模型；
- 调大 timeout；
- 查 provider 状态；
- 再跑一遍。

但后来我们遇到过一种很尴尬的情况：

模型请求其实已经正常结束了。

HTTP 是 200，流也走完了。

真正失败的地方，是后面的发布校验。

也就是说，我们一直在重试一个没有坏的东西。

这件事让我意识到，Agent 里“没拿到答案”只是结果，不是原因。

同一个现象，可能坏在：

```text
请求根本没发出去
模型服务失败
流中途断了
结构化输出解析失败
工具调用失败
发布校验拒绝
持久化失败
内容没有真正交付
```

如果这些最后都被压成一句 `PROVIDER_UNAVAILABLE`，错误码虽然简单，排障反而会越来越盲。

这次改造先不让系统自动猜“根因”，而是要求它记录一件更容易核实的事：

> 至少先把“最后确定卡在哪一站”说清楚。

---

## 最开始的问题，不是日志太少，而是日志没有关系

Agent 其实从来不缺日志。

模型调用有日志。

工具有日志。

发布有日志。

数据库有日志。

前端流也有日志。

问题是，这些日志经常是散的。

一次请求失败后，能看到很多事情发生过：

```text
14:03:01 model request started
14:03:07 provider 200
14:03:08 candidate parsed
14:03:08 publication rejected
14:03:09 another model turn started
14:03:15 block committed
14:03:15 stream closed
```

光看时间线，很容易脑补出一个故事：

> 第一次回答被拒了，模型根据反馈修了一次，然后成功提交并交付。

这个故事听起来完全合理。

但真正去问证据，会发现里面至少有三个跳跃：

1. 后一个模型回合真的看到了前一次拒绝反馈吗？
2. 后面提交的 block 真的是在修前面被拒的那个 block 吗？
3. block committed 之后，用户真的拿到了它吗？

时间上前后相邻，不代表它们有因果关系。

这就是我们后来真正想解决的问题：

> 不只是记录“发生了什么”，还要记录“哪些事实可以被连起来”。

```mermaid
flowchart LR
  Request["请求提交"] --> Provider["模型响应"]
  Provider --> Parse["解析结果"]
  Parse --> Tool["工具执行"]
  Tool --> Publication["发布处理"]
  Publication --> Storage["持久化"]
  Storage --> Delivery["用户交付"]
  Request -. "关联身份与回执" .-> Delivery
```

这张图只列出可能经过的阶段。实际排查要依据同一运行里的身份和回执建立关联，时间相邻本身不能证明因果。

---

## 第一个改动：先别急着找根因，先找最后一个确定阻塞点

一开始很容易把这个字段叫 `rootCause` 或者 `primaryFailure`。

后来没有这么做。

因为大多数时候，我们根本没有资格说“这是根因”。

例如：

```text
provider 返回 200
→ JSON 解析成功
→ publication validation 拒绝
→ 最终没有内容交付
```

这时我们能确定的是：

> 当前这条链最后明确阻止完整交付的阶段，是 publication validation。

但为什么发布校验会拒绝？

可能是模型输出有问题。

可能是规则太严。

可能是上游给错数据。

也可能是某个版本之间的协议不一致。

这些都需要继续调查。

所以我们最后更愿意用：

```text
terminalBlocker
```

而不是：

```text
rootCause
```

这个命名差别其实挺重要。

`terminalBlocker` 只承诺一件事：

> 从当前已经确认的运行事实看，任务最后明确停在这里。

它不假装知道更深层的原因。

例如：

```json
{
  "terminalBlocker": "publication_validation",
  "delivery": "none"
}
```

这个信息已经足够把排障范围缩小很多。

至少这一次，不应该第一反应去换模型 provider。

---

## HTTP 200 以后，失败才刚刚开始有可能发生

做普通 API 时，很容易对 HTTP 状态形成肌肉记忆。

200，成功。

4xx，调用问题。

5xx，服务问题。

但 Agent 的 200 只能说明其中一段路走通了。

后面可能还有：

```text
provider response
→ stream assemble
→ JSON parse
→ schema validation
→ runtime orchestration
→ tool execution
→ publication validation
→ publication commit
→ delivery
```

解析也是独立边界。当前分类合同把 JSON 解析或截断失败归到 `response_parse`，并禁止记成 `PROVIDER_UNAVAILABLE`；一次受控 live audit 也记录过 `STRUCTURED_OUTPUT_INVALID_JSON`。该记录没有给出 HTTP 状态，因此这里只用它说明解析失败不等于传输失败，不把它写成“HTTP 200 后出错”的实测案例。分类合同 · 受控 audit 记录

所以后来我们把失败按阶段记录。

不是为了造一套特别漂亮的分类标准，而是为了避免这种情况：

```text
output schema 不合法
→ 记成 provider unavailable

业务 deadline 到期
→ 记成 provider timeout

用户主动取消
→ 记成 provider timeout

publication validation 拒绝
→ 还是 provider unavailable
```

一旦都落到 provider，上游就成了垃圾桶。

最典型的是 timeout。

以前一个 `deadline` 很难知道是谁的 deadline。

后来我们补了一个很小的事实：

```text
timeoutOwner =
  provider
  | business
  | user
  | unknown
```

它由真正执行 abort 的那一层记录。

不是让模型推断。

也不是看到“差不多超时了”，再根据时间邻近猜。

这个字段本身一点都不聪明，但排障价值很高。

因为“provider 自己超时”和“我们的业务总时限到了”，修法完全不同。

---

## 一条诊断记录，不需要保存答案正文

做到这里以后还有一个顾虑：

如果为了排障，把用户问题、模型正文、工具结果全部复制进诊断系统，最后很可能得到另一个更麻烦的系统。

所以我们后来刻意把诊断和内容分开。

诊断记录大概只需要这种东西：

```json
{
  "runId": "...",
  "timeline": [
    {
      "stage": "provider_dispatch",
      "status": "ok"
    },
    {
      "stage": "response_parse",
      "status": "ok"
    },
    {
      "stage": "publication_validation",
      "status": "rejected",
      "reasonCodes": ["..."]
    }
  ],
  "summary": {
    "terminalBlocker": "publication_validation",
    "delivery": "none"
  }
}
```

它回答的是：

- 哪一阶段成功；
- 哪一阶段失败；
- 哪些原因码是允许记录的；
- 最终有没有交付；
- 哪些事实仍然未知。

它不需要知道正文是什么。

这也是我后来比较认同的一条原则：

> 可诊断，不等于把所有原始数据都存下来。

很多排障问题靠身份、阶段和状态已经足够定位。

正文只有在非常受限的临时调查窗口里才可能有必要，而且它应该和长期诊断记录分开。

---

## 第二个误判：A 被拒了，后来 C 成功了，不代表 A 被修好了

这一类问题比粗错误码更容易骗人。

假设时间线是：

```text
A rejected
→ 模型继续运行
→ C committed
```

人很容易读成：

```text
A rejected
→ 模型修复 A
→ 修复后的结果成功提交
```

但中间缺了一条最关键的关系：

> C 到底是不是 A 的后继修订？

如果没有这个关系，C 可能只是另一个独立内容块。

也可能模型直接放弃 A，转去回答别的部分。

甚至可能 C 在 A 被拒之前就已经存在，只是提交发生得晚。

所以：

```text
A rejected → C committed
```

只能证明顺序。

不能证明修复。

后来我们要求，想说“A 被修复”，至少要有明确对象关系。

概念上类似：

```text
A revision 1 rejected
→ feedback consumed by model turn 3
→ A revision 2 proposed
→ A revision 2 validated
→ A revision 2 committed
→ A revision 2 delivered
```

这里每一步都不是另一件事的同义词。

特别是：

> 后一个模型回合发生了，不等于它看过反馈。

如果我们真的想证明反馈进入了下一轮模型输入，就得有明确的消费关系。

例如：

```text
{
  "actionId": "...",
  "proposedByModelTurnId": "turn-2",
  "consumedByModelTurnId": "turn-3"
}
```

更严格一点，还会检查后一轮真正使用的 transcript，是否绑定了前面的那份反馈。

这样做听起来有点较真。

但如果没有它，所谓“self-repair 成功率”很容易只是根据时间顺序脑补出来的数字。

---

## “模型看到了反馈”也不等于“模型理解了反馈”

这又是一个需要克制的地方。

就算我们证明：

> 前一次拒绝反馈确实进入了下一轮模型请求。

也只能说明：

> 模型有机会看到它。

不能继续推导：

> 模型理解了原因。

更不能直接推导：

> 后一个答案就是根据反馈正确修出来的。

这和前一篇里讲“输入完整不等于回答正确”很像。

系统能证明的事实，最好停在系统真正能观察的位置。

例如：

```text
反馈进入 request：可以证明
后一版本和 A 有 revision 关系：可以证明
后一版本通过校验：可以证明
后一版本已提交：可以证明
后一版本已发送：可以证明到对应层级
模型是否真正理解：不能从这些事实直接推出
```

这种边界有点烦，但很重要。

否则诊断系统会从“记录事实”，慢慢长成“替模型解释心理活动”。

---

## 第三个误判：commit 不等于 delivered

这个问题在做流式 Agent 时特别容易发生。

一个答案 block 成功写入数据库，通常是很强的成功信号。

但它仍然不是“用户已经收到”。

至少有几个阶段：

```text
validated
→ committed
→ projected / emitted
→ client received
→ rendered
```

具体产品可能没有这么多层，但意思一样。

所以如果我们只有：

```text
publication committed
```

最好只说：

> 内容已提交。

不要写：

> 内容已交付。

更不要写：

> 用户已经看到了。

如果服务端还有真实发送记录，可以进一步说：

> 服务端已发送。

如果客户端还有 ACK、sequence 或渲染回执，再继续往后证明。

这是我这几篇复盘里反复碰到的一个共同问题：

**系统总喜欢把“下一步很可能发生”写成“下一步已经发生”。**

诊断系统尤其不能这么做。

因为它本来就是用来纠正这种乐观推断的。

---

## 反馈系统也可能把修复方向带偏

按阶段记录失败以后，还要检查观察者自身。以下历史案例不再各复述一遍组件机制，只说明它们怎样改变修复方向：

| 看到的现象 | 需要区分的事实 | 修复位置与完整案例 |
| --- | --- | --- |
| 严格 JSON 评分无法解析 | 是评审输出被截断，还是被测回答内容不足 | [评测器自身也会失败](honest-agent-evaluation.md)；修好评分格式不等于答案变好 |
| Trace 缺一轮或没有正文 | 是没调用，还是已调用却未采集 | [Langfuse 的捕获边界与缺失回执](025-agent-langfuse-from-trace-to-trustworthy-observability.md)；记录缺失不能改成执行缺失 |
| Recovery 仍读到旧答案 | 是模型没修订，还是修订没有实际持久化 | 按原块身份对照提议、预览、提交和历史读回，不能只看最终页面 |

第三个案例中，模型确已提交完整新版，工具接受了 replaces 提议，预览也有新文章；Factory 的非标准路径却只协调了 commit，没有完成 replace 持久化。沿原 Recovery 身份修复后，确定性回归观察到新正文保存并进入下一次模型请求。原先“模型不会写最终答案”的归因被撤回；这项存储修复仍不证明写作质量提高。

这些案例来自各自的历史窗口。本次合稿没有重跑实验，也没有计算统一改善率。调查时先区分被测对象、观察者与效果读取，再决定改模型、修记录链，还是保留未知。

---

## 后来我们把一次失败看成一条“有界调查链”

最后形成的东西，其实没有最开始想象得那么复杂。

对一次失败，我们希望能回答：

```text
1. 请求有没有真正派发？
2. provider 有没有返回？
3. 返回有没有通过解析？
4. Runtime 有没有正确执行？
5. 工具有没有实际完成？
6. 发布有没有通过？
7. 内容有没有提交？
8. 内容有没有进入交付链？
9. 哪些关系是明确证明的？
10. 哪些地方只能写 unknown？
```

最终 summary 只需要保留少量信息：

```json
{
  "terminalBlocker": "publication_validation",
  "contributingFailures": [
    "provider_dispatch:http_permanent"
  ],
  "delivery": "none",
  "classificationConfidence": "partial"
}
```

这里 `partial` 也很重要。

如果逐块交付身份还没有接通，就不要因为总计数看起来一致，写成 `confirmed`。

比如：

```text
summary: delivered = 3
receipt count = 3
```

数字一样，不代表三个 summary 对象和三个 receipt 是一一对应的。

也可能：

```text
A B C expected
A B B receipts
```

总数还是 3。

所以真正要确认交付，最终还是得落到对象身份和修订身份。

这和前一篇的数据完整性其实是同一个问题：

> aggregate count 很有用，但它不能替代 identity。

---

## 诊断不能为了诊断，把业务链路搞坏

做到这里还有一个很现实的问题。

日志和 tracing 经常被当成“旁路”。

于是很容易写成：

```text
await writeDiagnosticEvent()
await executeTool()
```

或者：

```text
const result = await executeTool()
await writeDiagnosticEvent()
return result
```

如果诊断存储变慢，它就开始挡住真正的业务执行。

这次 review 里，我们确实发现另一条 lifecycle 日志路径存在这种风险：等待日志 start 可能拖住工具派发，等待 settle 可能拖住 wrapper 返回。

这不代表线上已经发生了数据库锁竞争。

但它至少说明：

> “这是观测代码，所以不会影响业务”不是事实，只是一种愿望。

对于真正的 side-channel 诊断，应该专门验证一件事：

```text
diagnostics off
diagnostics on
diagnostic sink slow
diagnostic sink failed
```

这几种情况下，业务终态是不是一致。

只有测过，才有资格说“非干扰”。

而且要限定范围。

某一条 diagnostics projection 被证明非干扰，不等于整个项目所有日志 writer 都自动获得这个性质。

这也是我后来很警惕的一类措辞：

> observability is non-blocking

最好改成：

> 这条具体路径，在这些测试条件下没有改变业务 trace。

后一句虽然没那么漂亮，但更接近事实。

---

## 有些 unknown，比错误归因更有价值

这一轮改造里一个挺反直觉的结果是：

诊断系统增加以后，`unknown` 反而变多了。

例如：

```text
delivery = unknown
repairOutcome = unknown
usage = unknown
cost = unknown
```

以前这些地方可能会被默认填成：

```text
0
false
failed
```

或者根据上下文猜一个最像的状态。

现在更愿意保留 unknown。

因为：

> 没采集到成本，不代表成本是 0。

> 没看到交付收据，不代表一定没交付。

> 后续有成功内容，不代表前一次修复成功。

> 没有 provider availability 的肯定证据，也不能随便叫 provider unavailable。

诊断系统真正有价值的地方，不是让所有问题都有答案。

而是把：

```text
知道
不知道
推测
```

这三件事分开。

如果一个诊断系统最后几乎没有 unknown，我反而会有点怀疑它是不是替我们脑补了太多。

---

## 三个我现在会特别警惕的“顺手推断”

这次做完以后，我给自己留下了三个非常简单的检查。

### 1. HTTP 200 → 成功？

不一定。

它最多证明 provider 那一跳按对应协议完成。

后面仍然可能解析失败、工具失败、发布失败、交付失败。

### 2. 后面成功了 → 前面的问题修好了？

不一定。

要看是不是同一个对象、同一个修订链，以及反馈是否真的进入下一轮。

时间顺序不是因果关系。

### 3. commit 了 → 用户收到了？

不一定。

commit、server emit、client receive、render，是不同事实。

有什么证据，就说到哪一层。

这三条其实没什么高深的。

但 Agent 链路一长，人特别容易把它们连成一个顺滑故事。

而诊断系统的工作，恰恰是阻止我们讲得太顺。

---

## 诊断可以确认哪一步，不能替代哪一步

现有工程路径已经能够按阶段区分执行失败，追踪工具结果是否真正进入后续请求，并分别记录正文提交与交付事实。发生拒绝时，我们不再把所有问题笼统归到模型或供应商，也不会让诊断采集的失败反过来改变业务结果。

但定位最后一个确定的阻塞点，不等于找到了完整根因；确认模型请求带上了反馈，也不等于模型理解并改正。跨版本的实际交付身份、长期恢复效果和成本收益，需要通过各自真实运行继续观察，不能由局部故障复现推断。

## 写在最后

以前遇到 Agent 不回答，我经常先看模型。

现在顺序有点变了。

我会先问：

```text
请求到底发出去了吗？
provider 到底成功了吗？
解析过了吗？
工具执行了吗？
发布为什么被拒？
提交了吗？
发出去了吗？
我们是在看事实，还是在根据顺序讲故事？
```

模型当然会失败。

但 Runtime、协议、工具、发布和交付同样会失败。

如果最后所有问题都叫“模型不行”，不仅模型背了锅，工程上也失去了修复方向。

所以这次诊断改造最后留下来的原则，我觉得可以压成一句：

> 不要急着自动找根因，先把每一跳真实发生了什么记录清楚。

`terminalBlocker` 不是根因分析。

timeline 也不是因果证明。

commit 不是 delivered。

反馈进入上下文，也不是模型理解了反馈。

听起来都是在给结论加限制。

但实际排障时，这些限制反而很省时间。

因为一个准确的“不知道”，通常比一个错误但完整的故事更接近真正的下一步。
