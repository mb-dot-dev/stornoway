# Port the CV site from Nuxt to React + Bun's bundler

Date: 2026-10-22 · Branch: `feat/react-bun-bundler`

## Intent

`cv.molnarbence.dev` is a single-page CV, built today with Nuxt 4 (`nuxt generate`) and shipped as static files to S3 + CloudFront. The page is one 305-line Vue component, a trivial layout and one stylesheet. Nuxt is far more framework than that needs.

Replace Nuxt with a small React app built by `bun build`, to make the build **simpler and faster**. Output stays static files, and the HTML is **prerendered at build time** (it matters for search engines, link previews and no-JS visitors) rather than being an empty client-rendered shell.

## Goals

1. `bun run build` produces a static `dist/` containing prerendered HTML, a hashed JS bundle and a hashed CSS file. Hydration attaches React to the prerendered markup.
2. The prerendered HTML matches what Nuxt generates today as closely as practical (see *Markup parity*). Pixel-identical is not required; "best we can" is.
3. Tooling moves to Bun built-ins: `bun build` (bundling), `bun lint` (linting), `bun fmt` (formatting), `bun test` (tests). ESLint, Prettier and Vitest are removed.
4. CI keeps its shape: format check, lint, build, upload `dist`, and the existing deploy jobs.
5. Build is measurably faster than `nuxt generate` (record before/after wall time in the PR; no hard target).

## Non-goals

- No redesign and no content changes, except the footer credit (see *Decisions*).
- No router, no client-side data fetching, no state management. One page.
- No changes to `aws/` CloudFormation templates or the deploy jobs.
- No SSR server at runtime. Prerender happens once, at build time.
- No framework replacement for the sake of it: no Next, Vite, Astro or similar.

## Anti-goals (failure even if it "works")

- Shipping an empty `<div id="root"></div>` with all content rendered client-side.
- A prerender script so elaborate that it becomes a mini-framework. It should stay readable in one sitting (~50–80 lines).
- Keeping Nuxt, Vue, Vite, ESLint, Prettier or Vitest in dependencies "just in case".

## Constraints

- Hosting: static files at the root of the S3 bucket behind CloudFront (`DefaultRootObject` is empty and there are no custom error responses, so only `index.html` at the root matters). Nothing in `aws/` depends on Nuxt paths such as `_nuxt/`, `200.html` or `404.html`.
- `public/` (`favicon.ico`, `robots.txt`) is copied to the root of `dist/` unchanged.
- Style: the existing `.editorconfig` applies, plus single quotes and a 120-column print width (currently in `.prettierrc`).
- The build must be deterministic and must not need network access beyond `bun install`.

## Decisions (made with the project owner)

- **Prerendered HTML at build time**, not a client-only SPA.
- **Bun built-in tooling**: `bun lint`, `bun fmt`, `bun test`.
- **CI is pinned to a Bun canary build** so `bun lint` (canary-only at the time of writing) can gate the build. The owner accepted the trade-off: builds are less reproducible than on a stable release. Switch back to a stable pin once `bun lint` ships there.
- **Same HTML markup as the current version** is the target for the page content.
- Work happens on branch `feat/react-bun-bundler` (worktree at `../stornoway.worktrees/feat/react-bun-bundler`).

## Proposed approach (the author's calls: change freely if you find better)

**Layout**

```
src/index.html      # template with <div id="root"> and the head tags
src/index.tsx       # client entry: hydrate (or mount, if root is empty)
src/App.tsx         # the CV (ported from app/pages/index.vue + layout)
src/main.css        # ported from app/assets/css/main.css
src/assets/aws.svg  # moved from app/assets/svg/aws.svg
build.ts            # build + prerender script
bunfig.toml         # [lint] and [fmt] config
```

**Build (`build.ts`)**

1. Empty `dist/`, copy `public/` into it.
2. `Bun.build` the client entry (`src/index.tsx`) to `dist/` with minification and hashed filenames, and the Tailwind plugin for CSS.
3. Import `App`, call `renderToString` from `react-dom/server`.
4. Write `dist/index.html`: the template with the rendered markup inside `#root`, plus `<link>`/`<script>` tags for the hashed outputs.

**Client entry.** If `#root` has children, call `hydrateRoot`; otherwise `createRoot`. That lets the Bun dev server (`bun ./src/index.html`, which does not prerender) and the production build share one entry file.

