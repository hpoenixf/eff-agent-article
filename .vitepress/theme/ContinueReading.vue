<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase, useData } from 'vitepress'
import { englishArticleSlugs, historicalEnglishArticleSlugs } from '../../book.en.mjs'
const { lang } = useData()

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
  <a v-if="last" class="resume-reading" :href="withBase((lang.startsWith('en') && (englishArticleSlugs.includes(last.slug) || historicalEnglishArticleSlugs.includes(last.slug)) ? '/en' : '') + '/articles/' + last.slug)">
    <span>↗ {{ lang.startsWith('en') ? 'Last read' : '上次读到' }}</span> <strong>{{ last.title }}</strong> <span>{{ lang.startsWith('en') ? 'Continue →' : '继续阅读 →' }}</span>
  </a>
</template>
