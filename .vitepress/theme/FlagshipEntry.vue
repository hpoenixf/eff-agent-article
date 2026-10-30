<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { lang } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))

const labels = computed(() => isEnglish.value ? {
  eyebrow: 'START HERE · LEARN THEN EXPLORE',
  panoramaIndex: '01 / THE RUNNABLE INTRO',
  panoramaTitle: 'Agents in 15 minutes',
  panoramaText: 'Use a reproducible document comparison to learn the model, Runtime, tools and real report delivery. Follow the link inside for the full six-layer map.',
  panoramaAction: 'Start with the example →',
  principlesIndex: '02 / THE DECISION MAP',
  principlesTitle: 'Nine architecture principles',
  principlesText: 'Understand who owns semantics, permission, effects, recovery and the complexity of long-lived systems.',
  principlesAction: 'Explore the core principles →',
  label: 'Two starting points for learning Agent engineering'
} : {
  eyebrow: 'START HERE · 从易到难',
  panoramaIndex: '01 / 可运行的入门案例',
  panoramaTitle: '十五分钟入门 Agent',
  panoramaText: '用真实可跑的合成文档比较，先理解模型、Runtime、工具与报告回读；文末再进入六层全景。',
  panoramaAction: '从案例开始 →',
  principlesIndex: '02 / 架构判断地图',
  principlesTitle: '九条架构核心原则',
  principlesText: '弄清模型、Runtime、权限、效果、Owner 与持续演化的关键设计取舍。',
  principlesAction: '查看九条架构原则 →',
  label: 'Agent 工程的两个阅读起点'
})
</script>

<template>
  <section class="flagship-entry" :class="{ 'is-compact': props.compact }" :aria-label="labels.label">
    <p class="flagship-entry__eyebrow">{{ labels.eyebrow }}</p>
    <div class="flagship-entry__grid">
      <a class="flagship-entry__card flagship-entry__card--panorama"
         :href="withBase(isEnglish ? '/en/articles/agent-in-15-minutes' : '/articles/agent-in-15-minutes')">
        <span class="flagship-entry__index">{{ labels.panoramaIndex }}</span>
        <strong class="flagship-entry__title">{{ labels.panoramaTitle }}</strong>
        <span class="flagship-entry__body">{{ labels.panoramaText }}</span>
        <span class="flagship-entry__action">{{ labels.panoramaAction }}</span>
      </a>
      <a class="flagship-entry__card flagship-entry__card--principles"
         :href="withBase(isEnglish ? '/en/principles' : '/principles')">
        <span class="flagship-entry__index">{{ labels.principlesIndex }}</span>
        <strong class="flagship-entry__title">{{ labels.principlesTitle }}</strong>
        <span class="flagship-entry__body">{{ labels.principlesText }}</span>
        <span class="flagship-entry__action">{{ labels.principlesAction }}</span>
      </a>
    </div>
  </section>
</template>
