# Agent 有这个工具，模型为什么还是看不到？——我们怎样一步步走到 A34 Tool Surface

给 Agent 接入 MCP 工具，通常要做几件事：注册工具、定义 Schema、配置权限，再把工具交给模型调用。听起来并不复杂。

但开发 ETF Agent 时，我们先后遇到过两种相反的问题：**系统已经有某个工具，模型却看不到；模型能看到某个工具，Host 却未必真正允许执行。**

为了解决这些问题，我们先统一工具定义，再统一工具暴露规则，后来又把 Runtime 里重复的业务工具定义删掉，让 MCP 成为真正的能力接口。

这些重构都解决过实际问题。可是到了 2026 年 10 月，我们才意识到：即使前面的授权、工具注册和能力投影都正确，也不能保证经过 Hook、上下文处理和异步准备之后，模型最终收到的工具列表仍然正确。

于是有了 A34——模型能力呈现与工具表面（Model Capability Presentation & Tool Surface）。

它不是一次从零开始的架构设计，而是几轮重构后留下的最后一块责任空白。

## 一、最初的问题：Skill 说有工具，模型却用不了

2026 年 9 月 27 日，我们检查一个公开产品跟踪与比较 Skill。它已经声明了两个 Market MCP 方法：

```text
market__search_instruments
market__get_instrument_profile
```

Skill Registry 能识别这两个工具，MCP 服务也已登记。按照直觉，Agent 应该可以使用它们进行产品查询与资料比较。

但沿实际 Research 路径检查，发现 `research-skill-context.ts` 没有把这两个方法承接为 Research Action，Native 静态 Tool Contract 也没有对应工具。

```text
Skill 声明支持
      ↓
MCP 已经注册
      ↓
Native Research 没有对应工具
      ↓
模型无法通过这条路径调用
```

这是当时从源码确认的接入缺口，而不是某次线上用户失败的反向归因。

我们的第一反应很自然：把缺失的工具接进去，让 Skill、Native Contract 和 Host Action 对齐。但实际动手后又发现，`market` capability 的推导可能在 MCP Market 默认开启时宣告可用，生产 Host 的网络策略却不一定允许对应动作，于是 Factory 遇到“能力表宣称可用、Host Action 实际缺失”的矛盾。

受控复现确认了工具可见性与实际能力之间的错位。另一侧也有相反的问题：Structured Market 不应因 Web 搜索关闭就一起被禁用。修复一项错位，不意味着两种工具能力应该永远绑在一起。

**我们原本只想让模型多看见两个工具，结果发现问题并不是少写两行 Tool Definition，而是 Skill 声明、Capability 推导、Host 准入和模型可见接口根本不是同一种事实。**

## 二、工具定义集中之后，仍要确定谁有权决定可见性

最初，Native Tool Contract、Skill Context 和 Runtime Factory 在三处维护模型工具关系。Web 搜索和网页读取还曾共享 `search_public_sources` Host 路由：**共用执行入口，不代表模型有权看到同一组工具**。当时用精确 `modelToolCeiling` 限制 synthetic Web 工具，是合理的修复。

但 MCP Host 后来能够独立发现业务方法、校验 Schema、执行授权并留下回执；Runtime 再包装 `read_portfolio` 等业务工具，反而制造了第二份接口。我们因而把**业务工具定义归回 MCP、运行授权归回 Run Grant/Host、模型本轮能看到什么归 Tool Surface**。这时，旧 Skill 方法清单也不能继续充当原生 MCP 域的最终白名单：一份 Skill 只提到某个市场方法，并不意味着同域另一项已获准的普通方法要被隐藏。

两次改动并不矛盾：旧上限防止了共享路由上的误暴露；迁移后则要撤回不再具有同样权威的影子限制。**判断能否看到工具，应追问准入事实由谁生产，而不是沿用上一代接口留下的名单。**

## 三、可用性来自原 Owner，而不是看起来正确的诊断字段

工具可见性还会随搜索额度、来源权限和期限改变。2026 年 10 月的一次受控回归发现：与 Web 无关的工具结果若带有类似搜索额度耗尽的字段，恢复路径可能误将 `market__web_search` 隐藏。问题不在 JSON 是否有类型，而在**诊断内容被误当成了授权事实**。

