---
title: "Revoking a Document: Why an Agent's Old Answer Can Still Reveal It"
description: "Rechecking authorization at disclosure, preventing first-stream leaks and separating historical hiding from retention deletion."
readingBrief:
  takeaways:
    - "This historical case shows that permission to retrieve does not authorize later streaming or redisplay; replay filtering cannot retract bytes already delivered to a browser."
    - "Current eligibility checks and disclosure commits need one explainable ordering; the historical design used a committed approval index instead of competing sidecar and database authorities."
    - "Temporary invisibility and cleanup under explicit retention revocation are different effects; unknown eligibility must not permanently erase history or invalidate independent public explanations."
  appliesTo:
    - "RAG over revocable, revisable or account-scoped material, especially races before first delivery and authorization during historical redisplay."
  notFor:
    - "Question answering over permanently public immutable documents, or treating the historical fix as current architecture, better retrieval quality or recall of already delivered content."
---

# A Document Was Revoked. Why Can an Agent's Old Answer Still Bring It Back?

> **Historical case:** This article revisits a September 2026 revocation/publication race. Authorization and publication responsibilities have since changed; the solution discussed here is not necessarily the current design.

> **Reading path:** Module Deep Dives with architectural implications. This concerns when protected knowledge may be disclosed, not generic vector-search recall quality.

When introducing document authorization to RAG, an obvious design is to check permissions before retrieval. If allowed, read the excerpts; after the model finishes writing, present the answer and citations.

But a September 2026 revocation test of our ETF Agent exposed a more immediate vulnerability: **historical replay could already hide revoked material while the first streamed answer could still release the very same content.**

A change from “readable” to “not disclosable” cannot be enforced solely at retrieval. The model may already have the excerpt; a historical snapshot may already be persisted. The important moments to recheck are **the moments when protected content becomes user-visible**.

## 1. Reading a Source Then and Publishing It Now Are Different Decisions

Imagine an account-restricted research report. In the morning, the agent reads V1 and drafts an analysis quoting it. In the afternoon, the report is revoked or replaced. The user reopens the conversation.

Remembering that morning's retrieval was authorized is not enough. Old text might leak from a queued stream delta, a prepared answer segment, a recovery snapshot, historical aggregation or an exported attachment.

Three time coordinates must stay separate:

| Moment | Question that must be answered | What cannot substitute for an answer |
| --- | --- | --- |
| Retrieval and reading | Which document and revision may this account access now? | A search-result title |
| Answer commit | Is the dependent source still eligible for disclosure at this moment? | Permission granted minutes earlier |
| Historical redisplay | Can this user still see the stored segment now? | A receipt for the original successful commit |

This does not imply rerunning web search every time. Source identity, version, content hash, policy/auth revision and assessment validity window are distinct. Eligibility should be revalidated through their authoritative records.

## 2. The Real RED: Replay Denied Content, but First Delivery Did Not

An earlier governance mechanism could hide revoked material during some historical reads, creating the appearance of proper protection.

A September 12 test inserted revocation between generation and publication. The model had already produced a knowledge-dependent paragraph; authorization changed before commit. The original path could still emit that protected excerpt in the first SSE stream or committed answer body. A correct replay filter would arrive too late.

The fix did not ask the model to identify confidential sentences. Knowledge-dependent answer segments had to recheck the current source binding before commit. If the resolver returned denied, unknown, error or a mismatched revision, protected text could not enter the first delivery or Answer Segment. The system retained a diagnostic explanation for the eligibility change, while independently authorized material could continue to be published on its own merits.

A hard physical limit remains: **preventing later disclosure cannot recall bytes already delivered to someone's browser.** Correctness on a future replay is not a sufficient remedy for a first-delivery leak.

## 3. Why One More Pre-Publish Check Still Wasn't Enough

The first fix addressed authorization changing between generation and commit, but a race remained.

Suppose a sidecar file states the current permission, while an approved index in the database also holds a permission record. The publication thread reads “allowed” from the sidecar; another thread immediately revokes access and updates the database; the answer is then committed.

Which state was current?

Rather than allow the file and database to serve as competing authorities, we chose the **committed approved knowledge index** as the authority for current publishable source identity. The sidecar became an input awaiting validation and synchronization, not an independent source of truth.

For transactions publishing protected material, checking and committing must participate in an understandable locking and commit order against the same index record. Before commit, validate current policy/auth revision, document version/hash and assessment validity. If revocation commits first, publication is denied. If publication commits first, subsequent revocation can block future disclosure, but cannot retrospectively retract bytes that were already sent.

The historical permission index and answer commit already lived in the same database, so they could contend on the same record lock. That is why we chose the index. The cost is publication waiting for checks or concurrent updates. Editing a sidecar no longer makes revocation immediately effective: the index transaction must commit first. This does not provide an atomic transaction spanning the filesystem and database.

