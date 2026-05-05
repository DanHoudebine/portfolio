// ============================================
// CONFIGURATION
// ============================================
const SHEET_ID = '1LfDDyMi36kDBhq3V8sVttipoajdN-faH';

// ============================================
// FETCH — récupère un onglet par son nom
// ============================================
async function fetchSheet(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    
    try {
        const res = await fetch(url);
        const text = await res.text();
        
        // Google renvoie du JSONP → on extrait le JSON pur
        const clean = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
        if (!clean) return [];
        
        const json = JSON.parse(clean[1]);
        if (!json.table) return [];
        
        const { cols, rows } = json.table;
        
        // Headers = labels des colonnes
        const headers = cols.map(c => (c.label || '').trim());
        
        // Convertir chaque ligne en objet
        const result = [];
        rows.forEach(row => {
            if (!row.c) return;
            const obj = {};
            let hasContent = false;
            row.c.forEach((cell, i) => {
                const key = headers[i] || `col${i}`;
                const val = cell ? (cell.v !== undefined && cell.v !== null ? String(cell.v) : '') : '';
                obj[key] = val.trim();
                if (val.trim()) hasContent = true;
            });
            if (hasContent) result.push(obj);
        });
        
        return result;
        
    } catch (err) {
        console.error(`Erreur fetchSheet("${sheetName}"):`, err);
        return [];
    }
}

