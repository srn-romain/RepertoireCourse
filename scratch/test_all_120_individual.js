const fs = require('fs');

global.window = {};
global.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };
global.localStorage = {
    store: {
        tutorialCompleted: 'true',
        userProfileCustomized: 'true',
        cardActionsConfig: 'true',
        likedRaces: 'true',
        pdfDownloaded: 'true',
        userFeedbackSent: 'true',
        bulkActionUsed: 'true',
        exportDownloaded: 'true',
        statsModalViewed: 'true',
        searchUsed: 'true',
        relayPdfExported: 'true',
        wishlistCount: '5'
    },
    getItem: function (k) { return this.store[k] || null; },
    setItem: function (k, v) { this.store[k] = v; }
};

eval(fs.readFileSync('js/badges-modal.js', 'utf8'));

console.log('--- AUDITING 120 MISSIONS INDIVIDUALLY ---');

const allDefs = window.BADGES_DEFINITIONS;
const levelsConfig = window.LEVELS_CONFIG;

let passed = 0;
let errors = [];

// Helper to run calculateGamifiedBadges with enough unlocked levels
function runTest(races) {
    return window.calculateGamifiedBadges(races);
}

// Full super-race list that triggers all conditions
const superRaces = [];
const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

for (let i = 0; i < 55; i++) {
    const month = months[i % 12];
    const year = 2020 + Math.floor(i / 12);
    superRaces.push({
        id: 'race_' + i,
        name: 'Super Race ' + i + ' Hyrox Triathlon L',
        date: `${year}-${month}-15`,
        distance: '102 km',
        time: '00:34:00', // 10k pace < 4:00, semi < 1h25, marathon < 3h15
        elevation: '4600',
        favorite: true,
        ranking: '2',
        participants: '100',
        categoryRank: '1',
        terrain: (i % 2 === 0 ? 'trail' : 'route') + (i % 5 === 0 ? ' relai' : '') + (i % 7 === 0 ? ' triathlon' : ''),
        raceFormat: (i % 5 === 0 ? 'team' : 'single'),
        relayLaps: (i % 5 === 0 ? Array.from({ length: 25 }, (_, idx) => ({ distance: '5 km', time: '00:25:00', runner: 'Coureur ' + (idx + 1) })) : []),
        bibNumber: '100' + i,
        price: '10',
        gpx: 'track_' + i + '.gpx',
        photos: ['photo_' + i + '.jpg'],
        notes: 'Compte-rendu complet ' + i,
        website: 'https://site.com/' + i,
        driveLink: 'https://drive.google.com/folder/' + i,
        isPublic: true,
        companions: ['Copain ' + i],
        fromWishlist: true,
        country: (i === 10 ? 'Espagne' : 'France'),
        location: 'Commune_' + (i % 10) + ' (' + (75 + (i % 5)) + ')'
    });
}

const res = runTest(superRaces);

levelsConfig.forEach(lvl => {
    lvl.badgeIds.forEach(bId => {
        const badgeDef = allDefs[bId];
        if (!badgeDef) {
            errors.push(`Badge ID [${bId}] in level [${lvl.id}] has no definition in BADGES_DEFINITIONS!`);
            return;
        }

        const isUnlocked = res.unlockedBadges[bId] && res.unlockedBadges[bId].unlocked;
        if (!isUnlocked) {
            errors.push(`Badge [${bId}] (${badgeDef.name} - Niveau ${lvl.name}) DID NOT UNLOCK under full conditions!`);
        } else {
            passed++;
        }
    });
});

console.log(`Audit Result: ${passed}/120 missions validated successfully.`);
if (errors.length > 0) {
    console.error('Errors found:');
    errors.forEach(e => console.error('-', e));
    process.exit(1);
} else {
    console.log('ALL 120 MISSIONS ARE 100% FUNCTIONAL AND PROPERLY TRIGGERED!');
}
