import assert from 'node:assert/strict'
import { localizedSitePath } from '../language-routing.mjs'
const translations = ['tool-results-outside-model-context', '011-model-understands-code-authorizes', '017-prompt-to-answer-six-layer-panorama']
const testCases = [
  ['', 'en', '/en/'],
  ['modules', 'en', '/en/modules'],
  ['engineering', 'en', '/en/engineering'],
  ['en/engineering', 'zh', '/engineering'],
  ['en/articles/tool-results-outside-model-context', 'zh', '/articles/tool-results-outside-model-context'],
  ['articles/tool-results-outside-model-context', 'en', '/en/articles/tool-results-outside-model-context'],
  ['articles/partial-is-not-complete', 'en', '/en/articles/tool-results-outside-model-context'],
  ['articles/017-prompt-to-answer-six-layer-panorama', 'en', '/en/articles/017-prompt-to-answer-six-layer-panorama'],
  ['en/articles/017-prompt-to-answer-six-layer-panorama', 'zh', '/articles/017-prompt-to-answer-six-layer-panorama'],
  ['articles/017-prompt-to-answer-six-layer-panorama-v1', 'en', null],
  ['en/articles/partial-is-not-complete', 'zh', '/articles/tool-results-outside-model-context'],
  ['articles/010-agent-first-brakes', 'en', '/en/articles/011-model-understands-code-authorizes'],
  ['articles/honest-agent-failure-semantics', 'zh', '/articles/agent-veto-authority-and-run-termination'],
  ['articles/honest-agent-failure-semantics', 'en', null],
  ['articles/unavailable-is-correct', 'en', null],
  ['en/articles/unavailable-is-correct', 'en', null],
  ['en/fintech', 'en', '/en/fintech'],
  ['financial-research-backlog', 'en', '/en/financial-research-backlog'],
  ['en/financial-research-backlog', 'zh', '/financial-research-backlog'],
  ['en/financial-research-backlog', 'en', '/en/financial-research-backlog'],
  ['articles/unavailable-is-correct', 'zh', '/articles/unavailable-is-correct'],
  ['/catalog.html', 'en', '/en/catalog']
]
for (const [path, language, expected] of testCases) {
  assert.equal(localizedSitePath(path, language, translations), expected, path + ':' + language)
}
console.log('Locale path and untranslated fallback routing validated.')
