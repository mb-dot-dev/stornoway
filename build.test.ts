import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from './build'

const dirs: string[] = []

async function freshDir() {
  const dir = await mkdtemp(join(tmpdir(), 'stornoway-build-'))
  dirs.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })))
})

describe('build', () => {
  test('writes prerendered index.html', async () => {
    const outDir = await freshDir()
    await build({ outDir })
    const html = await readFile(join(outDir, 'index.html'), 'utf8')
    expect(html).toMatch(/<div id="root">\s*<main[^>]*>[^]*Bence Molnár/)
    expect(html).toContain('<meta charset="utf-8">')
  })

  test('links hashed assets with root-absolute urls', async () => {
    const outDir = await freshDir()
    await build({ outDir })
    const html = await readFile(join(outDir, 'index.html'), 'utf8')
    const scripts = [...html.matchAll(/<script type="module"[^>]*src="(\/[^"]+\.js)"/g)]
    const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\/[^"]+\.css)"/g)]
    expect(scripts).toHaveLength(1)
    expect(styles).toHaveLength(1)
    for (const m of [scripts[0]!, styles[0]!]) {
      expect(m[1]).toMatch(/[-.][a-z0-9]{6,}\.(js|css)$/)
      expect(existsSync(join(outDir, m[1]!))).toBe(true)
    }
  })

  test('copies public files', async () => {
    const outDir = await freshDir()
    await build({ outDir })
    expect(existsSync(join(outDir, 'favicon.ico'))).toBe(true)
    expect(existsSync(join(outDir, 'robots.txt'))).toBe(true)
  })

  test('removes stale files', async () => {
    const outDir = await freshDir()
    await mkdir(outDir, { recursive: true })
    await writeFile(join(outDir, 'stale.txt'), 'old')
    await build({ outDir })
    expect(existsSync(join(outDir, 'stale.txt'))).toBe(false)
  })

  test('works from another cwd', async () => {
    const outDir = await freshDir()
    const proc = Bun.spawn(['bun', join(import.meta.dir, 'build.ts')], {
      cwd: tmpdir(),
      env: { ...process.env, BUILD_OUT_DIR: outDir },
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const code = await proc.exited
    expect(code).toBe(0)
    expect(existsSync(join(outDir, 'index.html'))).toBe(true)
  })

  test('preserves non-ascii text', async () => {
    const outDir = await freshDir()
    await build({ outDir })
    const html = await readFile(join(outDir, 'index.html'), 'utf8')
    expect(html).toContain('Bence Molnár — London · test •')
  })
})
