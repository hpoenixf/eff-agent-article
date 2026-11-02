---
title: "HTML Was Saved—Why Did Delivery Still Fail? An Agent Report Architecture Reversal"
description: "From isolated Python and a dedicated weekly generator to shared Publication, Artifacts, authorization and verifiable downloads."
readingBrief:
  takeaways:
    - "HTML generation, Artifact commit, current-account download permission, and retrieval of identical bytes are separate facts; no local success alone proves report delivery."
    - "Source eligibility must follow original Host receipts; current-data freshness must not invalidate historical files, and sharing binds an account to a fixed file revision."
    - "Weekly reports specialize research methods, not file infrastructure; direct HTML and Python files share publication and artifact delivery, with safety checks targeting dangerous effects rather than aesthetics."
  appliesTo:
    - "Agent report systems that compute or save files but fail during export, provenance handoff, authenticated download, or later reopening."
  notFor:
    - "Treating sandboxing as data authorization, downloads as proof of correct analysis, or flexible styling as permission to remove script, resource-loading, and parser limits."
---

# The HTML Was Saved. Why Did Delivery Still Fail?

> We went from isolated Python and a dedicated weekly-report generator to model-authored HTML and shared Artifact delivery. The hardest part was never the layout. It was ensuring that work spanning model, executor, provenance, storage and permission ultimately became a file the user **actually possessed and could open**.

For a while we believed HTML report generation was almost finished.

In one real research task, a Python script ran **33 times**. **Nine computations succeeded, four renders completed**, yet **no file was successfully exported**. Another real run was even stranger: the agent saved **five HTML Artifacts** and returned links, but **all five HTTP downloads returned 404**.

The first failure did not mean Python could not generate HTML; the second did not mean the file did not exist. **Every layer could claim it had finished, while the system as a whole failed the user's task.**

This is why we spent over ten days developing the mechanism—and then voluntarily removed the dedicated weekly-report generator.

## 1. What Exactly Did “Success” Mean, and Who Said It?

Initially the workflow had two explicit steps: use isolated Python to compute and write a file, then call an export tool. That separation matters: a temporary workspace artifact must not become a user attachment merely because code ran.

Real executions exposed a deeper problem: **the model saying “I generated HTML” does not prove the Host saved it, and the Host saving a file does not prove the browser can retrieve it**.

~~~mermaid
flowchart TD
  M["Model-authored HTML"] --> P["Content producer"]
  Y["Python workspace file"] --> P
  P --> E["Export action"]
  E --> C["Prepare validated content"]
  C --> A["Persist Artifact"]
  A --> D["Authorized download"]
  D --> B["Browser opens file"]
  E --> X["Missing-file receipt"]
  A --> R["Download denied"]
~~~

At least six distinct facts exist on this path: content written, tool call ended, export accepted, file committed, current user authorized, and bytes downloaded actually matching the original. Missing any stage makes “report delivered” an unjustified claim.

Even CLI exit code **0** once accompanied a run marked research_interrupted, with no successful export receipt. An agent must collect evidence separately for **model assertions, Runtime state and effects in the outside world**.

## 2. A File Crossing Owners Must Not Lose Its Trust Provenance

More difficult than an absent export was a file that definitely existed but lacked acceptable proof that it could be exported.

We let Child Agents use authorized research results and create reports through Python or direct HTML. Data might traverse tool output, Stored Results, historical reads, a Child, a workspace and, finally, an Artifact. **Text can be copied; source eligibility cannot be inherited merely by copying it.**

In one real failure, repeated Skill reads by a Child were followed by a missing projection of already confirmed Host source facts. HTML export then returned ANALYSIS_ORIGIN_UNAVAILABLE. In another, Child reference proof was blocked by a plausible-looking budget equation, total = used + remaining. Because some capacity had been reserved for the Child, those three quantities need not be equal. The incorrect projection check marked legitimate results as identity-inconsistent.

Two tempting shortcuts were rejected:

- **Set the source to empty.** Export would pass, but an Artifact derived from private data could lose its dependencies and access restrictions.
- **Add an exporter-specific exception.** That report might pass, but other entry points would repeat slightly different eligibility judgments, fragmenting the authority model.

We chose the harder maintainable fix: **return to the owner that originally created the facts and correctly propagate the existing Host receipts and source identities to consumers**. Child, Publication and Artifact consume those facts rather than independently inventing “the origin is probably fine.”

Python sandboxing alone is not sufficient. Container isolation protects the Host from untrusted code and network access; it cannot authorize the research data that generated the file. Even if the model embeds a previously seen private number directly as a code literal, its workspace must conservatively retain that dependency.

## 3. HTML Security Can Be Too Weak—or Too Restrictive

HTML is harder than plain text. It can describe a static report, but it can also contain scripts, event handlers, outbound resource loads and more complicated browser behavior.

Our first approach used a strict element and CSS allowlist. Real model-generated reports were rejected for benign **CSS variables, numeric typography and traditional table properties**. Older rules also restricted gradients, responsive styles and print layouts. The model wasted execution turns rewriting harmless formatting.

Even a dedicated fixed-template report was not guaranteed to be readable: on a **320px** viewport, one generated approximately **2,723px** of horizontal content.

The proper goal was not “looks like our chosen template” but **absence of unsafe effects**: active execution, implicit resource loading, unauthorized access, malicious paths and unbounded parsing cost.

