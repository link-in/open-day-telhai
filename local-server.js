import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handler } from './lambda/submit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

http.createServer(async (req, res) => {

  if (req.url === '/api/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      const result = await handler({ httpMethod: 'POST', body });
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    });
    return;
  }

  if (req.url === '/api/submit' && req.method === 'OPTIONS') {
    const result = await handler({ httpMethod: 'OPTIONS', body: '' });
    res.writeHead(result.statusCode, result.headers);
    res.end();
    return;
  }

  const cleanUrl  = req.url.split('?')[0];
  const filePath  = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
  const ext       = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });

}).listen(8000, () => {
  console.log('Local dev server running at http://localhost:8000');
  console.log('Form submit endpoint: POST http://localhost:8000/api/submit');
});
