/**
 * tests/test_pdf_relay_wrap.js
 * Test de validation pour le retour à la ligne des relais (> 100 relais)
 * dans les exports PDF (generateRelayTableOnlyPdf et generateRacePdf).
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock de l'environnement navigateur
global.window = {};
global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
};
global.currentUserPseudo = 'Romain';
global.saveUserFlag = () => {};

// Mock de jsPDF
class MockJsPdf {
    constructor(options = {}) {
        this.orientation = options.orientation || 'portrait';
        this.pages = [1];
        this.drawnTexts = [];
        this.drawnRects = [];
        this.fontSize = 10;
        this.fontStyle = 'normal';
        global.window.jspdf.lastDoc = this;
    }

    internal = {
        pageSize: {
            getWidth: () => (this.orientation === 'landscape' ? 297 : 210),
            getHeight: () => (this.orientation === 'landscape' ? 210 : 297)
        }
    };

    setFont(name, style) {
        this.fontStyle = style;
    }

    setFontSize(size) {
        this.fontSize = size;
    }

    setTextColor() {}
    setFillColor() {}
    setDrawColor() {}
    setLineWidth() {}
    setProperties() {}
    save(name) { this.savedName = name; }

    getTextWidth(text) {
        // Estimation simple de largeur : ~0.6 * fontSize en mm
        return String(text).length * (this.fontSize * 0.2);
    }

    splitTextToSize(text, maxWidth) {
        const words = String(text).split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const w = this.getTextWidth(testLine);
            if (w > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    roundedRect(x, y, w, h, rx, ry, style) {
        this.drawnRects.push({ x, y, w, h, style });
    }

    rect(x, y, w, h, style) {
        this.drawnRects.push({ x, y, w, h, style });
    }

    line(x1, y1, x2, y2) {}

    text(text, x, y, options) {
        this.drawnTexts.push({ text, x, y, options });
    }

    addPage() {
        this.pages.push(this.pages.length + 1);
    }
}

global.window.jspdf = { jsPDF: MockJsPdf };

// Charger le code source de pdf-generator.js
const pdfGenPath = path.join(__dirname, '..', 'js', 'pdf-generator.js');
eval(fs.readFileSync(pdfGenPath, 'utf8'));

console.log('===============================================================');
console.log('🧪 TEST : RETOUR À LA LIGNE DES NUMÉROS DE RELAIS (> 100 RELAIS)');
console.log('===============================================================');

// 1. Créer une course avec 120 étapes de relais
const laps120 = Array.from({ length: 120 }, (_, i) => ({
    dist: '1.0',
    elev: 10,
    elevNeg: 10,
    time: '00:04:30',
    runner: i % 2 === 0 ? 'Moi' : 'Coéquipier A',
    comment: i === 0 ? 'Premier tour rapide' : ''
}));

const mockRace = {
    id: 'race_relay_120',
    name: '24h Relais 120 Laps',
    terrain: 'relai',
    date: '2026-05-15',
    hour: '10:00:00',
    time: '09:00:00',
    relayLaps: laps120
};

global.races = [mockRace];
global.window.races = [mockRace];

async function runTests() {
    // TEST 1 : generateRelayTableOnlyPdf
    console.log('\n--- Test 1 : generateRelayTableOnlyPdf avec 120 relais ---');
    await global.window.generateRelayTableOnlyPdf('race_relay_120');

    const doc1 = global.window.jspdf.lastDoc;
    assert(doc1, "Le document doc1 doit exister");

    // Les cartes des participants sont dessinées avec roundedRect
    // On doit avoir les cartes des participants plus hautes que 34mm car il y a 60 tours par relayeur !
    const cardRects = doc1.drawnRects.filter(r => r.w > 50 && r.h > 30);
    assert(cardRects.length >= 2, "Au moins 2 cartes de participants doivent être dessinées");
    console.log(`   Dimensions de la carte participant 1 : Largeur = ${cardRects[0].w}mm, Hauteur = ${cardRects[0].h}mm`);
    assert(cardRects[0].h > 34, `La carte doit s'agrandir pour accueillir les lignes (hauteur actuelle: ${cardRects[0].h}mm > 34mm)`);

    // Vérifier les lignes de footer dessinées
    const footerTexts = doc1.drawnTexts.filter(t => typeof t.text === 'string' && (t.text.includes('relais') || /\b\d+[,)]/.test(t.text)));
    assert(footerTexts.length > 2, `Il doit y avoir plusieurs lignes de texte pour les 60 relais (trouvées: ${footerTexts.length})`);
    console.log(`   Nombre de lignes de texte dans les cartes : ${footerTexts.length}`);

    // Vérifier que chaque ligne est centrée dans sa carte
    footerTexts.forEach(t => {
        assert(t.options && t.options.align === 'center', "Chaque ligne de relais doit être alignée au centre");
    });
    console.log('✅ Export generateRelayTableOnlyPdf validé avec cartes adaptées et texte multi-lignes');

    // TEST 2 : generateRacePdf
    console.log('\n--- Test 2 : generateRacePdf avec 120 relais ---');
    await global.window.generateRacePdf('race_relay_120');
    const doc2 = global.window.jspdf.lastDoc;
    assert(doc2, "Le document doc2 doit exister");

    const cardRects2 = doc2.drawnRects.filter(r => r.w > 50 && r.h > 30);
    assert(cardRects2.length >= 2, "Au moins 2 cartes de participants doivent être dessinées dans racePdf");
    assert(cardRects2[0].h > 34, `La carte doit aussi être agrandie dans le PDF complet (hauteur: ${cardRects2[0].h}mm > 34mm)`);
    console.log('✅ Export generateRacePdf validé avec cartes adaptées');

    // TEST 3 : Validation du comportement avec peu de relais (non-régression)
    console.log('\n--- Test 3 : Non-régression avec une course à 2 relais ---');
    const mockRaceSmall = {
        id: 'race_relay_small',
        name: 'Relais Court',
        terrain: 'relai',
        date: '2026-06-01',
        hour: '09:00:00',
        relayLaps: [
            { dist: '5.0', elev: 50, elevNeg: 50, time: '00:25:00', runner: 'Moi' },
            { dist: '5.0', elev: 50, elevNeg: 50, time: '00:26:00', runner: 'Coéquipier B' }
        ]
    };
    global.window.races = [mockRaceSmall];
    await global.window.generateRelayTableOnlyPdf('race_relay_small');
    const doc3 = global.window.jspdf.lastDoc;
    const cardRects3 = doc3.drawnRects.filter(r => r.w > 50 && r.h >= 34);
    assert.strictEqual(cardRects3[0].h, 34, `Pour 1 seul relais, la hauteur doit rester exactement 34mm (actuel: ${cardRects3[0].h}mm)`);
    console.log(`   Hauteur de la carte pour 1 relais : ${cardRects3[0].h}mm (exactement 34mm standard)`);

    console.log('\n===============================================================');
    console.log('🎉 TOUS LES TESTS D\'ASSERTIONS SONT AU VERT !');
    console.log('===============================================================');
}

runTests().catch(err => {
    console.error('❌ Échec du test :', err);
    process.exit(1);
});
