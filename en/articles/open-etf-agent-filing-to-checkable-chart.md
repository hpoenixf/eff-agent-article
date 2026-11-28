---
description: "Run a synthetic filing through Open ETF Agent v1.0.5, recompute a chart from PDF cells, and learn when a cited answer should ship without a chart."
readingBrief:
  takeaways:
    - "An announcement link helps discover a file. Supporting a number requires the PDF's physical page, row, column, and unit actually read."
    - "A chart can be independently checked when it uses the controlled calculation result and preserves the sources for both inputs."
    - "A missing table need not block a cited answer. Do not turn missing values into zeros or invent a chart."
  appliesTo:
    - "Beginners who can run an agent demo and want to verify the numbers in a research result."
  notFor:
    - "OCR for scanned documents, general web automation, or judging a live model's financial analysis with a synthetic exercise."
---
# From a Filing to a Chart You Can Check: An Open ETF Agent Workshop

<LearningPathNav />

A chart says “25%.” How do you check it? Open the underlying report, find the two values, and see whether they describe the same metric in the same units across the relevant periods. A polished chart or a link to an entire report still leaves most of that work to the reader.

This workshop uses a **synthetic issuer announcement** rather than a live filing. It rehearses the same job: follow the announcement to its attachment, identify two table values, calculate the relative change, and trace the chart back to the source. All figures are teaching data.

## Run it without a model key

On Linux, use Node.js 26.x (26.8.1 or later), npm, and an executable `/usr/bin/python3`. The controlled formula interpreter in this version uses that Python path. Installing dependencies requires npm access. Once installed, neither exercise calls a real website or a model service.

```bash
git clone --branch v1.0.5 --depth 1 https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund
node --test test/local-gui-web-pdf-chart-chain.test.mjs
```

Expect two passing tests and no skips. The first connects HTML, original table cells, calculation, and a chart. The second reopens a cited answer even when no usable table exists. In the [runnable exercise pinned to this release](https://github.com/hpoenixf/open-etf-agent/blob/v1.0.5/test/local-gui-web-pdf-chart-chain.test.mjs), scripted model actions drive the local runtime; PDF parsing, calculation, persistence, and readback actually run. The command prints test results. It does not open a browser or produce screenshots.

## Follow the announcement to the actual values

The “original filing” link is a lead. The exercise follows it to a text-layer PDF and reads physical page 1. A physical page is a position in the PDF, not necessarily the number printed on the cover, in the body, or in a footer.

Read the headers before extracting the numbers. In the exercise's `PERFORMANCE (%)` table, the `NAV` and `Benchmark` rows sit next to each other. Two bare numbers are easy to take from the wrong row. The table, row, column, unit, and source identify the two cells that the formula should consume.

| Table row | 2025 (%) | 2026 (%) |
| --- | ---: | ---: |
| NAV | 0.32 | 0.40 |
| Benchmark (not used in this formula) | 1.10 | 1.20 |

The columns represent different years. This is the relative change of the percentage reported in the `NAV` row; it does not mean the fund returned 25%. If the question asks for the increase in percentage points, the answer is **0.08 percentage points**, not 25%. The same values answer two different questions.

## Pass references to the calculator, not numbers copied from prose

The calculation is `(0.40 / 0.32 - 1) × 100 = 25%`. In the exercise, the model gives the controlled formula two references to previously read cells, rather than copying numbers out of an answer. The runtime resolves their values, checks input units, and runs `growth(nav)`. The chart uses that calculation result. Only the second point has a growth rate: the first year has no prior period, so it stays blank rather than becoming zero.

Why not ask the model to give the frontend an array of numbers? That is simpler for a disposable illustration nobody needs to audit. Once a figure goes in a research report, readers need to know both where the values came from and how they were combined. Here the model selects the metric and formula, the runtime reads the values and computes the result, and the frontend displays it. Controlled arithmetic does not tell you whether the chosen metric or comparison makes sense.

One test action supplies a reference to a cell that was never read. The formula reports an unavailable source instead of guessing a value. Source identity changes what the runtime can do, not just what appears in the footer.

## Check the path in reverse

Start at **25%**. Which calculation produced it? Which two inputs did the calculation use? Can each source take you back to physical page 1 of the same PDF while distinguishing the 2025 and 2026 columns? The exercise checks both the chart's source links and the stored cell records. It then closes and reopens the runtime and reads the same body, sources, and chart without downloading the PDF again or making another model request. This checks the material the answer used, not a later copy grabbed from the web.

Now try the other PDF. It contains citable text saying that the fund changed its benchmark in July, but no usable numeric table. The useful result is that statement with its page citation and an explanation for the missing chart. If the system could not read even the text, it should say the evidence is insufficient rather than turning absence into a conclusion.

The next time you wire up a filing or a periodic fund report, check that you can **open the original, find the values, and reproduce the calculation on the same basis**. Where the evidence falls short, keep the part you can support.

Next, try the [delivery exercise](./open-etf-agent-prove-delivery) to distinguish a delivered report, a telemetry gap, and a claim that still needs review.

Further reading: [Reopen the original research](./open-etf-agent-verify-and-reopen-research) · [How the PDF reader evolved](./024-agent-pdf-from-text-to-evidence) · [Open ETF Agent v1.0.5](https://github.com/hpoenixf/open-etf-agent/releases/tag/v1.0.5). If the workshop is useful, consider starring the [open-source repository](https://github.com/hpoenixf/open-etf-agent).
