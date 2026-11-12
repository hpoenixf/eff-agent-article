---
title: "Why Split an Agent into Three Processes? Independent Lifecycles Without Splitting Business Truth"
description: "A field-tested architecture case study of Core API, Product API, and Background Worker: measured lifecycle isolation, foreground capacity handoff, crash recovery, and local transport identity, without claiming production SLA gains."
readingBrief:
  takeaways:
    - "Separating process lifecycles lets scheduled work continue while management and core APIs restart; this behavior was verified in controlled multi-process tests."
    - "Hosts are not new business authorities: Task, Run, Provider, Control, and Publication retain their original identity and effect rules."
    - "Queued foreground requests precede newly starting background work at the same provider bottleneck, without preempting work already running."
    - "An expired lease does not prove a worker or remote call stopped; a listening port does not prove the original product process is present."
    - "Evidence covers same-host processes, isolated PostgreSQL, and synthetic providers, not measured production reliability, latency, or cost gains."
  appliesTo:
    - "Agents that combine interactive research, scheduled-task management, and independently running background jobs."
  notFor:
    - "Simple single-call chat services or systems requiring general cross-host recovery and independent-version rolling deployment."
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Why Split an Agent into Three Processes? Independent Lifecycles Without Splitting Business Truth

In the morning, a user asks about fund fees. Later they confirm an after-market research schedule. In the evening, the research should keep running even if the product management interface is being updated. All three actions belong to the same Agent product, but they do not need identical availability conditions.

ETF Agent originally hosted ordinary research, product management, and scheduled execution in one API process. That was a sensible starting point: one startup path, one database composition, and straightforward access to the existing Runtime and model gateway. Once a scheduled study became a promise that had to survive management-service maintenance, though, deployment topology started determining product behavior. **Updating a management endpoint should not implicitly stop an accepted research job. A worker failure should not automatically bring down ordinary conversations.**

We split the application into three process hosts: Core API, Product API, and Background Worker. The substantial gain was not “more services.” It was independent lifecycles while preserving the original authorities for task admission, provider capacity, and published answers. This case study follows one scheduled fund-research task, separates observed benefits from unmeasured expectations, and explains three surprising challenges: resource priority, crash takeover, and process identity at a local port.

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/en/01-benefits-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/en/01-benefits.svg')" alt="Before the split one API process hosted core conversations, product management, and scheduled execution; after the split these lifecycles are separated while shared dependencies remain." loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>Figure 1 | Lifecycle independence is the demonstrated gain; shared database and provider failures remain possible. <a :href="withBase('/diagrams/three-host-lifecycle/en/01-benefits.svg')">Open the full-size diagram</a></figcaption>
</figure>

## 1. What actually improved? Independence, not a benchmark speedup

### Maintenance of product services no longer inherently interrupts accepted research

The decisive test did not merely assert that three ports were listening. **It held a background job in an in-flight synthetic model response, then shut down and restarted Core API and Product API separately.** With real local processes and isolated PostgreSQL, the Worker stayed alive across both API restarts. Once the held response was released, the same Task completed with one Root and one model call; the restarted Product read back the original report.

Another controlled run confirmed a scheduled task whose due time was roughly thirty seconds away, then stopped both APIs. The independent Worker later admitted the original occurrence, produced a synthetic report and application notice, and left the result readable through Product History when that service returned. **The management API was no longer a necessary runtime dependency of an already confirmed schedule.**

These are observed process and persistence behaviors using a scripted provider, not proof of a long-term production availability target.

### A product failure need not make ordinary research unavailable

If Product API fails, the user may temporarily lose schedule editing or Task History. That should not imply a 503 for a normal conversation. In an isolated experiment with Product unavailable, Core and the Web entry still completed an authenticated synthetic research task and read back its stored publication; a second account could not read it.

The reverse boundary was also tested. Product can manage schedules with Core offline when its original account and database prerequisites are available. Worker can execute previously admitted tasks without calling Core's HTTP endpoint. This changes **which processes must remain alive**, not who authorizes data or owns final results.

