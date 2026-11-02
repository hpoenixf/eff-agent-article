---
readingBrief:
  takeaways:
    - "The model interprets intent and chooses actions; effect owners retain permissions, calls and receipts instead of asking the model to maintain a conflicting state mirror."
    - "Stopping research, committing prose and saving a file are separate facts. Citation defects need not erase independently authorized prose, and completion flags cannot certify meaning."
    - "Recover confirmed results under their original identity and reconcile unknown effects first. The public one-correction path covers narrowly bounded, undispatched calculation inputs—not general retries."
  appliesTo:
    - "Simplifying Agent turn protocols or reviewing the boundary between model judgment, execution state, correction and recovery."
  notFor:
    - "Treating the room-booking example as an implemented feature, or inferring better model quality, lower cost or universal crash recovery from fewer fields."
---
# Stop Making the Model a State Machine: Simplifying an Agent Protocol

**Let the model choose what to do next. Let the program that performs the operation record what actually happened.** Separating these jobs keeps the model from researching while also maintaining a second, potentially inaccurate system ledger.

Consider a teaching example. A user asks an office assistant to find a meeting room for tomorrow afternoon and reserve it once authorized. The model must understand the time, capacity, and equipment requirements. But permission to book, a confirmed reservation, and consumed quota cannot be established by the model writing a sentence. This is an illustrative scenario, not a capability offered by ETF Agent.

If the booking API does not reply, “it probably worked” is not proof of success. “Try again” may also be unsafe: the first request might already have taken effect. Conversely, knowing that a request was sent does not tell the program which room best suits the user's preferences.

The boundary is therefore two-sided: **do not ask the model to maintain facts the program already owns, and do not pretend a program understands meaning merely because it can apply a rule.**

## 1. How two conflicting versions of state appear

An early ETF Agent research protocol asked the model to return a structured turn called `AgentTurn`. Alongside proposed actions, it described gaps and completion. This simplified example is retained from the original essay; it is not a public API:

~~~json
{
  "actions": ["search"],
  "gaps": ["More source evidence is needed"],
  "completionClaim": false
}
~~~

The original motivation was reasonable: once tools were involved, the system needed to know what should happen next and why work should continue. But permissions, tool lists, execution outcomes, and publication status gradually entered the model's response as well.

In the booking example, the program might record “submitted, outcome unknown” while the model reports “failed.” Retrying from the model's version could create a duplicate reservation. Even if the program's record ultimately wins, the redundant account still has to be generated, parsed, and corrected.

The problem is not simply a large JSON object. **One fact has two maintainers, and one does not own its source.** Removing the duplicate avoids that conflict; fewer fields alone do not establish higher intelligence or lower cost.

## 2. The model proposes actions; the program retains actual records

The September 2026 native-tool-loop work narrowed the model's job from “describe the entire system state” to “propose the appropriate next step.” The program still retained actual responses, call order, execution outcomes, and receipts.

In the teaching example, the division looks like this:

| Question | Where the answer comes from |
| --- | --- |
| What does “afternoon” mean, and which booking details are missing? | Model interpretation and clarification when needed |
| Which rooms meet the capacity and equipment requirements? | Tool-provided facts, compared by the model |
| Is this request authorized to book? | Recorded authorization and execution checks |
| Did booking happen, and is a retry safe? | Original request identity, booking outcome, and execution receipt |
| How should the result and its uncertainty be explained? | Model interpretation of actual results |

The latter responsibilities are grouped here as the execution system, or Runtime, to contrast them with model judgment. That does not mean one large class should own every business rule. The booking service owns booking facts; resource management owns quota; Runtime coordinates their established facts.

~~~mermaid
graph TD
UserQuestion --> Model
Model --> Runtime
Runtime --> Tool
Tool --> Model
Runtime --> Answer
~~~

The model chooses an action, a tool returns an observation, and the program preserves execution facts. The arrows do not give the model permission to rewrite authorization, results, or task state.

Retiring the model-maintained whole-turn description must not delete the host's actual response record. In this project, the latter is called `ModelTurn`: a durable record of a response and its calls, not another model-authored report of what the world supposedly looks like.

## 3. “We can stop” does not mean delivery succeeded

Using the original essay's simplified call name, `finish()` means the model considers the investigation ready to end. It does not give the model authority to write the system's terminal outcome.

Suppose the assistant has explained room availability but the reservation outcome remains unknown. It may stop looking for rooms; the system still cannot call the unknown reservation successful. The original request must retain its actual state, including what is known and what is not.

Research systems need a similar distinction: **continuing research, committing answer text, and saving a file are related but separate facts.** The current publication contract accepts both text submitted by the publication tool and ordinary assistant text routed through the same publication mechanism. No publication-tool call does not automatically mean no valid answer exists.

The original essay treated valid current citations as a hard condition for finishing. That statement needs narrowing under the current contract: broken citations, unverified public sources, or attachment-capacity problems affect the relevant attachments and limitation notices. They must not, by themselves, erase independent authorized prose or veto completion. Actual permissions, private-source dependencies, and execution identity still require protection; deleting a citation cannot bypass them.

A program can establish that a passage committed without establishing that every question was answered correctly. Evidence support and research sufficiency still require semantic judgment and appropriate review, not certification by a completion flag.

## 4. Programs supply available tools; the model chooses among them

An assistant with room-viewing access cannot acquire booking permission by emitting `canBook: true`. The tools presented to it should be prepared from recorded authorization and actual capabilities, while each invocation still checks its scope.

