const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const mime = require('mime');

const app = express();
const PORT = process.env.PORT || 3000;

// Derive files directory relative to this file: ../../files
const filesDir = path.resolve(__dirname, '..', '..', 'files');

// Serve the frontend static assets
app.use(express.static(path.resolve(__dirname, '..', 'public')));

// Util: recursively list files
async function listFiles(rootDir) {
  const entries = [];

  async function walk(dir) {
    let items;
    try {
      items = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      return;
    }

    for (const item of items) {
      const full = path.join(dir, item.name);
      const stat = await fs.stat(full);
      const relative = path.relative(rootDir, full).split(path.sep).join('/');

      entries.push({
        name: item.name,
        path: relative,
        isDirectory: item.isDirectory(),
        size: stat.size,
        mtime: stat.mtimeMs
      });

      if (item.isDirectory()) {
        await walk(full);
      }
    }
  }

  await walk(rootDir);
  return entries;
}

// API: list files
app.get('/api/files', async (req, res) => {
  try {
    if (!fsSync.existsSync(filesDir)) {
      return res.json([]);
    }
    const list = await listFiles(filesDir);
    res.json(list);
  } catch (err) {
    console.error('Error listing files', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Serve files safely, preventing path traversal
app.get('/files/*', (req, res) => {
  const requested = req.params[0] || '';
  const decoded = decodeURIComponent(requested);
  const fullPath = path.resolve(filesDir, decoded);

  if (!fullPath.startsWith(filesDir)) {
    return res.status(400).send('Invalid file path');
  }

  fsSync.stat(fullPath, (err, stats) => {
    if (err) return res.status(404).send('Not found');
    if (stats.isDirectory()) return res.status(400).send('Is a directory');

    const type = mime.getType(fullPath) || 'application/octet-stream';
    res.setHeader('Content-Type', type);

    // For binary/non-inline types, suggest download instead of inline display
    if (!type.startsWith('text/') && !type.startsWith('image/') && !type.startsWith('video/') && type !== 'application/pdf') {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
    }

    res.sendFile(fullPath);
  });
});

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Mirror website running on http://localhost:${PORT}`));
