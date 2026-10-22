---
title: "When a User Says 'Forget It': Why a Failed Answer Cannot Undo a Committed Forget"
description: "Application memory, durable effects, supersession receipts and the limits of cross-session validation."
---

# When a User Says “Forget It,” Why Can't a Failed Model Answer Undo the Forget?

> **Reading path:** Module Deep Dives, with links to architecture and engineering judgment. This article concerns persistent effects in application-level long-term memory, not forgetting information encoded in model weights.

In October 2026, we performed a real-path acceptance test of long-term memory in our ETF Agent. The user explicitly requested that one memory be forgotten, and we examined the agent's subsequent behavior. The result revealed an uncomfortable split: **the forget operation had already committed to the database, but the next model answer failed.**

Judging only by the chat window, the action looked unsuccessful. Judging by the persistence records, the forget had happened. The most dangerous response would be to treat the later answer failure as proof that the earlier operation never took place—and execute the side effect again.

That experience clarified Memory ownership. A model may interpret the user's intention and propose what to remember, but **whether a memory was saved, corrected or forgotten must be established by durable application records and effect receipts**. Whether an answer was delivered, and whether a later session consumed the memory, are separate questions.

## 1. We Did Not Need to Invent Memory from Scratch

It is tempting to describe long-term memory as storing preferences and retrieving them later using embeddings. Yet examining the existing ETF Agent code showed that much of the foundation already existed: memory candidates and confirmation states; categories and scope; family versions; expiration and forgetting; a PostgreSQL repository; management APIs; bounded recall; and within-family deduplication.

A baseline review on September 30, 2026 exposed the real gap: **at that point, production Research Runtime was not actually consuming previously recalled memories through the normal research path**. Having memory-management functionality did not mean the next research turn used it. The work was not another database integration. It was reconnecting existing application facts to Native Research.

We kept two responsibilities explicit.

The application memory repository owns current facts: which account scope a record belongs to, when it was confirmed, which revision is active, what it supersedes, and whether it was forgotten. A semantic adapter may propose candidates or provide retrieval hints. Its similarity ranking cannot reactivate a revoked record.

This is not merely an access-control distinction. “I prefer long-term holding” and “I currently own these funds” are different kinds of facts. The former may be a corrigible preference. The latter must come from authorized current holdings. Long-term memory must not impersonate a live portfolio ledger.

## 2. Three Moments Cannot Share One “Success” Flag

Consider a simplified sequence. A user first states a preference for low turnover, later says they need to hold more cash for the next six months, and eventually asks the agent to forget that temporary constraint.

**Moment one: save or correct.** After an explicit request, the system validates scope and the relationship to previous revisions, then confirms the database commit through a durable effect receipt. The model's “Okay, I remembered that” is not proof of persistence.

**Moment two: research in a subsequent turn.** A new session must check current scope, active revision and the continued eligibility of the source before including the memory in the actual model request. A database hit is not proof that the content was inserted. An answer coincidentally repeating the same words is not proof that Memory was consumed.

**Moment three: disclosure after forgetting.** Historical summaries, saved reports and derived indexes may still contain the former text. They may preserve historical facts, but previous visibility is not permission for future use.

There is no universal memorySuccess flag that answers all three questions. Commit, later consumption and current revocation each demand their own evidence.

## 3. The Real Failure: Forget Committed, Answer Did Not Finish

Our October 9 Memory acceptance run preserved a concrete counterexample: the forget operation committed successfully; the model then failed to reach the expected final state, and a planned sixth-session follow-up query was never performed.

If the whole scenario is treated as one all-or-nothing pipeline, this becomes “forget failed.” That conclusion both denies an already committed effect and may push recovery code to repeat a side effect.

We therefore separated the checks: Did the commit receipt exist? Did the target record's eligibility change? Did the subsequent request actually contain approved memory? Could post-forget history reintroduce the old record?

Two conclusions must coexist: **controlled local cross-session paths produced positive evidence, but the failed live run did not retroactively become successful.** An unexecuted sixth query cannot be inferred from database state.

This caution has a direct operational consequence. Recovery behavior must be based on effects that actually occurred, not on the fluency or failure of the next answer.

## 4. The Opposite Mistake: Revoking Old Text Also Hid the Fact That It Was Corrected

Suppose Memory V1 has been replaced by V2. V1's body is no longer eligible for current reads.

The model may nevertheless need to say: “Your correction was committed; the previous version is no longer active.” That statement relies on **the legitimate receipt for a completed correction**, not on reopening V1's old summary.

In an October 14, 2026 review, we found that historical source projection could confuse these two things.

One mistake hid everything associated with V1, including the valid correction receipt. The more dangerous mistake treated the presence of a correction receipt as renewed authorization to expose V1's body.

We did not add a broad “allow if a receipt exists” exception. The historical identity of V1 may be used solely to explain that a correction **occurred** when the Memory owner has a visible, complete, successful update receipt and the family identity, exact supersedes relation and increasing revision all agree.

The old body itself remains unreadable. If the receipt is missing, inaccessible, generically revoked, or insufficient to establish current eligibility, the reader must continue to deny access or preserve an unknown state.

Eighteen Memory-history test cases later passed for these exact source relationships and denial paths. They do not guarantee the wording of every future natural-language response.

## 5. Why We Did Not Build Another Memory Execution Engine

We considered three broad directions.

The simplest is to let the model summarize preferences and store them in the prompt. That is quick, but corrections, revocation and scope drift with the conversation text.

A second approach delegates both storage and final eligibility to an external semantic-memory engine. Such an engine can work well for candidate retrieval, but letting it independently compete with the application database for current authorization and revision authority creates two versions of “latest memory.”

We chose to reuse the existing application repository. Explicit saves, corrections and forgets commit through normal research tools. Background automatic learning runs separately after the answer reaches its terminal state. Automatic proposals, explicit user instructions and actual confirmation remain distinct.

This choice increases engineering work for version and source validation. It also means that when an answer fails, the system does not need to guess whether a persistent side effect happened.

## 6. What Was Actually Validated?

The first formal closure on October 9, 2026 reported **45 provider-free offline test files with 444/444 passing tests** and **7 real-PostgreSQL test files with 47/47 passing tests**, with none of the declared assertions skipped. A controlled six-session local path included authenticated HTTP, cross-session consumption, family corrections and forgetting, along with the “model failed after commit” counterexample.

These findings support the Memory contract within its declared scope. They do not establish that every live model will choose precise wording, nor do they certify optional external Hindsight integration, every Docker Analysis journey or long-term production quality. Unresolved and failed live runs remain unresolved and failed in their own records.

The most important lesson is not that an agent can remember investment preferences. It is an ownership rule:

**After a user asks to forget something, the system must establish whether forgetting happened before deciding how to answer. A later model failure cannot overturn an already committed effect.**

That complexity may not be worthwhile for a disposable one-off chat. It is a prerequisite for a long-lived, corrigible, revocable memory service.

## Source and Validation Limits

The material draws on the October 9, 2026 durable-memory and live-failure retrospective, the phase-one closure and underlying tests, and later controlled validation of corrected-memory source rebinding. These materials come from different source and date windows; they must not be combined into a single production end-to-end acceptance claim.

**Public-version note:** The private project's tests, specs and engineering logs are not published with this article. We retain the cases, their dates and bounded verification claims without presenting private validation as externally inspectable evidence.
