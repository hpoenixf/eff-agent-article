import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { articleHistory, availableArticleHistory } from '../article-history.mjs'

test('creation follows main-branch edition lineage across renames, independently from real content updates', () => {
  const cache = join(process.cwd(), '.vitepress/cache'); mkdirSync(cache, { recursive: true })
  const root = mkdtempSync(join(cache, 'catalog-chronology-fixture-'))
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const at = day => ({ ...process.env, GIT_AUTHOR_DATE: `2026-10-${String(day).padStart(2, '0')}T23:00:00Z`, GIT_COMMITTER_DATE: `2026-10-${String(day).padStart(2, '0')}T23:00:00Z` })
  const commit = (day, message) => { git('add', '.'); execFileSync('git', ['-C', root, 'commit', '-m', message], { env: at(day), stdio: 'pipe' }) }
  const write = (path, body) => writeFileSync(join(root, path), body)
  git('init', '-b', 'main'); git('config', 'user.name', 'Synthetic fixture'); git('config', 'user.email', 'fixture@example.invalid')
  mkdirSync(join(root, 'articles')); mkdirSync(join(root, 'en/articles'), { recursive: true })
  write('articles/original.md', '# Original\nFirst body\n'); commit(1, 'first Chinese edition')
  write('en/articles/original.md', '# Original\nEnglish body\n'); commit(2, 'first English edition')
  git('mv', 'articles/original.md', 'articles/renamed.md'); commit(3, 'rename edition')
  write('articles/renamed.md', '# Original\nRevised body\n'); commit(4, 'visible content change')
  write('articles/renamed.md', '---\nlastUpdated: 999\nlayout: doc\n---\n# Original\n\nRevised    body\n'); commit(5, 'only formatting and derived metadata')
  let paths = ['articles/renamed.md', 'en/articles/original.md', 'articles/uncommitted.md']
  let history = articleHistory(root, paths, { includeCreated: true })
  assert.equal(Date.parse(history.get(paths[0]).created.timestamp), Date.parse('2026-10-01T23:00:00Z'))
  assert.equal(history.get(paths[0]).created.date, '2026-10-02', 'Calendar labels retain UTC+8')
  assert.equal(history.get(paths[0]).created.path, 'articles/original.md')
  assert.equal(history.get(paths[0]).date, '2026-10-05')
  assert.equal(history.get(paths[1]).created.date, '2026-10-03', 'English has its own first version')
  assert.equal('created' in articleHistory(root, paths).get(paths[0]), false, 'Existing recent-history contract stays unchanged by default')
  write('articles/renamed.md', '---\nreadingBrief:\n  takeaways:\n    - "Visible new reader conclusion"\n---\n# Original\nRevised body\n'); commit(6, 'reader-visible brief')
  write('articles/renamed.md', '# Uncommitted replacement'); write('articles/uncommitted.md', '# Not yet recorded')
  history = articleHistory(root, paths, { includeCreated: true })
  assert.equal(history.get(paths[0]).date, '2026-10-07', 'A visible brief remains a real update')
  assert.equal(history.get(paths[0]).created.date, '2026-10-02')
  assert.equal(history.has(paths[2]), false, 'No working-tree or build-time invention')
  git('checkout', '--', 'articles/renamed.md')
  git('checkout', '-b', 'topic'); write('articles/merged.md', '# First on branch'); commit(7, 'branch article')
  git('checkout', 'main'); execFileSync('git', ['-C', root, 'merge', '--no-ff', 'topic', '-m', 'main accepts article'], { env: at(9), stdio: 'pipe' })
  assert.equal(articleHistory(root, ['articles/merged.md'], { includeCreated: true }).get('articles/merged.md').created.date, '2026-10-10', 'First visible on main is the merge, not a private branch date')
  git('rm', 'articles/renamed.md'); commit(10, 'retire edition')
  write('articles/renamed.md', '# Different new edition'); commit(11, 'recreate path')
  assert.equal(articleHistory(root, [paths[0]], { includeCreated: true }).get(paths[0]).created.date, '2026-10-12', 'Do not cross a deleted/recreated lineage')
  const shallow = join(root, 'shallow'); execFileSync('git', ['clone', '--depth=1', 'file://' + root, shallow], { stdio: 'pipe' })
  let warned = false
  const missing = availableArticleHistory(shallow, paths, () => { warned = true }, { includeCreated: true })
  assert.equal(warned, true); assert.equal(missing.available, false); assert.equal(missing.history.size, 0)
  assert.throws(() => articleHistory(root, ['../outside.md'], { includeCreated: true }), /Invalid article history path/)
})
