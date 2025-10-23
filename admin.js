



window.__admin_ready = true;

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let app, auth, db, storage;
const setStatus = (msg, ok = false) => {
  const el = document.getElementById('fb-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = ok ? '#9ae6b4' : 'var(--muted)';
};


const firebaseConfig = window.firebaseConfig || {};
const ADMIN_UIDS = window.ADMIN_UIDS || [];

try {
  if (!firebaseConfig.apiKey) throw new Error('Missing firebaseConfig');
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  try { storage = firebase.storage(); } catch (_) {  }
  setStatus('Firebase loaded. Ready to sign in.', true);
} catch (e) {
  console.warn('Firebase not configured. Admin is disabled until configured.', e);
  setStatus('Firebase not configured - fill js/firebase-config.js and reload.');
}

const state = { user: null, posts: [], tags: [], projects: [] };

const renderList = () => {
  const list = $('#post-list');
  if (!list) return;
  list.innerHTML = state.posts
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .map(p => `
      <div class="post-item" data-id="${p.id}">
        <div>
          <h4>${p.title || '(untitled)'}</h4>
          <div class="muted-small">${p.category || ''} â€¢ ${p.date || ''}</div>
        </div>
        <span class="chip mono">#${(p.tags||[]).length}</span>
      </div>
    `).join('');
};

const clearForm = () => {
  $('#post-id').value = '';
  $('#post-title').value = '';
  $('#post-date').value = '';
  $('#post-category').value = '';
  $('#post-categoryKey').value = '';
  $('#post-tags-input').value = '';
  $('#post-tags-selected').innerHTML = '';
  $('#post-summary').value = '';
  $('#post-bodyHtml').value = '';
  $('#post-links').value = '';
  $('#img-url').value = '';
  $('#img-list').innerHTML = '';
  $('#post-icon').value = '';
};

const fillForm = (p) => {
  $('#post-id').value = p.id || '';
  $('#post-title').value = p.title || '';
  $('#post-date').value = (p.date || '').slice(0,10);
  $('#post-category').value = p.category || '';
  $('#post-categoryKey').value = p.categoryKey || '';
  renderSelectedTags(p.tags || []);
  $('#post-summary').value = p.summary || '';
  $('#post-bodyHtml').value = p.bodyHtml || '';
  $('#post-links').value = (p.links || []).map(l => `${l.label||''}|${l.href||''}`).join('\n');
  const list = $('#img-list');
  list.innerHTML = (p.images||[]).map((src, i) => `
    <div class="row">
      <img src="${src}" alt=""/>
      <input type="text" value="${src}">
      <button class="btn" data-remove-img="${i}" type="button"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
};

const readForm = () => {
  const id = $('#post-id').value.trim() || undefined;
  const title = $('#post-title').value.trim();
  const date = $('#post-date').value.trim();
  const category = $('#post-category').value.trim();
  const categoryKey = ($('#post-categoryKey').value.trim() || category.toLowerCase().replace(/\s+/g,'')).replace(/[^a-z0-9_-]/g,'');
  const tags = Array.from($$('#post-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag'));
  const summary = $('#post-summary').value;
  const bodyHtml = $('#post-bodyHtml').value;
  const links = $('#post-links').value.split('\n').map(row => {
    const [label, href] = row.split('|').map(s=> (s||'').trim());
    return (label && href) ? { label, href } : null;
  }).filter(Boolean);
  const images = $$('#img-list input[type=text]').map(i => i.value.trim()).filter(Boolean);
  const icon = $('#post-icon').value.trim();
  return { id, title, date, category, categoryKey, tags, summary, bodyHtml, links, images, icon };
};

const ensureAuth = (user) => {
  const allow = !ADMIN_UIDS.length || (user && ADMIN_UIDS.includes(user.uid));
  if (!allow) alert('Your account is not authorized for admin writes.');
  return allow;
};

const loadPosts = async () => {
  if (!db) return;
  const snap = await db.collection('posts').get();
  state.posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderList();
};

const savePost = async (data) => {
  if (!db) return;
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  const { id, ...rest } = data; // drop id from payload to avoid undefined field
  if (id) {
    await db.collection('posts').doc(id).update({ ...rest, updatedAt: ts });
    return id;
  } else {
    const d = await db.collection('posts').add({ ...rest, createdAt: ts });
    return d.id;
  }
};

const removePost = async (id) => {
  if (!db) return;
  await db.collection('posts').doc(id).delete();
};

const addImageFromFile = async (file) => {
  if (!storage || !state.user) {
    alert('Storage not configured or not signed in.');
    return null;
  }
  const name = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9_.-]/g,'_');
  const ref = storage.ref().child(`blog-images/${state.user.uid}/${name}`);
  const snap = await ref.put(file);
  const url = await ref.getDownloadURL();
  return url;
};


$('#login')?.addEventListener('click', async () => {
  if (!auth) { alert('Firebase not configured.'); return; }
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (err) {
    console.error('Sign-in failed:', err);
    if (err?.code === 'auth/popup-blocked') {
      setStatus('Popup blocked by browser. Trying redirect sign-in...');
      try { await auth.signInWithRedirect(provider); } catch (e2) {
        alert('Sign-in redirect failed: ' + (e2?.code || e2?.message || e2));
      }
      return;
    }
    if (err?.code === 'auth/unauthorized-domain') {
      alert('Unauthorized domain. In Firebase > Authentication > Settings > Authorized domains, add: your domain and localhost.');
      setStatus('Unauthorized domain. Add this origin to Firebase Auth domains.');
      return;
    }
    if (err?.code === 'auth/popup-closed-by-user') {
      setStatus('Popup closed before completing sign-in.');
      return;
    }
    alert('Sign-in error: ' + (err?.code || err?.message || err));
    setStatus('Sign-in error. Check console for details.');
  }
});

$('#logout')?.addEventListener('click', async () => {
  if (!auth) return;
  await auth.signOut();
});

if (auth) {

  auth.getRedirectResult().catch((e) => {
    if (e) console.warn('Redirect sign-in result error:', e);
  });

  auth.onAuthStateChanged(async (user) => {
    state.user = user || null;
    const authed = !!user;
    $('#login').style.display = authed ? 'none' : '';
    $('#logout').style.display = authed ? '' : 'none';
    $('#auth-guard').style.display = authed ? '' : 'none';
    $('#admin-ui').style.display = authed ? '' : 'none';
    $('#setup-hint').style.display = app ? 'none' : '';
    $('#user-email').textContent = user?.email || 'n/a';
    $('#user-uid').textContent = user?.uid || '';

    if (authed) setStatus('Signed in as ' + (user.email || user.uid), true);
    else setStatus('Firebase loaded. Ready to sign in.', true);

    if (authed && ensureAuth(user)) {

      document.getElementById('admin-tags').style.display = '';
      document.getElementById('admin-projects').style.display = '';
      try { await loadPosts(); } catch (e) { console.warn('Load posts failed', e); }
      try { await loadTags();  } catch (e) { console.warn('Load tags failed', e); }
      try { await loadProjects(); } catch (e) { console.warn('Load projects failed', e); }
    } else {
      state.posts = [];
      renderList();
      $('#admin-tags').style.display = 'none';
      $('#admin-projects').style.display = 'none';
    }
  });
}


document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-remove-img]');
  if (!btn) return;
  const row = btn.closest('.row');
  row?.remove();
});


document.addEventListener('click', (e) => {
  const item = e.target.closest('.post-item');
  if (!item) return;
  const id = item.getAttribute('data-id');
  const p = state.posts.find(x => x.id === id);
  if (p) fillForm(p);
});

$('#new-post')?.addEventListener('click', () => {
  clearForm();
  const today = new Date().toISOString().slice(0,10);
  $('#post-date').value = today;
});


$('#add-img-url')?.addEventListener('click', () => {
  const url = $('#img-url').value.trim();
  if (!url) return;
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `<img src="${url}" alt=""/><input type="text" value="${url}"><button class="btn" type="button"><i class="fa-solid fa-xmark"></i></button>`;
  row.querySelector('button').addEventListener('click', () => row.remove());
  $('#img-list').appendChild(row);
  $('#img-url').value = '';
});

$('#img-file')?.addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const url = await addImageFromFile(f);
    if (url) {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<img src="${url}" alt=""/><input type="text" value="${url}"><button class="btn" type="button"><i class="fa-solid fa-xmark"></i></button>`;
      row.querySelector('button').addEventListener('click', () => row.remove());
      $('#img-list').appendChild(row);
    }
  } catch (err) {
    alert('Upload failed');
    console.error(err);
  } finally {
    e.target.value = '';
  }
});


