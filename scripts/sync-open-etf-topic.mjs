import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { validateContract, verifyScenarioSnapshot } from './check-article-backlinks.mjs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// One published source owner shared with article backlinks. Fetch data, never execute remote code.
const mode = process.argv[2]
if (!['--sync','--check','--check-local'].includes(mode) || process.argv.length !== 3) throw new Error('Usage: node scripts/sync-open-etf-topic.mjs --sync|--check|--check-local')
const root = fileURLToPath(new URL('../', import.meta.url))
const pin = JSON.parse(await readFile(resolve(root,'.github/open-etf-code-source.json'),'utf8'))
if (pin.schemaVersion !== 1 || pin.repository !== 'hpoenixf/open-etf-agent' || !/^[a-f0-9]{40}$/.test(pin.commit)) throw new Error('Invalid fixed published code source')
const files = ['article-coverage.json','article-coverage.en.json','article-coverage-receipts.json','versions.json']
const snapshots = await Promise.all(files.map(async name => {
 if (mode === '--check-local') {
  const bytes = await readFile(resolve(root,'data/open-etf-agent',name))
  return {name,bytes,value:JSON.parse(bytes.toString('utf8'))}
 }
 const path = name === 'versions.json' ? name : 'docs/verification/' + name
 const response = await fetch(`https://raw.githubusercontent.com/${pin.repository}/${pin.commit}/${path}`, {redirect:'error',signal:AbortSignal.timeout(15000)})
 if (!response.ok) throw new Error(`Fixed public source unavailable: ${path}: HTTP ${response.status}`)
 const bytes = Buffer.from(await response.arrayBuffer())
 if (Buffer.byteLength(bytes) > 1048576) throw new Error('Public snapshot exceeds size bound')
 return { name, bytes, value: JSON.parse(bytes.toString('utf8')) }
}))
const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k,v[k]])) : v)
const [coverage, english, receipts, versions] = snapshots.map(s => s.value)
if (coverage.repository !== pin.repository || versions.repository !== pin.repository) throw new Error('Unexpected source repository')
if (coverage.verifiedAt !== receipts.sourceCommit) throw new Error('Receipt/source commit mismatch')
if (coverage.articles.some(row => !english.articles[row.slug])) throw new Error('Missing coverage display translation')
const extras = {}
if (coverage.schemaVersion === 3) for (const [id, target] of Object.entries(coverage.targets)) if (target.kind === 'scenario') {
 const q = coverage.qualifications?.[coverage.targetEvidence?.[id]]
 if (!q?.receipt || !/^docs\/verification\/[a-z0-9.-]+\.json$/.test(q.receipt.path)) throw new Error('Invalid scenario snapshot path')
 const name = q.receipt.path.split('/').at(-1)
 let bytes
 if (mode === '--check-local') bytes = await readFile(resolve(root,'data/open-etf-agent',name))
 else {
  const response = await fetch(`https://raw.githubusercontent.com/${pin.repository}/${pin.commit}/${q.receipt.path}`, {redirect:'error',signal:AbortSignal.timeout(15000)})
  if (!response.ok) throw new Error(`Fixed scenario snapshot unavailable: HTTP ${response.status}`)
  bytes = Buffer.from(await response.arrayBuffer())
 }
 if(bytes.length > 1048576) throw new Error('Scenario snapshot size bound')
 extras[id] = verifyScenarioSnapshot(bytes.toString('utf8'),q)
 snapshots.push({name,bytes,value:extras[id]})
}
validateContract(coverage, receipts, {commit:coverage.verifiedAt}, extras)
const target = resolve(root,'data/open-etf-agent')
if (mode === '--sync') {
 await mkdir(target,{recursive:true})
 for (const snapshot of snapshots) await writeFile(resolve(target,snapshot.name),snapshot.bytes)
} else if (mode === '--check') {
 for (const snapshot of snapshots) if (!(await readFile(resolve(target,snapshot.name))).equals(snapshot.bytes)) throw new Error(`Topic snapshot differs from published ${pin.commit}: ${snapshot.name}`)
}
console.log(JSON.stringify({mode,repository:pin.repository,codeClaimCommit:pin.commit,qualificationCommit:receipts.sourceCommit,snapshots:snapshots.length,publicationBytesVerified:mode !== '--check-local'}))
