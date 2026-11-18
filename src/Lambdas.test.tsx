import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import Lambdas, { apps, groups, intro, lanes, toolkit } from './Lambdas';

const html = renderToStaticMarkup(<Lambdas />);
// React escapes apostrophes in text, so compare against the escaped form.
const esc = (s: string) => s.replaceAll("'", '&#x27;');

describe('Lambdas', () => {
  test('renders the intro', () => {
    expect(html).toContain(intro);
  });

  test('groups the five repos into producers, the consumer and the standalone app', () => {
    expect(groups.map((g) => [g.name, g.apps.map((a) => a.id)])).toEqual([
      ['Producers', ['helsinki', 'stockholm', 'warsaw']],
      ['Queue and consumer', ['oslo']],
      ['Standalone', ['copenhagen']],
    ]);
  });

  test('renders every app card with what it shows, its details and a GitHub link', () => {
    for (const a of apps) {
      expect(html).toContain(`<article id="${a.id}"`);
      expect(html).toContain(esc(a.shows));
      for (const d of a.details) expect(html).toContain(esc(d));
      expect(html).toContain(`<a href="https://github.com/mb-dot-dev/${a.repo}" target="_blank" rel="noopener"`);
    }
  });

  test('producers send to Oslo, and Oslo receives from every producer', () => {
    const producers = groups[0]!.apps;
    for (const p of producers) expect(p.related.ids).toEqual(['oslo']);
    expect(apps.find((a) => a.id === 'oslo')!.related.ids).toEqual(producers.map((p) => p.id));
    expect(apps.find((a) => a.id === 'copenhagen')!.related.ids).toBeUndefined();
  });

  test('the diagram links every app, with Copenhagen in its own lane', () => {
    const nav = html.match(/<nav aria-label="How the apps connect"[^]*?<\/nav>/)?.[0] ?? '';
    const targets = new Set([...nav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
    expect(targets).toEqual(new Set(apps.map((a) => a.id)));
    expect(lanes[1]!.steps.flat().every((n) => n.id === 'copenhagen')).toBe(true);
  });

  test('every in-page link points at an app card', () => {
    const ids = new Set(apps.map((a) => a.id));
    for (const m of html.matchAll(/href="#([^"]+)"/g)) expect(ids.has(m[1]!)).toBe(true);
  });

  test('renders the shared toolkit', () => {
    for (const t of toolkit) {
      expect(html).toContain(t.name);
      expect(html).toContain(t.text);
    }
  });

  test('links back to the CV', () => {
    expect(html).toMatch(/<a href="\/"[^>]*>[^]*?Back to CV/);
  });

  test('has no inline styles', () => {
    expect(html).not.toMatch(/\sstyle="/);
  });
});
