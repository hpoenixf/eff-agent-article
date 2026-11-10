---
title: "From Chat to Copilot to Agent: What Actually Changes in the Architecture?"
description: "Trace one fund-research task through Chat, Copilot, Agents, and long-term assistants: context construction, execution control, tool calls, durable state, and recovery, grounded in Open ETF Agent v0.24."
readingBrief:
  takeaways:
    - "Copilots add work-environment context and reviewable changes; they need not use a different model."
    - "Agents let models choose the next step from tool results. The runtime still checks permissions, arguments and budgets."
    - "Dispatched, saved and consumed by the model are separate facts. An unknown external outcome is not a safe reason to retry."
    - "Stored information is not necessarily visible in this turn. Summaries and memory still need sources and conditions of use."
    - "Long-term assistants use bounded tasks over time, rechecking facts and permissions, rather than one endless loop."
  appliesTo:
    - "Engineers and product teams moving from LLM applications to Copilots, Agents or cross-session tasks."
  notFor:
    - "Treating offline demos as live fund research, trading systems or validated long-term financial advice."
---

# From Chat to Copilot to Agent: What Actually Changes in the Architecture?

Why can a model that answers questions become a Copilot when embedded in an editor, then start taking Agent tasks when given tools and an execution loop? What must we add if it is to work over time?

Many explanations say that AI is becoming smarter and more autonomous. From an engineering perspective, the more revealing point is that **these modes do not necessarily require different foundation models. Much of the continuing evolution happens in the software surrounding the model.**

At first, the application assembles the input and the model generates the output. Next, the application turns the working environment into context so the model can propose reviewable edits. Then model output begins to influence which tool the program invokes next: real execution results feed back into the next model request. Once a task spans sessions and time, the system also needs scheduling, durable state, recovery, memory, and fresh authorization checks.

Using one fund-document research task, this article examines four typical ways of working: **Chat → Copilot → Agent → long-term assistant**. These are not strict product generations. Current ChatGPT and GitHub Copilot products combine several of these modes. Our question is which mechanisms become necessary as we delegate more of the work, and why a stronger prompt alone cannot provide them.

## 1. Chat: One Model Request, and the Inputs That Actually Reach It

A user asks: “Why might a low-volatility dividend fund decline?”

A minimal language-model application is easy to picture:

~~~text
Question → Assemble messages → Model API → Generated answer → User
~~~

Illustrative pseudocode:

~~~javascript
const response = await model.generate({
  messages: [
    { role: "system", content: instructions },
    { role: "user", content: question }
  ]
});
return response.text;
~~~

A model may explain rates, valuations, dividend strategies, and market volatility. That does not mean it knows which fund the user owns, or that it accessed today's market data. **Model parameters learned in training** and **the actual context included in this inference request** are different things. An ordinary inference call does not automatically alter model weights. In a typical API application, conversational continuity also requires the application to retain, select, and resend relevant history.

The main engineering concerns are therefore message construction, prompts, history management, streaming delivery, timeouts, and context budgets.

Retrieval-augmented generation (RAG) can add external knowledge without changing who controls the procedure:

~~~text
Question → Predefined retrieval → Sources + prompt → Model → Answer
~~~

A search index adds information, but the program may still decide in advance which database to query, how many searches to make, and when to stop. The central question remains: **What did the model actually see, and can it produce a useful, qualified answer from those inputs?**

## 2. Copilot: Turn the Working Environment into Context, and Connect Suggestions to Real Objects

Place the same model inside an IDE and the interaction changes. Users no longer have to paste an entire file to explain their work. The host can collect cursor and selection state, relevant files, symbol definitions, diagnostics, and project constraints as needed.

A typical editor-assistance path looks like this:

~~~text
Editor event / user request
     ↓
Environment: files, selection, diagnostics, code index
     ↓
Relevance selection, context trimming, budget allocation
     ↓
Model
     ↓
Completion / patch / edit suggestion
     ↓
Preview → Accept or reject → Update the working object
~~~

Two architectural additions matter.

**First, a static prompt becomes environment-driven context engineering.** The user's current task may not be fully described in the chat box. The system needs to select relevant information from the actual work environment rather than blindly sending an entire repository. Syntax trees, language servers (LSPs), full-text search, and vector retrieval can all contribute; none is mandatory for every Copilot.

