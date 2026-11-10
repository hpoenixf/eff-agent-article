<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { learningPathNavigation } from './learning-path-nav.mjs'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { lang } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))
const copy = computed(() => isEnglish.value ? {
  eyebrow: 'OPEN ETF AGENT · READING PATH',
  label: 'From concepts to a working research system',
  action: 'Read this step →',
  principles: 'Architecture principles · optional reference →'
} : {
  eyebrow: 'OPEN ETF AGENT · 学习路线',
  label: '从概念到可运行的研究系统',
  action: '进入这一站 →',
  principles: '架构原则 · 按需查阅 →'
})
const steps = computed(() => learningPathNavigation(`${isEnglish.value ? 'en/' : ''}articles/agent-in-15-minutes.md`)!.steps.map(step => ({
  ...step,
  href: withBase((isEnglish.value ? '/en' : '') + '/articles/' + step.slug)
})))
</script>

<template>
  <section class="flagship-entry" :class="{ 'is-compact': props.compact }" :aria-label="copy.label">
    <p class="flagship-entry__eyebrow">{{ copy.eyebrow }}</p>
    <div class="flagship-entry__grid">
      <a v-for="(step, index) in steps" :key="step.slug"
         class="flagship-entry__card"
         :class="index % 2 ? 'flagship-entry__card--principles' : 'flagship-entry__card--panorama'"
         :href="step.href">
        <span class="flagship-entry__index">{{ String(step.number).padStart(2, '0') }} / {{ step.label }}</span>
        <strong class="flagship-entry__title">{{ step.title }}</strong>
        <span class="flagship-entry__body">{{ step.description }}</span>
        <span class="flagship-entry__action">{{ copy.action }}</span>
      </a>
    </div>
    <p><a :href="withBase(isEnglish ? '/en/principles' : '/principles')">{{ copy.principles }}</a></p>
  </section>
</template>
