# Why We Added Subagents to an Investment Research Agent: From Context Isolation to Specialized Collaboration

When we first introduced Subagents into ETF Agent, our goal was modest: **keep local exploration from polluting Main's context, and perhaps improve efficiency**.

We did not want a rigid pipeline of investment "experts," nor did we assume more model calls would automatically improve answers.

Our analogy was several capable engineers with different strengths: one excellent at source discovery, another at complex documents, another at computation and debugging. Each can still understand problems, select tools, and handle tasks end to end. Work should not be endlessly transferred just because a file's format changes.

Implementation exposed the difficult part. Starting an independent model loop is manageable. **Separating local processes without losing important facts—and adding executors without diffusing overall responsibility—is much harder.**

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

~~~mermaid
graph TD
UserGoal --> MainAgent
MainAgent --> DirectTools
MainAgent --> ChildExecution
CommonRuntime --> ChildExecution
SpecialtyProfile --> ChildExecution
GrantedTools --> ChildExecution
RootGovernance --> MainAgent
RootGovernance --> ChildExecution
ChildExecution --> ResultHandoff
DirectTools --> MainSynthesis
ResultHandoff --> MainSynthesis
MainSynthesis --> UserAnswer
~~~

**ChildExecution** is one independently created execution, not a common transcript for all Children. **CommonRuntime** is the reusable process mechanism; **SpecialtyProfile** is a method; **GrantedTools** is the actual approved capability set; **RootGovernance** supplies shared budget, authorization, and lifecycle constraints.

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

But its opinion cannot rewrite business facts, compel Main to accept the advice, or veto a correct final answer. We have engineering evidence for independent execution and advisory handoff; **the net effect of automatic review on real research quality remains to be established**.

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

~~~mermaid
graph TD
UserQuestion --> MainPlan
MainPlan --> CheckDisclosures
MainPlan --> ReadFundDocuments
MainPlan --> SelectPortfolioData
ReadFundDocuments --> AlignDataBasis
SelectPortfolioData --> AlignDataBasis
AlignDataBasis --> ComputeComparison
CheckDisclosures --> MainSynthesis
ReadFundDocuments --> MainSynthesis
ComputeComparison --> MainSynthesis
MainSynthesis --> PublishSupportedAnswer
MainSynthesis --> OptionalReview
OptionalReview --> MainReassessment
MainReassessment --> PublishSupportedAnswer
MainReassessment --> TargetedFollowUp
TargetedFollowUp --> MainSynthesis
~~~

Disclosure checks and document reading can run independently. A calculation that requires aligned dates, units, or holdings waits until its needed inputs are defined. If the data is already usable, calculate directly; do not wait for unrelated Children.

**OptionalReview** is not a mandatory Publication approval stage. Main may deliver sufficiently supported findings, resolve essential objections, or narrow claims where evidence is missing.

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

~~~mermaid
graph TD
ChildWork --> SupportedFindings
ChildWork --> LocalFailure
LocalFailure --> BoundedRepair
BoundedRepair --> ChildWork
LocalFailure --> ExplicitGaps
SupportedFindings --> Handoff
ExplicitGaps --> Handoff
Handoff --> MainSynthesis
MainSynthesis --> ReadEvidence
ReadEvidence --> MainSynthesis
MainSynthesis --> PublishAnswer
~~~

A failure follows **BoundedRepair** only when recovery is actually permitted and resources remain. Unrecoverable gaps are reported explicitly. Previously valid findings can still be handed off. Canceled work or unknown external effects must not be treated as a free replay.

A Main summary is **not proof that Main read every underlying source**. Key evidence can be retrieved when necessary; independent useful partial findings need not wait for the Child's entire task to finish.

