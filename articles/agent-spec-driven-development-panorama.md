---
title: 'Spec 驱动的 Agent 研发全景：从需求澄清到可信交付'
description: '沿一次 MCP 文件接入变更，完整理解需求澄清、方案选择、规范增量、任务拆分、TDD、独立复核、验收与归档；也说明何时不必展开整套流程。'
readingBrief:
  takeaways:
    - "Spec 流程保存的是一项变更的承诺及其来路，不是要求 Agent 按顺序填满所有文件。"
    - "Proposal 界定问题与范围，Design 保存选择理由，Spec 约定可观察行为；三者回答不同问题。"
    - "完整设计与当前实施分开，按可交付结果组织工作；必要权限和正确性不能推迟到后期。"
    - "TDD、独立复核与验收各有职责，真实观察贯穿执行；局部绿灯不能替代生产接线与最终消费。"
    - "关闭、规范同步、归档和发布分别处理；完成后留下有价值的判断，删除重复维护。"
  appliesTo:
    - "已有代码库中的跨模块变更、需要接力的 Coding Agent 任务，以及想建立轻量 Spec 工作流的工程团队。"
  notFor:
    - "把文档数量当作质量指标，或希望安装工具就自动获得正确需求、真实模型效果和发布批准的场景。"
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Spec 驱动的 Agent 研发全景：从需求澄清到可信交付

“让 Agent 能读取业务工具返回的文件。”听起来只是给工具结果加一个解析器。真正动手时，问题却会接连出现：谁能让系统下载文件？凭证放在哪里？只解析了一部分，模型会不会当成全文？文件是否默认进入长期知识库？旧工具的返回结构能不能改变？

这些并不都是编码问题。它们先后决定了我们要交付什么、允许怎么做、怎样判断完成，以及下一位开发者接手时还能相信什么。Spec 驱动研发，就是把这些决定保存成可维护的工程上下文，再让实现与观察持续校正它。

本文沿 ETF Agent 中一次真实的 **MCP 返回文件接入**变更，讲清从需求到交接的完整路径。案例采用 2026 年 9 月底至 10 月初的设计与观测记录，文中的精简规格是教学改写；它不是对当前部署版本的认证。这里负责开发的是 Coding Agent，被开发的产品则是研究 Agent，二者不要混淆。

## 一、先看整体：我们在交接什么，而不是先写哪些文件

一项变更最初只是意图。讨论后，它成为有边界的承诺；设计把承诺变成可实现的方案，规格把关键行为写清，任务组织执行，证据支持验收。被接受的变化随后进入现行规范，重要的取舍进入工程历史。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" alt="从意图到可交接的变更" width="720" height="836" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 1：主线保存一项变更的承诺、实现与接受依据。证据贯穿全部阶段，反馈返回受影响的决定。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/01-change-lifecycle.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

这条路径不是不可回头的审批流水线。实现发现某个旧接口不适用，可以调整设计；测试揭示需求矛盾，应回到需求，而不是硬改代码迎合两份互斥的要求。**返回哪里，取决于哪一个决定被新事实推翻。**

