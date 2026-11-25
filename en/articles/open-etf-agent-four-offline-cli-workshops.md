---
description: "Learn Open ETF Agent through four command-line exercises for report readback, ETF calculations, Skill preflight, and local deployment diagnosis."
readingBrief:
  takeaways:
    - "Keep the report body, citation index, and checksum manifest together."
    - "Match observation dates, currency, and return basis before comparing two ETFs."
    - "Preview the actual Skill text and diagnose each startup condition locally."
  appliesTo:
    - "New readers who want to try Open ETF Agent with synthetic inputs."
  notFor:
    - "Tasks that need live prices, personal holdings, or model quality evaluation."
---
# Four Exercises to Get Started with Open ETF Agent Without a Model Key

Opening a research report is the first step. You may also want to know whether the file is complete, whether its citations can be found, and whether two numbers describe the same time period. These four exercises let you check each of those things on its own. The source checkout includes all the sample inputs.

## Install a fixed release

Use Node.js 26.8.1 through 26.x. The exercises were verified with 26.11.1. Once you have downloaded v0.70.0, the same checkout can run all four commands. Installing dependencies requires registry access. The bundled examples run locally afterward. [v0.70.0 Release](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.70.0)

```bash
git clone --branch v0.70.0 --depth 1 https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund
```

## 1. Take a report offline and verify it

Start with the synthetic exercise. It publishes a report, exports it, copies the directory, and verifies the copy. It also edits a file deliberately, so you can see the verifier reject it.

```bash
node --test test/report-bundle.test.mjs
```

If you already have access to a published report, use its project directory and Run ID. Copy all three files together.

```bash
node src/report-bundle-cli.mjs export --project ./my-project --run my-run --out ./portable-report
node src/report-bundle-cli.mjs verify --bundle ./portable-report
```

Open `report.md` in a text editor and look up original citation numbers in `citations.json`. If a Web source only recorded an extraction chunk, use that location. Missing physical pages and sections remain blank. Private local source records stay with the original project. Keep the export's manifest digest separately so the recipient can verify the entire bundle. Matching checksums establish file integrity. The research claims still need a reader's judgment. [Offline report bundle](https://github.com/hpoenixf/open-etf-agent/blob/v0.67.0/docs/offline-report-bundle.md)

## 2. Recalculate an ETF comparison by hand

The two synthetic funds each have a snapshot, one in JSON and one in CSV. Look at their share classes, currency, and snapshot dates before reading fees, weights, and returns.

```bash
node src/etf-compare-cli.mjs --left fixtures/etf-compare/alpha.json --right fixtures/etf-compare/beta.csv --start 2026-10-01 --end 2026-10-31
```

| Measure | Sample calculation |
| --- | --- |
| Annual fee difference | 20 − 10 = 10 basis points |
| Holdings overlap | min(60%, 40%) + min(40%, 60%) = 80% |
| Sector overlap | min(50%, 40%) + min(50%, 60%) = 90% |
| Interval returns | 108 ÷ 100 − 1 = 8%, and 206 ÷ 200 − 1 = 3% |

Remove one ending value and the output identifies which endpoint is missing. A mismatch in snapshot date or currency makes the comparison unavailable. The result tells you which information to go back and find. [Local snapshot format and calculations](https://github.com/hpoenixf/open-etf-agent/blob/v0.68.0/docs/etf-snapshot-comparison.md)

## 3. Edit a Skill and inspect what the Host reads

Copy the example into your own directory and open the preview. Validation uses the same directory and metadata rules as the Skill catalog.

```bash
cp -R fixtures/skill-preflight ./my-skills
node src/skill-preflight-cli.mjs validate --root ./my-skills
node src/skill-preflight-cli.mjs preview --root ./my-skills --skill fund-research
node src/skill-preflight-cli.mjs test --root ./my-skills --case fixtures/fund-research-skill-case.json
```

The example suggests `save_report`, while the sample Host offers only `read_page`. That difference helps you decide whether to edit the Skill or inspect the Host configuration. Preflight checks the text and the selected resources. It reads scripts as files. The Host determines tool permissions. [Fund-research Skill example](https://github.com/hpoenixf/open-etf-agent/blob/v0.69.0/docs/skill-author-preflight.md)

## 4. Locate a self-hosted startup failure

Use the text output to see the next step. Add `--json` to read stable status codes in automation. Supply a port only if you already have a local listener to check.

```bash
node src/deploy-doctor-cli.mjs --project ./local-project
node src/deploy-doctor-cli.mjs --json --project ./local-project --port 8787
```

First launch, missing dependencies, a version mismatch, inaccessible directories, and an unavailable port have separate outcomes. The port probe checks the local homepage. The config check identifies missing settings without displaying their values. Once the homepage responds, continue with the workflow you wanted to verify. [Self-host diagnostics](https://github.com/hpoenixf/open-etf-agent/blob/v0.70.0/docs/self-host-diagnostics.md)
