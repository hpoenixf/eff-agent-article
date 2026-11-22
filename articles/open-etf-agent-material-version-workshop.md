---
title: "资料更新以后：让 Agent 用新版继续研究，旧报告还能查证"
description: "用 Open ETF Agent v0.33.0 登记两份合成费率表，提交并读回两次任务的版本绑定。无需模型或 API key。"
readingBrief:
  takeaways:
    - "选版返回的清单指纹才是任务绑定的依据，不是文件名。"
    - "替换资料会更新当前修订；已经提交的任务仍保留旧绑定。"
    - "使用旧修订号尝试写入时，应先读回而不是覆盖。"
  appliesTo:
    - "希望用 CLI 核验资料换版、又保留旧研究依据的开发者。"
  notFor:
    - "真实基金费率判断、模型生成报告或自动认证引用质量。"
---

# 资料更新以后：让 Agent 用新版继续研究，旧报告还能查证

<LearningPathNav />

上周，你让 Agent 根据一份基金费率表核对管理费，表上写 **0.30%**。这周，资料更新成 **0.25%**。你既想让下一次研究用新费率，又不想让旧报告回查时悄悄换掉依据。

在共享文件夹里，直接覆盖原文件通常就够了。但在研究项目里，**“现在应该用哪一版？”和“当时用的是哪一版？”是两个问题。** 如果任务只记住文件名，下次打开同名文件时，系统可能已经看不到当时的那一份。

这一篇用 [Open ETF Agent v0.33.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.33.0) 做一个小实验。两份费率表都是合成材料，不代表真实产品。练习只登记资料、提交任务和核验依据，不执行推理，不需要 API key。

## 一、先把资料和研究任务分开

在这个练习里，同一份资料叫 `fee-sheet`。它有两个版本，两个版本属于同一个资料条目。**选版**以后，CLI 会返回一个 `manifestSha256`，也就是这次所选材料清单的指纹。创建研究任务时，交给它的是这个指纹，不是文件名，也不是“用最新版”这句话。

记住这三样就够了：

| 你操作的东西 | 回答的问题 |
| --- | --- |
| 资料 ID `fee-sheet` | 这是哪份资料？ |
| `--version 1` 或 `--version 2` | 这次要用哪一版？ |
| 任务里的 `sourceManifestSha256` | 这次任务实际绑定了哪份材料清单？ |

装好 Node.js 26（这个版本声明支持 `>=26.8.1 <27`），在终端执行。用新目录练习，不占用自己的现有研究项目。

```bash
git clone --branch v0.33.0 https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund

LAB="$(mktemp -d "$PWD/material-lab.XXXXXX")"
PROJECT="$LAB/project"

cat > "$LAB/config.json" <<'JSON'
{
  "schemaVersion": "research-project@1",
  "gateway": {
    "mode": "fixture",
    "provider": "test",
    "protocol": "fixture@1",
    "model": "fixture"
  },
  "capabilities": ["report"]
}
JSON

printf 'Synthetic fund fee sheet\nEffective: 2026-01-01\nAnnual management fee: 0.30%%\n' > "$LAB/fee-v1.txt"
printf 'Synthetic fund fee sheet\nEffective: 2026-02-01\nAnnual management fee: 0.25%%\n' > "$LAB/fee-v2.txt"
printf 'What annual management fee is stated in the selected fee sheet? Cite this version.\n' > "$LAB/question.txt"

research() { node src/research-cli.mjs "$@"; }
field() { node -e 'const fs = require("node:fs"); const x = JSON.parse(fs.readFileSync(0, "utf8")); if (x[process.argv[1]] == null) process.exit(1); console.log(x[process.argv[1]])' "$1"; }

research project init --project "$PROJECT" --config "$LAB/config.json"
```

## 二、给上周的任务选定第一版

先登记第一版。文件还在你的练习目录里，但提交研究任务时，不让任务依赖这个外部路径。

```bash
research material register --project "$PROJECT" --id fee-sheet --file "$LAB/fee-v1.txt"

research material select --project "$PROJECT" --id fee-sheet --version 1 > "$LAB/selection-v1.json"
M1="$(field manifestSha256 < "$LAB/selection-v1.json")"

research run submit --project "$PROJECT" --run fee-last-week \
  --question "$LAB/question.txt" --manifest "$M1"
```

