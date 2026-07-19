// --- 1. Standard-Datenbank ---
const defaultData = {
    materials: [
        { id: "m1", name: "Aluminium AlMgSi1", vc: 500 }, 
        { id: "m2", name: "Baustahl S235JR", vc: 180 }, 
        { id: "m3", name: "Edelstahl 1.4301", vc: 100 }
    ],
    categories: [
        { id: "c1", name: "Schaftfräser" },
        { id: "c2", name: "Planmesserkopf" },
        { id: "c3", name: "Bohrer" }
    ],
    tools: [
        { id: "t1", name: "Schaftfräser D8 VHM", category: "c1", d: 8, z: 4 }, 
        { id: "t2", name: "Schaftfräser D10 VHM", category: "c1", d: 10, z: 4 },
        { id: "t3", name: "Messerkopf D50", category: "c2", d: 50, z: 5 },
        { id: "t4", name: "VHM Bohrer D6.8", category: "c3", d: 6.8, z: 2 }
    ],
    profiles: [
        { id: "p1", name: "Schruppen (Vollnut)", fz: 0.08 }, 
        { id: "p2", name: "Schlichten (Fein)", fz: 0.05 },
        { id: "p3", name: "Bohren Standard", fz: 0.12 }
    ]
};

const troubleshooter = [
    { p: "Rattern / Vibration?", s: "Zustellung (ae/ap) reduzieren oder Drehzahl (n) leicht verändern." },
    { p: "Schlechte Oberfläche?", s: "Schnittgeschwindigkeit (vc) erhöhen oder Vorschub (fz) reduzieren." },
    { p: "Aufbauschneide (Alu)?", s: "Kühlung verbessern, vc erhöhen." }
];

// --- 2. Daten laden (LocalStorage oder Standard) ---
let appData = JSON.parse(localStorage.getItem('cncData')) || defaultData;

function saveData() {
    localStorage.setItem('cncData', JSON.stringify(appData));
}

function factoryReset() {
    if(confirm("Alle eigenen Daten löschen und auf Werkseinstellungen zurücksetzen?")) {
        localStorage.removeItem('cncData');
        location.reload();
    }
}

// --- 3. UI Status ---
let currentStep = 1;
let selection = { material: null, category: null, tool: null, profile: null };

document.body.dataset.theme = localStorage.getItem('theme') || 'light';

function toggleTheme() {
    const isDark = document.body.dataset.theme === 'dark';
    document.body.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
}

// --- 4. Kern-Logik (Auswahl & Rechner) ---
function renderStep() {
    const container = document.getElementById('step-content');
    const nextBtn = document.getElementById('nextBtn');
    
    // Stepper aktualisieren
    for(let i=1; i<=5; i++) {
        const ind = document.getElementById(`ind${i}`);
        if(ind) ind.classList.toggle('active', i === currentStep);
    }
    
    // Weiter-Button Logik
    const stepKeys = ['material', 'category', 'tool', 'profile'];
    if(currentStep < 5) {
        nextBtn.disabled = !selection[stepKeys[currentStep - 1]];
        nextBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'none';
    }

    container.innerHTML = '';
    
    if (currentStep === 1) {
        container.innerHTML = '<h2>1. Werkstoff wählen</h2><div class="grid" id="list"></div>';
        appData.materials.forEach(m => addCard('list', m.name, `vc ${m.vc} m/min`, m, 'material'));
    } 
    else if (currentStep === 2) {
        container.innerHTML = '<h2>2. Werkzeug-Art wählen</h2><div class="grid" id="list"></div>';
        appData.categories.forEach(c => addCard('list', c.name, '', c, 'category'));
    }
    else if (currentStep === 3) {
        container.innerHTML = '<h2>3. Konkretes Werkzeug wählen</h2><div class="grid" id="list"></div>';
        const filteredTools = appData.tools.filter(t => t.category === selection.category.id);
        if (filteredTools.length === 0) container.innerHTML += '<p>Keine Werkzeuge in dieser Kategorie gefunden. Bitte im Admin-Bereich anlegen.</p>';
        filteredTools.forEach(t => addCard('list', t.name, `Ø ${t.d}mm - Z=${t.z}`, t, 'tool'));
    }
    else if (currentStep === 4) {
        container.innerHTML = '<h2>4. Bearbeitungsprofil</h2><div class="grid" id="list"></div>';
        appData.profiles.forEach(p => addCard('list', p.name, `Vorschub fz: ${p.fz}`, p, 'profile'));
    } 
    else if (currentStep === 5) {
        calculate();
    }
}

function addCard(parentId, title, subtitle, obj, type) {
    const card = document.createElement('div');
    card.className = `card ${selection[type] && selection[type].id === obj.id ? 'selected' : ''}`;
    if(subtitle) card.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
    else card.innerHTML = `<h3>${title}</h3>`;
    card.onclick = () => { 
        selection[type] = obj; 
        
        // Reset Folge-Schritte, falls man zurückgeht und etwas anderes auswählt
        if(type === 'category') selection.tool = null; 

        renderStep(); 
    };
    document.getElementById(parentId).appendChild(card);
}

