---
title: "把自己的资料交给 Agent：从第一份报告到可恢复的研究项目"
description: "用 Open ETF Agent v0.20 的公开入口导入自己的文档，换问题、管理明确偏好并检查任务恢复；围绕同一研究项目练习，而不是照着预写的模型动作跑 Demo。"
readingBrief:
  takeaways:
    - "更换问题或资料应创建新任务；继续未完成的工作则沿原 Run，不重置授权、预算和截止时间。"
    - "报告可重新打开与内容可靠是两回事，应从结论反查来源，并单独检查未说明的信息。"
    - "Memory 需要明确写入意图；Child 只核对受限材料，不能自动获得更大权限或代替 Main 发布。"
  appliesTo:
    - "愿意配置自己的模型提供方、费用及资料授权，使用本地文本练习 Agent 工程的开发者。"
  notFor:
    - "不提供免模型费用的完整研究执行，也不适用于无人值守研究、任意网页爬取或投资决策。"
---

# 把自己的资料交给 Agent：从第一份报告到可恢复的研究项目

深入篇解释了资料、执行进程与专家如何交接。这一次不再画架构图，我们换一个问题：**把仓库里的示例拿掉，只留下自己的资料和问题，你能否完成研究，检查结果，关掉程序后继续使用它？**

本文使用正式 v0.20.0 的公开研究项目入口。模型动作不是预先写好的脚本：你给出目标与材料，模型在获准工具内决定怎么推进。因此本文规定输入与检查方法，不规定回答必须长什么样，也不保证模型每次都完成任务。

练习基于该版本已经完成的[真实模型运行记录](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020/case-mechanism-observations.json)：公开项目 API 已观察到资料导入、Memory 与 Child 消费、报告持久化，以及新进程继续原任务。下文 CLI 调用这套 API，命令参数及无需模型的操作另行核对。已有实测并不意味着这组终端命令逐条实跑过，也不保证换一份资料仍得到相同结果。

## 一、选一件值得核对的小事

先用一份已进入正式版本测评的合成材料，而不是隐私文件或几十本手册。将下面这句话保存为 `independent.md`：

```text
Independent trial: intake 64 units; usable output 48 units; failure causes not established.
```

问题可以写成：“整理投入、可用产出与证据限制；区分原文事实和计算结果，引用来源并保存报告。”这是读者问题，不是预写的工具动作。[已有报告及原材料](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020/synthetic-data-and-reports.json)记录了这份资料上的真实运行，包括 Memory、受限 Child，以及已知停止后的继续执行。该观察属于报告中标明的较早实现，不冒充最终标签上的新一轮执行。

先抓住三个检查点：64 和 48 的含义不能互换；48/64 = 75% 必须标成计算结果；材料没有说明其余部分不可用的原因。报告落盘说明交付发生了，不代表每句话都通过质量认证，仍要逐项回到原材料判断。

熟悉后换成自己的短文本或 Markdown。采购方案、服务条款都可以，但要随问题更换检查点。项目接收的是你明确选择的文件，不要求文件名出自内置示例目录。

## 二、先准备资料，再批准执行

使用 Node.js 26.8.1–26.x。在仓库之外保存自己的练习材料；以下命令在仓库根目录执行，`../my-research` 是自行创建的工作目录。

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout v0.20.0
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

创建 `../my-research/config.json`：

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

不要只看终端最后一句。检查是否真的形成了持久报告，报告的引用能否返回对应材料，以及“失败原因未确立”有没有被擅自补成某个原因。模型说完成但没有所需报告，不能按成功处理。

退出执行进程后，再执行 `run report`；也可以运行：

```bash
node src/research-cli.mjs report serve --project ../my-research/live-project --run comparison --port 0
```

打开命令打印的实际本地地址。Reader 读取已保存的报告与来源，不重新调用模型；按 Ctrl-C 停止 Reader。报告存在，是交付事实；报告结论是否成立，仍需要你的判断。

## 四、换问题和资料，不偷换旧任务

把另一个问题，例如“要解释不可用产出的原因，还缺哪些信息？”，写到 `../my-research/second-question.txt`，沿同一 manifest 提交新的 `--run decision-gaps`。这不是在第一次任务里追加一句话，而是用相同资料完成另一项任务。对比两份报告，观察哪些来源被复用，判断的重点怎样变化。

```bash
node src/research-cli.mjs run submit --project ../my-research/live-project --run decision-gaps --question ../my-research/second-question.txt --manifest LIVE_MANIFEST_SHA --approve-provider --approve-data --approve-cost
node src/research-cli.mjs run work --project ../my-research/live-project --run decision-gaps
node src/research-cli.mjs run report --project ../my-research/live-project --run decision-gaps
```

接着做一个明确标为教学变化的新版本，补一句“后续检查发现 8 单位包装受损，其他原因仍未确定”，重新 `source import`。这句是练习用的新信息，不是原测评试验的事实。新导入应返回不同 manifest，第三项任务绑定它。第一份报告仍属于原资料快照，不应被新文件悄悄改写。

这比“模型记住了我刚才说什么”更具体：你可以区分新问题、新证据和旧结果。项目目录是持久状态，不是可随意删除的缓存；资料、任务、会话、报告与 Memory 要一起保留。

