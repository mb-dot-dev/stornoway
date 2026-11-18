# Favicon redesign

## Intent

The current `public/favicon.ico` is a green mountain logo left over from a framework template. It has nothing to do with the CV site and clashes with its navy, powder blue and sunflower palette. Replace it with an icon that belongs to cv.molnarbence.dev.

## Decision

Bence picked **option B, "b." with a dot**, from the options page (https://claude.ai/artifact/RB8EQzeiG3YECNLyr1TKVa): a powder-blue lowercase "b" followed by a sunflower full stop, on a Midnight Navy rounded square.

Artwork, on a 32×32 grid:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#131d38"/>
  <path d="M8.5 5.5v20" stroke="#adc7e9" stroke-width="3.6" stroke-linecap="round"/>
  <circle cx="14.5" cy="19" r="5.7" fill="none" stroke="#adc7e9" stroke-width="3.6"/>
  <circle cx="25" cy="23.5" r="2.9" fill="#ffc20d"/>
</svg>
```

## Goals

- The icon looks right at 16px in light and dark browser tab bars.
- It uses only the palette in `src/main.css`: navy `#131d38`, powder `#adc7e9`, sunflower `#ffc20d`.
- Modern browsers get a sharp vector icon. Older clients and crawlers that ask for `/favicon.ico` still get one.

## Non-goals

- A web app manifest, maskable icons or PWA support.
- Changing the palette or any other part of the page.

## Approaches

1. **SVG plus ICO fallback, with link tags (chosen).** Add `public/favicon.svg`, replace `public/favicon.ico` with a multi-size ICO (16, 32 and 48px) rendered from the same SVG, and add `public/apple-touch-icon.png` (180px). Link all three from `src/index.html` and `src/404.html`. The SVG stays sharp at every size and the ICO covers everything else.
2. **Replace the ICO only.** This needs no HTML change, but the icon is a bitmap that blurs on high-DPI screens and when scaled.
3. **SVG only.** This is the simplest option, but `/favicon.ico` would return 404 for crawlers and some clients that request it directly.

## How it is built (Claude's calls)

- `public/favicon.svg` is the source of truth. The PNG and ICO files are rendered from it once and committed as binaries. No build-time rasteriser is added, because the project has no image tooling and the icon rarely changes.
- `apple-touch-icon.png` uses a full-bleed navy square with no rounded corners, because iOS applies its own mask.
- The tags go in the `<head>` of both pages:
  ```html
  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  ```
- The existing CSP (`img-src 'self'`) already allows these files. The deploy step uploads them with `no-cache`, and the AWS CLI infers `image/svg+xml` from the `.svg` extension.
- `build.test.ts` "copies public files" also checks that `favicon.svg` and `apple-touch-icon.png` are copied, and a test checks that the built `index.html` contains the icon link.