We retained structural checks of HTML and CSS but removed aesthetics-as-security rules. Ordinary CSS is allowed; scripts, dangerous resource loads and resource exhaustion remain disallowed.

There was a less obvious performance issue: removing an older **256 KiB HTML limit** does not imply permission to parse a giant DOM without constraint. Artifact eventually owned a **32 MiB file-byte limit**, while the parser imposed its own empirically bounded allocation budget for DOM nodes.

**File size, parsing memory and visual quality are three different concerns. One blunt threshold must not decide them all.**

## 4. A Historical Report's Source Permission Is Not Today's Data Freshness

One of the clearest failures occurred at the last meter: a real run saved five files, but all five downloads returned 404.

The download endpoint was reusing a dependency check intended for **current portfolio data**. Some holding versions, freshness windows or snapshots were no longer current, so a legitimately saved historical HTML report became unreadable.

But downloading a historical report is not the same operation as recomputing current holdings.

~~~mermaid
flowchart TD
  R["Authorized original research"] --> A["Immutable Artifact version"]
  A --> L["Later download"]
  L --> I["Current user identity"]
  I --> H["Stored file integrity"]
  H --> B["Original bytes"]
  L --> F["Wrong current-data freshness check"]
  F --> X["False 404 / Not found"]
~~~

The fix was **not** to delete provenance checks. Authorization of the original run still matters; independent privacy-deletion or correction rules remain effective; and a new download must verify **that the current account may read this particular Artifact**.

What must not happen is allowing today's portfolio snapshot to redefine the legitimacy of yesterday's static file.

Likewise, a share link is not a bearer token for unrestricted access. **Sharing grants a specified account read access to a specific file revision, not a publicly transferrable URL**. An owner creates a Share Grant through an authenticated operation. A recipient must still authenticate using their own session. They cannot reshare by default or gain access to the original Run, other artifacts or raw research materials.

~~~mermaid
flowchart TD
  A["Saved Artifact"] --> O["Owner download"]
  A --> G["Share Grant"]
  G --> S["Authenticated recipient session"]
  S --> R["Fixed Artifact revision"]
  R --> D["Recipient download"]
  G --> X["Grant revoked or expired"]
  X --> N["Access denied"]
~~~

When a file has not yet been generated, the Grant may be bound to a server-confirmed pending delivery identity, but **Pending is never downloadable**. After commit, only the bound revision and hash may be read. Regenerating the report must not silently redirect an older authorization to a new revision.

Revocation, expiry, account deactivation or file expiration blocks later reads, but cannot retrieve a copy the recipient already downloaded. Restrictions on redistributing the underlying sources also survive a sharing operation.

## 5. Why Delete the Dedicated Weekly Generator Instead of Fixing It Again?

In hindsight, our design path is recognizable:

~~~mermaid
flowchart TD
  P["Isolated Python sandbox"] --> W["Dedicated weekly-report generator"]
  W --> M["Model-authored HTML"]
  M --> A["Shared Artifact delivery"]
~~~

The dedicated generator's original purpose was sensible: predictable layout, standard calculations and easier acceptance. But as the product grew, it forced the model to shuttle specialized arguments around and rewired provenance, creation, storage, download and reopening in parallel.

We even observed the model mistakenly passing **a result hash as a tool-call ID**, and attempting to export **a workspace path that did not exist**.

Eventually we recognized that the weekly report's specialization lies mostly in its **research methodology**, not in its **file infrastructure**.

We kept two input forms:

~~~json
{ "html": "<html>...</html>", "fileName": "review.html" }
{ "path": "review.html", "fileName": "review.html" }
~~~

The model may compose HTML directly, or delegate computation and bulk generation to isolated Python. Both then use existing **Publication** to handle the answer text and its citations, and **Artifact** to validate, save the final bytes and issue the file identity. The existing download path delivers it under current account permission or an explicit Share Grant.

We did not build another HTML Router, DSL, authorization service or automatic-fix loop. The weekly-review Skill retains the analysis method and discards the outdated dedicated generation protocol. Existing method constraints for other standard reports were not unconditionally removed.

## 6. How Far Did the Delivery Path Actually Work?

We first observed a real model-driven **Child → Python → HTML export → Main download** path. The file was not merely generated: it was downloaded through normal authorization and matched its saved contents. The shared HTML path later exercised report creation, persistence, authenticated download, and opening the document in a browser through the ordinary CLI entry point.

These runs show that the shared delivery path can work while retaining the lessons of earlier delivery failures. They do not retest every Python/Child variation under the redesigned path or establish correct financial analysis, polished visual experience, or long-term production stability.

HTML delivery makes [principle 8, “Internal success is not user-task success”](/en/principles#principle-8) observable. Successful Python execution, a persisted Artifact and an accessible download are distinct pieces of evidence; none alone proves that the user received the intended authorized report in a usable form.

## Conclusion

We started with “How can an agent generate beautiful HTML?” and ended with a tougher question:

**When the model, Python, Child, Publication, Artifact and the download endpoint all report success, who proves the user actually received the same authorized, untampered file?**

A real architecture upgrade is not another all-powerful generator. Each owner must prove only the facts it owns; once these facts reliably connect, the heavier dedicated chain becomes safe to delete.


## Further Reading and Discussion

- [ETF Agent Engineering Library](https://github.com/hpoenixf/eff-agent-article) gathers further Runtime, Publication, Python and architectural evolution articles. If these notes help, consider starring the repository.
- [Personal engineering blog](https://hpoenixf.com/) presents the articles chronologically.
