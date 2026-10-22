# React + Bun Bundler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Nuxt 4 CV site with a small React app built by `bun build`, prerendered to static HTML at build time, with Bun's own lint, format and test tooling.

**Architecture:** `build.ts` bundles the client entry with `Bun.build` (Tailwind via plugin), renders `<App />` with `renderToString`, and writes `dist/index.html` from a template, linking the hashed JS and CSS. The client entry hydrates the prerendered markup. CI builds with a pinned Bun canary so `bun lint` can gate it.

**Tech Stack:** Bun (canary), React 19, `react-dom/server`, Tailwind CSS v4 + `bun-plugin-tailwind`, TypeScript, `bun test`, `bun lint`, `bun fmt`.

**Spec:** `docs/superpowers/specs/2026-10-22-react-bun-bundler-design.md`

## Global Constraints

- Output is static files in `dist/`: prerendered `index.html` at the root, hashed JS and CSS, `public/` (`favicon.ico`, `robots.txt`) copied to the root unchanged. Nothing may depend on `_nuxt/`, `200.html` or `404.html`.
- The HTML must not ship an empty `<div id="root"></div>`: content is prerendered.
- Prerendered `<main>` markup matches the current Nuxt output; only allowed differences are the footer credit ("Built with Nuxt.js" becomes "Built with React", linking to react.dev) and the `aws.svg` `src`.
- `<head>` keeps `charset`, `viewport` and `<title>` only if the baseline build has them.
- No changes to `aws/` or to the CI jobs from `cfn-lint` downwards.
- Style: `.editorconfig`, single quotes, `printWidth` 120 (in `bunfig.toml` `[fmt]`). Tailwind class sorting stays off.
- No package.json scripts named `lint` or `fmt`; CI calls `bun lint` and `bun fmt --check` directly.
- CI and `.bun-version` use a Bun canary build; prefer a specific canary version if `oven-sh/setup-bun` supports one.
- Remove: `nuxt`, `vue`, `vue-router`, `@nuxt/image`, `@nuxt/eslint`, `@tailwindcss/vite`, `autoprefixer`, `postcss`, `eslint-config-prettier`, `prettier`, `vitest`. Add: `react`, `react-dom`, `tailwindcss`, `bun-plugin-tailwind`, `typescript`, `@types/react`, `@types/react-dom`, `@types/bun`.
- Work happens in the worktree `/Users/bence/repos/github.com/mb-dot-dev/stornoway.worktrees/feat/react-bun-bundler` on branch `feat/react-bun-bundler`. Commit messages end with the attribution line given in the session.
- Scratch files (baseline, parity script) live in the session scratchpad, not the repo: `/private/tmp/claude-501/-Users-bence-repos-github-com-mb-dot-dev-stornoway/ee7dc449-aa98-4863-b00a-3f7510a00997/scratchpad` (referred to below as `$SCRATCH`).

## Review Focus

1. Non-ASCII text (`á`, `—`, `·`, `•`) must survive prerendering and display correctly: `<meta charset="utf-8">` present and the text intact in `dist/index.html`. (Task 2, Task 3)
2. Stale output: building twice, or after a file is removed from `src/` or `public/`, must not leave old files in `dist/`. (Task 2)
3. `build.ts` must work when run from any directory (`bun /abs/path/build.ts`), not only the repo root. (Task 2)
4. Hydration mismatch: JSX whitespace around the footer link and text such as `Built with` / `| hosted on` must render the same on server and client. (Task 3, Task 6)
5. Asset URLs (hashed JS, CSS, `aws.svg`) must be root-absolute (`/…`), since CloudFront serves `index.html` from `/`. (Task 2, Task 3)
6. The dev entry must work when `#root` is empty (dev server) as well as when it is prerendered. (Task 2)

---

### Task 1: Capture the Nuxt baseline

**Files:** none in the repo. Outputs go to `$SCRATCH/baseline/`.

**Interfaces:**
- Produces: `$SCRATCH/baseline/index.html` (the Nuxt-generated page), `$SCRATCH/baseline/head.txt` (the `<head>` contents), `$SCRATCH/baseline/timing.txt` (wall time of `bun generate`, cold and warm). Later tasks compare against these.

- [ ] **Step 1: Build the unmodified site**

