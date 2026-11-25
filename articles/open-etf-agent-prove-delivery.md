---
title: Agent 回答了，怎么证明它真的交付了？
description: 用 Open ETF Agent 的离线练习核对报告和来源，故意改坏一份回执，再从同一轮运行分辨交付失败、观测缺失和回答错误。
readingBrief:
  takeaways:
    - "判断交付，先从使用方入口重开同一份正文和证据；程序报完成并不能替代回读。"
    - "用交付回执核对报告字节和修订身份，才能分辨读取成功与读取错了版本。"
    - "时间线用于排查，不是交付裁判；回读已通过时，缺日志不该把它改判为失败。"
    - "对比只计算两边都执行的用例；正文完整送达，不代表正文里的推理正确。"
  appliesTo:
    - "想为有保存和回读入口的 Agent 增加第一条端到端交付测评的工程师。"
    - "想从一个失败结果判断该查执行、读取还是回答本身的读者。"
  notFor:
    - "对真实投研结论、模型质量或线上可用性打分。"
---

# Agent 回答了，怎么证明它真的交付了？

<LearningPathNav />

你让 Agent 比较两份资料。屏幕上已经出现一段回答，任务也标成了「已完成」。第二天重开，正文不见了，或者打开的是前一个版本。你该换模型、改提示词，还是先查报告怎么存、怎么读？

别急着重跑。不妨先换成读者的视角：**不用再生成答案，能不能通过实际读取入口，取回本轮保存的同一份正文和它引用的材料？** 跑过这一步，才知道问题出在交付，还是出在答案本身。

[第一份可回读报告](./open-etf-agent-v01-first-readable-report.md)从磁盘上的一份文件开始。这篇沿用那个问题，但站到读取方：先确认拿到的是哪一份，再故意给读取方一张错误的回执，看它会不会把旧的绿灯照抄过来。

## 先分清三件事：执行完了、拿到了、答对了

生产方说「结束了」，只能说明它对这轮运行的结算。即便报告已保存，读取接口仍可能取错修订，引用指向的原页也可能拿不到。反过来，读取成功只是证明交付内容与保存内容一致，并不证明回答正确。

举个**教学例子**：原始数字从 120 变成 300，倍数是 2.5，增幅是 150%。假如正文写成「增加 250%」，即使这份错误正文原封不动送达，交付仍然可以通过；该失败的是内容判断。把它记成「交付失败」，只会让团队修错地方。

还有一条独立的线：观测记录帮助我们重建经过。没有时间线时，可以说「过程不好查」；如果已经通过读取入口取回了正确产物，就不能倒推「报告没有交付」。这三个判断最好从开始就分开保存，而不是都挤进一个绿色对勾。

## 跑一次 T4，再从读取方重查

以下练习用 [Open ETF Agent v0.51.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.51.0)、Node 26.11.1 和仓库自带的合成材料。安装依赖需要访问 npm；安装完成后，练习只用本机环回 HTTP，不需要模型、账号或密钥。用新的目录检出该版本：

```bash
git clone --branch v0.51.0 --depth 1 https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund

mkdir -p runs
RUN_ROOT="$(mktemp -d "$PWD/runs/v051-t4.XXXXXX")"
npm run -s eval -- run --case T4 --output "$RUN_ROOT"
set -- "$RUN_ROOT"/eval-*
RUN_DIR="$1"
```

T4 保存一份对比报告和两个来源页快照，再复核实际读回。你会看到 T4 为 `passed`，`reportBytesVerified` 为 `true`，`sourceWindowsVerified` 为 `2`。另外三题是 `not-run`，既不是失败，也不能算进通过成绩。产物目录由命令打印；整个练习都在同一个终端里做，后面继续使用 `RUN_DIR`。

真正值得对照的是三个文件：

| 文件 | 回答的问题 |
| --- | --- |
| `fixture-run.json` | 运行保存了什么？本地回读要打开哪些产物、用哪张回执？ |
| `http-evaluation.json` | 读取方是否拿回了该修订的原始正文和来源？ |
| `eval-observations.json` | 这道题对应哪次运行，能否看到同一次运行的本地时间线？ |

回执不只记文件名，还带有产物 ID、修订 ID 和正文摘要值。路径回答的是「去哪找」，身份和摘要回答的是「拿回来的，是不是刚才保存的那一份」。即使读取接口返回 HTTP 200，也要核对这层身份。

