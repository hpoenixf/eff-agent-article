# AI Coding Quality Panorama: Companion Experiments

The main article explains how to judge quality. This file contains the commands for readers who want to run the examples. Completing every experiment is not a prerequisite for understanding the article.

Use a Bash terminal with Node 26.11.1 and npm. The commands below share path variables within the same terminal session. If you open a new terminal, set those variables to the appropriate absolute paths again.

## 1. Run the public example

Use Open ETF Agent commit `afbfb9865539c18c9358ac65c822f929aaa6e872` (v0.24.0). The initial dependency installation accesses npm. This example uses scripted responses at the model-call boundary and does not require a model API key; calculations and file operations use the actual implementation.

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

The repository's synthetic table contains 100, 999, and 250. The selection covers all three rows, and the comparison operands are rows 0 and 2. The expected difference is 150, the current-to-baseline ratio is 2.5, and the growth ratio is 1.5 (150%). This is not a real fund-return example, and it does not provide a general guarantee of decimal precision for financial calculations.

Open `result-consumption.json` and use the `directory` and `receipt` from this run. The directory's `report.md` is the saved report. Its `manifest.json` records the identities of sources, calculations, and artifacts. Retrieve the CSV using the attachment identity in the receipt. The output should contain `status: completed` and `mode: fixture`, while retaining `semanticStatus: unreviewed`.

[Example implementation](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/src/result-consumption-demo.mjs)

## 2. Examine a counterexample and read the result after the producer exits

The missing-tail-row test narrows the read window so that the required third row is outside the selection. The comparison should be rejected even if the window is returned in full. The current, fixed version should pass this test:

```bash
node --test --test-name-pattern="RC missing tail operand" \
  test/result-consumption.test.mjs
```

The existing CLI regression test creates its own run, waits for the producer process to exit, and then reads the original report, CSV, and source in a separate process:

```bash
node --test --test-concurrency=1 test/result-consumption-cli.test.mjs
```

That test creates a new run. To inspect the same artifacts you created manually in Section 1, use `readback-result-consumption.mjs` from the source package. Replace the first path with the actual location of your script:

```bash
node /absolute/path/to/readback-result-consumption.mjs \
  "$OPENETF_ROOT" "$OPENETF_ROOT/result-consumption.json"
```

The script reads over HTTP through the existing Reader and shuts the service down automatically. Its four checks cover the report hash, CSV hash, original table bytes, and shared calculation reference. If any check fails, the process exits with a nonzero status. It checks identity and engineering delivery; it does not evaluate all report semantics or call a model.

To inspect the reader page manually, start the persistent service with your run directory. Replace the placeholder with the `directory` value in `result-consumption.json`:

```bash
npm run serve -- --run <directory-from-result-consumption.json>
```

Open the local address displayed in the terminal. When you have finished, press Ctrl+C before continuing with the remaining commands in that terminal.

## 3. Use Suite to check actual historical records

Use Suite commit `89c272c22c19f79582fde01eb25859547b6ac3ff`:

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

These three commands read existing records; they do not re-execute the historical tests. `recorded-complete` means completion has been recorded. `current` means the summary agrees with its inputs. `rerun: false` preserves the fact that the tests were not rerun. Dates and versions in historical records still refer to that earlier point in time and cannot replace acceptance testing of today's product.

[Evidence format](https://github.com/hpoenixf/agent-engineering-suite/blob/89c272c22c19f79582fde01eb25859547b6ac3ff/skills/aes-spec-flow/toolkit/docs/evidence-format.md)

## 4. Adopt the skills in your own project

First inspect the installation plan using a temporary directory:

```bash
AES_PROJECT="$(mktemp -d)"
node "$AES_ROOT/scripts/install-skills.mjs" \
  --module all --target "$AES_PROJECT/.agents/skills"
```

After checking the plan, add `--apply` to write the files:

```bash
node "$AES_ROOT/scripts/install-skills.mjs" \
  --module all --target "$AES_PROJECT/.agents/skills" --apply
```

For actual use, set `AES_PROJECT` to your real project's absolute path, repeat the plan → apply installation, and open that project in a coding agent that supports `.agents/skills`. Installing into the temporary directory does not make other projects load the skills automatically. Avoid overlapping installation if a plugin with the same name is already present. Follow the [installation documentation](https://github.com/hpoenixf/agent-engineering-suite/blob/89c272c22c19f79582fde01eb25859547b6ac3ff/docs/installation.md) to select only the modules you need.

Give the agent that has loaded the skills a real requirement. Ask it to clarify the acceptance behavior and change boundaries first, then select counterexamples, implement the change, review it, and perform actual verification. Keep outputs, commands, and versions for the new task in your own records; do not rewrite the original example's history. Grilling, Spec, and two-axis review are working methods. The project adopting them still runs its own business tests.

## Optional regression checks

In Open ETF Agent, you can run the existing test selection related to the article's example:

```bash
cd "$OPENETF_ROOT"
node --test --test-concurrency=1 \
  test/result-consumption.test.mjs \
  test/result-consumption-delivery.test.mjs \
  test/result-consumption-cli.test.mjs \
  test/evaluate.test.mjs
```

These examples, installation paths, and reading methods were checked and actually run during the research for this article. This does not mean that every host, real model, or capability across the repository was validated again. The references for industry tools come from official documentation; the article does not claim that those projects have already been integrated into our repositories.