Run, in the worktree: `bun install && time bun generate`.
Expected: exits 0 and produces `dist/index.html`. If `dist/` does not exist, find where `nuxt generate` writes (`.output/public`) and use that path for the baseline.

- [ ] **Step 2: Save the baseline**

Copy `dist/index.html` to `$SCRATCH/baseline/index.html`. Write the `<head>…</head>` section to `$SCRATCH/baseline/head.txt` and note in it whether a `<title>` is present. Re-run `time bun generate` once more and save both timings to `$SCRATCH/baseline/timing.txt`.

- [ ] **Step 3: Check the baseline**

Run: `grep -c "Bence Molnár" $SCRATCH/baseline/index.html`
Expected: a count of 1 or more, which confirms the page content is prerendered in the baseline.

No commit: nothing in the repo changes.

---

### Task 2: Build pipeline with a placeholder app

**Files:**
- Create: `build.ts`, `build.test.ts`, `bunfig.toml` (the `[test]` section is not needed yet), `tsconfig.json` (replace the Nuxt one), `src/index.html`, `src/index.tsx`, `src/App.tsx` (placeholder), `src/main.css` (port of `app/assets/css/main.css`), `src/assets/aws.svg` (move from `app/assets/svg/aws.svg` with `git mv`)
- Modify: `package.json` (dependencies per Global Constraints; scripts `dev`, `build`, `preview`, `test`; `name` becomes `stornoway`; remove `postinstall`), `bun.lock`

**Interfaces:**
- Produces: `build.ts` exports `build(options?: { outDir?: string }): Promise<void>`. `outDir` defaults to `<repo>/dist`, resolved relative to `build.ts`, not the cwd. The file runs `build()` when `import.meta.main`.
- Produces: `src/App.tsx` exports `default function App(): JSX.Element`.
- Produces: `src/index.html` is the template. It contains `<meta charset="utf-8">`, the viewport meta, a `<title>` if the baseline has one, and `<div id="root"></div>`. `build.ts` injects the rendered markup into `#root` and adds the hashed `<link rel="stylesheet">` and `<script type="module">` tags with root-absolute URLs.
- Produces: `src/index.tsx` hydrates with `hydrateRoot` when `#root` has children and uses `createRoot` otherwise.

- [ ] **Step 1: Write the failing test in `build.test.ts`**

Each test builds into a fresh temp dir (`fs.mkdtemp`) via `build({ outDir })`. Tests:
- `writes prerendered index.html`: `dist/index.html` exists, contains the placeholder App's text inside `<div id="root">`, and `<meta charset="utf-8">`.
- `links hashed assets with root-absolute urls`: the HTML has exactly one `<script type="module" src="/…\.js">` and one stylesheet `href="/…\.css"`, both matching `/[-.][a-z0-9]{6,}\.(js|css)` hashed names, and both files exist in the output dir.
- `copies public files`: `favicon.ico` and `robots.txt` are present at the output root.
- `removes stale files`: create `outDir/stale.txt` before building; after building it is gone.
- `works from another cwd`: run `bun <abs>/build.ts` as a subprocess with `cwd` set to the OS temp dir and the `outDir` taken from an env var `BUILD_OUT_DIR`; assert `index.html` exists. (`build.ts` reads `BUILD_OUT_DIR` only in the `import.meta.main` path.)
- `preserves non-ascii text`: the placeholder App renders `Bence Molnár — London · test •`; assert the same string appears verbatim in `index.html`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test build.test.ts`
Expected: FAIL (`build.ts` does not exist).

- [ ] **Step 3: Update `package.json` and install**

Apply the dependency changes from Global Constraints and the scripts: `dev` = `bun ./src/index.html`, `build` = `bun build.ts`, `preview` = serve `dist/` (a Bun one-liner or a three-line `preview.ts` that uses `Bun.serve` on `dist/`), `test` = `bun test`. Run `bun install`.

- [ ] **Step 4: Implement `build(options?): Promise<void>` in `build.ts`**

Steps inside: clear and recreate `outDir`; copy `public/`; `Bun.build` with `entrypoints: ['src/index.tsx']`, `outdir: outDir`, `minify: true`, `naming` with a content hash, `publicPath: '/'`, plugins `[tailwind]` from `bun-plugin-tailwind`; throw with the build logs if `success` is false; `renderToString(<App />)`; read `src/index.html`, replace the empty root with the rendered markup, and append the asset tags found in `outputs` (by `kind` and path). Resolve all paths from `import.meta.dir`.

- [ ] **Step 5: Write `src/index.tsx`, `src/App.tsx` (placeholder) and `src/main.css`**

`index.tsx` imports `./main.css` and `App`, and chooses `hydrateRoot` or `createRoot` as described in Interfaces. The placeholder `App` renders the non-ASCII test string in a `<main>`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `bun test build.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 7: Smoke-check the dev server**

