# Homelab page

## Intent

Bence built a homelab to learn and practise. It is a small self-hosted platform: push-to-deploy CI/CD, package caching, a container registry, messaging, object storage and observability. It belongs on the CV site as a talking point for introductions: it shows he keeps building outside work, and much of it maps to the cloud work already on the CV (S3, Kafka, CloudWatch-style observability, GitHub Actions).

It is low priority, so it goes on a **separate page at `/homelab/`**, linked from the CV. The CV stays short and keeps printing cleanly.

## Goals

- A page at `cv.molnarbence.dev/homelab/` with three CSS-only tabs: **What I run**, **How it fits together**, **What it taught me**.
- A link from the CV header to the page.
- The page looks like part of the CV: the same palette, tokens, container width, type and print styles.
- It works with JavaScript disabled, on phones (about 400px wide), and in print, where all three panels are shown stacked.

## Non-goals

- Live data such as uptime or status pulled from the lab.
- Links into the lab or to repos. Everything is behind a firewall, so the page is description only.
- Changing the CV's content or layout beyond the one header link.

## Anti-goals

- **No invented facts.** No build-time numbers, device counts or uptime figures unless Bence supplies them.
- **No internal details:** no hostnames, IPs, ports, domain names or VLAN layout.
- **No JavaScript and no change to the security policy.** The `ships no JavaScript` and `has no inline style attributes` tests must keep passing and must cover the new page.

## Constraints

- The CSP is `default-src 'none'; style-src 'self'; img-src 'self' data:`, so no scripts and no `style="…"` attributes. SVG presentation attributes such as `fill` are allowed. Styling goes through Tailwind classes and `src/main.css`.
- CloudFront reads from the S3 **website** endpoint, whose index document is `index.html`. So `dist/homelab/index.html` is served at `/homelab/`, and S3 redirects `/homelab` to `/homelab/`. No AWS changes are needed.
- The deploy step uploads every non-CSS file with `no-cache` and invalidates `/*`, so the new page needs no deploy changes.

## Approaches

**Page build**
1. **React component, prerendered (chosen).** Add `src/Homelab.tsx` and have `build.ts` render it into `dist/homelab/index.html` from its own template, the same way it renders the CV. It reuses the tokens, the print styles and the existing tests.
2. *Hand-written HTML, like `404.html`.* Less build work, but it can't share components with the CV and isn't checked by the same tests.

**Tabs**
1. **Hidden radio buttons (chosen).** One radio per tab, with labels styled as tabs. The first tab is selected by default and arrow keys move between tabs, both native radio behaviour. The cost is that you can't link to a single tab.
2. *URL fragment tabs with `:target`.* Each tab gets a link, but with no fragment in the URL nothing is selected, and the back button steps through tab clicks.

**Rejected earlier:** loosening the CSP to `script-src 'self'` for real ARIA tabs. The risk is small, but it would break the "no JavaScript" design rule for little gain. Option D from the options page, a clickable architecture diagram, needs JavaScript and doesn't work on phones or in print.

Options page with the mockups: https://claude.ai/artifact/DJB73UvADs3JdV3DNTebCA. Option C was chosen, with the "Why I run it" tab folded into the intro and a "How it fits together" tab added in its place.

## Content

The wording is a draft. Bence reviews the copy on the built page. Facts below come only from Bence.

**Page header:** a small "← Back to CV" link to `/`, the heading **Homelab**, and the intro:
> A self-hosted platform I built to learn and practise: push-to-deploy CI/CD, package caching, messaging, object storage and observability, running on a NAS and five mini PCs at home.

**Tab 1: What I run**

Hardware, as a definition list:

| Machine | Role |
|---|---|
| UGREEN NAS + 1 Intel NUC | Docker hosts managed by Arcane, running the platform services |
| 1 Intel NUC | Home Assistant |
| 1 Intel NUC | Pi-hole, network-wide DNS and ad blocking |
| 2 Intel NUCs | Kubernetes cluster, not yet in use |
| UPS | Keeps it all running through power cuts |

Services, as chip groups in the same style as the CV's Skills block:
- **Delivery:** Gitea, Gitea Actions, Registry (Docker), Artifact Keeper (NuGet, npm, PyPI)
- **Runtime:** Arcane, Docker
- **Data & messaging:** PostgreSQL, RabbitMQ, RustFS (S3-compatible)
- **Observability:** Aspire Dashboard (logs, traces, metrics)
- **Automation & home:** n8n, Home Assistant, Pi-hole

