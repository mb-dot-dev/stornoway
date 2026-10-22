import { readFile } from 'node:fs/promises';

// Inline SVGs as data URLs, in both the client bundle and the prerender, so the
// server-rendered <img src> is byte-identical to what the client renders.
export const svgDataUrl: Bun.BunPlugin = {
  name: 'svg-data-url',
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async ({ path }) => {
      const svg = await readFile(path, 'utf8');
      return {
        contents: `export default ${JSON.stringify(`data:image/svg+xml,${encodeURIComponent(svg)}`)}`,
        loader: 'js',
      };
    });
  },
};

// Register the loader at import time so a module that imports this file (build.ts, or the
// `bun test` preload) is guaranteed to have it in place before any .svg import is evaluated.
Bun.plugin(svgDataUrl);
