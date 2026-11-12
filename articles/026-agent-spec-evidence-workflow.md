---
title: '写了 Spec，为什么还不能说做完了？Agent 研发中的证据链与可信验收'
description: '为什么已有 Spec、Git 和 CI，仍需要工程证据？从一次跨版本交接出发，解释证据如何约束完成声明、何时应重验，以及何时应该停止。'
readingBrief:
  takeaways:
    - "证据机制补的是要求、执行、版本与结论之间的关联；已有 CI 能提供这些关联时，不必另造账本。"
    - "证据支持有条件的主张。记录可定位、执行可信、测试充分是三件不同的事。"
    - "旧观察永久保留原身份；相关行为或输入改变时重验，不因换一个会话就把旧通过写成新通过。"
    - "账本贯穿实施前后，Verify 只生成视图；正式关闭、模型质量与发布由各自的验收和授权决定。"
    - "从最小证据索引开始，按协作与风险加机制；已满足约定且无相关变化时，应及时结束。"
  appliesTo:
    - "跨版本、跨会话或多 Agent 接力的开发，以及涉及权限、持久化恢复和模型评测的变更。"
  notFor:
    - "需要自动认证测试真实、证明所有行为正确或替代发布审批的场景；简单修改也无需完整展开。"
---

<script setup>
import { withBase } from 'vitepress'
</script>

# 写了 Spec，为什么还不能说做完了？Agent 研发中的证据链与可信验收

设想一次开发交接。Agent 在版本 A 上通过了数据适配测试，随后又修改了权限逻辑，形成版本 B；真实数据源的集成检查因为缺少隔离环境，没有执行。下一轮会话只留下“测试已通过”，收尾报告最后写成了“新增数据源已完成”。

这是一个**教学构造**，不是项目事故记录。它想说明的不是 Agent 一定会撒谎，而是：原本真实的局部结果，经过版本变化和几次总结，可能失去条件，变成更强的完成声明。

我们加入的证据机制，主要解决这个问题。这里的“证据”指**研发过程中支持工程结论的材料**，不是投研报告引用的市场资料。目标也不是再增加一层文档，而是让接手者能回答：哪项要求，在哪个版本、什么条件下，被什么检查支持；还有什么没有验证，以及为什么现在可以结束。

本文深入讨论证据与验收。需求澄清、设计、规范增量、实施和交接的完整路径，见[Spec 驱动的 Agent 研发全景](/articles/agent-spec-driven-development-panorama)。

## 一、已经有 Spec、Git 和 CI，究竟还缺什么？

Spec 说明预期行为，Git 保存源码变化，测试检查给定条件下的行为，CI 可以记录执行版本、环境和产物。它们都很有价值。问题通常出在**这些事实没有和最终主张连起来**，而不是某个工具天然缺少能力。

以“给基金研究系统新增一个数据来源”为例，需求至少可能包含来源身份、权限限制和失败恢复。测试适配器能够解析一份 Mock 数据，只支持其中一部分。要判断整项变更是否完成，还需要知道：验收承诺有哪些，哪些已覆盖，哪些运行受阻，以及测试之后是否修改了相关输入。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/026-agent-spec-evidence-workflow/01-why-evidence.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/026-agent-spec-evidence-workflow/01-why-evidence.svg')" alt="绿灯之间，还缺一条解释链" width="720" height="746" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 1：工具各自保存事实，证据索引连接它们。若现有 CI 已提供完整关联，就不需要重复建立另一套系统。 <a :href="withBase('/visuals/026-agent-spec-evidence-workflow/01-why-evidence.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

| 已有机制 | 它直接回答什么 | 仍需与结论关联的内容 |
| --- | --- | --- |
| Spec | 期望出现什么行为？ | 哪次执行检查了哪条要求？ |
| Git | 这份源码怎样变化？ | 观察对应哪个实际工作树，后来改了什么？ |
| 测试 / CI | 这次执行检查了什么，结果如何？ | 这些检查覆盖了本次验收的哪些承诺？ |
| PR 或交接总结 | 作者认为当前进展如何？ | 结论能否回到原始执行，而不只回到另一份总结？ |

**如果一套 CI 已经把要求、运行身份、版本、测试范围和剩余缺口完整关联起来，它本身就可以承担证据载体。** 不必因为本文使用 `evidence.md`，就在原有系统旁边再造一份。

对我们这种以 Markdown、长任务和多轮 Agent 协作为主的工作方式，轻量账本是一个容易随变更携带的索引。它主要保存关系和摘要，原始日志仍由原执行器或产物存储维护。

