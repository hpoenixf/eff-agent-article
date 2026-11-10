---
title: "把自己的资料交给 Agent：从第一份报告到可恢复的研究项目"
description: "固定 Open ETF Agent v0.24，把自己的资料变成可回查报告，再用检索与有界 Child 核对同一个问题；学会区分原文、派生意见、任务恢复和项目容量。"
readingBrief:
  takeaways:
    - "先绑定问题与资料快照，再批准模型执行；更换问题或资料时另建任务。"
    - "报告能打开，还要检查结论是否有原文支持，不能补造资料未说明的原因。"
    - "Main 检索资料，Child 只读取获准文档做局部核对；Main 仍须检查其意见并保存报告。"
    - "续跑沿用原任务、授权、预算和截止时间；结果未知时先检查，不能靠新建任务清零。"
  appliesTo:
    - "愿意配置模型服务并批准资料传输和费用，用 v0.24 本地项目练习的开发者。"
  notFor:
    - "免费离线完成研究、无人值守运行、任意网页爬取或投资决策。"
---

<script setup>
import { withBase } from 'vitepress'
</script>

# 把自己的资料交给 Agent：从第一份报告到可恢复的研究项目

<LearningPathNav />

你交给 Agent 一份很短的试验记录：投入 64 单位，可用产出 48 单位，损失原因尚未确定。你想要的不是一句“可用比例为 75%”，而是一份保存下来的报告：原文说了什么、哪些是计算、哪些仍然不知道，都能检查。关掉执行程序后还能打开；明天材料更新了，也知道旧报告依据的是哪一版。

**这篇要完成的，就是“自己的资料进来，一份可核对的报告和一个可继续的任务留下”。** 我们会创建项目，把问题绑定到资料快照，让真实模型选择下一步，再把资料检索与受限专家核对放进同一项新任务，最后检查怎样继续未完成的工作。不是照着预写的工具动作跑一次 Demo。

