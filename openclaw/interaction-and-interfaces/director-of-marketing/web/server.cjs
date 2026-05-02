/**
 * Custom Next.js server (same pattern as pinata-mixtape/server.js).
 * Ensures production CSS and /_next static assets are served correctly on agent hosts.
 */
const { createServer } = require('node:http')
const next = require('next')

const port = Number(process.env.PORT || 3000)
const host = process.env.HOST || '0.0.0.0'
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, hostname: host, port, dir: __dirname })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const url = req.url || ''
    if (url === '/health' || url === '/newsletter/health') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: true, app: 'remarkability-engine' }))
      return
    }
    handle(req, res)
  }).listen(port, host, () => {
    console.log(`remarkability-engine listening on ${host}:${port} (dev=${dev})`)
  })
})
