# Homelab Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a prerendered `/homelab/` page with three CSS-only tabs, and link it from the CV header.

**Architecture:** `src/Homelab.tsx` is a React component, prerendered by `build.ts` into `dist/homelab/index.html` from its own template `src/homelab.html`. This is the same path the CV takes. The tabs are hidden radio inputs, with panel visibility driven by `:has(:checked)` rules in `src/main.css`. No JavaScript ships, and the CSP is unchanged.

**Tech Stack:** Bun (bundler, dev server, `bun test`), React 19 `renderToString`, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-11-18-homelab-page-design.md`. Its **Content** section is the copy source: use its wording verbatim.

## Global Constraints

- No JavaScript in `dist/`: no `.js` files, and no `<script>` tags except `type="application/ld+json"` (the homelab page has none).
- No `style="…"` attributes anywhere. Style through Tailwind classes or `src/main.css` (CSP `style-src 'self'`).
- Colours come only from the existing semantic tokens in `src/main.css` (`surface`, `raised`, `text`, `strong`, `muted`, `border`, `chip`, `on-chip`, `accent`).
- No invented facts or numbers, and no hostnames, IPs, ports or domain names from the lab.
- Formatting follows `bunfig.toml`: single quotes, print width 120. `bun fmt --check` and `bun lint` must pass.
- Do not define package.json scripts named `lint` or `fmt`.
- The CV's rendered markup must not change apart from the new header link. The existing `App.test.tsx` and `build.test.ts` tests pass unchanged.

## Review Focus

- **Print:** all three panels must print, with their headings, and the tab bar must not. Tested in Task 2 by checking the CSS rules exist, plus a manual print-emulation check in Task 4.
- **Keyboard:** all radios share one `name`, so arrow keys move between tabs, and each `<label htmlFor>` matches an input `id`. Tested in Task 2.
- **Phone width (390px):** no horizontal page scroll, and the tab labels wrap. Manual check in Task 4.
- **`/homelab` with no trailing slash:** S3 redirects it, and the local preview must serve `/homelab/`. Manual curl check in Task 3.
- **Only one panel visible on screen at a time, the first one by default:** only the first radio is `checked`. Tested in Task 2.

---

### Task 1: Shared layout classes

**Files:**
- Create: `src/layout.ts`
- Modify: `src/App.tsx` (remove the local `linkClass`, `container`, `sectionHeading` and `subHeading` constants; import them)

**Interfaces:**
- Produces: `src/layout.ts` exporting `container`, `sectionHeading`, `subHeading` and `linkClass`, all `string`, with values identical to the current constants in `App.tsx`.

- [ ] **Step 1: Move the four constants into `src/layout.ts` and import them in `App.tsx`.** Copy the values verbatim.
- [ ] **Step 2: Run `bun test && bun fmt --check && bun lint`.** Expected: all pass with no test changes. The markup is identical.
- [ ] **Step 3: Commit:** `git commit -m "Move shared layout classes into layout.ts"`

### Task 2: Homelab component and CSS-only tabs

**Files:**
- Create: `src/Homelab.tsx`, `src/Homelab.test.tsx`
- Modify: `src/main.css` (add tab rules in `@layer components`)

**Interfaces:**
- Consumes: `container`, `sectionHeading`, `subHeading` and `linkClass` from `src/layout.ts`.
- Produces: `export default function Homelab(): JSX.Element`, plus these exports:
  - `hardware: { machine: string; role: string }[]` (5 rows, from the spec table)
  - `serviceGroups: { name: string; items: string[] }[]` (5 groups, from the spec)
  - `flow: { step: string; text: string }[]` (5 steps: Push, Build, Publish, Notify, Sync)
  - `lessons: { title: string; text: string }[]` (3 entries)
  - `tabs: { id: 'run' | 'fit' | 'taught'; label: string }[]`, with labels `What I run`, `How it fits together`, `What it taught me`

Markup contract, which the CSS and tests depend on:
- The wrapper is `<div class="homelab-tabs">`, containing `<fieldset>` with `<legend class="sr-only">Homelab sections</legend>`. For each tab it has `<input type="radio" name="homelab-tab" id="tab-{id}" class="sr-only">` (the first one `defaultChecked`) followed by `<label htmlFor="tab-{id}">`.
- Then three `<section id="panel-{id}" class="homelab-panel">` elements, each starting with `<h2 class="homelab-panel-heading …">{label}</h2>`.
- The page has `<header>` with a `← Back to CV` link (`href="/"`), `<h1>Homelab</h1>` and the spec's intro paragraph, then `<main>`. It has no footer.
- Panel content follows the spec: tab 1 has a hardware `<dl>`, chip groups styled like the CV Skills block, and the **Next:** line. Tab 2 has `<ol>` for the flow (horizontal from `md:`, stacked below it and in print) plus the "Running alongside" line. Tab 3 has three `<article>` elements, each with `<h3>` and `<p>`.

- [ ] **Step 1: Write the failing tests in `src/Homelab.test.tsx`.** Render with `renderToStaticMarkup(<Homelab />)`.
  - `renders every hardware row and service`: for each `hardware` row, both `machine` and `role` appear. Every item of every `serviceGroups` group appears. `hardware.length === 5`, and the services include `Gitea`, `Artifact Keeper`, `RustFS`, `RabbitMQ`, `Aspire Dashboard`, `n8n`, `Home Assistant` and `Pi-hole`.
  - `has three tabs sharing one radio group`: exactly 3 matches of `type="radio"`, all with `name="homelab-tab"`. For each tab id, both `id="tab-{id}"` and `for="tab-{id}"` appear, as does `id="panel-{id}"`.
  - `selects the first tab by default`: the `tab-run` input contains `checked=""`, and `tab-fit` and `tab-taught` do not.
  - `panels start with a heading named after their tab`: for each tab, `>{label}</h2>` appears.
  - `renders the flow in order and all lessons`: the indices of `Push`, `Build`, `Publish`, `Notify` and `Sync` in the HTML strictly increase, and every `lessons[].title` appears.
  - `links back to the CV`: matches `/<a href="\/"[^>]*>[^<]*Back to CV/`.
  - `has no inline styles`: does not match `/\sstyle="/`.
  - `print and visibility rules exist`: read `src/main.css` and assert it contains `.homelab-panel`, `:has(#tab-run:checked)`, `:has(#tab-fit:checked)` and `:has(#tab-taught:checked)`, and that an `@media print` block shows `.homelab-panel` and hides the tab `fieldset`.
