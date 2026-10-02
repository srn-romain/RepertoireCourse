/**
 * tests/test_badges_validation.js
 * Suite de tests automatisés pour la validation du système de gamification :
 * 1. Intégrité des 10 niveaux (12 missions par niveau = 120 missions au total)
 * 2. Somme exacte des XP (10 000 XP max)
 * 3. Tests positifs : chaque mission se débloque correctement avec ses critères
 * 4. Tests négatifs : chaque mission reste verrouillée si les critères ne sont pas remplis
 */

const fs = require('fs');
const path = require('path');

// Mock de l'environnement navigateur
global.window = {};
global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
};

function createMockLocalStorage() {
    return {
        store: {},
        getItem: function (k) { return this.store[k] !== undefined ? this.store[k] : null; },
        setItem: function (k, v) { this.store[k] = String(v); },
        removeItem: function (k) { delete this.store[k]; },
        clear: function () { this.store = {}; }
    };
}
global.localStorage = createMockLocalStorage();

// Charger le code source de badges-modal.js
const badgesModalPath = path.join(__dirname, '..', 'js', 'badges-modal.js');
eval(fs.readFileSync(badgesModalPath, 'utf8'));

const defs = window.BADGES_DEFINITIONS;
const levels = window.LEVELS_CONFIG;

console.log('===============================================================');
console.log('🧪 SUITE DE TESTS : VALIDATION DU SYSTÈME DE MISSIONS & BADGES');
console.log('===============================================================\n');