$('#post-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!state.user || !ensureAuth(state.user)) return;
  const data = readForm();
  if (!data.title) return alert('Title is required');
  try {
    const id = await savePost(data);
    if (!data.id) $('#post-id').value = id;
    await loadPosts();
    alert('Saved');
  } catch (err) {
    console.error(err); alert('Save failed');
  }
});

$('#delete-post')?.addEventListener('click', async () => {
  const id = $('#post-id').value.trim();
  if (!id) return;
  if (!confirm('Delete this post?')) return;
  try {
    await removePost(id);
    clearForm();
    await loadPosts();
  } catch (err) {
    console.error(err); alert('Delete failed');
  }
});


$('#export-json')?.addEventListener('click', async () => {
  const posts = state.posts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    categoryKey: p.categoryKey,
    icon: p.icon || 'fa-note-sticky',
    date: p.date,
    summary: p.summary,
    bodyHtml: p.bodyHtml,
    images: p.images || [],
    tags: p.tags || [],
    links: p.links || []
  }));
  const blob = new Blob([JSON.stringify({ posts }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'blog.json'; a.click();
  URL.revokeObjectURL(url);
});


const slug = (s) => (s||'').toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9_-]/g,'');

const renderSelectedTags = (tags) => {
  const wrap = $('#post-tags-selected');
  if (!wrap) return;
  wrap.innerHTML = (tags||[]).map(t => {
    const meta = state.tags.find(x => x.id === t);
    const label = meta?.name || t;
    const icon = meta?.icon ? `<i class="fa-solid ${meta.icon}"></i> ` : '';
    return `<span class="chip mono" data-tag="${t}">${icon}#${label} <a href="#" data-remove="${t}"><i class="fa-solid fa-xmark"></i></a></span>`;
  }).join('');
};

