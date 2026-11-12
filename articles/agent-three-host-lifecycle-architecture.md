---
title: "把 Agent 拆成三个进程，究竟换来了什么？从单体 Runtime 到独立宿主"
description: "通过一次定时研究和三项可复现的故障，说明把 Core、产品管理和后台 Worker 拆开能得到什么可用性收益、如何守住前台容量与原始回执，以及为什么多进程不等于微服务。"
readingBrief:
  takeaways:
    - "三进程首先让产品管理、普通研究和后台执行拥有不同的存活承诺；受控实验证明 API 重启不必重启原后台 Task。"
    - "拆宿主不能拆业务权威；Task、Run、Provider 和 Publication 的原始身份、资源与结果继续由各自协议负责。"
    - "新后台任务对已登记的同组前台请求让位，但已经启动的工作不抢占；原位容量交接避免释放再领的空隙。"
    - "租约过期不等于旧 Worker 或物理请求已停止；本地端口仍可监听也不等于原 Product 存活。"
    - "验证限于同机进程、隔离 PostgreSQL 与合成模型；尚无生产可用性、延迟或成本改善的量化结论。"
  appliesTo:
    - "同一 Agent 同时提供交互问答、订阅管理与定时后台工作，且需要分别维护这些工作负载。"
  notFor:
    - "没有独立后台存活需求的单次问答应用，或需要跨机器自动恢复、不同版本滚动发布的系统。"
---

<script setup>
import { withBase } from 'vitepress'
</script>

# 把 Agent 拆成三个进程，究竟换来了什么？从单体 Runtime 到独立宿主

用户早上问基金费率，下午确认一项收盘后自动研究，晚上又希望在不打断研究的情况下调整订阅。三个操作都与 Agent 有关，却不应该共享完全相同的“必须在线”条件。

最初，ETF Agent 将普通研究、产品管理和后台任务装在同一个 API 进程。单体并非错误：模型网关、数据库和 Runtime 只需要一套启动装配，开发和排障路径都很短。但后台任务变成用户已经确认的跨时间承诺后，进程结构开始决定产品行为：**维护产品接口，不应该顺带停止正在执行的研究；后台 Worker 故障，也不该让普通问答一起消失。**

这次改造选择三个进程宿主：Core API、Product API 和 Background Worker。真正的收益不是“服务数量变多”，而是把三种运行生命周期分开，同时保留原有任务资格、模型容量和发布结果的权威来源。本文沿一项每天到期的基金研究任务，先看实测收益，再解释为何前台资源、崩溃接管和本地端口让这件事远比拆启动脚本难。

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/zh/01-benefits-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/zh/01-benefits.svg')" alt="拆分前所有能力共享 API 进程，拆分后 Core、Product、Worker 可以独立启停；数据库和 Provider 仍是共享依赖。" loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>图 1｜收益首先来自隔离进程生命周期，不是消除所有共同故障。 <a :href="withBase('/diagrams/three-host-lifecycle/zh/01-benefits.svg')">打开完整图，查看所有状态与分支</a></figcaption>
</figure>

## 一、先算清收益：不是更快，而是可以分别停、分别继续

### 产品服务维护时，已确认的后台研究仍能完成

最关键的一次实验不是检查端口是否启动，而是**让后台任务在模型请求中间等待，随后分别关闭和重启 Core API、Product API**。受控环境使用真实本机进程、隔离 PostgreSQL 和可控的脚本模型。API 两次启停期间，Worker 始终持有同一任务；模型响应恢复后，原 Task 完成，只有一个 Root、一次模型调用，重启后的 Product 能读到原报告。

另一项实验更进一步：先确认约 30 秒后到期的订阅，让两个 API 都退出，保持原 Worker 入口独立运行。到期后，它沿原授权触发一次 occurrence，保存报告和应用内通知。之后 Product 启动，原 History 仍可读取这次结果。**管理服务的存活已不再是原订阅执行的前置条件。**

