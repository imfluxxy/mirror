async function loadFiles() {
  const status = document.getElementById('status');
  const listEl = document.getElementById('file-list');
  try {
    const res = await fetch('/api/files');
    if (!res.ok) throw new Error('Failed to fetch');
    const files = await res.json();
    status.textContent = `Found ${files.length} items`;
    if (!files.length) return;

    // Sort by path
    files.sort((a,b) => a.path.localeCompare(b.path));

    for (const f of files) {
      const li = document.createElement('li');
      const left = document.createElement('div');
      const name = document.createElement('a');
      name.textContent = f.path;
      name.href = '/files/' + encodeURIComponent(f.path);
      left.appendChild(name);

      const meta = document.createElement('small');
      meta.textContent = f.isDirectory ? 'directory' : `${f.size} bytes`;

      li.appendChild(left);
      li.appendChild(meta);
      listEl.appendChild(li);
    }
  } catch (err) {
    status.textContent = 'Error loading files';
  }
}

window.addEventListener('DOMContentLoaded', loadFiles);
