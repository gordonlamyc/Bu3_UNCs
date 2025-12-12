const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/auth/smart-id', (_req, res) => {
  res.json({
    status: 'ok',
    step: 'smart-id',
    message: 'Smart ID handshake simulated on the server.'
  });
});

app.post('/api/auth/face', (_req, res) => {
  res.json({ status: 'ok', step: 'face', message: 'Face capture acknowledged.' });
});

app.post('/api/auth/fingerprint', (_req, res) => {
  res.json({ status: 'ok', step: 'fingerprint', message: 'Fingerprint recorded.' });
});

app.post('/api/vote', (req, res) => {
  const { candidate } = req.body || {};
  res.json({
    status: 'received',
    candidate: candidate ?? 'unspecified',
    timestamp: new Date().toISOString()
  });
});

const distPath = path.join(__dirname, 'frontend', 'dist', 'frontend', 'browser');

function ensureFrontendBuild() {
  if (fs.existsSync(distPath)) {
    return true;
  }

  console.log('No Angular build found. Running "npm run build" in ./frontend ...');
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    console.error('Angular build failed. API will still run, but UI is unavailable.');
    return false;
  }

  return fs.existsSync(distPath);
}

const hasBuild = ensureFrontendBuild();

if (hasBuild) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res
      .status(503)
      .send(
        'Frontend build not found or failed. Run "cd frontend && npm run build" and retry.'
      );
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
