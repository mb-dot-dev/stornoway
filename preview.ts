import { join } from 'node:path'

const root = join(import.meta.dir, 'dist')

const server = Bun.serve({
  async fetch(req) {
    const { pathname } = new URL(req.url)
    const file = Bun.file(join(root, pathname === '/' ? 'index.html' : pathname))
    return (await file.exists()) ? new Response(file) : new Response('Not found', { status: 404 })
  },
})

console.log(`Serving dist/ at ${server.url}`)
