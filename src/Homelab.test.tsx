import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import Homelab, { groups, hardware, intro, pipeline, services } from './Homelab';

const html = renderToStaticMarkup(<Homelab />);
// React escapes apostrophes in text, so compare against the escaped form.
const esc = (s: string) => s.replaceAll("'", '&#x27;');

describe('Homelab', () => {
  test('renders the intro', () => {
    expect(html).toContain(intro);
  });

  test('renders every service card with what it is used for and any lesson', () => {
    for (const name of [
      'Gitea',
      'Gitea Actions',
      'Artifact Keeper',
      'Docker Registry, as a pull-through cache',
      'Docker Registry',
      'Arcane',
      'Aspire Dashboard',
      'n8n',
    ]) {
      expect(services.some((s) => s.name === name)).toBe(true);
    }
    for (const s of services) {
      expect(html).toContain(`<article id="${s.id}"`);
      expect(html).toContain(esc(s.name));
      expect(html).toContain(esc(s.usedFor));
      if (s.taught) expect(html).toContain(esc(s.taught));
    }
  });

  test('shows "Taught me" only on services that have a lesson', () => {
    expect(html.split('>Taught me<').length - 1).toBe(services.filter((s) => s.taught).length);
    expect(services.find((s) => s.id === 'registry')!.taught).toBeUndefined();
  });

  test('renders the small tiles', () => {
    const tiles = groups.flatMap((g) => g.tiles ?? []);
    expect(tiles.map((t) => t.name)).toEqual(['PostgreSQL', 'RabbitMQ', 'RustFS', 'Home Assistant', 'Pi-hole']);
    for (const t of tiles) expect(html).toContain(esc(t.text));
  });

  test('every in-page link points at a service card', () => {
    const ids = new Set(services.map((s) => s.id));
    const targets = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]!);
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) expect(ids.has(t)).toBe(true);
  });

  test('the deploy path follows a push in order', () => {
    expect(pipeline.map((p) => p.id)).toEqual(['gitea', 'actions', 'keeper', 'cache', 'registry', 'arcane']);
    const nav = html.match(/<nav aria-label="Deploy path"[^]*?<\/nav>/)?.[0] ?? '';
    const order = [...nav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(order).toEqual(pipeline.map((p) => p.id));
  });

  test('renders the hardware and the next step', () => {
    expect(hardware).toHaveLength(5);
    for (const h of hardware) {
      expect(html).toContain(h.machine);
      expect(html).toContain(h.role);
    }
    expect(html).toContain('Kubernetes cluster');
  });

  test('links back to the CV', () => {
    expect(html).toMatch(/<a href="\/"[^>]*>[^]*?Back to CV/);
  });

  test('has no inline styles', () => {
    expect(html).not.toMatch(/\sstyle="/);
  });
});