Closing line: **Next:** moving workloads onto the two-node Kubernetes cluster.

**Tab 2: How it fits together**

The delivery flow, as a numbered list, because the steps really are a sequence. On wide screens it is laid out horizontally with arrows, and on phones and in print it stacks:
1. **Push** to Gitea.
2. **Build** in Gitea Actions, pulling packages through Artifact Keeper and base images through the registry cache.
3. **Publish** the image to the local Docker registry.
4. **Notify:** a webhook tells Arcane a new version exists.
5. **Sync:** Arcane runs a GitOps sync and redeploys the containers.

Under it, one line: *Running alongside:* PostgreSQL, RabbitMQ and RustFS for apps; Aspire Dashboard collects logs, traces and metrics.

**Tab 3: What it taught me**

Three short entries, each a heading and one or two sentences:
1. **Making it work as one system.** The hard part wasn't running each service. It was wiring Gitea, Actions, the registry and Arcane together so a push ends up deployed with no manual steps.
2. **Faster builds.** Artifact Keeper caches NuGet, npm and PyPI packages, and a local registry and registry cache serve container images, so CI runs don't download everything from the internet each time.
3. **Replacing cron apps with workflows.** Small jobs that used to be a scheduled application are now n8n workflows: updating a Cloudflare DNS record with my public IP, and importing the CSV export from the Fuelio app, which holds my EV charging and refuelling data.

If Bence later supplies before/after build times, they go in entry 2.

## How it is built (Claude's calls)

- **Files:**
  - `src/Homelab.tsx` holds the page component and its content data (exported arrays, like `App.tsx`).
  - `src/homelab.html` is the template, copied from `src/index.html` with its own `<title>Homelab — Bence Molnár</title>`, description, canonical URL `https://cv.molnarbence.dev/homelab/` and `og:url`, and no JSON-LD.
  - `src/homelab.tsx` is the dev-server entry, like `src/index.tsx`.
- **Shared layout:** move `container`, `sectionHeading`, `subHeading` and `linkClass` from `App.tsx` into `src/layout.ts`, so both pages import the same classes. This is a refactor only, and the CV markup must not change.
- **Build:** `build.ts` renders a list of pages, `[{ template, component, out }]`, with the CV at `index.html` and the homelab at `homelab/index.html`. Both get the same stylesheet link and have the dev `<script>` stripped. `404.html` stays as it is. Keep the script short and readable, as the bundler design asks.
- **Dev and preview:** `dev` becomes `bun ./src/index.html ./src/homelab.html`, and Bun serves the second at `/homelab`. `preview.ts` maps a path ending in `/` to `index.html` inside it, so `/homelab/` works locally as it does on S3.
- **Tab mechanism:** a `<fieldset>` with a visually hidden `<legend>`, then three `<input type="radio" name="homelab-tab" class="sr-only">` each followed by its `<label>`. The first input is `defaultChecked`. Three panels follow, each starting with an `<h2>` that has the tab's name. The CSS in `main.css` shows the panel whose radio is checked, using `:has()` on the wrapper, for example `.tabs:has(#tab-run:checked) #panel-run { display: block }`. Labels get the selected style (sunflower text and underline) from `:checked + label`, and a focus ring from `:focus-visible + label`. The panel headings are visually hidden on screen, because the tab label already names the panel, and shown in print.
- **Print:** hide the tab bar and show all three panels with their headings, using the existing print tokens. `print:break-inside-avoid` on each entry.
- **Phone:** the tab labels wrap onto a second line if needed, and the flow list stacks into one column.
- **CV link:** add a "Homelab" item to the header contact list in `App.tsx`, after the GitHub links, as an internal link to `/homelab/` with no `target="_blank"` and a small server or stack outline icon in the same style as the location and email icons. It is hidden in print, because a relative link means nothing on paper. "home automation" in Interests stays plain text.
- **Tests:**
  - `build.test.ts`: `homelab/index.html` is written, contains "Homelab" and all three tab labels, links the hashed stylesheet and the favicons, and has no inline style attributes. The `ships no JavaScript` loop also covers `homelab/index.html`.
  - New `src/Homelab.test.tsx`: every hardware row and service name renders; the first radio is checked and the other two are not; there are three panels; there is a link back to `/`.
  - `App.test.tsx`: the CV links to `/homelab/`.

## Left to the builder

- The exact Tailwind classes, spacing and the arrow glyph used in the flow list.
- Which outline icon is used for the CV header link.
- How `build.ts` is structured internally, as long as it stays short and the existing tests pass unchanged.
