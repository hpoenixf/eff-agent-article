# Subagent Panorama: Independent Context, Specialist Work and Real Handoffs

![Subagent panorama: independent exploration, one shared research task](../../visuals/en/panorama-subagents/cover.svg)

**A Subagent is useful when a local research task deserves independent work and Main can actually consume its results.** The goal is not to launch more models or route every Web, PDF and Python step through another specialist. It is to isolate lengthy exploration while returning the original evidence needed for a sound decision.

ETF Agent first gave Child its own context so Main would not inherit every PDF lookup or Python debugging turn. Development exposed the harder problem: **separating the process is easy; preserving evidence, identity and responsibility at handoff is not.** One Child completed a valid citation handoff, yet Main repeatedly polled and delegated again without delivering. Another completed local computation and HTML repairs, exported a downloadable report, and gave Main an artifact it could genuinely use.

This article follows a delegation end to end: decide whether to split the work, supply necessary inputs, let Child investigate, receive findings and gaps, then let Main synthesize and deliver. Tools, methods, permissions, budgets and recovery remain with their existing owners. Establish that chain before adding more specialists or bounded dialogue, so collaboration’s value has a concrete location.

## 1. Isolate Local Work, Not the Ability to Solve a Problem

Consider a simplified investment question. A user wants to understand how a potential ETF relates to their portfolio, verify the product documents, and calculate holdings overlap or historical behavior.

Main should retain the user goal, measurement conventions, established findings, and unresolved questions. A local calculation, however, may involve debugging fields, revising scripts, and rerunning several times. Reading a PDF may involve locating sections, examining tables, and checking footnotes.

Those steps matter locally but do not need to occupy every subsequent Main request.

After calculation, Main needs the **inputs, method, outcome, and limitations**—not every unsuccessful script. After reviewing clauses, it needs exact evidence and applicability conditions—not every document search.

We call this **context pollution**: local experimentation and global reasoning are mixed, so operational history that has served its purpose continues consuming future reasoning capacity.

