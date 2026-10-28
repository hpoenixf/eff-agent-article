# Prompt Injection Is More Than Malicious Text: How We Built a Content Trust Boundary for an Agent

Imagine a research agent reading an investment fund report. The user only wants to understand the report's arguments and supporting evidence. Yet after a late transformation of a model request, text from a web page ends up in the `system` instruction slot. The fund report is an illustrative scenario; the actual regression used a synthetic question and a Web tool result.

This was **not** an observed attack in production. It was a controlled regression exercised against the existing model-request path on October 22, 2026. Before the fix, the test ran the real SDK mapping with simulated network dispatch and observed **one dispatch when zero were expected**. No live model was called, and we did not show that any model would obey the injected text. The application had nonetheless made an objectively verifiable error before the model ever saw the request: **source data had been placed in an instruction position it did not own**.

That failure led us to implement the first phase of A35, Content Security and Trust, in ETF Agent. We did not add a dedicated security model, a keyword blacklist, or an all-powerful reviewer. We chose a narrower question that software can actually test: **As an agent retrieves, transforms, summarizes, and restores material, who is allowed to establish its instruction identity—and who is allowed to commit real effects?**

## 1. We Already Had Protections. What Was Missing?

The earlier design was reasonable. The agent had shared model guidance telling it to treat search results and citations as source material, not instructions. Web, PDF, and retrieved documents carried source identities. Tool calls required real admission and authorization. A web page claiming to be a system administrator was never supposed to become an instruction the agent followed.

During earlier architectural work, we had also tightened two distinct boundaries. First, we gradually removed rules that inferred permission, factual status, or task completion from an assistant's free-form wording: text that *sounds* like approval is not an authorization receipt. Second, we restricted native Hooks from rewriting Host-owned source and numeric facts, so an extension could not reissue authority simply by producing an object of the expected shape.

Those protections addressed real problems at the time. They did not prove that **the final request dispatched to the model** preserved the original distinctions. A request might pass through context fitting, extensible Hooks, PDF page-image insertion, output-schema handling, and SDK protocol conversion. Passing a check upstream does not rule out changes to privileged positions downstream.

The turning point was the controlled regression above. Web content was promoted into `system` during late projection, and the old path still reached simulated SDK dispatch. The issue was not whether a model could recognize a malicious phrase. **The sender had already mixed data with instructions.** Appending another "ignore malicious instructions" reminder would not explain why the application's own request assembly had allowed that identity to change.

