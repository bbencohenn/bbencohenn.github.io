/* Admin UI scaffold — requires secure backend before enabling auth. */
(function(){
  const list = document.getElementById('admin-list');
  const authBox = document.getElementById('admin-auth');
  const uiBox = document.getElementById('admin-ui');

  const renderList = async () => {
    try {
      // Local preview uses the static JSON. In production, replace with /api/blog/list
      const r = await fetch('data/blog.json', { credentials: 'same-origin' });
      const json = await r.json();
      const posts = (json.posts||[]);
      list.innerHTML = posts.map(p => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--border);border-radius:12px;padding:10px;">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <strong>${p.title}</strong>
            <small class="muted">${p.category || ''} • ${p.date || ''}</small>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn" disabled><i class="fa-solid fa-pen"></i> Edit</button>
            <button class="btn" disabled><i class="fa-solid fa-trash"></i> Delete</button>
          </div>
        </div>`).join('');
    } catch(e) {
      list.innerHTML = '<p class="muted">Failed to load posts.</p>';
    }
  };

  // Until backend is configured, keep UI read-only; allow import/export for local edits
  uiBox.style.display = 'block';
  renderList();

  document.getElementById('btn-export')?.addEventListener('click', async () => {
    try {
      const r = await fetch('data/blog.json');
      const blob = await r.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'blog-export.json';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch(e) {}
  });

  document.getElementById('btn-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        // Preview only: render imported data, no saving
        list.innerHTML = (json.posts||[]).map(p => `<div style="border:1px solid var(--border);border-radius:12px;padding:10px;"><strong>${p.title}</strong><br><small class=\"muted\">${p.category||''} • ${p.date||''}</small></div>`).join('');
      } catch(e) { alert('Invalid JSON'); }
    };
    input.click();
  });

  // SECURITY NOTE: To enable login, deploy server endpoints per ADMIN.md
})();