注意这不是生产零停机承诺：模型返回是合成的，结果证明的是已测试的进程与持久化行为，而不是生产长期可靠率。

### Product 出现故障时，普通研究和已保存成果可以保持独立

用户在管理页面可能暂时不能暂停任务、修改订阅或打开 Task History，但普通问答不需要因此变成 503。隔离测试在 Product 不可达的情况下，仍通过 Core 与 Web 完成了一轮带账户身份的合成研究，保存正文并回读；另一个账户无法读取对应成果。

反方向也成立：Core 停止时，Product 在其原账户和 Schema 可用的情况下仍能管理订阅；Worker 继续运行原已接纳任务。三个宿主只改变**谁必须保持存活**，没有生成第二套授权或第二份报告。

| 受影响的宿主 | 用户能获得的有限独立性 | 未消除的共同风险 |
| --- | --- | --- |
| Product 停止 | 前台研究与原后台任务不必跟着停止 | 管理入口暂时不可用 |
| Core 停止 | Product 管理与合法后台执行可以继续 | 当前前台请求仍可能受中断影响 |
| Worker 停止 | 普通问答、原有报告读取可保持可用 | 新的后台执行可能延迟 |
| 共享数据库或 Provider 失败 | 本次拆分不能自动隔离 | 多个宿主仍可能一起受影响 |

这种收益是**故障影响范围的收窄**，不是“任何部分故障都不影响其他部分”。

### 交互优先级变得可定义，也可验证

如果用户正等着一次普通查询，另一个刚到期的新后台 Task 不应该因为有独立 Worker，就先占用同一模型端点。受控单槽位竞争中，一个已开始的后台任务继续执行；随后已登记的前台请求先获得腾出的 Provider 容量，第二个后台任务在前台完成前没有创建新 Runtime。

这证明了一项有限但有用的调度行为：**前台已经排队时，尚未开始的后台任务让位；已经开始的后台任务不被抢占或扣减额度。** 还不能据此宣称平均延迟、p95 或成本改善，因为没有真实负载下的对照样本。

长远看，三种宿主还提供了更有针对性调整启动、部署与资源的可能性；但本期仍是**同仓库、同版本和共享存储**，并未完成独立版本发布、弹性扩容或运维成本评估。这是设计空间，不是已兑现的量化收益。

## 二、为什么恰好三个，而不是把每个模块都做成服务？

我们先比较了保留单体、Core 加一个外围宿主、三个宿主以及更细粒度的微服务。一个 Core 加外围宿主的方案虽少一个进程，却仍让产品管理的维护与后台执行共享生命周期；每个产品独立数据库的方案则要求重新协调 Task、Run、控制和报告的一致性，当时没有对应收益证据。于是先选三个**部署宿主**，不创建三个新的业务 Owner。

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/zh/02-architecture-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/zh/02-architecture.svg')" alt="Web 分流到 Core 与 Product，后台 Worker 经原任务存储执行，三个宿主共享 Task、Run、Control、Publication 与 Provider 原有权威。" loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>图 2｜三个宿主不是三个领域 Owner；角色确定装配范围，原权威仍负责事实。 <a :href="withBase('/diagrams/three-host-lifecycle/zh/02-architecture.svg')">打开完整图，查看所有状态与分支</a></figcaption>
</figure>

这张图最重要的并不是三个盒子，而是它们下面那条共享事实链：

- **Core API** 管普通会话、前台研究、原结果读取和自己的控制候选。它不再安装已经迁移的 Schedule 消费循环。
- **Product API** 管定时定义、确认、暂停、取消和 Task History。它保留原认证和业务授权，但不构造模型执行 Runtime，也不替普通会话提供第二个入口。
- **Background Worker** 负责到期 Task、新的后台 Run、合法控制唤醒、恢复与通知投递。它直接装配原研究 Runtime，不通过 Core API 的 HTTP 接口冒充独立运行。
- **原有 Owner** 继续裁决业务事实：Task 认领与 fence、Provider 容量、Run 授权和预算、Publication 正文、Control 与通知回执。进程角色只是装配选择，不是权限来源。

