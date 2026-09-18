const http = require('http'), fs = require('fs'), path = require('path');
/* Local preview of the built site: serves dist/, plus tools/ for the layout audit.
   Usage: node tools/serve.js   (PORT to change the port, default 4173) */
const DIST = path.join(__dirname, '..', 'dist');
const TOOLS = __dirname;
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.svg':'image/svg+xml',
  '.webp':'image/webp', '.json':'application/json', '.pdf':'application/pdf', '.mp4':'video/mp4' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const base = p.startsWith('/tools/') ? TOOLS : DIST;
  const f = path.join(base, p.startsWith('/tools/') ? p.slice('/tools'.length) : p);
  if (!f.startsWith(base) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404, {'content-type':'text/plain'}); return res.end('404 ' + p);
  }
  const type = TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
  /* dev server: never let a rebuilt asset be served from the browser cache */
  const head = { 'content-type': type, 'cache-control': 'no-store, must-revalidate', 'accept-ranges': 'bytes' };
  const size = fs.statSync(f).size;
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range) {   /* video seeking, which Safari insists on */
    const start = range[1] ? +range[1] : size - +range[2];
    const end = range[1] && range[2] ? Math.min(+range[2], size - 1) : size - 1;
    res.writeHead(206, { ...head, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1 });
    return fs.createReadStream(f, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...head, 'content-length': size });
  fs.createReadStream(f).pipe(res);
});
const PORT = process.env.PORT || 4173;
server.on('error', (e) => {
  if (e.code !== 'EADDRINUSE') throw e;
  console.error(`Port ${PORT} is already in use (probably another preview still running).\nTry: PORT=4180 node tools/serve.js`);
  process.exit(1);
});
server.listen(PORT, () => console.log('serving dist/ on http://localhost:' + PORT));
