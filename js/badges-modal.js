/**
 * js/badges-modal.js
 * Système de Badges & Progression par Niveaux
 * (Tong, Sandale, Mocassin, Basket, Boots)
 * + 3 Cocardes Records (RP Temps au km, Plus de dénivelé, Plus longue course)
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. CONFIGURATION DES NIVEAUX & COCARDE DE COULEUR
    // ─────────────────────────────────────────────────────────────────────────────
    const LEVELS_CONFIG = [
        {
            id: 'level_1',
            levelNumber: 1,
            name: 'Tong',
            emoji: '🩴',
            subtitle: 'Premières Foulées',
            pointsPerBadge: 10,
            requiredFromPrevious: 0,
            cocarde: {
                bg: 'bg-amber-100',
                text: 'text-amber-800',
                border: 'border-amber-300',
                pillBg: 'bg-amber-50 text-amber-800 border-amber-200',
                ribbonColor: '#d97706',
                accentText: 'text-amber-700'
            },
            badgeIds: ['first_step', 'five_k', 'finish_line', 'cheap_run', 'companion_run', 'hill_discovery']
        },
        {
            id: 'level_2',
            levelNumber: 2,
            name: 'Sandale',
            emoji: '👡',
            subtitle: 'Foulée Aérée',
            pointsPerBadge: 20,
            requiredFromPrevious: 3,
            cocarde: {
                bg: 'bg-sky-100',
                text: 'text-sky-800',
                border: 'border-sky-300',
                pillBg: 'bg-sky-50 text-sky-800 border-sky-200',
                ribbonColor: '#0284c7',
                accentText: 'text-sky-700'
            },
            badgeIds: ['ten_k', 'sub_60_10k', 'climber_500', 'tri_or_relay', 'high_roller', 'regular_runner']
        },
        {
            id: 'level_3',
            levelNumber: 3,
            name: 'Mocassin',
            emoji: '👞',
            subtitle: 'Rythme & Style',
            pointsPerBadge: 35,
            requiredFromPrevious: 3,
            cocarde: {
                bg: 'bg-emerald-100',
                text: 'text-emerald-800',
                border: 'border-emerald-300',
                pillBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                ribbonColor: '#059669',
                accentText: 'text-emerald-700'
            },
            badgeIds: ['half_marathon', 'sub_50_10k', 'climber_1000', 'relay_specialist', 'hyrox_racer', 'explorer_cities']
        },
        {
            id: 'level_4',
            levelNumber: 4,
            name: 'Basket',
            emoji: '👟',
            subtitle: 'Athlète Tout-Terrain',
            pointsPerBadge: 50,
            requiredFromPrevious: 3,
            cocarde: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-300',
                pillBg: 'bg-blue-50 text-blue-800 border-blue-200',
                ribbonColor: '#2563eb',
                accentText: 'text-blue-700'
            },
            badgeIds: ['marathon_finisher', 'sub_40_10k', 'iron_triathlon', 'climber_2000', 'polyvalent_runner', 'centurion_km']
        },
        {
            id: 'level_5',
            levelNumber: 5,
            name: 'Boots',
            emoji: '🥾',
            subtitle: 'Légende des Sentiers',
            pointsPerBadge: 75,
            requiredFromPrevious: 3,
            cocarde: {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                border: 'border-purple-300',
                pillBg: 'bg-purple-50 text-purple-800 border-purple-200',
                ribbonColor: '#7c3aed',
                accentText: 'text-purple-700'
            },
            badgeIds: ['ultra_runner', 'speed_flash', 'four_seasons', 'skyrunner', 'collector_20', 'titan_300km']
        }
    ];

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. DICTIONNAIRE DÉTAILLÉ DE TOUS LES BADGES
    // ─────────────────────────────────────────────────────────────────────────────
    const BADGES_DEFINITIONS = {
        // --- NIVEAU 1 : TONG (10 pts) ---
        first_step: {
            id: 'first_step',
            level: 1,
            name: 'Premier Dossard',
            icon: 'fa-flag-checkered',
            description: 'Avoir terminé au moins une course officielle.',
            type: 'race'
        },
        five_k: {
            id: 'five_k',
            level: 1,
            name: 'Le 5 Majeur',
            icon: 'fa-person-running',
            description: 'Boucler une épreuve d\'au moins 5 km.',
            type: 'race'
        },
        finish_line: {
            id: 'finish_line',
            level: 1,
            name: 'Finisher Certifié',
            icon: 'fa-stopwatch',
            description: 'Terminer une course avec un temps officiel enregistré.',
            type: 'race'
        },
        cheap_run: {
            id: 'cheap_run',
            level: 1,
            name: 'Radin Malin',
            icon: 'fa-piggy-bank',
            description: 'Finir une course économique avec un coût <= 0.80 € / km.',
            type: 'race'
        },
        companion_run: {
            id: 'companion_run',
            level: 1,
            name: 'Copains d\'Échappée',
            icon: 'fa-user-group',
            description: 'Courir une course avec des compagnons ou en équipe.',
            type: 'race'
        },
        hill_discovery: {
            id: 'hill_discovery',
            level: 1,
            name: 'Faux Plat Montant',
            icon: 'fa-mountain-sun',
            description: 'Finir une course avec au moins 100m de dénivelé positif (D+).',
            type: 'race'
        },

        // --- NIVEAU 2 : SANDALE (20 pts) ---
        ten_k: {
            id: 'ten_k',
            level: 2,
            name: 'Le Cap des 10',
            icon: 'fa-route',
            description: 'Terminer une course officielle d\'au moins 10 km.',
            type: 'race'
        },
        sub_60_10k: {
            id: 'sub_60_10k',
            level: 2,
            name: 'L\'Aventurier Express',
            icon: 'fa-bolt',
            description: 'Boucler un 10 km (ou plus) en moins de 1h00 (allure <= 6:00/km).',
            type: 'race'
        },
        climber_500: {
            id: 'climber_500',
            level: 2,
            name: 'Cabri des Collines',
            icon: 'fa-mountain',
            description: 'Finir une course avec plus de 500m de dénivelé positif (D+).',
            type: 'race'
        },
        tri_or_relay: {
            id: 'tri_or_relay',
            level: 2,
            name: 'Triton & Relais',
            icon: 'fa-person-swimming',
            description: 'Terminer une épreuve de Triathlon ou une course en Relais.',
            type: 'race'
        },
        high_roller: {
            id: 'high_roller',
            level: 2,
            name: 'VIP du Bitume',
            icon: 'fa-gem',
            description: 'Participer à une course avec une inscription à plus de 1.00 € / km.',
            type: 'race'
        },
        regular_runner: {
            id: 'regular_runner',
            level: 2,
            name: 'Pèlerin Régulier',
            icon: 'fa-medal',
            description: 'Cumuler au moins 5 courses officielles terminées au total.',
            type: 'global'
        },

        // --- NIVEAU 3 : MOCASSIN (35 pts) ---
        half_marathon: {
            id: 'half_marathon',
            level: 3,
            name: 'Demi-Dieu',
            icon: 'fa-crown',
            description: 'Terminer un Semi-Marathon officiel (distance >= 21.0 km).',
            type: 'race'
        },
        sub_50_10k: {
            id: 'sub_50_10k',
            level: 3,
            name: 'La Flèche des 10k',
            icon: 'fa-fire',
            description: 'Boucler un 10 km (ou plus) en moins de 50 min (allure <= 5:00/km).',
            type: 'race'
        },
        climber_1000: {
            id: 'climber_1000',
            level: 3,
            name: 'Chamois des Cimes',
            icon: 'fa-mountain',
            description: 'Finir une course avec plus de 1 000m de dénivelé positif (D+).',
            type: 'race'
        },
        relay_specialist: {
            id: 'relay_specialist',
            level: 3,
            name: 'Passeur de Témoin',
            icon: 'fa-people-group',
            description: 'Finir une course en équipe ou format Relais.',
            type: 'race'
        },
        hyrox_racer: {
            id: 'hyrox_racer',
            level: 3,
            name: 'Machine Hyrox',
            icon: 'fa-dumbbell',
            description: 'Prendre le départ et finir une épreuve Hyrox.',
            type: 'race'
        },
        explorer_cities: {
            id: 'explorer_cities',
            level: 3,
            name: 'Globe-Trotteur',
            icon: 'fa-earth-europe',
            description: 'Avoir couru dans au moins 3 villes ou communes distinctes.',
            type: 'global'
        },

        // --- NIVEAU 4 : BASKET (50 pts) ---
        marathon_finisher: {
            id: 'marathon_finisher',
            level: 4,
            name: 'Le Mythique 42',
            icon: 'fa-trophy',
            description: 'Boucler la distance d\'un Marathon officiel (>= 42.0 km).',
            type: 'race'
        },
        sub_40_10k: {
            id: 'sub_40_10k',
            level: 4,
            name: 'TGV Express',
            icon: 'fa-rocket',
            description: 'Boucler un 10 km (ou plus) en moins de 40 min (allure <= 4:00/km).',
            type: 'race'
        },
        iron_triathlon: {
            id: 'iron_triathlon',
            level: 4,
            name: 'L\'Homme de Fer',
            icon: 'fa-person-biking',
            description: 'Terminer une épreuve de Triathlon en solo.',
            type: 'race'
        },
        climber_2000: {
            id: 'climber_2000',
            level: 4,
            name: 'Seigneur des Sommets',
            icon: 'fa-mountain-sun',
            description: 'Finir une course avec plus de 2 000m de dénivelé positif (D+).',
            type: 'race'
        },
        polyvalent_runner: {
            id: 'polyvalent_runner',
            level: 4,
            name: 'Caméléon Tout-Terrain',
            icon: 'fa-shapes',
            description: 'Avoir couru sur au moins 3 terrains différents (Route, Trail, Triathlon, Hyrox, Relais).',
            type: 'global'
        },
        centurion_km: {
            id: 'centurion_km',
            level: 4,
            name: 'Centurion du Bitume',
            icon: 'fa-shield-halved',
            description: 'Cumuler plus de 100 km de courses officielles au total.',
            type: 'global'
        },

        // --- NIVEAU 5 : BOOTS (75 pts) ---
        ultra_runner: {
            id: 'ultra_runner',
            level: 5,
            name: 'Ultra Instinct',
            icon: 'fa-infinity',
            description: 'Terminer une épreuve Ultra de plus de 50 km.',
            type: 'race'
        },
        speed_flash: {
            id: 'speed_flash',
            level: 5,
            name: 'Fusée Débridée',
            icon: 'fa-gauge-high',
            description: 'Allure moyenne inférieure à 4:00/km sur une course d\'au moins 5 km.',
            type: 'race'
        },
        four_seasons: {
            id: 'four_seasons',
            level: 5,
            name: 'Grand Chelem 4 Saisons',
            icon: 'fa-snowflake',
            description: 'Avoir couru au moins 1 course en Hiver, Printemps, Été et Automne.',
            type: 'global'
        },
        skyrunner: {
            id: 'skyrunner',
            level: 5,
            name: 'L\'Aigle des Hauteurs',
            icon: 'fa-cloud-sun',
            description: 'Finir une épreuve avec plus de 3 000m de dénivelé positif (D+).',
            type: 'race'
        },
        collector_20: {
            id: 'collector_20',
            level: 5,
            name: 'Hall of Fame',
            icon: 'fa-award',
            description: 'Cumuler au moins 20 courses officielles terminées.',
            type: 'global'
        },
        titan_300km: {
            id: 'titan_300km',
            level: 5,
            name: 'Titan des Longues Terres',
            icon: 'fa-ranking-star',
            description: 'Cumuler plus de 300 km de courses officielles au total.',
            type: 'global'
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. HELPERS DE CALCUL
    // ─────────────────────────────────────────────────────────────────────────────
    function parseTimeToSeconds(timeStr) {
        if (!timeStr || typeof timeStr !== 'string' || timeStr === '00:00:00' || timeStr.trim() === '') return null;
        const parts = timeStr.trim().split(':');
        if (parts.length !== 3) return null;
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        const s = parseInt(parts[2], 10) || 0;
        const total = h * 3600 + m * 60 + s;
        return total > 0 ? total : null;
    }

    function getSeason(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        const m = d.getMonth();
        if (m === 11 || m === 0 || m === 1) return 'winter';
        if (m >= 2 && m <= 4) return 'spring';
        if (m >= 5 && m <= 7) return 'summer';
        return 'autumn';
    }

    function getEffectiveElevation(race) {
        return parseFloat(race.elevation) || 0;
    }

    function getEffectiveDistance(race) {
        let dist = parseFloat(race.distance) || 0;
        if (race.terrain === 'triathlon' && race.raceFormat !== 'team') {
            const swim = (parseFloat(race.swimDistance) || 0) / 1000;
            const bike = parseFloat(race.bikeDistance) || 0;
            const run = parseFloat(race.distance) || 0;
            dist = swim + bike + run;
        }
        return dist;
    }

    /**
     * Calcule les 3 grandes Cocardes Records :
     * 1. RP Vitesse (Allure au km la plus rapide)
     * 2. Plus de dénivelé (D+ max)
     * 3. Plus longue distance (km max)
     */
    function calculateRecordCocardes(racesList) {
        const totalRaces = (racesList && Array.isArray(racesList)) ? racesList.length : 0;
        const isUnlocked = totalRaces >= 5;

        if (!racesList || !Array.isArray(racesList) || racesList.length === 0) {
            return {
                isUnlocked: false,
                totalRaces: 0,
                requiredRaces: 5,
                pace: null,
                elevation: null,
                distance: null,
                byRaceId: {}
            };
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const eligible = racesList.filter(r => {
            if (!r || !r.date) return false;
            const hasTime = parseTimeToSeconds(r.time) !== null;
            return r.date <= todayStr || hasTime;
        });

        let fastestPace = null;
        let minSecondsPerKm = Infinity;

        let maxElevationRace = null;
        let maxElevation = 0;

        let maxDistanceRace = null;
        let maxDistance = 0;

        eligible.forEach(race => {
            const dist = getEffectiveDistance(race);
            const elev = getEffectiveElevation(race);
            const seconds = parseTimeToSeconds(race.time);

            // 1. RP Allure au km
            if (dist > 0 && seconds !== null && seconds > 0) {
                const secPerKm = seconds / dist;
                if (secPerKm < minSecondsPerKm) {
                    minSecondsPerKm = secPerKm;
                    const min = Math.floor(secPerKm / 60);
                    const sec = Math.round(secPerKm % 60);
                    const formattedPace = `${min}:${sec < 10 ? '0' : ''}${sec} / km`;
                    const speedKmh = ((dist / (seconds / 3600))).toFixed(1) + ' km/h';
                    fastestPace = {
                        race,
                        secondsPerKm: secPerKm,
                        formattedPace,
                        speedKmh,
                        time: race.time,
                        distance: dist
                    };
                }
            }

            // 2. Plus grand dénivelé
            if (elev > maxElevation) {
                maxElevation = elev;
                maxElevationRace = {
                    race,
                    elevation: elev,
                    formattedElevation: `+${elev} m D+`
                };
            }

            // 3. Plus longue distance
            if (dist > maxDistance) {
                maxDistance = dist;
                maxDistanceRace = {
                    race,
                    distance: dist,
                    formattedDistance: `${dist} km`
                };
            }
        });

        const byRaceId = {};
        if (isUnlocked) {
            if (fastestPace && fastestPace.race) {
                if (!byRaceId[fastestPace.race.id]) byRaceId[fastestPace.race.id] = {};
                byRaceId[fastestPace.race.id].hasPace = true;
                byRaceId[fastestPace.race.id].paceInfo = fastestPace;
            }
            if (maxElevationRace && maxElevationRace.race) {
                if (!byRaceId[maxElevationRace.race.id]) byRaceId[maxElevationRace.race.id] = {};
                byRaceId[maxElevationRace.race.id].hasElevation = true;
                byRaceId[maxElevationRace.race.id].elevationInfo = maxElevationRace;
            }
            if (maxDistanceRace && maxDistanceRace.race) {
                if (!byRaceId[maxDistanceRace.race.id]) byRaceId[maxDistanceRace.race.id] = {};
                byRaceId[maxDistanceRace.race.id].hasDistance = true;
                byRaceId[maxDistanceRace.race.id].distanceInfo = maxDistanceRace;
            }
        }

        return {
            isUnlocked,
            totalRaces,
            requiredRaces: 5,
            pace: fastestPace,
            elevation: maxElevationRace,
            distance: maxDistanceRace,
            byRaceId
        };
    }

    /**
     * Calcule tous les badges et la progression de manière STRICTEMENT SÉQUENTIELLE par niveau :
     * Un niveau verrouillé ne permet de valider AUCUN badge.
     */
    function calculateGamifiedBadges(racesList) {
        const badgesByRace = {};
        const unlockedBadges = {};
        Object.keys(BADGES_DEFINITIONS).forEach(id => {
            unlockedBadges[id] = { unlocked: false, races: [] };
        });

        const emptyLevelsState = {};
        LEVELS_CONFIG.forEach((lvl, idx) => {
            emptyLevelsState[lvl.id] = {
                level: lvl,
                isUnlocked: idx === 0,
                unlockedCount: 0,
                totalCount: lvl.badgeIds.length,
                percent: 0,
                neededFromPrevious: idx === 0 ? 0 : lvl.requiredFromPrevious
            };
        });

        if (!racesList || !Array.isArray(racesList) || racesList.length === 0) {
            return {
                badgesByRace: {},
                unlockedBadges,
                levelsState: emptyLevelsState,
                totalPoints: 0,
                recordCocardes: calculateRecordCocardes([])
            };
        }

        racesList.forEach(race => {
            if (race && race.id) {
                badgesByRace[race.id] = {};
            }
        });

        const todayStr = new Date().toISOString().split('T')[0];
        const eligibleRaces = racesList.filter(race => {
            if (!race || !race.date) return false;
            const hasTime = parseTimeToSeconds(race.time) !== null;
            return race.date <= todayStr || hasTime;
        });

        let totalKm = 0;
        const uniqueCities = new Set();
        const uniqueTerrains = new Set();
        const seasonsFound = new Set();

        const raceMetrics = eligibleRaces.map(race => {
            const dist = getEffectiveDistance(race);
            const elev = getEffectiveElevation(race);
            const price = parseFloat(race.price) || 0;
            const seconds = parseTimeToSeconds(race.time);
            const isTeam = race.raceFormat === 'team' || race.terrain === 'relai';
            const isTriathlon = race.terrain === 'triathlon';
            const isHyrox = race.terrain === 'hyrox' || (typeof race.name === 'string' && race.name.toLowerCase().includes('hyrox'));

            let hasCompanions = false;
            if (race.companions) {
                if (Array.isArray(race.companions)) {
                    hasCompanions = race.companions.length > 0;
                } else if (typeof race.companions === 'string') {
                    hasCompanions = race.companions.trim() !== '';
                } else if (typeof race.companions === 'object') {
                    hasCompanions = Object.keys(race.companions).length > 0;
                }
            }

            const rawLoc = typeof race.location === 'string' ? race.location : (typeof race.city === 'string' ? race.city : '');
            const loc = rawLoc.trim().toLowerCase();
            const rawTerrain = typeof race.terrain === 'string' ? race.terrain : 'route';
            const terrain = rawTerrain.trim().toLowerCase();
            const season = getSeason(race.date);

            totalKm += dist;
            if (loc && loc.length > 1) uniqueCities.add(loc);
            if (terrain) uniqueTerrains.add(terrain);
            if (season) seasonsFound.add(season);

            return { race, dist, elev, price, seconds, isTeam, isTriathlon, isHyrox, hasCompanions, loc, terrain, season };
        });

        function markBadgeUnlocked(badgeId, race) {
            unlockedBadges[badgeId].unlocked = true;
            if (race) {
                if (!badgesByRace[race.id]) badgesByRace[race.id] = {};
                badgesByRace[race.id][badgeId] = true;
                if (!unlockedBadges[badgeId].races.some(r => r.id === race.id)) {
                    unlockedBadges[badgeId].races.push(race);
                }
            }
        }

        const levelsState = {};

        // NIVEAU 1 : TONG
        const lvl1 = LEVELS_CONFIG[0];
        raceMetrics.forEach(m => {
            markBadgeUnlocked('first_step', m.race);
            if (m.dist >= 4.8) markBadgeUnlocked('five_k', m.race);
            if (m.seconds !== null && m.seconds > 0) markBadgeUnlocked('finish_line', m.race);
            if (m.dist >= 4.5 && m.price > 0 && (m.price / m.dist) <= 0.80) markBadgeUnlocked('cheap_run', m.race);
            if (m.isTeam || m.hasCompanions) markBadgeUnlocked('companion_run', m.race);
            if (m.elev >= 100) markBadgeUnlocked('hill_discovery', m.race);
        });

        const lvl1UnlockedCount = lvl1.badgeIds.filter(id => unlockedBadges[id].unlocked).length;
        levelsState[lvl1.id] = {
            level: lvl1,
            isUnlocked: true,
            unlockedCount: lvl1UnlockedCount,
            totalCount: lvl1.badgeIds.length,
            percent: Math.round((lvl1UnlockedCount / lvl1.badgeIds.length) * 100),
            neededFromPrevious: 0
        };

        // NIVEAU 2 : SANDALE
        const lvl2 = LEVELS_CONFIG[1];
        const isLvl2Unlocked = lvl1UnlockedCount >= lvl2.requiredFromPrevious;
        let lvl2UnlockedCount = 0;

        if (isLvl2Unlocked) {
            raceMetrics.forEach(m => {
                if (m.dist >= 9.8) markBadgeUnlocked('ten_k', m.race);
                if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 360) markBadgeUnlocked('sub_60_10k', m.race);
                if (m.elev >= 500) markBadgeUnlocked('climber_500', m.race);
                if (m.isTriathlon || m.isTeam) markBadgeUnlocked('tri_or_relay', m.race);
                if (m.dist > 0 && m.price > 0 && (m.price / m.dist) >= 1.00) markBadgeUnlocked('high_roller', m.race);
            });
            if (eligibleRaces.length >= 5) {
                unlockedBadges.regular_runner.unlocked = true;
                unlockedBadges.regular_runner.races = [...eligibleRaces];
            }
            lvl2UnlockedCount = lvl2.badgeIds.filter(id => unlockedBadges[id].unlocked).length;
        }

        levelsState[lvl2.id] = {
            level: lvl2,
            isUnlocked: isLvl2Unlocked,
            unlockedCount: lvl2UnlockedCount,
            totalCount: lvl2.badgeIds.length,
            percent: Math.round((lvl2UnlockedCount / lvl2.badgeIds.length) * 100),
            neededFromPrevious: isLvl2Unlocked ? 0 : Math.max(0, lvl2.requiredFromPrevious - lvl1UnlockedCount)
        };

        // NIVEAU 3 : MOCASSIN
        const lvl3 = LEVELS_CONFIG[2];
        const isLvl3Unlocked = isLvl2Unlocked && (lvl2UnlockedCount >= lvl3.requiredFromPrevious);
        let lvl3UnlockedCount = 0;

        if (isLvl3Unlocked) {
            raceMetrics.forEach(m => {
                if (m.dist >= 20.8) markBadgeUnlocked('half_marathon', m.race);
                if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 300) markBadgeUnlocked('sub_50_10k', m.race);
                if (m.elev >= 1000) markBadgeUnlocked('climber_1000', m.race);
                if (m.isTeam) markBadgeUnlocked('relay_specialist', m.race);
                if (m.isHyrox) markBadgeUnlocked('hyrox_racer', m.race);
            });
            if (uniqueCities.size >= 3) {
                unlockedBadges.explorer_cities.unlocked = true;
                unlockedBadges.explorer_cities.races = [...eligibleRaces];
            }
            lvl3UnlockedCount = lvl3.badgeIds.filter(id => unlockedBadges[id].unlocked).length;
        }

        levelsState[lvl3.id] = {
            level: lvl3,
            isUnlocked: isLvl3Unlocked,
            unlockedCount: lvl3UnlockedCount,
            totalCount: lvl3.badgeIds.length,
            percent: Math.round((lvl3UnlockedCount / lvl3.badgeIds.length) * 100),
            neededFromPrevious: isLvl3Unlocked ? 0 : Math.max(0, lvl3.requiredFromPrevious - lvl2UnlockedCount)
        };

        // NIVEAU 4 : BASKET
        const lvl4 = LEVELS_CONFIG[3];
        const isLvl4Unlocked = isLvl3Unlocked && (lvl3UnlockedCount >= lvl4.requiredFromPrevious);
        let lvl4UnlockedCount = 0;

        if (isLvl4Unlocked) {
            raceMetrics.forEach(m => {
                if (m.dist >= 41.8) markBadgeUnlocked('marathon_finisher', m.race);
                if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 240) markBadgeUnlocked('sub_40_10k', m.race);
                if (m.isTriathlon && !m.isTeam) markBadgeUnlocked('iron_triathlon', m.race);
                if (m.elev >= 2000) markBadgeUnlocked('climber_2000', m.race);
            });
            if (uniqueTerrains.size >= 3) {
                unlockedBadges.polyvalent_runner.unlocked = true;
                unlockedBadges.polyvalent_runner.races = [...eligibleRaces];
            }
            if (totalKm >= 100) {
                unlockedBadges.centurion_km.unlocked = true;
                unlockedBadges.centurion_km.races = [...eligibleRaces];
            }
            lvl4UnlockedCount = lvl4.badgeIds.filter(id => unlockedBadges[id].unlocked).length;
        }

        levelsState[lvl4.id] = {
            level: lvl4,
            isUnlocked: isLvl4Unlocked,
            unlockedCount: lvl4UnlockedCount,
            totalCount: lvl4.badgeIds.length,
            percent: Math.round((lvl4UnlockedCount / lvl4.badgeIds.length) * 100),
            neededFromPrevious: isLvl4Unlocked ? 0 : Math.max(0, lvl4.requiredFromPrevious - lvl3UnlockedCount)
        };

        // NIVEAU 5 : BOOTS
        const lvl5 = LEVELS_CONFIG[4];
        const isLvl5Unlocked = isLvl4Unlocked && (lvl4UnlockedCount >= lvl5.requiredFromPrevious);
        let lvl5UnlockedCount = 0;

        if (isLvl5Unlocked) {
            raceMetrics.forEach(m => {
                if (m.dist >= 50.0) markBadgeUnlocked('ultra_runner', m.race);
                if (m.dist >= 4.8 && m.seconds !== null && (m.seconds / m.dist) < 240) markBadgeUnlocked('speed_flash', m.race);
                if (m.elev >= 3000) markBadgeUnlocked('skyrunner', m.race);
            });
            if (seasonsFound.size >= 4) {
                unlockedBadges.four_seasons.unlocked = true;
                unlockedBadges.four_seasons.races = [...eligibleRaces];
            }
            if (eligibleRaces.length >= 20) {
                unlockedBadges.collector_20.unlocked = true;
                unlockedBadges.collector_20.races = [...eligibleRaces];
            }
            if (totalKm >= 300) {
                unlockedBadges.titan_300km.unlocked = true;
                unlockedBadges.titan_300km.races = [...eligibleRaces];
            }
            lvl5UnlockedCount = lvl5.badgeIds.filter(id => unlockedBadges[id].unlocked).length;
        }

        levelsState[lvl5.id] = {
            level: lvl5,
            isUnlocked: isLvl5Unlocked,
            unlockedCount: lvl5UnlockedCount,
            totalCount: lvl5.badgeIds.length,
            percent: Math.round((lvl5UnlockedCount / lvl5.badgeIds.length) * 100),
            neededFromPrevious: isLvl5Unlocked ? 0 : Math.max(0, lvl5.requiredFromPrevious - lvl4UnlockedCount)
        };

        let totalPoints = 0;
        LEVELS_CONFIG.forEach(lvl => {
            lvl.badgeIds.forEach(badgeId => {
                if (unlockedBadges[badgeId] && unlockedBadges[badgeId].unlocked) {
                    totalPoints += lvl.pointsPerBadge;
                }
            });
        });

        const recordCocardes = calculateRecordCocardes(racesList);

        return {
            badgesByRace,
            unlockedBadges,
            levelsState,
            totalPoints,
            recordCocardes,
            stats: {
                totalRaces: eligibleRaces.length,
                totalKm: Math.round(totalKm * 10) / 10
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. MODALE HTML & COMPOSANT UI
    // ─────────────────────────────────────────────────────────────────────────────
    const badgesModalHTML = `
    <!-- Modale de Badges & Progression -->
    <div id="badgesModal" class="fixed inset-0 flex items-center justify-center z-50 hidden modal">
        <div class="absolute inset-0 bg-black bg-opacity-50 blur-bg" id="badgesModalOverlay"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 z-10 flex flex-col max-h-[90vh]">
            
            <!-- HEADER SOBRE DU SITE -->
            <div class="p-6 border-b border-green-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-white rounded-t-xl shrink-0">
                <h3 class="text-2xl font-bold text-green-800 mb-0 flex items-center gap-2">
                    <i class="fas fa-award text-green-600"></i> Badges & Progression
                </h3>
                <button id="closeBadgesModal" class="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <!-- CONTENU DE LA MODALE -->
            <div id="badgesContent" class="p-6 overflow-y-auto custom-scrollbar bg-gray-50 flex-grow rounded-b-xl">
                <!-- Généré dynamiquement -->
            </div>
        </div>
    </div>
    `;

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. RENDU PRINCIPAL DE L'INTERFACE
    // ─────────────────────────────────────────────────────────────────────────────
    let activeLevelTab = 'all';
    const userLevelExpandedState = {};

    function displayRaceBadgesModal() {
        const modal = document.getElementById('badgesModal');
        const content = document.getElementById('badgesContent');
        if (!modal || !content) return;

        const racesData = window.races || (typeof races !== 'undefined' ? races : []);
        const data = calculateGamifiedBadges(racesData);
        window.raceBadges = data.badgesByRace;
        window.recordCocardes = data.recordCocardes;

        // Déterminer le rang actuel
        let currentRankLevel = LEVELS_CONFIG[0];
        LEVELS_CONFIG.forEach(lvl => {
            if (data.levelsState[lvl.id] && data.levelsState[lvl.id].isUnlocked) {
                currentRankLevel = lvl;
            }
        });

        const nextLevelIndex = LEVELS_CONFIG.findIndex(l => l.id === currentRankLevel.id) + 1;
        const nextLevel = (nextLevelIndex < LEVELS_CONFIG.length) ? LEVELS_CONFIG[nextLevelIndex] : null;
        const currentLvlUnlockedCount = data.levelsState[currentRankLevel.id].unlockedCount;
        const neededForNext = nextLevel ? Math.max(0, nextLevel.requiredFromPrevious - currentLvlUnlockedCount) : 0;

        const totalBadgesCount = Object.keys(BADGES_DEFINITIONS).length;
        const totalUnlockedBadgesCount = Object.values(data.unlockedBadges).filter(b => b.unlocked).length;

        // 1. CARTE RÉCAPITULATIVE DU SCORE ET DU RANG
        let html = `
        <div class="mb-5 bg-white border border-green-200 rounded-xl p-5 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                
                <!-- Score Total -->
                <div class="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                    <div class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Score Total</div>
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-bold text-green-800">${data.totalPoints}</span>
                        <span class="text-sm font-semibold text-green-600">points</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        <strong>${totalUnlockedBadgesCount}</strong> / ${totalBadgesCount} défis débloqués
                    </div>
                </div>

                <!-- Rang Actuel & Progression -->
                <div class="md:col-span-8">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Rang actuel :</span>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${currentRankLevel.cocarde.bg} ${currentRankLevel.cocarde.text} border ${currentRankLevel.cocarde.border}">
                                <span>${currentRankLevel.emoji}</span>
                                <span>Niveau ${currentRankLevel.levelNumber} - ${currentRankLevel.name}</span>
                            </span>
                        </div>
                        <div class="text-xs text-gray-500">
                            ${nextLevel ? (neededForNext === 0 
                                ? `<span class="text-green-700 font-semibold"><i class="fas fa-check"></i> Niveau ${nextLevel.name} débloqué</span>`
                                : `<span>Encore <strong class="text-green-700">${neededForNext} badge${neededForNext > 1 ? 's' : ''}</strong> pour débloquer <strong>${nextLevel.emoji} ${nextLevel.name}</strong></span>`
                            ) : '<span class="text-green-700 font-semibold"><i class="fas fa-check-double"></i> Tous les niveaux débloqués</span>'}
                        </div>
                    </div>

                    <!-- Barre de progression simple -->
                    <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div class="bg-green-600 h-full rounded-full transition-all duration-300" 
                             style="width: ${Math.max(3, Math.round((totalUnlockedBadgesCount / totalBadgesCount) * 100))}%"></div>
                    </div>
                    <div class="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                        <span>Niv. 1 (Tong)</span>
                        <span>Progression : ${Math.round((totalUnlockedBadgesCount / totalBadgesCount) * 100)}%</span>
                        <span>Niv. 5 (Boots)</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        // 2. SECTION DES 3 GRANDES COCARDES RECORDS
        const rec = data.recordCocardes || calculateRecordCocardes(racesData);
        const isRecUnlocked = rec && rec.isUnlocked;

        html += `
        <div class="mb-6 bg-white border ${isRecUnlocked ? 'border-amber-200/80' : 'border-gray-300'} rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                <div class="flex items-center gap-2.5">
                    <svg width="20" height="26" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0 ${isRecUnlocked ? 'filter drop-shadow-xs' : 'opacity-60'}">
                        <path d="M7 16 L2 35 L8.5 36 L12 18 Z" fill="#DC2626"/>
                        <path d="M16 18 L19.5 36 L26 35 L21 16 Z" fill="#2563EB"/>
                        <circle cx="14" cy="14" r="13" fill="#DC2626"/>
                        <circle cx="14" cy="14" r="9" fill="#FFFFFF"/>
                        <circle cx="14" cy="14" r="5.5" fill="#1D4ED8"/>
                    </svg>
                    <h4 class="font-bold text-gray-800 text-sm sm:text-base">Les 3 Cocardes Records</h4>
                </div>
                ${isRecUnlocked ? `
                    <span class="text-[11px] text-gray-400">Attribuées sur le dashboard et dans la fiche de course</span>
                ` : `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                        <i class="fas fa-lock text-[10px] text-amber-600"></i> ${rec.totalRaces || 0} / 5 courses
                    </span>
                `}
            </div>
        `;

        if (!isRecUnlocked) {
            html += `
            <div class="relative rounded-xl overflow-hidden min-h-[105px] flex items-center">
                <!-- 3 cartes records en arrière-plan floutées -->
                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3 filter blur-[1.5px] opacity-35 select-none pointer-events-none p-1">
                    <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[90px] flex flex-col justify-between">
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold">
                                <i class="fas fa-bolt text-[10px]"></i> RP Temps au km
                            </span>
                            <span class="text-xs">⚡</span>
                        </div>
                        <div class="text-xs text-gray-400 italic">Allure record au km</div>
                    </div>

                    <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[90px] flex flex-col justify-between">
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold">
                                <i class="fas fa-mountain text-[10px]"></i> Plus de Dénivelé
                            </span>
                            <span class="text-xs">⛰️</span>
                        </div>
                        <div class="text-xs text-gray-400 italic">Dénivelé D+ record</div>
                    </div>

                    <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[90px] flex flex-col justify-between">
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold">
                                <i class="fas fa-route text-[10px]"></i> Course la Plus Longue
                            </span>
                            <span class="text-xs">🏃‍♂️</span>
                        </div>
                        <div class="text-xs text-gray-400 italic">Distance record en km</div>
                    </div>
                </div>

                <!-- Cadenas superposé adapté au format large (Horizontal Card) -->
                <div class="absolute inset-0 z-10 flex items-center justify-center p-2 sm:p-3 bg-gray-900/10 backdrop-blur-xs rounded-xl">
                    <div class="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-xl px-4 py-3 shadow-lg w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="min-w-0">
                                <h5 class="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Cocardes Records Verrouillées</h5>
                                <p class="text-[11px] text-gray-600 leading-snug mt-0.5">
                                    Enregistrez au moins <strong>5 courses</strong> pour débloquer ces records.
                                </p>
                            </div>
                        </div>
                        <div class="shrink-0 flex items-center">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
                                <i class="fas fa-lock text-amber-600 text-[10px]"></i>
                                <span><strong class="text-green-700">${rec.totalRaces || 0} / 5</strong> courses</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        } else {
            html += `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/70 rounded-lg p-3 flex flex-col justify-between transition hover:border-amber-400">
                    <div class="flex items-center justify-between mb-2">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold">
                            <i class="fas fa-bolt text-amber-600"></i> RP Temps au km
                        </span>
                        <span class="text-xs">⚡</span>
                    </div>
                    ${rec.pace ? `
                        <div class="mb-2.5">
                            <div class="text-xs font-bold text-gray-800 line-clamp-1" title="${rec.pace.race.name}">${rec.pace.race.name}</div>
                            <div class="text-xs text-amber-800 font-extrabold mt-0.5 flex items-center gap-1.5">
                                <span>${rec.pace.formattedPace}</span>
                                <span class="text-[10px] text-gray-500 font-normal">(${rec.pace.speedKmh})</span>
                            </div>
                            <div class="text-[10px] text-gray-400 mt-0.5">Temps : ${rec.pace.time} • ${rec.pace.distance} km</div>
                        </div>
                        <button class="badge-race-name w-full text-center text-xs py-1 px-2 rounded-md bg-white border border-amber-200 text-amber-900 hover:bg-amber-100 font-medium transition cursor-pointer" 
                                data-race-id="${rec.pace.race.id}">
                            Voir la course <i class="fas fa-arrow-right text-[9px] ml-1"></i>
                        </button>
                    ` : `
                        <div class="text-xs text-gray-400 italic py-3 text-center">Aucun chrono enregistré</div>
                    `}
                </div>

                <div class="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200/70 rounded-lg p-3 flex flex-col justify-between transition hover:border-emerald-400">
                    <div class="flex items-center justify-between mb-2">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold">
                            <i class="fas fa-mountain text-emerald-600"></i> Plus de Dénivelé
                        </span>
                        <span class="text-xs">⛰️</span>
                    </div>
                    ${rec.elevation ? `
                        <div class="mb-2.5">
                            <div class="text-xs font-bold text-gray-800 line-clamp-1" title="${rec.elevation.race.name}">${rec.elevation.race.name}</div>
                            <div class="text-xs text-emerald-800 font-extrabold mt-0.5">
                                ${rec.elevation.formattedElevation}
                            </div>
                            <div class="text-[10px] text-gray-400 mt-0.5">${rec.elevation.race.distance || 0} km • ${rec.elevation.race.date ? new Date(rec.elevation.race.date).getFullYear() : ''}</div>
                        </div>
                        <button class="badge-race-name w-full text-center text-xs py-1 px-2 rounded-md bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100 font-medium transition cursor-pointer" 
                                data-race-id="${rec.elevation.race.id}">
                            Voir la course <i class="fas fa-arrow-right text-[9px] ml-1"></i>
                        </button>
                    ` : `
                        <div class="text-xs text-gray-400 italic py-3 text-center">Aucun dénivelé enregistré</div>
                    `}
                </div>

                <div class="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-200/70 rounded-lg p-3 flex flex-col justify-between transition hover:border-blue-400">
                    <div class="flex items-center justify-between mb-2">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold">
                            <i class="fas fa-route text-blue-600"></i> Course la Plus Longue
                        </span>
                        <span class="text-xs">🏃‍♂️</span>
                    </div>
                    ${rec.distance ? `
                        <div class="mb-2.5">
                            <div class="text-xs font-bold text-gray-800 line-clamp-1" title="${rec.distance.race.name}">${rec.distance.race.name}</div>
                            <div class="text-xs text-blue-800 font-extrabold mt-0.5">
                                ${rec.distance.formattedDistance}
                            </div>
                            <div class="text-[10px] text-gray-400 mt-0.5">${rec.distance.race.date ? new Date(rec.distance.race.date).getFullYear() : ''} • ${rec.distance.race.time || ''}</div>
                        </div>
                        <button class="badge-race-name w-full text-center text-xs py-1 px-2 rounded-md bg-white border border-blue-200 text-blue-900 hover:bg-blue-100 font-medium transition cursor-pointer" 
                                data-race-id="${rec.distance.race.id}">
                            Voir la course <i class="fas fa-arrow-right text-[9px] ml-1"></i>
                        </button>
                    ` : `
                        <div class="text-xs text-gray-400 italic py-3 text-center">Aucune distance enregistrée</div>
                    `}
                </div>
            </div>
        </div>
        `;
        }

        // 3. ONGLETS DE NIVEAUX
        html += `
        <div class="flex items-center gap-2 overflow-x-auto pb-1 mb-5 custom-scrollbar">
            <button class="level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${activeLevelTab === 'all' ? 'bg-green-700 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}" data-level="all">
                <i class="fas fa-th-large text-[11px]"></i> Tous les niveaux
            </button>
        `;

        LEVELS_CONFIG.forEach(lvl => {
            const st = data.levelsState[lvl.id];
            const isTabActive = activeLevelTab === lvl.id;
            const lockIcon = st.isUnlocked ? '' : '<i class="fas fa-lock text-[10px] text-amber-600 ml-1"></i>';

            html += `
            <button class="level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${isTabActive ? 'bg-green-700 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}" data-level="${lvl.id}">
                <span>${lvl.emoji}</span>
                <span>Niv. ${lvl.levelNumber} - ${lvl.name}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isTabActive ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-500'}">${st.unlockedCount}/${st.totalCount}</span>
                ${lockIcon}
            </button>
            `;
        });
        html += `</div>`;

        // 4. SECTIONS PAR NIVEAU
        const levelsToRender = activeLevelTab === 'all' 
            ? LEVELS_CONFIG 
            : LEVELS_CONFIG.filter(lvl => lvl.id === activeLevelTab);

        levelsToRender.forEach((lvl, idx) => {
            const st = data.levelsState[lvl.id];
            const prevLvl = idx > 0 ? LEVELS_CONFIG[idx - 1] : null;
            const prevUnlockedCount = prevLvl ? data.levelsState[prevLvl.id].unlockedCount : 0;
            
            let isExpanded = userLevelExpandedState[lvl.id];
            if (isExpanded === undefined) {
                isExpanded = activeLevelTab !== 'all' ? true : st.isUnlocked;
            }
            
            html += `
            <div class="level-section mb-5 bg-white rounded-xl border ${st.isUnlocked ? 'border-gray-200 shadow-sm' : 'border-gray-300'} overflow-hidden transition-all duration-200">
                
                <!-- Header de niveau interactif et repliable -->
                <div class="level-header-toggle p-4 border-b border-gray-100 ${st.isUnlocked ? 'bg-gray-50/70 hover:bg-gray-100/80' : 'bg-gray-100/80 hover:bg-gray-200/70'} flex flex-wrap items-center justify-between gap-3 cursor-pointer transition select-none" data-level-id="${lvl.id}" title="Cliquer pour ${isExpanded ? 'replier' : 'déplier'} ce niveau">
                    <div class="flex items-center gap-2.5">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full ${st.isUnlocked ? `${lvl.cocarde.bg} ${lvl.cocarde.text} border ${lvl.cocarde.border}` : 'bg-gray-200 text-gray-500 border border-gray-300'} text-base font-bold shadow-xs">
                            ${st.isUnlocked ? lvl.emoji : '<i class="fas fa-lock text-sm"></i>'}
                        </span>
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800 text-base ${!st.isUnlocked ? 'text-gray-600' : ''}">Niveau ${lvl.levelNumber} : ${lvl.name}</h4>
                                <span class="text-xs px-2 py-0.5 rounded-md ${st.isUnlocked ? lvl.cocarde.pillBg : 'bg-gray-200 text-gray-600 border border-gray-300'} border font-medium">
                                    ${lvl.subtitle}
                                </span>
                            </div>
                            <p class="text-xs text-gray-500 mt-0.5">
                                +${lvl.pointsPerBadge} points par badge
                            </p>
                        </div>
                    </div>

                    <!-- Statut du niveau + Bouton chevron -->
                    <div class="flex items-center gap-3">
                        ${st.isUnlocked ? `
                            <span class="text-xs font-semibold text-gray-600">${st.unlockedCount} / ${st.totalCount} acquis</span>
                            <div class="w-20 bg-gray-200 rounded-full h-2 overflow-hidden hidden sm:block">
                                <div class="bg-green-600 h-full rounded-full" style="width: ${st.percent}%"></div>
                            </div>
                        ` : `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                                <i class="fas fa-lock text-amber-600 text-[11px]"></i>
                                <span>Niveau Verrouillé</span>
                            </span>
                        `}
                        <div class="w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-2xs shrink-0">
                            <i class="fas fa-chevron-down text-xs transition-transform duration-200 level-chevron ${isExpanded ? 'rotate-180' : ''}"></i>
                        </div>
                    </div>
                </div>

                <!-- Grille des badges repliable -->
                <div class="level-body ${isExpanded ? '' : 'hidden'} relative overflow-hidden" id="level-body-${lvl.id}">
                    <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 ${st.isUnlocked ? 'bg-white' : 'bg-gray-100/40 filter blur-[1.5px] opacity-35 select-none pointer-events-none'}">
            `;

            lvl.badgeIds.forEach((badgeId, badgeIndex) => {
                if (!st.isUnlocked) {
                    html += `
                    <div class="badge-card rounded-lg p-3.5 border border-dashed border-gray-300 bg-gray-50/80 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-2.5">
                                <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-600 border border-gray-300">
                                    🔒 ${lvl.name} • Mission #${badgeIndex + 1}
                                </span>
                                <span class="text-xs font-bold text-gray-400">
                                    +${lvl.pointsPerBadge} pts
                                </span>
                            </div>
                            <div class="flex items-start gap-2.5 mb-2">
                                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 bg-gray-200 text-gray-400">
                                    <i class="fas fa-lock"></i>
                                </div>
                                <div class="flex-grow">
                                    <h5 class="font-semibold text-sm text-gray-500 flex items-center gap-1.5">
                                        <span>Mission Secrète</span>
                                    </h5>
                                    <p class="text-xs text-gray-400 mt-0.5 italic">Débloquez le niveau ${lvl.levelNumber} pour révéler ce défi...</p>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-gray-200/60">
                            <div class="text-[11px] text-gray-400 flex items-center gap-1">
                                <i class="fas fa-lock text-[10px]"></i> Défi masqué
                            </div>
                        </div>
                    </div>
                    `;
                    return;
                }

                const badge = BADGES_DEFINITIONS[badgeId];
                const badgeState = data.unlockedBadges[badgeId] || { unlocked: false, races: [] };
                const isUnlocked = badgeState.unlocked && st.isUnlocked;
                const racesForBadge = badgeState.races || [];

                html += `
                <div class="badge-card rounded-lg p-3.5 border transition flex flex-col justify-between ${
                    isUnlocked 
                        ? 'bg-white border-green-200 hover:border-green-300 shadow-xs' 
                        : 'bg-gray-50/80 border-gray-200 opacity-75'
                }">
                    <div>
                        <div class="flex items-center justify-between mb-2.5">
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded ${lvl.cocarde.pillBg} border">
                                ${lvl.emoji} ${lvl.name}
                            </span>
                            <span class="text-xs font-bold ${isUnlocked ? 'text-green-700' : 'text-gray-400'}">
                                +${lvl.pointsPerBadge} pts
                            </span>
                        </div>
                        <div class="flex items-start gap-2.5 mb-2">
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                                isUnlocked 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-200 text-gray-400'
                            }">
                                <i class="fas ${isUnlocked ? badge.icon : 'fa-lock'}"></i>
                            </div>
                            <div class="flex-grow">
                                <h5 class="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                                    <span>${badge.name}</span>
                                    ${isUnlocked ? `<i class="fas fa-check text-green-600 text-xs" title="Badge débloqué"></i>` : ''}
                                </h5>
                                <p class="text-xs text-gray-600 mt-0.5 leading-relaxed">${badge.description}</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-gray-100">
                `;

                if (isUnlocked && racesForBadge.length > 0) {
                    html += `
                        <div class="text-[11px] text-gray-400 font-medium mb-1">Validé sur :</div>
                        <div class="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                    `;
                    const sortedRaces = [...racesForBadge].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                    sortedRaces.slice(0, 2).forEach(r => {
                        const year = r.date ? new Date(r.date).getFullYear() : '';
                        html += `
                            <button class="badge-race-name text-left text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-green-100 hover:text-green-800 text-gray-700 transition truncate max-w-full cursor-pointer" 
                                    data-race-id="${r.id}" title="${r.name}">
                                <span class="truncate">${r.name}</span>
                                <span class="text-gray-400 text-[10px]">(${year})</span>
                            </button>
                        `;
                    });

                    if (sortedRaces.length > 2) {
                        html += `<span class="text-[10px] text-gray-500 self-center">+${sortedRaces.length - 2} autre(s)</span>`;
                    }
                    html += `</div>`;
                } else if (isUnlocked) {
                    html += `<div class="text-[11px] font-semibold text-green-700 flex items-center gap-1"><i class="fas fa-check"></i> Défi accompli</div>`;
                } else {
                    html += `<div class="text-[11px] text-gray-400 flex items-center gap-1"><i class="fas fa-hourglass-start text-[10px]"></i> Défi en attente</div>`;
                }

                html += `
                    </div>
                </div>
                `;
            });

            html += `</div>`; // fin grid

            if (!st.isUnlocked && prevLvl) {
                html += `
                <div class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gray-900/15 backdrop-blur-xs text-center">
                    <div class="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl p-6 shadow-2xl max-w-md mx-auto flex flex-col items-center">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center text-3xl mb-3 shadow-md transform hover:scale-105 transition">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h5 class="text-base font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                            <span>Niveau ${lvl.levelNumber} : ${lvl.name} verrouillé</span>
                        </h5>
                        <p class="text-xs text-gray-600 max-w-sm mx-auto mb-3 leading-relaxed">
                            Vous devez débloquer au moins <strong>${lvl.requiredFromPrevious} badges</strong> du niveau précédent (<strong>${prevLvl.emoji} ${prevLvl.name}</strong>) pour ouvrir ce niveau et révéler ses défis secrets.
                        </p>
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold shadow-xs">
                            <i class="fas fa-lock text-amber-600 text-[11px]"></i>
                            <span>Progression requise : <strong class="text-green-700">${prevUnlockedCount} / ${lvl.requiredFromPrevious}</strong> badges sur ${prevLvl.name}</span>
                        </div>
                    </div>
                </div>
                `;
            }

            html += `
                </div>
            </div>
            `;
        });

        content.innerHTML = html;

        // Onglets
        content.querySelectorAll('.level-tab-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                activeLevelTab = this.getAttribute('data-level');
                if (activeLevelTab !== 'all') {
                    userLevelExpandedState[activeLevelTab] = true;
                }
                displayRaceBadgesModal();
            });
        });

        // Replier / Déplier les sections de niveaux
        content.querySelectorAll('.level-header-toggle').forEach(header => {
            header.addEventListener('click', function () {
                const levelId = this.getAttribute('data-level-id');
                const body = document.getElementById(`level-body-${levelId}`);
                const chevron = this.querySelector('.level-chevron');
                if (!body) return;

                const isCurrentlyHidden = body.classList.contains('hidden');
                if (isCurrentlyHidden) {
                    body.classList.remove('hidden');
                    if (chevron) chevron.classList.add('rotate-180');
                    userLevelExpandedState[levelId] = true;
                } else {
                    body.classList.add('hidden');
                    if (chevron) chevron.classList.remove('rotate-180');
                    userLevelExpandedState[levelId] = false;
                }
            });
        });

        // Clic sur course pour ouvrir ses détails
        content.querySelectorAll('.badge-race-name').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                const raceId = this.getAttribute('data-race-id');
                modal.classList.add('hidden');
                if (typeof showRaceDetails === 'function') {
                    showRaceDetails(raceId);
                }
            });
        });

        modal.classList.remove('hidden');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. API PUBLIQUE & COMPATIBILITÉ
    // ─────────────────────────────────────────────────────────────────────────────
    const BADGE_PRESTIGE_SCORES = {
        // Niveau 5 : BOOTS (75 pts)
        ultra_runner: 590,
        skyrunner: 585,
        speed_flash: 580,
        titan_300km: 570,
        collector_20: 560,
        four_seasons: 550,

        // Niveau 4 : BASKET (50 pts)
        marathon_finisher: 490,
        iron_triathlon: 485,
        climber_2000: 480,
        sub_40_10k: 475,
        centurion_km: 460,
        polyvalent_runner: 450,

        // Niveau 3 : MOCASSIN (35 pts)
        half_marathon: 390,
        climber_1000: 385,
        hyrox_racer: 380,
        sub_50_10k: 375,
        relay_specialist: 370,
        explorer_cities: 350,

        // Niveau 2 : SANDALE (20 pts)
        climber_500: 285,
        sub_60_10k: 280,
        tri_or_relay: 275,
        high_roller: 270,
        ten_k: 265,
        regular_runner: 240,

        // Niveau 1 : TONG (10 pts)
        hill_discovery: 185,
        companion_run: 180,
        cheap_run: 175,
        five_k: 165,
        finish_line: 140,
        first_step: 100
    };

    function sortBadgesByPrestige(badgeKeys) {
        if (!badgeKeys || !Array.isArray(badgeKeys)) return [];
        return [...badgeKeys].sort((a, b) => {
            const scoreA = BADGE_PRESTIGE_SCORES[a] || 0;
            const scoreB = BADGE_PRESTIGE_SCORES[b] || 0;
            return scoreB - scoreA;
        });
    }

    function getBadgeInfo(badgeKey) {
        const legacyMap = {
            hasRPMile: 'sub_60_10k',
            hasMostExpensive: 'high_roller',
            hasMostElevation: 'climber_1000',
            hasLongestDistance: 'half_marathon'
        };

        const resolvedKey = legacyMap[badgeKey] || badgeKey;
        const badge = BADGES_DEFINITIONS[resolvedKey];
        if (!badge) return null;

        const level = LEVELS_CONFIG.find(l => l.levelNumber === badge.level) || LEVELS_CONFIG[0];

        return {
            id: badge.id,
            name: badge.name,
            icon: badge.icon,
            description: badge.description,
            level: badge.level,
            levelName: level.name,
            levelEmoji: level.emoji,
            points: level.pointsPerBadge,
            cocarde: level.cocarde,
            colorClass: `${level.cocarde.bg} ${level.cocarde.text} ${level.cocarde.border}`,
            prestigeScore: BADGE_PRESTIGE_SCORES[badge.id] || 0
        };
    }

    function calculateRaceBadges(racesList) {
        const data = calculateGamifiedBadges(racesList);
        return data.badgesByRace;
    }

    function setupBadgesListeners() {
        const badgesBtn = document.getElementById('badgesBtn');
        const modal = document.getElementById('badgesModal');
        const closeBtn = document.getElementById('closeBadgesModal');

        if (badgesBtn) {
            badgesBtn.onclick = (e) => {
                e.preventDefault();
                displayRaceBadgesModal();
            };
        }

        if (closeBtn) {
            closeBtn.onclick = () => { if (modal) modal.classList.add('hidden'); };
        }

        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target.id === 'badgesModal' || e.target.id === 'badgesModalOverlay') {
                    modal.classList.add('hidden');
                }
            });
        }
    }

    function updateBadgesButtonVisibility() {
        const badgesBtn = document.getElementById('badgesBtn');
        if (!badgesBtn) return;
        badgesBtn.classList.remove('hidden');
    }

    // Injection au chargement
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('badgesModal')) {
            const div = document.createElement('div');
            div.innerHTML = badgesModalHTML;
            document.body.appendChild(div);
            setupBadgesListeners();

            document.addEventListener('click', function (e) {
                const badgeElement = e.target.closest('.detail-badge-item');
                if (badgeElement) {
                    displayRaceBadgesModal();
                }
            });

            if (typeof updateBadgesButtonVisibility === 'function') {
                updateBadgesButtonVisibility();
            }
        }
    });

    // Exports globaux
    window.LEVELS_CONFIG = LEVELS_CONFIG;
    window.BADGES_DEFINITIONS = BADGES_DEFINITIONS;
    window.BADGE_PRESTIGE_SCORES = BADGE_PRESTIGE_SCORES;
    window.sortBadgesByPrestige = sortBadgesByPrestige;
    window.getBadgeInfo = getBadgeInfo;
    window.calculateRaceBadges = calculateRaceBadges;
    window.calculateRecordCocardes = calculateRecordCocardes;
    window.calculateGamifiedBadges = calculateGamifiedBadges;
    window.displayRaceBadgesModal = displayRaceBadgesModal;
    window.robustDisplayBadges = displayRaceBadgesModal;
    window.updateBadgesButtonVisibility = updateBadgesButtonVisibility;

})();
