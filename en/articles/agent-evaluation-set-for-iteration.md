---
title: "Building Agent Evaluation Sets Across Development and Acceptance"
description: "How do evaluation sets connect requirements, development, real-task acceptance, and operational feedback? External practices and ETF Agent's current 83 questions explain case selection, engineering closure, and research-quality evidence."
readingBrief:
  takeaways:
    - "Evaluation tasks define success during requirements work, support diagnosis during development, provide acceptance evidence, and grow through operational feedback."
    - "The current catalog has 83 unique questions, with 14 core and 69 extended cases, five task families, and multidimensional tags for different evaluation scopes."
    - "Self-contained synthetic material, designated financial documents, and public retrieval expose different problems, and their conditions determine what a result can establish."
    - "Engineering regression, real execution, answer quality, and formal closure support distinct conclusions tied to the predeclared acceptance scope."
    - "The nine current detailed criteria records serve development, while independent acceptance needs exposure, grading coverage, unknowns, and source authorization made explicit."
  appliesTo:
    - "Developers connecting Agent requirements, implementation verification, and task acceptance while maintaining different kinds of evaluation material."
  notFor:
    - "Public model rankings or an installation guide for the complete private evaluation environment."
---
<script setup>
import { withBase } from 'vitepress'
</script>

# Building Agent Evaluation Sets Across Development and Acceptance

A team building a fund assistant may already have unit tests, API checks, and several successful demonstrations. It still needs to answer a further question. Under which conditions has an actual user task been completed successfully?

Reading documents from three years leaves open whether an amendment's scope was interpreted correctly. A successful API response leaves open whether a report was delivered and can be read back. Correct arithmetic on supplied numbers leaves open how the system performs research with real sources. Each question calls for different evidence.

Choosing a few cases only after implementation can leave developers, reviewers, and users with different definitions of completion. An aggregate score does little to reconcile those definitions.

**The evaluation set begins its work during requirements definition. It connects user tasks and success conditions with subsequent verification, giving the development process a shared question around which to accumulate evidence.**

ETF Agent currently has a shared catalog of 83 questions, alongside mechanism checks and grader-control material. Understanding their role starts with the development and acceptance process, then returns to core cases, specialist tasks, tags, and grading.

## 1. Place evaluation tasks throughout development and acceptance

Before building a capability, make the commitment concrete in a task. Existing case RQ-08 asks the assistant to compare official documents from three years and explain what an ETF creation/redemption basket amendment actually changed. The following is a teaching walkthrough of that existing task across the development process.

Requirements work needs to establish whether the relevant clauses can be located, how a newer document relates to the original clauses, and what remains answerable if evidence is missing. Preparing the task and its evaluation basis early exposes disagreements hidden inside a broad requirement such as supporting document research.

During development, attention shifts to implementation. Controlled inputs support fast checks of evidence transfer, read-only restrictions, and existing behavior. Actual assembly or persistence requires the corresponding verification when affected. Where a change concerns model behavior, a small selection of real tasks can be useful during development too. Controlled regression supports repeated diagnosis. Real research observes questions it leaves open, with the combination chosen for the affected behavior.

Task acceptance then runs selected tasks through the current system and examines actual model inputs, tool behavior, delivered results, and answer quality. Establish the questions, sources, and expectations before reading the results. Engineering success at a case's execution seam remains distinct from performance on the actual task.

At delivery, the conclusion needs to match the commitment. A repair to evidence transfer can be accepted through its relevant engineering behavior. A promised research capability requires the corresponding real-task and quality evidence. Formal closure, deployment, and user outcomes also need their own facts.

During operation, new feedback reveals expressions, sources, and task combinations absent from the catalog. Review those records and add useful, authorized cases so the next verification round covers actual problems.

