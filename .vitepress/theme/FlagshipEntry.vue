<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { lang } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))

const labels = computed(() => isEnglish.value ? {
  eyebrow: 'ESSENTIAL READING · START HERE',
  panoramaIndex: '01 / THE SYSTEM MAP',
  panoramaTitle: 'Six-layer request lifecycle V3',
  panoramaText: 'Follow a question through admission, context, Main and subagents, optional tools, Publication and the user interface.',
  panoramaAction: 'Read the complete architecture →',
  principlesIndex: '02 / THE DECISION MAP',
  principlesTitle: 'Nine architecture principles',
  principlesText: 'Understand who owns semantics, permission, effects, recovery and the complexity of long-lived systems.',
  principlesAction: 'Explore the core principles →',
  label: 'Two essential guides to ETF Agent architecture'
} : {
  eyebrow: 'START HERE · 两篇首要必读',
  panoramaIndex: '01 / 系统运行地图',
  panoramaTitle: '六层调用全景 V3',
  panoramaText: '沿一次请求看接入、上下文、Main 与子代理、可选工具、发布和界面渲染。',
  panoramaAction: '完整阅读六层全景 →',
  principlesIndex: '02 / 架构判断地图',
  principlesTitle: '九条架构核心原则',
  principlesText: '弄清模型、Runtime、权限、效果、Owner 与持续演化的关键设计取舍。',
  principlesAction: '查看九条架构原则 →',
  label: 'ETF Agent 架构的两篇首要必读'
})
</script>

<template>
  <section class="flagship-entry" :class="{ 'is-compact': props.compact }" :aria-label="labels.label">
    <p class="flagship-entry__eyebrow">{{ labels.eyebrow }}</p>
    <div class="flagship-entry__grid">
      <a class="flagship-entry__card flagship-entry__card--panorama"
         :href="withBase(isEnglish ? '/en/articles/017-prompt-to-answer-six-layer-panorama-v3' : '/articles/017-prompt-to-answer-six-layer-panorama-v3')">
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
