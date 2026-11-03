---
description: "Skill 与普通 Prompt 有什么区别？从一个基金比较任务出发，解释 SKILL.md、按需发现与加载、Host 工具授权、受审脚本执行及真实的安全边界；Bundle 只放在进阶附录。"
readingBrief:
  takeaways:
    - "Skill 的正文仍是指引；相较单纯 Prompt，工程价值来自 Host 的注册发现、渐进加载、资源组织、执行与回执。"
    - "Skill 不能自己授予工具或数据权限；脚本若获准执行，还必须单独审查它实际拥有的操作系统权限。"
    - "ETF Agent 的受审包脚本具有路径、期限与输出约束，但不是独立沙箱；Docker Analysis Sandbox 是另一条隔离执行路径。"
    - "一次基金研究可以组合多个 Skill，按证据缺口交付部分结果；Bundle 只是组织扩展，不是理解 Skill 的前提。"
  appliesTo:
    - "正在设计 Agent Skill 加载、复用、受审脚本及权限治理，希望知道哪些能力来自 Skill、哪些来自 Host 的工程师。"
  notFor:
    - "只需一次性风格指引时可直接用 Prompt；固定输入输出的纯计算通常优先写函数，不必构造完整 Skill 系统。"
---
# Skill 与普通 Prompt 有什么不同？从按需加载到脚本执行

假设用户问：“比较两只指数基金的跟踪质量，再看看它们在我的组合里是否重复暴露。”

你可以给 Agent 一段 Prompt：“先核对基金份额和基准，再计算跟踪误差，最后判断持仓重叠。”这当然可能有用。但下一次碰到只问跟踪质量的用户，是否还要塞进整份指引？模型如何知道应该调用哪份规则？真正计算时输入和结果怎样复查？脚本凭什么能执行？

**Skill 首先是一份可复用的任务指引；ETF Agent 在它外面增加了注册、按需读取、受控工具调用和执行记录。** 因此真正值得讨论的不是“把 Prompt 换成 Markdown”，而是 Host 怎样把一份指引变成可发现、可使用、可检查的能力。

## 先讲清楚：Skill 与普通 Prompt 的差别

最小的 Skill 可能只有一个 `SKILL.md`。模型读到它之后，和读到普通 Prompt 一样，仍然要自己理解并执行文字指引。**Skill 本身不会自动运行脚本，也不会绕过工具权限**。把两者说成“Prompt 只会说、Skill 天生会做”是不准确的：如果 Agent 原本有工具，普通 Prompt 也可以指导工具调用。

差异出现在 Host 为 Skill 提供了独立机制之后：

| 比较维度 | 一段普通 Prompt | ETF Agent 中受 Host 管理的 Skill |
| --- | --- | --- |
| 如何找到 | 由应用或用户主动拼进上下文 | 注册 ID 和简短描述，研究时按需发现 |
| 上下文成本 | 常见做法是每次携带整段指引 | 先看短目录，选中后才读取完整指引和资源 |
| 如何复用 | 复制、拼接或改写 Prompt | 同一 Skill 可被不同任务、Main 或 Child 选用 |
| 工具与脚本 | 依赖 Agent 原来拥有的工具 | 仍依赖 Host 原有工具；可以组织受审脚本和输入约定 |
| 权限与追溯 | 由原 Host 决定，Prompt 不能越权 | 仍由原 Host 决定，并能关联 Skill 身份、版本、实际工具回执 |

[![普通 Prompt 与 Host 管理的 Skill 的能力对比](/diagrams/agent-skill/prompt-zh.svg)](/diagrams/agent-skill/prompt-zh.svg)

*图 1：真正变化的是加载与执行治理，不是 Markdown 的神奇能力。*

回到基金例子：Skill 可写明先检查份额、币种、分红口径、基准总收益序列和共同窗口；缺少这些前提就不产出正式跟踪误差。模型负责判断何时使用这份 Skill，数据工具负责取数，受审脚本负责确定性计算，Host 负责约束能访问什么。这是分工，不是让 Skill 取代 Tool、MCP 或 Runtime。

