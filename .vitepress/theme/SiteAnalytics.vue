<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { createAnalytics, mountAnalyticsConsent } from '../../site-analytics.mjs'
const route = useRoute()
let cleanup: (() => void) | undefined
onMounted(() => { cleanup = mountAnalyticsConsent(window, document) })
onUnmounted(() => cleanup?.())
watch(() => route.path, async () => {
  await nextTick()
  createAnalytics(window, document)?.pageView()
})
</script>
<template><span hidden aria-hidden="true"></span></template>
