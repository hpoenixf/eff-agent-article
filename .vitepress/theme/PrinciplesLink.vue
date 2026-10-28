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
        ? (english ? 'Back to the nine principles and seven engineering methods →' : '读完了？回到九条架构原则与七组工程方法 →')
        : (english ? '← Nine core principles & seven engineering methods' : '← 返回九条架构原则与七组工程方法') }}
    </a>
  </nav>
</template>
