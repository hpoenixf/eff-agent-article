---
title: "Revoking a Document: Why an Agent's Old Answer Can Still Reveal It"
description: "Rechecking authorization at disclosure, preventing first-stream leaks and separating historical hiding from retention deletion."
---

# A Document Was Revoked. Why Can an Agent's Old Answer Still Bring It Back?

> **Historical mechanism note (October 20, 2026):** This article revisits a revocation/publication race from September 2026. Authorization and publication responsibilities were later redesigned. The then-current solution and RED/GREEN evidence are **not** a claim that today's system uses the same publication-denial contract. See the [current architecture guide](/en/architecture) for the ownership boundaries.

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

The check adds work at publication time, but avoids treating two unsynchronized stores as equally “latest.”

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

The retrospective retained targeted before/after evidence:

- A generated first SSE response previously escaped revocation; after commit-time revalidation, protected content was blocked.
- Publication and concurrent approved-index changes used one logical commit order, with explainable outcomes depending on which committed first.
- Explicit retention revoke was tested separately from ordinary scope-denied and unknown cases. “Cannot currently show” must not be silently upgraded to “permanently erase.”
- The same historical window recorded **371 provider-free offline test files and 2,860 passing tests**, plus **7 isolated-PostgreSQL files and 39 passing tests**. These numbers are historical engineering records, not tests rerun for this translation.

Larger RAG completeness and quality evaluation remained open despite those figures. Actual-source evaluation, end-to-end quality and formal closure still had outstanding work; a September 14 follow-up live experiment also left failed screening outcomes. **Passing a disclosure-authorization contract does not prove high-quality financial knowledge retrieval.**

The distinction matters because one system may effectively prevent revoked text from leaking while still failing to retrieve enough good evidence. Those goals need independent verification.

## 6. Why This Deserves Its Own Design Discussion

We had already discussed citations, Publication and runtime authorization. This example isolates a different question:

**When protected knowledge moves from allowed to revoked, how does that change remain effective across retrieval, first publication and historical redisplay?**

The answer is neither “the model should be more careful” nor “add another source allowlist.” Retrieved content, approved source index, publication time and replay must all respect current eligibility, while hiding and deletion remain distinct effects.

For question answering over public, immutable documents, this engineering complexity may be unnecessary. For agents reading revocable, revisable and account-scoped content, however, **successful retrieval proves authorization at read time—not permission to publish forever**.

## Source and Validation Limits

This account draws on the September 12, 2026 RAG revocation and publication-ordering review, original Financial Knowledge Evidence records, and the original change's full acceptance status and remaining work. Its public discussion describes observed mechanisms only; it does not certify overall RAG quality, improved investment outcomes or production deployment.

**Public-version note:** Private project specs, tests and logs referenced by the original manuscript are not distributed with this article. We retain the dated examples and bounded claims without representing private tests as publicly reproducible evidence.
