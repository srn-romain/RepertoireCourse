const assert = require('assert');

// 1. Extraire et émuler les fonctions de tri wishlist issues de dashboard.html

function getWishlistItemDateTimestamp(item) {
    const raw = (item.date || item.raceDate || '').trim();
    if (!raw) return null;
    const d = new Date(raw + (raw.includes('T') ? '' : 'T00:00:00'));
    const time = d.getTime();
    return isNaN(time) ? null : time;
}

function compareWishlistItems(a, b, sortBy = 'date', sortOrder = 'asc') {
    if (sortBy === 'date') {
        const timeA = getWishlistItemDateTimestamp(a);
        const timeB = getWishlistItemDateTimestamp(b);

        // Les courses avec date valide viennent en premier, celles sans date à la fin
        if (timeA !== null && timeB === null) return -1;
        if (timeA === null && timeB !== null) return 1;

        if (timeA !== null && timeB !== null) {
            const diff = (sortOrder === 'desc') ? (timeB - timeA) : (timeA - timeB);
            if (diff !== 0) return diff;
        }

        // Égalité de date ou aucune date : tri secondaire alphabétique par nom
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
    } else {
        // Tri par nom de course
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        const cmp = nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
        if (cmp !== 0) {
            return (sortOrder === 'desc') ? -cmp : cmp;
        }

        // Égalité de nom : tri secondaire chronologique par date
        const timeA = getWishlistItemDateTimestamp(a);
        const timeB = getWishlistItemDateTimestamp(b);
        if (timeA !== null && timeB === null) return -1;
        if (timeA === null && timeB !== null) return 1;
        if (timeA !== null && timeB !== null) return timeA - timeB;
        return 0;
    }
}

function sortWishlistItemsList(items, sortBy = 'date', sortOrder = 'asc') {
    return [...items].sort((a, b) => compareWishlistItems(a, b, sortBy, sortOrder));
}

