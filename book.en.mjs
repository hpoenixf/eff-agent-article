// English presentation only. The canonical article IDs and ordering live in book.mjs.
import { collections, mergedArticles } from './book.mjs'
export const englishTitles = {
  "agent-action-reminder-coordination": "Action Reminders: From Candidate Advice to the Model Request",
  "deepseek-superagent-continuous-research": "From Investment-Research Chat to Ongoing Research: Lessons from DeepSeek Super-agent",
  "agent-research-evidence-store-lifecycle": "What a Model Attempt Leaves Behind: Capturing, Retaining, and Reading Agent Research Evidence",
  "agent-numeric-kernel-exact-units-rounding": "Exact Numbers Are Not Correct Investments: A Numeric Kernel for Units, Rounding, and Residuals",
  "agent-context-governance-principles": "Agent Context Governance Panorama · Principles: Keep Every Decision Aligned with the Goal",
  "agent-context-governance-actions": "Agent Context Governance Panorama · Practice: From the First Request to Long-Term Memory",
  "agent-long-horizon-research-panorama": "Long-Horizon Research Panorama: Continuing Across Context, Interruptions and Time",
  "agent-research-workspace-goal-continuity": "Why Agents Need a Workspace: From One-Off Conversations to Long-Term Research",
  "agent-trace-complete-observation-gaps": "The Trace Says Complete. Why Can’t We Reconstruct the Agent Run?",
  "agent-subagent-contribution-evidence": "How Do We Know the Main Agent Actually Used a Specialist’s Findings?",
  "agent-report-cost-attribution": "What Does an Agent-Generated Report Actually Cost?",
  "agent-stream-tool-call-null-continuation": "How a null Broke an Agent Tool Call: A Streaming Compatibility Case",
  "agent-ten-modules": "Agent Intermediate: Ten Core Modules in Open ETF Agent",
  "agent-in-15-minutes": "Agents in 15 Minutes",
  "docs-code-tests-evolve-together": "When Tests Outgrow the Code: Helping Docs, Code, and Tests Evolve Together",
  "agent-article-code-evidence-contract": "Does the Code Really Support the Article? An Evidence Contract for Technical Writing",
  "agent-engineering-suite": "Agent Engineering Suite: Connecting Requirements to Release",
  "one-report-nine-architecture-judgments": "Nine Architecture Judgments Behind One Report",
  "open-etf-agent-v010-system-design": "Agent Deep Dive: From One Report to Durable Execution and Specialist Collaboration",
  "agent-thinking-fast-slow-research-needs": "Why AI Agents Need Thinking, Fast and Slow",
  "financial-agent-system-panorama": "Financial Agents in Context: Systems, Lifecycles, and Accountability",
  "financial-business-agent-trusted-handoff": "Trusted Handoffs Between Financial Business Agents: Why a Router Is Not Enough",
  "ai-coding-judgment-and-verification": "The Expensive Part of AI Coding Is Deciding What Deserves Verification",
  "open-etf-agent-v01-first-readable-report": "Start with a Report You Can Read Back: Open ETF Agent v0.1",
  "agent-runtime-refactor-one-day-blocked": "Why Did One Subagent Change Hold Up Our Work for an Entire Day?",
  "agent-differentiated-evolution-contracts": "What Should Stay Stable—and What Should Change—in an Agent Architecture?",
  "agent-background-research-collaborative-experience": "Keep Chatting: Adding Async Background Research to an Agent in a Day",
  "022-agent-entry-from-intent-to-direct-research": "Entry: Why the Entry Point Became Simpler",
  "021-agent-web-research-from-search-to-deep-reading": "Web Research: From Search to Deep Reading",
  "024-agent-pdf-from-text-to-evidence": "PDF: From Text to Evidence",
  "agent-subagent-context-specialization": "Subagent Panorama: Independent Context, Specialist Work and Real Handoffs",
  "agent-custom-expert-from-prompt-to-recovery": "A Custom Expert Should Be More Than a Prompt Field",
  "bounded-bull-bear-peer-dialogue": "When Two Agents Talk Directly: Bounded Bull–Bear Research",
  "investment-perspectives-and-thesis-falsification": "More Than One Investment Expert: How Multi-Perspective Agents Test an Investment Thesis",
  "multi-layer-agent-collaboration-outlook": "From Multiple Experts to One Research Result: The Next Step for Multi-Layer Agents (2026 Outlook)",
  "adaptive-research-python-workbench": "Adaptive Research and Python",
  "agent-python-compute-workbench-evolution": "Python: From Tool to Computational Workbench",
  "portfolio-mcp-readonly-investment-data": "Connecting Portfolio Data Through a Read-Only MCP",
  "unavailable-is-correct": "Controlled Refresh for Stale Data",
  "tool-results-outside-model-context": "Externalized Results and Input Completeness",
  "agent-main-run-context-compaction": "Main Context Compaction Without Rewriting Facts",
  "agent-conversation-history-compaction-source-boundaries": "Cross-Run Compaction: Why an Agent Cannot Simply Summarize History",
  "026-agent-memory-forget-durable-effects": "Memory: From Saving and Recall to Safe Forgetting",
  "027-rag-revocation-publish-replay": "RAG: Revocation and Historical Replay",
  "agent-provider-architecture-and-admission": "Provider: Why a Unified API Still Needs Shared Admission",
  "agent-provider-admission-capacity-lease": "Why the Next Model Request Still Queues After HTTP 200",
  "agent-control-events-durable-owner-adoption": "Why an Agent Cannot Execute a Stop Command Immediately",
  "020-agent-extension-host-smartphone": "Extension Host: From Feature Phone to Smartphone",
  "mcp-host-from-discovery-to-consumption": "MCP Host: From Discovery to Usable Tools",
  "agent-model-capability-presentation-tool-surface": "Tool Surface: Why the Model Cannot See an Available Tool",
  "agent-content-trust-prompt-injection": "Prompt Injection Is More Than Malicious Text: An Agent Content Trust Boundary",
  "agent-multi-ecosystem-hook-execution": "Multi-Ecosystem Hooks: Claude, Pi and Codex",
  "agent-tool-lifecycle-and-model-input": "Observing the Tool-to-Model Input Lifecycle",
  "agent-runtime-constraint-governance-v2": "Run Budget and Constraint Governance",
  "agent-autonomous-scheduled-research": "Scheduled Research Beyond a Conversation",
  "025-agent-langfuse-from-trace-to-trustworthy-observability": "Agent Observability Panorama: From Model Requests to Verifiable Research Facts",
  "019-agent-answer-publication": "Publication: Why Answers Need Their Own Delivery System",
  "agent-progressive-answer-coherence": "Keeping Progressive Answers Coherent",
  "agent-feedback-facts-not-automatic-learning": "When a User Dislikes an Answer: Feedback Is Not Automatic Learning",
  "agent-asynchronous-research-time-bound-delivery": "Async Research: Delivering on Time After Users Leave",
  "017-prompt-to-answer-six-layer-panorama-v3": "Six-Layer Request Lifecycle: From Prompt to Visible Answer",
  "etf-agent-model-harness-research-loop": "A Research Agent Needs More Than Tools: Model, Harness, and Loop",
  "011-model-understands-code-authorizes": "Models Understand; Code Authorizes",
  "runtime-model-protocol-boundary-agent-article-v2": "Don't Turn the Model into a State Machine",
  "agent-model-runtime-mcp-skill-boundaries": "Responsibilities of Model, Runtime, MCP and Skills",
  "agent-disconnect-is-not-crash-recovery-contract": "A Disconnected Browser Is Not a Crashed Agent",
  "agent-veto-authority-and-run-termination": "Run Termination, Stage Budgets and Safe Recovery",
  "mcp-market-responsibility-retrospective": "Why Financial Market MCP Became a Decision System",
  "ai-citations-do-not-prove-reliability": "Designing Agent Citations: From Host-Issued References to Revision-Safe Independent Review",
  "agent-failure-is-a-boundary-problem": "Stop Blaming Every Failure on the Model",
  "local-improvement-is-not-system-progress": "Local Improvements Are Not System Progress",
  "agent-provider-failover-without-resetting-the-run": "Failover: Change the Route Without Resetting the Task",
  "code-cheaper-systems-harder-to-evolve": "Code Is Cheaper; Why Are Systems Harder to Evolve?",
  "agent-html-evolution-challenges": "Why Saved HTML Can Still Fail Delivery",
  "etf-assistant-engineering-origins": "Why a Small ETF Investment Assistant Became an Engineering Problem",
  "030-fintech-from-research-to-investment-advice": "Boundaries Between Research, Advice and Trading",
  "031-fintech-data-time-and-reproducible-numbers": "Financial Data: Time, Definitions and Reproducibility",
  "financial-agent-python-result-consumption": "Why Python Results Can Still Be Misused in Reports",
  "financial-agent-trustworthy-evidence-chain": "A Trustworthy Evidence Chain for Financial Agents",
  "agent-weekly-thesis-history-continuous-research": "After the Weekly Report, Does the Agent Remember Why?",
  "026-agent-spec-evidence-workflow": "Specs, Evidence and Verifiable Engineering Closure",
  "agent-weekly-review-staged-delivery": "Why We Split a Large Weekly Review Spec into Three Phases",
  "027-agent-context-document-history": "Engineering Knowledge: Context, Memory and Retirement",
  "honest-agent-evaluation": "Agent Evaluation Panorama: From Green Tests to Real Task Value",
  "rag-retrieval-evaluation-evidence": "RAG Recall Looks Great. Why Doesn’t That Prove the Agent Found the Right Financial Evidence?",
  "test-lifecycle-refactoring-retirement-and-spec": "Tests Expire Too: Move Refactoring, Retirement, and Deletion into the Spec",
  "032-ai-development-from-bug-loop-to-task-convergence": "From Bug-Fix Loops to Task Convergence",
  "agent-durable-human-interaction-response-adoption": "After an Agent Asks: Durable Human Response Adoption",
  "agent-temporal-semantics-market-calendar": "When an Agent Says Today: User Time and Market Sessions",
  "agent-personal-credits-shadow-accounting": "Agent Usage: Requests, Tokens and Shadow Credits"
}
export const englishArticleSlugs = [
  "agent-action-reminder-coordination",
  "deepseek-superagent-continuous-research",
  "agent-research-evidence-store-lifecycle",
  "agent-numeric-kernel-exact-units-rounding",
  "agent-context-governance-principles",
  "agent-context-governance-actions",
  "agent-long-horizon-research-panorama",
  "agent-research-workspace-goal-continuity",
  "agent-trace-complete-observation-gaps",
  "agent-subagent-contribution-evidence",
  "agent-report-cost-attribution",
  "agent-stream-tool-call-null-continuation",
  "agent-ten-modules",
  "agent-in-15-minutes",
  "docs-code-tests-evolve-together",
  "agent-article-code-evidence-contract",
  "agent-engineering-suite",
  "one-report-nine-architecture-judgments",
  "open-etf-agent-v010-system-design",
  "agent-thinking-fast-slow-research-needs",
  "financial-agent-system-panorama",
  "financial-business-agent-trusted-handoff",
  "ai-coding-judgment-and-verification",
  "open-etf-agent-v01-first-readable-report",
  "agent-runtime-refactor-one-day-blocked",
  "agent-differentiated-evolution-contracts",
  "agent-control-events-durable-owner-adoption",
  "agent-provider-admission-capacity-lease",
  "agent-durable-human-interaction-response-adoption",
  "agent-temporal-semantics-market-calendar",
  "agent-personal-credits-shadow-accounting",
  "017-prompt-to-answer-six-layer-panorama-v3",
  "etf-agent-model-harness-research-loop",
  "agent-background-research-collaborative-experience",
  "mcp-host-from-discovery-to-consumption",
  "mcp-market-responsibility-retrospective",
  "runtime-model-protocol-boundary-agent-article-v2",
  "code-cheaper-systems-harder-to-evolve",
  "ai-citations-do-not-prove-reliability",
  "agent-subagent-context-specialization",
  "agent-custom-expert-from-prompt-to-recovery",
  "bounded-bull-bear-peer-dialogue",
  "investment-perspectives-and-thesis-falsification",
  "multi-layer-agent-collaboration-outlook",
  "agent-python-compute-workbench-evolution",
  "agent-runtime-constraint-governance-v2",
  "020-agent-extension-host-smartphone",
  "agent-multi-ecosystem-hook-execution",
  "agent-failure-is-a-boundary-problem",
  "local-improvement-is-not-system-progress",
  "agent-model-runtime-mcp-skill-boundaries",
  "025-agent-langfuse-from-trace-to-trustworthy-observability",
  "adaptive-research-python-workbench",
  "agent-progressive-answer-coherence",
  "agent-feedback-facts-not-automatic-learning",
  "agent-disconnect-is-not-crash-recovery-contract",
  "agent-veto-authority-and-run-termination",
  "unavailable-is-correct",
  "agent-model-capability-presentation-tool-surface",
  "agent-content-trust-prompt-injection",
  "tool-results-outside-model-context",
  "026-agent-memory-forget-durable-effects",
  "027-rag-revocation-publish-replay",
  "030-fintech-from-research-to-investment-advice",
  "032-ai-development-from-bug-loop-to-task-convergence",
  "etf-assistant-engineering-origins",
  "agent-tool-lifecycle-and-model-input",
  "024-agent-pdf-from-text-to-evidence",
  "agent-html-evolution-challenges",
  "011-model-understands-code-authorizes",
  "agent-autonomous-scheduled-research",
  "honest-agent-evaluation",
  "rag-retrieval-evaluation-evidence",
  "test-lifecycle-refactoring-retirement-and-spec",
  "agent-main-run-context-compaction",
  "agent-conversation-history-compaction-source-boundaries",
  "financial-agent-python-result-consumption",
  "031-fintech-data-time-and-reproducible-numbers",
  "026-agent-spec-evidence-workflow",
  "027-agent-context-document-history",
  "agent-weekly-review-staged-delivery",
  "agent-asynchronous-research-time-bound-delivery",
  "agent-weekly-thesis-history-continuous-research",
  "agent-provider-architecture-and-admission",
  "agent-provider-failover-without-resetting-the-run",
  "019-agent-answer-publication",
  "021-agent-web-research-from-search-to-deep-reading",
  "022-agent-entry-from-intent-to-direct-research",
  "portfolio-mcp-readonly-investment-data"
] // Register only reviewed, full English editions; never summary placeholders.
// Kept as an independently readable full-text historical edition; not counted as a new essay.
export const historicalEnglishArticleSlugs = ['017-prompt-to-answer-six-layer-panorama']