| Unavailable host | Capability that can remain independent | What remains affected |
| --- | --- | --- |
| Product | Ordinary research and qualified scheduled work | Schedule-management routes are unavailable |
| Core | Product management and independent Worker execution | In-flight foreground requests may be interrupted |
| Worker | Interactive conversations and previously stored results | New background executions may be delayed |
| Shared database/provider | No automatic isolation from this split | Multiple hosts may fail together |

This is a reduction in certain failure blast radii, not a claim that all faults have become isolated.

### Foreground work obtains an enforceable, narrow priority rule

An independent Worker could otherwise make interactive latency worse by starting new scheduled tasks ahead of an already queued user request. In a controlled single-provider-slot race, an existing background task continued. When it released its capacity, the registered foreground request acquired the slot; the next background task did not create a new Runtime until foreground work had completed.

The demonstrated property is specific: **a new background start yields to registered foreground demand at the same bottleneck, while already running work is not preempted or deprived of its remaining resources.** We do not have comparable production p95 latency or cost measurements.

Separate deployment units also make future adjustments to startup, operations, and resource allocation possible. This first implementation remains **one repository, one coordinated version, and shared stores**. Independent releases, autoscaling, and reduced operating costs are potential options, not verified outcomes.

## 2. Why three hosts rather than a microservice per module?

The alternatives included retaining the combined API, using Core plus one peripheral process, splitting into three hosts, or creating smaller services with separate databases. A two-host plan still tied product maintenance to background execution. A database-per-product design would have required a new cross-service consistency story for Task, Run, cancellation, and publication with no demonstrated benefit commensurate with that cost.

The result was three **deployment hosts**, not three new business owners.

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/en/02-architecture-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/en/02-architecture.svg')" alt="Web requests route to Core or Product; an independent Worker consumes durable scheduled tasks; all three retain the same original Task, Run, Control, Publication, and Provider authorities." loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>Figure 2 | Three process hosts do not create three competing owners of business facts. <a :href="withBase('/diagrams/three-host-lifecycle/en/02-architecture.svg')">Open the full-size diagram</a></figcaption>
</figure>

The shared authority beneath the boxes is the important part:

- **Core API** serves ordinary conversations, foreground research, original publication readback, and its own control candidates. It no longer installs the migrated Schedule consumer loop.
- **Product API** handles schedule definition, confirmation, pause, cancellation, and Task History. It uses existing authentication and scope rules, but does not construct an execution Runtime or expose a second ordinary-conversation endpoint.
- **Background Worker** owns scheduled execution hosting, eligible control wakes, recovery consumption, and notice work. It invokes the original Research Runtime directly rather than delegating execution back through Core HTTP.
- **Original authorities remain original.** Task owns claims and fences; Provider owns group capacity; Run owns admission, budget, and continuation; Publication owns committed content; Control and Notice retain their own receipts.

Web routes selected management endpoints to Product while ordinary conversation requests continue to Core. More processes add lifecycle checks and shared dependencies, but do not duplicate the system's source of truth.

## 3. Follow one confirmed research schedule end to end

Assume a user confirms: “After market close, inspect the disclosure changes for two funds, preserving sources and their dates.” This is a **simplified teaching task**. The verification does not establish the timeliness or investment correctness of real fund data.

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/en/03-journey-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/en/03-journey.svg')" alt="After Product saves a confirmed schedule, the API services can stop while Worker admits the due task, runs research once, stores the publication and makes it readable when Product returns." loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>Figure 3 | An end-to-end task needs durable authorization, execution, publication, and readback—not an always-on management API. <a :href="withBase('/diagrams/three-host-lifecycle/en/03-journey.svg')">Open the full-size diagram</a></figcaption>
</figure>

**Confirmation is not execution.** Product validates the authenticated Scope and stores the authorized schedule revision. A Product process exit does not erase that durable definition. Pausing the schedule changes *future* occurrences; it does not automatically cancel work already started. A controlled interval-schedule test checked an in-flight job continuing across pause, suppression of subsequent occurrences, and a later new occurrence after re-confirmation.

**Due time requires fresh admission.** Worker reads the original persistent opportunity. Task decides whether the worker can claim it. Provider regulates shared capacity before the first real model request. Seeing the same candidate in two processes cannot license two independent Runs.

**Execution retains original owners.** The existing Runtime invokes the model and tools, each effect has its own evidence, Publication commits the report, and the Notice path settles notification attempts. Retrying a notice is not permission to regenerate the research.

