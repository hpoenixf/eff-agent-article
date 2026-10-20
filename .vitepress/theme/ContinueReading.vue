<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const last = ref<{ slug: string, title: string } | null>(null)
onMounted(() => {
  try {
    const value = JSON.parse(localStorage.getItem('etf-agent:last-read') || 'null')
    if (value && /^[a-z0-9-]+$/.test(value.slug) && typeof value.title === 'string') {
      last.value = { slug: value.slug, title: value.title }
    }
  } catch { /* No local history: hide this link. */ }
})
</script>

<template>
  <a v-if="last" class="resume-reading" :href="withBase('/articles/' + last.slug)">
    <span>↗ 上次读到</span> <strong>{{ last.title }}</strong> <span>继续阅读 →</span>
  </a>
</template>
