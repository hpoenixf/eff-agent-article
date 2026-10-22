// English presentation only. The canonical article IDs and ordering live in book.mjs.
import { collections, mergedArticles } from './book.mjs'
export const englishTitles = {
  "022-agent-entry-from-intent-to-direct-research": "Entry: Why the Entry Point Became Simpler",
  "021-agent-web-research-from-search-to-deep-reading": "Web Research: From Search to Deep Reading",
  "024-agent-pdf-from-text-to-evidence": "PDF: From Text to Evidence",
  "agent-subagent-context-specialization": "Subagents: Isolation and Specialized Collaboration",
  "adaptive-research-python-workbench": "Adaptive Research and Python",
  "agent-python-compute-workbench-evolution": "Python: From Tool to Computational Workbench",
  "portfolio-mcp-readonly-investment-data": "Connecting Portfolio Data Through a Read-Only MCP",
  "unavailable-is-correct": "Controlled Refresh for Stale Data",
  "tool-results-outside-model-context": "Externalized Results and Input Completeness",
  "agent-main-run-context-compaction": "Main Context Compaction Without Rewriting Facts",
  "026-agent-memory-forget-durable-effects": "Memory: A Forget Operation That Committed Before the Answer Failed",
  "027-rag-revocation-publish-replay": "RAG: Revocation and Historical Replay",
  "020-agent-extension-host-smartphone": "Extension Host: From Feature Phone to Smartphone",
  "mcp-host-from-discovery-to-consumption": "MCP Host: From Discovery to Usable Tools",
  "agent-model-capability-presentation-tool-surface": "Tool Surface: Why the Model Cannot See an Available Tool",
  "agent-content-trust-prompt-injection": "Prompt Injection Is More Than Malicious Text: An Agent Content Trust Boundary",
  "agent-multi-ecosystem-hook-execution": "Multi-Ecosystem Hooks: Claude, Pi and Codex",
  "agent-tool-lifecycle-and-model-input": "Observing the Tool-to-Model Input Lifecycle",
  "agent-runtime-constraint-governance-v2": "Run Budget and Constraint Governance",
  "agent-autonomous-scheduled-research": "Scheduled Research Beyond a Conversation",
  "025-agent-langfuse-from-trace-to-trustworthy-observability": "Langfuse: From Traces to Trustworthy Observability",
  "019-agent-answer-publication": "Publication: Why Answers Need Their Own Delivery System",
  "agent-progressive-answer-coherence": "Keeping Progressive Answers Coherent",
  "agent-asynchronous-research-time-bound-delivery": "Async Research: Delivering on Time After Users Leave",
  "017-prompt-to-answer-six-layer-panorama": "From One Question to a Six-Layer Agent System",
  "011-model-understands-code-authorizes": "Models Understand; Code Authorizes",
  "runtime-model-protocol-boundary-agent-article-v2": "Don't Turn the Model into a State Machine",
  "agent-model-runtime-mcp-skill-boundaries": "Responsibilities of Model, Runtime, MCP and Skills",
  "agent-veto-authority-and-run-termination": "Run Termination, Stage Budgets and Safe Recovery",
  "mcp-market-responsibility-retrospective": "Why Financial Market MCP Became a Decision System",
  "ai-citations-do-not-prove-reliability": "Why More Citations Do Not Prove Reliability",
  "agent-failure-is-a-boundary-problem": "Stop Blaming Every Failure on the Model",
  "code-cheaper-systems-harder-to-evolve": "Code Is Cheaper; Why Are Systems Harder to Evolve?",
  "agent-html-evolution-challenges": "Why Saved HTML Can Still Fail Delivery",
  "001-one-week-4-billion-tokens-etf-investment-agent": "Building an ETF Research Assistant",
  "030-fintech-from-research-to-investment-advice": "Boundaries Between Research, Advice and Trading",
  "031-fintech-data-time-and-reproducible-numbers": "Financial Data: Time, Definitions and Reproducibility",
  "financial-agent-python-result-consumption": "Why Python Results Can Still Be Misused in Reports",
  "financial-agent-trustworthy-evidence-chain": "A Trustworthy Evidence Chain for Financial Agents",
  "agent-weekly-thesis-history-continuous-research": "After the Weekly Report, Does the Agent Remember Why?",
  "026-agent-spec-evidence-workflow": "Specs, Evidence and Verifiable Engineering Closure",
  "agent-weekly-review-staged-delivery": "Why We Split a Large Weekly Review Spec into Three Phases",
  "027-agent-context-document-history": "Engineering Knowledge: Context, Memory and Retirement",
  "honest-agent-evaluation": "Tests and Evaluations: What Does Green Prove?",
  "test-lifecycle-refactoring-retirement-and-spec": "Tests Expire Too: Move Refactoring, Retirement, and Deletion into the Spec",
  "032-ai-development-from-bug-loop-to-task-convergence": "From Bug-Fix Loops to Task Convergence"
}
export const englishArticleSlugs = [
  "mcp-host-from-discovery-to-consumption",
  "mcp-market-responsibility-retrospective",
  "runtime-model-protocol-boundary-agent-article-v2",
  "code-cheaper-systems-harder-to-evolve",
  "ai-citations-do-not-prove-reliability",
  "agent-subagent-context-specialization",
  "agent-python-compute-workbench-evolution",
  "agent-runtime-constraint-governance-v2",
  "020-agent-extension-host-smartphone",
  "agent-multi-ecosystem-hook-execution",
  "agent-failure-is-a-boundary-problem",
  "agent-model-runtime-mcp-skill-boundaries",
  "025-agent-langfuse-from-trace-to-trustworthy-observability",
  "adaptive-research-python-workbench",
  "agent-progressive-answer-coherence",
  "agent-veto-authority-and-run-termination",
  "unavailable-is-correct",
  "agent-model-capability-presentation-tool-surface",
  "agent-content-trust-prompt-injection",
  "tool-results-outside-model-context",
  "026-agent-memory-forget-durable-effects",
  "027-rag-revocation-publish-replay",
  "030-fintech-from-research-to-investment-advice",
  "032-ai-development-from-bug-loop-to-task-convergence",
  "001-one-week-4-billion-tokens-etf-investment-agent",
  "agent-tool-lifecycle-and-model-input",
  "024-agent-pdf-from-text-to-evidence",
  "agent-html-evolution-challenges",
  "011-model-understands-code-authorizes",
  "agent-autonomous-scheduled-research",
  "honest-agent-evaluation",
  "test-lifecycle-refactoring-retirement-and-spec",
  "agent-main-run-context-compaction",
  "financial-agent-python-result-consumption",
  "031-fintech-data-time-and-reproducible-numbers",
  "026-agent-spec-evidence-workflow",
  "027-agent-context-document-history",
  "agent-weekly-review-staged-delivery",
  "agent-asynchronous-research-time-bound-delivery",
  "agent-weekly-thesis-history-continuous-research"
] // Register only reviewed, full English editions; never summary placeholders.
const headings = {
  "研究入口、阅读与计算": [
    "Research, Reading and Computing",
    "How Entry, Web, PDF, subagents and isolated computation cooperate."
  ],
  "上下文、研究资产与知识": [
    "Context, Results and Knowledge",
    "What the model sees and which evidence it may read."
  ],
  "运行时、扩展与观测": [
    "Runtime, Extensions and Observability",
    "How capabilities are discovered, authorized, executed and observed."
  ],
  "答案、发布与恢复": [
    "Answer Delivery and Recovery",
    "An answer candidate, durable effects and delivery are separate facts."
  ],
  "系统全景与职责边界": [
    "System Architecture and Responsibilities",
    "Who interprets, authorizes, owns facts and removes obsolete structures."
  ],
  "可靠性、反馈与系统治理": [
    "Reliability, Feedback and Governance",
    "Find the real point of failure instead of misdiagnosing feedback."
  ],
  "工程演化与金融边界": [
    "Evolution and Financial Boundaries",
    "Distinguish analysis, advice, execution and reproducible financial calculations."
  ],
  "Spec、证据与工程记忆": [
    "Specs, Evidence and Engineering Memory",
    "From specifications to execution evidence and durable project history."
  ],
  "真实验证与任务收敛": [
    "Real Validation and Task Convergence",
    "From misleading green tests to verifiable task completion."
  ]
}
const labels = {
  modules: ['Module Deep Dives','Concrete mechanisms from input through execution to delivery.'],
  thinking: ['Architecture and Systems Thinking','System boundaries, responsibility, reliability and change.'],
  engineering: ['AI Agent Engineering Practice','How coding agents develop, validate, maintain and evolve software.']
}
export const englishCollections = collections.map(collection => ({
  ...collection,
  title: labels[collection.id][0],
  subtitle: labels[collection.id][1],
  chapters: collection.chapters.map(chapter => ({
    ...chapter,
    title: headings[chapter.title][0],
    desc: headings[chapter.title][1],
    items: chapter.items.map(([slug, title]) => [slug, englishTitles[slug] || title])
  }))
}))
export function englishArticlePath(slug) {
  const canonical = mergedArticles[slug] || slug
  return (englishArticleSlugs.includes(canonical) ? '/en' : '') + '/articles/' + canonical
}
