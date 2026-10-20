function normalizeRaceName(name) {
    if (!name) return "";
    return String(name)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\-_']/g, " ")
        .replace(/\s+/g, " ");
}

function areDatesClose(dateStr1, dateStr2, maxDays = 7) {
    if (!dateStr1 || !dateStr2) return false;
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
    if (d1.getFullYear() !== d2.getFullYear()) return false;
    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= maxDays;
}

function groupAdjacentSimilarRaces(items) {
    if (!items || items.length === 0) return [];

    const groups = [];
    for (const item of items) {
        let placed = false;

        // 1. Directement consécutif
        if (groups.length > 0) {
            const lastGroup = groups[groups.length - 1];
            const leadItem = lastGroup[0];
            const isSameName = normalizeRaceName(item.race.name) === normalizeRaceName(leadItem.race.name);
            const isCloseDate = areDatesClose(item.race.date, leadItem.race.date, 7);

            if (isSameName && isCloseDate) {
                lastGroup.push(item);
                placed = true;
            }
        }

        // 2. Proche dans les 3 derniers groupes (même date ou écart <= 2 jours)
        if (!placed) {
            for (let i = groups.length - 1; i >= 0 && i >= groups.length - 3; i--) {
                const targetGroup = groups[i];
                const leadItem = targetGroup[0];
                const isSameName = normalizeRaceName(item.race.name) === normalizeRaceName(leadItem.race.name);
                const isVeryCloseDate = areDatesClose(item.race.date, leadItem.race.date, 2);

                if (isSameName && isVeryCloseDate) {
                    targetGroup.push(item);
                    placed = true;
                    break;
                }
            }
        }

        // 3. Nouveau groupe
        if (!placed) {
            groups.push([item]);
        }
    }

    return groups;
}

// Tests
const sampleItems = [
    { race: { name: "Marathon de Paris", date: "2026-04-12" }, runner: "Alice" },
    { race: { name: "Marathon de Paris", date: "2026-04-12" }, runner: "Bob" },
    { race: { name: "10km de Paris", date: "2026-04-12" }, runner: "Charlie" },
    { race: { name: "Marathon de Paris", date: "2026-04-12" }, runner: "David" }, // interleaved same date
    { race: { name: "Trail du Mont-Blanc", date: "2026-06-27" }, runner: "Eve" },
    { race: { name: "Trail du Mont Blanc", date: "2026-06-28" }, runner: "Frank" }, // next day weekend
    { race: { name: "Marathon de Paris", date: "2025-04-12" }, runner: "Grace" }, // previous year!
    { race: { name: "Marathon de Paris", date: "2026-10-25" }, runner: "Heidi" }, // 6 months later
];

const result = groupAdjacentSimilarRaces(sampleItems);
console.log("Total groups:", result.length);
result.forEach((g, idx) => {
    console.log(`Group ${idx + 1} (${g.length} items):`, g.map(x => `${x.race.name} [${x.race.date}] by ${x.runner}`));
});

// Assertions
if (result.length !== 5) {
    console.error("FAIL: Expected 5 groups, got", result.length);
    process.exit(1);
}
if (result[0].length !== 3) {
    console.error("FAIL: Expected 3 in Marathon de Paris 2026 group, got", result[0].length);
    process.exit(1);
}
if (result[2].length !== 2) {
    console.error("FAIL: Expected 2 in Trail du Mont-Blanc group, got", result[2].length);
    process.exit(1);
}
console.log("ALL TESTS PASSED SUCCESSFULLY!");
