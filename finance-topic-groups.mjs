// Display-only research questions. Finance tags remain the membership authority.
export const financeTopicGroups = {
  "a3": [
    "agent-weekly-thesis-history-continuous-research"
  ],
  "b1": [
    "031-fintech-data-time-and-reproducible-numbers",
    "agent-numeric-kernel-exact-units-rounding",
    "portfolio-mcp-readonly-investment-data",
    "agent-deterministic-fund-allocation",
    "agent-atomic-portfolio-report-production"
  ],
  "b2": [
    "financial-agent-trustworthy-evidence-chain",
    "financial-agent-python-result-consumption",
    "rag-retrieval-evaluation-evidence"
  ],
  "b3": [
    "investment-perspectives-and-thesis-falsification"
  ],
  "c1": [
    "030-fintech-from-research-to-investment-advice"
  ],
  "c2": [
    "011-model-understands-code-authorizes",
    "financial-business-agent-trusted-handoff"
  ],
  "d2": [
    "financial-agent-system-panorama"
  ],
  "d4": [
    "mcp-market-responsibility-retrospective"
  ],
  "d0": [
    "vertical-financial-agent-principles-panorama",
    "etf-agent-framework-comparison-panorama"
  ]
}
export function financeGroupMembers(members, category) {
 const assignments = Object.values(financeTopicGroups).flat()
 if (new Set(assignments).size !== assignments.length) throw new Error('Duplicate finance group assignment')
 if (category === 'pending') return members.filter(slug => !assignments.includes(slug))
 if (!Object.hasOwn(financeTopicGroups, category)) throw new Error('Unknown finance group: ' + category)
 return members.filter(slug => financeTopicGroups[category].includes(slug))
}