Run `bun run dev`, open the printed URL, and confirm the placeholder renders with no console errors. This covers the empty-`#root` path. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add Bun build pipeline with prerendering"
```

(Nuxt files are still present; they are removed in Task 5.)

---

### Task 3: Port the CV page

**Files:**
- Modify: `src/App.tsx` (replace the placeholder)
- Create: `src/App.test.tsx`
- Reference: `app/pages/index.vue`, `app/layouts/default.vue` (still in the tree until Task 5)

**Interfaces:**
- Consumes: `build()` from Task 2 and `App` default export.
- Produces: the final `App` component. The layout wrapper `div`s from `default.vue` are the outermost elements of `App`; page content is the `<main class="space-y-10">` subtree.

- [ ] **Step 1: Write the failing test in `src/App.test.tsx`**

Render with `renderToStaticMarkup(<App />)` and assert:
- `contains name, location and email`: `Bence Molnár`, `London, UK`, `hiring@molnarbence.dev`, and `href="mailto:hiring@molnarbence.dev"`.
- `contains both GitHub links`: `href="https://github.com/molnarbence"` and `href="https://github.com/mb-dot-dev"`, each with `target="_blank"` and `rel="noopener"`.
- `contains every section heading`: `Experience`, `Skills`, `Education`.
- `renders one entry per experience, skill and education item`: counts match the data constants in the component (export them as `experiences`, `skills`, `education` so the test can compare).
- `footer credits React`: contains `href="https://react.dev"` and not `Nuxt`.
- `preserves non-ascii text`: the output contains `Molnár` and `—` unescaped.

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test src/App.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Port `index.vue` to `src/App.tsx`**

Straight translation, no restructuring: `class` → `className`, `v-for` → `.map` with keys, `v-if` → conditional, `:href` → `href`, SVG attributes to camelCase, `style="filter: invert(60%)"` to an object. Keep the data constants at the top (copy the values verbatim from `index.vue`). Import `aws.svg` from `./assets/aws.svg` for the footer `<img>`. Use `{' '}` where needed so text around the footer links renders the same as in the baseline.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test src/App.test.tsx build.test.ts`
Expected: PASS. (The `build.test.ts` non-ASCII test now uses the real page: update its expected string to `Bence Molnár`.)

- [ ] **Step 5: Run the markup parity check**

Write `$SCRATCH/parity.ts` (not committed). It takes the baseline path and a new HTML path, extracts `<main>…</main>` from each, removes `<!--[-->`, `<!--]-->` and `<!---->` markers, collapses whitespace between tags, and prints a line-by-line diff of the two normalised strings.
Run: `bun build.ts && bun $SCRATCH/parity.ts $SCRATCH/baseline/index.html dist/index.html`
Expected: the only differences are the footer credit text/link and the `aws.svg` `src`. Fix any other difference in `App.tsx`. List the remaining expected differences in the commit message.

- [ ] **Step 6: Compare `<head>`**