const renderTagSuggestions = () => {
  const box = $('#post-tags-suggest');
  if (!box) return;
  const selected = new Set(Array.from($$('#post-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag')));
  const suggest = state.tags.filter(t => !selected.has(t.id));
  box.innerHTML = suggest.map(t => `<a href="#" class="chip mono" data-addtag="${t.id}">${t.icon ? `<i class='fa-solid ${t.icon}'></i> `:''}#${t.name}</a>`).join('');
};

document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-addtag]');
  if (add) {
    e.preventDefault();
    const id = add.getAttribute('data-addtag');
    const tags = Array.from($$('#post-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag'));
    if (!tags.includes(id)) tags.push(id);
    renderSelectedTags(tags);
    renderTagSuggestions();
  }
  const rm = e.target.closest('#post-tags-selected [data-remove]');
  if (rm) {
    e.preventDefault();
    const id = rm.getAttribute('data-remove');
    const tags = Array.from($$('#post-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag')).filter(x => x !== id);
    renderSelectedTags(tags);
    renderTagSuggestions();
  }
});

$('#post-tags-input')?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const val = e.target.value.trim();
  if (!val) return;
  const id = slug(val);
  const tags = Array.from($$('#post-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag'));
  if (!tags.includes(id)) tags.push(id);
  renderSelectedTags(tags);
  renderTagSuggestions();
  e.target.value = '';
});

const renderTagList = () => {
  const list = $('#tag-list');
  if (!list) return;
  if (!state.tags.length) { list.innerHTML = '<div class="muted">No tags yet.</div>'; return; }
  list.innerHTML = state.tags
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(t => `<div class="post-item" data-tag-id="${t.id}"><div><strong>${t.name}</strong><div class="muted-small">${t.id}</div></div><span class="chip mono">${t.icon ? `<i class='fa-solid ${t.icon}'></i>` : '-'}</span></div>`)
    .join('');
};

const loadTags = async () => {
  if (!db) return;
  const snap = await db.collection('tags').get();
  state.tags = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderTagList();
  renderTagSuggestions();
  renderProjTagSuggestions();
};

const saveTag = async (data) => {
  const desiredId = slug(data.name);
  const currentId = (data.id || '').trim();

  if (!currentId || currentId === desiredId) {
    await db.collection('tags').doc(desiredId).set({ name: data.name, icon: data.icon || '' }, { merge: true });
    return desiredId;
  }


  await db.collection('tags').doc(desiredId).set({ name: data.name, icon: data.icon || '' }, { merge: true });
  return desiredId;
};

const deleteTag = async (id) => {
  await db.collection('tags').doc(id).delete();
};

