# AI Coding 质量全景：配套实验

正文先讨论怎样判断质量。本文件保留需要实际运行时使用的命令，不要求读者为理解正文完成全部实验。

使用 Bash 终端，统一准备 Node 26.11.1 与 npm。以下命令沿用同一终端的路径变量；换终端后将变量设为实际绝对路径即可。

## 1. 运行公开案例

固定 Open ETF Agent 提交 `afbfb9865539c18c9358ac65c822f929aaa6e872`（v0.24.0）。首次安装依赖访问 npm；该示例使用固定脚本的模型调用入口，不需要模型密钥，计算与文件读写走真实实现。

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
git checkout afbfb9865539c18c9358ac65c822f929aaa6e872
OPENETF_ROOT="$(pwd)"

npm ci --ignore-scripts --no-audit --no-fund
npm run build
node src/cli.mjs --case result-consumption \
  --output runs/result-consumption > result-consumption.json
```

仓库合成表格含100、999、250。选区覆盖三行，比较操作数是第0与第2行，预期差额150、当前/基准2.5、增长比例1.5（150%）。这不是实际基金收益案例，也不提供通用金融十进制精度保证。

打开 `result-consumption.json`，使用本次的 `directory` 与 `receipt`。目录中的 `report.md` 是保存的报告，`manifest.json` 记录来源、计算和产物身份，CSV 用回执中的附件身份取得。输出应为 `status: completed`、`mode: fixture`，并保留 `semanticStatus: unreviewed`。

[原案例](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/src/result-consumption-demo.mjs)

## 2. 查看一个反例与一次退出后读取

缺尾行测试缩小取数窗口，让所需第三行不在选区；即使窗口完整返回，也应拒绝比较。当前已修复版本应通过：

```bash
node --test --test-name-pattern="RC missing tail operand" \
  test/result-consumption.test.mjs
```

现存CLI回归会创建自己的运行，等生产进程退出，再在另一进程中读取原报告、CSV与来源：

```bash
node --test --test-concurrency=1 test/result-consumption-cli.test.mjs
```

这条测试创建的是新运行。要检查第1节手动创建的同一份产物，用源码包的 `readback-result-consumption.mjs`，把第一个路径改为自己的脚本位置：

```bash
node /absolute/path/to/readback-result-consumption.mjs \
  "$OPENETF_ROOT" "$OPENETF_ROOT/result-consumption.json"
```

脚本通过原Reader执行HTTP读取，自动关闭服务。四项核对分别是报告哈希、CSV哈希、原表字节与共同计算引用；任一项失败，进程非零退出。它检查身份与工程交付，不评价全部报告语义，也不调用模型。

如需手工查看读取页面，可使用自己的目录启动常驻服务：

```bash
npm run serve -- --run <result-consumption.json中的directory>
```

在终端显示的本地地址打开。查看结束按 Ctrl+C，再继续同一终端中的命令。

## 3. 用 Suite 检查真实历史记录

固定 Suite 提交 `89c272c22c19f79582fde01eb25859547b6ac3ff`：

```bash
cd "$OPENETF_ROOT/.."
git clone https://github.com/hpoenixf/agent-engineering-suite.git
cd agent-engineering-suite
git checkout 89c272c22c19f79582fde01eb25859547b6ac3ff
AES_ROOT="$(pwd)"
SPEC_CLI="$AES_ROOT/skills/aes-spec-flow/toolkit/bin/spec-evidence.mjs"

node "$SPEC_CLI" lint --root "$OPENETF_ROOT" \
  --change result-reference-consumption --stage apply
node "$SPEC_CLI" status --root "$OPENETF_ROOT" \
  --change result-reference-consumption
node "$SPEC_CLI" verify --root "$OPENETF_ROOT" \
  --change result-reference-consumption --check
```

这三条命令读取已有记录，不重新执行历史测试。`recorded-complete` 表示已经登记完成；`current` 表示汇总与输入一致；`rerun: false` 保留没有重新执行的事实。历史记录中的日期和版本仍指向当时，不能替代今天的产品验收。

[证据格式](https://github.com/hpoenixf/agent-engineering-suite/blob/89c272c22c19f79582fde01eb25859547b6ac3ff/skills/aes-spec-flow/toolkit/docs/evidence-format.md)

## 4. 在自己的项目采用 Skill

先对临时目录查看安装计划：

```bash
AES_PROJECT="$(mktemp -d)"
node "$AES_ROOT/scripts/install-skills.mjs" \
  --module all --target "$AES_PROJECT/.agents/skills"
```

核对计划后，添加 `--apply` 才写入：

```bash
node "$AES_ROOT/scripts/install-skills.mjs" \
  --module all --target "$AES_PROJECT/.agents/skills" --apply
```

实际采用时，把 `AES_PROJECT` 设为真实项目的绝对路径，重新按 plan → apply 安装，再在该项目中打开支持 `.agents/skills` 的 Coding Agent。临时安装不会让其他项目自动加载；已有同名插件时不要重叠安装。可以按[安装文档](https://github.com/hpoenixf/agent-engineering-suite/blob/89c272c22c19f79582fde01eb25859547b6ac3ff/docs/installation.md)只选择需要的模块。

向已加载 Skill 的 Agent 提出本次真实需求，要求它先明确验收行为与变更边界，再选择反例、实现、审查和实际验证。新任务用自己的记录保存输出、命令和版本，不改写原示例的历史。Grilling、Spec 和双轴审查是工作方法；具体业务测试仍由消费项目执行。

## 可选回归

在 Open ETF Agent 中，可运行正文案例涉及的现存测试选集：

```bash
cd "$OPENETF_ROOT"
node --test --test-concurrency=1 \
  test/result-consumption.test.mjs \
  test/result-consumption-delivery.test.mjs \
  test/result-consumption-cli.test.mjs \
  test/evaluate.test.mjs
```

这些案例、安装路径和读取方式已在本次文章调研期间核对并实际运行；这不等于所有宿主、真实模型或整仓所有能力都重新验收。行业工具的引用来自官方资料，本文没有宣称这些项目已经接入我们的仓库。