function calculate() {
    const { material, tool, profile } = selection;
    const n = Math.round((material.vc * 1000) / (Math.PI * tool.d));
    const vf = Math.round(n * tool.z * profile.fz);
    
    let html = `<h2>Berechnete Werte</h2><div class="result-box">
        <div class="stat-card"><strong>Drehzahl (n):</strong><br><span style="font-size:1.5em; color:var(--accent)">${n}</span> U/min</div>
        <div class="stat-card"><strong>Vorschub (vf):</strong><br><span style="font-size:1.5em; color:var(--accent)">${vf}</span> mm/min</div>
    </div>
    <div class="stat-card" style="margin-top:20px;">
        <small>Zusammenfassung: ${tool.name} in ${material.name} | Profil: ${profile.name}</small>
    </div>
    <h3 style="margin-top:30px;">Problemlösung an der Maschine</h3><div class="grid">`;
    
    troubleshooter.forEach(t => {
        html += `<div class="card trouble-card" onclick="alert('${t.s}')"><strong>${t.p}</strong></div>`;
    });
    
    document.getElementById('step-content').innerHTML = html + `</div><button onclick="location.reload()" style="margin-top:30px; width:100%">Neue Berechnung</button>`;
}

function changeStep(dir) { currentStep += dir; renderStep(); }


// --- 5. Admin Konsole Logik ---
let currentAdminTab = 'matTab';

function openAdmin() { document.getElementById('adminModal').style.display = 'block'; switchTab(currentAdminTab); }
function closeAdmin() { document.getElementById('adminModal').style.display = 'none'; renderStep(); }

function switchTab(tabId) {
    currentAdminTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const formContainer = document.getElementById('admin-form-container');
    let formHtml = '';
    
    if(tabId === 'matTab') {
        formHtml = `
            <h3>Neuen Werkstoff anlegen</h3>
            <div class="form-group"><label>Bezeichnung</label><input type="text" id="addName" placeholder="z.B. Titan TiAl6V4"></div>
            <div class="form-group"><label>Schnittgeschwindigkeit vc (m/min)</label><input type="number" id="addVc" placeholder="z.B. 60"></div>
            <button onclick="addEntry('material')">Hinzufügen</button>
        `;
    } else if (tabId === 'catTab') {
        formHtml = `
            <h3>Neue Kategorie anlegen</h3>
            <div class="form-group"><label>Kategoriename</label><input type="text" id="addName" placeholder="z.B. Gewindebohrer"></div>
            <button onclick="addEntry('category')">Hinzufügen</button>
        `;
    } else if (tabId === 'toolTab') {
        let catOptions = appData.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        formHtml = `
            <h3>Neues Werkzeug anlegen</h3>
            <div class="form-group"><label>Werkzeug-Name</label><input type="text" id="addName" placeholder="z.B. Schaftfräser D12"></div>
            <div class="form-group"><label>Kategorie</label><select id="addCat">${catOptions}</select></div>
            <div class="form-group"><label>Durchmesser D (mm)</label><input type="number" step="0.1" id="addD" placeholder="z.B. 12"></div>
            <div class="form-group"><label>Schneidenanzahl Z</label><input type="number" id="addZ" placeholder="z.B. 4"></div>
            <button onclick="addEntry('tool')">Hinzufügen</button>
        `;
    } else if (tabId === 'profTab') {
        formHtml = `
            <h3>Neues Profil anlegen</h3>
            <div class="form-group"><label>Profil-Name</label><input type="text" id="addName" placeholder="z.B. HPC Schruppen"></div>
            <div class="form-group"><label>Vorschub pro Zahn fz (mm)</label><input type="number" step="0.01" id="addFz" placeholder="z.B. 0.08"></div>
            <button onclick="addEntry('profile')">Hinzufügen</button>
        `;
    }
    
    formContainer.innerHTML = formHtml;
    renderAdminList();
}

function addEntry(type) {
    const name = document.getElementById('addName').value;
    if(!name) return alert("Bitte Namen eingeben!");
    
    const id = Date.now().toString(); // Generiert eindeutige ID
    
    if(type === 'material') {
        appData.materials.push({ id, name, vc: parseFloat(document.getElementById('addVc').value) || 100 });
    } else if(type === 'category') {
        appData.categories.push({ id, name });
    } else if(type === 'tool') {
        appData.tools.push({ 
            id, name, 
            category: document.getElementById('addCat').value,
            d: parseFloat(document.getElementById('addD').value) || 10,
            z: parseInt(document.getElementById('addZ').value) || 4
        });
    } else if(type === 'profile') {
        appData.profiles.push({ id, name, fz: parseFloat(document.getElementById('addFz').value) || 0.05 });
    }
    
    saveData();
    switchTab(currentAdminTab); // Formular leeren & Liste aktualisieren
}

function deleteEntry(type, id) {
    if(!confirm("Eintrag wirklich löschen?")) return;
    
    if(type === 'matTab') appData.materials = appData.materials.filter(i => i.id !== id);
    if(type === 'catTab') {
        appData.categories = appData.categories.filter(i => i.id !== id);
        // Auch alle Tools dieser Kategorie löschen
        appData.tools = appData.tools.filter(t => t.category !== id);
    }
    if(type === 'toolTab') appData.tools = appData.tools.filter(i => i.id !== id);
    if(type === 'profTab') appData.profiles = appData.profiles.filter(i => i.id !== id);
    
    saveData();
    renderAdminList();
}

function renderAdminList() {
    const list = document.getElementById('admin-list');
    let items = [];
    if(currentAdminTab === 'matTab') items = appData.materials;
    if(currentAdminTab === 'catTab') items = appData.categories;
    if(currentAdminTab === 'toolTab') items = appData.tools;
    if(currentAdminTab === 'profTab') items = appData.profiles;
    
    list.innerHTML = items.map(item => `
        <div class="list-item">
            <span>${item.name}</span>
            <button class="del-btn" onclick="deleteEntry('${currentAdminTab}', '${item.id}')">Löschen</button>
        </div>
    `).join('');
}

// Initialer Start
renderStep();
