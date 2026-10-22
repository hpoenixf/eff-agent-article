---
title: "From Traces to Trustworthy Observability: Evolving Our Agent Diagnostics"
description: "Langfuse integration, missing payload evidence, physical-attempt accounting, storage recovery and diagnostics of telemetry itself."
---

# From a Trace to Trustworthy Observability: How Our Agent Monitoring Evolved

Our initial reason for adding Langfuse was straightforward: an investment research agent may make a dozen model requests and call several tool types, then leave only a final “research interrupted” status. We needed somewhere to inspect the chain rather than guess from scattered logs.

We deployed a separate Langfuse instance and connected model and tool calls. When the first synthetic Trace appeared in the console, the job seemed complete.

Real long-running debugging exposed the gap: **showing a Trace is not the same as reliably explaining a research run**. Payloads can be discarded by application capture limits, fail during asynchronous export, balloon in storage, or become unreadable after a backup is restored.

The requirement evolved from “see calls” into “know which facts were retained, where coverage was lost, and whether they can be recovered.”

## 1. Reuse a Mature Platform, Then State What It Does Not Own

Initially we did not build our own Trace search, model-call detail and diagnosis UI inside the investment chat application. We deployed Langfuse's separate Web, Worker and storage stack. It uses a distinct entry point and does not share the investment business database.

That choice has operational costs. The first deployment collided with a PostgreSQL port on the Host; the fix was to keep internal database ports within the Compose network. Later, we sent synthetic telemetry through the actual SDK and confirmed it was visible in the UI.

This proved the console and basic transport path worked. It did **not** prove that every real model input was captured in full or that a user had received the final answer.

We deliberately assigned responsibility early: **the agent's durable Run records** own execution, budgets, tool effects and answer-commit facts. **Langfuse** offers diagnostic views across requests and tools.

They can be reconciled, but a missing observation does not imply execution never happened, just as the existence of a Trace does not imply delivery succeeded.

## 2. Long Research Needs More Than Call Logs

Initial model/tool events were easy to read in small tasks. Multi-turn research demanded more precise questions: Did a tool's output enter the next model request? Did a generated text segment pass Publication? Where did a later representation differ from the upstream result?

We extended observation from individual functions into an **identity-linked execution chain**. Model turns, physical tool dispatches, Host result projections, subsequent model requests and publication effects in the same Run must be correlatable by their original identities.

Matching by log text is unsafe. Tools with the same name may execute repeatedly, and asynchronous events can share nearby timestamps. Each needs request and receipt identities.

Langfuse still contains an observational projection, not a substitute for the business receipt that determines whether an effect committed.

That allows us to investigate “the agent fetched the sources but never answered” at a more specific seam. But deeper tracing immediately confronts a new issue: agent inputs and outputs can be very large.

## 3. The Turning Point: Missing Payloads Must Leave Evidence of Their Absence

To control storage and exposure of sensitive information, we cap captured model body bytes. That is sensible for research requests containing large web, PDF or tool results.

An October 2026 review exposed a subtle limit: a **256 KiB capture boundary** retained exactly **262,144 bytes**, while one additional byte caused the body to be rejected. For oversized inputs or outputs, a read could return just null. If both sides were missing, assembled model-turn lists could even drop the entire turn while their pagination still appeared complete.

Raising the cap alone postpones the same problem and increases retention and privacy costs.

Instead, we **kept bounded payload capture while retaining bounded metadata about missing captures**. When the application knows a body was rejected for size, it records the exact invocation identity, input/output side, known reason and limited metadata. The reader then reconstructs a visible missing-body event rather than silently deleting the whole call.

We also fixed a small but important distinction: a legitimate JSON null value is **not** the same fact as a field that was never recorded.

The benefit was not a measured improvement in long-term capture rates; no such comparison was available. The benefit was that a known size limit no longer made the observation *look complete*. Older records that never stored a missing-data receipt remain unknown. The new implementation cannot retroactively invent why their bodies were absent.

### Usage and Cost: Trace Rows Are Not Physical Model Calls

We later found a second accounting trap. One physical model Attempt might appear in Gateway SDK usage, an aggregate Run summary and a Trace re-exported after failure. Summing all displayed rows could count one real call multiple times.

