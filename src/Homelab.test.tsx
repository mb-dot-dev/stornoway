import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import Homelab, { flow, hardware, lessons, serviceGroups, tabs } from './Homelab';

const html = renderToStaticMarkup(<Homelab />);
const count = (needle: string) => html.split(needle).length - 1;
const inputTag = (id: string) => html.match(new RegExp(`<input[^>]*id="tab-${id}"[^>]*>`))?.[0] ?? '';

describe('Homelab', () => {
  test('renders every hardware row and service', () => {
    expect(hardware).toHaveLength(5);
    for (const h of hardware) {
      expect(html).toContain(h.machine);
      expect(html).toContain(h.role);
    }
    const services = serviceGroups.flatMap((g) => g.items);
    for (const s of services) expect(html).toContain(s);
    for (const s of [
      'Gitea',
      'Artifact Keeper',
      'RustFS',
      'RabbitMQ',
      'Aspire Dashboard',
      'n8n',
      'Home Assistant',
      'Pi-hole',
    ]) {
      expect(services.some((item) => item.startsWith(s))).toBe(true);
    }
  });

  test('has three tabs sharing one radio group', () => {
    expect(tabs.map((t) => t.label)).toEqual(['What I run', 'How it fits together', 'What it taught me']);
    expect(count('type="radio"')).toBe(3);
    expect(count('name="homelab-tab"')).toBe(3);
    for (const t of tabs) {
      expect(html).toContain(`id="tab-${t.id}"`);
      expect(html).toContain(`for="tab-${t.id}"`);
      expect(html).toContain(`id="panel-${t.id}"`);
    }
  });

  test('selects the first tab by default', () => {
    expect(inputTag('run')).toContain('checked=""');
    expect(inputTag('fit')).not.toContain('checked');
    expect(inputTag('taught')).not.toContain('checked');
  });

  test('panels start with a heading named after their tab', () => {
    for (const t of tabs) {
      expect(html).toMatch(new RegExp(`<section id="panel-${t.id}"[^>]*><h2[^>]*>${t.label}</h2>`));
    }
  });

  test('renders the flow in order and all lessons', () => {
    expect(flow.map((f) => f.step)).toEqual(['Push', 'Build', 'Publish', 'Notify', 'Sync']);
    const positions = flow.map((f) => html.indexOf(`>${f.step}<`));
    expect(positions.every((p, i) => p > -1 && (i === 0 || p > positions[i - 1]!))).toBe(true);
    expect(lessons).toHaveLength(3);
    for (const l of lessons) expect(html).toContain(l.title);
  });

  test('links back to the CV', () => {
    expect(html).toMatch(/<a href="\/"[^>]*>[^]*?Back to CV/);
  });

  test('hides the tab bar in print', () => {
    // A utility-layer print:hidden is needed: the fieldset's own `flex` utility beats any components-layer rule.
    expect(html).toMatch(/<fieldset class="[^"]*\bprint:hidden\b[^"]*">/);
  });

  test('tab labels leave colour and border to the selected-tab CSS', () => {
    // Utilities outrank the components layer, so a colour or border utility on a label would hide the selected state.
    const labels = [...html.matchAll(/<label for="tab-[^"]+" class="([^"]*)"/g)].map((m) => m[1]!);
    expect(labels).toHaveLength(3);
    for (const cls of labels)
      expect(cls).not.toMatch(/(^|\s)(hover:)?(text|border)-(muted|strong|transparent|accent)\b/);
  });

  test('has no inline styles', () => {
    expect(html).not.toMatch(/\sstyle="/);
  });

  test('shows every panel in browsers without :has()', async () => {
    const css = await readFile(join(import.meta.dir, 'main.css'), 'utf8');
    // Panels may only be hidden inside the @supports guard, or old browsers show nothing.
    const guarded = css.match(/@supports selector\(:has\(\*\)\)\s*{[^]*?\.homelab-panel\s*{\s*display:\s*none/);
    expect(guarded).not.toBeNull();
    const unguarded = css.replace(/@supports selector\(:has\(\*\)\)\s*{[^]*?\n  }\n/, '');
    expect(unguarded).not.toMatch(/\.homelab-panel\s*{\s*display:\s*none/);
  });

  test('marks the selected tab without relying on colour', async () => {
    const css = await readFile(join(import.meta.dir, 'main.css'), 'utf8');
    expect(css).toMatch(/@media \(forced-colors: active\)\s*{[^]*?input:checked \+ label\s*{[^}]*Highlight/);
  });

  test('print and visibility rules exist', async () => {
    const css = await readFile(join(import.meta.dir, 'main.css'), 'utf8');
    expect(css).toContain('.homelab-panel');
    for (const t of tabs) expect(css).toContain(`:has(#tab-${t.id}:checked) #panel-${t.id}`);
    const print = css.match(/@media print\s*{[^]*?\.homelab-panel\s*{\s*display:\s*block[^]*?}/);
    expect(print).not.toBeNull();
  });
});
