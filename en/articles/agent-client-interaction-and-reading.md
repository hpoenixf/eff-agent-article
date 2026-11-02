---
title: "An Agent Client Is More Than an SSE Renderer: Presenting a Research Task Correctly"
articleMetadata:
  author:
    name: "hpoenixf"
    url: "https://hpoenixf.com/about"
  image: "https://hpoenixf.com/eff-agent-article/visuals/en/a25-client/m-boundaries.svg"
description: "From message ownership and stream/history reconciliation to task controls and source inspection, the client keeps user actions and visible results attached to the same research task without recreating execution or publication authority in the browser."
readingBrief:
  takeaways:
    - "The client can own drafts, focus and disclosure state, but admission, cancellation, publication and access must be established by the responsible server-side facts."
    - "Once concurrency, refreshes and revisions are possible, update views by conversation, Run and content identity—not by the last message or event arrival order."
    - "Live previews and history reads should converge on one visible answer; stale revisions must not overwrite newer ones, and caches must not bypass current access checks."
    - "Source inspection, content revisions and task controls all need precise targets; showing the right original material does not certify a conclusion."
  appliesTo:
    - "Agent applications with streaming answers, persisted history or background research that need stronger client interaction and state management."
    - "Frontend and full-stack developers investigating crossed answers, disappearing content, misleading control receipts or incorrectly bound citations."
  notFor:
    - "Building a complete Agent backend from scratch, or treating the public teaching repository as an installable implementation of the full chat product."
---

# An Agent Client Is More Than an SSE Renderer: Presenting a Research Task Correctly

A user submits a fund comparison and text starts appearing. They ask a separate terminology question, refresh the page, open a citation when they return, and finally decide to stop the comparison that is still running.

Each action is ordinary on its own. The difficulties appear when they form one interaction: which question should a late answer appear under? Can a history response overwrite a newer revision already on screen? After the user clicks Stop, should the interface say “Stopping” or immediately announce “Stopped”?

**The central job of an Agent client is to keep user actions, task progress and research results correctly associated.** Server-sent events, or SSE, provide one way to transport updates. Receiving strings in the browser does not by itself mean a research task has been presented correctly.

In ETF Agent's responsibility map, the client owns interaction and reading. This article uses existing client mechanisms and published engineering records to explain that responsibility. Its acceptance scenarios are design checks, not tests newly executed for this article. The full product client and the independent Open ETF Agent teaching implementation also have different scopes.

![Local interaction, task facts and content facts have different owners](../../visuals/en/a25-client/m-boundaries.svg)

*Responsibility sketch: respond promptly to interaction while reading task state and content eligibility from their original facts.*

[Open the full-size vector figure](../../visuals/en/a25-client/m-boundaries.svg)

## 1. The client needs state—but cannot declare facts owned elsewhere

“Do not build another state machine in the frontend” can sound like “the frontend should not have state.” In practice, the opposite is true. Drafts, dialogs, scroll position, the selected research task and pending button actions all need explicit local state.

The problem is **using that local state as a substitute for the task's actual state**.

Clicking Send can immediately show that a message is being submitted. Whether a research task has been created depends on admission. Clicking Stop can disable repeated clicks and show a pending request. Closing the network connection, however, does not establish that the original research has stopped. The client can open a source panel and move focus into it; opening that panel cannot decide which material the current user is entitled to read.

These responsibilities may share a page, but they should not share one undifferentiated decision:

| Visible interaction | What the client owns | What the interaction cannot establish |
| --- | --- | --- |
| Compose and send | Preserve the draft; present submission and failure states | The message was admitted or a task was created |
| Control a task | Target the specific task; send the action; display its receipt | Sending the request means the action has finished |
| Update the answer | Reconcile the correct revisions of the same content; preserve reading continuity | Visible text has already been durably saved |
| Reopen history | Read the original result under current access rights | Cached content still carries permission to read it |
| Inspect a citation | Present authorized material, its version and its limitations | A citation certifies the conclusion |

