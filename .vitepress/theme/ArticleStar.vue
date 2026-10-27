<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import StarLink from './StarLink.vue'

const { page, lang } = useData()
const isArticle = computed(() => /^(?:en\/)?articles\//.test(page.value.relativePath))
const feedbackUrl = computed(() => 'https://github.com/hpoenixf/eff-agent-article/issues/new?title=' +
  encodeURIComponent('Reader feedback: ' + page.value.relativePath) + '&body=' +
  encodeURIComponent('Page: https://hpoenixf.com/eff-agent-article/' + page.value.relativePath.replace(/\.md$/, '') + '\n\nWhat was unclear or needs correction?\n'))
</script>

<template>
  <aside v-if="isArticle" class="article-star" :aria-label="lang.startsWith('en') ? 'Support this library' : '支持工程手记'">
    <div>
      <strong>{{ lang.startsWith('en') ? 'Found this useful?' : '这篇笔记对你有帮助吗？' }}</strong>
      <p>{{ lang.startsWith('en') ? 'Star the repository on GitHub to support more engineering articles.' : '欢迎到 GitHub 点个 Star，支持我们继续分享 Agent 的工程实践。' }}</p>
    </div>
    <div class="article-star__actions">
      <a :href="feedbackUrl" target="_blank" rel="noopener noreferrer">{{ lang.startsWith('en') ? 'Report unclear or incorrect content ↗' : '哪里没讲清 / 发现错误 ↗' }}</a>
      <StarLink />
    </div>
  </aside>
</template>
