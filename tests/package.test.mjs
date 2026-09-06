import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ROOT, NAME, SKILLS, build } from '../packaging/build.mjs';

const json = async file => JSON.parse(await readFile(file, 'utf8'));
async function files(root, prefix = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await files(root, relative));
    else result.push(relative);
  }
  return result.sort();
}
async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'superdevkit-lite-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of ['package.json', 'LICENSE', 'skills', '.codex-plugin', '.claude-plugin']) {
    await cp(path.join(ROOT, file), path.join(root, file), { recursive: true });
  }
  return root;
}

test('packages preserve all skill content and isolate harness metadata', async t => {
  const root = await fixture(t);
  const targets = await build({ root });
  const sourceFiles = await files(path.join(root, 'skills'));
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const expected = sourceFiles.filter(file => i === 0 || !file.includes('/agents/'));
    assert.deepEqual(await files(path.join(target, 'skills')), expected);
    for (const file of expected) {
      assert.equal(await readFile(path.join(target, 'skills', file), 'utf8'), await readFile(path.join(root, 'skills', file), 'utf8'));
    }
    const wrapper = i === 0 ? '.codex-plugin' : '.claude-plugin';
    assert.deepEqual((await readdir(target)).sort(), [wrapper, 'LICENSE', 'skills'].sort());
    assert.deepEqual(await json(path.join(target, wrapper, 'plugin.json')), await json(path.join(root, wrapper, 'plugin.json')));
    assert.equal(await readFile(path.join(target, 'LICENSE'), 'utf8'), await readFile(path.join(root, 'LICENSE'), 'utf8'));
  }
  // Rebuild removes obsolete generated files and leaves the source untouched.
  await writeFile(path.join(targets[0], 'obsolete.txt'), 'old output');
  await build({ root });
  assert.ok(!(await files(targets[0])).includes('obsolete.txt'));
  assert.deepEqual(await files(path.join(root, 'skills')), sourceFiles);
});

test('marketplaces resolve to committed, current and reproducible packages', async t => {
  const root = await fixture(t);
  const generated = await build({ root });
  const pkg = await json(path.join(ROOT, 'package.json'));
  for (const [index, market, wrapper] of [[0, '.agents/plugins/marketplace.json', '.codex-plugin'], [1, '.claude-plugin/marketplace.json', '.claude-plugin']]) {
    const document = await json(path.join(ROOT, market));
    assert.equal(document.name, NAME);
    assert.equal(document.plugins.length, 1);
    const entry = document.plugins[0];
    assert.equal(entry.name, NAME);
    const relative = typeof entry.source === 'string' ? entry.source : entry.source.path;
    const target = path.resolve(ROOT, relative);
    assert.ok(target.startsWith(path.join(ROOT, '.build', pkg.version) + path.sep));
    assert.equal((await json(path.join(target, wrapper, 'plugin.json'))).version, pkg.version);
    assert.deepEqual(await files(target), await files(generated[index]));
    for (const file of await files(target)) {
      assert.deepEqual(await readFile(path.join(target, file)), await readFile(path.join(generated[index], file)));
    }
    if (index === 0) assert.deepEqual(entry.policy, { installation: 'AVAILABLE', authentication: 'ON_INSTALL' });
  }
});

test('invalid versions and mismatched manifests fail before replacing outputs', async t => {
  const root = await fixture(t);
  const [target] = await build({ root });
  const marker = path.join(target, 'keep.txt');
  await writeFile(marker, 'preserve');
  const manifestFile = path.join(root, '.codex-plugin/plugin.json');
  const manifest = await json(manifestFile);
  await writeFile(manifestFile, JSON.stringify({ ...manifest, version: '9.0.0' }));
  await assert.rejects(build({ root }), /Manifest identity mismatch/);
  assert.equal(await readFile(marker, 'utf8'), 'preserve');
  const pkgFile = path.join(root, 'package.json');
  const pkg = await json(pkgFile);
  await writeFile(pkgFile, JSON.stringify({ ...pkg, version: '../../outside' }));
  await assert.rejects(build({ root }), /Invalid package identity/);
  assert.equal(await readFile(marker, 'utf8'), 'preserve');
});

test('unexpected skills and missing UI metadata fail packaging', async t => {
  const root = await fixture(t);
  await mkdir(path.join(root, 'skills', 'unexpected'));
  await assert.rejects(build({ root }), /Unexpected skill inventory/);
  await rm(path.join(root, 'skills', 'unexpected'), { recursive: true });
  await rm(path.join(root, 'skills', 'use', 'agents', 'openai.yaml'));
  await assert.rejects(build({ root }), /ENOENT/);
});

test('skill metadata and local Markdown links resolve', async () => {
  for (const name of SKILLS) {
    const file = path.join(ROOT, 'skills', name, 'SKILL.md');
    const text = await readFile(file, 'utf8');
    assert.match(text, new RegExp(`^---\\nname: ${name}\\ndescription: [^\\n]+\\n---\\n`));
  }
  for (const relative of ['README.md', ...SKILLS.map(name => `skills/${name}/SKILL.md`)]) {
    const file = path.join(ROOT, relative);
    for (const match of (await readFile(file, 'utf8')).matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (/^https?:/.test(link)) continue;
      const target = path.resolve(path.dirname(file), link.split('#')[0]);
      assert.ok(target.startsWith(ROOT + path.sep));
      await readFile(target);
    }
  }
});
