// Dependency-free preview server. Only serves the public page assets.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'application/javascript'] };
http.createServer((req, res) => {
  const asset = files[new URL(req.url, 'http://localhost').pathname];
  if (!asset) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(__dirname, asset[0]), (error, content) => {
    if (error) { res.writeHead(500); res.end('Unable to read file'); return; }
    res.writeHead(200, { 'Content-Type': `${asset[1]}; charset=utf-8` });
    res.end(content);
  });
}).listen(4173, '127.0.0.1', () => console.log('URBAN SCAN preview: http://127.0.0.1:4173'));
