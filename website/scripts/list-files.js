const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const filesDir = path.resolve(__dirname, '..', '..', 'files');

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

(async () => {
  if (!fsSync.existsSync(filesDir)) {
    console.log(JSON.stringify([]));
    return;
  }
  const list = await listFiles(filesDir);
  console.log(JSON.stringify(list, null, 2));
})();
