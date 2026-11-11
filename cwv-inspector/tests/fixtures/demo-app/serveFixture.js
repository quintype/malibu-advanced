import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.map': 'application/json'
};

/**
 * Creates and starts a lightweight static server for the demo fixture app.
 * @param {number} [port=8765]
 * @param {string} [baseDir]
 * @returns {Promise<{ server: http.Server, port: number, url: string, close: () => Promise<void> }>}
 */
export function startFixtureServer(port = 8765, baseDir = __dirname) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';

      const filePath = path.join(baseDir, reqPath);

      // Security check: stay inside base directory
      if (!filePath.startsWith(baseDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }

      const sendFile = () => {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end(`Not Found: ${reqPath}`);
          }

          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          });
          res.end(data);
        });
      };

      // Delay hero.jpg by 800ms to simulate slow image loading causing layout shift / LCP delay
      if (reqPath === '/hero.jpg') {
        setTimeout(sendFile, 800);
      } else {
        sendFile();
      }
    });

    server.listen(port, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      const url = `http://localhost:${actualPort}`;
      resolve({
        server,
        port: actualPort,
        url,
        close: () => new Promise(resClose => server.close(resClose))
      });
    });

    server.on('error', reject);
  });
}

// Allow direct CLI invocation: node tests/fixtures/demo-app/serveFixture.js
if (process.argv[1] === __filename) {
  startFixtureServer().then(({ url }) => {
    console.log(`Demo fixture app running at ${url}`);
  }).catch(err => {
    console.error('Failed to start fixture server:', err);
    process.exit(1);
  });
}