<a :href="withBase('/diagrams/agent-evaluation-set/workflow-en.svg')" aria-label="Evaluation tasks connect requirements, development, task acceptance, delivery, and operational feedback"><picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/agent-evaluation-set/workflow-en-mobile.svg')" /><img :src="withBase('/diagrams/agent-evaluation-set/workflow-en.svg')" alt="Evaluation tasks connect requirements, development, task acceptance, delivery, and operational feedback" loading="lazy" /></picture></a>

*Figure 1. The task persists across stages. Verification selection and acceptance scope follow the commitment, while reviewed operational cases feed back into the catalog.*

LangSmith also connects evaluation on prepared examples with evaluation on production interactions. The former supports development comparisons and regression, while the latter reveals omissions in actual use. Its term offline evaluation can include real model calls. Prepared examples and external-model execution describe different conditions. [LangSmith evaluation lifecycle](https://docs.langchain.com/langsmith/evaluation-concepts)

A task can be reused across these stages while the meaning of its evidence changes. RQ-08 can clarify requirements, exercise document wiring, or support actual research evaluation. The report needs to identify which layer was completed in the current round.

## 2. Derive success criteria from concrete disagreements

It is tempting to start with “accuracy, completeness, professionalism” and ask a model to generate a hundred questions. Those terms still leave open where users are failing to get useful help.

Hamel Husain and Shreya Shankar describe a product-oriented starting point. Read actual interaction traces, write specific observations, and group related problems into a failure taxonomy. They recommend paying attention to the first observable failure because it may explain later symptoms. This gives the eventual evaluation categories a connection to application behavior. [Error analysis for AI evaluations](https://hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html)

Applied to a fund assistant, “the answer is unreliable” can describe several problems.

If the required document was never read, investigate retrieval and reading. If it was read but historical observations became statements about today, examine the treatment of time. If the calculation looks complete but uses the wrong denominator, inspect the numerical basis. If the content is correct but ignores “don't access my account,” examine task scope.

These failures call for different cases and different repairs. A general professionalism score offers little guidance about which part to change.

Several current questions illustrate the distinction.

- **C01 explains exchange trading and primary-market subscriptions.** The user asks for differences in buying method, fees, and transaction price, and explicitly asks to proceed without looking up sources first. Success includes a useful explanation and respect for that constraint.
- **C04 explains a hypothetical NAV falling from 1 to 0.8 and returning to 1.** The decline is 20%, while the recovery is 25%. Evaluation needs to examine the base of each calculation and whether the answer explains the difference.
- **C24 requests an exact additional investment amount before today's data has updated.** The task requires distinguishing useful historical explanation, missing evidence for a current amount, and information that could still be obtained or clarified.

C24 makes the need for prior success criteria especially clear. An exact number can appear helpful. A blanket refusal can discard the explanation of stale data that the user also requested. An evaluator needs to recognize both considerations before either assertiveness or caution becomes a universal target.

Concrete success criteria express product judgments. Cases make it possible to discuss how the assistant should help and which changed conditions should lead to a different kind of response.

Requirements and domain judgment provide the success conditions. Developers connect inputs with execution records, and reviewers check references and answers. A small team can perform these roles. The important property is independently checkable references, so implementation behavior does not silently define correctness.

## 3. Why keep both core and specialist cases?

Routine checks need to observe whether common tasks remain usable. Specialist research needs more demanding material to reveal capability limits. Running every complex task in every round increases execution and review costs. Keeping only a few common questions leaves document interpretation, evidence synthesis, and complex research underexplored. The evaluation set needs to serve both purposes.

Anthropic distinguishes capability evaluations from regression evaluations. Capability evaluations target tasks the system struggles with. Regression evaluations protect tasks it can already handle. Once a difficult task becomes reliable, it can move into regression coverage. This separates work on new capabilities from preserving existing performance. [Anthropic's Agent evaluation practices](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)

Our current catalog contains **83 unique questions, divided into 14 core and 69 extended cases**. Core cases cover common scenarios that warrant continuing observation. Extended cases support more specific application questions and research capabilities. The same catalog also contains five task families.

| Current task family | Count | Problems it is intended to expose |
| --- | --- | --- |
| General fund and conversation tasks, C series | 31 | Concepts, fees, calculations, comparisons, personal read-only access, advice boundaries, and follow-ups |
| Application Q&A, L and Q series | 25 | Portfolios, cash, daily reviews, market evidence, clarification, and compound requests |
| Financial knowledge, RQ series | 12 | Original text and summaries, fee and clause dates, amendment scope, PDF locations, and evidence synthesis |
| Recomputable synthetic research, MAE series | 5 | Calculations, counterevidence, conditional judgments, and multi-method synthesis using supplied material |
| Synthetic-account research, RPS series | 10 | Research and collaboration combining simulated accounts with admitted public Web and PDF material |

These counts reflect source checked on November 9, 2026. Core and extended describe selection scope. The five families describe content. Both classifications apply to the same questions.

<a :href="withBase('/diagrams/agent-evaluation-set/catalog-en.svg')" aria-label="The 83 unique questions form core and extended selections across five task families and cross-cutting tags"><picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/agent-evaluation-set/catalog-en-mobile.svg')" /><img :src="withBase('/diagrams/agent-evaluation-set/catalog-en.svg')" alt="The 83 unique questions form core and extended selections across five task families and cross-cutting tags" loading="lazy" /></picture></a>

*Figure 2. Task families describe content, core and extended describe selection scope, and tags provide cross-cutting views. Different selections preserve the same question identity.*

The useful connection to the external practice is that different collections support different decisions. Establishing the reliability of a core case still requires its execution and evaluation records. An extended case can also protect an important existing behavior.

The catalog has current consumers. CLI, QA, and financial-knowledge entry points read questions from it. A real research run on November 9 also reused the original MAE-05 question. These observations establish current connections and one specific reuse. A fixed execution frequency for all 83 cases would require corresponding run records.

This organization asks maintainers to explain their selection for each evaluation round. It fits a product with growing task diversity and different evidence requirements. A short fixed list can be easier to maintain for a tool that still has a single input pattern.

## 4. Let the same case serve different evaluation scopes

Why add tags when task families already exist? Because fees, calculations, and freshness cut across those families.

Freshness matters in NAV explanations, account queries, and document research. Examining that concern requires selecting across task families. A single question can also involve calculation, synthetic data, and an explicit user restriction. Filing it under just one topic would discard other useful selection dimensions.

C04 is a concrete example. It belongs to the core scope, tests a calculation, uses hypothetical material, and can run through the general entry point. Together, these dimensions explain why it belongs in a calculation-explanation check and why it needs neither an actual account nor current market data.

The catalog currently keeps several independent dimensions.

| Dimension | Current examples | Role in selection |
| --- | --- | --- |
| Selection scope | `core`, `extended` | Define the default set and whether a selection expands it |
| Business and behavior | `fees`, `calculation`, `freshness`, `multi-turn` | Select a shared concern across task families |
| Evidence conditions | `public-data`, `hypothetical`, `private-input`, `approved-corpus` | Identify public, synthetic, private, or designated-corpus conditions |
| Execution entry point | `runner-classic`, `runner-qa`, `runner-knowledge` | Identify a runner that can consume the tasks |

Evaluation objectives have a separate field, discussed below. This lets us discuss what evidence a task involves independently from what we intend to evaluate.

Selections become concrete. With the current selector, core calculation cases excluding private input produce C04 and C23. Freshness cases excluding private input produce C05 and C07. Selecting the financial-knowledge cases produces the twelve RQ questions.

One selection behavior matters. Explicit tag, case-ID, or all-case selection searches the full catalog. To retain core scope alongside those selectors, include `core` in the conditions. An exclusion on its own currently narrows the default core set. Listing the selection first makes the comparison's actual scope visible.

Follow-up tasks introduce another dependency. C25 compares CSI 300 and CSI 500 ETF styles. C26 asks why “the latter” is more volatile and narrows the requested answer. In isolation, the follow-up loses its referent. Selecting C26 currently includes prerequisite C25 and marks the selected case separately from its prerequisite.

Tags serve selection. Actual source access and budgets remain with the existing execution entry point, and the runner checks case support and prerequisites. Access to the material requires the corresponding authorization.

## 5. Changing the evidence changes the capability being tested

“Assess whether this strategy deserves further research” can be asked with every number supplied in the question or with instructions to find material online. The surface question is similar, but the capabilities exposed differ.

The five MAE cases supply synthetic material within the question, making calculations independently reproducible. MAE-05 gives terminal values of 50, 100, and 140 with subjective probabilities of 0.20, 0.50, and 0.30. Under those assumptions, the expected terminal value is 102. Changing the purchase price from 100 to 90 also changes the return's denominator. A reviewer can verify the arithmetic independently, then examine the treatment of probability, counterevidence, and liquidity constraints.

These cases reduce external variation and help isolate differences in calculation or research judgment. They also supply evidence that the assistant would otherwise need to find. Other tasks are needed to observe retrieval and reading.

The twelve RQ cases use designated financial material. Their difficulty often lies in identifying what a source supports. RQ-08, for example, compares official documents from three years to establish which fields an ETF creation/redemption basket announcement changed. Reading a newer prospectus leaves the assistant with the further task of relating it to the specific amendment. Source date, document scope, and claim scope all matter.

Eight RQ cases require a positive answer under the designated supporting conditions. Four allow a bounded delivery for a declared evidence gap. That allowance has specific conditions. Execution and evaluation still need to examine the required search, the evidence actually available, and how the answer explains its limitations. Treating any claim of insufficient information as success would change the capability being measured.

The ten RPS cases combine synthetic accounts with admitted public Web and PDF research. They observe how the assistant connects product information, account conditions, and outside evidence. Simulated accounts allow portfolio questions while preserving the boundary around actual user data. Public sources can change or fail to load, and those conditions belong in the run record.

An evaluation therefore needs to identify the capability under observation. Supplying material in the question supports close examination of reasoning and calculation. Designated documents expose evidence interpretation. Actual retrieval adds source discovery, reading, and handling of missing material to the task. Each result needs to be interpreted under its corresponding conditions.

Fixed material needs maintenance, while live sources introduce variation. Recording these conditions with cases and run results helps locate failures in evidence acquisition, interpretation, or synthesis. When comparing systems, it also provides a basis for checking whether they faced comparable information conditions.

## 6. Turn evidence into a scoped acceptance conclusion

An Agent can find sources, call tools, and save reports. A readable answer shows the delivered text. Other records establish how far the task actually progressed.

Sierra's τ-bench puts a simulated user, tools, business policies, and an initial environment into a task. It checks the final database state against the intended outcome. This permits different valid conversations while separating a claim of completion from its actual effect. [τ-bench task and outcome design](https://sierra.ai/blog/benchmarking-ai-agents)

Fund research can use that distinction, while also evaluating open-ended conclusions. A report can be successfully saved and still require review of its calculations, evidence, and explanation. We currently separate three layers of work.

**Mechanism checks examine controlled execution and information transfer.** For example, did a stale-data status reach later context, and did the existing execution mechanism preserve read-only restrictions? Fifty-five numbered mechanism fixtures remain in use by offline tests for specific behaviors of this kind.

**Actual behavior examines how the current model performs the task.** It uses real requests, tool calls, source reads, obtainable deliverables, and terminal state. The unified execution entry point currently observes behavior through the original Agent API, using the required environment, authorization, and budget.

**Research quality examines whether the conclusions hold.** It needs material actually visible during the run, independently checkable references, and suitable human or model review. Arithmetic, evidence scope, dates, counterevidence, and coverage of the user's needs all belong here.

The layers help locate repairs. In C24, a stale status lost during transfer calls for investigation of evidence handling and context. An unsupported current amount despite a visible stale status calls for investigation of research judgment. An answer that explains historical material and preserves useful content still needs assessment against the task criteria.

Current coverage has specific limits. All 83 questions declare an actual-behavior objective, and 73 also declare a research-quality objective. The ten RPS questions currently declare behavior only. Nine detailed criteria records bind C04, C24, C23, C09, and the five MAE cases. Reports need to distinguish declared objectives, detailed criteria, and assessments actually completed for a run.

When quality review lacks required material, the answer can remain available while the assessment records its unassessed status and reason. This preserves access to the product's delivery and identifies the missing basis for judgment.

<a :href="withBase('/diagrams/agent-evaluation-set/acceptance-en.svg')" aria-label="RQ-08 illustrates separate engineering, actual-execution, and research-quality evidence supporting scoped acceptance"><picture><source media="(max-width: 700px)" :srcset="withBase('/diagrams/agent-evaluation-set/acceptance-en-mobile.svg')" /><img :src="withBase('/diagrams/agent-evaluation-set/acceptance-en.svg')" alt="RQ-08 illustrates separate engineering, actual-execution, and research-quality evidence supporting scoped acceptance" loading="lazy" /></picture></a>

*Figure 3. A teaching illustration using RQ-08. The figure shows evidence types and conclusion scopes. Verification choices follow the affected behavior and predeclared acceptance commitment.*

Passing tests and accepting the work require careful interpretation. Our current engineering-closure process uses a predeclared provider-free or live-model lane. The former supports closure within its implementation and regression scope, with research quality recorded according to the evidence obtained. Work declaring live-model acceptance must meet its own case selection, execution, and review requirements.

The CI configuration makes this division concrete. In the self-test workflow checked for this article, static checks and deterministic mock tests are blocking. Quick live-model self-tests are paused, and that step is informational when eligible. A successful CI run therefore needs to be read through the engineering checks it actually executed.

Delivery conclusions should stay equally specific. Controlled evidence-transfer regression passed, a real task produced a readable delivery, and the answer's amendment interpretation received independent review are three distinct observations. Keeping them separate exposes which part of the commitment still lacks evidence.

Two conditions are worth fixing before acceptance. First, establish tasks, sources, references, and execution conditions before inspecting answers. Preserve a new identity when they change, so results cannot retroactively redefine the selection. Second, track exposure of development cases. Once a challenge case enters debugging, later runs support regression and its independent-challenge status needs updating.

Verification effort should match the commitment. Relevant engineering checks support a local wiring repair. A research capability needs observation of the corresponding task. Important conclusions warrant independent review. This preserves necessary correctness while keeping a small change from automatically incurring a full research campaign.

## 7. Check the grader before trusting its scores

Questions and scores can create a false sense that a version comparison is ready. A grader can reward the wrong objective or penalize a reasonable answer.

For C04, the presence of “20%” and “25%” leaves open which change each figure describes. For C24, checking only whether the exact amount was declined misses whether the answer explained the effect of stale data. For RQ-08, checking for a citation to the newer document misses whether the amendment's scope was exaggerated.

The grader needs to recognize the success conditions. OpenAI's evaluation guidance recommends calibrating automated scoring with human feedback and concrete criteria. It also describes position and verbosity bias in comparisons. Asking which answer is better therefore requires specifying the relevant difference and checking that the grader recognizes it consistently. [OpenAI evaluation practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)

We currently have fixed financial-answer and citation control examples for evaluating distinctions such as wrong denominators, unsupported statements, incorrect citations, and reasonable answers. Their purpose is to exercise review logic, which should remain distinct from the purpose of user-task cases.

A practical check is to apply the same criterion to deliberately varied answers. The following are **constructed teaching examples**.

- A short answer with correct arithmetic and an explanation of the denominator.
- A longer answer with the style of a research report that incorrectly gives the recovery as 20%.
- An answer that recognizes missing current evidence, preserves historical explanation, and identifies what is needed.
- An answer that declines the whole request and omits independently answerable content.

If the grader consistently favors the second answer's length or cannot distinguish the helpfulness of the last two, revise the evaluation first. Further optimization against that score could keep rewarding the wrong preference.

Repeated development use also exposes a case's content. The nine current detailed criteria records are marked for development use and support debugging and analysis of task performance. Estimating performance on unseen tasks requires independent cases or genuinely new feedback, with evaluation conditions established before seeing results. Changing a few numbers in the same template can preserve the original solution cues.

This affects expansion of the set. A new report should first identify the uncovered condition, then motivate a new case or wording variant. Failure-focused samples help locate gaps. Estimating the product's overall failure rate needs sampling related to actual usage distribution.

## 8. Read results to decide where coverage should grow

After the cases run, a useful report should make the evaluated scope and the conditions behind its conclusions visible.

**Preserve the task distribution first.** Readers should be able to identify core and extended selections, calculation and document tasks, and single-turn and multi-turn cases. Suppose a batch mainly contains self-contained calculations such as C04 and C23. Even if every calculation is correct, document amendments and public-source research still need their own task evidence. This is a teaching illustration of result scope. Actual performance requires the corresponding run records.

**Keep evidence conditions with the results.** The availability of an RQ document, a successful public-page read, and the presence of prerequisite turns all affect interpretation. C24 has private-input conditions, so the authorized material or synthetic variant used in execution also needs identification. Misinterpreting evidence the model has read and an environment failing to supply that evidence call for separate records.

**Distinguish execution, quality, and missing assessment.** A report may have been saved, its calculations independently checked, and its open-ended conclusions still await review. The coverage of the nine current detailed criteria records belongs alongside the cases. This reveals which conclusions have an independent basis and which need further reading or reference material.

Repetition also affects interpretation. Running each of the fourteen core cases five times produces seventy trials, while task coverage remains fourteen cases. Repetition examines variation under the same conditions. Different tasks expand coverage. An intermittently successful case raises a reliability question. An absent task family raises a coverage question.

Usage needs the same context. Synthetic calculations and public PDF research can require different amounts of time, requests, and tool use. Grouped records help explain where resources went. Incomplete cost records should retain unknown portions, with the scope of any known subtotal attached.

Different gaps motivate different additions.

- A real interaction reveals an uncovered need, motivating a task and its success conditions.
- An existing task fails under different wording, motivating phrasing, reference, or context variants.
- Evidence transfer or execution fails in a specific way, motivating a controlled mechanism check.
- Human review disagrees substantially with automated scoring, motivating grader-control examples and rubric calibration.

This also clarifies the relationship among our current collections. The 83 questions represent user tasks. Core and specialist selections define different observation scopes. Mechanism fixtures help investigate controlled behavior. Grader-control examples examine assessment. Which collection should grow depends on the question the results leave unresolved.

A useful delivery conclusion should be traceable through the development process. What did requirements promise? Which implementation behavior was verified? What actual-execution and quality evidence did acceptance obtain? Which new conditions appeared in operation? The current catalog, runners, and review material provide a basis for that work, with confirmed coverage and missing evidence recorded explicitly.

That relationship helps the team distinguish an implementation repair, missing source material, a flawed rubric, and an uncovered task. Maintaining the evaluation set then has a concrete purpose, accumulating evidence around the problems the product is intended to solve.

## Further reading

- For the execution, observation, and scoring chain, see [Agent Evaluation Panorama](./honest-agent-evaluation).

[Read the complete Chinese edition](../../articles/agent-evaluation-set-for-iteration) · [ETF Agent engineering articles](https://github.com/hpoenixf/eff-agent-article)

Star the repository on GitHub to follow and discuss further work on Agent evaluation and product iteration.