真实运行时 Web 对明确的产品管理路径作同源分流，普通会话仍指向 Core；三个宿主复用原身份来源和存储。这样的代价是更多入口、生命周期检查及共享依赖，但避免了三套事实系统彼此同步。

## 三、沿一次定时研究，看它怎样完整跨过三个宿主

假设用户确认：“工作日收盘后检查两只基金的披露变化，并保留来源和时间。”这里是**教学简化任务**，不代表已验证特定金融数据的新鲜度或研究结论。我们的关注点是任务从确认到回读的执行协议。

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/zh/03-journey-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/zh/03-journey.svg')" alt="用户确认定时任务后，Product 保存定义；API 停止时 Worker 仍可读取合法机会、执行一次 Run、提交报告，Product 恢复后读回。" loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>图 3｜完整路径包含准入、运行、发布与回读，且明确 API 停机不等于用户取消。 <a :href="withBase('/diagrams/three-host-lifecycle/zh/03-journey.svg')">打开完整图，查看所有状态与分支</a></figcaption>
</figure>

**第一步：确认，不是开跑。** Product 使用同一账户与 Scope 检查已配置的 Schedule，保存原确认的版本。产品服务此后即使退出，确认事实也不会随进程内存丢失。暂停订阅影响未来到期机会，不自动取消已经启动的 Task；另有受控 interval 测试验证过在途任务继续、未来触发暂停，以及重新确认之后新的合法执行机会。

**第二步：到期和准入。** Worker 读取原持久机会，Task Owner 判断能否认领；Provider Owner 在实际模型请求之前管理共享容量。不同 Worker 不应仅凭同一时间点都看到了候选，就各自新建一个 Run。

**第三步：真正执行。** 研究仍经过原 Runtime、Gateway 和工具。运行结果先由原各项动作记录确认；Publication 保存版本化正文，通知系统只负责通知自身的投递。失败后重试通知，不会重新生成研究。

**第四步：再次阅读。** Product 重启后，用户从原 Task History 追到 Publication 正文。History 读回不是要求原 Worker 仍在线，也不意味着可以在旧进程内存里找回模型对象。

因而，“Core 停止”“Product 不可用”“用户主动 Stop”“暂停未来订阅”是四种不同的事实，不能用同一个 `active=false` 统统处理。

## 四、第一道架构关：前台排队，为什么后台 Run 仍然能先创建？

一开始，Provider 已经具备跨进程 FIFO 队列；但 Task 认领并创建 Run，发生在首个真实模型请求入队之前。在受控故障例子中，一个普通请求占用唯一 Provider 位置，另一条普通请求已经排队，此时新后台 Task 仍能创建 Native Run。**排队次序没有错，错的是比较了不同生命周期的时点。**

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/zh/04-priority-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/zh/04-priority.svg')" alt="Provider 单槽位下，旧后台运行保留占用、已排队前台先执行、新后台等待启动；原位交接启动许可与首个 Entry。" loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>图 4｜非抢占优先级只限制尚未开始的后台任务，并保持原 Provider 容量连续性。 <a :href="withBase('/diagrams/three-host-lifecycle/zh/04-priority.svg')">打开完整图，查看所有状态与分支</a></figcaption>
</figure>

我们不能靠“读取当前队列是否繁忙”解决问题，因为读取之后到创建 Run 之间发生的变化不受这次读取保护。另一个简化方案是为后台启动先借一份 Provider 容量，启动后释放，再让首个 Entry 重新获取；但释放与重取之间出现空档，后来的等待者可能先拿走这份容量。

