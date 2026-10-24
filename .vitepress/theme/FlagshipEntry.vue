<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { lang } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))

const labels = computed(() => isEnglish.value ? {
  eyebrow: 'ESSENTIAL READING · START HERE',
  panoramaIndex: '01 / THE SYSTEM MAP',
  panoramaTitle: 'Six-layer Agent architecture',
  panoramaText: 'Follow one question through the Native Loop, tool execution, evidence, publication and durable human collaboration.',
  panoramaAction: 'Read the complete architecture →',
  principlesIndex: '02 / THE DECISION MAP',
  principlesTitle: 'Eight architecture principles',
  principlesText: 'Understand who owns semantics, permission, effects, recovery and the complexity of long-lived systems.',
  principlesAction: 'Explore the core principles →',
  label: 'Two essential guides to ETF Agent architecture'
} : {
  eyebrow: 'START HERE · 两篇首要必读',
  panoramaIndex: '01 / 系统运行地图',
  panoramaTitle: '六层系统全景',
  panoramaText: '从一句提问，走过 Native Loop、工具执行、证据计算、发布恢复与持久人机协作。',
  panoramaAction: '完整阅读六层全景 →',
  principlesIndex: '02 / 架构判断地图',
  principlesTitle: '八条架构核心原则',
  principlesText: '弄清模型、Runtime、权限、效果、Owner 与持续演化的关键设计取舍。',
  principlesAction: '查看八条架构原则 →',
  label: 'ETF Agent 架构的两篇首要必读'
})
</script>

<template>
  <section class="flagship-entry" :class="{ 'is-compact': props.compact }" :aria-label="labels.label">
    <p class="flagship-entry__eyebrow">{{ labels.eyebrow }}</p>
    <div class="flagship-entry__grid">
      <a class="flagship-entry__card flagship-entry__card--panorama"
         :href="withBase(isEnglish ? '/en/articles/017-prompt-to-answer-six-layer-panorama' : '/articles/017-prompt-to-answer-six-layer-panorama')">
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