// ============================================
// SECTION COMPÉTENCES
// Affiche les 10 premiers + bouton "Voir tout"
// ============================================
async function loadCompetences() {
    const grid = document.getElementById('skills-grid');
    const filterTabs = document.getElementById('filter-tabs');
    
    // Indicateur de chargement
    grid.innerHTML = `
        <div class="loading-skills">
            <div class="loader"></div>
            <span>Chargement depuis Google Sheet...</span>
        </div>`;
    
    const data = await fetchSheet('Maîtrise');
    
    // Debug — affiche dans la console ce qu'on reçoit
    console.log('Données Maîtrise reçues :', data.slice(0, 3));
    
    if (!data.length) {
        grid.innerHTML = `
            <div style="text-align:center;padding:60px;color:var(--text-muted)">
                <p style="font-size:2rem;margin-bottom:16px">⚠️</p>
                <p>Impossible de charger les données.<br>
                Vérifie que le Sheet est bien partagé en lecture publique.</p>
            </div>`;
        return;
    }
    
    // Détecter les bonnes clés (insensible à la casse/accents)
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    console.log('Colonnes détectées :', keys);
    
    const keyOutil    = keys.find(k => k.toLowerCase().includes('outil')) || keys[0];
    const keyCat      = keys.find(k => k.toLowerCase().includes('cat')) || keys[1];
    const keyMaitrise = keys[2]; // colonne C = MAÎTRISE
    const keyPct      = keys[3]; // colonne D = MAÎTRISE %

    
    // Catégories uniques pour les filtres
    const categories = [...new Set(data.map(r => r[keyCat]).filter(Boolean))];
    
    // Boutons filtre
    filterTabs.innerHTML = `<button class="filter-btn active" data-filter="all">Tous</button>`;
    categories.forEach(cat => {
        filterTabs.innerHTML += `<button class="filter-btn" data-filter="${cat}">${cat}</button>`;
    });
    
    // ---- AFFICHAGE : TOP 10 par défaut ----
    let showAll = false;
    const TOP_N = 10;
    
    function renderCards(filter = 'all') {
        grid.innerHTML = '';
        
        let filtered = data.filter(r => r[keyOutil]);
        if (filter !== 'all') {
            filtered = filtered.filter(r => r[keyCat] === filter);
        }
        
        const toShow = showAll ? filtered : filtered.slice(0, TOP_N);
        
        toShow.forEach((row, i) => {
            const outil    = row[keyOutil]    || '';
            const cat      = row[keyCat]      || '';
            const maitrise = row[keyMaitrise] || '';
            const pctRaw   = row[keyPct]      || '0';
            const pct      = parseInt(pctRaw) || 0;
            
            const card = document.createElement('div');
            card.className = 'skill-card reveal';
            card.dataset.category = cat;
            
            card.innerHTML = `
                <div class="skill-header">
                    <span class="skill-name">${outil}</span>
                    <span class="skill-cat-badge" data-cat="${cat}">${cat}</span>
                </div>
                <div class="skill-level ${getLevelClass(maitrise)}">
                    <span class="level-dot"></span>
                    ${maitrise}
                </div>
                <div class="skill-bar-wrap">
                    <div class="skill-bar-track">
                        <div class="skill-bar-fill" style="width:0%" data-target="${pct}"></div>
                    </div>
                    <span class="skill-pct">${pct}%</span>
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        // Bouton "Voir tout / Réduire"
        if (!showAll && filtered.length > TOP_N) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'show-more-wrap';
            btnWrap.innerHTML = `
                <button class="btn btn-secondary show-more-btn">
                    Voir les ${filtered.length - TOP_N} autres →
                </button>`;
            grid.appendChild(btnWrap);
            
            btnWrap.querySelector('.show-more-btn').addEventListener('click', () => {
                showAll = true;
                renderCards(filter);
            });
        } else if (showAll && filtered.length > TOP_N) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'show-more-wrap';
            btnWrap.innerHTML = `<button class="btn btn-secondary show-more-btn">↑ Réduire</button>`;
            grid.appendChild(btnWrap);
            
            btnWrap.querySelector('.show-more-btn').addEventListener('click', () => {
                showAll = false;
                renderCards(filter);
                document.getElementById('competences').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Animer barres + révéler cartes
        setTimeout(() => {
            document.querySelectorAll('.skill-bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.target + '%';
            });
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        }, 100);
        
        updateSyncTime();
    }
    
    // Render initial
    renderCards('all');
    
    // Filtres
    filterTabs.addEventListener('click', e => {
        if (!e.target.classList.contains('filter-btn')) return;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        showAll = false;
        renderCards(e.target.dataset.filter);
    });
}

// ============================================
// SECTION STATS
// ============================================
async function loadStats() {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;
    
    const data = await fetchSheet('Statistiques');
    console.log('Stats reçues :', data);
    
    // Parser clé → valeur
    const map = {};
    data.forEach(row => {
        const vals = Object.values(row).filter(v => v !== '');
        if (vals.length >= 2) map[vals[0]] = vals[1];
    });
    
    const afficher = [
        { label: 'Outils total',       emoji: '🔧', key: "Nombre total d'outils",       fallback: '66' },
        { label: 'Niveau Expert',      emoji: '⭐', key: 'Outils Expert',               fallback: '36' },
        { label: 'Opérationnel',       emoji: '✅', key: 'Outils Opérationnel',         fallback: '8'  },
        { label: 'En apprentissage',   emoji: '📚', key: 'Outils En apprentissage',     fallback: '8'  },
        { label: 'Studios analysés',   emoji: '🏢', key: 'Studios analysés',            fallback: '25' },
        { label: 'Match ≥ 90%',        emoji: '🎯', key: 'Studios avec match ≥ 90%',   fallback: '6'  },
    ];
    
    grid.innerHTML = '';
    afficher.forEach(item => {
        const val = parseInt(map[item.key] || item.fallback) || 0;
        const card = document.createElement('div');
        card.className = 'stat-card reveal';
        card.innerHTML = `
            <span class="stat-card-emoji">${item.emoji}</span>
            <span class="stat-card-number" data-target="${val}">0</span>
            <span class="stat-card-label">${item.label}</span>
        `;
        grid.appendChild(card);
    });
    
    setTimeout(() => {
        document.querySelectorAll('.stat-card').forEach(el => el.classList.add('visible'));
        animateAllCounters();
    }, 200);
    
    loadCategoryChart();
}

async function loadCategoryChart() {
    const donut = document.getElementById('donut-chart');
    if (!donut) return;
    
    const data = await fetchSheet('Toolkit');
    const keys = data[0] ? Object.keys(data[0]) : [];
    const keyCat = keys.find(k => k.toLowerCase().includes('cat')) || keys[1];
    
    const counts = {};
    data.forEach(r => {
        const c = r[keyCat];
        if (c) counts[c] = (counts[c] || 0) + 1;
    });
    
    const colors = ['#00f5ff','#7b2fff','#ff6b35','#64ff64','#ffa500','#ff69b4','#00bfff','#adff2f','#ff4500','#9370db','#20b2aa','#daa520'];
    
    donut.innerHTML = '';
    Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([cat, n], i) => {
        const item = document.createElement('div');
        item.className = 'donut-item reveal';
        item.innerHTML = `
            <div class="donut-color" style="background:${colors[i%colors.length]}"></div>
            <span class="donut-label">${cat}</span>
            <span class="donut-count">${n} outils</span>
        `;
        donut.appendChild(item);
        setTimeout(() => item.classList.add('visible'), i * 80);
    });
}

// ============================================
// HELPERS
// ============================================
function getLevelClass(m) {
    if (!m) return '';
    const l = m.toLowerCase();
    if (l.includes('expert'))                        return 'level-expert';
    if (l.includes('rationnel'))                     return 'level-operationnel';
    if (l.includes('apprentissage'))                 return 'level-apprentissage';
    if (l.includes('couverte') || l.includes('non')) return 'level-decouverte';
    return 'level-decouverte';
}

function animateAllCounters() {
    document.querySelectorAll('[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current);
            if (current >= target) clearInterval(timer);
        }, 16);
    });
}

function updateSyncTime() {
    const el = document.getElementById('last-sync');
    if (el) el.textContent = `Sync: ${new Date().toLocaleTimeString('fr-FR')}`;
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadCompetences();
    loadStats();
});
