const assert = require('assert');

function timeToSeconds(timeStr) {
    if (!timeStr || timeStr === '00:00:00' || timeStr.trim() === '') return null;
    const parts = timeStr.split(':');
    if (parts.length !== 3) return null;
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

function secondsToTime(seconds) {
    if (seconds === null || seconds === undefined) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Test calculateEstimatedPaces logic
function calculateEstimatedPaces(racesList) {
    if (!racesList || racesList.length === 0) return null;

    const runData = [];

    racesList.forEach(race => {
        if (race.terrain === 'relai' && race.relayLaps && race.relayLaps.length > 0) {
            race.relayLaps.forEach((lap, idx) => {
                if (lap.runner === 'Moi' || !lap.runner || lap.runner === 'Tous ensemble') {
                    const dist = parseFloat(lap.dist) || 0;
                    const elev = parseFloat(lap.elev) || 0;
                    const tSec = timeToSeconds(lap.time);
                    if (dist >= 0.3 && tSec && tSec > 0) {
                        const flatDist = dist + (elev > 0 ? elev / 100 : 0);
                        runData.push({
                            rawRace: race,
                            name: `${race.name} (Relais #${idx + 1})`,
                            raceId: race.id,
                            date: race.date,
                            dist,
                            flatDist,
                            elev,
                            timeSec: tSec,
                            paceSecPerKm: tSec / flatDist
                        });
                    }
                }
            });
        } else if (race.terrain === 'hyrox') {
            if (race.hyroxLaps && race.hyroxLaps.length > 0) {
                [0, 2, 4, 6, 8, 10, 12, 14].forEach(idx => {
                    const tSec = timeToSeconds(race.hyroxLaps[idx]);
                    if (tSec && tSec > 0) {
                        runData.push({
                            rawRace: race,
                            name: `${race.name} (Course 1km)`,
                            raceId: race.id,
                            date: race.date,
                            dist: 1.0,
                            flatDist: 1.0,
                            elev: 0,
                            timeSec: tSec,
                            paceSecPerKm: tSec
                        });
                    }
                });
            }
        } else if (race.terrain !== 'triathlon') {
            const dist = parseFloat(race.distance) || 0;
            const elev = parseFloat(race.elevation) || 0;
            const tSec = timeToSeconds(race.time);
            if (dist >= 0.3 && tSec && tSec > 0) {
                const flatDist = dist + (elev > 0 ? elev / 100 : 0);
                runData.push({
                    rawRace: race,
                    name: race.name,
                    raceId: race.id,
                    date: race.date,
                    dist,
                    flatDist,
                    elev,
                    timeSec: tSec,
                    paceSecPerKm: tSec / flatDist
                });
            }
        }
    });

    if (runData.length === 0) return null;

    const totalFlatDist = runData.reduce((acc, r) => acc + r.flatDist, 0);
    const totalTimeSec = runData.reduce((acc, r) => acc + r.timeSec, 0);

    let fatigueExponent = 1.07;
    const shortRuns = runData.filter(r => r.flatDist >= 3.0 && r.flatDist <= 12.0);
    const longRuns = runData.filter(r => r.flatDist >= 15.0);

    if (shortRuns.length > 0 && longRuns.length > 0) {
        const avgShortDist = shortRuns.reduce((s, r) => s + r.flatDist, 0) / shortRuns.length;
        const avgShortTime = shortRuns.reduce((s, r) => s + r.timeSec, 0) / shortRuns.length;
        const avgLongDist = longRuns.reduce((s, r) => s + r.flatDist, 0) / longRuns.length;
        const avgLongTime = longRuns.reduce((s, r) => s + r.timeSec, 0) / longRuns.length;

        if (avgLongDist > avgShortDist * 1.3 && avgLongTime > avgShortTime) {
            const customF = Math.log(avgLongTime / avgShortTime) / Math.log(avgLongDist / avgShortDist);
            if (!isNaN(customF) && customF >= 1.03 && customF <= 1.18) {
                fatigueExponent = customF;
            }
        }
    } else {
        const maxDist = Math.max(...runData.map(r => r.flatDist));
        if (maxDist < 10) {
            fatigueExponent = 1.085;
        } else if (maxDist >= 21) {
            fatigueExponent = 1.06;
        }
    }

    function projectRiegel(tRef, dRef, dTarget, exponent) {
        return tRef * Math.pow(dTarget / dRef, exponent);
    }

    const baseRefDist = totalFlatDist / runData.length;
    const baseRefTime = totalTimeSec / runData.length;

    const real1kRaces = runData.filter(r => r.flatDist >= 0.8 && r.flatDist <= 1.4);
    const real10kRaces = runData.filter(r => r.flatDist >= 8.5 && r.flatDist <= 11.5);
    const realSemiRaces = runData.filter(r => r.flatDist >= 19.0 && r.flatDist <= 23.0);

    // --- 1 KM ---
    let est1kSec = 0;
    let is1kReal = false;
    const model1k = projectRiegel(baseRefTime, baseRefDist, 1.0, fatigueExponent);
    if (real1kRaces.length >= 2) {
        const avgReal1k = real1kRaces.reduce((s, r) => s + (r.timeSec / r.flatDist), 0) / real1kRaces.length;
        est1kSec = Math.round(0.7 * avgReal1k + 0.3 * model1k);
        is1kReal = true;
    } else if (real1kRaces.length === 1) {
        const singleReal1k = real1kRaces[0].timeSec / real1kRaces[0].flatDist;
        est1kSec = Math.round(0.5 * singleReal1k + 0.5 * model1k);
        is1kReal = true;
    } else {
        est1kSec = Math.round(model1k);
    }

    let rp1k = null;
    if (real1kRaces.length > 0) {
        let bestTime = Infinity;
        let bestRace = null;
        real1kRaces.forEach(r => {
            const t = (r.timeSec / r.flatDist) * 1.0;
            if (t < bestTime) {
                bestTime = t;
                bestRace = r;
            }
        });
        rp1k = {
            timeSec: Math.round(bestTime),
            isReal: true,
            raceName: bestRace.name,
            raceId: bestRace.raceId,
            rawRace: bestRace.rawRace
        };
    } else {
        let bestScaledTime = Infinity;
        let bestScaledRace = null;
        runData.forEach(r => {
            const proj = projectRiegel(r.timeSec, r.flatDist, 1.0, fatigueExponent);
            if (proj < bestScaledTime) {
                bestScaledTime = proj;
                bestScaledRace = r;
            }
        });
        rp1k = {
            timeSec: Math.round(bestScaledTime),
            isReal: false,
            raceName: bestScaledRace ? bestScaledRace.name : null,
            raceId: bestScaledRace ? bestScaledRace.raceId : null,
            rawRace: bestScaledRace ? bestScaledRace.rawRace : null
        };
    }

    // --- 10 KM ---
    let est10kSec = 0;
    let is10kReal = false;
    const model10k = projectRiegel(baseRefTime, baseRefDist, 10.0, fatigueExponent);
    if (real10kRaces.length >= 2) {
        const avgReal10k = real10kRaces.reduce((s, r) => s + (r.timeSec / r.flatDist) * 10.0, 0) / real10kRaces.length;
        est10kSec = Math.round(0.75 * avgReal10k + 0.25 * model10k);
        is10kReal = true;
    } else if (real10kRaces.length === 1) {
        const singleReal10k = (real10kRaces[0].timeSec / real10kRaces[0].flatDist) * 10.0;
        est10kSec = Math.round(0.6 * singleReal10k + 0.4 * model10k);
        is10kReal = true;
    } else {
        est10kSec = Math.round(model10k);
    }

    let rp10k = null;
    if (real10kRaces.length > 0) {
        let bestTime = Infinity;
        let bestRace = null;
        real10kRaces.forEach(r => {
            const t = (r.timeSec / r.flatDist) * 10.0;
            if (t < bestTime) {
                bestTime = t;
                bestRace = r;
            }
        });
        rp10k = {
            timeSec: Math.round(bestTime),
            isReal: true,
            raceName: bestRace.name,
            raceId: bestRace.raceId,
            rawRace: bestRace.rawRace
        };
    } else {
        let bestScaledTime = Infinity;
        let bestScaledRace = null;
        runData.forEach(r => {
            const proj = projectRiegel(r.timeSec, r.flatDist, 10.0, fatigueExponent);
            if (proj < bestScaledTime) {
                bestScaledTime = proj;
                bestScaledRace = r;
            }
        });
        rp10k = {
            timeSec: Math.round(bestScaledTime),
            isReal: false,
            raceName: bestScaledRace ? bestScaledRace.name : null,
            raceId: bestScaledRace ? bestScaledRace.raceId : null,
            rawRace: bestScaledRace ? bestScaledRace.rawRace : null
        };
    }

    // --- SEMI ---
    let estSemiSec = 0;
    let isSemiReal = false;
    const targetSemiDist = 21.0975;
    const modelSemi = projectRiegel(baseRefTime, baseRefDist, targetSemiDist, fatigueExponent);
    if (realSemiRaces.length >= 2) {
        const avgRealSemi = realSemiRaces.reduce((s, r) => s + (r.timeSec / r.flatDist) * targetSemiDist, 0) / realSemiRaces.length;
        estSemiSec = Math.round(0.8 * avgRealSemi + 0.2 * modelSemi);
        isSemiReal = true;
    } else if (realSemiRaces.length === 1) {
        const singleRealSemi = (realSemiRaces[0].timeSec / realSemiRaces[0].flatDist) * targetSemiDist;
        estSemiSec = Math.round(0.65 * singleRealSemi + 0.35 * modelSemi);
        isSemiReal = true;
    } else {
        estSemiSec = Math.round(modelSemi);
    }

    let rpSemi = null;
    if (realSemiRaces.length > 0) {
        let bestTime = Infinity;
        let bestRace = null;
        realSemiRaces.forEach(r => {
            const t = (r.timeSec / r.flatDist) * targetSemiDist;
            if (t < bestTime) {
                bestTime = t;
                bestRace = r;
            }
        });
        rpSemi = {
            timeSec: Math.round(bestTime),
            isReal: true,
            raceName: bestRace.name,
            raceId: bestRace.raceId,
            rawRace: bestRace.rawRace
        };
    } else {
        let bestScaledTime = Infinity;
        let bestScaledRace = null;
        runData.forEach(r => {
            const proj = projectRiegel(r.timeSec, r.flatDist, targetSemiDist, fatigueExponent);
            if (proj < bestScaledTime) {
                bestScaledTime = proj;
                bestScaledRace = r;
            }
        });
        rpSemi = {
            timeSec: Math.round(bestScaledTime),
            isReal: false,
            raceName: bestScaledRace ? bestScaledRace.name : null,
            raceId: bestScaledRace ? bestScaledRace.raceId : null,
            rawRace: bestScaledRace ? bestScaledRace.rawRace : null
        };
    }

    function formatPace(paceSec) {
        if (!paceSec || isNaN(paceSec) || paceSec <= 0) return "-'--\"";
        const mins = Math.floor(paceSec / 60);
        const secs = Math.round(paceSec % 60);
        return `${mins}'${String(secs).padStart(2, '0')}"/km`;
    }

    function formatSpeed(distKm, timeSec) {
        if (!timeSec || timeSec <= 0) return '- km/h';
        const speed = distKm / (timeSec / 3600);
        return `${speed.toFixed(1)} km/h`;
    }

    function formatHumanTime(seconds) {
        if (!seconds || seconds <= 0) return '00:00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.round(seconds % 60);
        if (hours > 0) {
            return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
        }
        return `${minutes}m ${String(secs).padStart(2, '0')}s`;
    }

    return {
        k1: {
            timeSec: est1kSec,
            timeFormatted: formatHumanTime(est1kSec),
            paceStr: formatPace(est1kSec),
            rp: {
                timeSec: rp1k.timeSec,
                timeFormatted: formatHumanTime(rp1k.timeSec),
                paceStr: formatPace(rp1k.timeSec),
                isReal: rp1k.isReal,
                raceName: rp1k.raceName
            }
        },
        k10: {
            timeSec: est10kSec,
            timeFormatted: formatHumanTime(est10kSec),
            paceStr: formatPace(est10kSec / 10.0),
            rp: {
                timeSec: rp10k.timeSec,
                timeFormatted: formatHumanTime(rp10k.timeSec),
                paceStr: formatPace(rp10k.timeSec / 10.0),
                isReal: rp10k.isReal,
                raceName: rp10k.raceName
            }
        },
        semi: {
            timeSec: estSemiSec,
            timeFormatted: formatHumanTime(estSemiSec),
            paceStr: formatPace(estSemiSec / targetSemiDist),
            rp: {
                timeSec: rpSemi.timeSec,
                timeFormatted: formatHumanTime(rpSemi.timeSec),
                paceStr: formatPace(rpSemi.timeSec / targetSemiDist),
                isReal: rpSemi.isReal,
                raceName: rpSemi.raceName
            }
        }
    };
}

// Tests
const mockRaces = [
    { id: '1', name: '10km Paris 2024', distance: '10', time: '00:44:00', elevation: '0', terrain: 'route' },
    { id: '2', name: '10km Lyon 2023', distance: '10', time: '00:48:00', elevation: '0', terrain: 'route' },
    { id: '3', name: 'Semi de Boulogne', distance: '21.1', time: '01:40:00', elevation: '0', terrain: 'route' },
    { id: '4', name: 'Semi de Paris', distance: '21.1', time: '01:46:00', elevation: '0', terrain: 'route' }
];

const result = calculateEstimatedPaces(mockRaces);
assert(result.k10.rp.isReal === true);
assert(result.k10.rp.raceName === '10km Paris 2024');
assert(result.k10.rp.timeFormatted === '44m 00s');

assert(result.semi.rp.isReal === true);
assert(result.semi.rp.raceName === 'Semi de Boulogne');
assert(result.semi.rp.timeFormatted === '1h 39m 59s' || result.semi.rp.timeFormatted === '1h 40m 00s');

console.log('✅ All RP & average pace unit tests passed!');