When several products share complex organization and document relationships, a dedicated authorization service can avoid duplicating relation logic. [OpenFGA’s consistency modes](https://openfga.dev/docs/interacting/consistency), for example, distinguish cache-eligible low-latency queries from HIGHER_CONSISTENCY database reads that skip the cache. Caching is disabled by default; enabling it introduces the stale-decision consideration. This controls the freshness of the authorization read. The application must still account for changes between an “allowed” response and its actual disclosure commit. In this historical case, the explainable order came from the existing database boundary. Moving authorization into a separate service would require a separately designed and verified handoff; changing a query mode alone does not establish it.

**The crucial property is not the number of permission checks. It is whether the check and the disclosure effect share one explainable ordering.**

## 4. Temporarily Inaccessible Is Not the Same as Permanently Deleted

After revocation, what should happen to historically stored content?

At least two states matter.

An explicit **retention revoke** carries a cleanup effect. Displayable snapshots, affected bound segments and aggregate views may require treatment so that another path does not reintroduce the content.

By contrast, an inaccessible source, a scope denial, an expired assessment or unknown read eligibility does not establish that a permanent retention revocation occurred. Those states must not silently delete original historical facts.

Turning every unknown into permanent deletion damages recoverability and auditability. Merely hiding an explicitly revoked persistent copy, however, might let an old summary reappear later.

We therefore separated **not currently displayable** from **cleanup required by an explicit retention-revocation contract**. Different authoritative facts drive those consequences.

This is especially important for an agent that uses public documents, authorized internal research and account-specific data together. Losing eligibility for a private source should not erase independent public explanations. Conversely, a valid public citation cannot authorize private material.

## 5. Evidence Beyond the Architecture Diagram

The important test is not another collection of allowed/denied examples. It inserts permission changes into two easily missed windows:

- A generated first SSE response previously escaped revocation; after commit-time revalidation, protected content was blocked.
- In isolated PostgreSQL, the application guard prepared an allowed response while another connection changed the index. The old transaction still committed the excerpt: calling a resolver inside a transaction was not a shared consistency boundary. After the fix, an earlier revocation denied publication; in the reverse barrier, publication held the lock and revocation waited until it committed.
- Explicit retention revoke was tested separately from ordinary scope-denied and unknown cases. “Cannot currently show” must not be silently upgraded to “permanently erase.”

Controlled revocation and publication checks did not establish the quality of the full RAG system. Later real-source exercises still had unsuccessful screening outcomes. **Preventing unauthorized disclosure and retrieving useful financial evidence are different objectives.**

The distinction matters because one system may effectively prevent revoked text from leaking while still failing to retrieve enough good evidence. Those goals need independent verification.

## A Local Experiment: Saved Before Does Not Mean Readable Now

The historical case above concerns the full system. To observe the same principle on a smaller surface, use the [Open ETF Agent v0.16 fixed qualified source](https://github.com/hpoenixf/open-etf-agent/tree/35f244f2e06da447c110325d2ac5a5c39f36e842). It operates on two public synthetic documents, without private files or a model service. The original Session, source identity, results, report and Reader form the chain; it does not introduce another authorization platform.

The experiment searches, reads original pages and produces a CSV and report. Explicitly revoke one document, then read the same Publication or attachment again. **A successful save records a past effect; a later disclosure must respect the current eligibility of its dependencies.** Document information already disclosed by a search hint remains a dependency even if the page body was never subsequently acquired.

Check out that fixed commit in a new directory, install dependencies using its README, then run:

```sh
node src/session-cli.mjs init-documents --session ./test-output/revocable-demo --profile document-revocation@1
node src/session-cli.mjs start --session ./test-output/revocable-demo --profile document-revocation@1 --case revocable-rag
```

Keep the returned `runId`. Follow the [instructions at the same snapshot](https://github.com/hpoenixf/open-etf-agent/blob/35f244f2e06da447c110325d2ac5a5c39f36e842/docs/revocable-documents.md) to read the Publication, report and CSV without revoking yet. The comparison below then revokes the document and checks current eligibility through the same mediated content path. Original source and report bytes remain intact, and initialization cannot silently regrant access. Control metadata can locate the original Run; it is not permission to disclose its content.

The shortest comparison uses the [original CLI owner](https://github.com/hpoenixf/open-etf-agent/blob/35f244f2e06da447c110325d2ac5a5c39f36e842/src/session-cli.mjs) to read the same Publication twice. Replace `RUN_ID` with the returned identity: the first read should succeed and the post-revocation read should be refused, not replaced by a new answer.

```sh
node src/session-cli.mjs publication --session ./test-output/revocable-demo --profile document-revocation@1 --run RUN_ID
node src/session-cli.mjs revoke-document --session ./test-output/revocable-demo --profile document-revocation@1 --document atlas-a --expected-revision 1
node src/session-cli.mjs publication --session ./test-output/revocable-demo --profile document-revocation@1 --run RUN_ID
```

This fixed source retains an [independent install, build and revocation-readback receipt](https://github.com/hpoenixf/open-etf-agent/blob/35f244f2e06da447c110325d2ac5a5c39f36e842/docs/verification/v016-revocable-rag.safe.json). Installation used an existing official cache, not a fresh network download; synthetic documents and scripted actions made no external model calls. Source qualification remains distinct from publication to main, a tag or a formal Release. It governs later disclosure through these paths, not direct filesystem access by the same operating-system user, and cannot recall content already delivered. It demonstrates revocation across a consumption chain, not retrieval quality or a complete enterprise permission system.

<span id="_6-why-this-deserves-its-own-design-discussion"></span>

## 6. Choose the Authorization Contract Before Reusing the Design

The transferable lesson is not “check the ACL everywhere.” Identify the effect, the moment of authority and the owner of that authority first.

Current ETF Agent execution, recovery and replay of the original Run’s results retain the recorded source grant; a later source ACL change does not shrink that Run. A new Run needs its own admission. Separately applicable historical-display or retention restrictions still govern the affected protected excerpt. Failure to enrich an optional source card is not such a restriction and must not erase independently lawful body text. The September per-segment current-eligibility scheme is therefore historical, not a wholesale recipe for today’s same-Run path.

Choose according to the contract. For permanently public immutable material, preserve identity and revision. If permission lasts through a defined task boundary, record and inherit that grant. If revocation must take effect at disclosure, give current eligibility and the disclosure effect an explainable order. All three need explicit viewer scope, source dependencies and retention rules; “stricter authorization” does not resolve their different meanings.

The final question is: **when an old answer appears again, can the system identify the permission, version and display effect that justify it, rather than merely say retrieval once succeeded?**
