#!/usr/bin/env node
/**
 * Companion to "AI Coding 质量全景：当代码大多由 AI 编写，怎样对整个项目负责？".
 * Reopens an existing synthetic result-consumption run through the original Reader.
 * Does not generate a new report or make model requests.
 *
 * Node 26.11.1; Open ETF Agent commit:
 * afbfb9865539c18c9358ac65c822f929aaa6e872
 *
 * Usage:
 * node readback-result-consumption.mjs /absolute/repo /absolute/run-metadata.json
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

if (process.argv.length !== 4) {
  throw new Error(
    'Usage: node readback-result-consumption.mjs <open-etf-agent directory> <run metadata JSON>'
  );
}

const repoDirectory = resolve(process.argv[2]);
const metadataPath = resolve(process.argv[3]);
const { startReader } = await import(
  pathToFileURL(join(repoDirectory, 'src/reader.mjs')).href
);
const run = JSON.parse(await readFile(metadataPath, 'utf8'));
if (run.caseId !== 'result-consumption' || run.status !== 'completed') {
  throw new Error('Expected a completed result-consumption run.');
}
const runDirectory = resolve(repoDirectory, run.directory);
const manifest = JSON.parse(
  await readFile(join(runDirectory, 'manifest.json'), 'utf8')
);
const reader = await startReader({ directory: runDirectory });
const seen = {};

try {
  for (const [name, path] of [
    ['report', '/artifacts/' + run.receipt.artifactId],
    ['csv', '/artifacts/' + run.receipt.attachmentIds[0]],
    ['source', '/sources/' + run.receipt.revisionId + '/0']
  ]) {
    const response = await fetch(reader.origin + path);
    if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    seen[name] = {
      sha256: createHash('sha256').update(bytes).digest('hex'),
      text: bytes.toString('utf8')
    };
  }

  const ref = manifest.calculations[0].ref.resultRef;
  const checks = {
    reportHashMatches: seen.report.sha256 === run.receipt.sha256,
    csvHashMatches:
      seen.csv.sha256 === manifest.artifacts.attachments[0].sha256,
    sourceMatchesFixture:
      seen.source.text === await readFile(
        join(repoDirectory, 'fixtures/comparison-table.json'), 'utf8'
      ),
    sameCalculationRef:
      seen.report.text.includes(ref) && seen.csv.text.includes(ref)
  };
  console.log(JSON.stringify({
    checks,
    calculation: manifest.calculations[0].value
  }, null, 2));
  if (Object.values(checks).some(value => value !== true)) {
    process.exitCode = 1;
  }
} finally {
  await reader.close();
}

