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
