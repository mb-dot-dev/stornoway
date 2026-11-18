import { StrictMode, createElement } from 'react';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { renderToString } from 'react-dom/server';
import tailwind from 'bun-plugin-tailwind';
import './svg-plugin'; // registers the .svg loader for the prerender below

const root = import.meta.dir;

// The page has no interactivity, so production ships prerendered HTML and CSS only: no JavaScript.
export async function build(options: { outDir?: string } = {}): Promise<void> {
  const outDir = options.outDir ?? join(root, 'dist');

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await cp(join(root, 'public'), outDir, { recursive: true });

  const result = await Bun.build({
    entrypoints: [join(root, 'src/main.css')],
    outdir: outDir,
    minify: true,
    naming: '[name]-[hash].[ext]',
    publicPath: '/',
    plugins: [tailwind],
  });
  if (!result.success) {
    throw new Error(`Bun.build failed:\n${result.logs.map(String).join('\n')}`);
  }

  const urlOf = (path: string) => '/' + relative(outDir, path).split('\\').join('/');
  const css = result.outputs.filter((o) => o.path.endsWith('.css')).map((o) => urlOf(o.path));
  const styles = css.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n    ');

  const { default: App } = await import('./src/App');
  const { default: Homelab } = await import('./src/Homelab');
  const pages = [
    { template: 'src/index.html', component: App, out: 'index.html' },
    { template: 'src/homelab.html', component: Homelab, out: 'homelab/index.html' },
  ];
  for (const page of pages) {
    const markup = renderToString(createElement(StrictMode, null, createElement(page.component)));
    const template = await readFile(join(root, page.template), 'utf8');
    const html = template
      .replace(/\s*<script type="module" src="\.\/[\w-]+\.tsx"><\/script>/, '') // dev-server entry only
      .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`)
      .replace('</head>', () => `  ${styles}\n  </head>`);
    const out = join(outDir, page.out);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, html);
  }

  const notFound = await readFile(join(root, 'src/404.html'), 'utf8');
  await writeFile(
    join(outDir, '404.html'),
    notFound.replace('</head>', () => `  ${styles}\n  </head>`),
  );
}

if (import.meta.main) {
  await build({ outDir: process.env.BUILD_OUT_DIR });
}