用低层读回入口重查一次，不重新生成报告：

```bash
npm run -s evaluate -- --input "$RUN_DIR/fixture-run.json" \
  > "$RUN_DIR/http-evaluation-recheck.json"
```

本次练习中，复查结果与首次保存的 HTTP 测评一致。这比「再问一次也得到相似文字」更强：两次核对的是同一份产物，不是两个相似回答。

## 让绿灯变红：只改一张复制出来的回执

一个只会通过的练习，不足以说明它能挡住什么。下面只修改**回执副本**里的正文 SHA-256，不碰原报告、原回执或时间线，也不模拟生产事故：

```bash
node --input-type=module - "$RUN_DIR" <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
const input = JSON.parse(readFileSync(join(dir, 'fixture-run.json'), 'utf8'))
const row = input.cases.find(row => row.caseId === 'T4')
row.receipt.sha256 = '0'.repeat(64)
writeFileSync(join(dir, 'fixture-run-bad.json'), JSON.stringify(input), { flag: 'wx' })
NODE

if npm run -s evaluate -- --input "$RUN_DIR/fixture-run-bad.json" \
    > "$RUN_DIR/http-evaluation-bad.json"; then
  echo '本应拒绝这张回执' >&2
  exit 1
else
  test "$?" -eq 1 || exit 1
fi
```

T4 现在是 `failed`，原因码为 `HTTP_ARTIFACT_CHECK_FAILED`。这次是回执与保存清单不一致，在真正读取正文之前就被挡下。**报告文件仍然在，生成也没有重跑；失败的是读取方无法用这张回执证明它要读的是那一份。** 真实排障时，这个原因码并不只指摘要不一致，也可能来自修订、正文、来源或附件回读失败。别单凭一个错误码猜根因。

把原结果与这个负例做一次同题对比：

```bash
if npm run -s eval -- compare \
    "$RUN_DIR/http-evaluation.json" "$RUN_DIR/http-evaluation-bad.json" \
    > "$RUN_DIR/comparison.json"; then
  echo '本应报告交付回归' >&2
  exit 1
else
  test "$?" -eq 1 || exit 1
fi
cat "$RUN_DIR/comparison.json"
```

结果只有 T4 可比：从 `passed` 变成 `failed`，标为 `regression`。T1 到 T3 都是 `not-comparable`。比较命令只是比较两份已存结果，不会重新读取报告，更不会重新运行模型。不要只看退出码：比较没有发现回归，不等于有覆盖。比如双方跑的根本不是同一道题，退出码可以是 0，可比数仍然是 0。

## 把这个顺序用回自己的 Agent

如果用户说「看不到正文」，先找这一次的运行和它的交付回执，再从读者真正走的入口重查。证据不同，下一步也不同：

- **运行未完成，没有交付回执**：先查执行停在哪里、有无明确的终止结果。不要因为界面短暂出现过几句文字，就当已经形成可回读报告。
- **运行已完成，但用原回执读不回来**：查保存、修订身份和读取链。先确认已有产物是否还在，不要用一次新生成掩盖旧报告没交付。
- **正文和证据读回成功，只有观测缺失**：补诊断链，保留交付结果。下次出了故障会更难定位，不等于这次报告失败。
- **取回的确实是这一份，但结论不对**：拿这份固定正文和原始资料去复核内容。可以检查单位、时点、计算，或哪句话缺依据；不要拿交付绿灯给结论背书。

开发时，直接读文件很适合测存储是否写对；接近用户时，就要测用户实际的读取入口。如果产品交付靠浏览器、跨账户权限或邮件，这里本机 HTTP 的通过也不能替那些入口验收。分开测，目标不是多造几套指标，而是**下一次失败时，先修真正坏掉的那一段**。

[固定版本 CLI 指南](https://github.com/hpoenixf/open-etf-agent/blob/988c23edf3afb571750c7cecd6f08a68c6e22299/docs/evaluation-cli.md)还提供了全量和基线比较入口。想继续看如何评价已交付文本中的结论，可以读[《Agent 测评全景》](./honest-agent-evaluation.md)。

接着读：[从零上线 Open ETF Agent](./open-etf-agent-staged-deployment.md)。 · [喜欢这个项目，欢迎在 GitHub 点 Star](https://github.com/hpoenixf/open-etf-agent)。