现行路径消费原 Web Gateway/Host 产生、绑定 Run/Scope/Invocation/Connection 的状态与回执；Recovery 不从任意 MCP 结果重建权限。搜索额度耗尽不必禁止读取已有合法 `sourceRef`，而 Web 期限耗尽则可能限制两者。

这项问题由原接缝修正，并非 A34 接管 Web 授权的成果。它说明为什么 Tool Surface 只投影已有决定，不另建一份预算与可用性缓存。

## 四、用独立准入基准校验最终模型工具表面

即使 MCP Schema、Run Grant 与 Skill 目录都正确，实际请求还会经过 Hook、上下文拟合、证据装配和异步准备。2026 年 10 月的受控请求接缝回归，构造了工具增删、重排及 Schema 修改等 **13 个原路径未阻断的反例**；它们是测试路径，不是线上 13 次事故。

在实际派发之前比较期望工具列表与 `request.tools` 是必要的，但更难的问题是：**期望值必须来自原准入事实，而不是从待校验的请求本身生成**。

### 请求封存不能证明请求合法

如果从最终请求生成 seal，再与最终请求比较，结果只能证明“实际请求与实际请求的记录一致”。

```text
被修改的实际工具
       ↓
封存被修改的工具
       ↓
用封存记录校验实际请求
       ↓
错误也可能通过
```

Seal 是执行事实，不是重新颁发工具授权的机关。

### 期望值不能与实际对象共享可变 Schema

我们还通过受控 RED 发现，若期望工具和请求工具共享同一嵌套 Schema 引用，后续 Hook 原地修改供应商 `inputSchema` 时，两边可能一起变化，深度比较同样失效。

因此必须在可变 Hook/投影之前独立复制由原 Effective Contract 准入的完整描述符，不能把待检查的对象拿来生成自己的标准。

另一个 RED 表明：`read_tool_result` 回读控制也不能由 Hook 凭空添加。它是否有资格出现，需要由原 Host/拟合入口判断，随后进入同一份独立基准。

### 为什么保留早期和最终两道检查？

这是一次取舍，而不是看到重复校验就机械删除。

- **早期校验**在扩展投影之后、原 Owner 合法 revalidation 之前，阻止非法 Hook 修改被后续重组“洗白”；
- **最终校验**在后期上下文、证据和异步准备之后，确保实际逻辑模型请求仍等于合法收窄后的准入结果；有没有可选 Hook 都执行。

比较覆盖数量、顺序、名称、完整说明与输入 Schema。实际 A34 沿用已有 `ChatToolDefinition[]` 和请求适配路径，而非新增工具 Schema 目录。

需要明确：它比较的是 Provider wire 序列化**之前**的逻辑工具表面。不同模型协议的合法序列化仍归模型调用 Owner 负责，不能用逻辑 parity 去错误限制 wire 格式。

这个问题与 TOCTOU（检查时与使用时状态不一致）有相似的工程结构，但我们的反例主要来自后续投影和共享可变对象，不应包装成已证实的生产并发攻击。

## 五、拒绝失配请求，也要结清它的执行事实

A34 的实现还有一次重要反复。

当失配被检测出来，适配器抛出协议错误并停止发送，工具一致性本身已经得到保护。但异步准备回归发现：某条路径虽然正确阻止了派发，却没有沿原请求的 `onProviderRequestFailure` 记录确定未派发的事实。

请求进入准备阶段时，原 Runtime 可能已经建立 reservation 和请求身份。只抛异常，不代表它会自动正确结算。

我们于是复用既有 `pre_dispatch_rejected` 回调，在原 Main/Child 请求账本闭合这次确定未派发的预留。A34 不创建第二套回执，也不取得资源结算权。

```text
工具表面失配
      ↓
仅拒绝当前模型请求准备
      ↓
原请求 Owner 记录确定未派发
      ↓
原 Runtime 决定继续、恢复或终结
```

已经合法生成的独立可发布正文也不会因为这一次模型请求的失配而被 A34 删除。

这次教训很具体：**一个新的安全检查若只会拒绝，却不沿既有系统结清自己制造的拒绝效果，仍然可能破坏执行生命周期。**