**Readback does not require the Worker to remain alive.** Product History finds the recorded Task and the original Publication content. The answer is not stored only in a worker's memory.

Consequently, “Core stopped,” “Product unavailable,” “user explicitly stopped this Run,” and “the schedule is paused” must never be collapsed into one Boolean lifecycle flag.

## 4. Challenge one: why did a queued foreground request lose to a new background Run?

The existing Provider coordinator already offered cross-process FIFO ordering. But the Task claim and Runtime creation happened **before** the new Run's first model request entered that queue. In a controlled failing case, one normal request occupied the only slot, another normal request was queued, and a new scheduled task still created its Native Run. FIFO itself was not broken: the system compared two different points in the lifecycle.

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/en/04-priority-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/en/04-priority.svg')" alt="With one provider slot, existing background execution continues, an already queued foreground request runs next, and a new background task waits before creating its Run." loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>Figure 4 | Non-preemptive priority applies to work not yet started; startup capacity must pass to the first Entry without reacquisition gaps. <a :href="withBase('/diagrams/three-host-lifecycle/en/04-priority.svg')">Open the full-size diagram</a></figcaption>
</figure>

A pre-start read of “is Provider busy?” is insufficient because another demand can register after the observation. A second intuitive option—reserve a slot for startup, release it, and reacquire for the first Entry—creates a gap in which other waiters can take the capacity.

The implemented path instead reuses the Task and Provider authorities. A new scheduled start waits for bounded Provider capacity **before Runtime creation**, then transfers the same authorized startup slot to the first Entry with matching Scope, Run, and group identity. Gateway still determines actual physical dispatch. Task and Recovery still determine claim validity, Run creation, and cancellation. No second priority manager or natural-language “please yield to users” policy is needed.

Two boundaries matter. An already running background job retains its lawful continuation, including completion work. An already bound or physically dispatched request with an unknown outcome cannot be made free simply because foreground demand has appeared. The priority promise is narrow: a registered foreground wait versus background work **not yet started** at the same resource bottleneck.

## 5. Challenge two: when a worker disappears, what allows takeover?

An expired database lease tells us the old worker has lost a particular durable claim. It does not establish that the old process or remote model call has physically stopped. The worker may be paused, disconnected from the database, or waiting for an external effect.

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/en/05-recovery-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/en/05-recovery.svg')" alt="After a worker crash, unbound startup capacity, bound Entry, and dispatched unknown calls have different continuation rules; proven same-host slot identity and a Task fence are needed for narrow handoff." loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>Figure 5 | An expired claim does not prove an external request has stopped; unknown effects are not replay licenses. <a :href="withBase('/diagrams/three-host-lifecycle/en/05-recovery.svg')">Open the full-size diagram</a></figcaption>
</figure>

One controlled failure exposed the opposite risk. A worker acquired Provider startup capacity, then was killed before binding its first Entry. Conservatively retaining the slot prevented premature release but left the successor unable to continue during the observation window. For this **unbound startup** case, the solution uses proven same-host worker-slot ownership through an OS lock, stable file identity, and the original Task fence, allowing narrow takeover only under the applicable conditions.

There are three distinct recovery classes:

- **Run not yet created and startup slot unbound:** a successor needs the verified same-host slot and a current Task claim; the original Provider owner may then try to reclaim the precisely identified unbound capacity.
- **Entry already bound:** the original request binding remains authoritative; a new slot alone cannot replace it.
- **Physical request dispatched, outcome unknown:** retain the unresolved Provider effect and do not send an apparent second request.

That extra verification is the price of continuing eligible work without pretending earlier model calls never happened. The measured evidence covers local macOS/Linux, tested filesystem conditions, and isolated PostgreSQL, not general cross-machine recovery.

A related but separate problem remains in Child/Peer wake recovery. Measuring execution time across wall-clock adjustments improved in the November 11 work, while full Host stop-proof and Resource settlement still had uncompleted integration tasks at that point. We must not promote those plans to a general recovery capability merely because three process hosts now exist.

## 6. Challenge three: a Product port can listen after the original Product is gone