### 为什么 Agent 协作会让这个问题更突出？

同一个 Agent 可以编写需求、实现代码、选择测试，再生成总结。这使工作推进很便利，也意味着**生成结果和解释结果可能共享同一处理解偏差**。即使换一个 Agent，只读前一轮的总结，也不构成独立核验。

此外，会话切换和上下文压缩会改变接手者能看到的材料；实现、测试、集成验证也可能在不同工作树和时间发生。人的交接同样有这些问题，Agent 并没有创造一种全新的工程学，只是让保存原始条件更值得明确设计。

因此，Evidence 的价值不是多一段“请如实汇报”的提示，而是把交接对象从一句“做完了”变成一组可检查的关联。提醒仍然有用，但不应成为唯一载体。

## 二、工程证据支持的是有条件的主张

<div id="三、evidence-ledger-不让-agent-凭记忆重建测试结果" aria-hidden="true"></div>

继续看新增数据源的例子。我们准备支持的主张是：“新增来源不会扩大用户的数据访问权限。”执行了一次越权请求拒绝测试之后，最稳妥的结论是：“版本 A 的这条被测拒绝路径符合要求。”它离“全部权限路径都正确”仍有距离。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/026-agent-spec-evidence-workflow/02-claim-and-observation.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/026-agent-spec-evidence-workflow/02-claim-and-observation.svg')" alt="证据支持的是有条件的主张" width="720" height="818" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 2：教学示例。要求、执行条件、实际观察与原始出处共同限定结论；一个成功样本不能自动扩展成所有路径正确。 <a :href="withBase('/visuals/026-agent-spec-evidence-workflow/02-claim-and-observation.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

一条有用的工程证据至少要让人找到三个东西：**要支持的主张、实际发生的观察、观察成立的条件**。版本、命令、环境、样本与原始产物不是装饰性字段，而是用于限定这三者的关系。

下面是简化的教学记录，不是一次真实运行回执，也不是公开 CLI 的完整输入格式：

```text
Evidence: EV-01
Claim: 新增来源不得扩大数据访问权限
Task: 1.1
Revision: 实际执行的源码 / 工作树身份
Check: 隔离环境中的定向越权请求测试
Observation: 被测请求遭到拒绝
Artifact: 可定位的运行记录与原始输出
Limit: 未覆盖其他权限路径和真实供应商行为
```

`EV-01` 的意义是把“为什么测”与“测到了什么”连起来，不是增加一个编号。只写“通过了很多测试”，没有说明它们和主张的关系，证据仍然薄弱。

### 可定位、可信、充分，不能混成一件事

**可定位**，是记录能回到某次执行与产物；**可信**，是有理由相信执行记录没有被伪造或误关联；**充分**，是这些检查足以支撑当前要作出的判断。

账本主要改善第一件事，并让后两件事更容易接受审查。一个 Agent 同时能修改实现、测试和账本时，完全可能把三者写得彼此一致，却共同误解需求。再增加一个字段并不能解决这一点。

涉及重要权限或外部效果时，可以让既有 CI 执行器保留独立运行身份和受保护产物，并由原有评审、测试和发布机制决定接受与否。这是更强的信任安排，**不是下面的 Evidence Kit 已经具备的认证能力**。文件存在、摘要一致，也不能单独证明一次执行真实或测试充分。

`observed-run` 因而应理解为“记录者声明这是当时实际观察到的运行”，而不是工具授予的可信印章。[公开工具的说明](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/README.md)明确保留了这个限制。

还有一种容易漏掉的证据：**做前状态**。没有基线，做后通过可以支持“现在满足被测条件”，却不能支持“比以前提升了多少”。实施前采不到就写“未采集”；不能用做后结果倒推出一份漂亮的做前数字。

## 三、跨版本、跨会话时，怎样不把旧通过变成新通过？

证据首先是一条历史事实：某个时点，在某组条件下，观察到了一个结果。后续提交不会抹掉它，但也不会自动继承它的全部证明力。

回到开头的版本 A 和 B。若 B 改的是权限判断，A 的适配器测试不能直接证明 B 的权限行为。应该检查改动影响了哪些要求、测试与输入，再重跑相应范围，而不是把历史 `PASS` 改一个日期。

