<script setup lang="ts">
import { useData } from 'vitepress'
import StarLink from './StarLink.vue'

const { page } = useData()
</script>

<template>
  <aside v-if="page.relativePath.startsWith('articles/')" class="article-star" aria-label="支持工程手记">
    <div>
      <strong>这篇笔记对你有帮助吗？</strong>
      <p>欢迎到 GitHub 点个 Star，支持我们继续分享 Agent 的工程实践。</p>
    </div>
    <StarLink />
  </aside>
</template>
