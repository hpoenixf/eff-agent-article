---
title: "After the source changes: let the agent use the new version without losing the evidence behind old reports"
description: "With Open ETF Agent v0.33.0, register two synthetic fee sheets and verify the exact version bound to each submitted task. No model or API key is needed."
readingBrief:
  takeaways:
    - "A task records the selected source manifest fingerprint, not a filename."
    - "Replacing material updates the current revision without rebinding a submitted task."
    - "A stale write is rejected; read the current revision rather than overwriting it."
  appliesTo:
    - "Developers who want to verify changes to research sources and preserve the evidence for earlier tasks."
  notFor:
    - "Checking a real fund fee, generating a model report, or certifying citation quality."
---

# After the source changes: let the agent use the new version without losing the evidence behind old reports

<LearningPathNav />

Last week, you asked an agent to check a fund's management fee against a fee sheet. It said **0.30%**. This week the sheet changed to **0.25%**. You want the next research task to use the new rate without silently replacing the evidence behind the old one.

In a shared folder, overwriting the file may be enough. A research project has to answer two different questions: **“Which version should I use now?” and “Which version did I use then?”** If a task remembers only the filename, opening the same path later might not retrieve the same document.

This workshop uses [Open ETF Agent v0.33.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.33.0). Both fee sheets are synthetic and do not represent actual products. You will register material, submit tasks, and verify their source bindings. You will not run inference or need an API key.

## 1. Separate research material from the task

The material in this workshop is called `fee-sheet`. Its two versions belong to one material entry. Selecting a version returns a `manifestSha256`: the fingerprint of the manifest for that specific selection. Submit the research task with that fingerprint, not a filename or a natural-language request to “use the latest.”

| What you specify | What it answers |
| --- | --- |
| Material ID `fee-sheet` | Which material is this? |
| `--version 1` or `--version 2` | Which version do I want this time? |
| The task's `sourceManifestSha256` | Which source manifest did this task actually bind to? |

Install Node.js 26 (the release declares `>=26.8.1 <27`). Run the commands in a new working directory rather than changing an existing research project.

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

## 2. Select version 1 for last week's task

Register the first version. The original file stays in your exercise directory; the submitted research task does not depend on that external path.

```bash
research material register --project "$PROJECT" --id fee-sheet --file "$LAB/fee-v1.txt"

research material select --project "$PROJECT" --id fee-sheet --version 1 > "$LAB/selection-v1.json"
M1="$(field manifestSha256 < "$LAB/selection-v1.json")"

research run submit --project "$PROJECT" --run fee-last-week \
  --question "$LAB/question.txt" --manifest "$M1"
```

Registration returns revision `1`. The submission's `sourceManifestSha256` should equal `M1`. This only creates a task ready for execution; **no report has been generated**. That makes it easier to see exactly when the task's evidence is fixed.

## 3. Update the material, then submit a new task

The new sheet belongs to the same `fee-sheet` entry. Here, `--revision 1` does not tell the new task to read version 1. It means: **replace the material only if its current registry revision is still the revision I saw**. If someone has already updated it, read back its state rather than overwriting their change.

```bash
research material replace --project "$PROJECT" --id fee-sheet \
  --file "$LAB/fee-v2.txt" --revision 1

research material select --project "$PROJECT" --id fee-sheet --version 2 > "$LAB/selection-v2.json"
M2="$(field manifestSha256 < "$LAB/selection-v2.json")"

research run submit --project "$PROJECT" --run fee-this-week \
  --question "$LAB/question.txt" --manifest "$M2"
```

The registry advances to revision 2. The two prompts are identical; the source manifest is what changes. Do not simulate a fresh research task by overwriting its old input or reusing its ID.

## 4. Read back both tasks, not just the latest version

`material read` shows the material's **current** state. For “which version did last week's task use?”, look at the old task's own binding.

```bash
research run inspect --project "$PROJECT" --run fee-last-week > "$LAB/old-run.json"
research run inspect --project "$PROJECT" --run fee-this-week > "$LAB/new-run.json"

OLD="$(field sourceManifestSha256 < "$LAB/old-run.json")"
NEW="$(field sourceManifestSha256 < "$LAB/new-run.json")"

if [ "$OLD" = "$M1" ] && [ "$NEW" = "$M2" ] && [ "$OLD" != "$NEW" ]; then
  printf '%s\n' 'The old task still binds version 1; the new task binds version 2.'
else
  printf '%s\n' 'Unexpected binding: first check version selection and submission output.' >&2
  exit 1
fi

research source list --project "$PROJECT" --manifest "$OLD"
research source list --project "$PROJECT" --manifest "$NEW"
```

The exercise returned `phase: ready` for both tasks, with `model` and `tool` both at 0 in `rootUsage`. An `active` value in `run.status` does not mean the task finished or produced a report.

The last two commands look up material metadata by manifest fingerprint. They do not ask a model to explain the fees or display the full source. **To audit a result, first identify the material each task used, then check the number in the matching original.** Version binding tells you which source to inspect. It does not prove that the model interpreted that source correctly or that its fee applies to a real holding or trade.

To try the update protection, attempt to disable the current material entry using its stale revision:

```bash
research material remove --project "$PROJECT" --id fee-sheet --revision 1
```

The expected result is `MATERIAL_CONFLICT`, not the removal of someone else's newer edit. Use `material read` to confirm the current revision is still 2. Repeating the removal with the correct revision would actually disable the entry; it is not a preview.

## Take this habit with you: updating does not rewrite history

The old and new tasks remain auditable not because the agent remembers both rates, but because **the system records the selected manifest at submission time**. Updating material can change what you choose next time. It should not rewrite an earlier research record.

This workshop ends at task binding. The repository's [material lifecycle test with a mock model](https://github.com/hpoenixf/open-etf-agent/blob/v0.33.0/test/research-materials.test.mjs) also covers reading the sources back from a completed report. No such report came out of this zero-inference exercise, and the test does not show a real model citing the fee correctly.

The previous workshops: [Bring your own documents to an agent](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-research-project-workshop) · [After the report: source checks, specialist work, and independent review](https://hpoenixf.com/eff-agent-article/en/articles/open-etf-agent-report-review-workshop). For the reasoning behind versions, source identity and failure handling, see [the engineering design of research material assets](https://hpoenixf.com/eff-agent-article/en/articles/agent-research-assets-identity-version-lifecycle).

Continue with [From a Question to a Visible Answer: ETF Agent’s Six-Layer Request Lifecycle](017-prompt-to-answer-six-layer-panorama-v3.md).
