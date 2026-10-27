# When Two Agents Talk Directly: Designing Bounded Bull–Bear Research

> Multi-Agent Investment Research · Part Two | Genuine challenges, actual replies, and recoverable evidence

**Bull/Bear Agents add value only when a material investment argument can be challenged with verifiable evidence and the original proponent actually responds.** Otherwise two Agents are merely producing opposing paragraphs, not conducting a research discussion.

Suppose an investor believes buying another technology ETF will reduce portfolio concentration. Bear should inspect overlap with the existing funds and ask Bull to confront the same evidence. If the claim fails, it should be withdrawn—not averaged into a compromise buy percentage.

That is why ETF Agent explored direct Peer messages. But an exchange must be verifiably real: who challenged which claim, whether the other participant received it, and what evidence was actually adopted. Recovery must not invent dialogue that never occurred. This article preserves the essential message and recovery mechanics; the separate [investment-perspective article](investment-perspectives-and-thesis-falsification.md) covers when different analytical methods are useful.

## 1. A Report With Both Sides Is Not Necessarily a Real Challenge

Suppose an investor proposes moving **10 percentage points of total assets** into a technology ETF because “more funds means better diversification.” Bull discusses growth prospects and Bear lists valuation and volatility risks. Both views sound reasonable, yet neither tests the decision's central premise.

**A useful challenge targets a specific claim.** If the new fund substantially overlaps existing holdings, owning more fund names may not reduce underlying concentration. Bear needs to state the relevant instruments, date, and holdings definition and ask Bull to respond to that evidence.

Rather than record “both sides produced a report,” we care which reason was challenged, which evidence mattered, and whether the original author actually revised the argument. That makes a disagreement informative to the investor rather than staged opposition.

## 2. Two Independent Reports Are Not a Conversation

We considered three patterns:

| Pattern | What the investor receives | When it helps |
| --- | --- | --- |
| **Parallel analysis** | One bullish report and one bearish report | Broadly understanding an investment |
| **Main-mediated follow-up** | Main relays questions after reading both reports | Occasional clarifications without a peer protocol |
| **Direct peer dialogue** | Bear challenges a specific Bull claim, and Bull receives and answers it | Important premises that deserve sustained scrutiny |

“Direct” does not mean the language models establish a private network connection. The application still transports the message. The difference is that Main does not rewrite each statement or consume an additional model turn merely to relay it.

Even so, the third approach is not always better. A straightforward fee comparison may need just one researcher. Peer dialogue consumes time, model requests and a shared research budget. With no meaningful disagreement to explore, extra rounds produce noise.

We therefore did **not** turn every financial query into a mandatory bull–bear committee. Main may opt in when there is value, while respecting explicit user requests or exclusions. A dialogue can also end as soon as it stops adding useful information.

## 3. A Good Bear Can Say: “I Found No Strong Counterexample”

Bull is responsible for supporting an argument; Bear is responsible for actively testing it. They are not obliged to be permanently optimistic or pessimistic.

Bear should present at most **three substantial, qualified challenges**. That is a ceiling, not a quota. If none can be established, it should describe what it checked and what remains unknown.

Bull need not “win,” either. It may withdraw an unsupported premise while keeping other open questions alive.

Here is a **synthetic teaching exchange**, not a transcript from an actual model run:

> **Bull:** Adding a technology ETF may create new growth exposure, but we need to compare its holdings with the existing portfolio before claiming improved diversification.
>
> **Bear:** On the stated look-through assumptions, technology exposure rises from 15% to 23%. More fund names therefore do not establish greater diversification. This calculation alone does not establish the direction of total portfolio volatility.
>
> **Bull:** I withdraw the argument that adding a fund automatically improves diversification. If the goal is to increase technology exposure intentionally, we need a different rationale and must examine valuation, cash use and risk tolerance.

The conversation has not decided whether to buy. It has made one weak premise visible and correctable.

For investment research, that is more useful than letting a third model vote on the winner. **Two agents repeating the same source do not create two independent pieces of evidence.**

## 4. The Product Should Show Real Disagreement, Not a Performance

We want the investor to be able to answer three questions: what was originally claimed; what was actually challenged, answered or revised; and what remains unresolved.

For example, a rise in technology-sector weight does not mechanically prove a rise in total portfolio volatility. Correlations, funding source and investment horizon still matter. The final report must preserve the scope of what the evidence supports.

There is also false transparency to avoid: a screen that displays alternating Bull and Bear bubbles even though Main wrote the entire dialogue in one pass. If we claim that two separate agents talked, their independent statements and actual delivery path must be traceable.

