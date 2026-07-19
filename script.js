const data = {
    materials: [
        { name: "Aluminium", vc: 500 }, { name: "Baustahl", vc: 180 }, { name: "Edelstahl", vc: 100 }
    ],
    tools: [
        { name: "Schaftfräser D8", d: 8, z: 4 }, { name: "Schaftfräser D10", d: 10, z: 4 }
    ],
    profiles: [
        { name: "Schruppen", fz: 0.08 }, { name: "Schlichten", fz: 0.05 }
    ]
};

const troubleshooter = [
    { p: "Rattern?", s: "Erhöhe ae oder reduziere n." },
    { p: "Oberfläche?", s: "Erhöhe vc oder reduziere fz." },
    { p: "Verschleiß?", s: "Reduziere ap oder vc." }
];

let currentStep = 1;
let selection = { material: null, tool: null, profile: null };

function toggleTheme() {
    const isDark = document.body.dataset.theme === 'dark';
    document.body.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
}

// Initialer Theme-Load
document.body.dataset.theme = localStorage.getItem('theme') || 'light';

function renderStep() {
    const container = document.getElementById('step-content');
    const nextBtn = document.getElementById('nextBtn');
    document.querySelectorAll('.step-indicator').forEach((el, idx) => el.classList.toggle('active', idx + 1 === currentStep));
    nextBtn.disabled = !selection[Object.keys(selection)[currentStep - 1]];

    container.innerHTML = '';
    
    if (currentStep < 4) {
        const keys = ['materials', 'tools', 'profiles'];
        const currentData = data[keys[currentStep - 1]];
        container.innerHTML = `<h2>Schritt ${currentStep}</h2><div class="grid" id="list"></div>`;
        currentData.forEach(item => {
            const div = document.createElement('div');
            div.className = `card ${selection[Object.keys(selection)[currentStep-1]] === item ? 'selected' : ''}`;
            div.innerHTML = `<h3>${item.name}</h3>`;
            div.onclick = () => { selection[Object.keys(selection)[currentStep-1]] = item; renderStep(); };
            document.getElementById('list').appendChild(div);
        });
    } else {
        calculate();
    }
}

function calculate() {
    const { material, tool, profile } = selection;
    const n = Math.round((material.vc * 1000) / (Math.PI * tool.d));
    const vf = Math.round(n * tool.z * profile.fz);
    
    let html = `<h2>Ergebnisse</h2><div class="result-box">
        <div class="stat-card"><strong>Drehzahl n:</strong><br>${n} U/min</div>
        <div class="stat-card"><strong>Vorschub vf:</strong><br>${vf} mm/min</div>
    </div><h3>Probleme?</h3><div class="grid">`;
    troubleshooter.forEach(t => html += `<div class="card trouble-card" onclick="alert('${t.s}')">${t.p}</div>`);
    document.getElementById('step-content').innerHTML = html + `</div><button onclick="location.reload()">Neue Berechnung</button>`;
}

function changeStep(dir) { currentStep += dir; renderStep(); }
renderStep();
