<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const props = defineProps<{ articleOnly?: boolean }>()
const { page, lang } = useData()
const visible = computed(() => lang.value.startsWith('zh') &&
  (!props.articleOnly || page.value.relativePath.startsWith('articles/')))
const imageUrl = withBase('/images/wechat-public-account.jpg')
</script>

<template>
  <aside v-if="visible" id="wechat-public-account" class="wechat-follow" aria-label="小飞的 AI 投研工坊微信公众号">
    <a :href="imageUrl" aria-label="查看小飞的 AI 投研工坊微信公众号二维码原图">
      <img :src="imageUrl" alt="小飞的 AI 投研工坊微信公众号关注二维码" width="180" height="180" loading="lazy" />
    </a>
    <div>
      <strong>微信公众号 · 小飞的 AI 投研工坊</strong>
      <p>扫码关注，在微信里继续阅读 Agent 工程实践。</p>
      <p>手机端可保存二维码，再在微信中识别。</p>
    </div>
  </aside>
</template>

<style scoped>
.wechat-follow { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; margin: 24px 0; padding: 20px; border: 1px solid var(--vp-c-divider); border-radius: 12px; }
.wechat-follow img { display: block; max-width: 100%; height: auto; }
.wechat-follow p { margin: 8px 0 0; color: var(--vp-c-text-2); font-size: 14px; }
</style>
