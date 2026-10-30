<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { learningPathNavigation } from './learning-path-nav.mjs'

const { page } = useData()
const navigation = computed(() => learningPathNavigation(page.value.relativePath))
</script>

<template>
  <nav v-if="navigation" class="learning-path-nav" :aria-label="navigation.english ? 'Four-stop reading path' : '四站阅读路线'">
    <p class="learning-path-heading">{{ navigation.english ? 'READING PATH' : '四站阅读路线' }}</p>
    <ol class="learning-path-steps">
      <li v-for="step in navigation.steps" :key="step.slug">
        <span v-if="step.current" class="learning-path-step is-current" aria-current="page">
          <span class="learning-path-number" aria-hidden="true">{{ step.number }}</span>
          <span>{{ step.label }}<small>{{ navigation.english ? 'Current' : '当前' }}</small></span>
        </span>
        <a v-else class="learning-path-step" :href="withBase(step.href)">
          <span class="learning-path-number" aria-hidden="true">{{ step.number }}</span>
          <span>{{ step.label }}</span>
        </a>
      </li>
    </ol>
    <p v-if="navigation.next" class="learning-path-next">
      {{ navigation.english ? 'Recommended next:' : '建议下一站：' }}
      <a :href="withBase(navigation.next.href)">{{ navigation.next.label }} <span aria-hidden="true">→</span></a>
    </p>
    <p v-else class="learning-path-next">{{ navigation.english ? 'All four stops remain available above.' : '已到全景，可从上方返回任意一站。' }}</p>
  </nav>
</template>

<style scoped>
.learning-path-nav { margin: 24px 0 32px; padding: 18px; border: 1px solid var(--vp-c-divider); border-radius: 14px; background: var(--vp-c-bg-soft); }
.learning-path-heading { margin: 0 0 12px; color: var(--vp-c-text-2); font-size: 13px; font-weight: 700; letter-spacing: .06em; }
.learning-path-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; list-style: none; padding: 0; margin: 0; }
.learning-path-steps li { margin: 0; }
.learning-path-step { display: flex; align-items: center; gap: 8px; min-height: 58px; height: 100%; padding: 10px; border: 1px solid var(--vp-c-divider); border-radius: 9px; line-height: 1.4; font-size: 14px; text-decoration: none; color: var(--vp-c-text-1); background: var(--vp-c-bg); overflow-wrap: anywhere; }
a.learning-path-step:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
a.learning-path-step:focus-visible, .learning-path-next a:focus-visible { outline: 3px solid var(--vp-c-brand-1); outline-offset: 3px; }
.learning-path-step.is-current { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); font-weight: 700; }
.learning-path-number { display: grid; place-items: center; flex: 0 0 24px; height: 24px; border-radius: 50%; background: var(--vp-c-default-soft); font-size: 12px; }
.is-current .learning-path-number { color: var(--vp-c-bg); background: var(--vp-c-brand-1); }
.learning-path-step small { display: block; color: var(--vp-c-text-2); font-size: 12px; font-weight: 400; }
.learning-path-next { margin: 12px 0 0; color: var(--vp-c-text-2); font-size: 14px; }
@media (max-width: 640px) { .learning-path-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media print { .learning-path-nav { break-inside: avoid; } }
</style>