That turns a product requirement into a runtime question: **How can we prove that the exchange happened without letting it block ordinary research?**

## 5. The Protocol: Independent Openings Before Bounded Exchange

ETF Agent already had a Main/Child model. Main owns the final user-facing answer; a Child can research and use permitted tools within a separate execution context. We reused this existing execution mechanism instead of building two special-purpose agent runtimes.

Each Child begins with the original question and its own authorized facts. It produces an independently authored, public **opening**. An opening is neither hidden chain-of-thought nor a raw tool trace. Only after both valid openings are available can the actual exchange begin.

Pair formation also has two steps. The first Child proposes a peer offer and stops at a safe point; the second joins using the original issued task identity. The application checks their shared Root, complementary roles and authorizations, then freezes the pair identity. Otherwise the first Child might finish before its alleged counterpart even exists.

The message belongs to the existing Child lifecycle owner, not to a separate debate service. The simplified path is:

~~~mermaid
sequenceDiagram
    participant Bear as Bear Child
    participant Host as Execution and authorization
    participant Store as Durable records
    participant Bull as Bull Child
    Bear->>Host: Propose challenge and evidence references
    Host->>Host: Validate pair, round and source access
    alt Invalid
        Host-->>Bear: Reject this send and report the gap
    else Valid
        Host->>Store: Store unique message and receipt
        Store-->>Host: Return original message identity
        Host-->>Bear: Accepted and safe to wait
        Host-->>Bull: Send deduplicated wake hint
        Bull->>Host: Request continuation
        Host->>Store: Read original message and cursor
        alt Root may continue
            Host->>Bull: Include original message in next model request
            Bull->>Host: Submit linked response
        else Stopped or expired
            Host-->>Bull: End peer work and retain existing results
        end
    end
~~~

Main does not paraphrase every round. Neither Child gains new trading, source or budget authority simply by being part of a pair.

## 6. “Sent” Is Not One Boolean

There are three distinct facts.

**First, the model proposes a message.** Bear asks to challenge something.

**Second, the application accepts the send.** It checks authorization and dialogue state, then durably records the unique message and receipt.

**Third, Bull’s next actual model request includes that exact message.** Only then can we say the message was delivered into the recipient’s model input.

Even the third fact does not show that the model understood the challenge or that the challenge is correct. Financial evidence has the same distinction: a citation exists; the model saw it; and the source actually supports the conclusion are different claims.

A message needs identity tying together its author, recipient, pair, causal round, original reply and source lineage. This is an illustrative shape; production also checks sealed model requests, tool receipts and authorizations:

~~~ts
type PeerMessage = {
  messageId: string;
  pairId: string;
  senderExecutionId: string;
  recipientExecutionId: string;
  round: number;
  replyTo?: string;
  text: string;
  evidenceRefs: string[];
};
~~~

The recipient comes from the frozen valid pair, not an arbitrary address chosen by the model. The reply references an actual message ID, not a guess based on wording.

We keep these facts within the original execution receipt system. Creating a second “truth” database for the debate would make recovery and audit harder, not safer.

## 7. Dialogue Needs an Ending: Rounds, Waiting and Budgets

We deliberately did not implement “continue until both agents agree.”

A round contains one challenge or proposition and at most one causally linked response. The independent openings are not counted. An occupied half-round cannot be retried for free after recovery. Bear starts the first challenge, Bull responds, and further exchange is optional.

The legal maximum is determined by the trusted platform limit and any valid one-time user request; it is frozen with the pair. **A round allowance does not create extra model budget.** Existing Root and Child limits, deadlines, cancellation and finalization still apply.

~~~mermaid
flowchart TD
    A[Both Children submit independent openings] --> B{Useful to continue and still authorized?}
    B -- No --> H[End dialogue and return existing findings]
    B -- Yes --> C[Submit an actual challenge]
    C --> D[Persist state and release execution slot]
    D --> E{Valid reply or terminal event?}
    E -- Reply --> F[Resume under the same execution identity]
    F --> B
    E -- Terminal --> H
    H --> I[Main synthesizes disputes and gaps]
~~~

Waiting does not mean keeping a server thread busy or polling forever. A Child can **park** at a safe point, yielding its execution permit, and **wake** on a relevant durable event. Existing resource governance decides which reservations remain.

One subtle race occurs when a reply arrives between “there is no message yet” and “register this waiter.” The waiter and message check need a coherent durable convention. A notification is a hint to inspect the original facts, not the facts themselves.

## 8. The Difficult Part Was Recovery, Not Eloquence

