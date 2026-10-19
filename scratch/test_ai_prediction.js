// scratch/test_ai_prediction.js
const fs = require('fs');
const path = require('path');

const raceDetailsCode = fs.readFileSync(path.join(__dirname, '../js/race-details-modal.js'), 'utf8');

// Créer un environnement DOM minimaliste
global.window = global;
global.localStorage = { getItem: (k) => global._storage[k] || null, setItem: (k, v) => { global._storage[k] = v; }, removeItem: (k) => delete global._storage[k] };
global._storage = {};
global.navigator = { userAgent: 'node' };
global.location = { pathname: '/dashboard.html' };
global.document = {
    readyState: 'complete',
    getElementById: function(id) {
        if (!global._elements[id]) {
            global._elements[id] = {
                id,
                innerHTML: '',
                textContent: '',
                className: '',
                classList: {
                    _classes: new Set(),
                    add(c) { this._classes.add(c); },
                    remove(c) { this._classes.delete(c); },
                    contains(c) { return this._classes.has(c); },
                    replace(o, n) { this._classes.delete(o); this._classes.add(n); }
                },
                style: {},
                parentElement: null,
                parentNode: null,
                appendChild: () => {},
                removeChild: () => {},
                remove: () => {},
                querySelector: () => null,
                querySelectorAll: () => []
            };
        }
        return global._elements[id];
    },
    createElement: function(tag) {
        return {
            tagName: tag,
            innerHTML: '',
            textContent: '',
            classList: { add() {}, remove() {}, contains() { return false; } },
            appendChild() {},
            querySelector: () => null,
            querySelectorAll: () => []
        };
    },
    createTextNode: function(text) {
        return { textContent: text };
    },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    body: { appendChild() {} },
    addEventListener: function() {},
    removeEventListener: function() {}
};
global._elements = {};

eval(raceDetailsCode);

console.log('--- TEST 1 : Vérification de la disponibilité de showRaceDetails ---');
if (typeof window.showRaceDetails === 'function') {
    console.log('✅ window.showRaceDetails est bien défini');
} else {
    console.error('❌ window.showRaceDetails manquant');
    process.exit(1);
}

const fourRaces = [
    { id: 'r1', name: '10km Paris', date: '2025-01-10', distance: '10', time: '00:45:00', terrain: 'route', elevation: '20' },
    { id: 'r2', name: '10km Lyon', date: '2025-02-10', distance: '10', time: '00:44:30', terrain: 'route', elevation: '30' },
    { id: 'r3', name: 'Semi Bordeaux', date: '2025-03-10', distance: '21.1', time: '01:42:00', terrain: 'route', elevation: '50' },
    { id: 'r4', name: 'Trail 15k', date: '2025-04-10', distance: '15', time: '01:25:00', terrain: 'trail', elevation: '450' }
];

const upcomingRace = {
    id: 'up1',
    name: '10km à venir',
    date: '2026-11-20',
    distance: '10',
    time: '',
    terrain: 'route',
    elevation: '20'
};

console.log('\n--- TEST 2 : Utilisateur avec moins de 5 courses (< 5) ---');
window.allUserRaces = [...fourRaces, upcomingRace];
window.showRaceDetails(upcomingRace);

const predSection = global.document.getElementById('aiPredictionSection');
const timeEl = global.document.getElementById('detailsTime');

console.log('Affichage carré Temps :', timeEl.textContent);
console.log('Section prédiction cachée ?', predSection.classList.contains('hidden'));
console.log('Contenu section prédiction :', predSection.innerHTML);

if (predSection.classList.contains('hidden') && predSection.innerHTML === '') {
    console.log('✅ Aucune prédiction affichée avec 4 courses');
} else {
    console.error('❌ La prédiction ne devrait PAS s\'afficher pour moins de 5 courses !');
    process.exit(1);
}

