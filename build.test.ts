import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from './build';

const dirs: string[] = [];

async function freshDir() {
  const dir = await mkdtemp(join(tmpdir(), 'stornoway-build-'));
  dirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })));
});

describe('build', () => {
  test('writes prerendered index.html', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    const html = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(html).toMatch(/<div id="root"><div[^>]*><header[^>]*>[^]*Bence Molnár/);
    expect(html).toMatch(/<meta charset="utf-8"\s*\/?>/);
  });

  test('links a hashed stylesheet with a root-absolute url', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    const html = await readFile(join(outDir, 'index.html'), 'utf8');
    const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\/[^"]+\.css)"/g)];
    expect(styles).toHaveLength(1);
    expect(styles[0]![1]).toMatch(/[-.][a-z0-9]{6,}\.css$/);
    expect(existsSync(join(outDir, styles[0]![1]!))).toBe(true);
  });

  test('ships no JavaScript', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    expect((await readdir(outDir)).filter((f) => f.endsWith('.js'))).toEqual([]);
    for (const page of ['index.html', '404.html', 'homelab/index.html', 'lambdas/index.html']) {
      const html = await readFile(join(outDir, page), 'utf8');
      const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
      expect(scripts.every((tag) => tag.includes('type="application/ld+json"'))).toBe(true);
    }
  });

  test('has no inline style attributes (the CSP forbids them)', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    for (const page of ['index.html', 'homelab/index.html', 'lambdas/index.html']) {
      const html = await readFile(join(outDir, page), 'utf8');
      expect(html).not.toMatch(/\sstyle="/);
    }
  });

  test('writes the homelab page', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    const html = await readFile(join(outDir, 'homelab/index.html'), 'utf8');
    expect(html).toMatch(/<h1[^>]*>Homelab<\/h1>/);
    for (const name of ['Gitea Actions', 'Artifact Keeper', 'Arcane', 'Aspire Dashboard']) expect(html).toContain(name);
    const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\/[^"]+\.css)"/g)];
    expect(styles).toHaveLength(1);
    expect(existsSync(join(outDir, styles[0]![1]!))).toBe(true);
    expect(html).toContain('href="/favicon.svg"');
    expect(html).toContain('<link rel="canonical" href="https://cv.molnarbence.dev/homelab/"');
  });

  test('writes the lambdas page', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    const html = await readFile(join(outDir, 'lambdas/index.html'), 'utf8');
    expect(html).toMatch(/<h1[^>]*>AWS Lambda reference apps<\/h1>/);
    for (const name of ['Helsinki', 'Stockholm', 'Warsaw', 'Oslo', 'Copenhagen']) expect(html).toContain(name);
    const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\/[^"]+\.css)"/g)];
    expect(styles).toHaveLength(1);
    expect(existsSync(join(outDir, styles[0]![1]!))).toBe(true);
    expect(html).toContain('<link rel="canonical" href="https://cv.molnarbence.dev/lambdas/"');
  });

  test('writes a styled 404 page', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    const html = await readFile(join(outDir, '404.html'), 'utf8');
    expect(html).toContain('Page not found');
    expect(html).toMatch(/<link rel="stylesheet"[^>]*href="\/[^"]+\.css"/);
  });

  test('copies public files', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    expect(existsSync(join(outDir, 'favicon.ico'))).toBe(true);
    expect(existsSync(join(outDir, 'favicon.svg'))).toBe(true);
    expect(existsSync(join(outDir, 'apple-touch-icon.png'))).toBe(true);
    expect(existsSync(join(outDir, 'robots.txt'))).toBe(true);
  });

  test('links the favicons', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    for (const page of ['index.html', '404.html']) {
      const html = await readFile(join(outDir, page), 'utf8');
      expect(html).toContain('href="/favicon.ico"');
      expect(html).toContain('href="/favicon.svg"');
      expect(html).toContain('rel="apple-touch-icon"');
    }
  });

  test('removes stale files', async () => {
    const outDir = await freshDir();
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'stale.txt'), 'old');
    await build({ outDir });
    expect(existsSync(join(outDir, 'stale.txt'))).toBe(false);
  });

  test('works from another cwd', async () => {
    const outDir = await freshDir();
    const proc = Bun.spawn([process.execPath, join(import.meta.dir, 'build.ts')], {
      cwd: tmpdir(),
      env: { ...process.env, BUILD_OUT_DIR: outDir },
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const code = await proc.exited;
    expect(code).toBe(0);
    expect(existsSync(join(outDir, 'index.html'))).toBe(true);
  });

  test('inlines the AWS icon as a data URL, with no filesystem paths', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    const html = await readFile(join(outDir, 'index.html'), 'utf8');
    const srcs = [...html.matchAll(/<img\b[^>]*?\bsrc="([^"]*)"/g)].map((m) => m[1]!);
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs) expect(src.startsWith('data:image/svg+xml,')).toBe(true);
    expect(html).not.toContain(import.meta.dir);
  });

  test('preserves non-ascii text', async () => {
    const outDir = await freshDir();
    await build({ outDir });
    const html = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(html).toContain('Bence Molnár');
  });
});
