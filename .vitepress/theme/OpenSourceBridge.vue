<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, lang } = useData()
const repo = 'https://github.com/hpoenixf/open-etf-agent'
const examples: Record<string, string> = {
  '019-agent-answer-publication': 'src/publication.mjs',
  '020-agent-extension-host-smartphone': 'src/extensions.mjs',
  '026-agent-memory-forget-durable-effects': 'src/memory-effects.mjs',
  'mcp-host-from-discovery-to-consumption': 'src/mcp.mjs',
  'agent-subagent-context-specialization': 'src/child.mjs',
  'agent-main-run-context-compaction': 'src/compaction.mjs',
  'agent-model-runtime-mcp-skill-boundaries': 'src/runtime.mjs',
  'open-etf-agent-v01-first-readable-report': 'src/cli.mjs'
}
const landing = new Set(['index', 'modules', 'thinking', 'architecture', 'engineering', 'fintech', 'principles'])
const current = computed(() => page.value.relativePath.replace(/\.md$/, '').replace(/^en\//, ''))
const example = computed(() => examples[current.value.replace(/^articles\//, '')])
const visible = computed(() => landing.has(current.value) || Boolean(example.value))
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
