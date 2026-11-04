<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { learningPathSlugs } from '../../book.mjs'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { lang } = useData()
const isEnglish = computed(() => lang.value.startsWith('en'))
const copy = computed(() => isEnglish.value ? {
  eyebrow: 'OPEN ETF AGENT · FIVE STOPS',
  label: 'Introduction, Intermediate, Deep Dive, Workshop, Panorama',
  stages: ['01 / INTRODUCTION', '02 / INTERMEDIATE', '03 / DEEP DIVE', '04 / WORKSHOP', '05 / PANORAMA'],
  titles: ['Agents in 15 Minutes', 'Ten Core Modules in Open ETF Agent', 'From One Report to Durable Execution and Specialists', 'Bring Your Own Documents to an Agent', 'Six-Layer Request Lifecycle'],
  descriptions: [
    'Run the small T1 example in v0.15 and understand how AI chooses each next step.',
    'Connect the loop to ten groups of actual code, from tools and Skills to memory and sessions.',
    'Follow data into reports, a task across processes, and Main/Child collaboration in one combined guide.',
    'Use the v0.20 public project entry to import your documents, check reports and continue the same task.',
    'With the working path in mind, expand to the complete architecture and focused module articles.'
  ],
  action: 'Read this level →',
  principles: 'Architecture principles · optional reference →'
} : {
  eyebrow: 'OPEN ETF AGENT · 五站阅读路线',
  label: '入门、进阶、深入、练手、全景',
  stages: ['01 / 入门', '02 / 进阶', '03 / 深入', '04 / 练手', '05 / 全景'],
  titles: ['十五分钟入门 Agent', '读懂 Open ETF Agent 的十个核心模块', '从一份报告到持续执行与专家协作', '把自己的资料交给 Agent', '六层调用全景'],
  descriptions: [
    '在 v0.15 中先跑一个 T1 小例子，看懂 AI 怎样决定 Loop 的下一步。',
    '沿十组实际代码认识工具、Skill、MCP、上下文、记忆和会话。',
    '沿资料、执行和分工看模块协作；原 v0.10 系统设计与 v0.15 专家路径合并阅读。',
    '用 v0.20 公开项目入口导入自己的资料，检查报告并继续同一任务。',
    '带着已经跑过的任务，再展开完整系统架构和各模块的深入设计。'
  ],
  action: '进入这一站 →',
  principles: '架构原则 · 按需查阅 →'
})
const steps = computed(() => learningPathSlugs.map((slug, index) => ({
  slug,
  title: copy.value.titles[index],
  label: copy.value.stages[index],
  description: copy.value.descriptions[index],
  href: withBase((isEnglish.value ? '/en' : '') + '/articles/' + slug)
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
        <span class="flagship-entry__index">{{ step.label }}</span>
        <strong class="flagship-entry__title">{{ step.title }}</strong>
        <span class="flagship-entry__body">{{ step.description }}</span>
        <span class="flagship-entry__action">{{ copy.action }}</span>
      </a>
    </div>
    <p><a :href="withBase(isEnglish ? '/en/principles' : '/principles')">{{ copy.principles }}</a></p>
  </section>
</template>
