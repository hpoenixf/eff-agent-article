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

## 二、第一次正确的重构：三处静态映射，收敛成一个 Tool Contract

同一时期，Native 工具关系还分散在三个生产位置：

- `research-tool-contract.ts` 描述模型工具与 Host 路由；
- `research-skill-context.ts` 维护 Skill 到研究动作的映射；
- `research-runtime-factory.ts` 根据 Host Action 推导工具要求。

新增一项工具，开发者必须同时理解几处静态关系。更麻烦的是，Web 搜索与网页读取曾经共享 `search_public_sources` Host Action。对 Host 而言是复用执行路径，对模型却是两种独立能力。

如果仅以 Host route 为工具上限，只允许搜索的 Skill 可能意外暴露读取工具，反之亦然。

我们选择在统一 Tool Contract 中补充工具语义和 Skill 绑定，用 `projectSkillExposure` 派生精确 `modelToolCeiling`，再删除两份重复映射：

```text
之前：Tool Contract + Skill Context + Runtime Factory
                  ↓
            三处维护工具关系

之后：统一 Tool Contract
                  ↓
          精确 Skill 工具上限
                  ↓
       Host / Capability 独立收窄
```

定向验证证明了精确上限实际生效。

这不是错误的设计。它解决了当时重复静态映射、共享路由误暴露 sibling 工具的问题。

但它留下了一个更深的疑问：**把三份工具关系变成一份之后，这一份业务工具定义真的放在正确的 Owner 手里了吗？**

## 三、第二次纠偏：从三个 Owner 到一个 Owner，还不够

9 月底，我们开始清理 Runtime 中的 synthetic MCP Tool。

此前为了统一 Native Research 协议，Runtime 会把 MCP 的业务工具重新包装。例如 Portfolio MCP 已经提供明确的持仓读取方法，Native Research 仍可能通过宽泛的 `read_portfolio` 再映射回实际 MCP。

```text
MCP 注册业务工具
       ↓
Runtime 再定义业务 Tool
       ↓
模型调用 Runtime Tool
       ↓
Runtime 解释与映射
       ↓
Host 调用原始 MCP Tool
```

这个结构有历史原因：Native Tool Loop 与 MCP transport 曾独立发展，Runtime 需要统一工具协议、权限和恢复。

但随着 MCP Host 逐渐拥有真实发现、Schema 校验、只读准入与回执，这层重复的业务描述就变成维护负担：名称、Schema、语义和映射可能分别漂移。

我们于是做了第二轮收敛：**MCP 拥有业务工具接口；Tool Surface 投影模型本轮可见集合；Runtime 保留生命周期、预算、执行及恢复事实。**

这次变化又迫使我们重新审视上一轮的精确 `modelToolCeiling`。当时它对 synthetic Web 工具有价值：防止共享 route 误暴露。但迁移到原生 MCP 研究域后，如果一个已批准的 `market` 域有两个合法 sibling，Skill 只提及其中一个方法，继续把 Skill 方法清单当成当前域的最终硬白名单，就可能反过来隐藏合法工具。

因此现行合同作出区分：原始 Run Grant、Host、来源与阶段资源事实决定准入；Skill 描述方法、激活和资源，不凭方法清单撤销已准入的普通 canonical MCP sibling；Tool Surface 只呈现这些既有决定。

这次转折比“三处合一”更重要：**曾经合理的旧约束，在接口 Owner 和抽象层级迁移后，不一定仍然具有相同的权限含义。**

架构升级不能只是保留所有历史限制，再为新结构添加兼容层。旧结构已经失去职责时，它的影子规则也该退出。

## 四、另一个坑：Typed 诊断为什么还能错误隐藏 Web？

工具表面并不只受静态目录影响，还取决于动态可用性。

此前 Web search/read 的可用性由多个调用点拼接 `disabledTools`。我们后来把搜索额度和运行期限转为 typed Owner 事实，在 Effective Contract 中统一投影。

这一轮已经比分散字符串判断更合理，却仍留下风险。2026 年 10 月 21 日的进一步验证发现：Live 和 Recovery 的部分路径还在重新解释诊断字段。一个**与 Web 无关**的工具结果，只要包含与搜索额度耗尽、Web 期限或 provider attempt 相似的字段，就可能在恢复路径里错误隐藏 `market__web_search`。

三个生产装配接缝上的受控 RED 证明了这一点。这不是模型理解失败，而是系统把诊断材料重新提升成了可用性权威。

修复改为消费原 Web Gateway/Host 所产生并经 Run、Scope、Invocation、Connection 身份约束的否定事实。Recovery 只恢复原来封存的受信回执，不从任意 MCP 结果里反解析 Web 状态。

同时必须保留分支：搜索预算耗尽不自动禁止对已有合法 `sourceRef` 的浏览；运行期限耗尽才可能同时限制搜索与浏览。Gateway 的实际调用约束仍独立执行。

