import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

async function readProjectFile(path) {
  return readFile(projectFile(path), 'utf8');
}

test('publishes one navigable landmark for every primary section', async () => {
  const html = await readProjectFile('index.html');
  const requiredIds = ['main-content', 'about', 'research', 'honors', 'journey', 'contact'];

  assert.match(html, /<html[^>]+lang="zh-CN"/);
  assert.match(html, /<meta[^>]+name="viewport"/);
  assert.match(html, /class="skip-link"[^>]+href="#main-content"/);

  for (const id of requiredIds) {
    const occurrences = html.match(new RegExp(`\\bid="${id}"`, 'g')) ?? [];
    assert.equal(occurrences.length, 1, `${id} must appear exactly once`);
  }

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const internalTargets = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  assert.ok(internalTargets.length >= 6, 'primary navigation must expose section links');
  for (const target of internalTargets) {
    assert.ok(ids.has(target), `#${target} must resolve to an element`);
  }
});

test('presents supplied achievements without overstating submissions', async () => {
  const html = await readProjectFile('index.html');

  for (const publicFact of [
    'leemeii',
    '3.85',
    '专业第 1',
    '年级第 4',
    '565',
    'MCM/ICM',
    'H 奖',
    '5000+',
    '8 万+',
    'Testing Static Analyzers via Semantic-Preserving Mutators',
    'Detecting Logic Bugs in Vector DBMSs',
    'CoEffi: Enhance Efficient Code Generation',
  ]) {
    assert.ok(html.includes(publicFact), `missing supplied fact: ${publicFact}`);
  }

  assert.match(html, /Submitted\s*·\s*ASE 2026/);
  assert.match(html, /Submitted\s*·\s*EMNLP/);
  assert.match(html, /Under Review\s*·\s*SIGMOD 2027/);
  assert.doesNotMatch(html, /Accepted\s*·\s*(ASE 2026|EMNLP|SIGMOD 2027)/i);
});

test('keeps public links safe and private proof data out of the page', async () => {
  const html = await readProjectFile('index.html');
  const blockedBrandPattern = new RegExp(`${['chat', 'gpt'].join('')}|${['open', 'ai'].join('')}`, 'i');

  assert.ok(html.includes('https://github.com/leemeii'));
  assert.doesNotMatch(html, blockedBrandPattern);
  assert.doesNotMatch(html, /证明材料|评审分数|#2906/);
  assert.doesNotMatch(html, /href="#"/);

  const externalAnchors = [...html.matchAll(/<a\s+[^>]*href="https:[^"]+"[^>]*>/g)].map(
    (match) => match[0],
  );
  assert.ok(externalAnchors.length > 0, 'the GitHub profile must be linked');
  for (const anchor of externalAnchors) {
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  }
});

test('declares descriptive metadata and stable asset paths', async () => {
  const html = await readProjectFile('index.html');

  assert.match(html, /<title>[^<]*leemeii[^<]*<\/title>/i);
  assert.match(html, /<meta[^>]+name="description"[^>]+content="[^"]{20,}"/);
  assert.match(html, /href="assets\/css\/styles\.css"/);
  assert.match(html, /src="assets\/js\/main\.js"/);
  assert.match(html, /type="module"/);
});

test('ships an accessible responsive stylesheet for every declared visual mode', async () => {
  const html = await readProjectFile('index.html');
  const stylesheetPath = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];

  assert.equal(stylesheetPath, 'assets/css/styles.css');
  const css = await readProjectFile(stylesheetPath);

  assert.match(css, /:root\s*{[^}]*--paper:/s);
  assert.match(css, /\[data-theme="dark"\]\s*{/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*960px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /overflow-x:\s*(?:hidden|clip)/);
});