const headings = {
  "深度持续研究": [
    "Deep and Continuous Research",
    "Long-running background research, staged delivery, recovery and continuity of investment theses."
  ],
  "Subagent 与专家": [
    "Subagents and Experts",
    "Investment perspectives, bounded peer dialogues and collaboration across expert agents."
  ],
  "Spec、证据与工程记忆": [
    "Specs, Evidence and Engineering Memory",
    "From specifications to execution evidence and durable project history."
  ],
  "真实验证与任务收敛": [
    "Real Validation and Task Convergence",
    "Testing runtime protocols, tracing, specialist handoffs and research quality beyond local green checks."
  ],
  "L1 · 任务输入与触发": [
    "L1 · Task Input and Triggers",
    "Scheduled tasks and other authorized triggers start work; input does not replace research decisions."
  ],
  "L2 · 身份、会话与上下文": [
    "L2 · Identity, Sessions and Context",
    "Identity, capability admission, context and durable interactions follow their primary Owners across layers."
  ],
  "L3 · Agent 决策与运行": [
    "L3 · Agent Decisions and Execution",
    "Entry, Main, Child, Provider, tool presentation and budgets support bounded execution."
  ],
  "L4 · 工具与领域能力": [
    "L4 · Tools and Domain Capabilities",
    "Controlled reading, isolated computation, MCP, market time and investment facts; receipts are not conclusions."
  ],
  "L5 · 结果发布与交付": [
    "L5 · Result Publication and Delivery",
    "Separate accepted content, committed revisions, conversation delivery and feedback facts."
  ],
  "L6 · 用户界面": [
    "L6 · User Interface",
    "Visible answers, progress and correct Run attribution; reading placement does not imply exclusive frontend ownership."
  ],
  "金融研究与业务责任": [
    "Financial Research and Business Accountability",
    "Financial data and calculation semantics, research-service boundaries and investment-business responsibilities."
  ],
  "架构学习路线": [
    "Architecture Learning Path",
    "From a 15-minute introduction through ten modules and a runnable deep dive to the complete six-layer architecture."
  ],
  "系统边界与演进": [
    "System Boundaries and Evolution",
    "Cross-module evidence, responsibility, failure attribution, reliability and long-term architecture evolution."
  ]
}
const labels = {
  modules: ['Module Deep Dives','Mechanisms along the six-layer request lifecycle, with cross-layer responsibilities preserved.'],
  thinking: ['Architecture and Systems Thinking','System boundaries, responsibility, reliability and change.'],
  engineering: ['AI Agent Engineering Practice','From coding-agent workflows to runtime validation, protocol compatibility, incident analysis and verifiable task outcomes.']
}
export const englishCollections = collections.map(collection => ({
  ...collection,
  title: labels[collection.id][0],
  subtitle: labels[collection.id][1],
  chapters: collection.chapters.map(chapter => ({
    ...chapter,
    title: headings[chapter.title][0],
    desc: headings[chapter.title][1],
    items: chapter.items.map(([slug, title]) => [slug, englishTitles[slug] || title]),
    related: chapter.related?.map(([slug, title]) => [slug, englishTitles[slug] || title])
  }))
}))
export function englishArticlePath(slug) {
  const canonical = mergedArticles[slug] || slug
  return (englishArticleSlugs.includes(canonical) || historicalEnglishArticleSlugs.includes(canonical) ? '/en' : '') + '/articles/' + canonical
}