const sixRaces = [
    { id: 'r1', name: '10km Paris', date: '2025-01-10', distance: '10', time: '00:45:00', terrain: 'route', elevation: '20' },
    { id: 'r2', name: '10km Lyon', date: '2025-02-10', distance: '10', time: '00:44:30', terrain: 'route', elevation: '30' },
    { id: 'r3', name: 'Semi Bordeaux', date: '2025-03-10', distance: '21.1', time: '01:42:00', terrain: 'route', elevation: '50' },
    { id: 'r4', name: 'Trail 15k', date: '2025-04-10', distance: '15', time: '01:25:00', terrain: 'trail', elevation: '450' },
    { id: 'r5', name: '10km Lille', date: '2025-05-10', distance: '10', time: '00:44:00', terrain: 'route', elevation: '15' },
    { id: 'r6', name: 'Relai Ekiden 5k', date: '2025-06-10', distance: '5', time: '00:21:00', terrain: 'relai', elevation: '10' }
];

console.log('\n--- TEST 3 : Course à venir ROUTE (10km) avec thème VERT (Défaut) ---');
window.currentThemeColor = 'green';
window.allUserRaces = [...sixRaces, upcomingRace];
window.showRaceDetails(upcomingRace);

console.log('Affichage carré Temps :', timeEl.textContent);
console.log('Section prédiction visible ?', !predSection.classList.contains('hidden'));
console.log('Palette utilisée avec thème vert :', predSection.innerHTML.includes('bg-purple-50') ? 'Purple (Contrastante)' : 'Autre');

if (!predSection.classList.contains('hidden') && predSection.innerHTML.includes('Prédiction IA de la course') && predSection.innerHTML.includes('bg-purple-50')) {
    console.log('✅ Fenêtre propre de prédiction IA affichée avec succès (couleur contrastante purple)');
} else {
    console.error('❌ Problème dans la fenêtre de prédiction IA pour thème vert');
    process.exit(1);
}

console.log('\n--- TEST 4 : Adaptation de couleur si l\'utilisateur a choisi le thème PURPLE ---');
window.currentThemeColor = 'purple';
window.showRaceDetails(upcomingRace);

console.log('Palette utilisée avec thème purple :', predSection.innerHTML.includes('bg-amber-50') ? 'Amber/Or (Contrastante)' : 'Autre');

if (predSection.innerHTML.includes('bg-amber-50')) {
    console.log('✅ La couleur s\'adapte automatiquement pour toujours être différente du thème utilisateur !');
} else {
    console.error('❌ La couleur n\'a pas basculé sur amber pour un thème purple');
    process.exit(1);
}

console.log('\n--- TEST 4b : Adaptation de couleur pour thème BLEU (Amber) et AMBRE (Purple) ---');
window.currentThemeColor = 'blue';
window.showRaceDetails(upcomingRace);
if (!predSection.innerHTML.includes('bg-amber-50')) {
    console.error('❌ Le thème bleu devrait utiliser amber');
    process.exit(1);
}
console.log('✅ Thème bleu -> utilise ambre');

window.currentThemeColor = 'amber';
window.showRaceDetails(upcomingRace);
if (!predSection.innerHTML.includes('bg-purple-50')) {
    console.error('❌ Le thème ambre devrait utiliser purple');
    process.exit(1);
}
console.log('✅ Thème ambre -> utilise violet/purple');

console.log('\n--- TEST 5 : Course terminée (avec chrono réel) -> Fenêtre de prédiction cachée ---');
const finishedRace = {
    id: 'r1',
    name: '10km Paris (Terminé)',
    date: '2025-01-10',
    distance: '10',
    time: '00:45:00',
    terrain: 'route',
    elevation: '20'
};
window.showRaceDetails(finishedRace);
console.log('Carré Temps :', timeEl.textContent);
console.log('Fenêtre prédiction cachée ?', predSection.classList.contains('hidden'));

if (predSection.classList.contains('hidden') && predSection.innerHTML === '') {
    console.log('✅ Fenêtre de prédiction cachée sur course terminée');
} else {
    console.error('❌ La fenêtre de prédiction ne devrait pas être visible sur une course terminée');
    process.exit(1);
}

console.log('\n🎉 TOUS LES TESTS DE LA NOUVELLE FENÊTRE SONT PASSÉS AVEC SUCCÈS !');