A useful failure test stops the process at an awkward moment: the message has been saved, but the recipient has not consumed it.

| Crash boundary | What is established | Safe recovery behavior |
| --- | --- | --- |
| Before send commits | Proposal exists; no accepted receipt | Do not invent a successful send |
| After commit, before notification | One durable message receipt exists | Wake for that message; do not create another |
| Request sealed, dispatch outcome unknown | Request identity exists; external effect unknown | Preserve uncertainty; do not assume replay is safe |
| Recipient request actually submitted | Message entered a real model request | Preserve its consumption identity and round debit |

This is **idempotency**: retrying the same operation must not duplicate its business effect. Message identity must bind the actual sending action, not only a text hash; identical words in two rounds can be two distinct acts. Nor can an external model provider always guarantee exactly-once dispatch after a crash. [1]

### Real failure: the notification arrived, but recovery failed

In an isolated PostgreSQL recovery exercise, the waiting state was persisted and a wake notification arrived. Yet a second operating-system worker failed to take over.

There were two issues. The test helper had not supplied the original durable wake input. Separately, an authorization identity that had passed through PostgreSQL was compared as a JSON string. PostgreSQL **jsonb** does not preserve object-key order, so logically identical authorization objects could be rejected merely because their keys were serialized differently. [2]

We repaired the actual wake path and used structural comparison for the logical authorization object while still rejecting genuinely different identities. That does **not** justify loosening exact comparison everywhere: sealed model-input bytes and signatures have their own identity requirements.

**Notification delivered does not equal task recovered. Equal-looking data does not imply a correct identity check.**

### Real failure: the words arrived, but provenance became “unknown”

Another issue appeared when a public peer message reached downstream processing, but its original source identity could not be reused by a subsequent computation.

The model-facing projection intentionally omitted some Host-only source IDs. A later check mistakenly compared that shortened view with a complete internal receipt. The fix was to verify which original record produced the shortened view, then consult the canonical receipt for legally usable provenance—not fill empty fields with “verified.”

In financial research this distinction matters enormously. A citation visible in the interface does not mean that its underlying protected data may be reused by another Child.

## 9. Peer Messages Never Grant Data or Trading Authority

Financial data has different access scopes. If Bear may read protected account material but Bull may not, converting a number from that material into a sentence does not automatically make the sentence public.

We examine both the referenced identifiers and the provenance of the complete outgoing text. When lawful sharing cannot be established, only that send is refused and the gap is recorded. We do not pretend that a few regular-expression replacements can safely sanitize arbitrary sensitive reasoning. Bear may still hand its lawful findings back to Main.

Likewise, a peer saying “execute this trade” remains model-authored opinion. It cannot become a user instruction or expand tool, source, budget or account-write authority.

**Peer opinions may influence one another; they must not rewrite one another’s permissions.**

Main ultimately synthesizes the evidence without automatic arbitration or majority voting. Averaging a proposed 10% buy and a proposed 0% buy into a 5% order would not resolve a missing covariance estimate or an unconfirmed cash requirement.

## 10. When Is a Bull/Bear Exchange Worth the Extra Cost?

As of October 24, 2026, bounded Peer dialogue had scoped engineering evidence for message exchange, waiting, and recovery, plus limited real-model interactions. **This does not establish that Bull/Bear discussion improves investment quality.** It may spend useful resources challenging one decisive premise—or spend them producing repeated opinions.

Before starting an exchange, ask three things: **Is there a falsifiable claim that could change the decision? Can Bear challenge it using the same eligible evidence? Did the original proponent actually receive and answer that challenge?** A basic management-fee lookup does not need a debate.

The engineering constraints remain essential: preserve real message receipts, provenance, and recovery identity; do not upgrade one model's words into another's permissions or fabricate missed exchanges during recovery. A local failure need not erase independent lawful findings Main can still deliver.

**The product worth building is not “one Agent for and one against.” It is an investment reason that can be challenged, answered, revised, and later audited against its actual evidence.**

---

### Sources and further reading

[1] AWS Builders’ Library, [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/). The design principle does not imply that model providers offer identical guarantees.

[2] PostgreSQL, [JSON Types](https://www.postgresql.org/docs/18/datatype-json.html). Logical JSON object identity must not be confused with byte-for-byte string identity.

For the foundation, see [Subagents: from context isolation to specialized collaboration](/en/articles/agent-subagent-context-specialization). Next: [Investment research, multiple perspectives, and falsifiable theses](/en/articles/investment-perspectives-and-thesis-falsification). Explore the [ETF Agent article collection](https://github.com/hpoenixf/eff-agent-article); Stars are welcome.