document.addEventListener('click', (e) => {
  const item = e.target.closest('[data-tag-id]');
  if (!item) return;
  const id = item.getAttribute('data-tag-id');
  const t = state.tags.find(x => x.id === id);
  if (!t) return;
  $('#tag-id').value = t.id;
  $('#tag-name').value = t.name || '';
  $('#tag-icon').value = t.icon || '';
});

$('#tag-new')?.addEventListener('click', () => {
  $('#tag-id').value = '';
  $('#tag-name').value = '';
  $('#tag-icon').value = '';
});

$('#tag-save')?.addEventListener('click', async () => {
  const name = $('#tag-name').value.trim();
  const icon = $('#tag-icon').value.trim();
  if (!name) return alert('Tag name is required');
  if (!state.user || !ensureAuth(state.user)) { alert('Not authorized to save tags.'); return; }
  try {
    const id = await saveTag({ id: $('#tag-id').value.trim() || undefined, name, icon });
    await loadTags();
    $('#tag-id').value = id;
  } catch (e) {
    console.error('Save tag failed', e);
    alert('Save tag failed: ' + (e?.code || e?.message || e));
  }
});

$('#tag-delete')?.addEventListener('click', async () => {
  const id = $('#tag-id').value.trim();
  if (!id) return;
  if (!state.user || !ensureAuth(state.user)) { alert('Not authorized to delete tags.'); return; }
  if (!confirm('Delete this tag?')) return;
  try {
    await deleteTag(id);
    $('#tag-id').value = '';
    $('#tag-name').value = '';
    $('#tag-icon').value = '';
    await loadTags();
  } catch (e) {
    console.error('Delete tag failed', e);
    alert('Delete tag failed: ' + (e?.code || e?.message || e));
  }
});


const renderProjList = () => {
  const list = document.getElementById('proj-list');
  if (!list) return;
  list.innerHTML = state.projects
    .map(p => `<div class="post-item" data-proj-id="${p.id}"><div><h4 style="margin:0">${p.title||'(untitled)'}</h4><div class="muted-small">${(p.tags||[]).join(', ')}</div></div><span class="chip mono">${p.icon||'fa-code'}</span></div>`)
    .join('');
};

const fillProjForm = (p) => {
  document.getElementById('proj-id').value = p.id || '';
  document.getElementById('proj-title').value = p.title || '';
  document.getElementById('proj-icon').value = p.icon || '';

  const wrap = document.getElementById('proj-tags-selected');
  wrap.innerHTML = (p.tags||[]).map(t => `<span class="chip mono" data-tag="${t}">#${t} <a href="#" data-remove="${t}"><i class="fa-solid fa-xmark"></i></a></span>`).join('');
  document.getElementById('proj-summary').value = p.summary || '';
  document.getElementById('proj-bodyHtml').value = p.bodyHtml || '';
  document.getElementById('proj-links').value = (p.links||[]).map(l => `${l.label||''}|${l.href||''}`).join('\n');
  const list = document.getElementById('proj-img-list');
  list.innerHTML = (p.images||[]).map(src => `<div class="row"><img src="${src}" alt=""/><input type="text" value="${src}"><button class="btn" type="button"><i class="fa-solid fa-xmark"></i></button></div>`).join('');
};

const readProjForm = () => {
  const id = document.getElementById('proj-id').value.trim() || undefined;
  const title = document.getElementById('proj-title').value.trim();
  const icon = document.getElementById('proj-icon').value.trim();
  const tags = Array.from(document.querySelectorAll('#proj-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag'));
  const summary = document.getElementById('proj-summary').value;
  const bodyHtml = document.getElementById('proj-bodyHtml').value;
  const links = document.getElementById('proj-links').value.split('\n').map(r => { const [label, href] = r.split('|').map(s=> (s||'').trim()); return (label && href) ? {label, href} : null; }).filter(Boolean);
  const images = Array.from(document.querySelectorAll('#proj-img-list input[type=text]')).map(i => i.value.trim()).filter(Boolean);
  return { id, title, icon, tags, summary, bodyHtml, images, links };
};

const loadProjects = async () => {
  if (!db) return;
  const snap = await db.collection('projects').get();
  state.projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderProjList();
};

const saveProject = async (data) => {
  if (!db) return;
  const { id, ...rest } = data;
  if (id) { await db.collection('projects').doc(id).set(rest, { merge: true }); return id; }
  const d = await db.collection('projects').add(rest); return d.id;
};

