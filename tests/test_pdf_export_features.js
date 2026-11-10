/**
 * tests/test_pdf_export_features.js
 * Test des fonctionnalités d'export PDF :
 * 1. Prix d'achat photo (sous la ligne prix)
 * 2. Tableau des points de passage
 * 3. Distances et dénivelés des coéquipiers en relai triathlon
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

    textWithLink(text, x, y, options) {
        this.drawnTexts.push({ text, x, y, options });
    }

    addPage() {
        this.pages.push(this.pages.length + 1);
    }
}

global.window.jspdf = { jsPDF: MockJsPdf };

// Charger pdf-generator.js
const pdfGenPath = path.join(__dirname, '..', 'js', 'pdf-generator.js');
eval(fs.readFileSync(pdfGenPath, 'utf8'));

console.log('===============================================================');
console.log('🧪 TEST : VALIDATION DES NOUVELLES FONCTIONNALITÉS PDF');
console.log('===============================================================');

async function testPhotoPurchaseAndPassagePoints() {
    console.log('\n--- Test 1 : Achat photo & Points de passage ---');
    const mockRace = {
        id: 'race_test_1',
        name: 'Semi-Marathon de Paris',
        terrain: 'route',
        date: '2026-03-10',
        time: '01:35:00',
        distance: 21.1,
        elevation: 50,
        elevationNeg: 50,
        price: 35.0,
        photoPurchase: true,
        photoPurchasePrice: 14.50,
        rankPos: 150,
        rankTotal: 5000,
        passagePoints: [
            { km: 5, rank: 200, time: '00:23:00' },
            { km: 10, rank: 180, time: '00:46:00' },
            { km: 15, rank: 160, time: '01:08:30' }
        ]
    };

    global.races = [mockRace];
    global.window.races = [mockRace];

    await global.window.generateRacePdf('race_test_1');
    const doc = global.window.jspdf.lastDoc;
    assert(doc, "Le document doit être généré");

    // 1. Vérification Prix et Achat Photo
    const texts = doc.drawnTexts.map(t => String(t.text));
    const prixIdx = texts.indexOf('Prix');
    assert(prixIdx !== -1, "La ligne Prix doit être présente");
    const photoIdx = texts.indexOf('Achat photo');
    assert(photoIdx !== -1, "La ligne Achat photo doit être présente");
    assert(photoIdx > prixIdx, "Achat photo doit être positionné après Prix");
    assert(texts.includes('14.50 €'), "Le prix de la photo 14.50 € doit être présent");
    console.log('   ✅ Ligne Achat photo (14.50 €) ajoutée sous la ligne Prix');

    // 2. Vérification Points de passage
    assert(texts.includes('Points de passage'), "Le titre Points de passage doit être présent");
    assert(texts.includes('Point de passage'), "L'en-tête Point de passage doit être présent");
    assert(texts.includes('Évolution (vs arrivée)'), "L'en-tête Évolution doit être présent");
    assert(texts.includes('5 km') && texts.includes('10 km') && texts.includes('15 km'), "Les distances des points de passage doivent être présentes");
    assert(texts.includes('200e / 5000'), "Le rang du point de passage doit être formaté");
    // Place difference: 200 - 150 = 50 places gagnées
    const evolFound = texts.some(t => t.includes('+50 pl. (gagnées)'));
    assert(evolFound, "L'évolution de place (+50) doit être calculée");
    console.log('   ✅ Tableau des points de passage affiché avec rang, temps et évolution');
}

async function testTriathlonRelayTeammates() {
    console.log('\n--- Test 2 : Relai Triathlon avec coéquipiers ---');
    const mockTriathlonRelay = {
        id: 'tri_relay_1',
        name: 'Triathlon de Deauville Relais',
        terrain: 'triathlon',
        raceFormat: 'team',
        raceRelaySport: 'run', // L'utilisateur court
        date: '2026-06-20',
        time: '02:45:00', // Temps total
        // User (Run)
        distance: 10.0,
        runTime: '00:45:00',
        runElevation: 80,
        runElevationNeg: 80,
        // Teammates (Swim & Bike)
        swimDistance: 1500,
        swimTime: '00:30:00',
        bikeDistance: 40.0,
        bikeTime: '01:30:00',
        bikeElevation: 450,
        bikeElevationNeg: 450,
        price: 90.0,
        photoPurchase: true,
        photoPurchasePrice: 20.0
    };

    global.races = [mockTriathlonRelay];
    global.window.races = [mockTriathlonRelay];

    await global.window.generateRacePdf('tri_relay_1');
    const doc = global.window.jspdf.lastDoc;
    assert(doc, "Le document triathlon doit être généré");

    const texts = doc.drawnTexts.map(t => String(t.text));

    // 1. Tableau "Épreuves de l'équipe (Relais)"
    assert(texts.includes("Épreuves de l'équipe (Relais)"), "Le titre Épreuves de l'équipe (Relais) doit être présent");
    assert(texts.includes('Total Équipe'), "La ligne Total Équipe doit être présente");

    // 2. Vérification des distances et dénivelés des coéquipiers
    // Vélo coéquipier : 40 km, D+ 450m
    assert(texts.includes('40 km') || texts.some(t => t.includes('40')), "La distance vélo du coéquipier (40 km) doit être présente");
    assert(texts.some(t => t.includes('450m') || t.includes('D+ 450m')), "Le dénivelé vélo du coéquipier (+450m) doit être présent");
    
    // Natation coéquipier : 1.50 km ou 1500 m
    assert(texts.includes('1.50 km') || texts.includes('1500 m'), "La distance natation du coéquipier doit être présente");

    // Course à pied utilisateur : 10 km, D+ 80m
    assert(texts.includes('10 km'), "La distance course à pied de l'utilisateur doit être présente");

    // 3. Badges et cartes
    assert(texts.includes('COÉQUIPIER'), "Le badge COÉQUIPIER doit être présent pour les sports des coéquipiers");
    assert(texts.includes('MOI'), "Le badge MOI doit être présent pour le sport de l'utilisateur");
    assert(texts.includes('Natation (Coéquipier)'), "La carte Natation (Coéquipier) doit être présente");
    assert(texts.includes('Cyclisme (Coéquipier)'), "La carte Cyclisme (Coéquipier) doit être présente");
    assert(texts.includes('Course à pied (Moi)'), "La carte Course à pied (Moi) doit être présente");

    // 4. Totaux d'équipe
    // Total distance = 1.5 + 40 + 10 = 51.50 km
    assert(texts.some(t => t.includes('51.50 km') || t.includes('51.5 km')), "La distance totale de l'équipe (51.50 km) doit être présente");
    // Total D+ = 450 + 80 = 530m
    assert(texts.some(t => t.includes('530m')), "Le D+ total de l'équipe (+530m) doit être présent");

    console.log("   ✅ Tableau Épreuves de l'équipe (Relais) présent avec totaux d'équipe");
    console.log("   ✅ Distances & dénivelés des coéquipiers (Vélo 40km +450m, Natation 1.50km) présents");
    console.log("   ✅ Cartes individuelles complètes avec badges MOI et COÉQUIPIER");
}

async function runAllTests() {
    try {
        await testPhotoPurchaseAndPassagePoints();
        await testTriathlonRelayTeammates();
        console.log('\n===============================================================');
        console.log('🎉 TOUS LES TESTS DES NOUVEAUX EXPORTS PDF SONT VALIDÉS !');
        console.log('===============================================================');
    } catch (err) {
        console.error('❌ Échec des tests :', err);
        process.exit(1);
    }
}

runAllTests();