Compare `dist/index.html`'s `<head>` with `$SCRATCH/baseline/head.txt`. Make `src/index.html` match for `charset`, `viewport` and `<title>` (only if the baseline has one). Re-run `bun test`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Port the CV page to React"
```

---

### Task 4: Bun lint and format

**Files:**
- Modify: `bunfig.toml`
- Delete: `eslint.config.mjs`, `.prettierrc`
- Modify: any `src/` or root `.ts`/`.tsx` file that `bun lint` or `bun fmt --check` flags

**Interfaces:**
- Consumes: the code from Tasks 2 and 3.
- Produces: `bun lint` and `bun fmt --check` both exit 0 on the repo.

- [ ] **Step 1: Run Bun's tools and record the findings**

Run: `bun upgrade --canary`, then `bun lint` and `bun fmt --check`.
Expected: both run (they are canary-only for lint). Note any warnings or errors. If the `lint` or `fmt` command is missing, stop and report which canary version was installed.

- [ ] **Step 2: Add `[fmt]` to `bunfig.toml`**

Set `singleQuote = true` and `printWidth = 120`. Run `bun fmt --doctor` to confirm it reads those values, then delete `.prettierrc` and `eslint.config.mjs`. Do not enable Tailwind class sorting.

- [ ] **Step 3: Fix findings in the new code**

Run `bun fmt` to format, and `bun lint --fix` for safe fixes; fix the rest by hand. Keep the default rule set; add a `[lint.rules]` override only for a rule that is wrong for this repo, with a one-line comment saying why.

- [ ] **Step 4: Verify**

Run: `bun fmt --check && bun lint --max-warnings 0 && bun test`
Expected: all exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Switch linting and formatting to Bun"
```

---

### Task 5: CI, cleanup and docs

**Files:**
- Modify: `.github/workflows/main.yml` (the `build` job only), `.bun-version`, `.gitignore`, `README.md`
- Delete: `app/`, `nuxt.config.ts`, `tailwind.config.js`

**Interfaces:**
- Consumes: scripts from Task 2 and tooling from Task 4.
- Produces: a CI `build` job that runs `bun fmt --check`, `bun lint`, `bun test` and `bun run build`, then uploads `dist`.

- [ ] **Step 1: Delete the Nuxt files**

`git rm -r app nuxt.config.ts tailwind.config.js`. Remove the Nuxt entries (`.output`, `.data`, `.nuxt`, `.nitro`, `.cache`) from `.gitignore`; keep `dist`, `node_modules` and the rest.

- [ ] **Step 2: Update the `build` job in `main.yml`**

- `oven-sh/setup-bun` gets `with: bun-version: canary` (or the specific canary version if the action supports one; set `.bun-version` to the same value).
- Replace `bun format:check` with `bun fmt --check`; keep `bun lint`; uncomment and use `bun test`; replace `bun generate` with `bun run build`.
- Leave `cfn-lint` and every job below it untouched. Keep the `dist` artifact path.

- [ ] **Step 3: Rewrite `README.md`**

Replace the Nuxt starter text with: what the site is, the commands (`bun install`, `bun run dev`, `bun run build`, `bun run preview`, `bun test`, `bun lint`, `bun fmt`), a short note on how the prerender works, and the canary-pin trade-off with the condition for going back to stable.

- [ ] **Step 4: Verify from clean**

Run: `rm -rf node_modules dist && bun install && bun fmt --check && bun lint --max-warnings 0 && bun test && bun run build`
Expected: all exit 0. Run `git status` and confirm no stray Nuxt directories remain.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Remove Nuxt and update CI and docs for the Bun build"
```

---

### Task 6: Final verification

**Files:** none modified, unless a defect is found.

- [ ] **Step 1: Re-run the parity check**

Run: `bun run build && bun $SCRATCH/parity.ts $SCRATCH/baseline/index.html dist/index.html`
Expected: only the footer credit and the `aws.svg` `src` differ.

- [ ] **Step 2: Check the built page in a browser**

Run `bun run preview`, open the page, and check in light and dark mode (use the browser's emulation of `prefers-color-scheme`). Confirm: layout is correct, the AWS icon loads, and the console shows no hydration warnings or 404s for assets. Check "View source" shows the content in the HTML.

- [ ] **Step 3: Record the build-time comparison**

Time `bun run build` (cold, after removing `dist`; and warm) and compare with `$SCRATCH/baseline/timing.txt`. Put both numbers in the PR description.

- [ ] **Step 4: Confirm the deploy contract**

Check that `dist/` has `index.html` at the root plus hashed assets, `favicon.ico` and `robots.txt`, and nothing else the upload job would sync unexpectedly. Run `git diff main --stat -- aws` and expect no output.

- [ ] **Step 5: Fix and commit any defects found, then stop for review**

If anything above failed, fix it with a test where one is possible and commit. Then hand back to the project owner; do not open the PR or merge until they ask.
