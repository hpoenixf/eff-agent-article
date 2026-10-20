<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { articles } from '../reading.mjs'

const last = ref<{ slug: string; title: string } | null>(null)
onMounted(() => {
  try {
    const slug = window.localStorage.getItem('etf-agent-notes:last-read')
    const entry = articles.find(item => item.slug === slug)
    if (entry) last.value = { slug: entry.slug, title: entry.title }
  } catch { /* no storage, still readable */ }
})
</script>

<template>
  <div v-if="last" class="resume-reading">
    <span>继续上次阅读</span>
    <a :href="withBase('/articles/' + last.slug + '.html')">{{ last.title }} <span aria-hidden="true">↗</span></a>
  </div>
</template>