**Second, model output can affect a concrete working object.** The output is no longer only an explanation. It can be a completion, structured edit, or patch, while the host provides preview, application, and undo. GitHub Copilot, for example, offers editing and Agent modes within one product, with different degrees of human direction and autonomous execution. Copilot and Agent should not be treated as mutually exclusive technical categories.

A fund application can work the same way. A user opens a holding page, selects two NAV curves, and asks the AI to explain the difference using the selected fund, dates, and metrics. The user still drives navigation and operations while the model provides embedded assistance.

**The main change from Chat to Copilot is what the model can see and where its output can land—not necessarily who decides the next operation.**

## 3. Agent: The Model Begins to Influence the Next Step, Changing the Allocation of Control

Now the user requests: “Compare two funds' disclosed holdings, calculate overlaps, cite the sources, and save a report.”

When the sequence is known, ordinary software can do it:

~~~text
Read A → Read B → Validate basis → Calculate → Write report
~~~

Calling a model at every step does not, by itself, change this predefined workflow into model-directed execution.

Open-ended research differs because crucial conditions may emerge only during execution. Two disclosures may have different reporting dates; one may cover only top-ten holdings while another provides a larger set. Should the system look for matching-date disclosures, change its comparison method, or deliver a narrower conclusion? A model can propose different next actions based on those observations.

The Agent adds a feedback path:

~~~text
User goal
   ↓
Runtime builds this round's working context
   ↓
Model proposes a structured action
   ↓
Runtime / Tool Host check permissions, arguments, budgets
   ├─ Not allowed: reject and record observation
   └─ Allowed: execute the actual tool
                   ↓
             Tool result / Observation
                   ↓
           Model decides: continue / ask / finish
~~~