反过来，若只是修正文档中的错字，相关行为、配置、样本和外部条件没有变化，原来的有效关闭记录也不应因为提交号变了，就被迫全部重跑。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/026-agent-spec-evidence-workflow/03-revision-and-reuse.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/026-agent-spec-evidence-workflow/03-revision-and-reuse.svg')" alt="历史事实保留，适用范围重判" width="720" height="800" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 3：旧记录保留原身份，当前判断另做影响分析。图中是维护者的决策方法，不是 CLI 自动比较源码等价性的能力。 <a :href="withBase('/visuals/026-agent-spec-evidence-workflow/03-revision-and-reuse.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

| 记录状态 | 接手者应该怎样使用 |
| --- | --- |
| `observed-run` | 读取原始日期、版本、环境与产物；检查它是否支持当前主张。 |
| `reused-historical` | 明确引用原观察，保留其身份；不伪装成本轮新执行。 |
| `blocked` | 写清缺少哪个前置条件，以及什么变化后可以重试。 |
| 未采集 / 未验证 | 保留未知，不替换成零、通过或默认失败。 |

判断相关性时，不能只看代码 diff。测试数据、提示词、依赖、运行配置和外部服务行为，都可能改变原观察的适用范围。无法确定影响，就保留未验证，而不是让总结替自己作出更强的保证。

这里需要区分两个动作：**读取已有完成记录**，和**接受一个新的变更**。前者可以保留历史结果，后者必须满足当前项目的验收要求。公开 CLI 的 `status` 不比较当前源码与旧测试；历史导入也不能用来满足一个新勾选任务所要求的新观察。

跨 Agent 交接时，移交的应是原观察的定位、相关变更和剩余缺口，而不只是上一位 Agent 的结论。复核者应该能沿这些定位查看原件。若原始日志已经不存在，也应说明可检查性降低，不能从一段聊天回忆重建一份“新鲜运行证据”。

## 四、让证据贯穿开发，但不要把开发变成填表

<div id="二、spec-流的核心不是文件顺序-而是每个阶段留下什么事实" aria-hidden="true"></div>

我们最初加入这套机制，有一个很朴素的原因：希望重要变更结束后，还能说清为什么做、原来怎样、作了什么选择，而不是准备复盘或分享时再翻聊天记录。

2026 年 8 月 30 日的工程记录已经指出，当时材料主要在 Verify 和 Retrospective 阶段集中整理，一些变更缺少独立的做前数据。因而引入持续维护的 `evidence.md`：实施前记录基线或未知，执行时追加观察，收尾时引用已经存在的事实。

这解释了为什么账本不能画成 GREEN 之后才出现的一个步骤。它是**贯穿过程的记录载体**，不是最后补交的报告。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/026-agent-spec-evidence-workflow/04-ledger-through-lifecycle.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/026-agent-spec-evidence-workflow/04-ledger-through-lifecycle.svg')" alt="证据贯穿开发，不是最后补写" width="720" height="780" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 4：基线先于实现，观察随执行追加，Verify 是已有记录的视图。流程允许回到前面的决策与实现，不是不可逆的瀑布。 <a :href="withBase('/visuals/026-agent-spec-evidence-workflow/04-ledger-through-lifecycle.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

<div id="一、先区分两件事-现在的系统是什么-准备改成什么" aria-hidden="true"></div>
<div id="proposal-先定义问题-而不是先承诺实现" aria-hidden="true"></div>
<div id="design-记录选择-而不是复制需求" aria-hidden="true"></div>
<div id="tasks-一个工作单元-不是四个重复-checkbox" aria-hidden="true"></div>

验收前只需明确三个不同对象：Spec 约定应当出现的行为，代码实现这些行为，执行记录说明某个版本实际观察到了什么。三者需要对应，任何一个都不能替另外两个作证。

对行为测试，RED 应实际触及目标行为并因该行为未满足而失败。数据库未启动或测试无法加载，是环境或装配失败；应如实记录，不能借此声称目标行为已被检验。纯文档检查可以直接记录 CHECK。

### 同一观察只保存一次

<div id="四、从「写一份-verify」变成「从证据生成-verify」" aria-hidden="true"></div>
<div id="六、一次真实演进-我们为什么主动简化-spec-收尾" aria-hidden="true"></div>

有了账本后，新的问题出现了：命令与结果又被复制进 Tasks、Plan、Evidence 和 Verify。2026 年 10 月初的收尾改造，针对的正是这些重复维护，而不是继续增加验收层次。

Tasks 维护工作状态，Evidence 保存实际观察，Verify 形成验收结论。计划只链接必要的执行入口，不再复制命令与结果。`spec:verify` 把 Verify 变成已有账本的生成视图：保留原始日期和版本，输入变化时报告陈旧，拒绝覆盖手写 Verify，也拒绝越界路径和符号链接绕行。

