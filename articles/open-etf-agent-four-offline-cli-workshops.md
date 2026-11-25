---
description: "用四个命令行练习入门 Open ETF Agent，离线核对报告、复算 ETF 快照、预检 Skill，再排查本机安装。"
readingBrief:
  takeaways:
    - "复制报告时，把正文、引用索引和校验清单一起带走。"
    - "两只 ETF 的日期、币种和收益口径对齐后，再计算差异。"
    - "Skill 先预览实际加载的文字，部署失败先看哪项本地条件缺失。"
  appliesTo:
    - "想先用合成资料跑通 Open ETF Agent 的新读者。"
  notFor:
    - "依赖实时行情、个人持仓或模型研究质量评估的任务。"
---
# 不用模型密钥，先跑通 Open ETF Agent 的四个练习

收到一份 ETF 研究，打开文件只是第一步。你可能还想知道报告是否完整，引用能不能找到，两个收益数字是否用了同一段时间。下面用四个小练习把这些问题拆开。每个练习都可以单独做，所需资料随源码提供。

## 安装固定版本

准备 Node.js 26.8.1 至 26.x，下面的练习用 26.11.1 验证。下载 v0.70.0 后，一份代码就能运行四个命令。安装依赖时需要访问包仓库。安装完可以用本地样例做完四道题。[v0.70.0 Release](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.70.0)

```bash
git clone --branch v0.70.0 --depth 1 https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund
```

## 1. 把报告带走，再看它能不能核对

先运行合成练习。它实际发布一份报告，导出后把复制件移到另一处，再核对内容。练习还会主动改动其中一个文件，验证命令应立即报错。

```bash
node --test test/report-bundle.test.mjs
```

有自己可读取的已发布报告时，换成原项目目录和 Run ID。复制时带上全部三个文件。

```bash
node src/report-bundle-cli.mjs export --project ./my-project --run my-run --out ./portable-report
node src/report-bundle-cli.mjs verify --bundle ./portable-report
```

用文本编辑器打开 `report.md`，在 `citations.json` 中找原来的引用编号。公开网页只记过提取分段时，就按分段查找。页码和章节缺失会留空。本地私有来源的记录不随索引导出。把导出命令给出的清单哈希另存一份，交给接收方核验整包。校验通过说明文件字节一致，研究结论仍需阅读者判断。[离线交付包用法](https://github.com/hpoenixf/open-etf-agent/blob/v0.67.0/docs/offline-report-bundle.md)

## 2. 用手算核对两个 ETF 的比较结果

两只模拟基金各有一份快照，分别是 JSON 和 CSV。先看份额类别、币种和快照日期，再读费率、持仓权重和收益。

```bash
node src/etf-compare-cli.mjs --left fixtures/etf-compare/alpha.json --right fixtures/etf-compare/beta.csv --start 2026-10-01 --end 2026-10-31
```

| 看什么 | 样例算式 |
| --- | --- |
| 年度费率差 | 20 − 10 = 10 个基点 |
| 持仓重叠 | min(60%, 40%) + min(40%, 60%) = 80% |
| 行业重叠 | min(50%, 40%) + min(50%, 60%) = 90% |
| 区间收益 | 108 ÷ 100 − 1 = 8%，206 ÷ 200 − 1 = 3% |

如果你删掉一个期末值，结果会指出缺了哪个端点。如果两个快照日期或币种不同，结果会标出不可比。这样你能看出下一步该补哪份资料。[本地快照格式与复算说明](https://github.com/hpoenixf/open-etf-agent/blob/v0.68.0/docs/etf-snapshot-comparison.md)

## 3. 改一份 Skill，看看宿主实际能读到什么

把例子复制到自己的目录，再看预览。校验沿用系统本来的 Skill 目录和元数据规则。

```bash
cp -R fixtures/skill-preflight ./my-skills
node src/skill-preflight-cli.mjs validate --root ./my-skills
node src/skill-preflight-cli.mjs preview --root ./my-skills --skill fund-research
node src/skill-preflight-cli.mjs test --root ./my-skills --case fixtures/fund-research-skill-case.json
```

样例建议使用 `save_report`，但样例宿主只列了 `read_page`。把这一点看明白，日后就知道该改 Skill 正文，还是去检查宿主配置。预检能验证文本和相对路径所指的资源。它把脚本当成文件读，工具权限仍由宿主决定。[基金研究 Skill 示例](https://github.com/hpoenixf/open-etf-agent/blob/v0.69.0/docs/skill-author-preflight.md)

## 4. 自己部署时，先确认故障在哪一层

先用文本输出看建议。自动化可以改用 `--json`，按状态码判断。服务已启动时，才给诊断命令传已有的本机端口。

```bash
node src/deploy-doctor-cli.mjs --project ./local-project
node src/deploy-doctor-cli.mjs --json --project ./local-project --port 8787
```

初次安装、依赖缺失、版本不一致、目录无法访问、端口没启动，在输出里有各自的状态。端口检查只探测本机首页；配置检查会指出缺项，不回显配置值。首页有响应以后，还可以回到业务记录验证自己真正关心的功能。[自部署诊断说明](https://github.com/hpoenixf/open-etf-agent/blob/v0.70.0/docs/self-host-diagnostics.md)