本次选择沿用原 Provider 准入和 Task 身份：新后台**在启动前**等待有界容量，再把同一份占位在原 Owner 事务范围内绑定给同一 Scope/Run 的第一个 Entry。真正物理发送仍由 Gateway 负责；Task claim、Root 创建和取消仍由原 Task/Recovery 负责。这不是新增“前台优先 Agent”，也不需要模型读一句“请礼让用户”来决定资源。

这里有两个必须保留的例外。已开始的后台 Run 可以继续合法收尾，不被新前台随意抢占；如果 Provider 许可已经绑定或请求已实际派发但回执未知，不能按“新后台应该让位”来释放它。实际优先级只在同一共享瓶颈、有可识别的前台等待和**尚未启动的后台工作**之间成立。

## 五、第二道架构关：旧 Worker 掉线后，新 Worker 凭什么接管？

新的进程可以读到原 Task lease 过期，但这并不意味着旧工作已经停止。旧 Worker 可能只是被挂起、数据库连接短暂中断，甚至仍等待一次外部模型调用。把“租约失效”直接当作“所有动作都可重跑”，会造成重复执行或重复占用。

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/zh/05-recovery-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/zh/05-recovery.svg')" alt="Worker 崩溃后按未绑定启动占位、已绑定请求和已派发未知请求分流；只有有资格的同机槽与 Task fence 可以考虑接管。" loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>图 5｜任务租约过期不等于物理请求停止；已派发且未知的效果不能重新发送。 <a :href="withBase('/diagrams/three-host-lifecycle/zh/05-recovery.svg')">打开完整图，查看所有状态与分支</a></figcaption>
</figure>

受控实验遇到过另一种极端：旧 Worker 获得 Provider 启动占位后，在首个 Entry 绑定前遭 SIGKILL。保守保留占位可以避免错误释放，却可能让新 Worker 在观察窗口内无法接续。为处理这个**尚未绑定请求**的窄场景，工程引入同机 Worker 槽的 OS 锁证明、稳定的文件身份与递增的原 Task fence，支持符合条件的交接。

图中把接管分为三类，而非一个“可重试”开关：

- **尚未创建 Run、占位未绑定 Entry**：新执行者必须确实拥有合格的同机槽，且 Task Owner 确认新的 claim，原 Provider Owner 才能按原身份尝试接管未绑定占位。
- **已绑定 Entry**：不能因为新槽出现就替换原请求资格；原有 Entry 身份与可能的发送结果继续保留。
- **已经物理派发、结果仍未知**：继续隔离未知 Provider 效果，不重新调用模型以制造表面完成。

这些限制增加了状态核验成本，却保护了分离宿主最需要的用户承诺：后台任务可以在支持的故障点接着做，同时**不把旧请求执行两次**。它只在受控 macOS/Linux、同机锁和隔离 PostgreSQL 场景得到验证，不等同跨机器、所有文件系统或真实供应商的通用恢复保证。

还有一项相邻但不同的工作：一般 Child/Peer 唤醒需要可信的停止证明和跨进程活动时间结算。11 月 11 日的相关 Deadline 时间测量已改进，但 Host/Resource 的完整接管资格在当时仍有未完成任务。不能把这部分直接算作三宿主已实现的任意 Child 自动恢复。

## 六、第三道架构关：Product 端口还在，为什么请求可能发错进程？

把 Product 拆为子进程后，本机 Web 仍需要一个产品服务地址。最直观的做法是让子进程监听固定端口，代理继续连这个地址。但一次受控测试发现：原 Product 子进程退出后，夹具中的另一个监听者获得同一个端口，随后接收到**带合成 Cookie** 的产品请求。

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/zh/06-transport-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/zh/06-transport.svg')" alt="旧方案中 Product 子进程退出后固定端口被替代监听者占用；新方案由启动器持有公共端口，经私有 socket 转发，Product 不可用时返回 503。" loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>图 6｜端口不是服务身份，失败必须显式不可用而不是将请求交给未知监听者。 <a :href="withBase('/diagrams/three-host-lifecycle/zh/06-transport.svg')">打开完整图，查看所有状态与分支</a></figcaption>
</figure>

