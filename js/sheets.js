// ============================================
// CONFIGURATION GOOGLE SHEETS
// ============================================

const SHEET_CONFIG = {
    // ⚠️ Remplace par ton vrai ID
    sheetId: '1LfDDyMi36kDBhq3V8sVttipoajdN-faH',
    
    // Noms exacts de tes onglets
    sheets: {
        toolkit:      'Toolkit',
        maitrise:     'Maîtrise',
        studios:      'Studios',
        statistiques: 'Statistiques',
        priorites:    'Priorités'
    },
    
    // URL de base pour l'API publique (sans clé requise)
    baseUrl: 'https://docs.google.com/spreadsheets/d/'
};

// ============================================
// FONCTION PRINCIPALE — FETCH SHEET
// ============================================

async function fetchSheet(sheetName) {
    const url = `${SHEET_CONFIG.baseUrl}${SHEET_CONFIG.sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        
        // Nettoyer la réponse JSONP de Google
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonString = text.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonString);
        
        return parseGoogleSheetData(data);
    } catch (error) {
        console.error(`Erreur chargement onglet "${sheetName}":`, error);
        return [];
    }
}

// ============================================
// PARSER — CONVERTIT LE FORMAT GOOGLE EN TABLEAU
// ============================================

function parseGoogleSheetData(data) {
    if (!data.table || !data.table.rows) return [];
    
    const rows = data.table.rows;
    const cols = data.table.cols;
    
    // Récupérer les headers (première ligne non vide)
    const headers = cols.map(col => col.label || '');
    
    return rows.map(row => {
        const obj = {};
        row.c.forEach((cell, i) => {
            const key = headers[i] || `col${i}`;
            obj[key] = cell ? (cell.v !== null ? cell.v : '') : '';
        });
        return obj;
    }).filter(row => Object.values(row).some(v => v !== ''));
}

// ============================================
// CHARGEMENT COMPÉTENCES (onglet Maîtrise)
// ============================================

async function loadCompetences() {
    const grid = document.getElementById('skills-grid');
    const filterTabs = document.getElementById('filter-tabs');
    
    const data = await fetchSheet(SHEET_CONFIG.sheets.maitrise);
    
    if (!data.length) {
        grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">Impossible de charger les données.</p>';
        return;
    }
    
    // Extraire les catégories uniques
    const categories = [...new Set(data.map(row => row['CATÉGORIE'] || row['Catégorie']).filter(Boolean))];
    
    // Créer les boutons de filtre
    filterTabs.innerHTML = '<button class="filter-btn active" data-filter="all">Tous</button>';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = cat;
        btn.textContent = cat;
        filterTabs.appendChild(btn);
    });
    
    // Créer les cartes
    grid.innerHTML = '';
    data.forEach((row, index) => {
        const outil = row['OUTIL'] || row['Outil'] || '';
        const categorie = row['CATÉGORIE'] || row['Catégorie'] || '';
        const maitrise = row['MAÎTRISE'] || row['Maitrise'] || '';
        const pourcentage = row['MAÎTRISE %'] || row['Maîtrise %'] || '0%';
        
        if (!outil) return;
        
        const pct = parseInt(pourcentage) || 0;
        const levelClass = getLevelClass(maitrise);
        
        const card = document.createElement('div');
        card.className = 'skill-card reveal';
        card.dataset.category = categorie;
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
            <div class="skill-header">
                <span class="skill-name">${outil}</span>
                <span class="skill-category-badge">${categorie}</span>
            </div>
            <div class="skill-meta">
                <span class="skill-level-badge ${levelClass}">${maitrise}</span>
            </div>
            <div class="skill-bar-container">
                <div class="skill-bar" data-width="${pct}"></div>
            </div>
            <div class="skill-percentage">${pourcentage}</div>
        `;
        
        grid.appendChild(card);
    });
    
    // Activer les filtres
    setupFilters();
    
    // Animer les barres après un délai
    setTimeout(() => animateSkillBars(), 300);
    
    // Mettre à jour le timestamp
    updateSyncTime();
}

// ============================================
// CHARGEMENT STATS (onglet Statistiques)
// ============================================