// Emulation du formatage pour copie
function formatWishlistForCopy(items, sortBy = 'date', sortOrder = 'asc') {
    const categories = ['route', 'trail', 'triathlon', 'relai'];
    const categoryLabels = {
        route: 'Route',
        trail: 'Trail',
        triathlon: 'Triathlon',
        relai: 'Relai'
    };

    const sections = [];

    categories.forEach(cat => {
        const catItems = items.filter(item => {
            const itemCat = (item.category || '').toLowerCase();
            return itemCat === cat || (cat === 'route' && itemCat === 'course');
        });

        if (catItems.length === 0) return;

        const sortedCatItems = sortWishlistItemsList(catItems, sortBy, sortOrder);
        const catLabel = categoryLabels[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
        const lines = sortedCatItems.map(item => `• ${item.name.trim()}`);
        sections.push(`${catLabel} :\n${lines.join('\n')}`);
    });

    return sections.join('\n\n');
}

// Tests
console.log('=== Lancement des tests de tri de la wishlist ===');

// Test 1 : getWishlistItemDateTimestamp
(function testTimestamp() {
    assert.strictEqual(getWishlistItemDateTimestamp({ date: '2026-05-10' }), new Date('2026-05-10T00:00:00').getTime());
    assert.strictEqual(getWishlistItemDateTimestamp({ raceDate: '2026-06-20' }), new Date('2026-06-20T00:00:00').getTime());
    assert.strictEqual(getWishlistItemDateTimestamp({ date: '' }), null);
    assert.strictEqual(getWishlistItemDateTimestamp({}), null);
    assert.strictEqual(getWishlistItemDateTimestamp({ date: 'invalid-date' }), null);
    console.log('✔ Test 1 : getWishlistItemDateTimestamp OK');
})();

// Test 2 : Tri par Date ascendant
(function testSortDateAsc() {
    const items = [
        { name: 'Course C - Sans date', category: 'route' },
        { name: 'Course B - Mai', category: 'route', date: '2026-05-15' },
        { name: 'Course A - Mars', category: 'route', date: '2026-03-10' },
        { name: 'Course D - Sans date', category: 'route', date: '' }
    ];

    const sorted = sortWishlistItemsList(items, 'date', 'asc');
    assert.strictEqual(sorted[0].name, 'Course A - Mars');
    assert.strictEqual(sorted[1].name, 'Course B - Mai');
    assert.strictEqual(sorted[2].name, 'Course C - Sans date');
    assert.strictEqual(sorted[3].name, 'Course D - Sans date');
    console.log('✔ Test 2 : Tri par date ascendant OK (dates valides puis items sans date)');
})();

// Test 3 : Tri par Date descendant
(function testSortDateDesc() {
    const items = [
        { name: 'Course Sans date', category: 'trail' },
        { name: 'Course B - Mai', category: 'trail', date: '2026-05-15' },
        { name: 'Course A - Mars', category: 'trail', date: '2026-03-10' },
        { name: 'Course C - Octobre', category: 'trail', date: '2026-10-01' }
    ];

    const sorted = sortWishlistItemsList(items, 'date', 'desc');
    assert.strictEqual(sorted[0].name, 'Course C - Octobre');
    assert.strictEqual(sorted[1].name, 'Course B - Mai');
    assert.strictEqual(sorted[2].name, 'Course A - Mars');
    assert.strictEqual(sorted[3].name, 'Course Sans date');
    console.log('✔ Test 3 : Tri par date descendant OK (items sans date toujours en fin)');
})();

// Test 4 : Tri par Nom ascendant et descendant
(function testSortName() {
    const items = [
        { name: 'Marathon de Paris', category: 'route', date: '2026-04-05' },
        { name: '10km des Étoiles', category: 'route', date: '2026-03-20' },
        { name: 'Semi de Boulogne', category: 'route', date: '2026-11-15' },
        { name: '10km de Paris', category: 'route', date: '2026-06-07' }
    ];

    const sortedAsc = sortWishlistItemsList(items, 'name', 'asc');
    assert.strictEqual(sortedAsc[0].name, '10km de Paris');
    assert.strictEqual(sortedAsc[1].name, '10km des Étoiles');
    assert.strictEqual(sortedAsc[2].name, 'Marathon de Paris');
    assert.strictEqual(sortedAsc[3].name, 'Semi de Boulogne');

    const sortedDesc = sortWishlistItemsList(items, 'name', 'desc');
    assert.strictEqual(sortedDesc[0].name, 'Semi de Boulogne');
    assert.strictEqual(sortedDesc[1].name, 'Marathon de Paris');
    assert.strictEqual(sortedDesc[2].name, '10km des Étoiles');
    assert.strictEqual(sortedDesc[3].name, '10km de Paris');
    console.log('✔ Test 4 : Tri par nom ascendant et descendant OK');
})();

// Test 5 : Tri intra-catégorie indépendant (les catégories restent séparées)
(function testIntraCategorySorting() {
    const allItems = [
        // Route
        { name: 'Semi de Lille', category: 'route', date: '2026-09-01' },
        { name: '10km de Nice', category: 'route', date: '2026-01-10' },
        // Trail
        { name: 'UTMB', category: 'trail', date: '2026-08-28' },
        { name: 'EcoTrail Paris', category: 'trail', date: '2026-03-21' },
        // Relai
        { name: 'Ekiden de Paris', category: 'relai', date: '2026-11-08' },
        { name: 'Relais du Bocage', category: 'relai', date: '2026-04-12' }
    ];

    // Format for copy trié par date
    const formattedDate = formatWishlistForCopy(allItems, 'date', 'asc');
    assert.ok(formattedDate.indexOf('10km de Nice') < formattedDate.indexOf('Semi de Lille'), 'Route trié par date');
    assert.ok(formattedDate.indexOf('EcoTrail Paris') < formattedDate.indexOf('UTMB'), 'Trail trié par date');
    assert.ok(formattedDate.indexOf('Relais du Bocage') < formattedDate.indexOf('Ekiden de Paris'), 'Relai trié par date');

    // Format for copy trié par nom
    const formattedName = formatWishlistForCopy(allItems, 'name', 'asc');
    assert.ok(formattedName.indexOf('10km de Nice') < formattedName.indexOf('Semi de Lille'), 'Route trié par nom');
    assert.ok(formattedName.indexOf('EcoTrail Paris') < formattedName.indexOf('UTMB'), 'Trail trié par nom');
    assert.ok(formattedName.indexOf('Ekiden de Paris') < formattedName.indexOf('Relais du Bocage'), 'Relai trié par nom');

    console.log('✔ Test 5 : Tri intra-catégorie indépendant et formatage OK');
})();

// Test 6 : Préservation des favoris en tête de catégorie avec tri intra-favoris et intra-non-favoris
(function testFavoritesPreservation() {
    const catItems = [
        { name: 'Course Z non fav', favorite: false, date: '2026-02-01' },
        { name: 'Course B fav', favorite: true, date: '2026-05-01' },
        { name: 'Course A fav', favorite: true, date: '2026-03-01' },
        { name: 'Course Y non fav', favorite: false, date: '2026-01-01' }
    ];

    // Tri par date
    const sortedCat = sortWishlistItemsList(catItems, 'date', 'asc');
    const favs = sortedCat.filter(i => i.favorite);
    const nonFavs = sortedCat.filter(i => !i.favorite);
    const finalDisplayOrder = [...favs, ...nonFavs];

    // Favoris restent en premier : Course A fav (Mars), puis Course B fav (Mai)
    assert.strictEqual(finalDisplayOrder[0].name, 'Course A fav');
    assert.strictEqual(finalDisplayOrder[1].name, 'Course B fav');
    // Non favoris ensuite triés par date : Course Y (Janvier), puis Course Z (Février)
    assert.strictEqual(finalDisplayOrder[2].name, 'Course Y non fav');
    assert.strictEqual(finalDisplayOrder[3].name, 'Course Z non fav');

    console.log('✔ Test 6 : Préservation des favoris avec tri intra-catégorie OK');
})();

console.log('=== Tous les tests de tri wishlist ont réussi ! ===');