这里有两个不同的“新鲜度”。**视图新鲜**，表示 Verify 与当前账本一致；**证据适用**，表示账本中的观察仍能支撑当前判断。生成器检查前者，不会自动证明后者。让旧观察重新生成一份今天的视图，不会产生今天的新执行。

原项目将结构检查分成 `plan`、`apply`、`verify`：分别看任务最低可操作性、完成任务对应的观察，以及状态与结论的一致性。它们不执行产品验收，也不判断模型回答质量。工件顺序与完整研发路径由[全景文章](/articles/agent-spec-driven-development-panorama)统一说明。

历史交接也在这一轮明确区分 `none`、`candidate` 和 `history`。没有值得长期保留的新判断，就不必为了归档写一篇工程史。这个调整有局部验证和关闭记录，但没有量化开发时间下降；它的可解释价值是**把同一事实的维护位置收拢了**。

## 五、什么时候可以结束？完成不是单一的布尔值

<div id="五、什么时候才算关闭-还有哪些事情不能借分" aria-hidden="true"></div>

实现完成、本地合同通过、真实集成通过、模型质量评估、正式关闭和发布，是不同维度。它们不是“得到一个 PASS，就自动升到下一层”的阶梯。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/026-agent-spec-evidence-workflow/05-scoped-completion.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/026-agent-spec-evidence-workflow/05-scoped-completion.svg')" alt="完成不是一串自动升级的绿灯" width="720" height="840" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 5：教学示例。三条验证路线独立保留状态；缺少当前范围必需的门禁时不能关闭，关闭也不授予发布权限。 <a :href="withBase('/visuals/026-agent-spec-evidence-workflow/05-scoped-completion.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

假设这次明确承诺的是“离线适配器与权限拒绝合同”，真实供应商质量属于后续独立工作，那么本地验收可以支持这份有限交付。若当前承诺本来就包括真实供应商接入，集成受阻就意味着这一项尚未完成。不能在失败后偷偷缩小范围，再宣布原承诺已经兑现。

原项目使用独立的 `spec:close` 执行本次声明所需的门禁。全部任务勾选只代表任务状态，不能替代正式关闭。关闭准备任务可以完成，同时把 `formal close: not-run` 保留下来；否则很容易形成“任务要等关闭成功，关闭又要等全部任务勾完”的循环。

```bash
# 原项目入口：静态就绪诊断与实际关闭是两个动作
pnpm run spec:close:doctor --change example-change
pnpm run spec:close --change example-change
```

`spec:close:doctor` 用于首次关闭前汇总静态阻塞，不执行付费模型，也不把 ready 提升为通过。`provider-free` 路线证明声明范围内的本地确定性和 Mock 合同，不证明真实模型的长期质量。未满足必要条件时，保留具体缺口，定向修复或等待前置条件；独立完成的部分仍可按实际范围报告。

<div id="三种容易混淆的结果" aria-hidden="true"></div>

已有成功关闭回执且没有相关行为变化时，归档可以复用原结果，同步已接受规范，再按实际价值做历史交接。为了补写一段总结重新启动整套验收，通常没有新增判断价值；但正式计划要求的新检查、实际输入变化或新的失败，仍需处理。