## 一个最小 Skill 长什么样？

[Agent Skills 规范](https://agentskills.io/specification)要求至少有 `SKILL.md`，并允许按需附带 `scripts/`、`references/` 和 `assets/`。先理解下面这个**独立 Skill**，不需要先知道 Bundle：

~~~text
index-fund-tracking-quality/
├── SKILL.md                 # 什么时候用、检查什么、哪些结论不能下
├── references/              # 可选：基准与收益口径说明
└── scripts/                 # 可选：已审查的确定性计算脚本
    └── calculate.py
~~~

`SKILL.md` 说明适用条件、输入需求、步骤和缺失数据时的处理；脚本只是可选资源。文件夹存在不代表 Host 自动提供 `read_skill_resource` 或 `run_skill_script`。**文件格式是约定，能力接入是实现**。本系列的复杂基金 Skill 包只是把多个这样的 Skill 组织在一起，放在文末附录再谈。

## 一次请求怎样真正使用 Skill？

ETF Agent 有两条入口：用户显式指定已注册 Skill ID，例如 `/index-fund-tracking-quality`；或者自然语言提问，进入 Research 后由 Main 从简短目录选择是否读取对应 Skill。普通 Entry 不必预加载整份目录，Direct 也不必为一次简单回答启动研究。

[![用户请求、Skill 发现、按需读取、工具授权与结果的关系](/diagrams/agent-skill/path-zh.svg)](/diagrams/agent-skill/path-zh.svg)

*图 2：目录可见、正文已读、工具获准和脚本实际执行，是四个不同的事实。*

代码层可以归纳成一条路径：

~~~text
register Skill(ID, version, contentHash)
    → project short catalog for this request
    → model calls read_skill_resource (if permitted)
    → model chooses permitted tools / run_skill_script
    → Host validates grants and the concrete invocation
    → check tool result and synthesize the answer
~~~

这里是便于理解的伪流程，不是可以直接运行的公共 API。工具调用必须有真实回执；模型说“我用了某个 Skill”，不等于它读取过正文或执行过脚本。

## Skill 能声明数据需求，但不能给自己授权

跟踪质量需要可比的基金净值和基准总收益序列；真实组合重叠还需要用户已授权的持仓权重与穿透数据。Skill 可以声明 `research-scopes: [fund]` 或 `research-scopes: [portfolio_details]`，但这是依赖提示，不是授权凭证。

一些受审包还使用 `allowed-mcp-servers` 作为依赖服务的声明上限；它不会安装服务，更不会扩大当前 Run 的 grant。实际是否可访问，要经过用户授权、Host 策略、服务配置、只读要求和当次预算的共同约束。

如果用户只同意使用上传文件，Skill 不得因为“研究需要”就擅自联网；如果没有私人组合授权，就应写“无法计算个人重叠”，而不是从旧聊天、旧报告或假定权重推断，也不能把未知写成零。

## 从指引到真实计算：脚本究竟做了什么？

在指数基金比较里，跟踪差是同一可比期间基金与基准收益之差；跟踪误差是逐期主动收益的波动，通常要按实际观察频率年化。两者不是一个指标。

ETF Agent 的内部受审基金 Skill 包可通过原有 `run_skill_script` 工具，先检查某个 Skill 的输入约定：

~~~json
{
  "path": "scripts/run_module.py",
  "args": ["--describe", "--module", "index-fund-tracking-quality"]
}
~~~

`--describe` 只描述需要哪些字段，既不下载数据，也不访问私人组合或自动计算。只有在 Host 取得合法、可比的结构化输入后，才可按受审入口计算。例如：

~~~json
{
  "path": "scripts/run_module.py",
  "args": ["--module", "index-fund-tracking-quality"],
  "stdinFromToolCallId": "call_example"
}
~~~

`call_example` 仅是字段示意。真实执行时，Host 只接受当前 Run 中已完成、已实际向模型暴露的工具结果，拒绝跨 Run、未完成、歧义和已省略的引用。脚本的输入由具体回执交接，不能凭模型补造一条“来源”。

## 重点：Skill 脚本到底有什么执行权限？

**先看准入，再看进程。** 通过 `run_skill_script` 执行的不是任意网页下载的 Python，而是受 Host 管理的可信 Skill 包脚本。源码中的执行器在运行前会检查包生命周期与内容身份、原有工具准入，以及包相对路径；对目标文件做规范化解析，拒绝绝对路径、`..`、逃逸的符号链接和非 Python 文件。执行中有超时、取消、输出大小与结果脱敏等控制。

但是，当前 `runSkillPython` 最终调用的是宿主侧 Python 子进程（`spawn`），**并没有在这个执行器里建立独立的网络、文件系统、环境变量或子进程沙箱**。路径校验限制“选择哪份脚本”，不保证这份脚本运行后“只能访问哪个路径”。受审内置脚本约定只处理输入 JSON、不联网、不安装依赖；这属于可信代码与审查约束，不能等同于 OS 级隔离。

[![ETF Agent 受审 Skill 脚本与独立 Docker Analysis Sandbox 的安全边界](/diagrams/agent-skill/security-zh.svg)](/diagrams/agent-skill/security-zh.svg)

*图 3：受审包执行器的路径约束不是沙箱。Docker Analysis Sandbox 是另一条路径，不可混为一谈。*

| 安全问题 | 当前受审 Skill 脚本路径 |
| --- | --- |
| 任意用户能否传入服务器绝对路径？ | 执行器拒绝；仅接受已批准包内的合法 `.py` 路径 |
| Skill 能否新增 MCP 或读取私人持仓？ | 不能凭声明新增；仍须当前 Run 和 Host 授权 |
| 超时、取消、超大输出怎么办？ | 返回明确失败状态并停止或拒绝输出 |
| 是否有独立网络/文件系统隔离？ | **不能这样声称**；该执行器不是通用不可信代码沙箱 |
| 另一条 Docker 分析路径能否替它背书？ | 不能；须分别核对实际调度到哪条执行路径 |

安全结论因此应写成：**可信包先审查、调用时验证身份与授权、执行效果受限；如果要执行不可信或用户上传的任意脚本，必须另选有明确隔离契约的执行环境。** 规范里的实验性 `allowed-tools` 声明支持程度取决于 Host，也不能被当成系统授权的证明。

## 结果为什么必须能追溯到输入和 Skill 版本？

假设脚本只返回 `{"trackingError":0.012}`。你无法判断对应哪只基金、哪种份额、哪段时期、哪个基准、什么收益频率，因而不能单靠这个数字给出研究结论。

ETF Agent 要把实际输出关联到基金身份、请求与使用的时期、数据来源及回执、关键参数、Skill 注册版本和内容哈希。比如把年化频率从 252 改成 12，不能沿用旧数值后只换标签；Skill 本身改过内容，也不能让恢复中的旧 Run 悄悄读取最新版。

**指引版本身份与 Run 授权身份独立**：读取新 Skill 不等于再次获得私人数据权限；禁用一个 Skill，也不等于应删除已经合法完成的历史研究。

## Main 与 Subagent 为什么不共享所有 Skill？

Main 的模型请求可以看到短 Skill 目录；Child 则只看到按自己实际 Tool Surface 投影的 Skill。拥有 `read_skill_resource` 才能按范围读取；只有 `run_skill_script` 而没有读取工具时，也不能把纯远端 Skill 假装成可读；两个工具都没有，就不展示这份目录。

自定义专家的 `preferredSkills` 是偏好，`preloadedSkills` 是尝试按需预读；**两者都不增加工具、来源或预算权限**。预读还受注册身份、版本、Child 的真实授权和上下文容量约束，不能由 Main 在委派那一刻提前声称成功。

回到两只基金：Child 可以在已有授权下检查跟踪质量，把发现、引用和缺口交给 Main；Main 必须实际阅读和采纳后才能形成最终结论。**一个 Skill 不要求一个 Agent，一个 Child 也可以使用多个 Skill。** 复杂专家生命周期另见 [Subagent 全景](/articles/agent-subagent-panorama)，这里只保留与 Skill 消费有关的边界。

## 一个 Skill 算不出来，研究就要全部失败吗？

不需要。公开资料已核对、但缺少可比的基准总收益序列时，可以报告已经确认的基金事实，不能硬凑跟踪误差；私人持仓未授权时，组合重叠应是 unavailable 而不是 0；脚本输入失败应保留真实错误，而不是当成成功的空结果。

~~~json
{
  "fundProfile": { "status": "available" },
  "trackingQuality": {
    "status": "insufficient",
    "missing": ["可比的基准总收益序列"]
  },
  "portfolioOverlap": {
    "status": "unavailable",
    "reason": "未获私人组合明细授权"
  }
}
~~~

这是教学结构，不是生产 API。Skill 读取、脚本成功、证据成立、Main 采纳与用户交付成功是不同环节；不应为每个 Skill 新造一套任务状态机。

## Skill 版本治理解决什么问题？

在支持可恢复研究的系统里，修改 Skill 前提、脚本或输出解释会改变后续执行。ETF Agent 以注册、审核激活、停用与替代等状态管理 Skill；同名同版本也必须检查内容哈希，不能让内容变化继承旧审查结论。

注册只能证明 Skill 身份存在；激活不等于获得当前用户数据；目录投影不等于模型读取；脚本返回也不等于 Main 最终采纳。治理的意义是让这些行为可定位、可复核，而不是再建设一个 Runtime。

## 公开源码能实际验证到哪一步？

上文的私有基金研究、组合数据准入和受审 Python 计算路径不能直接当作公开 [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) 的能力。

固定公开版本提供了更小的 `compare-guides` Skill 示例：对两份合成软件指南按步骤核对版本、权限和数值口径，再形成可回读报告。可以直接查看 [Skill 文件](https://github.com/hpoenixf/open-etf-agent/blob/a79e89bf709d4a2245b5a8652882a591ba467519/fixtures/skills/compare/SKILL.md) 和 [目录实现](https://github.com/hpoenixf/open-etf-agent/blob/a79e89bf709d4a2245b5a8652882a591ba467519/src/skills.mjs)。

~~~bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout a79e89bf709d4a2245b5a8652882a591ba467519
npm ci --ignore-scripts --no-audit --no-fund
npm run demo -- --case skill-mcp
~~~

这一离线合成演示按所固定版本的 Node 26.x 环境要求执行，不依赖真实行情或模型密钥。它可用于理解“目录发现 → Skill 读取 → Host 工具 → 报告与记录”，**不证明私有基金 Skill 包、Child 预加载或 Python 安全边界已全部开源**。

## 什么时候适合 Skill，什么时候只要 Prompt 或函数？

如果只是在一次会话里调整语气和写作风格，普通 Prompt 足够；如果输入输出确定且无任务选择问题，用函数更直接。当任务描述多变、需要复用领域检查步骤、按需加载知识、选择合适工具并留下可复核结果时，才值得用 Skill。

设计时依次问三个问题：**这份 Skill 要解决哪类重复任务？Host 到底提供了哪些加载和工具能力？脚本执行的真实权限边界是什么？** 答不上后两项，再精美的 `SKILL.md` 也只是文本。

## 进阶附录：多个 Skill 怎么组织成 Bundle？

到这里才需要 Bundle。ETF Agent 的内部基金研究包会把多个独立 Skill 放在一个共享目录，并使用 `bundle.json` 描述包身份、版本与共享资源。它是该项目的扩展组织方式，不是 Agent Skills 规范要求的入门条件：

~~~text
fund-research/
├── bundle.json               # 额外的包组织与版本信息
├── SKILL.md
├── skills/
│   ├── index-fund-tracking-quality/
│   └── portfolio-overlap/
├── scripts/
├── references/
└── schemas/
~~~

Bundle 可以共享计算入口与输入约定，但不自动产生第二个 Agent、不接管原 Run，也不会授予额外的用户数据权限。本文的核心结论对只有一个 `SKILL.md` 的普通 Skill 同样成立。