**Tailwind.** v4 is already in use. Swap `@tailwindcss/vite` for `bun-plugin-tailwind`. If that plugin proves unsuitable for the prerender flow, use the `tailwindcss` CLI. `tailwind.config.js` is ignored by v4 and gets deleted, as do `postcss` and `autoprefixer`.

**Component port.** Straight translation of `index.vue`: `class` → `className`, `v-for` → `.map` with keys, `v-if` → conditional, `:href` → `href`, SVG attributes camelCased. Data constants stay at the top of the file. The layout wrapper `div` becomes part of `App`. The AWS icon is imported as an asset, so Bun emits and hashes it.

**Dependencies**

- Add: `react`, `react-dom`, `tailwindcss`, `bun-plugin-tailwind`, `typescript`, `@types/react`, `@types/react-dom`, `@types/bun`.
- Remove: `nuxt`, `vue`, `vue-router`, `@nuxt/image`, `@nuxt/eslint`, `@tailwindcss/vite`, `autoprefixer`, `postcss`, `eslint-config-prettier`, `prettier`, `vitest`.

**Tooling config**

- `bunfig.toml`: `[fmt]` with `singleQuote = true`, `printWidth = 120` (then delete `.prettierrc`). Do not enable Tailwind class sorting, since it would reorder classes and break markup parity.
- `[lint]`: start from defaults (React hooks and a11y rules apply because `react` is a dependency). Delete `eslint.config.mjs`.
- Do not define package.json scripts called `lint` or `fmt`. The built-in commands read those names, and CI calls `bun lint` and `bun fmt --check` directly. Keep `dev`, `build`, `preview` (serve `dist/` locally) and `test`.

**Tests (`bun test`).** There are none today, and the CI test step is commented out. Add a small smoke test that runs the build and asserts `dist/index.html` contains the name, each section heading and a hashed script tag. Enable the CI test step.

**CI (`.github/workflows/main.yml`).**

- `setup-bun` with `bun-version: canary`. Prefer a specific canary version if `setup-bun` supports one. Update `.bun-version` for local use to match.
- Replace `bun format:check` with `bun fmt --check`, keep `bun lint` (now Bun's), add `bun test`, and replace "Generate static files / `bun generate`" with `bun run build`.
- Everything from `cfn-lint` down stays untouched.

**Cleanup.** Delete `app/`, `nuxt.config.ts`, `tailwind.config.js`, `eslint.config.mjs`, `.prettierrc`, and the Nuxt entries in `.gitignore`. Rewrite `README.md` (it is the Nuxt starter boilerplate) to cover the new commands.

## Markup parity: how we check it

1. **Before changing anything**, build `main` and keep its `dist/index.html` as the baseline.
2. After the port, extract the `<main>…</main>` subtree from both outputs, normalise whitespace and Vue's `<!--[-->` / `<!--]-->` fragment markers, and diff.
3. **Expected differences only:**
   - Footer credit: "Built with Nuxt.js" becomes "Built with React" and links to react.dev. This is a deliberate content change, because the old text would be wrong. It is the author's call, so say if you want to keep "Nuxt.js" or drop the credit.
   - The `aws.svg` `src` value (hashed path vs. whatever Nuxt emits).
   - Any other difference is a bug in the port, or must be listed in the PR with a reason.
4. `<head>`: compare against the baseline too. Keep `charset`, `viewport` and `<title>` only if the baseline has them. Nuxt's wrapper `div`, payload script and hashed `_nuxt/` links are intentionally not reproduced.
5. This is a one-off migration check, not a permanent test.

## Left to the builder

- Exact Tailwind integration (plugin vs. CLI), and the exact canary pin.
- Whether `bun lint` needs rule tweaks, and how to resolve any real findings in the ported code.
- The prerender script's internal structure, as long as it stays small and readable.
- Wording of the new README.

## Risks

- **Canary Bun** can break between builds. Mitigation: pin a specific canary version if possible, and let Dependabot-style bumps be deliberate.
- **`bun lint` and `bun fmt` are new.** Rule sets or output could differ from ESLint/Prettier in small ways. Accept the Bun defaults and fix findings in the new code rather than recreating the old config.
- **Hydration mismatches** would show as console warnings. Check the built page in a browser once, in light and dark mode.