[深入篇](open-etf-agent-v010-system-design.md)解释交接为何需要契约；这里固定已发布的 **v0.24.0**，跟随读者的输入和产物前进。[原 v0.20 练习全文](https://github.com/hpoenixf/eff-agent-article/blob/16547101a8a42f01a62695a7a4e32ecfcace0d05/articles/open-etf-agent-research-project-workshop.md)保留旧命令、资料和观察，旧项目不要直接套用新版步骤。

原 v0.20 的[真实运行记录](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020/case-mechanism-observations.json)支持资料、Memory、Child 与恢复的早期路径；后来的 [Knowledge 实跑](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/verification/v023-release.zh-CN.md)包含 Main 检索、Child 读原文、Main 消费交接并保存报告。后者属于固定 v0.23 执行源码，不是 v0.24 新跑的组合测评。本文按 v0.24 核对命令和离线准备步骤，没有为改稿再调用模型，也不承诺这组终端命令或新材料会得到同样答案。

## 先看终点：跑完以后，手里应该留下什么

主线完成后，你应该能检查三样东西：

- **一份资料快照：**导入的原始字节有自己的 manifest 身份。改动外部文件，不会偷偷改变已提交任务的依据。
- **一个有来历的任务：**Run ID 把问题、配置、权限、预算和截止时间绑在一起。停止进程，不等于获得一份新额度。
- **一份持久报告：**能用所选材料核对结论；执行进程退出后，独立 Reader 仍能重新打开，不再请求模型。

这三样并不是同一个“成功”。资料可以在零模型调用时导入；模型可能给了回答却没有保存报告；报告确实存在，推理也仍可能出错。下面每一步都让其中一个区别变得可观察。

## 对照深入篇：沿同一张六层地图动手 {#对照深入篇-0-20-走到了六层的哪里}

下图保留原 v0.20 职责地图，不把图上的版本当作本次执行身份。把[六层全景](017-prompt-to-answer-six-layer-panorama-v3.md)当作职责地图，不是功能清单。这次练习贯通六层的一个有界子集，仍是本地单用户项目，不是已经完成的多人金融研究产品。

<figure>
  <picture>
    <source media="(max-width: 640px)" :srcset="withBase('/diagrams/open-workshop/six-layers-zh-mobile.svg')" />
    <img style="max-height: none !important; height: auto;" :src="withBase('/diagrams/open-workshop/six-layers-zh.svg')" alt="本练习实际经过的六类职责。资料和任务始终可以核对；这不是完整产品的成熟度成绩单。" />
  </picture>
  <figcaption>本练习实际经过的六类职责。资料和任务始终可以核对；这不是完整产品的成熟度成绩单。 <a class="diagram-original" :href="withBase('/diagrams/open-workshop/six-layers-zh.svg')" target="_blank" rel="noopener noreferrer">查看完整图</a></figcaption>
</figure>

| 六层 | 这次实际用到什么 | 不要据此算作已覆盖什么 |
| --- | --- | --- |
| **L1 · 任务输入与触发** | `run submit` 保存明确问题，`run work` 才执行。 | 没有聊天意图分流或无人值守守护进程。版本另有受限 Response、Schedule 入口，本篇不启用。 |
| **L2 · 身份、会话与上下文** | project、Run、资料 manifest、grant 与配置保持范围一致；明确 Memory 可提供偏好。 | 本地项目身份不是账户认证或多租户隔离，保存偏好也不是自动学习。 |
| **L3 · Agent 决策与运行** | Main 在研究循环里选择动作，可使用受限 Child；已知的未完成任务可沿同 Run 继续。 | 不是生产系统完整的 Direct/Research/Coord 三路分流，也不是任意层级的自主代理组织。 |
| **L4 · 工具与领域能力** | 读取选定文本及结果，Main 检索准入资料，查询 Memory，让受限专家核对来源。 | 不包含实时金融取数、任意网络爬取或隔离 Python。本配置未开计算工具，75% 是读者人工复核点。 |
| **L5 · 结果发布与交付** | 沿原 Publication 链保存报告，再读回持久结果和回执。 | 保存不等于答案质量认证，也不证明完整消息历史、流式推送和通知送达服务。 |
| **L6 · 用户界面** | CLI 检查，以及读取已保存报告与来源的本地只读 Reader。 | 不是聊天产品、账户门户、多人协作界面或公网分享服务。 |

同一 Memory 能力可以跨层参与，不是两份记忆系统。一次 `run work` 会多次经过上下文准备、模型判断和工具执行；报告保存与页面打开又是两份要分别检查的事实。相对于深入篇，这里的进步是**用一个应用入口把交接留在自己的项目里**，不是新增六套引擎。


## 一、选一件值得核对的小事

先用一份已进入正式版本测评的合成材料，而不是隐私文件或几十本手册。将下面这句话保存为 `independent.md`：

```text
Independent trial: intake 64 units; usable output 48 units; failure causes not established.
```

问题可以写成：“整理投入、可用产出与证据限制；区分原文事实和计算结果，引用来源并保存报告。”这是读者问题，不是预写的工具动作。[已有报告及原材料](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020/synthetic-data-and-reports.json)记录了这份资料上的真实运行，包括 Memory、受限 Child，以及已知停止后的继续执行。该观察属于报告中标明的较早实现，不冒充最终标签上的新一轮执行。

先抓住三个检查点：64 和 48 的含义不能互换；48/64 = 75% 是人工复核点，必须标成计算结果；材料没有说明其余部分不可用的原因。报告落盘说明交付发生了，不代表每句话都通过质量认证，仍要逐项回到原材料判断。

熟悉后换成自己的短文本或 Markdown。采购方案、服务条款都可以，但要随问题更换检查点。项目接收的是你明确选择的文件，不要求文件名出自内置示例目录。

## 二、先准备资料，再批准执行

**这一段在练 L1 和 L2。** 创建项目是在给工作准备本地归处；导入固定证据版本；提交把版本绑定到一个问题。资料真正发给提供方之前，你已经能检查这是哪件事、允许用什么。

声明支持 Node.js 26.8.1–26.x；本版发布实测为 26.11.1。在仓库之外保存自己的练习材料；以下命令在仓库根目录执行，`../my-research` 是自行创建的工作目录。

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout v0.24.0
npm ci --ignore-scripts --no-audit --no-fund
npm run build
node src/research-cli.mjs --help
mkdir -p ../my-research
```

把上面的资料保存成 `../my-research/independent.md`，问题保存到 `../my-research/question.txt`。再创建 `../my-research/files.json`：

```json
["../my-research/independent.md"]
```

这是明确选择文件，不是授予整个目录的访问权。入口支持文本、Markdown 和受限的文本层 PDF；本次先用文本，以便之后加入 Child。路径相对于运行命令的当前目录。不要用通配符或把文件夹当文件。

为本次练习使用新的空项目目录；`project init` 不是旧目录升级命令。创建 `../my-research/config.json`：

```json
{
  "schemaVersion": "research-project@1",
  "gateway": {
    "mode": "fixture", "provider": "fixture",
    "protocol": "fixture@1", "model": "offline"
  },
  "capabilities": ["report", "memory"],
  "limits": {
    "maxRounds": 20, "maxTools": 32, "timeoutMs": 300000,
    "model": 24, "tool": 40
  }
}
```

```bash
node src/research-cli.mjs project init --project ../my-research/dry-project --config ../my-research/config.json
node src/research-cli.mjs source import --project ../my-research/dry-project --files ../my-research/files.json > ../my-research/import.json
```

导入结果中的 `manifestSha256` 标识这次资料快照。复制它作为下面的 `MANIFEST_SHA`，不要填文件名，也不要自己编一个哈希。

```bash
node src/research-cli.mjs source list --project ../my-research/dry-project --manifest MANIFEST_SHA
node src/research-cli.mjs run submit --project ../my-research/dry-project --run comparison --question ../my-research/question.txt --manifest MANIFEST_SHA
node src/research-cli.mjs run inspect --project ../my-research/dry-project --run comparison
```

此时观察任务身份、资料清单，以及仍为零的模型用量。**提交不是执行。** 对这个 fixture 项目运行 `run work` 会返回 `CLI_LIVE_WORK_REQUIRED`，这是入口刻意保留的限制，不是教程要求你解除的保护。

## 三、让真实模型完成第一份报告

**从这里开始，L3 和 L4 真正转起来，再由 L5、L6 把结果交到你手里。** Main 可以请求读资料、检查工具结果，再判断是否已有足够证据保存报告。你规定目标和权限边界，不预写它必须采取的工具顺序。

真实执行需要你自己的模型服务。复制配置为 `live-config.json`，保留其余字段，将 gateway 换成以下结构，并填入该服务实际支持的模型和 HTTPS 端点：

```json
{
  "mode": "live",
  "provider": "YOUR_PROVIDER_ID",
  "protocol": "chat-completions",
  "model": "YOUR_AUTHORIZED_MODEL",
  "endpoint": "https://example.invalid/v1/chat/completions",
  "apiKeyEnv": "RESEARCH_API_KEY",
  "stream": false
}
```

示例端点故意不可用。通过你已有的安全凭据方式向进程环境提供 `RESEARCH_API_KEY`，不要把值写进配置、问题、资料或 Git；CLI 不读取 `.env`。先确认提供方允许接收这些材料，再核对计费规则。配置中的次数和时限并不是货币金额上限。

用新配置创建独立项目，并导入同一份明确选择的资料：

```bash
node src/research-cli.mjs project init --project ../my-research/live-project --config ../my-research/live-config.json
node src/research-cli.mjs source import --project ../my-research/live-project --files ../my-research/files.json > ../my-research/live-import.json
```

记录返回的 manifest。数据授权涵盖问题、所选资料，以及本次可用的 Memory 和派生内容，不只是文件名。接着仅在你确认提供方、数据和费用后执行：

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run comparison --question ../my-research/question.txt --manifest LIVE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs run work --project ../my-research/live-project --run comparison
node src/research-cli.mjs run inspect --project ../my-research/live-project --run comparison
node src/research-cli.mjs run report --project ../my-research/live-project --run comparison
```

不要只看终端最后一句。检查是否真的形成了持久报告，报告的引用能否返回对应材料，以及“失败原因未确立”有没有被擅自补成某个原因。模型说完成但没有所需报告，不能按成功处理。已有真实任务就出现过这种情况：直接给了最终回答，却没有保存必需报告，`REPORT_REQUIRED` 正确地没有把它算成交付成功。所以要找产物，而不是只读最后一句话。

退出执行进程后，再执行 `run report`；也可以运行：

```bash
node src/research-cli.mjs report serve --project ../my-research/live-project --run comparison --port 0
```

打开命令打印的实际本地地址。Reader 读取已保存的报告与来源，不重新调用模型；按 Ctrl-C 停止 Reader。报告存在，是交付事实；报告结论是否成立，仍需要你的判断。

## 四、用检索找到依据，仍然保留旧任务 {#四、换问题和资料-不偷换旧任务}

一份短文直接阅读就够了。资料变成多份时，先检索再核对能缩小要读的范围；这里的 Knowledge 是对**本任务已导入文本**做有界词法检索，不是联网搜索或向量资料库。它返回完整原文页及来源身份，分数只帮助排序。`complete` 只表示本集合的词法命中已返回；`partial` 有省略；`no-evidence` 只说明这次没命中。

保留 `independent.md`，另建 `follow-up.md`，写入下面的**教学构造**，不要当作原测评中的新发现：

```text
Independent trial follow-up: 8 of the 16 unusable units had damaged packaging. Causes for the other 8 units remain unresolved.
```

把 `files.json` 改成两个明确路径，再导入一次：

```json
["../my-research/independent.md", "../my-research/follow-up.md"]
```

新 manifest 包含两份资料，旧 Run 仍属于原快照。将完整 `live-config.json` 复制为 `knowledge-config.json`，把 capabilities 改为 `["report", "memory", "knowledge"]`，并添加顶层 `"knowledge": {"maxResults": 4, "maxSourceBytes": 128000}`。保留 gateway 和 limits，不自定义 `allowedTools`，以保留当前 Main 及后续 Child 所需的原工具范围。

```bash
node src/research-cli.mjs project inspect --project ../my-research/live-project
node src/research-cli.mjs project update --project ../my-research/live-project --config ../my-research/knowledge-config.json --expected-config CURRENT_CONFIG_SHA
node src/research-cli.mjs source import --project ../my-research/live-project --files ../my-research/files.json > ../my-research/knowledge-import.json
```

`CURRENT_CONFIG_SHA` 必须来自刚才的 inspect，`KNOWLEDGE_MANIFEST_SHA` 则来自新导入。把新问题保存到 `second-question.txt`：“先用 Knowledge 查找试验与后续检查的依据。不可用部分是否都能归因于包装？区分原文事实、计算和仍未知的原因，引用原文并保存报告。”

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run decision-gaps --question ../my-research/second-question.txt --manifest KNOWLEDGE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs knowledge inspect --project ../my-research/live-project --run decision-gaps
node src/research-cli.mjs run work --project ../my-research/live-project --run decision-gaps
node src/research-cli.mjs run report --project ../my-research/live-project --run decision-gaps
```

`knowledge inspect` 只检查准入资料和检索绑定，不证明模型已搜索。实际执行时，Main 用 `knowledge_query` 获得原文与 `sourceId`、`resultRef`，可用 `read_result` 重读，再保存引用原文的报告。检查它有没有把“8 单位”扩大成“全部 16 单位”，或把没有命中写成不存在原因。材料只说这 8 单位存在包装受损，也未证明它们就是因此不可用。原文件改名、替换或再次导入都不应改写这次任务的已准入资料；问题或证据变化，就用新 Run。

这条路径的取舍是简单、固定、容易回查，但不会自动发现新文件，也不保证召回语义相关的材料。只有两段很短的文本时，直接读页更省事；此处加入检索，是为了观察命中怎样成为可引用原文，而不是证明检索必然更好。[固定 Knowledge 指南](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/knowledge.zh-CN.md)给出完整容量和恢复边界。

## 五、把偏好和分工加入项目

**沿用上一步的问题，增加一次独立的局部核对，不再重讲架构。** Memory 是可选的呈现偏好，Child 则检查 Main 找到的资料是否真的支持某个判断；两者都不是新证据。

先让系统记住一种明确的呈现偏好，而不是存入未经核实的业务结论。创建 `preference.txt`，内容例如“报告先列出资料未说明的事项，再写比较结论”。

```bash
node src/research-cli.mjs memory save --project ../my-research/live-project --intent report-order-1 --text ../my-research/preference.txt --approve-intent
node src/research-cli.mjs memory inspect --project ../my-research/live-project
```

保存和采用分开检查：新任务需要实际读到并使用偏好，不能凭格式相似推断。要更新或遗忘，沿 inspect 返回的真实 ID 和当前 revision 调用 `memory revise` / `memory forget` 并批准意图；遗忘不等于物理擦除历史。

本次使用 v0.22 引入、v0.24 保留的 `delegate_child`，不是旧单次 `source_check`。在仓库根目录执行下面这段配置生成命令，从固定源码导入完整方法及其哈希，避免手抄不完整描述：

```bash
node --input-type=module <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
import { CLAIM_COMPARISON_METHOD } from './src/child.mjs';
const config = JSON.parse(readFileSync('../my-research/knowledge-config.json', 'utf8'));
config.capabilities = ['report', 'memory', 'knowledge', 'child'];
config.childExecution = {
  schemaVersion: 'child-execution@1',
  maxChildren: 1,
  methods: [CLAIM_COMPARISON_METHOD]
};
writeFileSync('../my-research/child-config.json', JSON.stringify(config, null, 2) + '\n');
JS
node src/research-cli.mjs project inspect --project ../my-research/live-project
node src/research-cli.mjs project update --project ../my-research/live-project --config ../my-research/child-config.json --expected-config CURRENT_CONFIG_SHA
```

这次也必须使用新的配置哈希；旧 Run 不会获得 Child 权限。创建 `review-question.txt`：“用 Knowledge 查找两份试验记录，再用一次 claim-comparison 核对：所有不可用产出都由包装受损造成吗？给 Child 明确的局部问题和已准入文档范围。Main 回到原文检验其意见，区分已知、计算和未知，保存报告。”

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run reviewed-gaps --question ../my-research/review-question.txt --manifest KNOWLEDGE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs run work --project ../my-research/live-project --run reviewed-gaps
node src/research-cli.mjs child list --project ../my-research/live-project --run reviewed-gaps
node src/research-cli.mjs run report --project ../my-research/live-project --run reviewed-gaps
```

Main 从命中里选择已准入的 `documentId`，连同局部问题交给 Child。**不是把父任务的 ResultRef 或整段工具历史复制过去。** 这里的 `claim-comparison` 只允许 Child 用自己的 `read_page` 读取最多两份选定文档；它没有 `knowledge_query`。Child 返回核实过的原文引用和派生意见，Main 再判断并保存最终报告。

用 `child list` 检查是否真有执行、哪些文档获准、交接是 `not-consumed`、`committed-not-consumed` 还是 `consumed`。这个只读命令不调用模型；若模型没触发 Child，就记录为单助手研究。Child 已完成但 Main 没采用，也不能叫协作已经交付。一次独立核对会增加调用与预算消耗；两份材料已足够直接判断时，不必为了角色数量加入 Child。

这里有一个真实提醒：[v0.23 的 K09](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/verification/v023-real-ten.safe.json)完成了检索、Child 读原文、Main 消费交接和报告保存，却改写了任务要求的查询词，因此严格任务质量仍未通过。协作发生，不代表它准确遵循了问题。原 v0.20 还在“基线 80、结果 100、同一传感器、天气未受控”的合成材料上观察到 Memory、Child 和报告组合；这同样不能支持因果解释，也不是本次新版的运行结果。

## 六、继续同一件事，而不是从头再来

**这里检查 L2 的原任务绑定与 L3 的持久执行记录：**新进程是否沿原授权继续，并保留已消费结果。检查点可能出现在报告发布之前；若报告已经发布，再单独通过 L5 回读确认。

把停止作为可选观察，不要为了展示而打断一个马上完成的任务。既有真实测评是在结果已消费的已知检查点请求停止，再由不同进程继续，并非验证读者任意时刻按 Ctrl-C。CLI 把 SIGINT/SIGTERM 转成公开 Host 信号，真正需要检查的是本次任务是否处于已知、可继续的状态。

选一个尚在执行的任务，按 Ctrl-C 请求协作停止。再次执行同一条 `run work --project ... --run ...`，是继续原任务，不需要另一个 `resume` 命令。先后用 inspect 对比 Run ID、资料身份、状态和用量：原预算与截止时间仍然有效。

这个练习并不保证你在任何时刻都能得到可恢复点。任务可能已经完成，也可能保留未知派发。未知不能靠再建一个 Run 来“清零”；遇到它就停下来检查，不能把未知当作没有执行。`run cancel` 则明确取消任务，不是暂停按钮。

不要为展示完整而强行打开全部能力。Response 与 Child、Schedule 与 Child、实际 PDF 与 Child，以及可信插件与 Child 不支持组合。本文的主线不加入人工回复或定时调度；以后单独练习它们时，也应保留原任务身份与授权边界。

## 结语：真正带走的是一套检查方式

练习收束为一条路径：明确导入 → Main 找到原文 → Child 在自己的窄范围核对 → Main 消费并保存 → 独立回读。你应能分清新问题、新证据与原任务，也能辨认检索和协作究竟发生了，还是只是自己希望发生。

v0.24 还让新格式项目在同一规范化 HTTPS endpoint 的配置修订间保留原请求槽。用 `node src/research-cli.mjs capacity inspect --project ../my-research/live-project --run reviewed-gaps` 只读检查原票据；换模型名或凭据变量别名不意味着得到新容量。不同项目目录仍独立，不是账户级限流。旧 v0.20 项目保留原合同，不自动迁移；不要删除旧状态或新建任务来抹掉未知请求。具体兼容规则见下方固定容量指南。

[固定版本研究项目指南](https://github.com/hpoenixf/open-etf-agent/blob/88afb84958ed8de9108d756cdc0d63e6d2fbee24/docs/research-project.zh-CN.md) · [分层执行证据](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020-release.zh-CN.md) · [深入篇：交接契约](open-etf-agent-v010-system-design.md)

[v0.24 项目指南](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/research-project.zh-CN.md) · [Child 方法与检查](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/child-execution.zh-CN.md) · [项目容量与旧格式边界](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/provider-capacity.zh-CN.md)。[当前项目指南](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/research-project.zh-CN.md)会继续演进；本练习固定 v0.24.0，上面的旧版指南和分层执行证据仅作历史入口。


这是[深入篇](open-etf-agent-v010-system-design.md)之后的动手一站，不替代机制讲解。能够检查自己资料上的任务后，再读[六层全景](017-prompt-to-answer-six-layer-panorama-v3.md)，把这些边界放回完整系统。