async function loadStats() {
    const data = await fetchSheet(SHEET_CONFIG.sheets.statistiques);
    const grid = document.getElementById('stats-grid');
    const donut = document.getElementById('donut-chart');
    
    if (!data.length) return;
    
    // Stats à afficher sur le site (adapter selon tes données réelles)
    const statsToShow = [
        { label: 'Outils total', key: 'Nombre total d\'outils', icon: '🔧' },
        { label: 'Niveau Expert', key: 'Outils Expert', icon: '⭐' },
        { label: 'Opérationnel', key: 'Outils Opérationnel', icon: '✅' },
        { label: 'En apprentissage', key: 'Outils En apprentissage', icon: '📚' },
    ];
    
    // Chercher les valeurs dans les données
    grid.innerHTML = '';
    
    // Les données Statistiques ont une structure différente (clé/valeur)
    // On va parser différemment
    const statsMap = {};
    data.forEach(row => {
        const keys = Object.keys(row);
        if (keys.length >= 2) {
            statsMap[row[keys[0]]] = row[keys[1]];
        }
    });
    
    const displayStats = [
        { label: 'Outils total', value: statsMap['Nombre total d\'outils'] || '66' },
        { label: 'Niveau Expert', value: statsMap['Outils Expert'] || '36' },
        { label: 'Opérationnel', value: statsMap['Outils Opérationnel'] || '8' },
        { label: 'En apprentissage', value: statsMap['Outils En apprentissage'] || '8' },
        { label: 'Studios analysés', value: statsMap['Studios analysés'] || '25' },
        { label: 'Match ≥ 90%', value: statsMap['Studios avec match ≥ 90%'] || '6' },
    ];
    
    displayStats.forEach(stat => {
        const card = document.createElement('div');
        card.className = 'stat-card reveal';
        card.innerHTML = `
            <span class="stat-card-number" data-target="${parseInt(stat.value) || 0}">0</span>
            <span class="stat-card-label">${stat.label}</span>
        `;
        grid.appendChild(card);
    });
    
    // Catégories pour le donut (depuis le Toolkit)
    loadCategoryChart();
    
    // Animer les compteurs
    setTimeout(() => animateCounters(), 400);
}

// ============================================
// GRAPHIQUE CATÉGORIES
// ============================================

async function loadCategoryChart() {
    const data = await fetchSheet(SHEET_CONFIG.sheets.toolkit);
    const donut = document.getElementById('donut-chart');
    
    if (!data.length || !donut) return;
    
    // Compter par catégorie
    const categoryCounts = {};
    data.forEach(row => {
        const cat = row['CATÉGORIE'] || row['Catégorie'] || 'Autre';
        if (cat && cat !== '') {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });
    
    const colors = [
        '#00f5ff', '#7b2fff', '#ff6b35', '#64ff64',
        '#ffa500', '#ff69b4', '#00bfff', '#adff2f',
        '#ff4500', '#9370db', '#20b2aa', '#daa520'
    ];
    
    donut.innerHTML = '';
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count], i) => {
        const item = document.createElement('div');
        item.className = 'donut-item reveal';
        item.innerHTML = `
            <div class="donut-color" style="background:${colors[i % colors.length]}"></div>
            <span class="donut-label">${cat}</span>
            <span class="donut-value">${count}</span>
        `;
        donut.appendChild(item);
    });
}

// ============================================
// HELPERS
// ============================================

function getLevelClass(maitrise) {
    if (!maitrise) return '';
    const m = maitrise.toLowerCase();
    if (m.includes('expert')) return 'level-expert';
    if (m.includes('opérationnel') || m.includes('operationnel')) return 'level-operationnel';
    if (m.includes('apprentissage')) return 'level-apprentissage';
    if (m.includes('découverte') || m.includes('decouverte')) return 'level-decouverte';
    return 'level-decouverte';
}

function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.skill-card');
    
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => animateSkillBars(), 100);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function animateSkillBars() {
    document.querySelectorAll('.skill-bar').forEach(bar => {
        const target = bar.dataset.width;
        bar.style.width = target + '%';
    });
}

function animateCounters() {
    document.querySelectorAll('.stat-card-number[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 16);
    });
}

function updateSyncTime() {
    const el = document.getElementById('last-sync');
    if (el) {
        const now = new Date();
        el.textContent = `Sync: ${now.toLocaleTimeString('fr-FR')}`;
    }
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadCompetences();
    loadStats();
});
