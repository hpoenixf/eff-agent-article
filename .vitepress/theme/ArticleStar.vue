<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import StarLink from './StarLink.vue'

const { page, lang } = useData()
const isArticle = computed(() => /^(?:en\/)?articles\//.test(page.value.relativePath))
</script>

<template>
  <aside v-if="isArticle" class="article-star" :aria-label="lang.startsWith('en') ? 'Support this library' : '支持工程手记'">
    <div>
      <strong>{{ lang.startsWith('en') ? 'Found this useful?' : '这篇笔记对你有帮助吗？' }}</strong>
      <p>{{ lang.startsWith('en') ? 'Star the repository on GitHub to support more engineering articles.' : '欢迎到 GitHub 点个 Star，支持我们继续分享 Agent 的工程实践。' }}</p>
    </div>
    <StarLink />
  </aside>
</template>
