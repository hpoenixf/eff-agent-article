<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page } = useData()
const route = useRoute()
const progress = ref(0)
const visible = ref(false)

function updateProgress() {
  if (!visible.value) { progress.value = 0; return }
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  progress.value = Math.min(100, Math.max(0, window.scrollY / scrollRange * 100))
}
function remember() {
  const path = page.value.relativePath
  const match = /^(?:en\/)?articles\/([a-z0-9-]+)\.md$/.exec(path)
  visible.value = !!match
  if (match) {
    try {
      localStorage.setItem('etf-agent:last-read', JSON.stringify({
        slug: match[1], title: page.value.title, time: Date.now()
      }))
    } catch { /* Private browsing may disable storage. */ }
  }
  void nextTick(updateProgress)
}
onMounted(() => {
  remember()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
})
watch(() => route.path, () => { void nextTick(remember) })
</script>

<template>
  <div v-if="visible" class="reading-progress" role="progressbar" aria-label="阅读进度" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100">
    <div :style="{ width: progress + '%' }" />
  </div>
</template>