In the existing architecture, answer publication, conversation events and historical delivery, source access, and citation eligibility each have their own responsible components. The client consumes those facts and organizes an operable reading interface; it does not reassess publication eligibility or certify research conclusions.[1][2]

This boundary does not diminish frontend engineering. It gives the frontend clear ownership of **interaction quality**, rather than another execution record that can drift from the server.

## 2. When answers can finish out of order, “the last message” is no longer an identity

A prototype with one question, one connection and one answer can route every increment to the “current assistant message.” That is understandable while execution is strictly serial.

Users need not follow that model. They can start a long research task and then ask a short question. The short answer finishes first; the original research publishes a partial result later. The newest incoming answer does not necessarily belong to the last question on screen.

The interface therefore needs three relationships: which execution owns the original question, which execution owns the answer, and which content object owns each published part. A Run means **one admitted task execution**, not the entire conversation.

ETF Agent's published concurrency work records a revealing failure. The page created a temporary answer row, and a subsequent history read replaced it with a persisted message. Streaming updates still targeted the old temporary ID, so later answer content lost its destination. The repair was to follow the original Run to its current message, not to make another copy of the answer.[3]

Two implementation constraints follow.

First, screen position cannot serve as business identity. An array index, the last bubble or the currently open panel should not determine event ownership. Even when presentation order changes for readability, an answer must retain its relationship to the question it answers.

Second, replacing a temporary UI identity with a persisted identity requires a routing handoff. A history refresh does more than replace a component: it also changes the destination for later increments, stop actions, errors and source details.

The same principle applies to drafts that have not been successfully submitted. Drafts need at least account and conversation boundaries. A late response from conversation A must not restore its text into conversation B. An acknowledgment for an earlier message must not clear newer text the user has since typed.[3]

![Long research and a short question retain separate task identities](../../visuals/en/a25-client/m-identity.svg)

*Identity sketch: completion order can change; questions, answers and controls must retain their targets.*

[Open the full-size vector figure](../../visuals/en/a25-client/m-identity.svg)

## 3. Live events and history reads reconcile the same answer

A live stream answers “What is happening now?” A history read answers “What can currently be retrieved again?” Their responses can interleave; they should not maintain unrelated copies of the answer.

MDN's SSE documentation describes event types, event IDs and reconnection. Those transport features do not define an application's content revisions, access rules or history-reconciliation contract. Whether a client uses native `EventSource` or another streaming mechanism, content identity still needs an application-level definition.[4]

For an answer part, the important facts are its Run, its content-object identity and its revision—not the number of chunks received. Revision numbers have meaning within their own object's contract; versions from unrelated answers cannot be compared globally.

Suppose the page already shows revision two of answer part P. An earlier history request now returns revision one. Arriving later must not make the old content replace the new. Conversely, when a reader explicitly opens historical revision one, the client should not silently upgrade that view to the current revision.

**Reconciling a current view and browsing a historical version are different user actions.**

Another subtle interval lies between preview and persistence. Text is already visible, its durable receipt has not arrived, and a history read temporarily returns no body. Clearing the screen produces a disappearing answer; treating the preview as saved invents a delivery fact.

A suitable approach is to retain the visible preview temporarily within the same viewing scope and Run, under exact identity and content checks, while performing bounded read-only reconciliation. Only a matching persistence fact can confirm durable content. Conflicting versions or identities cannot be merged because the wording looks similar.

An overriding boundary remains: **retaining a preview must not defeat current access rights**. Account changes, explicit access denial and revoked material are not ordinary history-read delays. A cache is not a permanent authorization.[1][2]

Concentrate reconciliation in a clear view-projection layer instead of scattering it across message, history and source components. Rendering components should receive an identity-aligned reading model, not independently guess ownership again.

![Reconciling current revision two, late revision one and a matching persistence receipt](../../visuals/en/a25-client/m-revisions.svg)

*Reconciliation sketch: compare revisions of the same content object. Explicit access denial takes priority over preview retention.*