我们组合了几种已有方法。[OpenSpec](https://openspec.dev/)提供现行规范与变更增量的组织方式；[Superpowers](https://github.com/obra/superpowers)强调先澄清设计、分解执行、测试驱动和复核；项目自己的证据、关闭与历史交接约定，用来承接长期协作中的执行事实。它们有交集，并不是彼此缺失某项能力的证明。

[GitHub Spec Kit](https://github.github.com/spec-kit/)也提供 Spec → Plan → Tasks → Implement 的结构化路径。已有团队可以沿用自己的体系；真正需要迁移的是“每个决定由谁保存、后续如何使用”，而不是所有目录和命令。

在我们的实现里，`superpowers-bridge` 是组织工件的自定义 Schema。Schema 决定有哪些工件、依赖哪些输入，不意味着每项变更都必须生成全部可选文件。小改动用 PR 描述、现有测试与 CI 就能解释清楚时，不必展开完整流程。

## 二、从一句需求到一份可验收的承诺

案例的原始缺口很具体：业务 MCP 可以返回基金说明书、产品文档或文件引用，但每个业务 Skill 若自行处理下载、鉴权、格式识别和解析限制，就会承担一套重复且敏感的基础设施工作。

代码库并不是一片空白。它已有研究资产、来源身份、当前任务中的材料工作区，以及通用的材料搜索和读取能力。缺的，是**把可信工具结果里的文件接到这些已有能力上**，而不是重新建设一座文档平台。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" alt="先找缺口，再确定承诺" width="720" height="819" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 2：案例不是从零建设文件平台，而是补齐可信工具结果与现有材料工作区之间的连接。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/02-request-to-commitment.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

### 澄清先找事实，再问决定

开始前，Coding Agent 应先读相关现行规范、入口与测试，确认已有能力、缺口及受影响的职责。仓库里能查到的事实，不应该转化成一串问题交给用户回答。

真正需要讨论的是产品选择：先支持哪些格式？扫描件是否纳入首期？文件只在本次任务使用，还是默认长期保存？这些选择会改变工作规模、权限和验收，不能由实现者在编码时悄悄决定。

案例最终将首期限定为带文本层的 PDF、DOCX、XLSX 和静态 HTML。扫描件 OCR、图表理解、旧 Office 格式、自动向量入库不属于首期完成条件；也不增加让模型自行挑选的 `read_pdf`、`read_excel` 等格式专用工具。

### Proposal 保存的是承诺

提案（Proposal）可以很短，但至少要回答“为什么改、改变什么、不做什么、怎样验收”。下面是从真实范围压缩出的教学版本，不是要求复制的模板：

```text
问题：可信 MCP 返回文件，尚无统一路径进入现有材料工作区。
交付：获准文件转为当前任务可搜索、可读取的材料。
保留：原工具身份、业务字段、来源定位和访问权限。
不做：OCR、自动长期入库、任意 URL 下载、新格式专用工具。
验收：本地格式夹具走通真实 Host 接线与工作区读取；覆盖拒绝和部分解析。
```

这份承诺已经排除了两种“看似完成”：解析函数有输出，但模型从正常入口读不到；所有文件都成功入库，但未经批准扩大了持久化范围。

首期排除 OCR 是减少能力范围，不能顺带排除权限校验。**可延期的是增强功能，不是当前交付成立所必需的正确性与安全约束。**

## 三、Design 解释选择，Spec 固定可观察行为

### 先比较合理方案，再决定接在哪里

在这个案例中，至少有三种合理路线。业务 Skill 各自解析，对一次性脚本可能最快；增加格式专用工具，适合产品明确需要模型操作格式细节的情形；统一放在 Host 的工具结果处理路径，则适合已有通用材料工作区、又希望隐藏凭证和解析细节的系统。

这里的 Host 指实际执行工具、管理权限并装配结果的宿主程序。案例选择第三种：宿主验证文件描述后，获取内容、进行有界解析，再注册到已有研究资产与工作区。模型继续使用通用材料搜索和读取，不接触获取凭证。

代价同样要写进设计：集中处理意味着要维护格式适配、资源上限、错误分类和接线测试。只有当多个来源共享这些要求时，这份成本才有理由由公共能力承担。一个无鉴权、只读小文本的单用途脚本，未必需要同等设计。

Design 还保存那些容易被“顺手优化”破坏的选择。例如，一个附件失败不能删除工具已经返回的其他安全业务事实；内容相同不意味着当前仍有访问权限。该阶段最终采用任务内临时存储，没有实现跨任务解析缓存，不能把设计里讨论过的缓存能力写成已经交付。

### 规格不是实现清单

规范（Spec）约定外部可以观察到的行为，通常用 Requirement 和 Scenario 组织。它不应该把“创建一个类、增加一个文件”当成功能契约，否则换一种实现就必须重写用户需求。

```text
Requirement：未经准入的输入不得触发文件获取。
GIVEN：模型文本中包含一个 URL，但没有可信工具结果绑定。
WHEN：系统处理这段输出。
THEN：不得发起文件获取；其他安全业务结果保持不变。

Requirement：解析不完整时保留真实覆盖范围。
GIVEN：文件因资源上限只解析了部分内容。
WHEN：模型读取已解析部分。
THEN：返回可读材料与部分覆盖状态，不把未解析区域解释为没有内容。
```

这是教学规格，表达的是案例的关键行为，并非原始条款逐字摘录。正常路径、拒绝路径和部分成功路径一起出现，后面的测试才有机会发现“成功得不对”。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/03-spec-delta.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/03-spec-delta.svg')" alt="提议的变化，不是现行事实" width="720" height="852" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 3：待实施增量与现行契约分开维护；未满足声明范围的验收时，不把提议写成已接受事实。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/03-spec-delta.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

现行规范保存在 `openspec/specs/`，本次变更的规范增量保存在 `openspec/changes/<change>/specs/`。`ADDED` 新增要求，`MODIFIED` 修改旧要求，`REMOVED` 移除旧要求，`RENAMED` 调整名称。修改和删除必须知道原要求是什么；新增内容暂时不在现行规范中，并不是遗漏。

这些规则在本项目按声明范围验收后同步。规范被接受仍然是一项工程决定，不是某个部署版本已经通过实测的证明。若代码、测试和规格冲突，先查冲突来源，而不是把任意一份当作绝对真理。

## 四、完整设计可以很远，实施承诺必须能落地

一个常见陷阱是：为了设计完整，顺便把 OCR、知识库、跨任务缓存、管理界面和运行统计都排进同一期。每一项单看都合理，合在一起却让第一条可用路径不断后移。

案例的首份结果是：一个获准文件经过真实宿主入口，变成当前研究任务能够读取的材料。为达成这件事，准入、解析、来源定位、工作区接线必须一起考虑；自动长期入库和更丰富的内容理解则可以后置。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/04-delivery-scope.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/04-delivery-scope.svg')" alt="完整设计，不等于本期全做" width="720" height="840" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 4：完整结果包括必要保护，增强能力留在本期承诺之外。是否分期取决于交付，而不是目录大小。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/04-delivery-scope.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

分期应沿着可交付结果切，而不是简单分为“先写全部后端，再写全部前端”。读者可以根据自己的目标选择更小的首期，例如先支持一种格式；但这只是采用建议，不是把案例原本的四格式验收改写成一格式。

同一份 Spec 可以说明完整方向，同时明确当前期承诺。只有工作确实有独立负责人、独立结果或独立关闭生命周期时，才有必要拆成多个 change。若原承诺仍包含多个阶段，第一阶段通过不能冒充整项关闭。

范围发生变化时，Proposal、Tasks 和验收条件也要同步。只在聊天里说一句“MVP 优先”，执行者仍照着旧清单推进，并没有真正缩小范围。已有失败和延期工作应保留去向，不能通过删掉记录制造完成。

## 五、把规格变成能交接的工作，而不是更多 checkbox

案例把实现组织成三个有凝聚性的工作单元：可信描述与获取、格式解析与覆盖、工作区接入与生命周期。每个单元对应一组行为和可检查的结果，而不是给每条 Scenario 再复制 RED、GREEN、REFACTOR、VERIFY 四个任务。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" alt="按依赖组织工作，按结果交接" width="720" height="835" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 5：开发依赖示意，不是历史并发调度或运行时数据流。共享接口先稳定，再并行独立工作。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/05-work-and-handoff.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

`tasks.md` 负责工作状态；复杂依赖确有需要时，`plan.md` 再说明顺序、接线位置和测试入口。任务必须让接手者知道该改什么、不能越过什么、怎样判断做到了，不需要让他再读一份重复需求。

下面是工作单元的教学简写。它描述从哪里接入、保护什么和怎么验证，而不是预先替实现者决定每个函数：

```text
工作单元：可信文件接入。
输入：宿主已经验证的工具结果及当前任务范围。
结果：获准附件进入解析，拒绝附件留下局部失败状态。
保护：不改原工具身份和业务字段，不向模型泄露凭证。
验证：同一入口覆盖获准文件、伪造描述和单附件失败。
交接：输出结构、定位规则、当前版本、实际观察与剩余缺口。
```

多 Agent 并行不是必须项。接口和测试前提还没稳定时，提前分给多个执行者，可能只是同时制造几套不兼容的假设。先约定共享接线和输出合同，再让独立部分并行；图中展示的是按依赖组织工作的建议，不代表该历史变更真的采用了图示并发调度。

每个执行者应有明确的修改范围。相邻模块的问题可以记录给对应负责人，但“读到了某个依赖”不自动授予修改它的权限。最后还必须有人负责将各单元接回真实入口；模块各自通过，并不会自行组合成可用功能。

## 六、执行时让事实进入流程：TDD、接线与独立复核

TDD 的价值，是先让一条有辨别力的测试暴露缺失行为，再用实现改变它的结果。它不是“日志里出现过红色，再出现过绿色”。如果测试没有加载、数据库没启动，先修测试前提，不能把环境失败当作业务 RED。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/06-execution-and-review.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/06-execution-and-review.svg')" alt="测试、接线、复核不是同一件事" width="720" height="849" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 6：行为测试、生产接线和独立复核各有问题要回答；环境报错不能替代业务失败观察。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/06-execution-and-review.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

案例留下了一条很有解释力的观察：最初资产层的测试通过了，但记录明确写着，可信描述准入、获取适配和工作区暴露仍未验证，所属任务尚未完成。原因很简单：**能把字节注册为资产，不等于业务工具返回文件后，研究 Agent 就能读到它。**

后续检查才将本地文件夹具送过真实的宿主结果接线，并从同一任务的工作区读取，检查来源定位、部分覆盖、撤权和跨范围不可访问。这些本地检查支持的是接入合同，不是生产文件服务可用性，也不是模型研究结论质量。

证据账本从实施前就开始：先保留基线或未知，RED、GREEN 和集成检查发生时追加实际版本、结果与产物。它不能等到全部实现结束，再由 Agent 根据记忆生成一份完美故事。字段和复用规则由[证据与可信验收专题](/articles/026-agent-spec-evidence-workflow)展开；理解全流程只需记住：执行发生在哪里，观察就从哪里进入记录。

### 独立复核先看约定，再看实现

复核可以分成两个问题：实现是否满足原本承诺；实现方式是否带来不必要的耦合、权限扩大或难以维护的状态。两者可以由同一个评审者完成，不必机械地增加两个角色。

复核者应直接看相关要求、diff、实际测试与原始结果，而不只读实现者的总结。使用另一个模型、开一个新会话都不能自动保证独立；关键是预期依据和观察依据不能完全来自同一份自述。

一旦复核发现测试只覆盖资产注册，没有覆盖工具到工作区的接线，就应补上缺失路径，而不是继续增加同类解析断言。测试数量上升，不代表离用户结果更近。

## 七、新事实出现后，回到被推翻的决定

Spec 驱动不意味着规格写完就不能改。相反，它让调整更有针对性：先判断是承诺改变、方案不适用、实现错误，还是执行环境缺失，再修改负责那项事实的材料。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/07-feedback-routing.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/07-feedback-routing.svg')" alt="新事实应该推翻哪一个决定？" width="720" height="844" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 7：按最早失效的判断选择返回位置；缺条件只阻塞相应路线，撤回也是一种有效结果。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/07-feedback-routing.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

例如，客户现在要求扫描件也必须可读，改变的是范围与验收，要先重新确定实施承诺。若要求没变，只是解析器错误地把截断标为完整，则应修实现和对应测试，不必重写 Proposal。若缺少供应商凭证，就记录这条验证路线的前置条件，继续完成独立的本地工作。

| 观察到的变化 | 优先回到哪里 | 不应顺手做什么 |
| --- | --- | --- |
| 用户改变交付范围 | Proposal、相关规格与任务 | 只改聊天总结，保留旧验收清单 |
| 原方案违反已有约束 | Design 和受影响合同 | 用更多补丁掩盖职责冲突 |
| 实现不满足有效要求 | 代码、测试及对应观察 | 为了绿灯削弱正确要求 |
| 环境或授权不足 | 对应验证路线与恢复条件 | 反复执行同一失败命令，或把它算作通过 |

同一环境、版本和权限条件没有变化时，重复运行一个已知受阻的命令通常不会提供新信息。保留具体缺项和重试条件，比不断生成“仍未通过”的新报告更有用。

变更也可能被放弃。这时应保留放弃理由，停止实现，并明确哪些提议没有进入现行规范。撤回一个不再值得做的方案，是流程的有效结果，不需要为了完整度把它做完。

## 八、关闭、归档和发布，各自结束什么？

Verify 回答“根据现有观察，哪些承诺已得到支持、哪些仍有缺口”。它可以是证据账本的生成视图，但生成不会执行测试，也不会产生新的通过事实。

正式关闭则按项目声明的验收路线执行。任务勾完是工作状态，关闭准备完成也只是材料齐备；二者不能替代真正的验收动作。本项目的 `spec:close` 属于项目自己的机制，不是 OpenSpec 或公开 Evidence Kit 自动提供的通用发布命令。

<figure style="max-width:640px;margin:2rem auto">
<a :href="withBase('/visuals/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" target="_blank" rel="noopener" aria-label="在新标签页查看完整图"><img :src="withBase('/visuals/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" alt="验收结束后，分别交接三件事" width="720" height="857" loading="lazy" style="width:100%;height:auto" /></a>
<figcaption>图 8：验收成功后同步规范、归档与交接有价值的历史；缺口继续处理，发布始终是独立动作。 <a :href="withBase('/visuals/agent-spec-driven-development-panorama/08-close-and-handoff.svg')" target="_blank" rel="noopener">查看完整图</a></figcaption>
</figure>

在该历史案例中，声明的是本地确定性接入合同，因此可以用本地格式夹具和受控适配验收，不必为了凑完整流程调用付费模型。若承诺的是“研究 Agent 能正确引用真实基金文件”，就还需要真实任务和引用质量的相应评估，不能借用前一种通过。

关闭成功后，将已接受的规范增量同步到现行规范，再归档变更。这样下一个 Agent 先读到的是现行合同，而不是把一个过时 Proposal 当作今天必须实现的需求。

History 保存的是未来决策有用的理由，例如“为什么解析放在宿主而不是业务 Skill”“为什么材料默认只在当前任务使用”。它不必复制所有日志；没有独有收获时可以不晋升为正式历史，已有候选也不必因归档再写一份。

历史案例保留了当时的本地关闭回执；后续 DOCX/XLSX 修复另有定向验证，其任务说明仍将新的正式关闭标为待完成。这个区别必须保留：旧验收不能替后来改变的代码背书，本文也不把那份历史回执解释成今天的生产认证。

发布由原发布流程处理，包括授权、部署和必要的真实读回。归档不是发布批准。反过来，已有有效关闭记录、只是在整理文档，也不应为了形式完整重启整套验收。

## 九、把整条流程带回自己的项目

读完后，可以从一项实际变更开始，而不先搭建流程平台。先检查现有 PR、CI 和文档能否保存承诺、执行和结论；不足的部分再补。一个可理解的目录示意如下，可选工件按实际需要展开：

```text
openspec/
  specs/<capability>/spec.md       # 已接受的行为契约
  changes/<change>/
    proposal.md                   # 为什么改，本期承诺什么
    design.md                     # 必要的备选、选择与代价
    specs/<capability>/spec.md     # 这次改变哪些行为
    tasks.md                      # 有凝聚性的工作单元
    plan.md                       # 需要时补执行依赖和测试入口
    evidence.md                   # 实施前基线与执行观察
    verify.md                     # 结论及剩余门禁
```

这不是“少一份文件就不能工作”的清单。若一个小修改能用 PR 清楚说明，且现有 CI 已保存适用版本与结果，继续用它。若一项任务开始跨会话、跨负责人，或涉及权限与恢复，才需要更明确的持久约定和交接。

### 可公开复现的是哪一部分？

[Agent Engineering Suite 的 Spec Flow](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow)提供公开方法入口和工具材料，其中 [Evidence Kit](https://github.com/hpoenixf/agent-engineering-suite/tree/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/skills/aes-spec-flow/toolkit)可以本地检查任务与观察的结构、生成 Verify、读取已有完成记录。它不执行项目测试，也不复制本项目的正式关闭和发布权。

准备 Node 26.11.1–26.x 后，可在固定源码上运行下面的离线格式示例；无需模型密钥或数据库：

```bash
git clone https://github.com/hpoenixf/agent-engineering-suite.git
cd agent-engineering-suite
git checkout 3b515de2f30e25b1e0757243f3ce4d1be19b00b0
cd skills/aes-spec-flow/toolkit
node bin/spec-evidence.mjs lint --root examples --changes-dir changes --change example --stage apply
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example
node bin/spec-evidence.mjs verify --root examples --changes-dir changes --change example --check
```

可观察产物是示例目录中的 `verify.md`，而不是一项新的产品验收通过。示例记录是虚构格式材料；检查器读到它们，不等于实际执行过那些测试。具体安装方式见[固定版本说明](https://github.com/hpoenixf/agent-engineering-suite/blob/3b515de2f30e25b1e0757243f3ce4d1be19b00b0/docs/installation.md)，当前维护入口仍是[同一模块的 main](https://github.com/hpoenixf/agent-engineering-suite/tree/main/skills/aes-spec-flow)。

本文案例取自原项目的工程过程，不声称这些业务接入能力都随公开工具提供。工具帮你维护记录，仍需你为具体产品定义行为、选择验证方法，并完成真实接线。

---

回看文件接入这个任务，Spec 流程没有替我们发明解析算法。它帮助保住了几项容易在开发中丢失的决定：只接可信来源，不扩大权限，复用已有材料工作区，部分内容不冒充全文，首期不顺手变成文档平台；再让实现、测试和交接围绕这些决定前进。

一套值得长期使用的流程，应该让下一位执行者更少猜测，让评审者更容易核对，也让当前负责人知道何时可以结束。为达成这些目标，增加必要记录是设计；合并重复文件、推迟无关工作、删去没有判断价值的门禁，同样是设计。

验证机制继续读[证据链与可信验收](/articles/026-agent-spec-evidence-workflow)；整个项目的质量责任见[AI Coding 质量全景](/articles/ai-coding-quality-panorama)。前者回答“凭什么接受”，本文回答“一项变更怎样走完”，后者回答“怎样对整个系统负责”。
