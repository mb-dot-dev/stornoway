import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import App, { education, experiences, skills } from './App'

const html = renderToStaticMarkup(<App />)
const count = (needle: string) => html.split(needle).length - 1

describe('App', () => {
  test('contains name, location and email', () => {
    expect(html).toContain('Bence Molnár')
    expect(html).toContain('London, UK')
    expect(html).toContain('hiring@molnarbence.dev')
    expect(html).toContain('href="mailto:hiring@molnarbence.dev"')
  })

  test('contains both GitHub links', () => {
    for (const url of ['https://github.com/molnarbence', 'https://github.com/mb-dot-dev']) {
      expect(html).toMatch(new RegExp(`<a href="${url}" target="_blank" rel="noopener"`))
    }
  })

  test('contains every section heading', () => {
    for (const h of ['Experience', 'Skills', 'Education']) {
      expect(html).toContain(`>${h}</h2>`)
    }
  })

  test('renders one entry per experience, skill and education item', () => {
    const projects = experiences.reduce((n, e) => n + e.projects.length, 0)
    const techs = experiences.reduce(
      (n, e) => n + e.projects.reduce((m, p) => m + (('tech' in p && p.tech?.length) || 0), 0),
      0,
    )
    expect(count('<span class="text-gray-700 dark:text-gray-200">')).toBe(experiences.length + education.length)
    expect(count('<div class="font-medium">')).toBe(experiences.length + projects + education.length)
    expect(count('px-2 py-1 text-xs rounded-full')).toBe(techs)
    expect(count('px-3 py-1 rounded-full')).toBe(skills.length)
    expect(count('sm:items-baseline sm:justify-between gap-1">')).toBe(experiences.length + education.length)
  })

  test('footer credits React', () => {
    expect(html).toContain('href="https://react.dev"')
    expect(html).not.toContain('Nuxt')
  })

  test('preserves non-ascii text', () => {
    expect(html).toContain('Molnár')
    expect(html).toContain('—')
  })
})
