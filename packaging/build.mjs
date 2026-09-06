import { cp, mkdir, readdir, readFile, rm, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NAME = 'superdevkit-lite';
export const SKILLS = ['finalize', 'frontend-check', 'grill-to-spec', 'to-tickets', 'use', 'verify'];
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));

async function assertPlainTree(directory) {
  if ((await lstat(directory)).isSymbolicLink()) throw new Error(`Symlink not allowed: ${directory}`);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed: ${file}`);
    if (entry.isDirectory()) await assertPlainTree(file);
  }
}

export async function build({ root = ROOT } = {}) {
  root = path.resolve(root);
  const pkg = await json(path.join(root, 'package.json'));
  if (pkg.name !== NAME || !/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error('Invalid package identity');
  const actual = (await readdir(path.join(root, 'skills'), { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name).sort();
  if (JSON.stringify(actual) !== JSON.stringify(SKILLS)) throw new Error('Unexpected skill inventory');
  await assertPlainTree(path.join(root, 'skills'));
  const targets = [ ['codex', '.codex-plugin'], ['claude-code', '.claude-plugin'] ];
  const manifests = [];
  for (const [harness, folder] of targets) {
    const manifest = await json(path.join(root, folder, 'plugin.json'));
    if (manifest.name !== NAME || manifest.version !== pkg.version) throw new Error('Manifest identity mismatch');
    manifests.push({ harness, folder, manifest });
  }
  for (const skill of SKILLS) {
    const file = path.join(root, 'skills', skill, 'SKILL.md');
    const text = await readFile(file, 'utf8');
    if (!text.startsWith(`---\nname: ${skill}\ndescription: `)) throw new Error(`Invalid skill metadata: ${skill}`);
    await readFile(path.join(root, 'skills', skill, 'agents', 'openai.yaml'));
  }

  // Only generated leaf directories under this repository's .build can be replaced.
  const output = path.join(root, '.build');
  await mkdir(output, { recursive: true });
  await assertPlainTree(output);
  const results = [];
  for (const { harness, folder, manifest } of manifests) {
    const target = path.resolve(output, pkg.version, harness, 'plugins', NAME);
    if (!target.startsWith(output + path.sep) || path.basename(target) !== NAME) throw new Error('Unsafe output path');
    await rm(target, { recursive: true, force: true });
    await mkdir(path.join(target, folder), { recursive: true });
    await writeFile(path.join(target, folder, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
    for (const skill of SKILLS) {
      const source = path.join(root, 'skills', skill);
      await cp(source, path.join(target, 'skills', skill), {
        recursive: true,
        filter: file => harness === 'codex' || !path.relative(source, file).split(path.sep).includes('agents'),
      });
    }
    await cp(path.join(root, 'LICENSE'), path.join(target, 'LICENSE'));
    results.push(target);
  }
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().then(paths => paths.forEach(p => console.log(`Built ${p}`))).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