[LangChain Deep Agents](https://docs.langchain.com/oss/python/deepagents/subagents) also advocates returning condensed results rather than full raw tool output. In financial research, the other half is critical: **shorten the process history, not the definitions and caveats that determine whether a conclusion is valid**.

## 6. Five Engineering Cases That Changed the Design

### Case 1: Web—an authentic reference can still be put in the wrong field

A Web Child once submitted a tool-result reference and an answer citation marker in the same evidence field. These serve different purposes; Host was right to reject the mixed submission.

But the old rejection feedback overemphasized submitting an empty array. The model responded by deleting even the legitimate references.

We fixed the **feedback**, not the validator: explain the distinct reference types and how to keep valid evidence while repairing the handoff.

A later real-model sample did complete formal handoff with accepted citations. The overall task still failed for other reasons. This demonstrates a repaired local step, **not** universal Web-research success.

**Feedback should help an executor repair a handoff, not teach it to discard useful evidence.**

### Case 2: PDF—the image arrived, but interpretation was still wrong

In one real PDF study, page images entered both Main and Child model requests and the task settled. Yet some interpretations of chart colors and shapes were wrong, and requested cross-document coverage was incomplete.

These are different failures:

- If the image never arrived, the issue is evidence delivery/context.
- If the image arrived but was misread, the issue is understanding and verification.

A tool returning successfully cannot establish that every required risk statement was correctly interpreted.

### Case 3: Python—isolate files as well as model context

We bound Python workspaces to individual executor identities. A Child can debug and reuse its own files. Main and sibling Children exchange explicit approved results rather than guessing one another's paths.

Engineering checks cover valid own-artifact access, cross-executor denial, and cleanup.

On **October 16, 2026**, a real-model test with synthetic data completed a useful local sequence: a Child repaired a field-mismatch calculation error, corrected an HTML template error, and exported a report. Main consumed the handoff, published a download link, and History readback retained the delivery record.

The value is not "the model fixed two bugs." It is that **local computation, debugging, and export became one work unit** without Main managing each step.

This establishes that specific path, not faster-than-single-Agent performance or perfect financial metric definitions.

### Case 4: concurrency—global turn three can be Main turn two

With Child work interleaved, the order might be:

~~~text
Main turn 1
Child turn 1
Main turn 2
~~~

The last event is globally third, but still Main's **second** turn. We once confused those coordinates and rejected an otherwise legitimate Child-input binding.

The repair used per-executor progress already present, retaining original identity checks. Interleaving regressions validated the fix.

**Independent executors need independent progress coordinates. Separating message arrays while sharing an implicit "current turn" is not sufficient.**

### Case 5: Reviewer and Remind—do not spend resources just to appear convergent

This is mainly a design risk, **not** evidence Reviewer caused a specific failure.

Independent review costs resources. It must not trigger another model merely because time passed or a warning appeared.

Reviewer has deduplication, one active review per Run, cooldown, and off/shadow/advisory modes. **Shadow** does not deliver automatic advice to Main but still consumes the original budget; it is not free observation.

Remind records distinct reminder facts and actual delivery. An undelivered reminder cannot count as already shown. Different resource facts can coexist, but identical warnings should not repeatedly interrupt work.

These features have scoped implementation evidence; overall migration and net effects require independent validation.

**A reminder is not review; review is not approval; neither replaces original budget or finalization governance.**

### Investment perspectives: reuse Child, not three new expert Runtimes

In October 2026 we added three fixed investing methods to Child Profiles: **Markowitz**, **Taleb**, and **Bernstein**.

These refer to publicly known analytical schools, not consultations with the people themselves and not three digitally licensed advisers able to approve transactions.

For the same authorized portfolio facts, allocation methodology might ask about correlation and weights; a tail-risk perspective about extreme scenarios; a diversification perspective about the loss tolerance of long-term holding.

The architectural value is **three methods challenging the same factual input through one execution mechanism**, not building three independent tool/budget/memory/Recovery stacks.

We did not introduce an expert-specific Runtime. The original Child admission freezes the trusted **method ID, version, and content hash** into execution identity. Redispatch and cold Recovery use that same binding; they do not silently swap methodologies within one Child.

A method does not grant extra tools or sources. Missing evidence does not block valid additional research. The ordinary Child path remains available when no expert method is selected. Reviewer remains a separate scrutiny role, not a disguised investing perspective.

Engineering evidence showed two differently bound Children sharing one original result reference without forcing Main to fetch duplicate datasets. The frozen method material remained consistent through actual Child requests after Recovery.

In an **October 21** real-model run with a synthetic investment question, all three methods produced handoffs consumed by Main, and the final body was persisted.

The model still made type-selection mistakes and repeated delegations. Local rejection and cancellation did not erase independent valid content.

The supported conclusion is that **method binding and result handoff can reuse the original Subagent framework**. We cannot yet claim three perspectives improve investment accuracy, advice quality, inference cost, or latency. Those require controlled same-question comparisons of facts, counterexamples, and answer quality—not a count of launched experts.

## 7. Benefits and Why "More Agents = Faster" Is Not a Claim

The clearest demonstrated capability is that complex local work can maintain its own context, multi-step tools, and usable outputs. Main need not import every debugging step while retaining a way to verify important evidence.

Limited parallelism can help independent subquestions. It cannot remove real dependencies between document confirmation and subsequent calculation.

An idealized relation is:

~~~text
Sequential time ≈ Work A + Work B
Parallel time   ≈ max(Work A, Work B) + delegation / waiting / synthesis overhead
~~~

This is a **trade-off model, not a measured ETF Agent speedup**.

Physical model/tool concurrency, retries, and dependencies change the outcome. Smaller Main context is also not necessarily smaller **system-wide token usage**: Child inputs/outputs, repeated background, handoff, and essential evidence readback all count.

[Anthropic's multi-agent research retrospective](https://www.anthropic.com/engineering/multi-agent-research-system) likewise notes the additional token costs and poor fit of some high-dependency/shared-context workloads. We borrow the applicability lesson, not their performance numbers.

We also have a real counterexample: a Child completed valid citation handoff, but Main repeatedly checked status, canceled, and re-delegated until the turn limit, without publishing. Provider stream interruption occurred too, so blaming the entire failure on orchestration alone would be unjustified. The example still shows that **local success does not imply overall delivery**.

We do not claim unmeasured speed, savings, or answer-quality percentages. Meaningful measurements cover the full task: Main-context reduction, total cost, whether returned results were consumed, and whether the user question was answered.

## 8. How to Apply the Design

A practical starting point is one long-running local task with verifiable deliverables, not four named specialist roles at once.

**Start with one general Child.** Give it independent context, execution identity, a multi-step tool loop, handoff, cancellation, and Recovery where supported.

**Then add method Profiles.** Separate *when delegation is useful*, *what method the Child should follow*, and *which tools are actually authorized*. These do not need to be encoded in one role name.

**Make the handoff real.** Test more than "Child returned text." Can Main read the evidence, consume the calculation, and retrieve the actual artifact? Can legal partial findings and unknown effects be represented?

**Reuse existing governance.** Parent and Children use original budgets, finalization, authorization, and Recovery—not newly minted resource pools for each role. Test contention for shared budgets, Child work still running when Main settles, and crashes between result commit and consumption.

A complete capability set does not mean every problem merits delegation. Straightforward lookup, one stable tool call, and tasks highly dependent on the whole conversation can be better handled directly by Main.

**Choose Subagents because a task benefits from autonomous local work and isolated context—not because the system happens to support many roles.**

## Conclusion

Our first objective was to reduce local context in Main and perhaps improve efficiency.

What emerged was not a rigid expert pipeline. It was **shared execution capability, distinct methods, independent local work, and unified responsibility for user-facing delivery**.

Web, PDF, Python, and Reviewer help because each can investigate a question in depth under the same constraints, not because each is artificially restricted to one tool type. Remind and Runtime governance keep those tasks anchored to actual resources and effects.

A useful Subagent design must do two things at once:

**Allow local work to complete independently, and bring its important evidence and results back to the main research narrative.**

The goal is not to keep more Agents busy. It is to help Main remain focused on the user's question and convert local exploration into a result the user can actually receive, understand, and use.

---

<!-- agent-article-sync:guidance:start -->
## Further Reading and Discussion

[Read the Chinese original on the author's blog](https://hpoenixf.com/blog/agent-subagent-context-specialization) · [Public engineering-article collection](https://github.com/hpoenixf/eff-agent-article) (Stars welcome).
<!-- agent-article-sync:guidance:end -->
