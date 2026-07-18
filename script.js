let currentStep = 1;
const state = {
    vc: 0, // Schnittgeschwindigkeit
    d: 0,  // Durchmesser
    z: 0,  // Schneidenanzahl
    fz: 0  // Vorschub pro Zahn
};

function changeStep(n) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep += n;
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById('currentStep').innerText = currentStep;
    
    // Berechne Ergebnis bei Schritt 4
    if (currentStep === 4) calculate();
}

function calculate() {
    // Formel: n = (vc * 1000) / (PI * D)
    const n = (state.vc * 1000) / (Math.PI * state.d);
    
    // Formel: vf = n * z * fz
    const vf = n * state.z * state.fz;

    document.getElementById('res-n').innerText = Math.round(n);
    document.getElementById('res-vf').innerText = Math.round(vf);
}

// Beispiel: Daten setzen (wird bei Klick auf Kachel aufgerufen)
function selectMaterial(vc) {
    state.vc = vc;
}

function resetApp() {
    location.reload();
}
