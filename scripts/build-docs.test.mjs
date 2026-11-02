import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { hasBuildException, runCheckedBuild } from './build-docs.mjs'

test('build diagnostics distinguish render exceptions from ordinary performance warnings', () => {
  for (const line of ['TypeError: Cannot read properties of undefined', 'Error [ERR_MODULE_NOT_FOUND]: missing', '[Vue warn]: Unhandled error during execution of render function', 'Error when evaluating SSR module', '\x1b[31mReferenceError: undefined\x1b[0m']) assert.equal(hasBuildException(line), true)
  for (const line of ['build complete in 2s', 'Some chunks are larger than 500 kB', '0 errors; source article mentions TypeError: as prose']) assert.equal(hasBuildException(line), false)
})

test('cancelling the wrapper terminates its child, preserves the cancellation signal, and removes listeners', () => {
  const driver = `
    const {runCheckedBuild} = await import(${JSON.stringify(new URL('./build-docs.mjs', import.meta.url).href)});
    const before = process.listenerCount('SIGTERM'); let pid, sent=false;
    const child = 'process.on("SIGTERM",()=>{});process.stdout.write(String(process.pid));setInterval(()=>{},1000)';
    const result = await runCheckedBuild(process.execPath, ['-e', child], {cancelGraceMs:25,writeErr(){},writeOut(bytes){if(!sent){pid=Number(bytes.toString().trim());sent=true;process.kill(process.pid,'SIGTERM')}}});
    let alive=true;try{process.kill(pid,0)}catch{alive=false}
    process.stdout.write(JSON.stringify({result,alive,listenersRestored:process.listenerCount('SIGTERM')===before}));
  `
  const result = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', driver], { encoding: 'utf8', timeout: 3000 }))
  assert.deepEqual(result, { result: { code: null, signal: 'SIGTERM' }, alive: false, listenersRestored: true })
})

test('zero exit with a split SSR exception fails; normal output and original nonzero exit remain intact', async () => {
  let output = '', errors = ''
  const sinks = { writeOut: bytes => { output += bytes }, writeErr: bytes => { errors += bytes } }
  assert.deepEqual(await runCheckedBuild(process.execPath, ['-e', 'process.stdout.write("normal build output\\n")'], sinks), { code: 0, signal: null })
  assert.equal(output, 'normal build output\n')
  assert.deepEqual(await runCheckedBuild(process.execPath, ['-e', 'process.stderr.write("Type");setTimeout(()=>process.stderr.write("Error: SSR failure\\n"),20)'], sinks), { code: 1, signal: null })
  assert.match(errors, /Build rejected/)
  assert.deepEqual(await runCheckedBuild(process.execPath, ['-e', 'process.exit(3)'], sinks), { code: 3, signal: null })
  assert.deepEqual(await runCheckedBuild(process.execPath, ['-e', 'process.stdout.write("[Vue warn]: Unhandled error during execution of render function\\n")'], sinks), { code: 1, signal: null })
  assert.deepEqual(await runCheckedBuild(process.execPath, ['-e', 'process.kill(process.pid,"SIGTERM")'], sinks), { code: null, signal: 'SIGTERM' })
})