This motivation resembles the independent-context Subagent approach in [Anthropic's context engineering article](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): local executors investigate deeply, return synthesized results, and Main coordinates the whole. We borrow the information architecture, **not another system's performance claims**.

Separate context should not imply crippled tools. A Web Child that finds a PDF may read it under existing permission; a PDF Child may check a relevant Web source without automatically handing the task back to Main.

**We separate working history, not the ability to do multi-step work.**

## 2. One Common Execution Substrate, Several Specializations

We did not implement separate Agent frameworks for Web, PDF, and Python.

Instead: **one common Child Runtime plus different Specialty Profiles**, with each delegation creating an independent executor.

Profiles supply methods and priorities. Host determines real tool and source access. Parent and Child share the root task's governance and resource constraints.

### Figure 1: shared mechanics, separate contexts

![Main, shared Child execution, methods, granted tools and result handoff](../../visuals/en/panorama-subagents/architecture.svg)
Each Child is an independent execution. It reuses common runtime mechanics, follows the selected method and works within the actually granted tools. Main and Child share the original task’s budget, authorization and lifecycle constraints while retaining their own working contexts.

Main retains a direct-tool path for simple work. Complex local problems can be delegated, returned as evidence and results, then integrated in the user-facing answer.

This resembles the **manager / agents-as-tools** responsibility model in the [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/multi_agent/): a manager invokes specialists but owns the user conversation and final reply. It is **not** a transfer of conversational control to another Agent.

"Capable" also does not mean every Child gets every tool, all data, or all control permissions. It means the Child can autonomously perform multiple steps **within its granted scope**.

[Claude Code's Subagents documentation](https://code.claude.com/docs/en/sub-agents) similarly distinguishes independent contexts, specialized instructions, and permissions, including read-only configurations. These are separate axes of design.

## 3. Web, PDF, Python, Reviewer—and Remind

Our profiles differ primarily in **working methodology**, not hard file-format silos.

| Direction | Primary emphasis | Example financial task |
| --- | --- | --- |
| **Web Explorer** | Source selection, recent disclosures, cross-source verification | Issuer announcements, fund disclosures, new information |
| **PDF Reader** | Sections, tables, footnotes, page numbers, coverage | Product terms, expense definitions, risk disclosures |
| **Python Analyst** | Data basis, computation, error correction, artifacts | Return/drawdown, portfolio overlap, supplementary tables |
| **Research Reviewer** | Gaps, contradictions, counterexamples, fragile assumptions | Check support for a conclusion and determine useful follow-ups |
| **Investment perspectives** | Challenge one set of facts with distinct investment methods | Allocation, tail-risk, diversification viewpoints |
| **Remind—not a Subagent** | Actual resource and execution facts | Budget, time, and review reminders |

Web/PDF/Python/Reviewer and the investment perspectives reuse Child execution. **Remind** is a Runtime-side reminder feature, not another Child Agent.

Neither a role profile nor investment methodology independently grants access to tools or data.

### Web and PDF differ in emphasis, not an enforced handoff at every file change

Web is primarily about **where to search and how sources compare**. PDF is primarily about **what a particular document actually says and which portions were read**.

A fee investigation may begin with an issuer Web page and end at a PDF footnote. It can still be one Child task. We do not require a needless handoff to Main followed by a new specialist invocation. Controlled tests have exercised authorized cross-format reading in both directions.

Specialization should improve method, not manufacture transfers.

### Python takes a computation task, not just one function call

A Python Child should understand the calculation goal, inspect inputs, correct ordinary code errors, and explain outputs and limitations.

Its instructions emphasize date alignment, units, missing values, and source provenance. **Code execution success is not the same as correct financial measurement**. If no real execution facility is available, it must disclose non-execution rather than fabricate a calculated result.

Multi-turn local debugging is exactly the process worth isolating. Main can invoke a stable, trivial calculation directly.

### Reviewer provides independent scrutiny, not final approval

Reviewer can inspect original evidence, look for meaningful counterexamples, and use permitted tools for focused checking. It is not limited to scoring Main's summary.

But its opinion cannot rewrite business facts, compel Main to accept the advice, or veto a correct final answer. Independent execution and advisory handoff have engineering evidence. Reviewer's role is to surface counterexamples and material for scrutiny while Main retains synthesis.

### Not every reminder deserves another model

Remaining budgets and time are already known through execution records. A separate model need not infer them.

**Remind** projects objective facts and timely guidance into existing model requests. **Reviewer** consumes separate model work to examine an analysis. A delivered reminder does not grant automatic Reviewer admission or a new research task.

In shorthand: **Remind draws Main's attention to execution facts; Reviewer checks judgments; Runtime determines which operations are lawful.**

## 4. A Financial Research Example: Collaboration by Dependencies

Consider a **teaching example**, not a completed live financial-research acceptance:

> I am considering adding an ETF. Compare its overlap with my portfolio, verify fees and main risks, and explain when adding it would or would not be appropriate.

Main identifies the original objective and evidence requirements. It can separate local questions: have the issuer's disclosures changed? What do the product documents say? How much overlap can be calculated from available portfolio data?

A delegation should be more precise than "research this ETF." For example:

> Verify recurring versus one-time fees for the specified share class, retaining effective dates and source evidence. Do not repeat the entire investment recommendation.

### Figure 2: coordinate by questions and dependencies, not a role pipeline

![Coordinate by dependencies, with direct delivery and optional review](../../visuals/en/panorama-subagents/dependencies.svg)
Disclosure checks and document reading can run independently. A calculation that requires aligned dates, units, or holdings waits until its needed inputs are defined. If the data is already usable, calculate directly; do not wait for unrelated Children.

Review in Figure 2 is optional, rather than a mandatory publication approval stage. Main may deliver sufficiently supported findings, resolve essential objections, or narrow claims where evidence is missing.

Main should integrate the findings around the user's **actual decision**, not concatenate three standalone reports about fees, overlap, and risk.

Final text should distinguish observed evidence, judgments dependent on goals/assumptions, and uncollected material. That is an output requirement for the teaching case, not a universal mandatory execution sequence.

## 5. Handoff Should Compress Process, Not Evidence

Returning a Child's entire tool and debugging history defeats isolation. Returning only "done" or a one-line conclusion removes the basis for Main to judge its use.

We treat handoff as a **usable work product**, not a success flag.

Existing mechanics carry a bounded summary, evidence and artifact references, known gaps, and partial findings where appropriate. Main can read important sources on demand rather than importing the Child's full history.

| Handoff field | Role in the financial example |
| --- | --- |
| **Findings summary** | Which subquestion was addressed and what was learned |
| **Evidence and measurement basis** | Sources, dates, units, and scope for independent checking |
| **Computed/report artifacts** | Actually produced results—not just "generated" claims |
| **Gaps and execution state** | Completed, partially usable, not executed, or unknown effects |

These describe responsibilities, not a mandatory form requiring fabricated file links when no file was generated.

### Figure 3: local failure neither erases valid results nor becomes success

![Local failure, bounded repair, explicit gaps and evidence readback](../../visuals/en/panorama-subagents/handoff.svg)
A failure enters bounded repair only when recovery is actually permitted and resources remain. Unrecoverable gaps are reported explicitly. Previously valid findings can still be handed off. Canceled work or unknown external effects must not be treated as a free replay.

A Main summary is **not proof that Main read every underlying source**. Key evidence can be retrieved when necessary; independent useful partial findings need not wait for the Child's entire task to finish.

**A historical-report handoff exposed the reverse problem.** In a scoped late-October 2026 run, Main's actual model request included the full explicitly selected Publication from an earlier Run, together with its source identity. But Child has a separate path for selecting and materializing inputs. Without actually selected, valid `inputRefs`, inherited provenance and grants do not copy the report into the Child request. “Main saw the full report,” “Child was authorized for a source category,” and “Child completed a local calculation” are not proof that **Child independently consumed the entire original report**.

This observation is limited to the historical-report path under review; it does not imply that ordinary, valid result-reference handoffs all lose their inputs. The exact selection, actual Child consumption, and post-forget content eligibility still need a joined acceptance check. That broader path is not yet qualified by this observation.

[LangChain Deep Agents](https://docs.langchain.com/oss/python/deepagents/subagents) also advocates returning condensed results rather than full raw tool output. In financial research, the other half is critical: **shorten the process history, not the definitions and caveats that determine whether a conclusion is valid**.

## 6. Three Handoff Boundaries: Input Identity, Local Work, and Actual Consumption

### Input and identity: the same material does not prove the same consumption

A Web Child once submitted tool-result references and answer citation markers in the same field. Rejecting the mixture was correct, but the old feedback suggested an empty array and led the model to remove legitimate references. We repaired **the feedback's explanation of the two reference types**, not the provenance validator. A later real-model sample returned valid citations, although the overall task still failed for unrelated reasons.

Concurrency causes a second identity trap: in `Main turn 1 → Child turn 1 → Main turn 2`, the final event is globally third but remains Main's second turn. Confusing these coordinates once rejected a legitimate input binding; the correction reused per-executor progress. **Independent context also needs independent execution and turn identities.**

A real PDF research run revealed a different failure: page images reached Main and Child, yet the model misread some colors and shapes, and cross-document analysis remained incomplete. That is **misinterpretation after delivery**, not proof of missing input. Successful image handoff cannot certify a financial conclusion.

### Local work: isolate a process without cloning the Runtime

A Python Child is valuable when input checking, local debugging, computation, and export form a work unit. Its workspace is bound to the executor; Main and sibling Children exchange authorized artifacts rather than guessing paths. In an October 16, 2026 real-model run on synthetic data, the Child fixed a field mismatch and an HTML template error, exported a report, and Main published its download entry. History read back the delivery. This supports **one complete local handoff path**, not faster-than-single-Agent performance or general financial correctness.

A managed PDF expert likewise reuses Child, Skill, `run_skill_script`, and Analysis Sandbox. Its helper was adapted to actual input forms `data.pdfTables` and `data.items[].pdfTables`. Zero geometry-extracted tables means **no countable tables were delivered by that extraction**, not that the original PDF contains none or visual verification succeeded. Script discovery grants no new execution authority; [user-defined experts](agent-custom-expert-from-prompt-to-recovery.md) remain text Profiles, not arbitrary executable ZIP uploads.

Reviewer examines omissions and counterexamples; Remind surfaces existing resource facts. **A reminder is not review; review is not approval.** Deduplication, one active review per Run, cooldown, and shadow mode constrain repeated work. Shadow advice is not automatically delivered to Main, but still consumes the original budget. These are scoped implementation facts, not measured multi-Agent benefit.

### Actual consumption: submission, model input, and adoption differ

A Child submitting a summary does not prove its crucial text reached Main's next model request. Readback of real research on October 30–31, 2026 used bounded fragment matching between specialist submissions and subsequent Main inputs. It established that **some text entered captured model input**, not full-summary delivery, semantic adoption, or better answers. [Evidence of Subagent Contribution](agent-subagent-contribution-evidence.md) contains the sample denominators, matching method, and caveats; they need not be duplicated in this panorama.

Recovery must preserve separate facts: a Child submitted, Main read, and a tool effect settled. Losing an in-memory parent-process marker does not justify a free retry of an unknown effect by another Child. Same-Run continuation uses the original grant, frozen method, and receipts; local failure does not erase independently publishable Main content.

**Subagents are justified when local work merits isolation and Main can actually consume the result under its original identity—not by the number of available roles.**

## 7. Methods Change; Execution Identity and Original Input Must Remain Readable

By October 24, 2026, ETF Agent main contained account settings, method revisions, and Run snapshot integration for user-defined Subagent Profiles. A Profile contributes role description and method guidance, not a new Child Runtime. Main may select an eligible Profile from the catalog; the original A07 Child consumes the identity, revision, and content hash frozen for that Run. Editing or disabling a Profile later must not retroactively rewrite instructions belonging to a previous Run. History access still obeys the current reader's account permissions.

Subsequent scoped engineering acceptance covers preferences, exact selection, discovery, observable contributions, saved presets, and Child-authored task revisions, including isolated PostgreSQL and authenticated-browser paths driven by a scripted model. That establishes the request and presentation mechanics, **not** natural model expert-selection quality, real investment benefit, or production deployment. Customizable roles still do not grant extra tools, model routes, data sources, budgets, or investment execution rights.

The adjacent [durable human-interaction mechanism](https://hpoenixf.com/eff-agent-article/en/articles/agent-durable-human-interaction-response-adoption) addresses a different handoff: did the original Child receive the user's actual reply in its own message, or only Main's summary? A Profile establishes **which version of a method a Child uses**; HIL shows **which consumer actually adopted a response**. Both reuse the existing Child identity and recovery mechanisms.

### Investment perspectives are still methods on the same Child

In October 2026, controlled implementation bound Markowitz, Taleb, and Bernstein as research-method configurations for the existing Child, not additional advisers with trading authority. Admission freezes method ID, version, and content hash; methods can share the same authorized material, while recovery cannot silently swap methods in an old execution. In an October 21 real-model run on a synthetic investment question, results from all three methods reached Main and a body was saved, but the model also made type-selection errors and repeated delegations. This supports method binding and handoff, **not greater accuracy than a single Main**.

### A Unified Role Entry Still Needs Evidence of Contribution

Fresh expert selection is gradually unified around versioned role identities, while historical executions retain their original methods and contracts. Reusing admission, execution and handoff does not establish superior multi-agent research. Actual dependencies still require original result identities, authorized inputs, and evidence that Main obtained and used the findings.

## 8. Consider Collaboration Value, Critical Path and Total Cost Together

The clearest demonstrated capability is that complex local work can maintain its own context, multi-step tools, and usable outputs. Main need not import every debugging step while retaining a way to verify important evidence.

Limited parallelism can help independent subquestions. It cannot remove real dependencies between document confirmation and subsequent calculation.

A suggested collaboration relationship is different from a result dependency that actually occurred. “Have another expert review the first expert's fee conclusion” can be natural-language task guidance, but the downstream Child needs a real upstream receipt and lawful `taskRef`/`inputRefs` handed over after Main actually waits or reads. As of October 27, 2026, `relationHint` is sealed in the original request and delivered to the Child. It remains **soft relationship guidance**: it does not schedule, automatically wait, or retrieve sibling materials. Real dependencies require original `taskRef`, authorized `inputRefs`, and observed receipts—not a model-authored relationship string.

Main's initial assignment may also turn out to be wrong. For example, it asks for exact portfolio overlap, but the PDF Child discovers that one fund disclosed only its top ten positions. The existing `submit_subagent_result` now accepts an optional Child-authored `update` for `task`, `hint`, `relationHint`, and authorized `inputRefs`. An accepted update changes subsequent Child requests, not the original user text, dispatched requests, Run grants, or already committed results. Source owners still authorize any newly selected material. This is **revisable research guidance with immutable execution history**, not proof that the model will reliably detect flawed assumptions. Account selection details are covered in [the custom expert article](agent-custom-expert-from-prompt-to-recovery.md).

An idealized relation is:

~~~text
Sequential time ≈ Work A + Work B
Parallel time   ≈ max(Work A, Work B) + delegation / waiting / synthesis overhead
~~~

This is a **trade-off model, not a measured ETF Agent speedup**.

Physical model/tool concurrency, retries, and dependencies change the outcome. Smaller Main context is also not necessarily smaller **system-wide token usage**: Child inputs/outputs, repeated background, handoff, and essential evidence readback all count.

[Anthropic's multi-agent research retrospective](https://www.anthropic.com/engineering/multi-agent-research-system) likewise notes the additional token costs and poor fit of some high-dependency/shared-context workloads. We borrow the applicability lesson, not their performance numbers.

We also have a real counterexample: a Child completed valid citation handoff, but Main repeatedly checked status, canceled, and re-delegated until the turn limit, without publishing. Provider stream interruption occurred too, so blaming the entire failure on orchestration alone would be unjustified. The example still shows that **local success does not imply overall delivery**.

Meaningful full-task measurements cover: Main-context reduction, total cost, whether returned results were consumed, and whether the user question was answered.

### Which Tasks Benefit from Parallel Work?

| Task shape | Useful starting point | Reason |
| --- | --- | --- |
| One known field or stable calculation | Main calls the tool directly | Preparation and handoff may outweigh context isolation |
| Extensive retrieval, local debugging or document checks | One autonomous Child | Lengthy process can return compact findings and evidence |
| Clearly scoped, independent subquestions | Bounded parallel Children | Work can overlap while sharing resources and one goal |
| Dense shared context and sequential dependencies | Main coordinates sequentially first | Separate histories duplicate background without removing dependencies |
| An existing conclusion lacks a counterexample or second method | Optional Reviewer or another perspective | Value comes from the question and method, not the role count |

This is a starting point; the model can revise the split as evidence arrives. A PDF assignment may need Web verification. A calculation may discover an invalid basis. Returning that limitation can be more useful than calculating an exact but meaningless value.

## 9. Start with One Child That Can Complete the Handoff

A practical starting point is one long-running local task with verifiable deliverables, not four named specialist roles at once.

**Start with one general Child.** Give it independent context, execution identity, a multi-step tool loop, handoff, cancellation, and Recovery where supported.

**Then add method Profiles.** Separate *when delegation is useful*, *what method the Child should follow*, and *which tools are actually authorized*. These do not need to be encoded in one role name.

**Make the handoff real.** Test more than "Child returned text." Can Main read the evidence, consume the calculation, and retrieve the actual artifact? Can legal partial findings and unknown effects be represented?

**Reuse existing governance.** Parent and Children use original budgets, finalization, authorization, and Recovery—not newly minted resource pools for each role. Test contention for shared budgets, Child work still running when Main settles, and crashes between result commit and consumption.

A complete capability set does not mean every problem merits delegation. Straightforward lookup, one stable tool call, and tasks highly dependent on the whole conversation can be better handled directly by Main.

**Choose Subagents because a task benefits from autonomous local work and isolated context—not because the system happens to support many roles.**

<!-- open-etf-case:child@e1b8e4edde724548fab16d8ca4b205379bfa7f30 -->
### Check the handoff with one read-only Child

To inspect how local work returns to Main, run one scripted Child through the [CLI at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e1b8e4edde724548fab16d8ca4b205379bfa7f30/src/cli.mjs).

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node src/cli.mjs --case fixture-child --output runs/article-child
```

Inspect `rootUsage` in the terminal JSON, then open `report.md` and `manifest.json` in the returned `directory`. Main reads back and cites the original pages acquired by Child; the derived Child conclusion does not become a new source.

This is one read-only Child sharing the root budget. It makes no independent live-model call and does not cover multi-layer experts, PDF, or Python collaboration.
<!-- /open-etf-case -->

### A source-checking specialist does not inherit Main's publication authority

The `fixture-child` example above remains a historical slice. Public v0.15 adds serial `source_check`: Child reads the restricted Atlas A/B pages in its own context and returns original material alongside derived observations; Main then composes the report. This is not a public implementation of every expert role or parallel orchestration described in this essay.

The composition exposed a seam: when Main enabled Publication, copying its complete bindings into a read-only Child conflicted with Child's own publication configuration. **v0.15.1 narrows capability instead of removing identity checks.** [specialist-child.mjs](https://github.com/hpoenixf/open-etf-agent/blob/8ba24a15cb1ce6ad3a0ebd48141be0549bfda35a/src/specialist-child.mjs) removes only the exact Main-only Publication binding and preserves every other binding. Handoff readback verifies that same restricted identity. Child still cannot publish; Main can publish its own prose through the original path. The [composition regression](https://github.com/hpoenixf/open-etf-agent/blob/8ba24a15cb1ce6ad3a0ebd48141be0549bfda35a/test/specialist-publication.test.mjs) checks handoff, Main publication, and terminal readback without redispatch.

To inspect source handoff, install the [current fixed public version](https://github.com/hpoenixf/open-etf-agent/blob/34124cefc6df289e08518173789210b45a716451/src/specialist-cli.mjs) according to its README, then use a fresh Session directory:

```bash
node src/specialist-cli.mjs run --session runs/article-source-check
node src/specialist-cli.mjs read --session runs/article-source-check --run RUN_ID
```

Replace `RUN_ID` with the actual `runId` returned by the first command, then compare `child.summary`, `sources`, and `report.text`. This default example is an offline script that saves and reads a report; **it does not enable Main Publication**. For that composition, see the regression above and the [version's independent real-model verification](https://github.com/hpoenixf/open-etf-agent/blob/8ba24a15cb1ce6ad3a0ebd48141be0549bfda35a/docs/verification/v0151-runtime-repair.md). Those model tasks still use synthetic material, not evidence of financial-expert effectiveness. The old `fixture-child` coverage marker retains its original qualification; a new source link is not a new coverage run. For ongoing use, start from [current main](https://github.com/hpoenixf/open-etf-agent).

## 10. Local Autonomy Should Serve Overall Delivery

**Delegation is worthwhile when an independently executable piece of work can return useful, inspectable results to the original user task.** A role label alone proves nothing.

Before creating another specialist, ask:

1. **Does the task benefit from isolation?** A simple lookup, a single calculation or work tightly coupled to Main's complete context may be better handled directly.
2. **What will it hand back?** Not merely “done,” but readable source evidence, measurement definitions, genuine calculation or file artifacts, and stated gaps. Main must actually consume them.
3. **Is the extra cost justified?** Child model calls, waiting, repeated reading, and synthesis all count. Local execution success does not prove end-to-end completion or improved investment research.

ETF Agent's design lesson is: **separate local work without losing critical facts; vary the method without diffusing responsibility for delivery.** That matters more than keeping additional Agents busy.

---

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion

[Panorama Series](/en/panorama) · [Chinese edition](/articles/agent-subagent-context-specialization).

[Read the Chinese original on the author's blog](https://hpoenixf.com/blog/agent-subagent-context-specialization) · [Public engineering-article collection](https://github.com/hpoenixf/eff-agent-article) (Stars welcome).
<!-- agent-article-sync:guidance:end -->
