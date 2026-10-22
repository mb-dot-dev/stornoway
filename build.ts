import { StrictMode, createElement } from 'react'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { renderToString } from 'react-dom/server'
import tailwind from 'bun-plugin-tailwind'
import App from './src/App'

const root = import.meta.dir

export async function build(options: { outDir?: string } = {}): Promise<void> {
  const outDir = options.outDir ?? join(root, 'dist')

  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })
  await cp(join(root, 'public'), outDir, { recursive: true })

  const result = await Bun.build({
    entrypoints: [join(root, 'src/index.tsx')],
    outdir: outDir,
    minify: true,
    naming: '[name]-[hash].[ext]',
    publicPath: '/',
    plugins: [tailwind],
  })
  if (!result.success) {
    throw new Error(`Bun.build failed:\n${result.logs.map(String).join('\n')}`)
  }

  const urlOf = (path: string) => '/' + relative(outDir, path).split('\\').join('/')
  const js = result.outputs.filter((o) => o.kind === 'entry-point').map((o) => urlOf(o.path))
  const css = result.outputs.filter((o) => o.path.endsWith('.css')).map((o) => urlOf(o.path))

  const markup = renderToString(createElement(StrictMode, null, createElement(App)))
  const tags = [
    ...css.map((href) => `<link rel="stylesheet" href="${href}">`),
    ...js.map((src) => `<script type="module" src="${src}"></script>`),
  ]
  const template = await readFile(join(root, 'src/index.html'), 'utf8')
  const html = template
    .replace(/\s*<script type="module" src="\.\/index\.tsx"><\/script>/, '') // dev-server entry only
    .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`)
    .replace('</head>', () => `  ${tags.join('\n    ')}\n  </head>`)
  await writeFile(join(outDir, 'index.html'), html)
}

if (import.meta.main) {
  await build({ outDir: process.env.BUILD_OUT_DIR })
}
