# stornoway

The source of my online CV, published at <https://cv.molnarbence.dev>. It is a React single page that is prerendered to static HTML and CSS at build time and hosted on AWS (see `aws/`).

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

`build.ts` builds `src/main.css` with `Bun.build` (Tailwind via `bun-plugin-tailwind`), then renders the `App` component to a string with `react-dom/server` and injects it into `index.html`; it also writes a styled `404.html`. The page has no interactivity, so `dist/` contains only static HTML and CSS: no JavaScript is shipped. `src/index.tsx` is used only by the dev server.

On deploy, the content-hashed CSS is uploaded with `Cache-Control: immutable` and everything else with `no-cache`. CloudFront adds security headers (HSTS, a strict CSP, `X-Content-Type-Options`, `Referrer-Policy` and others) through a response headers policy, so the page must not use inline `<script>` or `style` attributes.

## Bun canary pin

`bun fmt` and `bun lint` are not in a stable Bun release yet, so CI uses `bun-version: canary` in `oven-sh/setup-bun` and `.bun-version` contains `canary`. `setup-bun` can only resolve release tags and the moving `canary` tag, so a specific canary build cannot be pinned. The trade-off is that a canary update can change behaviour or break CI without any change in this repo.

Go back to a pinned stable version (in both `.bun-version` and the workflow) once a stable Bun release ships `bun fmt` and `bun lint`.
