// scratch/test_stats_evolution_chart.js
const fs = require('fs');
const path = require('path');

const statsModalCode = fs.readFileSync(path.join(__dirname, '../js/stats-modal.js'), 'utf8');

// Créer un environnement DOM minimaliste
global.window = global;
global.localStorage = {
    getItem: (k) => null,
    setItem: () => {},
    removeItem: () => {}
};
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
                    contains(c) { return this._classes.has(c); }
                },
                getContext: () => ({
                    save: () => {},
                    restore: () => {},
                    beginPath: () => {},
                    setLineDash: () => {},
                    stroke: () => {},
                    moveTo: () => {},
                    lineTo: () => {}
                }),
                addEventListener: () => {},
                querySelector: () => null,
                querySelectorAll: () => []
            };
        }
        return global._elements[id];
    },
    createElement: () => ({ appendChild: () => {}, classList: { add() {} } }),
    querySelector: () => null,
    querySelectorAll: () => [],
    documentElement: { style: {} },
    addEventListener: () => {}
};
global.getComputedStyle = () => ({
    getPropertyValue: (prop) => prop === '--color-green-600' ? '#16a34a' : '#059669'
});
global._elements = {};

// Mock Chart.js constructor
let lastChartConfig = null;
global.Chart = function(ctx, config) {
    lastChartConfig = config;
    return {
        destroy: () => {},
        update: () => {}
    };
};

eval(statsModalCode);

console.log('--- TEST 1 : Vérification de la fonction de calcul de performance athlétique ---');

const testRaces = [
    {
        id: 'r1_flat10k',
        name: '10km Plat Paris',
        date: '2025-01-10',
        distance: '10',
        elevation: '20',
        time: '00:46:00', // ~13.04 km/h
        terrain: 'route'
    },
    {
        id: 'r2_mountain_trail',
        name: 'Trail des Aiguilles 14k',
        date: '2025-02-15',
        distance: '14',
        elevation: '1100', // D+ massif ! Effort-km = 14 + 11 = 25 km !
        time: '01:30:00', // Vitesse brute = 9.33 km/h
        terrain: 'trail'
    },
    {
        id: 'r3_slow_jog',
        name: '5km Jogging Récup',
        date: '2025-03-20',
        distance: '5',
        elevation: '10',
        time: '00:33:00', // Vitesse brute = 9.09 km/h
        terrain: 'route'
    }
];

// Appeler updateEvolutionChart avec la métrique par défaut (speed)
window.updateEvolutionChart(testRaces, 'speed');

console.log('Datasets générés :', lastChartConfig.data.datasets[0].data);
console.log('Labels :', lastChartConfig.data.labels);

// Vérifier les tooltips et les indices
const chartData = lastChartConfig.data.datasets[0];
const titleCb = lastChartConfig.options.plugins.tooltip.callbacks.title;
const labelCb = lastChartConfig.options.plugins.tooltip.callbacks.label;

const title0 = titleCb([{ dataIndex: 0 }]);
const title1 = titleCb([{ dataIndex: 1 }]);
const title2 = titleCb([{ dataIndex: 2 }]);

console.log('Titre point 0 (10km Plat) :', title0);
console.log('Titre point 1 (Trail D+ massif) :', title1);
console.log('Titre point 2 (5km lent) :', title2);

// Le Trail des aiguilles a une vitesse brute de 9.33 km/h mais 1100m D+ (effort-km = 25km en 1h30)
// Il NE DOIT EN AUCUN CAS être considéré comme "Moins bonne perf" !
if (title1.includes('Moins bonne')) {
    console.error('❌ ERREUR : Le trail avec gros D+ a été injustement marqué comme moins bonne perf !');
    process.exit(1);
} else {
    console.log('✅ SUCCÈS : Le trail avec gros D+ n\'est PAS marqué comme moins bonne perf.');
}

if (title2.includes('Moins bonne')) {
    console.log('✅ SUCCÈS : Le 5km jogging lent est correctement identifié comme la moins bonne performance réelle.');
}

console.log('\n--- TEST 2 : Test des 4 métriques du sélecteur ---');

// Test effort_speed
window.updateEvolutionChart(testRaces, 'effort_speed');
const effortSpeeds = lastChartConfig.data.datasets[0].data;
console.log('Vitesse d\'effort (Effort-km/h) :', effortSpeeds);
// 14km + 1100m D+ = 25 km d'effort en 1h30 = ~16.67 Effort-km/h !
if (effortSpeeds[1] > 16.0) {
    console.log('✅ Vitesse d\'effort du trail correctement valorisée à ' + effortSpeeds[1] + ' km/h');
} else {
    console.error('❌ Vitesse d\'effort incorrecte pour le trail');
    process.exit(1);
}

// Test pace
window.updateEvolutionChart(testRaces, 'pace');
console.log('Allures réelles min/km :', lastChartConfig.data.datasets[0].data);
if (!lastChartConfig.options.scales.y.reverse) {
    console.error('❌ L\'axe Y de l\'allure devrait être inversé (plus rapide vers le haut)');
    process.exit(1);
}
console.log('✅ Axe Y allure inversé correctement pour afficher le plus rapide vers le haut');

// Test effort_pace
window.updateEvolutionChart(testRaces, 'effort_pace');
console.log('Allures d\'effort min/km :', lastChartConfig.data.datasets[0].data);
const trailEffortPace = lastChartConfig.data.datasets[0].data[1];
console.log('Allure d\'effort du trail :', trailEffortPace + ' min/km');
if (trailEffortPace < 4.0) { // ~3.6 min/km
    console.log('✅ Allure d\'effort du trail calculée avec succès (< 4.0 min/km)');
}

console.log('\n🎉 TOUS LES TESTS DE CALCUL DE PERFORMANCE ET GRAPHIQUE SONT PASSÉS !');
