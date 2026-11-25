---
title: "The Agent Answered. How Do You Know It Delivered?"
description: Read a saved report and its sources back through Open ETF Agent, deliberately invalidate a copy of its receipt, and distinguish a delivery failure from missing observations or a wrong answer.
readingBrief:
  takeaways:
    - "Verify delivery from the reader's entry point by reopening the original report and evidence. A completed run cannot substitute for readback."
    - "Match report bytes and revision identity against a receipt so a successful request cannot silently return the wrong version."
    - "A timeline is diagnostic, not authoritative. Missing observations do not overturn a successful readback."
    - "Compare only cases executed on both sides. Delivering the original answer does not establish that its reasoning is correct."
  appliesTo:
    - "Engineers adding a first end-to-end delivery check to an agent that saves and reopens reports."
    - "Readers trying to decide whether to investigate execution, readback, or the answer itself."
  notFor:
    - "Scoring real investment conclusions, model quality, or production availability."
---

# The Agent Answered. How Do You Know It Delivered?

<LearningPathNav />

You ask an agent to compare two documents. An answer appears on screen, and the task is marked complete. When you reopen it the next day, the report is gone, or you get an older revision. Do you switch models, rewrite the prompt, or look at how the report was saved and fetched?

Before rerunning the agent, try the reader's question: **Can I use the actual reading interface to get back the exact report and evidence this run saved, without generating another answer?** The result tells you whether to investigate delivery or the answer itself.

[Start with a Report You Can Read Back](./open-etf-agent-v01-first-readable-report.md) begins with one file on disk. This exercise takes the same idea to the consumer side. First establish what the reader received. Then give it an incorrect receipt to see whether the green light still holds.

## An execution can complete, a report can arrive, and an answer can still be wrong

A producer can declare its work complete without proving the reader can retrieve it. The report might exist while the reading interface returns the wrong revision or cannot reopen a cited page. Conversely, a clean readback establishes that the delivered material matches what was saved, not that it is correct.

Here is a **teaching example**. If an amount rises from 120 to 300, the new amount is 2.5 times the old one, and the increase is 150%. Suppose the report says “an increase of 250%.” It can arrive byte for byte and pass delivery. The reasoning still fails. Treat it as failed delivery and the team will fix the wrong thing.

Observability is separate, too. A missing timeline means it is harder to reconstruct what happened. It does not mean the report failed to arrive if readback already proved otherwise. Keeping these judgments separate is more useful than asking one green checkmark to stand for all of them.

## Run T4, then check it from the reading side

This exercise uses [Open ETF Agent v0.51.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.51.0), Node 26.11.1, and the bundled synthetic documents. Installing dependencies accesses npm. Once installed, the exercise uses local loopback HTTP and needs no model, account, or API key. Check out the version in a fresh directory:

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

T4 saves a comparison report and two source-page snapshots, then checks the actual readback. Look for `passed` on T4, `reportBytesVerified: true`, and `sourceWindowsVerified: 2`. The other three cases are `not-run`: neither failures nor passes. The command prints where it wrote the artifacts. Stay in the same terminal so the later commands can use `RUN_DIR`.

Three files answer different questions:

| File | Question it answers |
| --- | --- |
| `fixture-run.json` | What did the run save? Which local artifacts and receipt should the reader use? |
| `http-evaluation.json` | Did the consumer retrieve the original report and sources for that revision? |
| `eval-observations.json` | Which run produced this case, and was its local timeline available? |

A receipt carries an artifact ID, a revision ID, and a hash of the report, not just a filename. The path tells you where to look. Identity and hash tell you whether what came back is what was saved. HTTP 200 alone cannot tell you that.

Use the lower-level reader entry point to check again without regenerating the report:

```bash
npm run -s evaluate -- --input "$RUN_DIR/fixture-run.json" \
  > "$RUN_DIR/http-evaluation-recheck.json"
```

In this exercise, the second result matches the first HTTP evaluation. That is stronger than asking the same question again and getting similar wording: both checks address the same artifact, not two similar answers.

## Turn the light red by changing only a copy of the receipt

A happy path alone does not show which mistakes the check catches. Change the report's SHA-256 in **a copy of the receipt input**. This does not alter the report, the original receipt, or the timeline, and it is not a simulation of a production incident:

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
  echo 'Expected the changed receipt to fail' >&2
  exit 1
else
  test "$?" -eq 1 || exit 1
fi
```

T4 now shows `failed` with `HTTP_ARTIFACT_CHECK_FAILED`. The receipt disagrees with the saved manifest, so validation stops before fetching the report. **The file still exists, and generation did not run again. The reader could not prove it had a valid receipt for that artifact.** In real troubleshooting, the same broad error can also cover a revision, report, source, or attachment readback failure. Do not infer the cause from the code alone.

Compare the baseline and the negative result on the same case:

```bash
if npm run -s eval -- compare \
    "$RUN_DIR/http-evaluation.json" "$RUN_DIR/http-evaluation-bad.json" \
    > "$RUN_DIR/comparison.json"; then
  echo 'Expected a delivery regression' >&2
  exit 1
else
  test "$?" -eq 1 || exit 1
fi
cat "$RUN_DIR/comparison.json"
```

Only T4 is comparable. It moves from `passed` to `failed`, so the comparison marks it `regression`. T1 through T3 are `not-comparable`. The command compares saved results; it does not fetch the report again or run a model. Read the coverage alongside the exit code. Two runs that never executed the same case can exit 0 with zero comparable cases, not a clean bill of health.

## Use the same order on your own agent

If a user says “I can't see the report,” find that run and its delivery receipt, then check through the reader's actual entry point. Different evidence leads to different work:

- **The run never completed and there is no receipt.** Inspect where execution stopped and whether a terminal result was recorded. A few streamed fragments are not a saved report.
- **The run completed, but the original receipt does not lead to a successful readback.** Check persistence, revision identity, and the reading path. See whether the old artifact still exists before generating a replacement.
- **The report and evidence read back, but the timeline is missing.** Fix diagnosis without changing the delivery result. The next failure may be harder to investigate; this report did arrive.
- **The right report came back, but its conclusion is wrong.** Review that frozen text against the original material. Check units, dates, calculations, and unsupported claims. Do not let a delivery pass stand in for a content judgment.

Direct file inspection is useful for testing persistence. For end-to-end delivery, test the surface the user actually uses. If the product delivers through a browser, account-scoped access, or email, a local HTTP pass cannot qualify those surfaces. Separate the checks so that the next failure sends you to the part that actually broke.

The [fixed CLI guide](https://github.com/hpoenixf/open-etf-agent/blob/988c23edf3afb571750c7cecd6f08a68c6e22299/docs/evaluation-cli.md) includes the full suite and comparison commands. For evaluating claims in a report after delivery, see [Agent Evaluation Panorama](./honest-agent-evaluation.md).

Next: [Deploy Open ETF Agent from Scratch](./open-etf-agent-staged-deployment.md). · [Star the project on GitHub if it is useful](https://github.com/hpoenixf/open-etf-agent).
