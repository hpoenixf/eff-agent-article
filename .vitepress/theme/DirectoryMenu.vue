<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import ReadingDirectory from './ReadingDirectory.vue'
const { lang } = useData()
const route = useRoute()
const menu = ref<HTMLDetailsElement>()
function close() { if (menu.value) menu.value.open = false }
function outside(event: Event) { if (event.target instanceof Node && !menu.value?.contains(event.target)) close() }
function escape(event: KeyboardEvent) { if (event.key === 'Escape' && menu.value?.open) { close(); menu.value.querySelector('summary')?.focus() } }
watch(() => route.path, close)
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('focusin', outside); document.addEventListener('keydown', escape) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); document.removeEventListener('keydown', escape) })
</script>
<template>
  <details ref="menu" class="directory-menu">
    <summary>{{ lang.startsWith('en') ? 'Directory' : '文章目录' }}</summary>
    <div class="directory-menu-panel"><ReadingDirectory /></div>
  </details>
</template>
<style scoped>
.directory-menu { position: relative; margin-right: 12px; }
.directory-menu > summary { cursor: pointer; padding: 12px 4px; font-size: 14px; font-weight: 600; }
.directory-menu-panel { position: absolute; top: 100%; right: 0; width: min(390px, 90vw); max-height: 75vh; overflow: auto; padding: 12px 20px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); box-shadow: var(--vp-shadow-3); }
@media (max-width: 767px) { .directory-menu { display: none; } }
@media (min-width: 960px) { :global(.VPNavBar.has-sidebar .directory-menu) { display: none; } }
</style>