[Anthropic's “Building effective agents”](https://www.anthropic.com/engineering/building-effective-agents) distinguishes workflows with predefined code paths from Agents whose process and tool use are dynamically directed by the model. It is a useful way to understand control, not a claim that the two cannot be combined.

### 3.1 A Tool Call Is a Proposal, Not a Grant of Authority

Rather than ask the model to write “I will search fund data” and parse its prose, a tool protocol should expose explicit names, arguments, and return structures. For example, in a teaching protocol:

~~~json
{
  "kind": "calls",
  "calls": [
    {
      "id": "call-001",
      "name": "search_documents",
      "arguments": {
        "fundId": "fund-a",
        "documentType": "holding-disclosure"
      }
    }
  ]
}
~~~

This object is merely a proposed action. It is not proof of execution, nor does it expand the model's access rights.

The Runtime must check that the tool exists, the arguments meet its contract, the resource is authorized, and execution remains within the available budget. The Tool Host performs the real action. A prohibited access cannot become authorized simply by switching tools or rewriting the prompt.

### 3.2 An Observation Must Affect the Next Decision

Suppose a successful read returns:

~~~json
{
  "callId": "call-001",
  "status": "succeeded",
  "observation": {
    "asOfDate": "2026-06-30",
    "coverage": "top-ten-holdings"
  }
}
~~~

The tool succeeded in obtaining a document. The model must still recognize that it contains neither current nor complete holdings. If the model changes the research plan accordingly, the observation has become part of execution control. If it mechanically proceeds to claim a full-portfolio overlap ratio, additional successful tool calls do not establish research quality.

**The important part of an Agent loop is not how many times it runs, but whether new, real observations can change subsequent actions.**

## 4. A Real Runtime: Why a `while` Loop Is Not Enough

The smallest loop is straightforward:

~~~javascript
// Teaching pseudocode: persistence, unknown effects, and recovery omitted
while (!done) {
  const proposal = await model.next(buildContext(state));
  if (proposal.kind === "final") break;
  for (const call of proposal.calls) {
    const decision = policy.check(call);
    const result = decision.allowed
      ? await toolHost.execute(call)
      : { status: "rejected", reason: decision.reason };
    state.addObservation(result);
  }
}
~~~

The hard part is the lifecycle of actual operations. Consider [the fixed Open ETF Agent v0.24 Runtime source](https://github.com/hpoenixf/open-etf-agent/blob/0d47e318e0f5fb36d45d8be274324a06bdd20d5c/src/runtime.mjs).

In that implementation, `gateway.next()` obtains a model proposal, `validateProposal()` checks its structure, `createToolHost()` creates a constrained tool host, and `host.execute()` invokes tools. The Runtime also manages rounds, tool budgets, deadlines, and durable execution state.

These are not decorative layers. They distinguish facts that would otherwise be conflated.

### Dispatch, Commitment, and Consumption Are Not the Same Event

Consider saving a report:

~~~text
Model proposes a save
    ↓
proposal-sealed (proposal sealed)
    ↓
tool-dispatched (operation dispatched)
    ↓
result-committed (result persisted)
    ↓
result-consumed (result enters subsequent history)
~~~

If a process crashes after dispatching an external write but before receiving a receipt, that operation may have succeeded, failed, or remained in progress. **Unknown does not mean failed. Blind replay can duplicate an external effect.**

Open ETF Agent treats phases such as `model-reserved`, `proposal-sealed`, `tool-dispatched`, `result-committed`, and `result-consumed` as distinct recovery facts. It does not claim a universal exactly-once guarantee for arbitrary external systems.

This is continuous with transactions, idempotency, and failure recovery in mature backend engineering. The added Agent difficulty is that the model may choose the action sequence at runtime, so the constraints cannot live only in one predefined business path.

### System State Is Not the Model's Working Context

Another distinction is just as important.

**Execution state** is what the system actually dispatched, obtained, stored, and verified.

**Working context** is the goal, history, summaries, tool definitions, and source excerpts the model actually received in the current request.

A source page being stored in a database does not mean the model saw it. A summary that omits “top-ten disclosed holdings only” can send the model down the wrong comparison path. Context projection, original references, and targeted rereads allow a bounded working context without erasing the conditions under which original evidence is valid.

To investigate why an Agent took the wrong path, it is therefore insufficient to inspect only the user's first question and the final answer. The actual model input, proposed tools, dispatches, and results matter.

### Execution Completion Does Not Establish Answer Correctness

The [Open ETF Agent v0.24 real-model validation record](https://github.com/hpoenixf/open-etf-agent/blob/afbfb9865539c18c9358ac65c822f929aaa6e872/docs/verification/v024-release.zh-CN.md) contains a precise citation error.

A saved report attached a sentence about imported rows to the wrong source. The final reply disclosed the error, but the previously saved report was not repaired.

All of the following could therefore be true: the execution machinery completed, the file existed, the model identified the error, and the reader could still later open the incorrect report version.

Tool-call success, Run completion, and semantic research quality cannot be collapsed into one “Agent success rate.” We must separately assess what was saved, whether the report's claims are supported, and whether the user can read the validated artifact.

## 5. From One Agent Run to a Long-Term Assistant: State Must Outlive Execution

A one-off Agent is commonly started by the user and ends when its Run completes or stops.

Now imagine the user says: “Keep watching my portfolio and alert me when new disclosures or risk exposures merit attention.” Running one model loop for longer is not the right abstraction.

A more useful technical shape is:

~~~text
Long-term goal + revocable authorization
          ↓
Cron / event trigger / manual request
          ↓
Create one bounded Run
          ↓
Read current business facts and relevant history
Recheck this Run's permissions and resources
          ↓
Agent Runtime
          ↓
Persist artifacts, receipts, and task state
          ↓
Notify / wait for a decision / finish normally
          ↓
A later event may start another Run
~~~

At least three further mechanisms become important.

### 5.1 Scheduling: Who Starts the Next Research Task?

Cron jobs, task queues, or event buses initiate new executions. They do not establish the correctness of a research result, and they must not bypass the Run's access controls and budgets. One long-term goal can be advanced through many independent, bounded Runs rather than one model conversation that never ends.

### 5.2 Persistence and Recovery: What May Continue After an Interruption?

A closed browser, disconnected network, and crashed process are different events. Recovery must preserve the original task identity, completed actions, saved results, and dispatched operations whose effects remain unknown. An interruption is not an automatic license to retry every operation.

[LangGraph's persistence and checkpoint documentation](https://docs.langchain.com/oss/javascript/langgraph/persistence) illustrates this design space. A checkpoint alone, however, does not guarantee that an external write can be repeated safely.

### 5.3 Memory: Stored, Recalled, and Adopted Are Three Separate Steps

A long-term assistant should also distinguish:

| Kind of data | Example | What to check before reuse |
| --- | --- | --- |
| Business facts | Holdings, target allocations, current disclosures | Freshness, measurement basis, permission |
| Execution facts | Original report, tool result, file version | Identity, outcome, reproducible readback |
| Long-term memory | Preferences, corrections, topics of interest | Permission to retain, applicability, expiry |

Putting all three into a vector database does not create a personal assistant by itself.

A user's statement last month that they would like more overseas exposure may inform today's research, but it does not authorize a trade. Last week's report may be useful only with its reporting date and original evidence. Retrieving that report does not automatically update the model's weights.

**Long-term continuity is not just remembering. It is correctly reusing facts that remain valid, and withdrawing conclusions whose preconditions have changed.**

## 6. Four Working Modes, Four Typical Architectural Shapes

| Dimension | Chat | Copilot | Agent | Long-term assistant |
| --- | --- | --- | --- | --- |
| Inputs | Messages, history, optional RAG | Add current environment and work objects | Add observations and per-round working context | Add cross-Run history, goals, events |
| Who chooses the next step? | Mostly predefined application path | Human and host organize work | Model helps select actions within authorization | Scheduler starts work; model chooses within each Run |
| Outputs | Generated content | Completions, patches, reviewable edits | Tool effects, research results, durable artifacts | Artifacts, alerts, and pending decisions across Runs |
| Additional mechanisms | Model API, context assembly | App/IDE integration, change application | Runtime, Tool Host, loop, receipts | Scheduler, persistence, recovery, memory governance |
| Key risks | Hallucination, missing information | Irrelevant context, bad edits | Unauthorized effects, unknown outcomes, bad delivery | Stale facts, permission drift, repeated work |

This table describes typical architectural slices, not a product hierarchy. A Copilot can offer an Agent mode, an Agent can have no memory, and a deterministic workflow may already use schedulers and durable state.

The first architecture question should be: **Does the task truly require the model to select the next action based on observations?** For fixed inputs, deterministic calculations, and enumerable failure cases, ordinary software or workflows are often simpler and easier to test.

Introduce the cost of an Agent Runtime where uncertainty materially changes the useful next step. Add cross-time goal and recovery management only where work genuinely spans multiple executions.

## 7. The Next Step Is Not “Remove All Humans”; It Is Bounded, Continuing Collaboration

Future systems may handle longer, more complex work through better context selection, dependable tool protocols, specialized child tasks, and appropriate memory use.

But additional Agents do not automatically improve accuracy, longer loops do not guarantee better evidence, and saved history does not prove that a system has learned the user's preferences.

In finance in particular, the ability to organize research does not grant investment-decision or trading authority. Market-data dates, calculation semantics, suitability, and external execution still require distinct controls.

I therefore do not see “remove the human from every loop” as the natural end state. A more defensible engineering goal is: **models help judge uncertain paths, deterministic systems preserve facts and effects, and people retain goals, authorization, and consequential decisions.**

## Conclusion: From Generating Answers to Influencing Real Work

In Chat, software prepares the model's input and receives generated content.

In Copilot, software turns a user's working environment into context and connects model suggestions to actual work objects.

In an Agent, observations can influence model-selected execution paths, while the Runtime must govern authorization, state, budgets, unknown effects, and delivery.

For a long-term assistant, work spans individual Runs and requires scheduling, persistence, recovery, memory, and continuing authorization.

**The real evolution is not putting more loops around the same model. It is delegating some action selection to the model while software continues to own permissions, execution facts, and real-world effects.**

Stronger models can make more open-ended tasks feasible. Whether the surrounding system can responsibly accept those tasks still depends on clear ownership of those engineering responsibilities.

---

## Further Reading and Code

- [How Agent Development Differs from Backend Development](/en/articles/agent-vs-backend-development-panorama)
- [The Model, Harness, and Loop in Research Agents](/en/articles/etf-agent-model-harness-research-loop)
- [Agents in 15 Minutes](/en/articles/agent-in-15-minutes)
- [Open ETF Agent: Fixed v0.24 Runtime](https://github.com/hpoenixf/open-etf-agent/blob/0d47e318e0f5fb36d45d8be274324a06bdd20d5c/src/runtime.mjs)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [GitHub Copilot: Agent mode](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode)
- [LangGraph: Persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence)

If this work helps you, consider starring [Open ETF Agent](https://github.com/hpoenixf/open-etf-agent) or the [Agent engineering article collection](https://github.com/hpoenixf/eff-agent-article). Concrete engineering tradeoffs and counterexamples are welcome.
