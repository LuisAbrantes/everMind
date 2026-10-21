// Tiny static file server for web/ on a random port (no dependencies).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.EVERMIND_WEB_ROOT ? path.resolve(process.env.EVERMIND_WEB_ROOT) : path.resolve(__dirname, '..', '..'); // web/ (override with EVERMIND_WEB_ROOT)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function start() {
  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(ROOT, '.' + pathname);
    if (!file.startsWith(ROOT) || file.startsWith(path.join(ROOT, 'tests'))) {
      res.writeHead(403).end('forbidden');
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
        return;
      }
      res.writeHead(200, {
        'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((r) => server.close(r)),
        // derruba de verdade (inclusive conexões keep-alive): simula ficar sem rede
        kill: () => new Promise((r) => { server.closeAllConnections(); server.close(r); }),
      });
    });
  });
}

module.exports = { start };