After Product became a child process, the local Web still needed a stable destination. The simplest approach was a fixed Product TCP port. A controlled test terminated the original Product child, allowed a different fixture-owned listener to bind the same address, and observed that listener receiving a request with a **synthetic session cookie**.

<figure class="three-host-figure">
<picture><source media="(max-width: 640px)" :srcset="withBase('/diagrams/three-host-lifecycle/en/06-transport-mobile.svg')" /><img :src="withBase('/diagrams/three-host-lifecycle/en/06-transport.svg')" alt="A replacement listener could take the old Product port when the child exited; the revised local launcher retains the public port and routes through a private socket or returns 503." loading="lazy" style="display:block;width:100%;height:auto;border-radius:14px" /></picture>
<figcaption>Figure 6 | A listening port is not server identity; an unavailable Product must fail explicitly. <a :href="withBase('/diagrams/three-host-lifecycle/en/06-transport.svg')">Open the full-size diagram</a></figcaption>
</figure>

That was not a real-user credential leak. It proved a local service-identity gap: **a reachable port does not establish that the original child is behind it.**

The revised local launcher retains the public Product listener throughout its own lifetime and forwards only to its managed child's private Unix socket or equivalent local channel. If Product is unavailable, the public endpoint returns an explicit 503. In the controlled reproduction, the replacement listener could not acquire the public port and received no request, while Core, Worker, and Web remained alive.

A stable listener also constrains operations. Checking that a port disappeared does not prove a portless Worker or the rest of the owned workload has stopped. Accordingly, automatic local `restart` stays unavailable; the original launcher must stop its own processes before a fresh launch. The test proves a specified local ownership rule, not protection against all same-user adversarial processes or every operating system.

## 7. Costs and decision criteria: when should an Agent stay in one process?

The first-order benefits are **separate runtime commitments and narrower local process-failure impact**. Controlled tests show background execution continuing through API restarts, foreground research working without Product, and original results remaining readable. Non-preemptive foreground priority and bounded takeover are mechanisms required to maintain those benefits when hosts share resources.

None of this makes the system three times as available. The hosts still depend on PostgreSQL, Provider capacity, authentication, and the same coordinated software version. Additional startup routes, failure detectors, file identities, and recovery conditions increase normal-path and debugging costs. There is no like-for-like production measurement proving reductions in p95 latency, model spend, failure rate, or maintenance effort.

Adopt the split when a product-management outage **must not stop scheduled commitments**, a background worker must not bring down interactive requests, and task/usage/publication facts already have reliable durable identities. If all work is short-lived chat and can legitimately stop with the API, the combined process may be the better engineering answer.

## Conclusion: separate lifetimes, not sources of truth

This was not a transition from one Agent to three competing Agents or three competing task databases. It separated the conditions under which Core, Product, and Worker may be stopped while retaining the original authority for permissions, capacity, budgets, control, and published results.

**Physical independence buys more precise user commitments, not free reliability.** The difficult cases—queue handoff, crash ownership, and port substitution—show why an architecture must know who may stop, who may resume, and which external effects are still unknown before it can reliably promise that one service may be maintained while another keeps working.

### Further reading

- [Confirmed schedules, due opportunities, and result readback](agent-autonomous-scheduled-research.md)
- [Provider admission, leases, and unknown occupation](agent-provider-admission-capacity-lease.md)
- [Run, Worker, and Schedule identities](agent-task-session-run-worker-schedule.md)
- [Why disconnect is different from process recovery](agent-disconnect-is-not-crash-recovery-contract.md)

**Engineering evidence:** ETF Agent's [three-host implementation](https://github.com/hpoenixf/etf-agent/commit/6490b06e714f30e8359f2b107d54b6252f7b8406), [Task–Provider capacity handoff](https://github.com/hpoenixf/etf-agent/commit/8baf8cc14b016cd71d3e70c996a2d76a0cae959b), and [fixed-snapshot design and verification](https://github.com/hpoenixf/etf-agent/tree/4ce419d8fa532a3b9349ce0d85ed978af9d50411/openspec/changes/archive/2026-11-11-agent-separate-product-and-background-processes). This is an internal engineering implementation with controlled evidence, not a claim that public Open ETF Agent v0.28 already ships the same three-host topology.
