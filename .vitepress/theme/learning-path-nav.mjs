import { learningPathSlugs } from '../../book.mjs'

// Presentation only. Article identity and reading order belong to book.mjs.
const presentation = {
  "agent-task-session-run-worker-schedule": {
    "zh": {
      "label": "任务与执行",
      "title": "任务、会话、Run、Worker、Schedule",
      "description": "分清继续目标、恢复执行与安排下一次机会。"
    },
    "en": {
      "label": "Tasks and execution",
      "title": "Task, Session, Run, Worker and Schedule",
      "description": "Distinguish continuing a goal, resuming execution and scheduling the next opportunity."
    }
  },
  "agent-expert-subagent-review-judge": {
    "zh": {
      "label": "分工与审阅",
      "title": "专家、Subagent、Review、Judge",
      "description": "分清谁来研究、如何分工，以及谁来检查结果。"
    },
    "en": {
      "label": "Delegation and review",
      "title": "Expert, Subagent, Review and Judge",
      "description": "Separate research roles, delegated execution and checks on the result."
    }
  },
  "open-etf-agent-report-review-workshop": {
    "zh": {
      "label": "报告复核实作",
      "title": "从保存报告到审阅与交付",
      "description": "沿练手项目检查报告、处理审阅结果并确认交付。"
    },
    "en": {
      "label": "Report review workshop",
      "title": "From a Saved Report to Review and Delivery",
      "description": "Inspect the workshop report, handle review outcomes and verify delivery."
    }
  },
  "agent-in-15-minutes": {
    "zh": {
      "label": "入门",
      "title": "十五分钟入门 Agent",
      "description": "先跑一个文档比较例子，理解最小 Agent 循环。"
    },
    "en": {
      "label": "Introduction",
      "title": "Agents in 15 Minutes",
      "description": "Run a document comparison and understand the smallest Agent loop."
    }
  },
  "prompt-context-rag-memory": {
    "zh": {
      "label": "输入与知识",
      "title": "Prompt、Context、RAG、Memory",
      "description": "分清任务要求、当前材料、检索与长期积累。"
    },
    "en": {
      "label": "Input and knowledge",
      "title": "Prompt, Context, RAG and Memory",
      "description": "Connect instructions, current inputs, retrieval and lasting preferences."
    }
  },
  "agent-ten-modules": {
    "zh": {
      "label": "进阶",
      "title": "读懂十个核心模块",
      "description": "沿实际代码认识工具、上下文、记忆和会话。"
    },
    "en": {
      "label": "Intermediate",
      "title": "Ten Core Modules",
      "description": "Follow working code through tools, context, memory and sessions."
    }
  },
  "tools-function-calling-mcp-skill": {
    "zh": {
      "label": "工具与方法",
      "title": "Tool、Function Calling、MCP、Skill",
      "description": "沿一次文档读取，理解能力怎样被发现和调用。"
    },
    "en": {
      "label": "Tools and methods",
      "title": "Tools, Function Calling, MCP and Skills",
      "description": "Follow one document read through discovery, calls and execution."
    }
  },
  "conversation-context-memory-checkpoints": {
    "zh": {
      "label": "记忆与接续",
      "title": "聊天记录、上下文、记忆、检查点",
      "description": "理解保存信息、记住偏好与继续执行的区别。"
    },
    "en": {
      "label": "Memory and continuity",
      "title": "History, Context, Memory and Checkpoints",
      "description": "Distinguish retained information, preferences and execution progress."
    }
  },
  "open-etf-agent-v010-system-design": {
    "zh": {
      "label": "深入",
      "title": "从一份报告到持续执行与专家协作",
      "description": "沿资料、执行与分工，深入系统设计和交接。"
    },
    "en": {
      "label": "Deep dive",
      "title": "From One Report to Durable Execution and Specialists",
      "description": "Connect evidence, execution and specialist handoffs."
    }
  },
  "open-etf-agent-research-project-workshop": {
    "zh": {
      "label": "练手",
      "title": "把自己的资料交给 Agent",
      "description": "导入自己的资料，检查报告并继续研究。"
    },
    "en": {
      "label": "Workshop",
      "title": "Bring Your Own Documents to an Agent",
      "description": "Import documents, inspect a report and continue your research."
    }
  },
  "017-prompt-to-answer-six-layer-panorama-v3": {
    "zh": {
      "label": "全景",
      "title": "六层调用全景",
      "description": "带着已理解的任务，展开六层系统及完整交接。"
    },
    "en": {
      "label": "Panorama",
      "title": "Six-Layer Request Lifecycle",
      "description": "Expand a familiar task into the six-layer system and its handoffs."
    }
  }
}