这不是生产凭据泄露，而是一个可复现的服务身份缺口：**端口可连接，不证明它背后仍是原来的子进程。**

本机新设计由原工作负载启动器在整个存活期间持有公开产品监听端口，Product 子进程只取得启动器分配的私有 Unix socket（或对应平台本机通道）。启动器把产品路径转发给这份私有身份；子进程不可用时返回明确的 503。测试中的替代监听者不能再占据对外端口，也没有收到请求，Core、Worker 和 Web 仍保持运行。

更稳妥的端口归属也带来真实代价：`restart` 不能根据端口关闭就宣称整个工作负载停止，尤其是可能根本不监听 HTTP 的 Worker。因此当前本机自动重启仍不可用；需要原启动器先安全结束它实际拥有的子进程，再重新启动。这是刻意保留的能力边界，而非尚未美化的使用体验。

## 七、成本、边界和采用条件：什么情况下不该拆？

综上，三进程提供的直接收益是**独立运行与局部故障隔离**：受控测试证明两个 API 可以重启而原 Worker 继续，产品缺席时 Core 可以研究，Worker 缺席时已有成果仍能按原权限读取。非抢占式前台优先和有界故障交接则是为了让这些收益在共享资源下依然成立。

但是，三个进程不是三倍可用性。它们仍共享 PostgreSQL、Provider 配额、账户与来源权限；部署版本仍按同版本协调，本机运维不能未经证明地重启不明身份的工作。新增的启动、监测、路由、锁身份与失败恢复路径，都增加了正常运行和排障负担。没有同口径生产对照，我们不能声称错误率、p95 时延、Token 成本或运维工时已经下降。

判断是否值得采用，可以从具体要求而不是架构时髦程度出发：如果产品功能维护时，长期任务**必须继续**；如果后台偶发故障不能拖垮前台交互；而且任务、容量、输出已有可信的持久身份，那么把生命周期拆开有明确价值。反过来，只有一次性问答、允许随 API 停止的小系统，保留单进程可能是更好的工程选择。

## 结语：真正拆开的，是运行生命周期

这次演进没有把一个 Agent 改成三套独立的 Agent，也没有新造三个任务数据库。我们拆开 Core、产品管理与后台执行的进程存活条件，继续把授权、容量、控制、预算和已发布正文交给原来各自负责的模块。

**物理独立换来的是更精细的用户承诺，而不是免费的可靠性。** 端口身份、前台队列与崩溃接管这些难点，恰恰说明要兑现“一个服务维护时，另一个服务继续履约”，系统必须清楚谁可以停、谁可以接手，以及哪些外部效果仍然未知。

这才是此次拆分最值得复用的架构经验。

### 延伸阅读

- [定时研究的确认、触发与结果回读](agent-autonomous-scheduled-research.md)
- [Provider 容量队列、租约与未知占用](agent-provider-admission-capacity-lease.md)
- [Worker、Run、Schedule 的运行身份](agent-task-session-run-worker-schedule.md)
- [Run 断线与崩溃恢复为何不同](agent-disconnect-is-not-crash-recovery-contract.md)

**实现依据：** ETF Agent 研发仓库 [三宿主实现](https://github.com/hpoenixf/etf-agent/commit/6490b06e714f30e8359f2b107d54b6252f7b8406)、[Provider/Task 交接](https://github.com/hpoenixf/etf-agent/commit/8baf8cc14b016cd71d3e70c996a2d76a0cae959b) 与 [设计及原始验收](https://github.com/hpoenixf/etf-agent/tree/4ce419d8fa532a3b9349ce0d85ed978af9d50411/openspec/changes/archive/2026-11-11-agent-separate-product-and-background-processes)。本篇描述的是受控工程验证，不宣称开源 Open ETF Agent v0.28 已包含完整三宿主拓扑。