On October 21, 2026, we anchored accounting to **the original Gateway physical Attempt and original reservation/debit receipt**. Main, Child and retries retain distinct physical identities. Runtime-wide summaries describe the research process; they are not additional billable Generations. Replays retain stable identities and do not create new consumption.

Gaps still matter. An SDK that explicitly returns zero supports recording **zero**. An SDK that does not report tokens creates an **unknown** usage value. If duplicate observations for the same Attempt disagree on cost, withdraw certainty instead of keeping the last value and adding it to totals. Costs calculated from configured model prices remain **estimates**, not provider invoices.

[Langfuse's Token and Cost Tracking documentation](https://langfuse.com/docs/observability/features/token-and-cost-tracking) distinguishes imported usage/cost from pricing-based estimates. We add an application-side prerequisite: determine which Generations actually correspond to physical requests and how complete their measurements are before aggregating across Runs.

A controlled Factory → Gateway → synthetic HTTP → OTEL Exporter → Langfuse readback path checked original Attempt identities and usage projection in both successful and failed research. It also checked that disabled sampling or failed export did not change the number of real model dispatches.

That supports bounded **non-interference and accounting behavior**, not confirmation of actual provider invoices or long-term production spending.

### Time Measurements Need Their Own Clock Domains

The same work separated **“this process observed a new commit”** from **“when was this content originally persisted?”** Only an original publication receipt explicitly identifying a new commit may produce a commit-observed timestamp. Recovery replay, missing fields or observing old content cannot reissue an original commit time.

Elapsed times are comparable within one monotonic clock domain. Two monotonic timestamps from processes separated by a restart cannot simply be subtracted.

A server-observed commit is also not the browser's first-render time. These distinctions remove attractive but unjustified numbers from performance charts.

## 4. A Diagnostic Page Becomes a Data System That Needs Governance

Once Langfuse carried real research diagnostics, its operations needed attention.

The first recurring problem was environment configuration. Our app launcher loaded business variables before starting Langfuse. Two configuration files looked correct, yet Compose inherited a parent DATABASE_URL and pointed the independent observability stack at the wrong target.

Fixing one value would not remove the class of collision. We moved isolation to **the child-process creation seam**: inspect the interpolation keys actually declared by Compose, copy the parent environment while removing values that could override the telemetry stack's own configuration, and apply that rule consistently to start, restart and status commands.

A later ClickHouse storage incident revealed another ambiguity: how much disk space did observability actually use?

At that time, the Docker backing file had allocated approximately **164 GiB** and the stack repeatedly encountered system-log and filesystem errors. Estimating backup needs from the whole virtual disk would have imposed a huge precondition. Table-level inspection revealed about **117 GiB** in ClickHouse system.trace_log and **9.7 GiB** in system.text_log, compared with roughly **286 MiB** of business table data parts requiring retention.

These figures represent different accounting levels and should not be directly added. They do show that diagnostic system logs and Langfuse's business Traces are different stores.

Langfuse's [self-hosted ClickHouse guidance](https://langfuse.com/faq/all/reduce-clickhouse-disk-size) also notes that built-in ClickHouse log tables may dominate storage.

We did not delete the entire observability volume. We first verified existing stopped-system snapshots and metadata, then handled older internal system logs within authorized scope, adjusted finite retention and output rotation, and preserved business records needed for recovery.

This work did not establish the full root cause of the underlying filesystem failure or create a permanent hard storage ceiling.

It changed our operational understanding: **an observability platform must itself be governed like a serious data system, including configuration, retention boundaries and recoverability**.

## 5. A Backup Is Not Enough: Can Historical Records Be Read After Restoration?

After the incident we restored an offline snapshot into an isolated environment. The archive listed files, but when ClickHouse first started on a fresh volume, it recognized **zero** business tables.

This did not mean the original research never happened. Archive processing had dereferenced symlinks in an Atomic database metadata structure, so the recovered copy no longer preserved the expected database UUID relationships.

[ClickHouse's Atomic engine documentation](https://clickhouse.com/docs/reference/engines/database-engines/atomic) describes the binding between table UUIDs and storage directories. Files existing on disk are not sufficient proof that metadata can find them.

We repaired the relevant metadata links only in an **isolated disposable copy**, not on the original business volume. Fourteen business tables were then recognized.

“Tables restored” was not the end of acceptance. We selected an actual research run predating the snapshot, read it through the original query interfaces, and compared the original instance with the recovered copy. **Thirteen groups of event summaries**, along with model input, turn, publication and invocation diagnostics, matched.

A different run occurring after the snapshot time was outside the recovery guarantee.

We then independently checked the **new ingestion path**: using the real SDK, Worker and ClickHouse, write and read back one synthetic event, without paid model calls or modification of original research records.

These checks establish two bounded facts: **old captured history was queryable in selected recovered samples, and the isolated ingestion path still handled new telemetry**. Neither can create model bodies that had never been captured.

## 6. The Observability Pipeline Can Fail, So It Needs Minimal Self-Diagnosis

After restoring history, another classic symptom appeared: the agent had definitely invoked a model, yet Langfuse queries contained no matching observation. Capture was enabled and the UI was accessible; those facts did not prove that the SDK's asynchronous sender had delivered anything.

Tracing actual HTTP requests revealed a URL serialization issue. An added trailing slash in the base URL combined with the SDK endpoint to form a **double-slash path**, triggering a redirect. The failure occurred inside the asynchronous batch exporter, beyond alerting focused only on synchronous exceptions.

We did not build a giant monitoring system for Langfuse. We added bounded, desensitized outcome records at the **actual export seam**: batch status, precise correlation identity and permitted HTTP status details.

A zero-paid-model synthetic probe passed through the real collector and was read back by exact observation identity.

This confirmed the reachability of the **new probe**; it could not backfill the earlier missing Trace. That distinction makes observability failure diagnosable without rewriting the agent's real execution record.

Langfuse ingestion itself includes SDK, API, object storage, queue, Worker and ClickHouse stages. Its [architecture documentation](https://langfuse.com/handbook/product-engineering/architecture) explains why an SDK call returning does not imply the new event is queryable already.

~~~mermaid
flowchart TD
  A["Agent events"] --> C["Capture adapter"]
  C --> B["Batch exporter"]
  B --> I["Ingestion API"]
  I --> S["Event storage"]
  I --> Q["Ingestion queue"]
  S --> W["Worker"]
  Q --> W
  W --> H["ClickHouse"]
  H --> R["Trace readback"]
~~~

This is a simplified telemetry flow. The agent's own Run, tool effect and publication receipts remain in the application's original persistence system even when the observability platform loses data.

## 7. When Is a Trace Worth Trusting?

Langfuse did not become the single owner of all execution facts. Its purpose and limits became clearer.

| Evolving requirement | Capability added | Essential boundary |
| --- | --- | --- |
| See model and tool calls | Separate platform and basic Traces | UI visibility is not research completion |
| Reconstruct a research run | Link Run, model turns, tool calls, projections and publication by identity | Observational views do not replace original execution receipts |
| Understand missing records | Payload caps, missing metadata and readback projections | Uncaptured is not null or zero calls |
| Operate the telemetry stack over time | Config isolation, system-log retention and scoped backups | TTL and service health are not sufficient recovery guarantees |
| Diagnose after storage failure | Isolated restore, historical comparison and new ingestion test | Recover retained records, not bodies that were lost |
| Detect telemetry pipeline failures | Asynchronous export outcomes and synthetic readback probe | Empty query is not proof the agent did not run |
| Interpret usage, cost and latency | Physical Attempts, stable receipts, estimated/unknown costs and original clock domains | Summaries, replay and observation time cannot impersonate extra calls, invoices or first render |

These mechanisms solved concrete, bounded problems: inherited config was isolated; oversized payloads no longer silently erased known calls; an isolated snapshot recovered checkable history; asynchronous export failure was reproduced and a new probe verified. They occurred in specific environments and date windows. They are **not** proof of long-term uptime, lossless historical capture or provider billing accuracy.

The lasting lesson is a diagnostic discipline:

**When an observability query is empty, first establish what was captured, where it might have been lost and whether it can be independently read using original identities. Only then conclude something about the agent.**

The point of tracing is not simply to draw attractive call graphs. It is to distinguish actual events from missing observations even after complex research fails.

---

## Further Reading and Discussion

[Read on the personal blog](https://hpoenixf.com/blog/025-agent-langfuse-from-trace-to-trustworthy-observability) · [ETF Agent Engineering Library](https://github.com/hpoenixf/eff-agent-article) (stars welcome).