**停止条件应该在工作开始时就能解释，而不是在结束时临时发明。** 当前承诺已经得到所需支持，剩余工作确实在已约定范围之外，记录又足以让接手者核查，就可以结束当前阶段。这与[分期交付](/principles#method-4)、[验证与故障归因](/principles#method-5)是一回事：划清承诺，按对应证据作判断，而不是无限追求更大的通过数字。

## 六、在自己的项目里，从最小证据索引开始

<div id="八、哪些项目适合这样做" aria-hidden="true"></div>

先问现有 PR、CI 和测试报告能不能回答本文的问题。能够回答，就沿用它们。只有交接成本、证据分散或风险边界真的需要时，再加入账本与结构检查。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/026-agent-spec-evidence-workflow/06-adoption-boundary.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/026-agent-spec-evidence-workflow/06-adoption-boundary.svg')" alt="按协作成本与风险，选择最小方案" width="720" height="782" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 6：采用强度取决于协作和风险，而非文件数量。高风险场景需要可信执行与原有受保护验收，不能只增加 Markdown。 <a :href="withBase('/visuals/026-agent-spec-evidence-workflow/06-adoption-boundary.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

一个最小实践可以非常简单：在需求旁写清可观察的完成条件；执行时保存原始运行的定位、版本和范围；收尾时把结论链接到这些观察，并留下未知。不要复制全部日志，不要为了统一形式给每次拼写修正建立完整变更目录。

### 公开工具能帮到哪一步？

<div id="七、从内部流程到独立工具-openspec-evidence-kit" aria-hidden="true"></div>
<div id="为什么没有做成第二个验收系统" aria-hidden="true"></div>

我们将任务与观察的结构检查、Verify 生成、完成记录读取，抽成了 [OpenSpec Evidence Kit](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit)，现在由 **Agent Engineering Suite 的 Spec Flow 模块**维护。[历史 v0.1.0](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/legacy/openspec-evidence-kit-releases.json)及[迁移记录](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/legacy)保留在统一仓库中，不表示整套插件的当前版本或验收范围。

职责是刻意分开的：**测试执行器执行，开发者或 Agent 记录，CLI 检查结构，项目原有负责人决定接受与发布。** 它不执行你的测试，不认证 `observed-run` 的真实性，不判定测试是否充分，也不提供原项目的 `spec:close`。

本文固定的公开源码要求 Node **26.11.1–26.x**，MIT 许可，无运行时依赖，不需要数据库或模型密钥；也可以处理普通本地目录。可选的 [`evidence-driven` Schema](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/schema/evidence-driven)是 OpenSpec 适配，不是内部 `superpowers-bridge` 的整体复制。相关实践归属见 [NOTICE](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/NOTICE.md)，包含 Superpowers 对设计与测试实践的影响。

### 跑通自带示例，再接入项目

<div id="先-clone-并运行自带离线示例" aria-hidden="true"></div>

下面固定到本文核对的源码，不依赖未来 main 的变化。Skill 与插件安装另见[该版本安装说明](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/installation.md)。

```bash
git clone https://github.com/hpoenixf/agent-engineering-suite.git
cd agent-engineering-suite
git checkout 3b515de2f30e25b1e0757243f3ce4d1be19b00b0
cd skills/aes-spec-flow/toolkit
node bin/spec-evidence.mjs lint --root examples --changes-dir changes --change example --stage apply
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example --check
node bin/spec-evidence.mjs status --root examples --changes-dir changes --change example
```

`verify` 生成 `examples/changes/example/verify.md`，`--check` 检查视图与输入是否一致。**示例中的任务、观察和完成记录都是虚构格式材料**；命令读取到 `recorded-complete`，不代表这些测试刚执行过，更不表示你的项目已经通过验收。

<div id="一条任务怎样形成可以检查的记录" aria-hidden="true"></div>

接入项目时，先看[Evidence 模板](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/schema/evidence-driven/templates/evidence.md)和[准确字段格式](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit/docs/evidence-format.md)。稳定任务 ID、实际版本、可定位产物和原始来源比字段数量更重要；真实记录必须在观察之后填写。

默认完成任务要求有序的 `RED → GREEN`；`[check-only]` 对应 CHECK，`[baseline-green]` 对应 BASELINE → VERIFY，`[tests-after]` 明确记录事后 VERIFY。标签不能替项目批准例外，历史导入也不能冒充新观察。

`lint --stage apply` 检查已完成任务的阶段记录和本地产物；`verify` 在任务完整、记录可用时生成视图，`verify --check` 只检测视图陈旧。`status` 则读取项目自行提供的 `completion.json`：保留原日期、版本及路线，不重跑检查，不比较当前源码是否仍适用。工具检查的是记录结构，接受变更仍由项目负责。



完整套件及各模块关系见 [Agent Engineering Suite 介绍](/articles/agent-engineering-suite)。先采用能减少实际交接成本的那一部分，不必从完整流程开始。

---

工程中不可能让每个判断都完全确定。证据体系更实际的价值，是让不确定性在交接、总结和关闭时仍然可见，不被悄悄写成确定的事实。它既帮助我们知道什么时候还不能说做完，也帮助我们在证据已经足够时，放心结束当前工作。

本文保留[原中文阅读链接](https://hpoenixf.com/eff-agent-article/articles/026-agent-spec-evidence-workflow)与[完整英文版](https://hpoenixf.com/eff-agent-article/en/articles/026-agent-spec-evidence-workflow)。源文和工程讨论见 [GitHub 技术文集](https://github.com/hpoenixf/eff-agent-article)；欢迎 Star 支持。
