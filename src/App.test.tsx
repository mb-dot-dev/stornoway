import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import App, { education, experiences, highlights, skills } from './App';

const html = renderToStaticMarkup(<App />);
const count = (needle: string) => html.split(needle).length - 1;

describe('App', () => {
  test('contains name, current location and email', () => {
    expect(html).toContain('Bence Molnár');
    expect(html).toContain('Budapest, Hungary');
    expect(html).toContain('hiring@molnarbence.dev');
    expect(html).toContain('href="mailto:hiring@molnarbence.dev"');
  });

  test('contains both GitHub links', () => {
    for (const url of ['https://github.com/molnarbence', 'https://github.com/mb-dot-dev']) {
      expect(html).toMatch(new RegExp(`<a href="${url}" target="_blank" rel="noopener"`));
    }
  });

  test('links to the homelab page', () => {
    expect(html).toMatch(
      /<li class="[^"]*print:hidden[^"]*"><a href="\/homelab\/" class="[^"]*">[^]*?Homelab<\/span><\/a><\/li>/,
    );
    expect(html).not.toContain('href="/homelab/" target="_blank"');
  });

  test('links to the Lambda apps page', () => {
    expect(html).toMatch(
      /<li class="[^"]*print:hidden[^"]*"><a href="\/lambdas\/" class="[^"]*">[^]*?Lambda apps<\/span><\/a><\/li>/,
    );
    expect(html).not.toContain('href="/lambdas/" target="_blank"');
  });

  test('contains every section heading', () => {
    for (const h of ['Highlights', 'Experience', 'Skills', 'Education']) {
      expect(html).toContain(`>${h}</h2>`);
    }
  });

  test('renders one entry per experience, skill and education item', () => {
    const projects = experiences.reduce((n, e) => n + e.projects.length, 0);
    const techs = experiences.reduce(
      (n, e) => n + e.projects.reduce((m, p) => m + (('tech' in p && p.tech?.length) || 0), 0),
      0,
    );
    expect(count('<h3 class="text-[22px] font-semibold text-strong">')).toBe(experiences.length);
    expect(count('<h4 class="font-semibold text-strong">')).toBe(projects);
    expect(count('<p class="font-semibold text-strong">')).toBe(education.length);
    expect(count('px-2.5 py-0.5 text-xs font-medium rounded-full')).toBe(techs);
    expect(count('px-3 py-0.5 rounded-full')).toBe(skills.length);
  });

  test('renders every highlight with a bold lead-in', () => {
    expect(count('<strong class="block text-[17px] leading-snug font-semibold')).toBe(highlights.length);
    for (const h of highlights) {
      expect(html).toContain(`${h.lead}</strong>`);
    }
  });

  test('header, main and footer are sibling landmarks', () => {
    expect(html).toMatch(/<\/header><main[^>]*>[^]*<\/main><footer/);
  });

  test('link accessible names include their visible text', () => {
    expect(html).not.toContain('aria-label="GitHub');
    expect(html).toContain('<span class="sr-only">GitHub profile </span><span>/molnarbence</span>');
  });

  test('marks up periods with <time>', () => {
    expect(html).toContain('<time dateTime="2019">2019</time> — <time dateTime="2026">2026</time>');
  });

  test('footer credits React', () => {
    expect(html).toContain('href="https://react.dev"');
    expect(html).not.toContain('Nuxt');
  });

  test('preserves non-ascii text', () => {
    expect(html).toContain('Molnár');
    expect(html).toContain('—');
  });
});