## 六、为什么只需要逻辑 Tool Surface Owner

此时建立一个统一 Capability Manager 看起来很诱人：让它维护工具注册、授权、可用性、Skill、预算和最终请求工具集合。

但我们刚刚花了数轮重构移除 Runtime 影子业务目录。如果 A34 又复制一份授权、预算或工具注册表，“统一”只会变成另一个竞争事实源。

A34 的独立责任极窄：

> 消费原 Owner 已准入的事实，确定模型本轮应看到什么，并保证最终逻辑请求没有偏离。

它不维护新的持久化状态，也不改变现有 Run Grant、MCP Schema、Web Gateway 额度、Provider 路由或 Publication 裁决。它只可拒绝本次不合法的**模型请求组装**。

对 Entry，它保留受限且当前的 Host 能力摘要；可访问 Portfolio 并不等于已经读取持仓，获准文档引用也不等于已经取得正文。对 Research，它保留合法的完整工具列表，拒绝未获准的描述符变化；合法的消息压缩不应触发误拒绝。容量不足以容纳必需工具时给出明确容量结果，而不是静默按 Top-N 删工具。

因此 A34 是一个跨现有文件的**逻辑效果 Owner**，不是新服务、数据库表或新的权限机关。

<!-- open-etf-case:surface@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### 直接看 Child 每轮收到的工具集合

固定公开快照的[只读 Child 用例](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/test/cooperation-integration.test.mjs)把可见性落到真实 Gateway 调用参数：不是检查注册表里“有什么”，而是记录每轮实际呈现了什么。

在所链固定快照按 README 安装依赖后，运行：

```bash
node --test --test-concurrency=1 --test-name-pattern='^3\.4 fixture child shares root counters and advertises only allowed read tool$' test/cooperation-integration.test.mjs
```

两次脚本模型调用都只能看到 `read_page`，最终根计数是两次模型、一次工具；Child 返回派生结果，没有自行保存报告的回执。终端的精确测试结果对应这些断言。

这只是受限 Child 的工具呈现与共享计数，不是完整 A34 动态能力编排，也不证明真实模型会选择正确工具。
<!-- /open-etf-case -->

## 七、结语：守住最终可见性，而不另造能力总管

旧 Tool Contract、Skill 上限和 Web 诊断各自解决过具体问题，但接口归属改变后，旧测试也必须按当前合同复核；不能为了绿测恢复已失去资格的白名单。真正要保留的，是**原始准入基准不能被后续投影改写，最终请求也不能自己证明自己合法**。

A34 的答案不是造一个更大的 Capability Manager，而是保存独立的原始准入基准，保护最终工具表面的一致性，并让任何局部拒绝回到原执行 Owner 正确结算。

它最终区分了三种不同对象：

- **原始准入事实：** 哪些能力在本轮合法；
- **最终模型请求：** 模型实际上看到什么；
- **请求封存和执行记录：** 系统实际准备、派发和结算了什么。

三者能够关联，却不能互相冒充。

**有些架构升级，是增加一道必要的约束；有些架构升级，则是拒绝增加一个不必要的 Owner。A34 恰好同时体现了这两件事。**

A34 体现了[原则 2「复杂度必须归属正确的 Owner」](/principles#principle-2)：工具表面的原始准入依据和最终请求一致性需要有清楚的负责者，却不必再生出一个包办全部能力的 Manager。具体检查则借助[方法 3「证据传递与投影」](/principles#method-3)，将原始准入事实、模型实际可见投影与最终派发回执分开核对。

---

延伸阅读：[MCP Host：从接上服务到真正用上工具](https://hpoenixf.com/eff-agent-article/articles/mcp-host-from-discovery-to-consumption) · [Model / Runtime / MCP / Skill 的分工](https://hpoenixf.com/eff-agent-article/articles/agent-model-runtime-mcp-skill-boundaries) · [代码越来越便宜，为什么系统却越来越难升级？](https://hpoenixf.com/eff-agent-article/articles/code-cheaper-systems-harder-to-evolve)

更多独立工程案例见 [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article)。如果这些真实架构演进与你正在处理的问题相似，欢迎到 GitHub 阅读、交流或 Star。