export function learningPathNavigation(relativePath) {
  const english = relativePath.startsWith('en/')
  const slug = relativePath.replace(/^en\//, '').replace(/^articles\//, '').replace(/\.md$/, '')
  const current = learningPathSlugs.indexOf(slug)
  if (current < 0) return null
  const steps = learningPathSlugs.map((value, index) => ({
    slug: value,
    ...presentation[value][english ? 'en' : 'zh'],
    href: `${english ? '/en' : ''}/articles/${value}`,
    current: index === current,
    number: index + 1
  }))
  return { english, steps, next: steps[current + 1] ?? null }
}

// Presentation metadata only: article identity and order remain in book.mjs.
const stageViews = [
  { key: 'intro', slug: 'agent-in-15-minutes', width: 1720, height: 1110,
    zh: '从最小 Agent 循环开始，看清输入、工具和回答如何相连。',
    en: 'Start with the smallest Agent loop: input, tools and an answer.' },
  { key: 'intermediate', slug: 'agent-ten-modules', width: 2240, height: 1110,
    zh: '沿十个模块理解一个可运行的公开教学实现。',
    en: 'Follow ten modules through a runnable public teaching implementation.' },
  { key: 'deep', slug: 'open-etf-agent-v010-system-design', width: 2240, height: 1110,
    zh: '深入固定公开版本的系统设计，连接证据、产物与交付。',
    en: 'Explore a pinned public implementation, connecting evidence, artifacts and delivery.' },
  { key: 'workshop', slug: 'open-etf-agent-research-project-workshop', width: 1280, height: 840,
    zh: '带入自己的资料，沿 v0.20 本地练习检查任务、报告和可回查来源。',
    en: 'Bring your own materials and inspect the task, saved report and sources in the v0.20 local workshop.' },
  { key: 'panorama', slug: '017-prompt-to-answer-six-layer-panorama-v3', width: 2960, height: 1824,
    zh: '回到更广的六层系统设计，查看职责与交接；不等于公开实现的功能清单。',
    en: 'See responsibilities and handoffs across the broader six-layer design—not a public implementation feature checklist.' }
]

export function learningPathStages(english = false) {
  const language = english ? 'en' : 'zh'
  return stageViews.map(view => {
    const slug = view.slug
    return {
      key: view.key, slug, label: presentation[slug][language].label, description: view[language],
      href: `${english ? '/en' : ''}/articles/${slug}`,
      src: view.key === 'panorama'
        ? `/visuals/017-prompt-to-answer-six-layer-panorama/diagrams/v3-owner-map-${language}.svg`
        : view.key === 'workshop'
          ? `/diagrams/open-workshop/six-layers-${language}.svg`
          : `/visuals/learning-stage-maps/${view.key}-${language}.svg`,
      mobileSrc: view.key === 'workshop' ? `/diagrams/open-workshop/six-layers-${language}-mobile.svg` : null,
      width: view.width, height: view.height, sourceLinks: ['intro', 'intermediate', 'deep'].includes(view.key)
    }
  })
}

export function galleryStageFromHash(hash) {
  const key = /^#stage=([a-z]+)$/.exec(hash)?.[1]
  return stageViews.some(view => view.key === key) ? key : 'panorama'
}

export function galleryStageForKey(current, key) {
  const index = stageViews.findIndex(view => view.key === current)
  const last = stageViews.length - 1
  const next = key === 'ArrowRight' ? (index + 1) % stageViews.length
    : key === 'ArrowLeft' ? (index + last) % stageViews.length
      : key === 'Home' ? 0 : key === 'End' ? last : -1
  return next < 0 ? null : stageViews[next].key
}
