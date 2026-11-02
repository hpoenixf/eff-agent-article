<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { openSourceExample } from './article-context.mjs'

const { page, lang } = useData()
const repo = 'https://github.com/hpoenixf/open-etf-agent'
const example = computed(() => openSourceExample(page.value.relativePath))
const visible = computed(() => Boolean(example.value))
const english = computed(() => lang.value.startsWith('en'))
</script>

<template>
  <aside v-if="visible" class="open-source-bridge" :aria-label="english ? 'Runnable companion project' : '可运行的配套开源项目'">
    <div class="open-source-bridge__copy">
      <strong>{{ english ? 'Runnable code: Open ETF Agent (MIT)' : '可运行源码：Open ETF Agent（MIT）' }}</strong>
      <p>{{ english
        ? 'A separate staged teaching implementation with offline demos and verifiable receipts—not the complete internal ETF Agent product or a live investing system.'
        : '独立的分阶段教学实现，包含离线 Demo、测试与可回读交付；不是内部完整 ETF Agent 产品源码，也不代表实时投研或生产就绪。' }}</p>
    </div>
    <div class="open-source-bridge__links">
      <a :href="repo" target="_blank" rel="noopener noreferrer">{{ english ? 'Source and quickstart ↗' : '查看源码与运行说明 ↗' }}</a>
      <a v-if="example" :href="repo + '/blob/main/' + example" target="_blank" rel="noopener noreferrer">
        {{ english ? 'Related teaching example:' : '相关教学示例：' }} <code>{{ example }}</code> ↗
      </a>
    </div>
  </aside>
</template>
