const data = {
    materials: [
        { name: "Aluminium AlMgSi1", vc: 500 },
        { name: "Aluminiumguss", vc: 300 },
        { name: "Kupfer", vc: 250 },
        { name: "Baustahl S235JR", vc: 180 },
        { name: "Edelstahl 1.4301", vc: 100 }
    ],
    tools: [
        { name: "Schaftfräser D6 VHM", d: 6, z: 4 },
        { name: "Schaftfräser D8 VHM", d: 8, z: 4 },
        { name: "Schruppfräser D10 VHM", d: 10, z: 3 }
    ],
    profiles: [
        { name: "Schruppen Standard", fz: 0.08 },
        { name: "Schlichten fein", fz: 0.05 }
    ]
};

let currentStep = 1;
let selection = { material: null, tool: null, profile: null };

function renderStep() {
    const container = document.getElementById('step-content');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // UI Updates
    document.querySelectorAll('.step-indicator').forEach((el, idx) => {
        el.classList.toggle('active', idx + 1 === currentStep);
    });
    prevBtn.disabled = (currentStep === 1);
    nextBtn.disabled = (currentStep === 4 || !selection[Object.keys(selection)[currentStep - 1]]);

    container.innerHTML = '';

    if (currentStep === 1) {
        container.innerHTML = '<h2>Werkstoff auswählen</h2><div class="grid" id="list"></div>';
        data.materials.forEach(m => addCard('list', m.name, `vc ${m.vc} m/min`, m, 'material'));
    } else if (currentStep === 2) {
        container.innerHTML = '<h2>Werkzeug auswählen</h2><div class="grid" id="list"></div>';
        data.tools.forEach(t => addCard('list', t.name, `Ø ${t.d}mm - ${t.z} Schneiden`, t, 'tool'));
    } else if (currentStep === 3) {
        container.innerHTML = '<h2>Bearbeitungsprofil</h2><div class="grid" id="list"></div>';
        data.profiles.forEach(p => addCard('list', p.name, `Vorschub fz: ${p.fz}`, p, 'profile'));
    } else if (currentStep === 4) {
        calculate();
    }
}

function addCard(parentId, title, subtitle, obj, type) {
    const card = document.createElement('div');
    card.className = `card ${selection[type] === obj ? 'selected' : ''}`;
    card.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
    card.onclick = () => { selection[type] = obj; renderStep(); document.getElementById('nextBtn').disabled = false; };
    document.getElementById(parentId).appendChild(card);
}

function calculate() {
    const { material, tool, profile } = selection;
    // Formeln
    const n = (material.vc * 1000) / (Math.PI * tool.d);
    const vf = n * tool.z * profile.fz;
    
    document.getElementById('step-content').innerHTML = `
        <h2>Ergebnisse</h2>
        <div class="result-box">
            <div class="stat-card"><strong>Drehzahl n:</strong><br>${Math.round(n)} U/min</div>
            <div class="stat-card"><strong>Vorschub vf:</strong><br>${Math.round(vf)} mm/min</div>
        </div>
    `;
    document.getElementById('nextBtn').style.display = 'none';
}

function changeStep(dir) {
    currentStep += dir;
    renderStep();
}

renderStep();
