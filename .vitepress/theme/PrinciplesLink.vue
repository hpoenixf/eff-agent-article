<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

withDefaults(defineProps<{ placement?: 'top' | 'bottom' }>(), { placement: 'top' })
const { page, lang } = useData()
const isArticle = computed(() => /^(?:en\/)?articles\/[^/]+\.md$/.test(page.value.relativePath))
const english = computed(() => lang.value.startsWith('en'))
const principlesUrl = computed(() => withBase(english.value ? '/en/principles' : '/principles'))
</script>

<template>
  <nav v-if="isArticle" class="article-principles-link" :aria-label="english ? 'Architecture principles' : '架构原则与系统方法'">
    <span class="article-principles-label">{{ english ? 'ARCHITECTURE MAP' : '架构判断地图' }}</span>
    <a :href="principlesUrl">
      {{ placement === 'bottom'
        ? (english ? 'Back to the eight principles and six engineering methods →' : '读完了？回到八条架构原则与六组工程方法 →')
        : (english ? '← Eight core principles & six engineering methods' : '← 返回八条架构原则与六组工程方法') }}
    </a>
  </nav>
</template>