- [ ] **Step 2: Run `bun test src/Homelab.test.tsx`.** Expected: FAIL, because the module isn't found.
- [ ] **Step 3: Implement `Homelab.tsx` and the CSS.** In `main.css` `@layer components`:
  - `.homelab-panel { display: none }`
  - `.homelab-tabs:has(#tab-{id}:checked) #panel-{id} { display: block }`, once for each of the three ids
  - `.homelab-tabs input:checked + label` gets the accent colour and a 2px accent bottom border. `input:focus-visible + label` gets a visible accent outline.
  - `.homelab-panel-heading` is visually hidden on screen.
  - `@media print`: `.homelab-panel { display: block }`, `.homelab-tabs fieldset { display: none }`, `.homelab-panel-heading` shown.
- [ ] **Step 4: Run `bun test && bun fmt --check && bun lint`.** Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "Add homelab page component with CSS-only tabs"`

### Task 3: Build, dev and preview for the second page

**Files:**
- Create: `src/homelab.html`, `src/homelab.tsx`
- Modify: `build.ts`, `preview.ts`, `package.json` (`dev` script), `build.test.ts`

**Interfaces:**
- Consumes: `Homelab` default export from `src/Homelab.tsx`.
- Produces: `dist/homelab/index.html`.

- [ ] **Step 1: Write the failing tests in `build.test.ts`.**
  - New `writes the homelab page`: `homelab/index.html` exists, contains `<h1` and `Homelab`, and contains all three tab labels. It has exactly one `<link rel="stylesheet" href="/…css">`, and that file exists in `outDir`. It contains `href="/favicon.svg"` and `<link rel="canonical" href="https://cv.molnarbence.dev/homelab/"`.
  - Extend `ships no JavaScript`: add `homelab/index.html` to the page list.
  - Extend `has no inline style attributes`: loop over `index.html` and `homelab/index.html`.
- [ ] **Step 2: Run `bun test build.test.ts`.** Expected: the new and extended tests FAIL.
- [ ] **Step 3: Implement.**
  - `src/homelab.html` is a copy of `src/index.html`'s head (charset, viewport, color-scheme, theme-color, the three icon links) with `<title>Homelab — Bence Molnár</title>`. Its meta description is the spec's intro sentence. It has canonical and `og:url` set to `https://cv.molnarbence.dev/homelab/`, `og:type` `website` and `og:title` equal to the title. It has no JSON-LD. The body has `<div id="root"></div>` and `<script type="module" src="./homelab.tsx"></script>`.
  - `src/homelab.tsx` mirrors `src/index.tsx`, rendering `<Homelab />`.
  - In `build.ts`, replace the single prerender with a loop over `pages: { template: string; component: () => JSX.Element; out: string }[]`, with the CV writing to `index.html` and the homelab to `homelab/index.html`. Create the `homelab/` directory. The script-stripping regex must match any `./*.tsx` dev entry. `404.html` handling is unchanged.
  - `preview.ts`: a pathname ending in `/` is served as `pathname + 'index.html'`, and `/` still serves `index.html`.
  - `package.json`: `"dev": "bun ./src/index.html ./src/homelab.html"`.