[Open the full-size vector figure](../../visuals/en/a25-client/m-revisions.svg)

## 4. Connection, task and answer states need different meanings on screen

One global `loading` flag cannot describe a long research task.

The connection may drop while research continues. The task may fail after a useful partial answer was saved. Execution may end while the client is still waiting for a history view to catch up.

None of this requires exposing a dozen internal status badges. The interface needs only the distinctions that affect the user's next action.

When the connection fails, it can say that updates are temporarily unavailable and that the page is rereading progress. It should not immediately label the research a failure. When part of the result is available but the remainder is unfinished, preserve the content that is still authorized for display and identify the missing scope. A failed read should communicate that the latest state cannot currently be confirmed, rather than presenting stale content as live.

Stopping follows the same principle. It generally affects subsequent work; it does not undo actions that already occurred or delete a saved answer. ETF Agent's asynchronous-delivery work treats stopping, partial publications and later historical reads as separate concerns.[1]

At the component level, these distinctions need appropriate data sources. At the user level, they may fit into one accurate sentence. **Internal distinctions should reduce misleading UI, not make users learn the implementation vocabulary.**

## 5. Sending, amending and stopping need their own receipts

During research, a new message may ask an independent question, amend the original task or answer a clarification. Stopping a task is a separate explicit control action.

Where the existing context identifies the target, carry that target directly. Clicking “Add a requirement” inside a research panel should make the composer name the task being amended. There is no need to ask language interpretation to guess the target again. An ambiguous amendment from the general composer may require clarification.[3]

Receipts should describe what actually happened. “Requirement received” establishes admission. “Passed to the research task” establishes a later handoff. “Report updated accordingly” needs support from the result. Collapsing those stages into “Done” creates misleading reassurance.

Repeated clicks and retries also need a division of responsibility. The client can coalesce pending clicks and prevent rapid repetition, but reliable duplicate recognition belongs to the server contract. A browser boolean cannot prevent duplicate effects across refreshes and reconnections.

Draft handling needs equally precise acknowledgment. A receipt should affect the edit state associated with the submission it confirms. Failure can preserve that draft; success must not erase text composed afterward.

This does not require an elaborate approval interface. A clear task label, an accurate receipt and an understandable recovery action are often enough.

## 6. The answer, its citations and the reader's position form one result

Preserving text is not sufficient. The relationships the reader sees must also remain correct.

When an answer moves from revision one to revision two, its citations must belong to revision two. A new conclusion must not open an old revision's inspection material. Two passages containing the same number do not authorize the browser to infer that they refer to the same calculation.

ETF Agent's citation design distinguishes source identity, citation correspondence and whether the material actually supports the claim. The client should provide an inspection path, not render a citation icon as a “verified correct” badge.[2]

The most useful source details usually answer a few questions: what was actually read, which version was it, was it truncated or missing context, and how can the reader open the original source? The current webpage and the material retained at research time also need distinct labels.

Several interaction patterns are reasonable. Short material can expand in place; longer material can use a side panel or dialog. What matters is operation by keyboard and touch, rather than hiding all content in a hover tooltip. A disclosure should expose its expanded state. A modal dialog needs appropriate focus entry, closing behavior and return to its trigger. W3C's Disclosure and Dialog patterns define different conventions; their interaction semantics should not be mixed indiscriminately.[5][6]

Reading position deserves its own design. When someone has scrolled upward to inspect a citation, incoming text should not repeatedly pull them to the bottom. Preserve their position and offer a “New content” entry point. If a revision changes an open detail view, retrieve the correctly bound details or explain that the content has changed; never silently combine versions.

These are recommended reading-interaction requirements. The fact that one source dialog opens does not establish acceptance of every combination of streaming revision, focus transition and mobile device.

## 7. Test the handoffs most likely to become misaligned

Checking only that an answer appears after sending a message misses the most consequential client problems. More revealing checks deliberately interleave events and examine what the user ultimately sees.

The following are proposed acceptance scenarios, not a list of passed tests:

