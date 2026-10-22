# stornoway

The source of my online CV, published at <https://cv.molnarbence.dev>. It is a React single page that is prerendered to static HTML at build time and hosted on AWS (see `aws/`).

## Commands

```bash
bun install       # install dependencies
bun run dev       # dev server with hot reload (bun ./src/index.html)
bun run build     # prerender the site into dist/
bun run preview   # serve dist/ locally
bun test          # run the tests
bun lint          # lint
bun fmt           # format (use `bun fmt --check` to only verify)
```

## How the build works

`build.ts` bundles `src/` with `Bun.build` (Tailwind via `bun-plugin-tailwind`), then renders the `App` component to a string with `react-dom/server` and injects it into the generated `index.html`. The result in `dist/` is plain static HTML, CSS and JS that works without JavaScript and hydrates in the browser when it is available.

## Bun canary pin

`bun fmt` and `bun lint` are not in a stable Bun release yet, so CI uses `bun-version: canary` in `oven-sh/setup-bun` and `.bun-version` contains `canary`. `setup-bun` can only resolve release tags and the moving `canary` tag, so a specific canary build cannot be pinned. The trade-off is that a canary update can change behaviour or break CI without any change in this repo.

Go back to a pinned stable version (in both `.bun-version` and the workflow) once a stable Bun release ships `bun fmt` and `bun lint`.
