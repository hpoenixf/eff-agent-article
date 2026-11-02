<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { chapters, panoramaSeriesSlugs } from '../../book.mjs'
import { englishArticlePath, englishTitles } from '../../book.en.mjs'

const { lang } = useData()
const english = computed(() => lang.value.startsWith('en'))
const chineseTitles = new Map<string, string>(
  chapters.flatMap((chapter: { items: Array<[string, string]> }) => chapter.items)
)

// Descriptions are editorial labels, not another index of article IDs or ownership.
const descriptions: Record<string, { zh: [string, string]; en: [string, string] }> = {
  '017-prompt-to-answer-six-layer-panorama-v3': {
    zh: ['系统运行全景', '沿 L1–L6 梳理输入、身份、Main/Child、工具、发布和界面，读懂一次任务如何在真实交接中推进。'],
    en: ['SYSTEM RUNTIME', 'Follow L1–L6 from input and identity through Main/Child, tools, publication and UI to understand the full execution lifecycle.']
  },
  'financial-agent-system-panorama': {
    zh: ['金融业务全景', '从投资者、机构和责任治理三个视角，分清研究、金融数据、业务授权与真实交易效果。'],
    en: ['FINANCIAL SYSTEMS', 'Connect investors, institutions and accountability while distinguishing research, financial data, authorization and real effects.']
  },
  'one-report-nine-architecture-judgments': {
    zh: ['架构决策全景', '以一份可回读的文档报告贯穿九个架构判断：分工、权限、证据、恢复、交付和长期演进。'],
    en: ['ARCHITECTURE DECISIONS', 'Use one verifiable document report to explore nine design judgments about ownership, permissions, evidence, recovery, delivery and evolution.']
  },
  'agent-context-governance-principles': {
    zh: ['上下文治理·原则篇', '目标、依据、边界、记忆、探索与进展怎样形成同一份任务视图，让每一步判断围绕目标展开。'],
    en: ['CONTEXT · PRINCIPLES', 'How goals, evidence, boundaries, memory, discovery and progress form one task view and keep decisions aligned with the goal.']
  },
  'agent-context-governance-actions': {
    zh: ['上下文治理·行动篇', '从系统提示词和记忆召回，到结果回读、进展更新、纠正遗忘、压缩与接续，讲清具体交接。'],
    en: ['CONTEXT · PRACTICE', 'Connect system prompts, memory recall and forgetting, exact readback, progress updates, compaction and continuation.']
  },
  '025-agent-langfuse-from-trace-to-trustworthy-observability': {
    zh: ['可观测全景', '贯通模型请求、工具、实际输入、发布与历史回查，分清原始执行事实、遥测副本和观察缺口。'],
    en: ['OBSERVABILITY', 'Connect model requests, tools, actual inputs, publication and readback while preserving original facts and observation gaps.']
  },
  'honest-agent-evaluation': {
    zh: ['测评全景', '从声明、样本与分母，到裁判、实际交付、可比对照和成本，判断一项研究到底证明了什么。'],
    en: ['EVALUATION', 'Follow claims, samples, denominators, graders, delivered content, comparable trials and cost to understand what a result establishes.']
  },
  'ai-citations-do-not-prove-reliability': {
    zh: ['引用全景', '沿资料版本、实际片段、派生计算与最终主张追溯依据，把来源关系和语义判断分别讲清。'],
    en: ['CITATIONS', 'Trace source versions, exposed passages, calculations and final claims while keeping provenance and semantic judgment distinct.']
  },
  'agent-subagent-context-specialization': {
    zh: ['Subagent 全景', '讲透独立上下文、专业方法、真实依赖、成果交接、恢复和总开销，让局部自主回到整体交付。'],
    en: ['SUBAGENTS', 'Connect context isolation, methods, dependencies, handoffs, recovery and total cost so local autonomy serves one delivered result.']
  },
  'agent-long-horizon-research-panorama': {
    zh: ['超长研究全景', '把研究循环、上下文减负、阶段交付、中断恢复、显式接续与用户调整串成一条持续工作的路径。'],
    en: ['LONG-HORIZON RESEARCH', 'Connect research loops, context reduction, staged delivery, recovery, explicit continuation and user adjustments across time.']
  },
  'vertical-financial-agent-principles-panorama': {
    zh: ['金融垂类原则', '沿基金组合研究区分通用执行框架、金融领域能力和业务产品，说明何时值得自研运行时。'],
    en: ['FINANCIAL DOMAIN PRINCIPLES', 'Distinguish general agent execution, financial domain capabilities and business products, including when a custom runtime is justified.']
  },
  'etf-agent-framework-comparison-panorama': {
    zh: ['金融架构对照', '沿同一基金研究任务对照 Pi、Claude Agent SDK、LangGraph 与 ETF Agent，判断应复用什么、保留什么。'],
    en: ['FRAMEWORK COMPARISON', 'Compare Pi, Claude Agent SDK, LangGraph and ETF Agent along one fund-research task to identify what to reuse and preserve.']
  },
  'rag-end-to-end-system-panorama': {
    zh: ['RAG 全链路全景', '沿基金公告研究贯通资料入库、受控检索、模型真实消费、回答披露与质量评测，说明何时需要、何时应简化 RAG。'],
    en: ['END-TO-END RAG', 'Trace a fund notice through ingestion, authorized retrieval, real model consumption, disclosure and evaluation—and learn when simpler reading wins.']
  }
}
const cards = computed(() => panoramaSeriesSlugs.map((slug: string, index: number) => {
  const copy = descriptions[slug][english.value ? 'en' : 'zh']
  return {
    slug,
    ordinal: String(index + 1).padStart(2, '0'),
    type: copy[0],
    summary: copy[1],
    title: english.value
      ? (englishTitles as Record<string, string>)[slug]
      : chineseTitles.get(slug),
    href: english.value ? englishArticlePath(slug) : '/articles/' + slug
  }
}))
</script>

<template>
  <section class="panorama-series-grid" :aria-label="english ? 'Panorama series articles' : '全景系列文章'">
    <article v-for="card in cards" :key="card.slug" class="panorama-series-card">
      <p class="panorama-series-card__category">{{ card.ordinal }} / {{ card.type }}</p>
      <h2><a :href="withBase(card.href)">{{ card.title }}</a></h2>
      <p>{{ card.summary }}</p>
      <a class="panorama-series-card__read" :href="withBase(card.href)">
        {{ english ? 'Read full essay' : '阅读全景正文' }} <span aria-hidden="true">↗</span>
      </a>
    </article>
  </section>
</template>