const removeProject = async (id) => {
  if (!db) return;
  await db.collection('projects').doc(id).delete();
};

document.addEventListener('click', (e) => {
  const item = e.target.closest('[data-proj-id]');
  if (!item) return;
  const id = item.getAttribute('data-proj-id');
  const p = state.projects.find(x => x.id === id);
  if (p) fillProjForm(p);
});

document.getElementById('proj-new')?.addEventListener('click', () => {
  fillProjForm({});
});

document.getElementById('proj-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!state.user || !ensureAuth(state.user)) { alert('Not authorized to save projects.'); return; }
  const data = readProjForm();
  if (!data.title) return alert('Title required');
  try {
    const id = await saveProject(data);
    if (!data.id) document.getElementById('proj-id').value = id;
    await loadProjects();
    alert('Project saved');
  } catch (e2) {
    console.error('Save project failed', e2);
    alert('Save project failed: ' + (e2?.code || e2?.message || e2));
  }
});

document.getElementById('proj-delete')?.addEventListener('click', async () => {
  const id = document.getElementById('proj-id').value.trim();
  if (!id) return;
  if (!state.user || !ensureAuth(state.user)) { alert('Not authorized to delete projects.'); return; }
  if (!confirm('Delete this project?')) return;
  try {
    await removeProject(id);
    fillProjForm({});
    await loadProjects();
  } catch (e3) {
    console.error('Delete project failed', e3);
    alert('Delete project failed: ' + (e3?.code || e3?.message || e3));
  }
});


document.getElementById('proj-add-img-url')?.addEventListener('click', () => {
  const url = document.getElementById('proj-img-url').value.trim();
  if (!url) return;
  const row = document.createElement('div'); row.className = 'row';
  row.innerHTML = `<img src="${url}" alt=""/><input type="text" value="${url}"><button class="btn" type="button"><i class="fa-solid fa-xmark"></i></button>`;
  row.querySelector('button').addEventListener('click', () => row.remove());
  document.getElementById('proj-img-list').appendChild(row);
  document.getElementById('proj-img-url').value = '';
});

document.getElementById('proj-img-file')?.addEventListener('change', async (e) => {
  const f = e.target.files?.[0]; if (!f) return;
  try {
    const url = await addImageFromFile(f);
    if (url) {
      const row = document.createElement('div'); row.className = 'row';
      row.innerHTML = `<img src="${url}" alt=""/><input type="text" value="${url}"><button class="btn" type="button"><i class="fa-solid fa-xmark"></i></button>`;
      row.querySelector('button').addEventListener('click', () => row.remove());
      document.getElementById('proj-img-list').appendChild(row);
    }
  } finally { e.target.value = ''; }
});


const renderProjSelectedTags = (tags) => {
  const wrap = document.getElementById('proj-tags-selected');
  if (!wrap) return; wrap.innerHTML = (tags||[]).map(t => `<span class="chip mono" data-tag="${t}">#${t} <a href="#" data-remove="${t}"><i class="fa-solid fa-xmark"></i></a></span>`).join('');
};
const renderProjTagSuggestions = () => {
  const box = document.getElementById('proj-tags-suggest'); if (!box) return;
  const selected = new Set(Array.from(document.querySelectorAll('#proj-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag')));
  const suggest = state.tags.filter(t => !selected.has(t.id));
  box.innerHTML = suggest.map(t => `<a href="#" class="chip mono" data-proj-addtag="${t.id}">${t.icon ? `<i class='fa-solid ${t.icon}'></i> `:''}#${t.name}</a>`).join('');
};

document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-proj-addtag]');
  if (add) { e.preventDefault(); const id = add.getAttribute('data-proj-addtag'); const tags = Array.from(document.querySelectorAll('#proj-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag')); if (!tags.includes(id)) tags.push(id); renderProjSelectedTags(tags); }
  const rm = e.target.closest('#proj-tags-selected [data-remove]');
  if (rm) { e.preventDefault(); const id = rm.getAttribute('data-remove'); const tags = Array.from(document.querySelectorAll('#proj-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag')).filter(x => x !== id); renderProjSelectedTags(tags); }
});

document.getElementById('proj-tags-input')?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return; e.preventDefault(); const val = e.target.value.trim(); if (!val) return;
  const id = slug(val); const tags = Array.from(document.querySelectorAll('#proj-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag')); if (!tags.includes(id)) tags.push(id); renderProjSelectedTags(tags); e.target.value='';
});