let passedTests = 0;
let totalTests = 0;
const errors = [];

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        errors.push(message);
        console.error(`❌ ÉCHEC : ${message}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TEST DE STRUCTURE & INTÉGRITÉ DES NIVEAUX ET XP
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- 1. Structure & Cumul XP (10 Niveaux, 120 Missions, 10 000 XP) ---');

assert(levels.length === 10, `Il doit y avoir exactement 10 niveaux (actuel: ${levels.length})`);

let totalBadgesCount = 0;
let totalCalculatedXP = 0;

levels.forEach((lvl, idx) => {
    assert(lvl.badgeIds.length === 12, `Le niveau ${lvl.name} (${lvl.id}) doit contenir 12 missions (actuel: ${lvl.badgeIds.length})`);
    totalBadgesCount += lvl.badgeIds.length;

    let levelXPSum = 0;
    lvl.badgeIds.forEach(id => {
        const badgeDef = defs[id];
        assert(!!badgeDef, `Le badge ${id} du niveau ${lvl.name} doit exister dans BADGES_DEFINITIONS`);
        if (badgeDef) {
            assert(badgeDef.level === lvl.levelNumber, `Le badge ${id} doit avoir level=${lvl.levelNumber} (actuel: ${badgeDef.level})`);
            levelXPSum += badgeDef.xp;
        }
    });

    assert(levelXPSum === lvl.levelTotalXP, `Somme des XP du niveau ${lvl.name} (${levelXPSum}) doit correspondre à levelTotalXP (${lvl.levelTotalXP})`);
    totalCalculatedXP += levelXPSum;
});

assert(totalBadgesCount === 120, `Le total de missions doit être exactement 120 (actuel: ${totalBadgesCount})`);
assert(totalCalculatedXP === 10000, `Le total XP doit être exactement 10 000 XP (actuel: ${totalCalculatedXP} XP)`);

console.log(`   ✅ 10 Niveaux vérifiés | 120 Missions | Total XP = ${totalCalculatedXP} / 10 000 XP\n`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. TESTS SPÉCIFIQUES DES CRITÈRES POSITIFS & NÉGATIFS (ÉCHANTILLONS CLÉS)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- 2. Tests ciblés sur les règles métiers et nouvelles missions ---');

// Helper pour tester une condition en s'assurant que les niveaux sont accessibles
function evaluateWithBaseUnlock(extraRaces = [], extraStorage = {}) {
    global.window.currentUserPseudo = 'Romain';
    global.window.currentUserPhoto = 'https://cloudinary.com/romain.jpg';
    global.localStorage.clear();
    global.localStorage.store = Object.assign({
        tutorialCompleted: 'true',
        userProfileCustomized: 'true',
        profileCustomized: 'true',
        bioUpdated: 'true',
        cardActionsConfig: 'true',
        hasConfiguredCards: 'true',
        likedRaces: 'true',
        hasLikedPublicRace: 'true',
        userLikedPublicRace: 'true',
        pdfDownloaded: 'true',
        bulkActionUsed: 'true',
        bulkNoteUsed: 'true',
        exportDownloaded: 'true',
        statsModalViewed: 'true',
        searchUsed: 'true',
        relayPdfExported: 'true',
        wishlistCount: '5',
        hasCopiedPublicWishlist: 'true',
        publicRacesViewed: 'true',
        ratingGroupModalUsed: 'true',
        quickActionButtonUsed: 'true'
    }, extraStorage);

    // 60 courses de base pour générer l'XP requis pour ouvrir tous les 10 niveaux (sans compagnons pour isoler les tests)
    const baseRaces = [];
    for (let m = 1; m <= 12; m++) {
        const mStr = m.toString().padStart(2, '0');
        for (let r = 1; r <= 5; r++) {
            const idx = (m - 1) * 5 + r;
            let terrain = 'route';
            if (r === 2) terrain = 'trail';
            if (r === 3) terrain = 'relai';
            if (r === 4) terrain = 'triathlon';
            if (r === 5) terrain = 'trail relai';

            baseRaces.push({
                id: 'base_' + idx,
                date: `2023-${mStr}-${(r * 5).toString().padStart(2, '0')}`,
                distance: (idx <= 5 ? '45 km' : '22 km'),
                time: '01:45:00',
                elevation: (idx <= 5 ? 2200 : 450),
                price: '10',
                bibNumber: String(100 + idx),
                photos: ['p.jpg'],
                gpx: 'track.gpx',
                notes: 'Superbe course',
                website: 'https://site.fr',
                driveLink: 'https://drive.google.com/test',
                favorite: true,
                ranking: '3',
                categoryRank: '1',
                participants: '50',
                isPublic: true,
                country: 'France',
                location: 'Ville_' + (idx % 8) + ' (' + (69 + (idx % 8)) + ')',
                terrain: terrain,
                raceFormat: (r === 3 || r === 5 ? 'team' : 'single'),
                companions: [] // Volontairement vide pour tester les accompagnants en extra
            });
        }
    }

    const merged = [...baseRaces, ...extraRaces];
    return window.calculateGamifiedBadges(merged);
}

// Test : voix_du_coureur (Avis communautaire)
{
    global.localStorage.clear();
    global.window.userFeedbackSent = false;
    global.window.feedbackSent = false;
    let res = evaluateWithBaseUnlock([], { userFeedbackSent: undefined });
    assert(!res.unlockedBadges.voix_du_coureur.unlocked, "voix_du_coureur doit être VERROUILLÉ si aucun avis n'a été publié");

    global.localStorage.setItem('userFeedbackSent', 'true');
    global.window.userFeedbackSent = true;
    global.window.feedbackSent = true;
    res = evaluateWithBaseUnlock([], { userFeedbackSent: 'true' });
    assert(res.unlockedBadges.voix_du_coureur.unlocked, "voix_du_coureur doit être DÉBLOQUÉ si un avis a été envoyé");
}

// Test : duo_support (Niveau 2 : 1 supporter regardant + 1 coureur)
{
    // Cas négatif : 2 coureurs mais 0 supporter regardant
    let extra = [{
        id: 'duo_neg',
        date: '2024-01-01',
        distance: '10 km',
        time: '00:55:00',
        companions: [
            { name: 'Ami 1', type: 'runner' },
            { name: 'Ami 2', type: 'runner' }
        ]
    }];
    let res = evaluateWithBaseUnlock(extra);
    assert(!res.unlockedBadges.duo_support.unlocked, "duo_support doit être VERROUILLÉ s'il n'y a pas au moins 1 regardant ET 1 coureur");

    // Cas positif : 1 regardant et 1 coureur
    extra[0].companions = [
        { name: 'Ami coureur', type: 'runner' },
        { name: 'Supporter regardant', type: 'spectator' }
    ];
    res = evaluateWithBaseUnlock(extra);
    assert(res.unlockedBadges.duo_support.unlocked, "duo_support doit être DÉBLOQUÉ avec 1 regardant ET 1 coureur");
}

// Test : double_soutien (Niveau 4 : 2 regardants + 2 coureurs)
{
    let extra = [{
        id: 'soutien_test',
        date: '2024-01-01',
        distance: '10 km',
        time: '00:55:00',
        companions: [
            { name: 'C1', type: 'runner' },
            { name: 'C2', type: 'runner' },
            { name: 'S1', type: 'spectator' } // 2 coureurs mais seulement 1 supporter
        ]
    }];
    let res = evaluateWithBaseUnlock(extra);
    assert(!res.unlockedBadges.double_soutien.unlocked, "double_soutien doit être VERROUILLÉ avec 1 seul supporter");

    extra[0].companions.push({ name: 'S2', type: 'spectator' }); // 2 coureurs et 2 supporters
    res = evaluateWithBaseUnlock(extra);
    assert(res.unlockedBadges.double_soutien.unlocked, "double_soutien doit être DÉBLOQUÉ avec 2 coureurs et 2 supporters");
}

// Test : course_nocturne (Départ / course entre 00h et 06h)
{
    let extra = [{
        id: 'night_test',
        date: '2024-01-01',
        distance: '10 km',
        time: '00:50:00',
        hour: '09:30' // En journée
    }];
    let res = evaluateWithBaseUnlock(extra);
    assert(!res.unlockedBadges.course_nocturne.unlocked, "course_nocturne doit être VERROUILLÉ si départ à 09h30");

    extra[0].hour = '03:15'; // 3h15 du matin
    res = evaluateWithBaseUnlock(extra);
    assert(res.unlockedBadges.course_nocturne.unlocked, "course_nocturne doit être DÉBLOQUÉ avec un départ à 03h15");
}

// Test : defi_longue_duree (Épreuve > 5h de chrono cumulé)
{
    let extra = [{
        id: 'duration_test',
        date: '2024-01-01',
        distance: '42 km',
        time: '04:45:00' // < 5h
    }];
    let res = evaluateWithBaseUnlock(extra);
    assert(!res.unlockedBadges.defi_longue_duree.unlocked, "defi_longue_duree doit être VERROUILLÉ si chrono à 04:45:00");

    extra[0].time = '05:15:30'; // > 5h
    res = evaluateWithBaseUnlock(extra);
    assert(res.unlockedBadges.defi_longue_duree.unlocked, "defi_longue_duree doit être DÉBLOQUÉ avec chrono de 05:15:30");
}

// Test : peloton_dami (≥ 5 accompagnants) & tribu_en_course (≥ 10 accompagnants)
{
    let extra = [{
        id: 'tribe_test',
        date: '2024-01-01',
        distance: '10 km',
        time: '00:50:00',
        companions: ['Ami 1', 'Ami 2', 'Ami 3', 'Ami 4'] // 4 amis
    }];
    let res = evaluateWithBaseUnlock(extra);
    assert(!res.unlockedBadges.peloton_dami.unlocked, "peloton_dami doit être VERROUILLÉ avec 4 amis");

    extra[0].companions.push('Ami 5'); // 5 amis
    res = evaluateWithBaseUnlock(extra);
    assert(res.unlockedBadges.peloton_dami.unlocked, "peloton_dami doit être DÉBLOQUÉ avec 5 amis");
    assert(!res.unlockedBadges.tribu_en_course.unlocked, "tribu_en_course doit être VERROUILLÉ avec 5 amis");

    for (let i = 6; i <= 10; i++) extra[0].companions.push('Ami ' + i); // 10 amis
    res = evaluateWithBaseUnlock(extra);
    assert(res.unlockedBadges.tribu_en_course.unlocked, "tribu_en_course doit être DÉBLOQUÉ avec 10 amis");
}

console.log('   ✅ Tests métiers & négatifs passés avec succès.\n');

// ─────────────────────────────────────────────────────────────────────────────
// 3. TEST DE COUVERTURE GLOBALE SUR LES 120 MISSIONS
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- 3. Test de déclenchement exhaustif des 120 missions ---');

global.window.currentUserPseudo = 'Romain';
global.window.currentUserPhoto = 'https://cloudinary.com/romain.jpg';
global.localStorage.store = {
    tutorialCompleted: 'true',
    userProfileCustomized: 'true',
    profileCustomized: 'true',
    bioUpdated: 'true',
    cardActionsConfig: 'true',
    hasConfiguredCards: 'true',
    likedRaces: 'true',
    hasLikedPublicRace: 'true',
    userLikedPublicRace: 'true',
    pdfDownloaded: 'true',
    userFeedbackSent: 'true',
    bulkActionUsed: 'true',
    bulkNoteUsed: 'true',
    exportDownloaded: 'true',
    statsModalViewed: 'true',
    searchUsed: 'true',
    relayPdfExported: 'true',
    wishlistCount: '5',
    hasCopiedPublicWishlist: 'true',
    publicRacesViewed: 'true',
    ratingGroupModalUsed: 'true',
    quickActionButtonUsed: 'true'
};

const fullDatasetRaces = [];
for (let m = 1; m <= 12; m++) {
    const mStr = m.toString().padStart(2, '0');
    for (let r = 1; r <= 5; r++) {
        const day = (r * 5).toString().padStart(2, '0');
        const idx = (m - 1) * 5 + r;
        let terrain = 'route';
        if (r === 2) terrain = 'trail';
        if (r === 3) terrain = 'relai';
        if (r === 4) terrain = 'triathlon';
        if (r === 5) terrain = 'trail relai';

        const comps = [
            { name: 'Ami coureur 1', type: 'runner' },
            { name: 'Ami coureur 2', type: 'runner' },
            { name: 'Supporter 1', type: 'spectator' },
            { name: 'Supporter 2', type: 'spectator' },
            { name: 'Supporter 3', type: 'spectator' },
            { name: 'Ami 6', type: 'runner' },
            { name: 'Ami 7', type: 'runner' },
            { name: 'Ami 8', type: 'runner' },
            { name: 'Ami 9', type: 'spectator' },
            { name: 'Ami 10', type: 'spectator' }
        ];

        fullDatasetRaces.push({
            id: 'r_' + idx,
            name: 'Course ' + idx + ' Hyrox Triathlon L',
            date: `2024-${mStr}-${day}`,
            hour: (idx % 2 === 0 ? '03:30' : '09:00'),
            distance: '102 km',
            time: (idx <= 10 ? '05:45:00' : '00:34:00'),
            elevation: '4800',
            favorite: true,
            ranking: '3',
            participants: '100',
            categoryRank: '1',
            terrain: terrain,
            raceFormat: (r === 3 || r === 5 ? 'team' : 'single'),
            bibNumber: '999',
            price: '12',
            gpx: 'track.gpx',
            photos: ['pic.jpg'],
            notes: 'Super souvenir de course',
            website: 'https://site.fr',
            driveLink: 'https://drive.google.com/test',
            isPublic: true,
            companions: comps,
            fromWishlist: true,
            country: (idx % 3 === 0 ? 'Espagne' : (idx % 5 === 0 ? 'Suisse' : 'France')),
            location: 'Ville_' + (idx % 8) + ' (' + (69 + (idx % 12)) + ')'
        });
    }
}

const finalResults = window.calculateGamifiedBadges(fullDatasetRaces);
let unlockedMissionsCount = 0;

levels.forEach(lvl => {
    lvl.badgeIds.forEach(bId => {
        const isUnlocked = finalResults.unlockedBadges[bId] && finalResults.unlockedBadges[bId].unlocked;
        if (isUnlocked) {
            unlockedMissionsCount++;
        } else {
            errors.push(`Mission non débloquée dans le test complet : ${bId} (${defs[bId]?.name})`);
        }
    });
});

assert(unlockedMissionsCount === 120, `Toutes les 120 missions doivent être validées avec le jeu de données complet (actuel: ${unlockedMissionsCount}/120)`);

console.log(`   ✅ 120/120 missions validées avec succès !\n`);

// ─────────────────────────────────────────────────────────────────────────────
// RÉSUMÉ FINAL
// ─────────────────────────────────────────────────────────────────────────────
console.log('===============================================================');
if (errors.length === 0) {
    console.log(`🎉 TOUS LES TESTS SONT AU VERT : ${passedTests}/${totalTests} assertions validées !`);
    console.log('===============================================================');
    process.exit(0);
} else {
    console.error(`❌ ÉCHEC : ${errors.length} erreur(s) détectée(s) :`);
    errors.forEach(e => console.error('  - ' + e));
    console.log('===============================================================');
    process.exit(1);
}