- [ ] **Step 4: Run `bun test && bun fmt --check && bun lint`.** Expected: all pass.
- [ ] **Step 5: Manual check.** Run `bun run build && bun run preview` in the background. `curl -s localhost:<port>/homelab/ | grep -c 'homelab-tab'` should print a non-zero count. `curl -s -o /dev/null -w '%{http_code}' localhost:<port>/` should print `200`. Then stop the preview.
- [ ] **Step 6: Commit:** `git commit -m "Prerender the homelab page at /homelab/"`

### Task 4: CV header link and final checks

**Files:**
- Modify: `src/App.tsx` (header contact `<ul>`), `src/App.test.tsx`

**Interfaces:**
- Consumes: `linkClass` from `src/layout.ts`.

- [ ] **Step 1: Write the failing test in `App.test.tsx`.** `links to the homelab page`: the HTML matches `/<li class="[^"]*print:hidden[^"]*"><a href="\/homelab\/" class="[^"]*">[^]*?Homelab<\/span><\/a><\/li>/` and does not contain `href="/homelab/" target="_blank"`.
- [ ] **Step 2: Run `bun test src/App.test.tsx`.** Expected: FAIL.
- [ ] **Step 3: Implement.** Add `<li className="print:hidden">` after the organisation GitHub link. It holds an `<a href="/homelab/" className={`${linkClass} gap-2`}>` containing an outline icon (a 24×24 heroicons-style server stack, `w-4 h-4 shrink-0`, `aria-hidden="true"`, `strokeWidth="1.5"`) and `<span>Homelab</span>`.
- [ ] **Step 4: Run `bun test && bun fmt --check && bun lint`.** Expected: all pass.
- [ ] **Step 5: Visual check with Playwright.** Run `bun run build && bun run preview`, then open `/homelab/`.
  - At 1280px: click each tab label, and only that panel shows.
  - At 390px: `document.documentElement.scrollWidth <= 390`.
  - With print media emulated: all three panel headings are visible and the fieldset is hidden.
  - On `/`: the Homelab link shows in the header and is hidden under print emulation.
- [ ] **Step 6: Commit:** `git commit -m "Link the homelab page from the CV header"`
