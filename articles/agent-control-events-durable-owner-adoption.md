# Agent 收到控制指令后，为什么不能立刻执行？A08 持久控制事件的交接边界

后台研究正在进行，用户点了 Stop。另一台 Worker 随后接手，看到数据库里还有一条待处理命令。它能否直接再执行一次停止？如果上一个 Worker 已经让原任务停下，只是在写回投递 ACK 前掉线，这次重试应该做什么？

这是 ETF Agent 逐渐遇到的真正难题：**一条命令被可靠送达，和它要求的业务效果真实发生，是两件事。** 如果把“投递成功”当成“任务成功”，会漏掉真正的效果；如果把“没收到 ACK”当成“没执行”，又可能重复停止、重复唤醒，甚至重派受保护的动作。

A08 的工作不是管理整个 Agent，而是把持久控制事件作为一条有身份、顺序、领取资格和交付回执的窄通道。实际终止 Run、接纳 Correction、建立 Task 或恢复 Child 的权力，仍由它们各自的原 Owner 持有。

本文先解释原系统 A08 的完整交接设计，再用 [Open ETF Agent 的公开实现](https://github.com/hpoenixf/open-etf-agent)对照其中一条更窄的路径：同一个 Run 的 SQLite 领取、取消和重启恢复。公开切片已经能独立运行，但没有搬出 A08 的多 Owner 控制事件总线；两者的能力范围会分别说明。

## 一、为什么普通事件总线不等于持久控制事件

在 Agent 内部，“事件”至少有几种完全不同的含义。

| 事件种类 | 谁最终拥有它 | 真正的结果 |
| --- | --- | --- |
| 生命周期 Hook | A29 | 一次回调是否被选择、执行以及它的局部结果 |
| 持久控制命令 | **A08** | 原命令被接受、持有、投递及按原业务回执结算 |
| 会话进度或正文事件 | A24 | 内容版本、序号、投递与 History 回读 |
| 调用轨迹与审计观察 | E04 等观察能力 | 实际采集范围内的记录、缺失和 unknown |

工具完成不代表四条支路都必须触发。普通 Tool Result 可以直接回到研究；需要持久唤醒或停止时才有相应控制意图。Hook 的 Stop 建议也不自动拥有 Run 的技术终止权，SSE 发出去更不证明用户已看见或业务已提交。

我们没有制造一个万能的 EventBus，让它决定研究、预算、发布和记忆。A08 只为确实需要跨进程保存的控制交接负责。

## 二、先封存身份，再让 Worker 领取

一条持久命令不能只保存一段 `"stop"` 文本。它需要能让原业务 Owner 识别的授权主体、原生产者、目标及版本，还有用于去重与顺序处理的稳定身份。

当前实现把生产者在原事务中封存的 `producerKey` 与事件指纹对应起来：同一个生产者意图、同一份内容再次出现，返回原有事实；同一个键却换了内容，拒绝身份冲突。被接受的事件取得 `eventId`，投递侧生成 `commandKey = control:eventId`。对同一目标的事件还有接受序号及目标修订，不能因为队列扫描顺序变化就把后来的控制先执行。

为什么先有 *intent*，再有 *event*？有些原业务事实需要与待发控制意图同一事务提交。`stageInTransaction` 保证原事实回滚时，持久交接也一同回滚；后续 Relay 只把既有意图转换成可领取事件，不直接执行模型、工具或业务效果。对于未来的定时触发，未到期的意图不能先占据目标事件顺序，挡住用户此刻的 Correction。

背压同样不是一句“消息放不下就重试”。未完成的 intent、pending、claimed、unknown 和保留的容量预留都可能占据同一个 Scope 的待办空间。新的准入不能把未知效果删除，好让表面计数变小。

## 三、Claim 与 Fence：拿到工作，不等于拿到永久执行权

两个 Worker 可能同时读取同一队列。A08 在短数据库事务中领取候选，保留对应 Worker、有效期和递增的 `fence`；领取时也检查目标当前修订、事件种类与适用消费者。失效的目标不应继续执行旧动作。

更重要的是，**Worker 在领取时有效，不等于稍后接纳业务效果时依然有效**。外部 I/O、线程停顿或数据库重试都可能跨过租约期限。原业务 Owner 在自己的事务中使用同一命令身份，重新检查当前 claim、Worker、fence、目标与有效期，然后才有资格接纳效果。

这不是让 A08 变成第二个权限中心。Claim 只证明投递者现在可以携带哪条封存命令去敲原 Owner 的门；那扇门是否接受，由原 Owner 的身份、授权、资源和业务状态决定。

公开 v0.7 把这一原则落在一个可以直接检查的本地实现中。[`session.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/session.mjs)用短 SQLite 事务领取一个 Run；有效租约仍被占用时，另一个领取者得到 `LEASE_BUSY`。租约到期并被新领取者接手后，fence 递增，旧领取者即使醒来，也不能继续写 checkpoint 或预留新的工具额度。这里保护的是数据库写入资格，不是远程服务的副作用；数据库中的旧 fence 失效，不能撤回已经发往外部的请求。[对应的存储用例](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/session.test.mjs)分别检验这两个时间点，而不把“抢到锁”当成永久执行授权。

## 四、真正困难的是：先看业务回执，再决定要不要重投

一次正确的交接如下。图中“未知”并非临时网络错误的同义词，而是原业务效果无法证实已经发生或未发生。

```mermaid
flowchart TD
  A[原 Owner 事务封存控制意图] --> B[A08 接受事件与目标序号]
  B --> C[Worker 领取 Claim 与 Fence]
  C --> D{Claim 和目标仍有效?}
  D -- 否 --> E[丢弃过期投递资格]
  D -- 是 --> F[读取原业务 Owner 的持久回执]
  F --> G{原效果有确定回执?}
  G -- 已接受或拒绝 --> H[按原回执结算投递]
  G -- 明确不存在 --> I{可以安全首次接纳?}
  I -- 是 --> J[原 Owner 事务内去重并接纳]
  J --> K{原结果确定?}
  K -- 是 --> H
  K -- 否 --> L[保留 Unknown 并只对账]
  I -- 否 --> L
  G -- 暂不可读 --> M[延期读取，不授权新效果]
```

原 Owner 的 `readReceipt` 返回 `null`，必须表示**在权威存储中确定不存在原回执**；数据库不可读应该抛错，而不是偷偷返回 null。当原回执读取暂时不可用、且此前没有启动过不确定的业务接纳，A08 只延期读取而不立即新建业务效果；只有原 Owner 能证明准入事务已回滚、未派发，才可能恢复安全重试。已经开始接纳却丢了结果，或者旧 Claim 标记了 owner uncertain，必须保留 unknown；下一轮首先对账，不能默认再次调用 `admit`。

当重投次数超过边界，或当前路由/事件无法安全处理时，命令可以进入隔离状态。隔离是一份可解释的处置记录，不是“命令执行成功”，更不是清空底层业务的副作用。

## 五、一次丢失 ACK 的合成案例

假设某个 Run 的停止请求被原 Owner 原子接纳，并留下 `accepted` 的业务回执。Worker 随后掉线，未把 A08 中的状态从 claimed 改为 acknowledged。租约过期后，第二个 Worker 可能领取同一 `eventId`，此时 fence 已经不同。

正确路径不是再停止一遍，而是**以相同 `commandKey` 查询原业务回执**。找到先前 accepted，就只完成投递结算。另一种情况是原事务提交与回执读取都无法确认：即使客户端看见超时，A08 也要保留 unknown，等待能够独立确认的原 Owner 结果。

| 看到的现象 | 能确认什么 | 下一步 |
| --- | --- | --- |
| 原 Owner 已有 `accepted` 回执，A08 尚未 ACK | 原效果曾获接纳，投递结算落后 | 复用原回执，结束投递，不重复效果 |
| 原 Owner 明确无回执，且此前没有不确定效果 | 可以检查是否仍具备首次接纳资格 | 在当前 Fence 与原事务内尝试 |
| 原 Owner 回执暂时不可读，且尚未开始接纳 | 本次还没有证据允许执行效果 | 延期再次读取，不以 null 假装原效果不存在 |
| 原 Owner 曾开始接纳但提交结果不明 | 可能已经发生原效果 | 保留 unknown，仅沿原身份对账 |
| 目标修订已改变或 Claim 过期 | 旧投递资格失效 | 拒绝旧 Claim，不替新版本作决定 |

示例是对当前合同的教学重构，不是公开的真实用户 Stop 记录。它之所以重要，是因为失败发生的地方恰好在两个数据库事实之间：业务已接纳，投递 ACK 尚未写回。复制一个统一的“完成”布尔字段不能消除这个时序差异。

公开代码也把“不重投未知效果”落实到恢复位置，而不是只保存一个完成标志。在同一个 [`runtime.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/src/runtime.mjs) 循环中，`proposal-sealed` 表示已有封存的提议，重启不需要重新请求模型来生成它；`result-committed` 表示原工具回执已经提交，后继只消费它。相反，`tool-dispatched` 却找不到可核实的原结果时，保留 `TOOL_OUTCOME_UNKNOWN`，不因换了进程就再次派发。同一个 Run 的原问题、授权绑定、绝对截止时间和已用额度也不会随恢复刷新。它不是原文 A08 的投递 ACK 协议，却能让读者观察相同的判断原则：**恢复位置必须来自已发生的事实，不能来自希望重试成功的愿望。**

## 六、A08 与 HIO、Task、Recovery 怎样协作

A37 HIO 接纳的是人与 Agent 的交互请求和回复身份；它需要恢复原研究时，仍经原 Correction/Recovery 合法入口，必要的持久控制命令才使用 A08 投递。A09 Schedule 拥有确认日程、Task 与取消；A08 不因为收到了 timer_due 就有权创造未来研究额度。A06 决定 Run 的继续、有限收尾与技术终态；A08 的 ACK 从来不是 A06 的完成回执。

这种拆分最容易遭遇的质疑是：“为什么不把这些状态放在同一张表？”因为表的数量并非问题，**同一效果是否出现两个最终裁决者**才是问题。共享身份与事务锁顺序是可取的；让交接层顺手把业务状态改成成功，则是另一回事。

## 七、实现已经存在，但不能凭源码宣称所有控制路径都可靠

截至 2026 年 10 月 24 日，主干已有 ControlEventRepository、ControlEventService、原 Owner 事务身份检查、意图 Relay、Claim/Fence、回执协调、unknown/隔离及容量背压等实现。它们也被接入若干定时、Correction 与研究控制路径；本文讲的是这套实际机制，不是一个尚未写代码的 EventBus 提案。

这并不等于所有目标、生产部署和跨进程故障都已完成统一全链验收。特别是一次真实控制命令是否最终导致正确的 Run/Task/Child 效果，仍要读原业务回执；模型是否问了正确的问题、文章是否交付，也不能由 A08 的队列状态证明。

**可靠的控制事件，不是“消息至少发出去一次”，而是失败后仍能明确区分“事件到了”“原效果成立了”“结果还不知道”。**

## 八、在公开代码中观察取消与恢复，而不是再造一条任务

可以从[当前 main 的运行说明](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md)进入项目；为了让本文命令与机制对应，下面固定到公开 v0.7 提交。本次资格验证使用 Node.js 26.11.1；包声明支持 26.8.1–26.x，但并非每个补丁版本都已经实测。首次安装可能访问 npm，案例使用合成材料和脚本式模型替身，不调用远程模型；SQLite 持久化、独立进程与报告文件是真实的。

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-control-demo
cd open-etf-agent-control-demo
git checkout --detach 5f70dc0b4760ad70ef211f4823828ab2fee5c525
npm ci --ignore-scripts --no-audit --no-fund
npm run session -- start --session runs/control-example --case durable-report
```

`start` 输出实际 `runId`、`directory`、报告 `receipt` 和 `rootUsage`，会话目录保存 `session.sqlite`。用输出中的真实 ID 替换下方的 `run-YOUR_ID`，再由独立命令读取同一运行：

```bash
npm run session -- inspect --session runs/control-example --run run-YOUR_ID
npm run session -- resume --session runs/control-example --run run-YOUR_ID
```

默认示例在 `start` 返回前已经完成。因此这里的 `resume` 是**终态回读**：保持同一 Run、原报告回执和已用额度，检查现有产物，而不是再写一份报告。这一行为可沿 [`session-cli.test.mjs`](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/session-cli.test.mjs)核对；它不能单独证明运行中断后的续接。也不要对一个已完成 Run 调用 `cancel`，再把未变化的终态当成取消失效——取消只使仍活动的根运行及其活动子运行失去继续资格，不改写已经完成的历史。

要观察真正有竞争条件的分支，可以运行仓库已有的定向进程用例：

```bash
node --test --test-concurrency=1 --test-name-pattern="after result commit|cancel during pending model|dispatched-without-result" test/durable-runtime.test.mjs
```

这些[进程用例](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/durable-runtime.test.mjs)把取消放在脚本模型请求尚未返回时，检查迟到提议没有派发工具、另一个进程读回仍是 cancelled；另外在结果提交后或合成外部效果派发后真实终止进程，等待退出，再换一个 PID 打开同一数据库。前者消费原回执，后者在无法确认结果时停在 unknown。重点是这些不同出口，而不是都恢复成 completed。

取消也不应抹掉已经发生的效果。[公开验证记录](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/docs/verification/v07-observations.md)保留了“取消后丢失已保存报告回执”的受控反例；[修复后的用例](https://github.com/hpoenixf/open-etf-agent/blob/5f70dc0b4760ad70ef211f4823828ab2fee5c525/test/durable-review.test.mjs)保留 cancelled 终态，同时读回原报告回执，没有再次调用模型。**不再继续运行，不等于先前什么都没发生。**

这条公开路径的控制权只覆盖选定的本地 Session 与受支持的合成配置。CLI 不会把真实模型绑定替换成 fixture 来冒充恢复，也没有提供原文完整的 HIO、定时控制、多租户或任意外部副作用对账。对本地开发者，它已经足够回答一个具体问题：进程换了以后，哪些动作可以继续，哪些事实只能读回，哪些未知结果必须诚实停下。如果关心扩展包怎样先完整发布贡献、再沿原 Runtime 执行和释放资源，可接着读 [Extension Host](https://hpoenixf.com/eff-agent-article/articles/020-agent-extension-host-smartphone)；包的生命周期与 Run 的取消、恢复仍各有归属。

---

<!-- open-etf-case:control@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### 在模型等待期间检查持久取消

固定公开快照的[进程级取消用例](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/durable-runtime.test.mjs)把控制边界放在模型请求已占用预算、但结果尚未返回的位置。

在所链固定快照按 README 安装依赖后，运行：

```bash
node --test --test-concurrency=1 --test-name-pattern='^7\.3 cancel during pending model is durable and late proposal cannot dispatch$' test/durable-runtime.test.mjs
```

用例等待实际子进程到达 `model-pending`，通过另一个 Session 连接持久取消，再核对迟到提案没有派发工具。新进程回读同一个 Run 后仍是 `cancelled`，模型预算消费保持为 1。

这条测试使用合成模型过程，证明的是原 Run 的持久取消和迟到提案拒绝；它不覆盖本文完整的 A08 控制事件投递、去重与跨业务 Owner 采用。
<!-- /open-etf-case -->

## 延伸阅读

[持久 HIL：用户回复如何接回研究](https://hpoenixf.com/eff-agent-article/articles/agent-durable-human-interaction-response-adoption)讨论 A37 交互准入，[定时研究](https://hpoenixf.com/eff-agent-article/articles/agent-autonomous-scheduled-research)解释 A09 Task 的长期承诺；[异步交付](https://hpoenixf.com/eff-agent-article/articles/agent-asynchronous-research-time-bound-delivery)解释 A24 的通知与 History。

[公开工程文集](https://github.com/hpoenixf/eff-agent-article)收录更多基于实际系统演化的文章。欢迎 Star 关注后续更新。