**即使一个字段有类型，也不代表它有资格成为授权或可用性事实。关键是哪个 Owner 生产了它，以及它沿什么身份边界被消费。**

这件事并不是 A34 亲自修复的 Bug，却解释了我们为什么拒绝在 A34 中再建一份权限、预算和可用性缓存。

## 五、前面都正确，最终模型请求就一定正确吗？

到这一步，MCP 工具定义可以正确，Run Grant 可以正确，Skill 不再构成第二张白名单，Web 可用性也来自原 Host 事实。

但一次 Research 请求并不会从 Tool Surface 直接抵达 Provider。中间还有上下文拟合、Hook、证据装配、当前 Publication 上下文、异步准备与请求封存。

早期工具表面完全合法，后期也可能被悄悄改变。

2026 年 10 月 21 日，我们审查现有实现：`native-tool-surface.ts` 已提供稳定有序的投影与 `assertNativeToolSurfaceParity`，但实际请求路径依赖若干可选回调，尤其无 Hook 的路径缺乏无条件的最终一致性保证。

这里需要区分两件事。**审查当时还没有发现真实线上工具被意外删除的记录；这首先是一项合同与责任空白。** 因此我们没有直接开发一个新 Manager，而是先在真实请求适配链上构造反例。

第一次受控 RED 中，我们在最终送模前注入工具新增、删除、重命名、重排序、说明和 Schema 变化。13 个应阻止失配的用例在旧路径上仍发生模拟 Gateway dispatch。

这把架构风险变成了可复现的工程缺陷，但它不代表线上发生过 13 次事故。

## 六、只在末端加一次比较，为什么还是不够？

最直觉的修复，是在送模前比较期望工具列表与实际 `request.tools`。难点不在比较算法，而在**期望值从哪里来**。

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

## 七、工具成功被拒绝了，为什么反而还有一项失败？

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

## 八、为什么最后选择逻辑 Owner，而不是 Capability Manager？

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

## 九、收尾时如何处理过期测试

这一轮也不是加完断言就一次全绿。

扩大验证后，我们发现一些旧断言与现行合同不一致，涉及历史 Skill 上限、当前指引与合法的 Deep 控制。我们没有为了绿测恢复旧业务规则，而是逐项对照当前合同，保留原始失败和负向保护，再修正过期断言。

即使模型确实看见了正确工具，它仍可能选错方法或无法完成研究。这属于下一层问题，不能靠 A34 的 GREEN 借分。

## 十、我们最终学到的不是“再加一个校验器”

回顾整个过程：

最初，我们以为 Skill 声明与 MCP 注册就意味着模型能用；后来发现 Native 与 Host 接缝漏了能力。

于是我们统一工具定义，并引入精确 Skill 上限；再后来发现只剩一份定义，仍可能放在错误的 Owner 里。

所以我们删除 Runtime 的重复业务 Tool，把能力接口还给 MCP；随之又需要撤回已不再适合原生研究域的旧白名单含义。

动态可用性问题教会我们，typed 诊断也不能自行取得权限；最终送模的受控 RED 又表明，**早期合法与最终封存都不能单独证明最终请求合法**。

A34 的答案不是造一个更大的 Capability Manager，而是保存独立的原始准入基准，保护最终工具表面的一致性，并让任何局部拒绝回到原执行 Owner 正确结算。

它最终区分了三种不同对象：

- **原始准入事实：** 哪些能力在本轮合法；
- **最终模型请求：** 模型实际上看到什么；
- **请求封存和执行记录：** 系统实际准备、派发和结算了什么。

三者能够关联，却不能互相冒充。

**有些架构升级，是增加一道必要的约束；有些架构升级，则是拒绝增加一个不必要的 Owner。A34 恰好同时体现了这两件事。**

A34 体现了[原则 3「复杂度必须归属正确的 Owner」](/principles#principle-3)：工具表面的原始准入依据和最终请求一致性需要有清楚的负责者，却不必再生出一个包办全部能力的 Manager。具体检查则借助[方法 3「证据传递与投影」](/principles#method-3)，将原始准入事实、模型实际可见投影与最终派发回执分开核对。

---

延伸阅读：[MCP Host：从接上服务到真正用上工具](https://hpoenixf.com/eff-agent-article/articles/mcp-host-from-discovery-to-consumption) · [Model / Runtime / MCP / Skill 的分工](https://hpoenixf.com/eff-agent-article/articles/agent-model-runtime-mcp-skill-boundaries) · [代码越来越便宜，为什么系统却越来越难升级？](https://hpoenixf.com/eff-agent-article/articles/code-cheaper-systems-harder-to-evolve)

更多独立工程案例见 [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article)。如果这些真实架构演进与你正在处理的问题相似，欢迎到 GitHub 阅读、交流或 Star。