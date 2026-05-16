(function () {
  const SHEET_ID = '17WJ6ZRcUYZakdiJ9YUiJJT5nDR_hiIZ6EKmdaVjVvQ0';
  const API_KEY  = 'AIzaSyDfKuAKXIjFBJTNv5EkdykAON3Uh6yPQ94';
  const GID      = '1680505297';

  const CAT_ICONS = {
    'DCC / Modélisation': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
    'Texturing':          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>',
    'Moteurs de jeu':     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    'Photogrammétrie':    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    'IA / Génératif':     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    'Végétation':         '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    'Pipeline & Rendu':   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'UV / Retopo':        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'Assets & Référence': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  };

  const DEFAULT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';

  async function getSheetName() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties&key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Metadata ${res.status}`);
    const data = await res.json();
    const sheet = data.sheets.find(s => String(s.properties.sheetId) === GID);
    return sheet ? sheet.properties.title : null;
  }

  async function fetchRows(sheetName) {
    const range = encodeURIComponent(`'${sheetName}'!A:D`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Values ${res.status}`);
    const data = await res.json();
    return data.values || [];
  }

  function parse(rows) {
    return rows.slice(1)
      .filter(r => r[0] && r[0].trim() && r[2] && r[2].trim())
      .map(r => ({
        name:     r[0].trim(),
        category: (r[1] || '').trim(),
        score:    parseInt(r[2], 10) || 0,
        status:   (r[3] || '').trim(),
      }));
  }

  function animateFills(container) {
    const fills = Array.from(container.querySelectorAll('.skill-bar-fill'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const idx = fills.indexOf(entry.target);
        setTimeout(() => { entry.target.style.width = entry.target.dataset.pct + '%'; }, idx * 80);
      });
    }, { threshold: 0.3 });
    fills.forEach(el => io.observe(el));
  }

  function renderBars(skills) {
    const container = document.querySelector('.skill-bars--wide');
    if (!container) return;

    const top = [...skills].sort((a, b) => b.score - a.score).slice(0, 10);
    container.innerHTML = top.map(s => {
      const label = s.status ? `${s.status} · ${s.score}%` : `${s.score}%`;
      return `<div class="skill-bar-item reveal">
        <div class="skill-bar-header"><span>${s.name}</span><span class="skill-status">${label}</span></div>
        <div class="skill-bar-track"><div class="skill-bar-fill" data-pct="${s.score}"></div></div>
      </div>`;
    }).join('');

    animateFills(container);

    container.querySelectorAll('.skill-bar-item').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 60}ms`;
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  }

  function renderCategories(skills) {
    const grid = document.querySelector('.cat-grid');
    if (!grid) return;

    const hasCats = skills.some(s => s.category);
    if (!hasCats) return;

    const cats = {};
    skills.forEach(s => {
      if (!s.category) return;
      if (!cats[s.category]) cats[s.category] = [];
      cats[s.category].push(s);
    });

    grid.innerHTML = Object.entries(cats).map(([cat, tools]) => {
      const icon = CAT_ICONS[cat] || DEFAULT_ICON;
      const toolsHtml = [...tools]
        .sort((a, b) => b.score - a.score)
        .map(t => {
          const cls = t.score >= 80 ? 'cat-tool--expert' : 'cat-tool--ope';
          return `<span class="cat-tool ${cls}">${t.name} <em>${t.score}%</em></span>`;
        }).join('');
      return `<div class="cat-card glass">
        <div class="cat-card-header">${icon}<span>${cat}</span></div>
        <div class="cat-tools">${toolsHtml}</div>
      </div>`;
    }).join('');
  }

  async function init() {
    try {
      const sheetName = await getSheetName();
      if (!sheetName) return;
      const rows = await fetchRows(sheetName);
      const skills = parse(rows);
      if (!skills.length) return;
      renderBars(skills);
      renderCategories(skills);
    } catch (err) {
      console.warn('[sheets.js] Sync failed:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