## 五、把偏好和分工加入项目

先让系统记住一种明确的呈现偏好，而不是存入未经核实的业务结论。创建 `preference.txt`，内容例如“报告先列出资料未说明的事项，再写比较结论”。

```bash
node src/research-cli.mjs memory save --project ../my-research/live-project --intent report-order-1 --text ../my-research/preference.txt --approve-intent
node src/research-cli.mjs memory inspect --project ../my-research/live-project
```

随后创建新任务，请它查找并使用适用的报告偏好。检查结果时分开两件事：Memory 是否已保存，以及本次模型是否确实读到并采用。格式偶然一样，不能单独证明 Memory 被消费。如果当前输出不足以确认采用，就记作未确认，不凭回答相似来推断。既有测评核对了原执行记录，普通报告并不等于同样完整的执行追踪。需要更新或遗忘时，使用 inspect 返回的真实条目 ID 和当前 revision 执行 `memory revise` 或 `memory forget`，仍须明确批准意图。遗忘不等于把磁盘历史物理擦除。

接下来才加入 Child。在完整配置的 capabilities 中增加 `child`，用 `project inspect` 取得当前 `configSha256`，再以 `project update --config ... --expected-config ...` 更新未来任务的配置。旧 Run 不会跟着获得新权限。

把修改后的完整真实模型配置保存为 `../my-research/child-config.json`，其中 `capabilities` 为 `["report", "memory", "child"]`。将 `CURRENT_CONFIG_SHA` 换成 inspect 返回的当前配置哈希，不沿用过期值。

```bash
node src/research-cli.mjs project inspect --project ../my-research/live-project
node src/research-cli.mjs project update --project ../my-research/live-project --config ../my-research/child-config.json --expected-config CURRENT_CONFIG_SHA
```

用新任务让助手核对所选材料是否支持对不可用产出原因的一种解释，再综合为报告。

Child 的价值是分离一段有边界的核对工作，不是给每个观点配一个角色。这里的公开 Child 只处理一至两份选定文本，工具和预算受限，返回的意见不能冒充原文；最终报告仍由 Main 保存。若没有真实触发 Child，就不能把普通报告称为协作示例，应该如实记录这一轮只完成了单助手研究。

最终实现还在另一份合成试验材料上实际组合了 Memory、Child 与报告：基线 80、结果 100，使用同一传感器，但天气未受控。这证明这些机制确实在同一任务中被消费，不证明能够作出因果解释；变化原因仍不能从这几句话中得出。

## 六、继续同一件事，而不是从头再来

把停止作为可选观察，不要为了展示而打断一个马上完成的任务。既有真实测评是在结果已消费的已知检查点请求停止，再由不同进程继续，并非验证读者任意时刻按 Ctrl-C。CLI 把 SIGINT/SIGTERM 转成公开 Host 信号，真正需要检查的是本次任务是否处于已知、可继续的状态。

选一个尚在执行的任务，按 Ctrl-C 请求协作停止。再次执行同一条 `run work --project ... --run ...`，是继续原任务，不需要另一个 `resume` 命令。先后用 inspect 对比 Run ID、资料身份、状态和用量：原预算与截止时间仍然有效。

这个练习并不保证你在任何时刻都能得到可恢复点。任务可能已经完成，也可能保留未知派发。未知不能靠再建一个 Run 来“清零”；遇到它就停下来检查，不能把未知当作没有执行。`run cancel` 则明确取消任务，不是暂停按钮。

不要为展示完整而强行打开全部能力。Response 与 Child、Schedule 与 Child、实际 PDF 与 Child，以及可信插件与 Child 不支持组合。本文的主线不加入人工回复或定时调度；以后单独练习它们时，也应保留原任务身份与授权边界。

## 结语：真正带走的是一套检查方式

完成练习之后，你应能拿另一份或另一对资料、换一个问题，独立得到并核对持久报告；能说明什么时候应新建任务、什么时候只能继续原任务；也能辨认 Memory 与协作究竟发生了，还是只是自己希望发生。

深入篇解释这些契约为什么存在，这篇让你在自己的输入上看见它们的作用。可复现不代表每次答案一样，更不代表没有失败；它首先意味着输入、权限、执行与结果之间的关系能被检查。

[固定版本研究项目指南](https://github.com/hpoenixf/open-etf-agent/blob/88afb84958ed8de9108d756cdc0d63e6d2fbee24/docs/research-project.zh-CN.md) · [分层执行证据](https://github.com/hpoenixf/open-etf-agent/blob/a5cef6d5cf1a4597f0f1271025cd6cc16be151e5/docs/verification/v020-release.zh-CN.md) · [深入篇：交接契约](open-etf-agent-v010-system-design.md)

[当前项目指南](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/research-project.zh-CN.md)可能继续演进；复现本稿时仍固定 v0.20.0，不混用未来命令。


这是[深入篇](open-etf-agent-v010-system-design.md)之后的动手支线，不替代机制讲解。能够检查自己资料上的任务后，再读[六层全景](017-prompt-to-answer-six-layer-panorama-v3.md)，把这些边界放回完整系统。
