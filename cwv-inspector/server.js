import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let currentPort = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  const decodedUrl = decodeURIComponent(req.url);
  const parsedUrl = new URL(decodedUrl, `http://localhost:${currentPort}`);
  const pathname = parsedUrl.pathname;

  // Handle run-audit EventSource stream
  if (pathname === '/run-audit') {
    const project = parsedUrl.searchParams.get('project');
    const auditUrlInput = parsedUrl.searchParams.get('url');

    if (!project) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing project parameter');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const parentDir = path.dirname(__dirname);
    const absoluteProjectPath = path.resolve(parentDir, project);
    
    // Spawn the audit.js script
    const scriptPath = path.join(__dirname, 'audit.js');
    const args = [scriptPath, absoluteProjectPath];
    if (auditUrlInput && auditUrlInput.trim() !== '') {
      args.push('--url', auditUrlInput.trim());
    }

    const child = spawn('node', args, {
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    child.stdout.on('data', (data) => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    child.stderr.on('data', (data) => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    child.on('close', (code) => {
      // Find the latest generated HTML report in the project's reports folder
      const reportsDir = path.join(absoluteProjectPath, 'reports');
      let latestReport = '';
      if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir)
          .filter(f => f.endsWith('.html'))
          .sort((a, b) => b.localeCompare(a));
        if (files.length > 0) {
          latestReport = `/reports-view?project=${encodeURIComponent(project)}&file=${encodeURIComponent(files[0])}`;
        }
      }
      res.write(`data: [COMPLETE]${latestReport}\n\n`);
      res.end();
    });

    return;
  }

  // Handle reports-view mapping
  if (pathname === '/reports-view') {
    const project = parsedUrl.searchParams.get('project');
    const filename = parsedUrl.searchParams.get('file');

    if (!project || !filename) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing project or file parameter');
      return;
    }

    const parentDir = path.dirname(__dirname);
    const absoluteProjectPath = path.resolve(parentDir, project);
    const filePath = path.join(absoluteProjectPath, 'reports', filename);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
    return;
  }

  // API Endpoint: /api/select-folder
  if (pathname === '/api/select-folder') {
    // Execute AppleScript to open directory chooser on macOS
    const script = `osascript -e 'POSIX path of (choose folder with prompt "Select a project folder:")'`;
    exec(script, (err, stdout, stderr) => {
      if (err) {
        // If user cancels or if we are not on macOS, return cancelled
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ cancelled: true }));
        return;
      }
      const selectedPath = stdout.trim();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ path: selectedPath }));
    });
    return;
  }

  // API Endpoint: /api/projects
  if (pathname === '/api/projects') {
    const parentDir = path.dirname(__dirname);
    try {
      const directories = fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ projects: directories }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
    return;
  }

  // API Endpoint: /api/reports
  if (pathname === '/api/reports') {
    const parentDir = path.dirname(__dirname);
    const reportsList = [];
    try {
      const directories = fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

      directories.forEach(proj => {
        const reportsDir = path.join(parentDir, proj, 'reports');
        if (fs.existsSync(reportsDir) && fs.statSync(reportsDir).isDirectory()) {
          const files = fs.readdirSync(reportsDir)
            .filter(f => (f.endsWith('.html') || f.endsWith('.pdf')) && !f.startsWith('e2e'))
            .sort((a, b) => b.localeCompare(a));

          if (files.length > 0) {
            const runsMap = {};
            files.forEach(file => {
              const match = file.match(/report-(\d+)\.(html|pdf)/);
              if (match) {
                const timestamp = match[1];
                const type = match[2];
                if (!runsMap[timestamp]) {
                  runsMap[timestamp] = {
                    timestamp: parseInt(timestamp),
                    html: null,
                    pdf: null
                  };
                }
                runsMap[timestamp][type] = `/reports-view?project=${encodeURIComponent(proj)}&file=${encodeURIComponent(file)}`;
              }
            });
            const runs = Object.values(runsMap).sort((a, b) => b.timestamp - a.timestamp);
            if (runs.length > 0) {
              reportsList.push({
                project: proj,
                runs: runs
              });
            }
          }
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reports: reportsList }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
    return;
  }

  // Serve static dashboard assets from cwv-inspector/dashboard/
  let targetPath = pathname === '/' || pathname === '/index.html' ? '/index.html' : pathname;
  const localFilePath = path.join(__dirname, 'dashboard', targetPath);

  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const ext = path.extname(localFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(localFilePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

function startServer() {
  server.listen(currentPort);
}

server.on('listening', () => {
  console.log(`\n📶 Preview Server started successfully!`);
  console.log(`🌎 Open your browser and navigate to: http://localhost:${currentPort}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${currentPort} is already in use. Trying port ${currentPort + 1}...`);
    currentPort++;
    startServer();
  } else {
    console.error(`⚠️ Server error: ${err.message}`);
  }
});

startServer();