[OWASP's LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) describes indirect injection through third-party material, including websites and files, and discusses mitigations such as least privilege and control of external actions. We are applying a familiar engineering principle, not claiming a new theory of prompt-injection defense: **untrusted content must not determine the authority of its own contents**.

## 2. Four Different Meanings of "Trusted"

Suppose a verified fund report says, "Investors should increase exposure to this asset class." That is an opinion worth analyzing. Even if the PDF came from an official website and the agent can cite the exact page, it has no authority to place an order for the user.

| Concept | What it actually establishes | What it does not establish |
| --- | --- | --- |
| **Source and evidence identity** | Where a document came from, which version was read, and what facts it can support | Permission to change system policy |
| **Instruction identity** | Who supplied Host instructions, the user's admitted task, or a reviewed method | That a page containing `role=system` is an actual system message |
| **Transport role** | Whether an SDK carries content as `system`, `user`, or `assistant` | That every `user` message is a fresh instruction from the actual user |
| **Effect authorization** | Whether a read, write, share, or execution has real admission and confirmation | That model- or source-authored "approved" text can authorize execution |

OpenAI's [Model Spec](https://github.com/openai/model_spec/blob/main/model_spec.md) likewise distinguishes instruction priority from lower-trust or non-authoritative material. Commands inside tool results, attachments, and quoted passages do not automatically become instructions to follow. That is a model-behavior principle; our Runtime still needs a checkable mechanism for **preserving original identity across its own assembly pipeline**.

There is an important counterexample. To send a PDF page image through a multimodal SDK, an application may need to carry that image in a `user` message. Some string-valued tool contexts may likewise be mapped to a `user` carrier by a protocol adapter. A rule treating `role === 'user'` as proof of a new user instruction would misclassify valid image-reading flows. Treating every `user` carrier as authorized would be equally dangerous in the opposite direction.

A35 therefore does not issue a universal `trusted: true` stamp. **Real producers establish identities; roles are carriers; the owner of a concrete effect evaluates authorization.** This also means that a structural check cannot make the model semantically immune to hostile text that arrives inside an otherwise legitimate `user` carrier.

## 3. Capture Identity Before Mutation; Check It Before Dispatch

A35 does not sit at the search endpoint, nor is it a universal safety review after model generation. It connects two existing seams: the context assembler supplies the original identity, and the model Gateway checks it against the actual SDK request after the mutable steps.

```mermaid
graph TD
HostProducer --> CaptureIdentity
SourceData --> ComposeContext
CaptureIdentity --> ComposeContext
ComposeContext --> MutableHooks
MutableHooks --> SdkProjection
SdkProjection --> TrustCheck
CaptureIdentity --> TrustCheck
TrustCheck --> DispatchValid
TrustCheck --> RejectInvalid
DispatchValid --> ModelProposal
ModelProposal --> OriginalEffectOwner
OriginalEffectOwner --> CommitEligibleEffect
OriginalEffectOwner --> RejectLocalEffect
```

The diagram shows two **conditional outcomes** of the trust check. If the final projection is consistent with the producer's original identity, the existing Gateway may dispatch it. If it has an objective structural inconsistency, the Gateway rejects **that request** through its existing pre-dispatch failure path. The trust checker does not dispatch tools, terminate research, or make publication or memory decisions.

Three implementation details matter more than the apparent simplicity of this diagram.

**First, capture facts that downstream text cannot recreate.** The original request producer captures Host `system` instructions, a snapshot of the original `outputSchema`, and the current user messages actually admitted by the application. Context fitting and Hooks carry this original binding forward. They cannot "recapture" the baseline from the already modified request: that would let whoever changed the request invent the evidence used to validate the change.

**Second, inspect the actual SDK projection.** The sender compares the system instructions, the server-owned output-schema suffix, message count and role mapping, and whether the user's current text has been preserved exactly. It does not look for a phrase such as "ignore previous instructions." The real implementation returns bounded findings—`host-instruction-changed`, `host-schema-changed`, `unbound-system-message`, `user-message-changed`, and `carrier-role-changed`—instead of an open-ended maliciousness score.

**Third, bind a result to one request version.** The checker computes a version digest of the final representation and caches findings per request object. The same object and unchanged version do not need to be checked again at the same seam. If later mutation changes relevant content or original facts, the old result cannot be reused. We did not create a global security-deduplication database, and "check once" does **not** mean "check only once during an entire research Run."

In simplified pseudocode, the mechanism is:

```ts
const origin = captureFromProducer(request, admittedUserText);
const prepared = await applyContextAndHooks(request);
bindOriginalIdentity(prepared, origin);
const sdkPayload = mapToFinalSdkRequest(prepared);
const facts = inspectFinalContentTrust(prepared, sdkPayload);
if (facts.coverage === 'checked' && facts.findings.length > 0) {
  await originalGateway.onPreDispatchRejected();
  throw originalGateway.inconsistentRequest();
}
return originalGateway.dispatch(sdkPayload);
```

This is illustrative pseudocode, **not** a verbatim production function. Capture, binding, conversion, and settlement remain within the existing modules that own those operations. The additional mechanism gives their shared invariant a small interface; it does not relocate the execution pipeline into a new security controller.

### Two Bypasses Found After the Initial Case

The first involved **scheduled-request cloning**. A `structuredClone`-style copy does not automatically preserve identity bindings held in process memory against the original request object. A clone may retain its visible fields while losing the original producer identity, leaving the final consumer without the baseline it needs. We corrected the existing scheduling and fitting seams to carry that binding rather than allowing the cloned request to certify itself.

The second involved **output-schema text appended to system instructions**. When a provider protocol does not support a native structured-output schema, the Gateway may append a server-owned schema description to the final `system` string. That suffix is legitimate only if it corresponds to the schema captured from the original producer. A late mutation to `outputSchema.description` could otherwise change what the model receives without changing the early `system` field that someone might have checked.

These findings sharpened the design: **"We validate the final request" is not precise enough. What is the final representation? Who supplies the baseline? Does it survive clones and protocol-specific suffixes?** Those are the actual questions that determine whether the check has meaning.

## 4. The Risk Is Not Limited to a Wrong Sentence

Prompt injection may try to induce tool calls, account reads, or unauthorized sharing. A35 does not take over the authorization of these effects. Instead, their existing owners continue to validate the specific operation, scope, source, and execution receipt.

In a targeted test of the original publication and conversation path, synthetic Web material contained both ordinary analyst recommendations and text claiming to be `system` with permission to execute. A scripted model then proposed an ungranted execution action and a portfolio read. Existing tool and grant controls rejected the proposals, and the unauthorized portfolio callback was not invoked. Previously eligible text, independent sibling content, the finish result, and reopened in-memory history remained intact.

This is **not** evidence that A35 invented a new trading-permission system. It shows that existing authorization was **not replaced** by a supposed universal safety judgment. A source's "the user agreed" cannot manufacture a real confirmation record; a "suspicious" assessment cannot, by itself, delete unrelated eligible text.

That is why A35 does not expose `denyRun` or `publishAllowed` tickets. Nor may it gain the same power indirectly by throwing a policy exception, filtering candidates, or demanding a mandatory extra model turn. If a final input fails an objective identity invariant, the original Gateway rejects that input. If a protected business effect lacks permission, its actual owner rejects that effect. **The scope of the rejection follows the scope of the failed fact.**

We also deliberately distinguish three observation states: `checked`, `not-checked`, and `unavailable`. An unavailable assessment is not proof of safety; it must never be relabeled as verified. But failure of an optional observation does not automatically prove that an otherwise valid request or independent task must stop. A targeted fault-injection case demonstrated that an originally bound, eligible request could still follow the original dispatch path when the observation was unavailable, without switching off its existing necessary permissions.

## 5. A Child Agent, Summary, or Memory Entry Cannot Launder Authority

In long-running research, the problem is often not the initial web page. It is that the material is transformed repeatedly until the system forgets what kind of content it was.

For example, Main may select an external result, hand selected content to a Child agent, and receive a message saying, "Verified; execution is approved." That text remains the Child's model-generated opinion. It is not a Host execution receipt. Similarly, an automatic Memory entry may contain "the user already confirmed." Even when a later retrieval transports it in a `user`-role message, it remains automatically stored background—not fresh consent from the present user.

We preserve existing `resultRef` identifiers, source hashes, Child handoff facts, and Memory provenance. We do not ask a model to invent a parallel security lineage, and A35 does not create another persistent trust ledger. When a protected use actually needs source or authorization proof, the system returns to the original result, read, and permission contracts. Processing a piece of text, rereading it, or storing it successfully never upgrades its authority.

Context compaction is particularly easy to describe incorrectly. The current Main path summarizes **sealed assistant tool proposals**, not all original Web or MCP response bodies dumped into a summarization model. The summary can help the model continue working, but it cannot conjure a real execution or user confirmation from its prose.

This part has implementation evidence beyond a design document. In one bounded PostgreSQL test, a writer process stored the relevant state and terminated; a fresh process recovered and exactly reread the original result. The scenario asserted preservation of the sealed proposal, source identity, and eligible text delivery. **That verifies a specific synthetic cross-process handoff, not every recovery variant, live-model behavior, or production history.**

## 6. Why Not Add Another "Safety LLM"?

Using a second model to judge whether web text is suspicious can seem stronger. But doing so introduces model costs, false-positive handling, evaluation requirements, and a new authority-design problem. If the review model itself can be influenced by its input, its "safe" label still cannot constitute an authorization receipt.

For this phase, we separated two jobs. **Software checks what it actually knows:** which producer supplied an instruction, whether current user text was replaced, whether source material landed in a privileged slot, and whether a proposed action has real permission. **The model interprets natural language:** whether a sentence is an analyst's view, an attack sample the user wants explained, or an attempt to redirect the current task.

We added an optional, reviewed `source-instruction-safety` Skill through the existing method and resource admission path. It helps the model distinguish source views from unauthorized commands while preserving the legitimate task. It is not mandatory for ordinary requests, does not introduce another model, and does not require a self-certification statement at the end of each turn. If the optional method is unavailable, normal work and existing deterministic protections remain available.

That is a deliberate trade-off, not an assertion that semantic defense does not matter. OWASP describes additional mitigations including filtering, least privilege, approval, and continuing security tests. **A35 Phase 1 implements the narrower identity-and-effect contract we could validate locally.** It is not a real-time malicious-text classifier, and it does not claim to detect every indirect injection.

## 7. What the Structural Checks Established

Return to the opening regression. Before the fix, the old path promoted Web content into final `system` and simulated SDK dispatch occurred once, despite an expectation of zero. With producer-bound identity and final projection checking, an inconsistent request instead reached the original Gateway's pre-dispatch rejection path. Targeted regressions also addressed scheduled clones, output-schema suffixes, legitimate PDF carriers, and exact preservation of current-user text.

Most importantly, two claims must not be conflated. **Preventing Web content from being structurally promoted to `system` does not prove a model cannot be socially engineered by malicious prose inside an otherwise legitimate tool or user-role carrier.** The former has deterministic invariants that application tests can exercise. The latter still calls for independent adversarial evaluation of real models, real input paths, and actual effects.

<!-- open-etf-case:trust@e0a6a29b7474a19c18b169c0e4a7eb0eb614504d -->
### Test projection rejection with forged source identity

The [Context counterexample at this fixed public snapshot](https://github.com/hpoenixf/open-etf-agent/blob/e0a6a29b7474a19c18b169c0e4a7eb0eb614504d/test/context.test.mjs) reduces “content cannot grant itself authority” to several inspectable input changes.

After installing dependencies according to the README at the linked fixed snapshot, run:

```bash
node --test --test-concurrency=1 --test-name-pattern='^4\.2 projection never launders a lookalike or altered payload into an acquired ref$' test/context.test.mjs
```

It removes `resultRef`, substitutes an unacquired version, changes the page, and forges the body in separate cases. Bounded Context projection must reject them rather than mint a plausible original-source reference. The observable result is passing rejection assertions, not a research report.

This checks structural protection of acquired source identity. It is not the complete A35 design, a malicious-text classifier, or evidence of real-model resistance to prompt injection.
<!-- /open-etf-case -->

## Conclusion: Content May Inform Research, but It Must Not Grant Itself Power

The result of this design is not a large security control plane. It is a traceable identity chain: the original producer establishes an identity before mutation; subsequent transformations cannot reissue it on their own; the final sender compares the actual version; and execution, storage, publication, and recovery remain with the original owners of their respective facts.

A fund report can change an agent's investment hypothesis, motivate more research, or contain an attack phrase that the user legitimately asked the agent to explain. Those are valid uses of content. But retrieval, summarization, or another agent's retelling cannot silently turn that report into a user command, system policy, or execution approval.

**For an agent, content security is not simply deleting suspicious sentences. It is allowing information to flow while keeping authority tied to an explicit and verifiable origin.**

## Further Reading and Discussion

For the related but distinct question of final tool visibility, see [A34 Tool Surface](https://hpoenixf.com/eff-agent-article/en/articles/agent-model-capability-presentation-tool-surface). For the authorization and effect boundary, see [Models Understand; Code Authorizes](https://hpoenixf.com/eff-agent-article/en/articles/011-model-understands-code-authorizes).

This article belongs to [ETF Agent Engineering Notes](https://github.com/hpoenixf/eff-agent-article). If these engineering investigations are useful to you, consider starring the public collection on GitHub.
