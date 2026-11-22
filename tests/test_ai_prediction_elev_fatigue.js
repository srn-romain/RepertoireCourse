const assert = require('assert');
const fs = require('fs');
const path = require('path');

const raceDetailsCode = fs.readFileSync(path.join(__dirname, '../js/race-details-modal.js'), 'utf8');

function createMockElement(id = '') {
    return {
        id,
        innerHTML: '',
        textContent: '',
        className: '',
        classList: {
            _classes: new Set(),
            add(c) { this._classes.add(c); },
            remove(c) { this._classes.delete(c); },
            contains(c) { return this._classes.has(c); },
            replace(o, n) { this._classes.delete(o); this._classes.add(n); },
            toggle(c, force) {
                if (force === undefined) {
                    if (this._classes.has(c)) { this._classes.delete(c); return false; }
                    this._classes.add(c); return true;
                }
                if (force) { this._classes.add(c); return true; }
                this._classes.delete(c); return false;
            }
        },
        style: {},
        dataset: {},
        parentElement: null,
        parentNode: null,
        appendChild: () => {},
        removeChild: () => {},
        remove: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
    };
}

global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.navigator = { userAgent: 'node' };
global.location = { pathname: '/dashboard.html' };
global._elements = {};
global.document = {
    readyState: 'complete',
    getElementById(id) {
        if (!global._elements[id]) global._elements[id] = createMockElement(id);
        return global._elements[id];
    },
    createElement: (tag) => createMockElement(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { appendChild() {} },
    addEventListener: () => {},
    removeEventListener: () => {}
};

eval(raceDetailsCode);

const baseRaces = [
    { id: 'r1', name: '10km 1', date: '2025-01-10', distance: '10', time: '00:45:00', terrain: 'route', elevation: '20', elevationNeg: '20' },
    { id: 'r2', name: '10km 2', date: '2025-02-10', distance: '10', time: '00:45:00', terrain: 'route', elevation: '20', elevationNeg: '20' },
    { id: 'r3', name: 'Semi 1', date: '2025-03-10', distance: '21.1', time: '01:40:00', terrain: 'route', elevation: '50', elevationNeg: '50' },
    { id: 'r4', name: '10km 3', date: '2025-04-10', distance: '10', time: '00:45:00', terrain: 'route', elevation: '20', elevationNeg: '20' },
    { id: 'r5', name: 'Trail 20k', date: '2025-05-10', distance: '20', time: '02:10:00', terrain: 'trail', elevation: '800', elevationNeg: '800' }
];

function getPredictionFor(targetRace, races = baseRaces) {
    global.window.allUserRaces = [...races, targetRace];
    global.window.showRaceDetails(targetRace);
    const html = global.document.getElementById('aiPredictionSection').innerHTML;
    const match = html.match(/Temps estimé :<\/span>\s*<span[^>]*>([^<]+)<\/span>/);
    assert(match, `Prediction HTML should contain Temps estimé for ${targetRace.name}`);
    const t = match[1].trim();
    let sec = 0;
    if (t.includes('h')) {
        const parts = t.match(/(\d+)h(\d+)'(\d+)"/);
        sec = parseInt(parts[1]) * 3600 + parseInt(parts[2]) * 60 + parseInt(parts[3]);
    } else {
        const parts = t.match(/(\d+)'(\d+)"/);
        sec = parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return { sec, html };
}

// 1. Road downhill vs flat
const flat10k = getPredictionFor({ id: 't1', name: '10k Plat', date: '2026-12-20', distance: '10', time: '', terrain: 'route', elevation: '0', elevationNeg: '0' });
const downhill10k = getPredictionFor({ id: 't2', name: '10k Descente', date: '2026-12-20', distance: '10', time: '', terrain: 'route', elevation: '0', elevationNeg: '300' });
assert(downhill10k.sec < flat10k.sec, `Downhill 10k (${downhill10k.sec}s) should be faster than flat 10k (${flat10k.sec}s)`);
assert(!downhill10k.html.includes('• Distance :'), 'Footer should only keep "Basé sur vos XX courses passées"');

// 2. Steep trail descent adds fatigue vs 0 D-
const trailNoDNeg = getPredictionFor({ id: 't3', name: 'Trail 20k sans D-', date: '2026-12-20', distance: '20', time: '', terrain: 'trail', elevation: '1000', elevationNeg: '0' });
const trailSteepDNeg = getPredictionFor({ id: 't4', name: 'Trail 20k gros D-', date: '2026-12-20', distance: '20', time: '', terrain: 'trail', elevation: '1000', elevationNeg: '1500' });
assert(trailSteepDNeg.sec > trailNoDNeg.sec, `Steep trail D- (${trailSteepDNeg.sec}s) should be slower than 0 D- (${trailNoDNeg.sec}s)`);

// 3. Marathon vs 2x Semi
const semiPred = getPredictionFor({ id: 't5', name: 'Semi cible', date: '2026-12-20', distance: '21.0975', time: '', terrain: 'route', elevation: '0', elevationNeg: '0' });
const marathonPred = getPredictionFor({ id: 't6', name: 'Marathon cible', date: '2026-12-20', distance: '42.195', time: '', terrain: 'route', elevation: '0', elevationNeg: '0' });
assert(marathonPred.sec > semiPred.sec * 2.08, `Marathon (${marathonPred.sec}s) must be significantly slower than 2x Semi (${semiPred.sec * 2}s)`);

// 4. Residual fatigue if a heavy race was run 4 days earlier
const marathonWithRecentSemi = getPredictionFor({ id: 't7', name: 'Marathon fatigué', date: '2025-03-14', distance: '42.195', time: '', terrain: 'route', elevation: '0', elevationNeg: '0' });
assert(marathonWithRecentSemi.sec > marathonPred.sec, `Marathon 4 days after a semi (${marathonWithRecentSemi.sec}s) should be slower than rested (${marathonPred.sec}s)`);

// 5. DNF exclusion
const racesWithDnf = [
    ...baseRaces,
    { id: 'r_dnf', name: 'Abandon très lent', date: '2025-06-01', distance: '42.2', time: '06:00:00', terrain: 'route', dnf: true }
];
const flatWithDnf = getPredictionFor({ id: 't8', name: '10k Plat', date: '2026-12-20', distance: '10', time: '', terrain: 'route', elevation: '0', elevationNeg: '0' }, racesWithDnf);
assert.strictEqual(flatWithDnf.sec, flat10k.sec, 'DNF race should be completely excluded from prediction');
assert(flatWithDnf.html.includes('5 courses passées'), 'Based on count should remain 5');

console.log('✅ All AI prediction D- and fatigue unit tests passed!');