If the user subsequently authorizes booking, the existing admission mechanism must accept that change before the model chooses its next action. Pending actions in an old response do not automatically cross a permission boundary merely because the model already wrote them down.

Three responsibilities are sufficient: **the program records permission, the program prepares available tools, and the model selects a tool.** The model need not maintain a duplicate of each list.

ETF Agent's current contract preserves the original grant and accepted additions within the same logical Run, rather than rewriting past execution from today's permission table. A new Run needs its own admission; concrete actions remain constrained by account, scope, cancellation, and resources. This is a specific lifecycle choice, not a claim that every product must use the same authorization policy.

## 5. A failed action should not redo completed work

Suppose the assistant found available rooms but supplied an invalid time parameter when booking. A useful response retains the availability result and tells the model which booking argument is invalid. Fixing one parameter does not require regenerating a description of permissions, queries, and the entire execution state.

This applies to independently handleable actions. If a later action depends on an earlier success, that dependency still matters. “Local failure” is not permission to execute every remaining operation regardless.

Recovery likewise uses original records. Confirmed results are read under their original identities; unknown external effects are reconciled rather than treated as non-events. Supported checkpoints and recoverable interruptions depend on actual implementation, not a promise of seamless continuation after any crash. See [Disconnects and Crash-Recovery Contracts](agent-disconnect-is-not-crash-recovery-contract.md).

### One correction in the public version is not an automatic retry policy

The room-booking example illustrates a design principle; public **v0.15.1** implements a much smaller calculation path. Previously, an argument error that had not dispatched could still terminate the turn. Now, if an unbound `calculate_change` call omits a required field, supplies a value of the wrong numeric type, or uses an invalid unit format, the original Host returns a rejection bound to that request. Runtime offers at most one correction, still within the original rounds and budget.

This applies only to a single-call path without Hooks or prior partial or unknown effects. A zero denominator, mismatched units, a bound `ResultRef` failure, a permission rejection, or an effectful operation does not gain retry permission. Recovery also verifies the persisted correction count and rejection identity; restarting does not replenish the opportunity. Clearer types in the tool Schema do not replace actual Host validation.

The program supplies the fact that “this input has not executed and may receive a bounded correction.” It does not guess the correct number for the model or treat an unknown booking as a non-event. See the [fixed Host](https://github.com/hpoenixf/open-etf-agent/blob/8ba24a15cb1ce6ad3a0ebd48141be0549bfda35a/src/tools.mjs), [Runtime](https://github.com/hpoenixf/open-etf-agent/blob/8ba24a15cb1ce6ad3a0ebd48141be0549bfda35a/src/runtime.mjs), [controlled regression](https://github.com/hpoenixf/open-etf-agent/blob/8ba24a15cb1ce6ad3a0ebd48141be0549bfda35a/test/bounded-validation.test.mjs), and [current main](https://github.com/hpoenixf/open-etf-agent). This public calculation slice does not implement the room-booking scenario above.

## 6. Do not turn keyword matching into factual judgment

The opposite boundary error appears when programs infer the real world from phrasing.

“Your account has no reservation” could be a current claim, or part of “suppose your account has no reservation.” Matching those words cannot replace a booking record. A rule bypassed by paraphrasing is also a poor authority for permission or factual truth.

Mechanical checks remain useful: date formats, IDs, JSON syntax, length, and explicit numeric bindings can be checked deterministically. Those checks concern format, identity, or a specific binding—not whether an entire explanation is semantically correct.

ETF Agent encountered the same distinction. Personal holdings must come from authorized data, not a phrase classifier. “I completed the adjustment” cannot change the investment ledger. A conflict between prose and receipts calls for a better explanation, not promotion of the prose into an execution record.

A valid citation similarly takes a reader back to a source. If the source says A while the answer claims B, the link does not prove B. See [Why Citations Do Not Prove Reliability](ai-citations-do-not-prove-reliability.md).

## 7. What this evolution actually changed

These are shapes encountered in this project, not a maturity ladder that every Agent must climb:

| Stage | Shape | Trade-off |
| --- | --- | --- |
| Prompt-only Agent | User → Model → Answer | Simple entry, insufficient tool and execution records |
| Structured Agent | Structured model output → Runtime → Tools | Proposed actions can be checked and actual work recorded |
| Heavy-protocol Agent | Model repeats state, permissions, and completion each turn | Duplicate records grow and can disagree |
| Native-tool Agent | Model proposes calls; programs record actual outcomes | Necessary protections remain without a model-maintained state mirror |

The final shape is not a return to “just write a prompt.” Authorization, records, persistence, and recovery constraints still exist. The model is simply no longer required to keep a second ledger.

The same rule applies to conversation summaries: a summary can help a model continue, but must not silently rewrite an original user constraint and then become its authoritative replacement.

## In the next review, follow one field to its source

Before adding a model-output field, take one example: who actually knows `bookingStatus`? If the booking service already records it, provide that result to the model rather than demanding another declaration. A field expressing which condition is still unclear may genuinely require model judgment.

Then follow the same example through failure: could an unknown outcome cause duplicate booking, could an invalid argument repeat an unrelated query, and can the user distinguish “room found” from “reservation confirmed”? Those questions are more useful than counting removed protocol fields.

**Let the model understand and choose; let the program faithfully record execution.** This is [principle 1](/en/principles#principle-1) in practice. For the wider division among capabilities, continue with [Model, Runtime, Tools, and Skills](agent-model-runtime-mcp-skill-boundaries.md).