登记结果的 `revision` 是 `1`。提交结果中的 `sourceManifestSha256` 应当等于 `M1`。到这里我们只是建立了一份待执行任务，**没有生成报告**。这正好让我们只观察一件事：依据是在什么时候固定下来的？

## 三、更新资料，再交一份新任务

新表到了，仍然登记在 `fee-sheet` 之下。这里的 `--revision 1` 不是让新任务读版本 1，而是说：**只有我看到的资料登记修订还是 1，才执行这次替换。** 如果别人已经更新过，该先读回状态，不该覆盖对方。

```bash
research material replace --project "$PROJECT" --id fee-sheet \
  --file "$LAB/fee-v2.txt" --revision 1

research material select --project "$PROJECT" --id fee-sheet --version 2 > "$LAB/selection-v2.json"
M2="$(field manifestSha256 < "$LAB/selection-v2.json")"

research run submit --project "$PROJECT" --run fee-this-week \
  --question "$LAB/question.txt" --manifest "$M2"
```

这时资料登记推进到修订 2。两次提问内容完全相同，真正不同的是交给任务的材料清单。不要用覆盖旧输入或复用旧任务 ID 来模拟“再研究一次”。

## 四、别只看「最新版」，回查两次任务

`material read` 告诉你资料**现在**的状态。要回答「上周用的是哪版」，应该看旧任务自己的绑定。

```bash
research run inspect --project "$PROJECT" --run fee-last-week > "$LAB/old-run.json"
research run inspect --project "$PROJECT" --run fee-this-week > "$LAB/new-run.json"

OLD="$(field sourceManifestSha256 < "$LAB/old-run.json")"
NEW="$(field sourceManifestSha256 < "$LAB/new-run.json")"

if [ "$OLD" = "$M1" ] && [ "$NEW" = "$M2" ] && [ "$OLD" != "$NEW" ]; then
  printf '%s\n' '旧任务仍绑定第一版；新任务绑定第二版。'
else
  printf '%s\n' '绑定与预期不符，先检查选版和提交输出。' >&2
  exit 1
fi

research source list --project "$PROJECT" --manifest "$OLD"
research source list --project "$PROJECT" --manifest "$NEW"
```

实测两次任务都是 `phase: ready`，且 `rootUsage` 中 `model`、`tool` 均为 0。即使输出里的 `run.status` 是 `active`，也别把它理解成已经跑完或写好了报告。

最后两个命令按清单指纹读回材料信息。它们不是让模型再解释一次费率，也不是全文阅读命令。**对账时先核两次任务各自用了哪一份，再回对应原文核对数值。** 版本绑定解决的是“查哪份”，既不保证模型读对了，也不代表这条费率适用于实际持仓或交易。

如果希望顺手试一下更新保护，再用同一个条目的旧修订号尝试停用：

```bash
research material remove --project "$PROJECT" --id fee-sheet --revision 1
```

正确结果是拒绝这一步（`MATERIAL_CONFLICT`），而不是把别人已经更新过的资料停用。然后用 `material read` 确认当前还是修订 2。注意，换成正确修订后再执行是真正的停用操作，不是预览。

## 带走一个习惯：更新不等于改写

旧任务和新任务都能核验，并不是因为 Agent 记住了两个数字，而是因为系统在任务提交时**明确记录了当时选用的资料清单**。更新资料可以改变以后要选的版本；它不应回头重写已经作出的研究记录。

这篇练的是材料登记到任务绑定。仓库另有[带模拟模型的生命周期测试](https://github.com/hpoenixf/open-etf-agent/blob/v0.33.0/test/research-materials.test.mjs)，覆盖任务完成后读回报告来源；它不是这次零模型练习的输出，也不等于真实模型已经正确引用费率。

前两站：[把自己的资料交给 Agent](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-research-project-workshop) · [报告写完以后：让 Agent 查证、协作，再独立复核](https://hpoenixf.com/eff-agent-article/articles/open-etf-agent-report-review-workshop)。想看同一机制为什么需要版本、来源身份和失败回退，再读[研究资料资产的工程设计](https://hpoenixf.com/eff-agent-article/articles/agent-research-assets-identity-version-lifecycle)。

接着读：[一个 Agent 开始好用，是从它敢说「这份资料没拿到」开始的](open-etf-agent-evidence-and-history-workshop.md)。也可以直接读[从一次提问到答案可见：ETF Agent 六层调用全景](017-prompt-to-answer-six-layer-panorama-v3.md)。