| Scenario | What to observe |
| --- | --- |
| A later short question finishes first; the original research publishes afterward | Each answer remains attached to its question; controls do not cross tasks |
| New content arrives before an older history response | The current view does not revert or duplicate the answer |
| A preview is visible before its persistence receipt arrives | The same content becomes confirmed without disappearing or claiming premature persistence |
| Research is stopped or fails partway through | Subsequent state is accurate; already delivered content remains readable when authorized |
| An old response arrives after switching accounts or conversations | Drafts, answers and sources do not enter the wrong scope |
| The answer is revised while a citation is being inspected | Inspection material stays version-correct; keyboard operation and reading can continue |

Deterministic tests can exercise data reconciliation. Actual Tab order, focus restoration, scrolling and narrow-screen layout need browser observation. Passing one layer does not certify another.

Nor should frontend tests certify the research conclusion itself. Their goal is to establish that **the content users actually see and operate belongs to the correct task and revision, within the scope currently allowed for display**.

## 8. Which part can readers reproduce in the public code?

Open ETF Agent includes local readback examples for reports, sources and attachments. They illustrate the foundational boundary that reopening a saved result should not regenerate it. The [historical v0.6 fixed-commit README](https://github.com/hpoenixf/open-etf-agent/blob/7480b656b18192e6d6b44aab65255b970d58e6f8/README.md) records that implementation and its limits. For ongoing use, consult the [module guide on current main](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/module-guide.md#v06-read-download-and-verify-over-real-http).

The following steps follow the current-main documentation read on November 2, 2026. They require Node.js 26.8.1–26.x and npm. Dependency installation may access the network; the default example uses synthetic material and needs no model key:

```bash
git clone https://github.com/hpoenixf/open-etf-agent.git
cd open-etf-agent
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run demo -- --case document-compare
# Replace run-YOUR_ID with the actual Run directory name printed above.
npm run serve -- --run runs/run-YOUR_ID
```

According to the public guide, the example produces a report and records in a separate Run directory. The local reader prints its address and exposes registered reports, source windows and associated attachments. These are documented instructions; the example was not re-executed while preparing this article.[7]

The reader listens only on the local loopback address and has no public-facing authentication. It is a local reading example, not a website ready to deploy publicly.

This public implementation is not the complete product client. A local read service does not establish that multi-account chat, foreground concurrency, SSE recovery or every product interaction has been publicly delivered. It offers a starting point for understanding result identity and reading boundaries before applying those constraints to a client of your own.

Return to the opening sequence: the user asks, keeps talking, refreshes, inspects a source and stops the original research. A reliable client makes those actions connect naturally without requiring the user to understand execution internals. Its engineering value lies in those ordinary-looking handoffs where identity and intent can most easily become misaligned.

For the end-to-end user journey, see the companion article, [Agent Client Interaction Panorama: From Asking a Question to Understanding Results and Continuing Research](./agent-client-interaction-panorama.md).

## References and further reading

[1] ETF Agent, [Research Is Still Running, but the User Has Left: Delivering Real Results on Time](https://hpoenixf.com/eff-agent-article/en/articles/agent-asynchronous-research-time-bound-delivery).

[2] ETF Agent, [Agent Citation System Design: Source Issuance, Version Binding and Independent Review](https://hpoenixf.com/eff-agent-article/en/articles/ai-citations-do-not-prove-reliability).

[3] ETF Agent, [Background Research and Concurrent Foreground Interaction](https://hpoenixf.com/eff-agent-article/en/articles/agent-background-research-collaborative-experience).

[4] MDN, [Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events). Referenced for transport and reconnection semantics, not as an application-level recovery protocol.

[5] W3C WAI-ARIA APG, [Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

[6] W3C WAI-ARIA APG, [Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

[7] Open ETF Agent, [current README](https://github.com/hpoenixf/open-etf-agent/blob/main/README.md) and [module guide](https://github.com/hpoenixf/open-etf-agent/blob/main/docs/module-guide.md). Code and documentation consulted on November 2, 2026; main is a moving entry point.
