// English presentation only. The canonical article IDs and ordering live in book.mjs.
import { collections } from './book.mjs'
export const englishTitles = {
  "022-agent-entry-from-intent-to-direct-research": "Entry: Why the Entry Point Became Simpler",
  "021-agent-web-research-from-search-to-deep-reading": "Web Research: From Search to Deep Reading",
  "024-agent-pdf-from-text-to-evidence": "PDF: From Text to Evidence",
  "agent-subagent-context-specialization": "Subagents: Isolation and Specialized Collaboration",
  "adaptive-research-python-workbench": "Adaptive Research and Python",
  "agent-python-compute-workbench-evolution": "Python: From Tool to Computational Workbench",
  "portfolio-mcp-readonly-investment-data": "Connecting Portfolio Data Through a Read-Only MCP",
  "unavailable-is-correct": "Controlled Refresh for Stale Data",
  "tool-results-outside-model-context": "Why Tool Results Should Not All Enter Model Context",
  "agent-main-run-context-compaction": "Main Context Compaction Without Rewriting Facts",
  "partial-is-not-complete": "Silent Truncation: Why Data Goes Missing",
  "026-agent-memory-forget-durable-effects": "Memory: A Forget Operation That Committed Before the Answer Failed",
  "027-rag-revocation-publish-replay": "RAG: Revocation and Historical Replay",
  "020-agent-extension-host-smartphone": "Extension Host: From Feature Phone to Smartphone",
  "mcp-host-from-discovery-to-consumption": "MCP Host: From Discovery to Usable Tools",
  "agent-multi-ecosystem-hook-execution": "Multi-Ecosystem Hooks: Claude, Pi and Codex",
  "agent-tool-lifecycle-and-model-input": "Observing the Tool-to-Model Input Lifecycle",
  "agent-runtime-constraint-governance-v2": "Run Budget and Constraint Governance",
  "agent-autonomous-scheduled-research": "Scheduled Research Beyond a Conversation",
  "025-agent-langfuse-from-trace-to-trustworthy-observability": "Langfuse: From Traces to Trustworthy Observability",
  "019-agent-answer-publication": "Publication: Why Answers Need Their Own Delivery System",
  "agent-progressive-answer-coherence": "Keeping Progressive Answers Coherent",
  "honest-agent-failure-semantics": "Honest Failure States and Safe Recovery",
  "017-prompt-to-answer-six-layer-panorama": "From One Question to a Six-Layer Agent System",
  "010-agent-first-brakes": "Why an Agent Needs Brakes First",
  "011-model-understands-code-authorizes": "Models Understand; Code Authorizes",
  "runtime-model-protocol-boundary-agent-article-v2": "Don't Turn the Model into a State Machine",
  "agent-model-runtime-mcp-skill-boundaries": "Responsibilities of Model, Runtime, MCP and Skills",
  "agent-veto-authority-and-run-termination": "Scattered Veto Powers and Run Termination",
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
  "026-agent-spec-evidence-workflow": "Specs, Evidence and Verifiable Engineering Closure",
  "027-agent-context-document-history": "On-Demand Documentation and Engineering History",
  "green-tests-can-lie": "Green Tests Can Lie",
  "honest-agent-evaluation": "A Model Response Does Not Mean an Evaluation Passed",
  "032-ai-development-from-bug-loop-to-task-convergence": "From Bug-Fix Loops to Task Convergence"
}
export const englishArticleSlugs = ['tool-results-outside-model-context'] // Only complete, reviewed English Markdown belongs here.
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
  return (englishArticleSlugs.includes(slug) ? '/en' : '') + '/articles/' + slug
}