document.getElementById('proj-tags-promote')?.addEventListener('click', async () => {
  const selected = Array.from(document.querySelectorAll('#proj-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag'));
  const missing = selected.filter(id => !state.tags.some(t => t.id === id));
  for (const id of missing) { const name = id.replace(/[-_]+/g,' ').replace(/\b\w/g, c => c.toUpperCase()); await saveTag({ id, name, icon: '' }); }
  await loadTags(); renderProjTagSuggestions(); alert('Added selected tags to library.');
});


document.getElementById('export-projects')?.addEventListener('click', () => {
  const projects = state.projects.map(p => ({ id: p.id, title: p.title, icon: p.icon||'fa-code', tags: p.tags||[], summary: p.summary||'', bodyHtml: p.bodyHtml||'', images: p.images||[], links: p.links||[] }));
  const blob = new Blob([JSON.stringify({ projects }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'projects.json'; a.click(); URL.revokeObjectURL(url);
});


document.addEventListener('click', (e) => {
  if (e.target.closest('#pick-proj-icon')) openIconPicker(document.getElementById('proj-icon'));
});


$('#tags-promote')?.addEventListener('click', async () => {
  const selected = Array.from($$('#post-tags-selected [data-tag]')).map(el => el.getAttribute('data-tag'));
  const missing = selected.filter(id => !state.tags.some(t => t.id === id));
  if (!missing.length) { alert('All selected tags are already in the library.'); return; }
  for (const id of missing) {
    const name = id.replace(/[-_]+/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    await saveTag({ id, name, icon: '' });
  }
  await loadTags();
  renderTagSuggestions();
  alert('Added to tag library.');
});


const ICONS = [
  'fa-flag','fa-trophy','fa-code','fa-graduation-cap','fa-bug','fa-lock','fa-shield-halved','fa-terminal','fa-brain','fa-microchip','fa-database','fa-cloud','fa-robot','fa-key','fa-network-wired','fa-screwdriver-wrench','fa-flask','fa-book','fa-note-sticky','fa-pen-nib','fa-lightbulb','fa-gamepad','fa-palette','fa-gear','fa-rocket','fa-laptop-code','fa-magnifying-glass','fa-circle-nodes','fa-sitemap','fa-bolt','fa-circle-exclamation','fa-user-secret','fa-cloud-arrow-down','fa-cloud-arrow-up','fa-circle-check','fa-circle-info','fa-circle-question','fa-link','fa-file','fa-image','fa-video','fa-photo-film','fa-hammer','fa-globe','fa-fire','fa-feather','fa-cubes','fa-boxes-stacked','fa-leaf','fa-wifi','fa-satellite','fa-compass','fa-map','fa-server','fa-code-branch','fa-bug-slash'
];

let currentIconTarget = null;
const openIconPicker = (targetInput) => {
  currentIconTarget = targetInput;
  const modal = document.getElementById('icon-picker');
  if (!modal) return;
  renderIconGrid();
  modal.style.display = '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  setTimeout(() => document.getElementById('icon-search')?.focus(), 0);
};
const closeIconPicker = () => {
  const modal = document.getElementById('icon-picker');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
};

const renderIconGrid = (q='') => {
  const grid = document.getElementById('icon-grid');
  if (!grid) return;
  const term = (q||'').toLowerCase().trim();
  const list = ICONS.filter(n => !term || n.includes(term));
  grid.innerHTML = list.map(n => `<button class="btn" data-icon-choice="${n}"><i class="fa-solid ${n}"></i> ${n}</button>`).join('');
};

document.addEventListener('click', (e) => {
  if (e.target.closest('#pick-post-icon')) {
    openIconPicker(document.getElementById('post-icon'));
  }
  if (e.target.closest('#pick-tag-icon')) {
    openIconPicker(document.getElementById('tag-icon'));
  }
  if (e.target.closest('#icon-picker .modal__close')) {
    closeIconPicker();
  }
  const choice = e.target.closest('[data-icon-choice]');
  if (choice && currentIconTarget) {
    currentIconTarget.value = choice.getAttribute('data-icon-choice');
    closeIconPicker();
  }
  if (e.target.closest('#icon-clear')) {
    if (currentIconTarget) currentIconTarget.value = '';
    closeIconPicker();
  }
});

document.getElementById('icon-search')?.addEventListener('input', (e) => {
  renderIconGrid(e.target.value);
});


