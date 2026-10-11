// ====================================================================
// MODALE DE STATISTIQUES
// ====================================================================

(function () {
    'use strict';

    // Attendre que le DOM soit prêt
    function initStatsModal() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initStatsModal);
            return;
        }

        console.log('[stats-modal] Initialisation de la modale de statistiques');

        // Références aux éléments DOM
        const statsModal = document.getElementById('statsModal');
        const statsBtn = document.getElementById('statsBtn');
        const closeStatsModal = document.getElementById('closeStatsModal');
        const statsContent = document.getElementById('statsContent');
        let evolutionChartInstance = null;

        // Variable globale pour stocker le mode d'affichage des stats
        // Restaurer depuis localStorage ou utiliser false par défaut
        window.statsIncludeFuture = localStorage.getItem('statsIncludeFuture') === 'true';

        // Fonction pour récupérer l'ensemble de toutes les courses enregistrées (indépendamment des filtres actifs)
        function getAllUserRaces() {
            if (window.allUserRaces && Array.isArray(window.allUserRaces) && window.allUserRaces.length > 0) {
                return window.allUserRaces;
            }
            if (window.originalRaces && Array.isArray(window.originalRaces) && window.originalRaces.length > 0) {
                return window.originalRaces;
            }
            if (typeof races !== 'undefined' && Array.isArray(races) && races.length > 0) {
                return races;
            }
            if (window.races && Array.isArray(window.races)) {
                return window.races;
            }
            return [];
        }

        // Fonction pour détecter les courses futures
        function getFutureRacesInfo() {
            const racesData = getAllUserRaces();
            if (!racesData || racesData.length === 0) return { totalFutureRaces: 0, futureRaces: [] };

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const futureRaces = [];
            racesData.forEach(race => {
                if (!race.date) return;
                const raceDate = new Date(race.date);
                raceDate.setHours(0, 0, 0, 0);
                if (raceDate >= today) {
                    futureRaces.push({
                        name: race.name,
                        date: race.date
                    });
                }
            });

            // Trier par date puis par nom
            futureRaces.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA - dateB;
                }
                return a.name.localeCompare(b.name);
            });

            return { totalFutureRaces: futureRaces.length, futureRaces };
        }

        // Fonction pour convertir le temps (hh:mm:ss) en secondes
        function timeToSeconds(timeStr) {
            if (!timeStr || timeStr === '00:00:00' || timeStr.trim() === '') return null;
            const parts = timeStr.split(':');
            if (parts.length !== 3) return null;
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseInt(parts[2]) || 0;
            return hours * 3600 + minutes * 60 + seconds;
        }

        // Fonction pour formater les secondes en hh:mm:ss
        function secondsToTime(seconds) {
            if (seconds === null || seconds === undefined) return '00:00:00';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        // Fonction pour calculer les statistiques des courses
        function calculateRaceStats(includeFuture = false) {
            const racesData = getAllUserRaces();
            // console.log('[stats-modal] calculateRaceStats - races count:', racesData ? racesData.length : 0);

            if (!racesData || racesData.length === 0) return null;

            // Filtrer les courses selon le paramètre includeFuture
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const pastRaces = racesData.filter(race => {
                if (!race.date) return false;
                const raceDate = new Date(race.date);
                raceDate.setHours(0, 0, 0, 0);
                
                // Si includeFuture est false, ne prendre que les courses passées
                // Si includeFuture est true, prendre toutes les courses
                // La règle ajoutée : si un chrono est disponible, alors la course est incluse même aujourd'hui.
                const hasValidTime = race.time && race.time !== '00:00:00' && race.time.trim() !== '';
                return includeFuture || raceDate < today || hasValidTime;
            });

            if (pastRaces.length === 0) return null;

            // Extraire les valeurs valides pour chaque métrique
            const prices = pastRaces
                .map(r => parseFloat(r.price))
                .filter(p => !isNaN(p) && p > 0);

            // Helper : vérifie si un tour de relais appartient à l'utilisateur
            function isUserRelayLap(lap) {
                if (!lap) return false;
                const runner = String(lap.runner || '').trim().toLowerCase();
                if (!runner || runner === 'moi' || runner === 'tous ensemble' || runner === 'all') return true;
                const pseudo = (typeof window !== 'undefined' && window.currentUserPseudo) ? String(window.currentUserPseudo).trim().toLowerCase() : '';
                if (pseudo && runner === pseudo) return true;
                return false;
            }

            // Helper : calcule la distance réelle d'une course pour l'utilisateur
            function getRealDistance(r) {
                if (r.terrain === 'relai' && r.relayLaps && r.relayLaps.length > 0) {
                    return r.relayLaps.reduce((sum, lap) => {
                        if (isUserRelayLap(lap)) {
                            return sum + (parseFloat(lap.dist) || 0);
                        }
                        return sum;
                    }, 0);
                }
                if (r.terrain === 'triathlon') {
                    if (r.raceFormat === 'team') {
                        if (r.raceRelaySport === 'swim') return (parseFloat(r.swimDistance) || 0) / 1000;
                        if (r.raceRelaySport === 'bike') return parseFloat(r.bikeDistance) || 0;
                        return parseFloat(r.distance) || 0;
                    }
                    const swim = (parseFloat(r.swimDistance) || 0) / 1000;
                    const bike = parseFloat(r.bikeDistance) || 0;
                    const run = parseFloat(r.distance) || 0;
                    return swim + bike + run;
                }
                return parseFloat(r.distance) || 0;
            }

            // Helper : calcule le D+ réel d'une course (relai, triathlon ou standard)
            function getRealElevation(r) {
                if (r.terrain === 'relai' && r.relayLaps && r.relayLaps.length > 0) {
                    return r.relayLaps.reduce((sum, lap) => {
                        if (isUserRelayLap(lap)) {
                            return sum + (parseFloat(lap.elev) || 0);
                        }
                        return sum;
                    }, 0);
                }
                if (r.terrain === 'triathlon' && r.raceFormat !== 'team') {
                    return (parseFloat(r.bikeElevation) || 0) + (parseFloat(r.elevation) || 0);
                }
                return parseFloat(r.elevation) || 0;
            }

            // Helper : calcule le D- réel d'une course (relai, triathlon ou standard)
            function getRealElevationNeg(r) {
                if (r.terrain === 'relai' && r.relayLaps && r.relayLaps.length > 0) {
                    return r.relayLaps.reduce((sum, lap) => {
                        if (isUserRelayLap(lap)) {
                            return sum + (parseFloat(lap.elevNeg) || 0);
                        }
                        return sum;
                    }, 0);
                }
                if (r.terrain === 'triathlon' && r.raceFormat !== 'team') {
                    return (parseFloat(r.bikeElevationNeg) || 0) + (parseFloat(r.elevationNeg) || 0);
                }
                return parseFloat(r.elevationNeg) || 0;
            }

            const elevations = pastRaces
                .map(r => getRealElevation(r))
                .filter(e => !isNaN(e) && e > 0);

            const elevationsNeg = pastRaces
                .map(r => getRealElevationNeg(r))
                .filter(e => !isNaN(e) && e > 0);


            const times = pastRaces
                .map(r => timeToSeconds(r.time))
                .filter(t => t !== null && t > 0);

            // Trouver les records
            let longestDistanceRace = null;
            let maxDistance = 0;
            pastRaces.forEach(race => {
                const totalDist = getRealDistance(race);
                if (totalDist > maxDistance) {
                    maxDistance = totalDist;
                    longestDistanceRace = race;
                }
            });

            // Courses avec le prix le plus élevé
            let highestPriceRace = null;
            if (prices.length > 0) {
                const maxPrice = Math.max(...prices);
                highestPriceRace = pastRaces.find(r => parseFloat(r.price) === maxPrice);
            }

            // Courses avec le dénivelé le plus élevé
            let highestElevationRace = null;
            if (elevations.length > 0) {
                const maxElevation = Math.max(...elevations);
                highestElevationRace = pastRaces.find(r => getRealElevation(r) === maxElevation);
            }

            // Course avec le dénivelé négatif le plus élevé
            let highestElevationNegRace = null;
            if (elevationsNeg.length > 0) {
                const maxElevNeg = Math.max(...elevationsNeg);
                highestElevationNegRace = pastRaces.find(r => getRealElevationNeg(r) === maxElevNeg);
            }

            // Courses avec le temps le plus long
            let longestTimeRace = null;
            if (times.length > 0) {
                const maxTime = Math.max(...times);
                longestTimeRace = pastRaces.find(r => timeToSeconds(r.time) === maxTime);
            }

            // Calculer les distances (gérer triathlon et relai)
            const distances = pastRaces
                .map(race => getRealDistance(race))
                .filter(d => !isNaN(d) && d > 0);

            // Calcul statistiques pour les distances
            let distanceStats = {};
            if (distances.length > 0) {
                const sortedDistances = [...distances].sort((a, b) => a - b);
                const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
                const min = Math.min(...distances);
                const max = Math.max(...distances);
                const range = max - min;
                const median = sortedDistances.length % 2 === 0
                    ? (sortedDistances[sortedDistances.length / 2 - 1] + sortedDistances[sortedDistances.length / 2]) / 2
                    : sortedDistances[Math.floor(sortedDistances.length / 2)];
                const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;
                const standardDeviation = Math.sqrt(variance);

                distanceStats = {
                    mean: Math.round(mean * 100) / 100,
                    range: Math.round(range * 100) / 100,
                    standardDeviation: Math.round(standardDeviation * 100) / 100,
                    median: Math.round(median * 100) / 100,
                    min: Math.round(min * 100) / 100,
                    max: Math.round(max * 100) / 100,
                    sum: Math.round(distances.reduce((a, b) => a + b, 0) * 100) / 100
                };
            }

            // Calcul statistiques pour les prix
            let priceStats = {};
            if (prices.length > 0) {
                const sortedPrices = [...prices].sort((a, b) => a - b);
                const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                const range = max - min;
                const median = sortedPrices.length % 2 === 0
                    ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
                    : sortedPrices[Math.floor(sortedPrices.length / 2)];
                const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
                const standardDeviation = Math.sqrt(variance);

                priceStats = {
                    mean: Math.round(mean * 100) / 100,
                    range: Math.round(range * 100) / 100,
                    standardDeviation: Math.round(standardDeviation * 100) / 100,
                    median: Math.round(median * 100) / 100,
                    min: min,
                    max: max,
                    sum: Math.round(prices.reduce((a, b) => a + b, 0) * 100) / 100
                };
            }

            // Calculer les statistiques pour les dénivelés
            let elevationStats = {};
            if (elevations.length > 0) {
                const sortedElevations = [...elevations].sort((a, b) => a - b);
                const mean = elevations.reduce((a, b) => a + b, 0) / elevations.length;
                const min = Math.min(...elevations);
                const max = Math.max(...elevations);
                const range = max - min;
                const median = sortedElevations.length % 2 === 0
                    ? (sortedElevations[sortedElevations.length / 2 - 1] + sortedElevations[sortedElevations.length / 2]) / 2
                    : sortedElevations[Math.floor(sortedElevations.length / 2)];
                const variance = elevations.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / elevations.length;
                const standardDeviation = Math.sqrt(variance);

                elevationStats = {
                    mean: Math.round(mean),
                    range: Math.round(range),
                    standardDeviation: Math.round(standardDeviation),
                    median: Math.round(median),
                    min: min,
                    max: max,
                    sum: Math.round(elevations.reduce((a, b) => a + b, 0))
                };
            }

            // Calculer les statistiques pour les dénivelés négatifs (D-)
            let elevationNegStats = {};
            if (elevationsNeg.length > 0) {
                const sortedElevationsNeg = [...elevationsNeg].sort((a, b) => a - b);
                const mean = elevationsNeg.reduce((a, b) => a + b, 0) / elevationsNeg.length;
                const min = Math.min(...elevationsNeg);
                const max = Math.max(...elevationsNeg);
                const range = max - min;
                const median = sortedElevationsNeg.length % 2 === 0
                    ? (sortedElevationsNeg[sortedElevationsNeg.length / 2 - 1] + sortedElevationsNeg[sortedElevationsNeg.length / 2]) / 2
                    : sortedElevationsNeg[Math.floor(sortedElevationsNeg.length / 2)];
                const variance = elevationsNeg.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / elevationsNeg.length;
                const standardDeviation = Math.sqrt(variance);

                elevationNegStats = {
                    mean: Math.round(mean),
                    range: Math.round(range),
                    standardDeviation: Math.round(standardDeviation),
                    median: Math.round(median),
                    min: min,
                    max: max,
                    sum: Math.round(elevationsNeg.reduce((a, b) => a + b, 0))
                };
            }

            // Calculer les statistiques pour les temps
            let timeStats = {};
            if (times.length > 0) {
                const sortedTimes = [...times].sort((a, b) => a - b);
                const mean = times.reduce((a, b) => a + b, 0) / times.length;
                const min = Math.min(...times);
                const max = Math.max(...times);
                const range = max - min;
                const median = sortedTimes.length % 2 === 0
                    ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
                    : sortedTimes[Math.floor(sortedTimes.length / 2)];
                const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
                const standardDeviation = Math.sqrt(variance);

                timeStats = {
                    mean: Math.round(mean),
                    range: Math.round(range),
                    standardDeviation: Math.round(standardDeviation),
                    median: Math.round(median),
                    min: min,
                    max: max,
                    sum: Math.round(times.reduce((a, b) => a + b, 0))
                };
            }

            // Calculer les statistiques par terrain
            let terrainStats = { route: 0, trail: 0, triathlon: 0, relai: 0, hyrox: 0, total: 0 };
            pastRaces.forEach(race => {
                if (race.terrain) {
                    const t = race.terrain.toLowerCase();
                    if (terrainStats.hasOwnProperty(t)) {
                        terrainStats[t]++;
                        terrainStats.total++;
                    }
                }
            });

            // Préparer les données pour le graphique des distances
            const racesWithDistance = pastRaces
                .map(race => ({
                    race: race,
                    value: getRealDistance(race)
                }))
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);

            // Préparer les données pour le graphique des prix
            const racesWithPrice = pastRaces
                .map(race => ({
                    race: race,
                    value: parseFloat(race.price) || 0
                }))
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);

            // Préparer les données pour le graphique des temps
            const racesWithTime = pastRaces
                .map(race => {
                    const isRelay = race.terrain === 'relai' && race.relayLaps && race.relayLaps.length > 0;
                    let time = 0;
                    if (isRelay) {
                        const totalS = race.relayLaps.reduce((sum, lap) => {
                            if (isUserRelayLap(lap)) {
                                return sum + (timeToSeconds(lap.time) || 0);
                            }
                            return sum;
                        }, 0);
                        time = totalS;
                    } else {
                        time = timeToSeconds(race.time);
                    }
                    return {
                        race: race,
                        value: time || 0
                    };
                })
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);

            // Préparer les données pour le graphique des dénivelés (D+)
            const racesWithElevation = pastRaces
                .map(race => ({
                    race: race,
                    value: getRealElevation(race)
                }))
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);

            // Préparer les données pour le graphique des dénivelés négatifs (D-)
            const racesWithElevationNeg = pastRaces
                .map(race => ({
                    race: race,
                    value: getRealElevationNeg(race)
                }))
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);


            // Préparer les données pour le graphique Prix au Km
            const racesWithPricePerKm = pastRaces
                .map(race => {
                    const price = parseFloat(race.price) || 0;
                    let distance = parseFloat(race.distance) || 0;

                    if (race.terrain === 'triathlon') {
                        distance += (parseFloat(race.swimDistance) || 0) / 1000;
                        distance += parseFloat(race.bikeDistance) || 0;
                    }

                    return {
                        race: race,
                        value: (price > 0 && distance > 0) ? (price / distance) : 0
                    };
                })
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);

            // Préparer les données pour le graphique Prix au Km (ft. dénivelé)
            const racesWithPricePerKmWithElevation = pastRaces
                .map(race => {
                    // Doit avoir une donnée de dénivelé renseignée
                    if (race.elevation === undefined || race.elevation === null || race.elevation === '') {
                        return { race: race, value: 0 };
                    }
                    const price = parseFloat(race.price) || 0;
                    let distance = parseFloat(race.distance) || 0;

                    if (race.terrain === 'triathlon') {
                        distance += (parseFloat(race.swimDistance) || 0) / 1000;
                        distance += parseFloat(race.bikeDistance) || 0;
                    }

                    const elevation = parseFloat(race.elevation) || 0;

                    // On exclut les courses avec 0 de dénivelé pour ce graphique spécifique
                    if (elevation <= 0) {
                        return { race: race, value: 0 };
                    }

                    // 100m D+ = 1km flat
                    const equivalentDistance = distance + (elevation / 100);
                    return {
                        race: race,
                        value: (price > 0 && distance > 0) ? (price / equivalentDistance) : 0
                    };
                })
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);

            // Calculer les statistiques spécifiques au Triathlon
            let triathlonStats = null;
            const triRaces = pastRaces.filter(r => r.terrain === 'triathlon');
            if (triRaces.length > 0) {
                const totalSwim = triRaces.reduce((sum, r) => sum + (parseInt(r.swimDistance) || 0), 0);
                const totalBike = triRaces.reduce((sum, r) => sum + (parseFloat(r.bikeDistance) || 0), 0);
                // Note: r.distance stores the RUN distance for triathlons
                const totalRun = triRaces.reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0);

                triathlonStats = {
                    count: triRaces.length,
                    avgSwim: Math.round(totalSwim / triRaces.length),
                    avgBike: Math.round((totalBike / triRaces.length) * 100) / 100,
                    avgRun: Math.round((totalRun / triRaces.length) * 100) / 100
                };
            }

            // Calculer les statistiques spécifiques Hyrox
            const hyroxEventNames = [
                "Course 1km", "SkiErg 1000m",
                "Course 1km", "Sled Push 50m",
                "Course 1km", "Sled Pull 50m",
                "Course 1km", "Burpee Broad Jumps 80m",
                "Course 1km", "Rowing 1000m",
                "Course 1km", "Farmers Carry 200m",
                "Course 1km", "Sandbag Lunges 100m",
                "Course 1km", "Wall Balls"
            ];
            // Noms affichage condensé (uniquement les 8 exercices, index pairs = course 1km)
            const hyroxExerciseNames = [
                "SkiErg 1000m", "Sled Push 50m", "Sled Pull 50m", "Burpee Broad Jumps 80m",
                "Rowing 1000m", "Farmers Carry 200m", "Sandbag Lunges 100m", "Wall Balls"
            ];
            let hyroxStats = null;
            const hyroxRaces = pastRaces.filter(r => r.terrain === 'hyrox');
            if (hyroxRaces.length > 0) {
                // Temps totaux (race.time)
                const hyroxTimes = hyroxRaces
                    .map(r => timeToSeconds(r.time))
                    .filter(t => t !== null && t > 0);

                let bestTotalTime = null;
                let avgTotalTime = null;
                let bestTotalRace = null;
                if (hyroxTimes.length > 0) {
                    bestTotalTime = Math.min(...hyroxTimes);
                    avgTotalTime = Math.round(hyroxTimes.reduce((a, b) => a + b, 0) / hyroxTimes.length);
                    bestTotalRace = hyroxRaces.find(r => timeToSeconds(r.time) === bestTotalTime);
                }

                // Par étape (16 slots : index 0=Course1, 1=SkiErg, 2=Course2, 3=SledPush, ...)
                const perStep = hyroxEventNames.map((name, idx) => {
                    const stepTimes = hyroxRaces
                        .filter(r => r.hyroxLaps && r.hyroxLaps[idx])
                        .map(r => timeToSeconds(r.hyroxLaps[idx]))
                        .filter(t => t !== null && t > 0);

                    if (stepTimes.length === 0) return null;
                    return {
                        name,
                        best: Math.min(...stepTimes),
                        avg: Math.round(stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length),
                        count: stepTimes.length
                    };
                });

                // Agréger les 8 segments "Course 1km" (index 0,2,4,6,8,10,12,14)
                const runSegments = [0, 2, 4, 6, 8, 10, 12, 14].map(idx => perStep[idx]).filter(Boolean);
                let runAgg = null;
                if (runSegments.length > 0) {
                    const bestRuns = runSegments.map(s => s.best).filter(Boolean);
                    const avgRuns = runSegments.map(s => s.avg).filter(Boolean);
                    runAgg = {
                        best: bestRuns.length > 0 ? Math.min(...bestRuns) : null,
                        avg: avgRuns.length > 0 ? Math.round(avgRuns.reduce((a, b) => a + b, 0) / avgRuns.length) : null
                    };
                }

                // Exercices (index 1,3,5,7,9,11,13,15)
                const exercises = [1, 3, 5, 7, 9, 11, 13, 15].map((idx, i) => {
                    const step = perStep[idx];
                    return step ? { name: hyroxExerciseNames[i], best: step.best, avg: step.avg, count: step.count } : null;
                }).filter(Boolean);

                hyroxStats = {
                    count: hyroxRaces.length,
                    bestTotalTime,
                    avgTotalTime,
                    bestTotalRace,
                    runAgg,
                    exercises
                };
            }

            // Calcul des allures & chronos moyens et RP (1km, 10km, semi-marathon) avec modèle d'endurance
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
                                    // Distance équivalente à plat : 100m D+ = 1km à plat
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

                // Estimation de l'indice d'endurance / coefficient de fatigue (Formule athlétique de Peter Riegel)
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

                // Extraction des courses réelles correspondant aux distances cibles
                const real1kRaces = runData.filter(r => r.flatDist >= 0.8 && r.flatDist <= 1.4);
                const real10kRaces = runData.filter(r => r.flatDist >= 8.5 && r.flatDist <= 11.5);
                const realSemiRaces = runData.filter(r => r.flatDist >= 19.0 && r.flatDist <= 23.0);

                // --- 1 KM : MOYENNE & RP ---
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

                // RP 1 km
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

                // --- 10 KM : MOYENNE & RP ---
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

                // RP 10 km
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

                // --- SEMI-MARATHON (21.0975 KM) : MOYENNE & RP ---
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

                // RP Semi-Marathon
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
                    sampleSize: runData.length,
                    fatigueExponent: Math.round(fatigueExponent * 100) / 100,
                    k1: {
                        distance: 1.0,
                        timeSec: est1kSec,
                        timeFormatted: formatHumanTime(est1kSec),
                        timeClock: secondsToTime(est1kSec),
                        paceStr: formatPace(est1kSec),
                        speedStr: formatSpeed(1.0, est1kSec),
                        hasRealData: is1kReal,
                        realCount: real1kRaces.length,
                        rp: {
                            timeSec: rp1k.timeSec,
                            timeFormatted: formatHumanTime(rp1k.timeSec),
                            timeClock: secondsToTime(rp1k.timeSec),
                            paceStr: formatPace(rp1k.timeSec),
                            speedStr: formatSpeed(1.0, rp1k.timeSec),
                            isReal: rp1k.isReal,
                            raceName: rp1k.raceName,
                            raceId: rp1k.raceId,
                            rawRace: rp1k.rawRace
                        }
                    },
                    k10: {
                        distance: 10.0,
                        timeSec: est10kSec,
                        timeFormatted: formatHumanTime(est10kSec),
                        timeClock: secondsToTime(est10kSec),
                        paceStr: formatPace(est10kSec / 10.0),
                        speedStr: formatSpeed(10.0, est10kSec),
                        hasRealData: is10kReal,
                        realCount: real10kRaces.length,
                        rp: {
                            timeSec: rp10k.timeSec,
                            timeFormatted: formatHumanTime(rp10k.timeSec),
                            timeClock: secondsToTime(rp10k.timeSec),
                            paceStr: formatPace(rp10k.timeSec / 10.0),
                            speedStr: formatSpeed(10.0, rp10k.timeSec),
                            isReal: rp10k.isReal,
                            raceName: rp10k.raceName,
                            raceId: rp10k.raceId,
                            rawRace: rp10k.rawRace
                        }
                    },
                    semi: {
                        distance: targetSemiDist,
                        timeSec: estSemiSec,
                        timeFormatted: formatHumanTime(estSemiSec),
                        timeClock: secondsToTime(estSemiSec),
                        paceStr: formatPace(estSemiSec / targetSemiDist),
                        speedStr: formatSpeed(targetSemiDist, estSemiSec),
                        hasRealData: isSemiReal,
                        realCount: realSemiRaces.length,
                        rp: {
                            timeSec: rpSemi.timeSec,
                            timeFormatted: formatHumanTime(rpSemi.timeSec),
                            timeClock: secondsToTime(rpSemi.timeSec),
                            paceStr: formatPace(rpSemi.timeSec / targetSemiDist),
                            speedStr: formatSpeed(targetSemiDist, rpSemi.timeSec),
                            isReal: rpSemi.isReal,
                            raceName: rpSemi.raceName,
                            raceId: rpSemi.raceId,
                            rawRace: rpSemi.rawRace
                        }
                    }
                };
            }

            const estimatedPaces = calculateEstimatedPaces(pastRaces);

            return {
                totalRaces: pastRaces.length,
                validRaces: pastRaces,
                longestDistanceRace,
                maxDistance,
                highestPriceRace,
                highestElevationRace,
                highestElevationNegRace,
                longestTimeRace,
                distanceStats,
                priceStats,
                elevationStats,
                elevationNegStats,
                timeStats,
                terrainStats,
                racesWithDistance,
                racesWithPrice,
                racesWithTime,
                racesWithElevation,
                racesWithElevationNeg,
                racesWithPricePerKm,
                racesWithPricePerKmWithElevation,
                triathlonStats,
                hyroxStats,
                estimatedPaces
            };
        }

        // Fonction pour ouvrir la fiche de détail d'une course depuis les statistiques
        function openRaceFromStats(raceId) {
            if (!raceId) return;
            const statsModal = document.getElementById('statsModal');
            if (statsModal) {
                const content = statsModal.querySelector('.fade-in');
                if (content) content.classList.remove('active');
                statsModal.classList.add('hidden');
            }
            if (typeof showRaceDetails === 'function') {
                showRaceDetails(raceId);
            }
        }

        // Fonction pour formater le nom de la course (gestion des doublons)
        function getUniqueRaceName(race, contextRaces, isChart = false) {
            if (!race) return '';
            const duplicates = contextRaces.filter(r => r.name.trim().toLowerCase() === race.name.trim().toLowerCase());
            let raceDisplayName = race.name;
            if (duplicates.length > 1 && race.date) {
                const year = new Date(race.date).getFullYear();
                if (isChart === 'text') {
                    raceDisplayName = `${race.name} (${year})`;
                } else if (isChart) {
                    raceDisplayName = `${race.name} <span class="text-xs text-gray-500 font-normal ml-1">(${year})</span>`;
                } else {
                    raceDisplayName = `${race.name} <span class="text-gray-500 font-normal">(${year})</span>`;
                }
            }
            if (race.id && !isChart) {
                return `<span class="stat-race-link font-semibold text-green-800 hover:text-green-600 hover:underline cursor-pointer transition-colors" data-race-id="${race.id}" title="Cliquer pour voir la fiche de ${race.name}">${raceDisplayName} <i class="fas fa-external-link-alt text-[10px] text-green-600 ml-0.5"></i></span>`;
            }
            return raceDisplayName;
        }

        // Fonction pour afficher les statistiques
        window.displayRaceStats = function displayRaceStats() {
            if (window.isSelectionMode) return;
            try {
                const stats = calculateRaceStats(window.statsIncludeFuture);

                if (!statsContent) {
                    console.error('[stats-modal] statsContent introuvable');
                    return;
                }

                if (!stats) {
                    // console.log('[stats-modal] Aucune stat calculée (races vide ?)');
                    statsContent.innerHTML = `<p class="text-green-500 text-center py-8">Aucune statistique disponible</p>`;
                    return;
                }

                // console.log('[stats-modal] Génération du HTML...');
                let html = '';

                // Message informatif si l'option "inclure futur" est activée
                if (window.statsIncludeFuture) {
                    html += `<div class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-center gap-2">
                        <i class="fas fa-info-circle text-blue-500 text-lg"></i>
                        <span>Les statistiques présentées prennent en compte des courses dans le futur.</span>
                    </div>`;
                }

                // Statistiques générales et Records
                html += `<div class="bg-green-50 p-4 rounded-lg mb-6"><h4 class="font-bold text-green-800 mb-3">Statistiques générales et Records</h4>`;
                html += `<ul class="list-disc list-inside space-y-2">`;
                html += `<li><strong>Nombre total de courses :</strong> ${stats.totalRaces}</li>`;

                if (stats.longestDistanceRace) {
                    html += `<li><strong>Course avec la plus longue distance :</strong> ${getUniqueRaceName(stats.longestDistanceRace, stats.validRaces)} (${parseFloat(stats.maxDistance).toLocaleString('fr-FR')} km)</li>`;
                }

                if (stats.highestPriceRace) {
                    html += `<li><strong>Prix le plus haut :</strong> ${getUniqueRaceName(stats.highestPriceRace, stats.validRaces)} (${stats.highestPriceRace.price} €)</li>`;
                }

                if (stats.highestElevationRace) {
                    html += `<li><strong>Plus de dénivelé D+ :</strong> ${getUniqueRaceName(stats.highestElevationRace, stats.validRaces)} (${stats.highestElevationRace.elevation} m D+)</li>`;
                }

                if (stats.highestElevationNegRace) {
                    html += `<li><strong>Plus de dénivelé D- :</strong> ${getUniqueRaceName(stats.highestElevationNegRace, stats.validRaces)} (${stats.highestElevationNegRace.elevationNeg} m D-)</li>`;
                }

                if (stats.longestTimeRace) {
                    html += `<li><strong>Temps max :</strong> ${getUniqueRaceName(stats.longestTimeRace, stats.validRaces)} (${stats.longestTimeRace.time})</li>`;
                }

                html += `</ul></div>`;

                // Statistiques détaillées
                html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">';

                // Statistiques sur les distances
                if (stats.distanceStats && Object.keys(stats.distanceStats).length > 0) {
                    const ds = stats.distanceStats;
                    html += `<div class="bg-green-100 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-bold text-green-800 flex items-center gap-2">
                                <i class="fas fa-route text-green-600"></i>
                                <span>Statistiques sur les distances</span>
                            </h4>
                            <button type="button" class="metric-calc-info-btn inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-green-200 border border-green-300 text-green-800 text-[11px] shadow-2xs cursor-pointer transition-colors" data-metric="distance" title="Comment ces statistiques sont calculées ?">
                                <i class="fas fa-info text-green-700"></i>
                            </button>
                        </div>`;
                    html += `<ul class="list-disc list-inside space-y-2">`;
                    html += `<li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${ds.mean} km</span></li>`;
                    html += `<li><strong>Médiane :</strong> <span class="text-green-600 font-semibold">${ds.median} km</span></li>`;
                    html += `<li><strong>Étendue :</strong> <span class="text-green-600 font-semibold">${ds.range} km</span></li>`;
                    html += `<li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold">${ds.standardDeviation.toFixed(2)} km</span></li>`;
                    html += `<li><strong>Total :</strong> <span class="text-green-600 font-semibold">${ds.sum} km</span></li>`;
                    html += `</ul></div>`;
                }

                // Statistiques sur les prix
                if (stats.priceStats && Object.keys(stats.priceStats).length > 0) {
                    const ps = stats.priceStats;
                    html += `<div class="bg-green-100 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-bold text-green-800 flex items-center gap-2">
                                <i class="fas fa-euro-sign text-green-600"></i>
                                <span>Statistiques sur les prix</span>
                            </h4>
                            <button type="button" class="metric-calc-info-btn inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-green-200 border border-green-300 text-green-800 text-[11px] shadow-2xs cursor-pointer transition-colors" data-metric="price" title="Comment ces statistiques sont calculées ?">
                                <i class="fas fa-info text-green-700"></i>
                            </button>
                        </div>`;
                    html += `<ul class="list-disc list-inside space-y-2">`;
                    html += `<li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${ps.mean} €</span></li>`;
                    html += `<li><strong>Médiane :</strong> <span class="text-green-600 font-semibold">${ps.median} €</span></li>`;
                    html += `<li><strong>Étendue :</strong> <span class="text-green-600 font-semibold">${ps.range} €</span></li>`;
                    html += `<li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold">${ps.standardDeviation.toFixed(2)} €</span></li>`;
                    html += `<li><strong>Total :</strong> <span class="text-green-600 font-semibold">${ps.sum} €</span></li>`;
                    html += `</ul></div>`;
                }

                // Bloc dénivelé : flip card si D- existe, sinon bloc simple D+
                const hasElevStats = stats.elevationStats && Object.keys(stats.elevationStats).length > 0;
                const hasElevNegStats = stats.elevationNegStats && Object.keys(stats.elevationNegStats).length > 0;

                if (hasElevStats || hasElevNegStats) {
                    if (hasElevStats && hasElevNegStats) {
                        // === FLIP CARD 3D ===
                        const es = stats.elevationStats;
                        const en = stats.elevationNegStats;
                        html += `
                        <style>
                          .elev-flip-scene { perspective: 900px; }
                          .elev-flip-card {
                            position: relative; width: 100%; height: 100%;
                            transform-style: preserve-3d;
                            transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
                            min-height: 210px;
                          }
                          .elev-flip-card.is-flipped { transform: rotateY(180deg); }
                          .elev-flip-face {
                            position: absolute; width: 100%; height: 100%;
                            backface-visibility: hidden; -webkit-backface-visibility: hidden;
                            border-radius: 0.5rem; padding: 1rem;
                            display: flex; flex-direction: column;
                          }
                          .elev-flip-face--back { transform: rotateY(180deg); }
                        </style>
                        <div class="elev-flip-scene rounded-lg" style="min-height:210px;">
                          <div class="elev-flip-card" id="elevFlipCard">

                            <!-- RECTO : D+ -->
                            <div class="elev-flip-face bg-green-100">
                              <div class="flex justify-between items-center mb-3">
                                <div class="flex items-center gap-2">
                                  <h4 class="font-bold text-green-800 flex items-center gap-2">
                                    <i class="fas fa-mountain text-green-600"></i> Dénivelé positif (D+)
                                  </h4>
                                  <button onclick="document.getElementById('elevFlipCard').classList.toggle('is-flipped')"
                                    title="Voir le D-"
                                    class="flex items-center gap-1 text-xs text-green-700 bg-green-200 hover:bg-green-300 px-2 py-0.5 rounded-full transition cursor-pointer select-none">
                                    <i class="fas fa-sync-alt text-[10px]"></i>
                                    <span>D-</span>
                                  </button>
                                </div>
                                <button type="button" class="metric-calc-info-btn inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-green-200 border border-green-300 text-green-800 text-[11px] shadow-2xs cursor-pointer transition-colors" data-metric="elevation" title="Comment ces statistiques de D+ sont calculées ?">
                                  <i class="fas fa-info text-green-700"></i>
                                </button>
                              </div>
                              <ul class="list-disc list-inside space-y-2 text-sm flex-1">
                                <li><strong>Total cumulé :</strong> <span class="text-green-600 font-semibold">${es.sum.toLocaleString('fr-FR')} m</span></li>
                                <li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${es.mean} m</span></li>
                                <li><strong>Médiane :</strong> <span class="text-green-600 font-semibold">${es.median} m</span></li>
                                <li><strong>Max :</strong> <span class="text-green-600 font-semibold">${es.max} m</span></li>
                                <li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold">${es.standardDeviation} m</span></li>
                              </ul>
                            </div>

                            <!-- VERSO : D- -->
                            <div class="elev-flip-face elev-flip-face--back bg-blue-50 border border-blue-100">
                              <div class="flex justify-between items-center mb-3">
                                <div class="flex items-center gap-2">
                                  <h4 class="font-bold text-blue-800 flex items-center gap-2">
                                    <i class="fas fa-mountain text-blue-500"></i> Dénivelé négatif (D-)
                                  </h4>
                                  <button onclick="document.getElementById('elevFlipCard').classList.toggle('is-flipped')"
                                    title="Voir le D+"
                                    class="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded-full transition cursor-pointer select-none">
                                    <i class="fas fa-sync-alt text-[10px]"></i>
                                    <span>D+</span>
                                  </button>
                                </div>
                                <button type="button" class="metric-calc-info-btn inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-blue-100 border border-blue-300 text-blue-800 text-[11px] shadow-2xs cursor-pointer transition-colors" data-metric="elevationNeg" title="Comment ces statistiques de D- sont calculées ?">
                                  <i class="fas fa-info text-blue-700"></i>
                                </button>
                              </div>
                              <ul class="list-disc list-inside space-y-2 text-sm flex-1">
                                <li><strong>Total cumulé :</strong> <span class="text-blue-600 font-semibold">${en.sum.toLocaleString('fr-FR')} m</span></li>
                                <li><strong>Moyenne :</strong> <span class="text-blue-600 font-semibold">${en.mean} m</span></li>
                                <li><strong>Médiane :</strong> <span class="text-blue-600 font-semibold">${en.median} m</span></li>
                                <li><strong>Max :</strong> <span class="text-blue-600 font-semibold">${en.max} m</span></li>
                                <li><strong>Écart-type :</strong> <span class="text-blue-600 font-semibold">${en.standardDeviation} m</span></li>
                              </ul>
                            </div>

                          </div>
                        </div>`;
                    } else if (hasElevStats) {
                        // Bloc simple D+ sans D-
                        const es = stats.elevationStats;
                        html += `<div class="bg-green-100 p-4 rounded-lg">
                          <div class="flex items-center justify-between mb-3">
                            <h4 class="font-bold text-green-800 flex items-center gap-2">
                              <i class="fas fa-mountain text-green-600"></i> Dénivelé positif (D+)
                            </h4>
                            <button type="button" class="metric-calc-info-btn inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-green-200 border border-green-300 text-green-800 text-[11px] shadow-2xs cursor-pointer transition-colors" data-metric="elevation" title="Comment ces statistiques de D+ sont calculées ?">
                              <i class="fas fa-info text-green-700"></i>
                            </button>
                          </div>
                          <ul class="list-disc list-inside space-y-2">
                            <li><strong>Total cumulé :</strong> <span class="text-green-600 font-semibold">${es.sum.toLocaleString('fr-FR')} m</span></li>
                            <li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${es.mean} m</span></li>
                            <li><strong>Médiane :</strong> <span class="text-green-600 font-semibold">${es.median} m</span></li>
                            <li><strong>Max :</strong> <span class="text-green-600 font-semibold">${es.max} m</span></li>
                            <li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold">${es.standardDeviation} m</span></li>
                          </ul>
                        </div>`;
                    }
                }

                // Statistiques sur les temps
                if (stats.timeStats && Object.keys(stats.timeStats).length > 0) {
                    const ts = stats.timeStats;
                    html += `<div class="bg-green-100 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-bold text-green-800 flex items-center gap-2">
                                <i class="fas fa-clock text-green-600"></i>
                                <span>Statistiques sur les temps</span>
                            </h4>
                            <button type="button" class="metric-calc-info-btn inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-green-200 border border-green-300 text-green-800 text-[11px] shadow-2xs cursor-pointer transition-colors" data-metric="time" title="Comment ces statistiques sont calculées ?">
                                <i class="fas fa-info text-green-700"></i>
                            </button>
                        </div>`;
                    html += `<ul class="list-disc list-inside space-y-2">`;
                    html += `<li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.mean)}</span></li>`;
                    html += `<li><strong>Médiane :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.median)}</span></li>`;
                    html += `<li><strong>Étendue :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.range)}</span></li>`;
                    html += `<li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.standardDeviation)}</span></li>`;
                    html += `<li><strong>Total :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.sum)}</span></li>`;
                    html += `</ul></div>`;
                }

                html += '</div>'; // Fermeture de la grid à 2 colonnes

                // Allures et chronos moyens (1km, 10km, Semi-Marathon) avec records personnels (RP)
                if (stats.estimatedPaces) {
                    const ep = stats.estimatedPaces;

                    // Helper pour afficher le lien de course du RP
                    function renderRpRaceLink(rpObj) {
                        if (!rpObj || !rpObj.raceName) return '';
                        if (rpObj.rawRace) {
                            return `<div class="text-[11px] text-gray-600 truncate mt-1">
                                <span class="text-gray-400">Course :</span> ${getUniqueRaceName(rpObj.rawRace, stats.validRaces)}
                            </div>`;
                        }
                        if (rpObj.raceId) {
                            return `<div class="text-[11px] text-gray-600 truncate mt-1">
                                <span class="text-gray-400">Course :</span> <span class="stat-race-link font-medium text-green-800 hover:text-green-600 hover:underline cursor-pointer" data-race-id="${rpObj.raceId}">${rpObj.raceName} <i class="fas fa-external-link-alt text-[9px] text-green-600"></i></span>
                            </div>`;
                        }
                        return `<div class="text-[11px] text-gray-500 truncate mt-1" title="${rpObj.raceName}"><span class="text-gray-400">Course :</span> ${rpObj.raceName}</div>`;
                    }

                    // Helper pour afficher le badge Réel / Estimé avec un tooltip explicatif très bref
                    function renderRpBadge(isReal) {
                        const label = isReal ? 'Réel' : 'Estimé';
                        const tip = isReal 
                            ? 'Chrono direct issu d\'une vraie course courue sur cette distance.' 
                            : 'Chrono théorique calculé à partir de vos autres courses.';
                        return `<span class="text-[10px] text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.5 rounded cursor-help" title="${tip}">${label}</span>`;
                    }

                    html += `
                    <div class="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                            <div>
                                <div class="flex items-center gap-2">
                                    <h4 class="font-bold text-green-800 flex items-center gap-2 text-base">
                                        <i class="fas fa-stopwatch text-green-600"></i>
                                        <span>Temps & Allures Moyens</span>
                                    </h4>
                                    <button type="button" class="paces-calc-info-btn inline-flex items-center justify-center w-5 h-5 rounded-full bg-white hover:bg-green-100 border border-green-300 text-green-800 text-[11px] shadow-2xs cursor-pointer transition-colors" title="Comment ces temps et records sont calculés ?">
                                        <i class="fas fa-info text-green-700"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-green-700 mt-0.5">
                                    Calculé selon vos données de courses (ajusté au dénivelé D+ et à la fatigue d'endurance).
                                </p>
                            </div>
                            <button type="button" id="fatigueIndexBadgeBtn" class="flex items-center gap-1.5 self-start sm:self-auto bg-white hover:bg-green-100 border border-green-300 px-3 py-1 rounded-full text-xs font-semibold text-green-800 shadow-2xs cursor-pointer transition-all active:scale-95 group" title="Cliquer pour comprendre votre score d'indice de fatigue">
                                <i class="fas fa-heartbeat text-red-500 group-hover:scale-110 transition-transform"></i>
                                <span>Indice fatigue : <strong>${ep.fatigueExponent}</strong></span>
                                <i class="fas fa-info-circle text-green-600 text-[11px] ml-0.5 opacity-80 group-hover:opacity-100"></i>
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- 1 KM -->
                            <div class="bg-white rounded-lg p-4 border border-green-200 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                        <span class="font-bold text-green-800 text-sm flex items-center gap-1.5">
                                            <i class="fas fa-bolt text-amber-500"></i> 1 km
                                        </span>
                                        <span class="text-[10px] text-gray-500 font-medium">${ep.k1.hasRealData ? (ep.k1.realCount + ' repère' + (ep.k1.realCount > 1 ? 's' : '')) : 'Modélisé'}</span>
                                    </div>
                                    <div class="mb-3">
                                        <span class="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">Temps moyen</span>
                                        <div class="text-xl font-bold text-gray-900 flex items-baseline gap-1.5">
                                            <span>${ep.k1.timeFormatted}</span>
                                            <span class="text-xs text-gray-400 font-normal">(${ep.k1.timeClock})</span>
                                        </div>
                                        <div class="text-xs font-semibold text-green-700 mt-1 flex items-center gap-1">
                                            <i class="fas fa-tachometer-alt text-[10px] text-green-500"></i>
                                            <span>Allure : <strong>${ep.k1.paceStr}</strong></span>
                                            <span class="text-gray-400 font-normal ml-1">(${ep.k1.speedStr})</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 pt-2.5 border-t border-dashed border-gray-200 bg-amber-50/70 -mx-4 -mb-4 p-3 rounded-b-lg">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-bold text-amber-900 flex items-center gap-1">
                                            <i class="fas fa-trophy text-amber-500"></i> RP (Record Personnel)
                                        </span>
                                        ${renderRpBadge(ep.k1.rp.isReal)}
                                    </div>
                                    <div class="flex items-baseline justify-between gap-2">
                                        <span class="text-base font-extrabold text-amber-900">${ep.k1.rp.timeFormatted}</span>
                                        <span class="text-xs font-semibold text-amber-800">${ep.k1.rp.paceStr}</span>
                                    </div>
                                    ${renderRpRaceLink(ep.k1.rp)}
                                </div>
                            </div>

                            <!-- 10 KM -->
                            <div class="bg-white rounded-lg p-4 border border-green-200 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                        <span class="font-bold text-green-800 text-sm flex items-center gap-1.5">
                                            <i class="fas fa-running text-green-600"></i> 10 km
                                        </span>
                                        <span class="text-[10px] text-gray-500 font-medium">${ep.k10.hasRealData ? (ep.k10.realCount + ' course' + (ep.k10.realCount > 1 ? 's' : '') + ' ~10k') : 'Modélisé'}</span>
                                    </div>
                                    <div class="mb-3">
                                        <span class="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">Temps moyen</span>
                                        <div class="text-xl font-bold text-gray-900 flex items-baseline gap-1.5">
                                            <span>${ep.k10.timeFormatted}</span>
                                            <span class="text-xs text-gray-400 font-normal">(${ep.k10.timeClock})</span>
                                        </div>
                                        <div class="text-xs font-semibold text-green-700 mt-1 flex items-center gap-1">
                                            <i class="fas fa-tachometer-alt text-[10px] text-green-500"></i>
                                            <span>Allure : <strong>${ep.k10.paceStr}</strong></span>
                                            <span class="text-gray-400 font-normal ml-1">(${ep.k10.speedStr})</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 pt-2.5 border-t border-dashed border-gray-200 bg-amber-50/70 -mx-4 -mb-4 p-3 rounded-b-lg">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-bold text-amber-900 flex items-center gap-1">
                                            <i class="fas fa-trophy text-amber-500"></i> RP (Record Personnel)
                                        </span>
                                        ${renderRpBadge(ep.k10.rp.isReal)}
                                    </div>
                                    <div class="flex items-baseline justify-between gap-2">
                                        <span class="text-base font-extrabold text-amber-900">${ep.k10.rp.timeFormatted}</span>
                                        <span class="text-xs font-semibold text-amber-800">${ep.k10.rp.paceStr}</span>
                                    </div>
                                    ${renderRpRaceLink(ep.k10.rp)}
                                </div>
                            </div>

                            <!-- SEMI-MARATHON -->
                            <div class="bg-white rounded-lg p-4 border border-green-200 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                        <span class="font-bold text-green-800 text-sm flex items-center gap-1.5">
                                            <i class="fas fa-mountain text-teal-600"></i> Semi-Marathon
                                        </span>
                                        <span class="text-[10px] text-gray-500 font-medium">${ep.semi.hasRealData ? (ep.semi.realCount + ' semi' + (ep.semi.realCount > 1 ? 's' : '') + ' couru' + (ep.semi.realCount > 1 ? 's' : '')) : 'Modélisé'}</span>
                                    </div>
                                    <div class="mb-3">
                                        <span class="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">Temps moyen</span>
                                        <div class="text-xl font-bold text-gray-900 flex items-baseline gap-1.5">
                                            <span>${ep.semi.timeFormatted}</span>
                                            <span class="text-xs text-gray-400 font-normal">(${ep.semi.timeClock})</span>
                                        </div>
                                        <div class="text-xs font-semibold text-green-700 mt-1 flex items-center gap-1">
                                            <i class="fas fa-tachometer-alt text-[10px] text-green-500"></i>
                                            <span>Allure : <strong>${ep.semi.paceStr}</strong></span>
                                            <span class="text-gray-400 font-normal ml-1">(${ep.semi.speedStr})</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 pt-2.5 border-t border-dashed border-gray-200 bg-amber-50/70 -mx-4 -mb-4 p-3 rounded-b-lg">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-bold text-amber-900 flex items-center gap-1">
                                            <i class="fas fa-trophy text-amber-500"></i> RP (Record Personnel)
                                        </span>
                                        ${renderRpBadge(ep.semi.rp.isReal)}
                                    </div>
                                    <div class="flex items-baseline justify-between gap-2">
                                        <span class="text-base font-extrabold text-amber-900">${ep.semi.rp.timeFormatted}</span>
                                        <span class="text-xs font-semibold text-amber-800">${ep.semi.rp.paceStr}</span>
                                    </div>
                                    ${renderRpRaceLink(ep.semi.rp)}
                                </div>
                            </div>
                        </div>
                    </div>`;
                }

                // Statistiques spécifiques Triathlon (en pleine largeur)
                if (stats.triathlonStats) {
                    const ts = stats.triathlonStats;
                    // Calculs des totaux à partir des données brutes
                    const triRaces = stats.validRaces.filter(r => r.terrain === 'triathlon');
                    const totalSwimM = triRaces.reduce((s, r) => s + (parseInt(r.swimDistance) || 0), 0);
                    const totalBikeKm = triRaces.reduce((s, r) => s + (parseFloat(r.bikeDistance) || 0), 0);
                    const totalRunKm = triRaces.reduce((s, r) => s + (parseFloat(r.distance) || 0), 0);

                    html += `<div class="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                        <h4 class="font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <span>🏊‍♂️🚴‍♂️🏃‍♂️</span>
                            <span>Statistiques Triathlon</span>
                            <span class="text-sm font-normal text-blue-500">(${ts.count} course${ts.count > 1 ? 's' : ''})</span>
                        </h4>
                        <div class="flex flex-col md:flex-row gap-3">

                            <!-- Natation -->
                            <div class="flex-1 bg-white rounded-lg border border-blue-100 shadow-sm p-3">
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="fas fa-swimmer text-blue-500 text-lg"></i>
                                    <span class="font-bold text-blue-800 text-sm">Natation</span>
                                </div>
                                <div class="space-y-1 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-500">Moy.</span>
                                        <span class="font-semibold text-blue-700">${ts.avgSwim} m</span>
                                    </div>
                                    <div class="flex justify-between border-t border-blue-50 pt-1 mt-1">
                                        <span class="text-gray-400 text-xs">Total</span>
                                        <span class="text-xs font-semibold text-blue-500">${(totalSwimM / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Vélo -->
                            <div class="flex-1 bg-white rounded-lg border border-orange-100 shadow-sm p-3">
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="fas fa-biking text-orange-500 text-lg"></i>
                                    <span class="font-bold text-orange-800 text-sm">Vélo</span>
                                </div>
                                <div class="space-y-1 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-500">Moy.</span>
                                        <span class="font-semibold text-orange-700">${ts.avgBike} km</span>
                                    </div>
                                    <div class="flex justify-between border-t border-orange-50 pt-1 mt-1">
                                        <span class="text-gray-400 text-xs">Total</span>
                                        <span class="text-xs font-semibold text-orange-500">${totalBikeKm.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Course à pied -->
                            <div class="flex-1 bg-white rounded-lg border border-green-100 shadow-sm p-3">
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="fas fa-running text-green-500 text-lg"></i>
                                    <span class="font-bold text-green-800 text-sm">Course à pied</span>
                                </div>
                                <div class="space-y-1 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-500">Moy.</span>
                                        <span class="font-semibold text-green-700">${ts.avgRun} km</span>
                                    </div>
                                    <div class="flex justify-between border-t border-green-50 pt-1 mt-1">
                                        <span class="text-gray-400 text-xs">Total</span>
                                        <span class="text-xs font-semibold text-green-500">${totalRunKm.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>`;
                }

                // Statistiques spécifiques Hyrox (en pleine largeur)
                if (stats.hyroxStats) {
                    const hs = stats.hyroxStats;
                    html += `<div class="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">`;
                    html += `<h4 class="font-bold text-orange-800 mb-4 flex items-center gap-2"><span>🏋️ Statistiques Hyrox</span><span class="text-sm font-normal text-orange-600">(${hs.count} course${hs.count > 1 ? 's' : ''})</span></h4>`;

                    // Temps global
                    html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">`;
                    if (hs.bestTotalTime !== null) {
                        html += `<div class="bg-white rounded-lg p-3 border border-orange-100 shadow-sm">`;
                        html += `<p class="text-xs text-orange-500 uppercase font-bold tracking-wider mb-1">🏆 Meilleur temps total</p>`;
                        html += `<p class="text-xl font-bold text-orange-700">${secondsToTime(hs.bestTotalTime)}</p>`;
                        if (hs.bestTotalRace) html += `<p class="text-xs text-gray-500 mt-1">${hs.bestTotalRace.name}${hs.bestTotalRace.date ? ' (' + new Date(hs.bestTotalRace.date).getFullYear() + ')' : ''}</p>`;
                        html += `</div>`;
                    }
                    if (hs.avgTotalTime !== null) {
                        html += `<div class="bg-white rounded-lg p-3 border border-orange-100 shadow-sm">`;
                        html += `<p class="text-xs text-orange-500 uppercase font-bold tracking-wider mb-1">⏱️ Temps moyen total</p>`;
                        html += `<p class="text-xl font-bold text-orange-600">${secondsToTime(hs.avgTotalTime)}</p>`;
                        html += `</div>`;
                    }
                    html += `</div>`;

                    // Segment Course 1km (aggrégé)
                    if (hs.runAgg) {
                        html += `<div class="bg-white rounded-lg p-3 border border-orange-100 shadow-sm mb-3">`;
                        html += `<p class="text-xs text-orange-500 uppercase font-bold tracking-wider mb-2">🏃 Segments Course 1km</p>`;
                        html += `<div class="flex gap-4 flex-wrap">`;
                        if (hs.runAgg.best !== null) html += `<span class="text-sm"><span class="font-semibold text-orange-700">Meilleur :</span> <span class="text-orange-600 font-bold">${secondsToTime(hs.runAgg.best)}</span></span>`;
                        if (hs.runAgg.avg !== null) html += `<span class="text-sm"><span class="font-semibold text-orange-700">Moyen :</span> <span class="text-orange-600">${secondsToTime(hs.runAgg.avg)}</span></span>`;
                        html += `</div></div>`;
                    }

                    // Détail des exercices
                    if (hs.exercises && hs.exercises.length > 0) {
                        html += `<p class="text-xs text-orange-500 uppercase font-bold tracking-wider mb-2 mt-3">💪 Exercices</p>`;
                        html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">`;
                        hs.exercises.forEach(ex => {
                            html += `<div class="bg-white rounded-lg p-2.5 border border-orange-100 flex flex-col gap-1">`;
                            html += `<p class="text-xs font-bold text-orange-800">${ex.name}</p>`;
                            html += `<div class="flex gap-3 flex-wrap">`;
                            html += `<span class="text-xs"><span class="text-gray-500">Meilleur :</span> <span class="font-semibold text-orange-700">${secondsToTime(ex.best)}</span></span>`;
                            html += `<span class="text-xs"><span class="text-gray-500">Moyen :</span> <span class="text-orange-600">${secondsToTime(ex.avg)}</span></span>`;
                            html += `<span class="text-xs text-gray-400">(${ex.count} course${ex.count > 1 ? 's' : ''})</span>`;
                            html += `</div></div>`;
                        });
                        html += `</div>`;
                    }

                    html += `</div>`;
                }

                // Visualisation des terrains (Barre de progression)
                if (stats.terrainStats && stats.terrainStats.total > 0) {
                    const ts = stats.terrainStats;
                    const getPercent = (val) => (val / ts.total) * 100;

                    html += `<div class="bg-green-50 p-4 rounded-lg mb-6">`;
                    html += `<h4 class="font-bold text-green-800 mb-3">Répartition par terrain</h4>`;

                    // Barre de progression
                    html += `<div class="w-full h-6 rounded-full flex overflow-hidden mb-3 bg-gray-200">`;
                    if (ts.route > 0) html += `<div class="bg-blue-900 h-full transition-all duration-500" style="width: ${getPercent(ts.route)}%"></div>`;
                    if (ts.trail > 0) html += `<div class="bg-blue-700 h-full transition-all duration-500" style="width: ${getPercent(ts.trail)}%"></div>`;
                    if (ts.triathlon > 0) html += `<div class="bg-blue-500 h-full transition-all duration-500" style="width: ${getPercent(ts.triathlon)}%"></div>`;
                    if (ts.relai > 0) html += `<div class="bg-yellow-400 h-full transition-all duration-500" style="width: ${getPercent(ts.relai)}%"></div>`;
                    if (ts.hyrox > 0) html += `<div class="bg-orange-400 h-full transition-all duration-500" style="width: ${getPercent(ts.hyrox)}%"></div>`;
                    html += `</div>`;

                    // Légende avec pourcentages
                    html += `<div class="flex flex-wrap gap-4 justify-center text-sm text-blue-900">`;
                    if (ts.route > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-900"></span> Route (${ts.route} - ${getPercent(ts.route).toFixed(1)}%)</div>`;
                    if (ts.trail > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-700"></span> Trail (${ts.trail} - ${getPercent(ts.trail).toFixed(1)}%)</div>`;
                    if (ts.triathlon > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span> Triathlon (${ts.triathlon} - ${getPercent(ts.triathlon).toFixed(1)}%)</div>`;
                    if (ts.relai > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-yellow-400"></span> Relai (${ts.relai} - ${getPercent(ts.relai).toFixed(1)}%)</div>`;
                    if (ts.hyrox > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-orange-400"></span> Hyrox (${ts.hyrox} - ${getPercent(ts.hyrox).toFixed(1)}%)</div>`;
                    html += `</div>`;

                    html += `</div>`;
                }

                // --- ÉVOLUTION DES PERFORMANCES (Graphique en courbe) ---
                const chronologicalRaces = (stats.validRaces || [])
                    .filter(r => r.date && r.distance && timeToSeconds(r.time))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                if (chronologicalRaces.length >= 2) {
                    html += `<div class="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 shadow-sm">`;
                    html += `  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">`;
                    html += `    <h4 class="font-bold text-blue-800 flex items-center gap-2">`;
                    html += `      <i class="fas fa-chart-line text-blue-600"></i> Évolution des performances`;
                    html += `    </h4>`;
                    html += `    <div class="flex items-center gap-2">`;
                    html += `      <label for="evolutionMetricSelect" class="text-xs text-blue-700 font-medium whitespace-nowrap">Métrique :</label>`;
                    html += `      <select id="evolutionMetricSelect" class="px-2 py-1 border-b-2 border-blue-400 bg-transparent text-blue-800 text-sm font-semibold cursor-pointer hover:border-blue-600 focus:outline-none focus:border-blue-600">`;
                    html += `        <option value="speed">Vitesse moyenne (km/h)</option>`;
                    html += `        <option value="pace">Allure (min/km)</option>`;
                    html += `      </select>`;
                    html += `    </div>`;
                    html += `  </div>`;
                    html += `  <div class="relative w-full h-[250px] md:h-[300px] bg-white rounded-lg p-2 border border-blue-100">`;
                    html += `    <canvas id="evolutionChartCanvas"></canvas>`;
                    html += `  </div>`;
                    html += `  <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3 mb-1">`;
                    html += `    <div class="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-blue-900"><span class="w-3 h-0.5 border-t-2 border-dashed border-[var(--color-green-600,#16a34a)]"></span> Meilleure perf.</div>`;
                    html += `    <div class="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-blue-900"><span class="w-3 h-0.5 border-t-2 border-dashed border-[#dc2626]"></span> Moins bonne perf.</div>`;
                    html += `  </div>`;
                    html += `  <p class="text-[10px] text-blue-400 mt-2 italic text-center">Graphique basé sur ${chronologicalRaces.length} courses.</p>`;

                    // PRÉDICTION IA
                    if (chronologicalRaces.length >= 5) {
                        const speeds = chronologicalRaces.map(r => r.distance / (timeToSeconds(r.time) / 3600));
                        const paces = chronologicalRaces.map(r => (timeToSeconds(r.time) / 60) / r.distance);
                        
                        function predictNext(arr) {
                            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
                            const n = arr.length;
                            arr.forEach((y, x) => { sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; });
                            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                            const intercept = (sumY - slope * sumX) / n;
                            return slope * n + intercept;
                        }
                        
                        let predSpeed = predictNext(speeds);
                        let predPace = predictNext(paces);
                        
                        // Sécurité mathématique
                        if(predSpeed < 0 || isNaN(predSpeed)) predSpeed = speeds[speeds.length-1];
                        if(predPace < 0 || isNaN(predPace)) predPace = paces[paces.length-1];
                        
                        const pMins = Math.floor(predPace);
                        const pSecs = Math.round((predPace - pMins) * 60);
                        const formattedPace = `${pMins}'${pSecs.toString().padStart(2, '0')}"`;

                        html += `  <div class="mt-3 flex justify-center">`;
                        html += `    <div class="bg-purple-50 border border-purple-100 rounded-md py-1.5 px-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] text-purple-700 font-medium">`;
                        html += `      <span class="flex items-center gap-1"><i class="fas fa-robot text-purple-500"></i> Prédiction IA pour la course n°${chronologicalRaces.length + 1} :</span>`;
                        html += `      <div class="flex items-center gap-3">`;
                        html += `        <span title="Vitesse estimée en kilomètres par heure" class="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-purple-100 shadow-sm text-indigo-800 cursor-help"><i class="fas fa-tachometer-alt text-indigo-400"></i> ~${predSpeed.toFixed(2)} km/h</span>`;
                        html += `        <span title="Allure estimée en minutes par kilomètre" class="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-purple-100 shadow-sm text-purple-800 cursor-help"><i class="fas fa-stopwatch text-purple-400"></i> ~${formattedPace} min/km</span>`;
                        html += `      </div>`;
                        html += `    </div>`;
                        html += `  </div>`;
                    } else {
                        html += `  <div class="mt-3 flex justify-center">`;
                        html += `    <div class="bg-gray-50 border border-gray-100 rounded-md py-1 px-3 flex items-center gap-2 text-[10px] text-gray-500 italic" title="5 courses minimum requises">`;
                        html += `      <i class="fas fa-robot text-gray-500"></i> Prédiction IA indisponible (5 courses requises)`;
                        html += `    </div>`;
                        html += `  </div>`;
                    }

                    html += `</div>`;
                } else {
                    html += `<div class="bg-blue-50/60 border border-dashed border-blue-200 p-4 rounded-lg mb-6 text-center">`;
                    html += `  <div class="flex flex-col items-center justify-center gap-2">`;
                    html += `    <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">`;
                    html += `      <i class="fas fa-chart-line text-sm"></i>`;
                    html += `    </div>`;
                    html += `    <h4 class="font-bold text-blue-900 text-sm">Évolution des performances</h4>`;
                    html += `    <p class="text-xs text-blue-700/80 max-w-md">`;
                    html += `      Ajoutez au moins <strong>2 courses</strong> complètes (avec date, distance et chrono) pour afficher le graphique d'évolution.`;
                    html += `    </p>`;
                    html += `    <div class="mt-1 bg-white border border-gray-200 rounded-md py-1 px-3 flex items-center gap-2 text-[10px] text-gray-500 italic shadow-xs" title="5 courses minimum requises">`;
                    html += `      <i class="fas fa-robot text-gray-500"></i> Prédiction IA indisponible (5 courses requises)`;
                    html += `    </div>`;
                    html += `  </div>`;
                    html += `</div>`;
                }

                // Graphique avec liste déroulante
                const hasChartData = (stats.racesWithDistance && stats.racesWithDistance.length > 0) ||
                    (stats.racesWithPrice && stats.racesWithPrice.length > 0) ||
                    (stats.racesWithTime && stats.racesWithTime.length > 0) ||
                    (stats.racesWithElevation && stats.racesWithElevation.length > 0) ||
                    (stats.racesWithPricePerKm && stats.racesWithPricePerKm.length > 0);

                if (hasChartData) {
                    html += `<div class="bg-green-50 p-4 rounded-lg mb-6">`;
                    html += `<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">`;
                    html += `<h4 id="chartTitle" class="font-bold text-green-800 flex items-center gap-2 flex-wrap">`;
                    html += `<span>Top 10 de la répartition</span>`;
                    html += `<select id="chartTypeSelect" class="px-2 py-1 border-0 border-b-2 border-green-400 bg-transparent text-green-800 text-sm font-normal cursor-pointer hover:border-green-600 focus:outline-none focus:border-green-600">`;
                    html += `<option value="distance">des distances</option>`;

                    if (stats.racesWithPrice && stats.racesWithPrice.length > 0) {
                        html += `<option value="price">des prix</option>`;
                    }
                    if (stats.racesWithTime && stats.racesWithTime.length > 0) {
                        html += `<option value="time">des temps</option>`;
                    }
                    if (stats.racesWithElevation && stats.racesWithElevation.length > 0) {
                        html += `<option value="elevation">des dénivelés D+</option>`;
                    }
                    if (stats.racesWithElevationNeg && stats.racesWithElevationNeg.length > 0) {
                        html += `<option value="elevationNeg">des dénivelés D-</option>`;
                    }
                    if (stats.racesWithPricePerKm && stats.racesWithPricePerKm.length > 0) {
                        html += `<option value="pricePerKm">du prix au km</option>`;
                    }
                    if (stats.racesWithPricePerKmWithElevation && stats.racesWithPricePerKmWithElevation.length > 0) {
                        html += `<option value="pricePerKmWithElevation">du prix au km (ft. dénivelé)</option>`;
                    }
                    html += `</select>`;
                    html += `</h4>`;
                    html += `<div class="flex items-center gap-3">`;
                    html += `<label class="flex items-center gap-2 cursor-pointer">`;
                    html += `<input type="radio" name="chartSortOrder" value="desc" checked class="w-4 h-4 text-green-600 focus:ring-green-500">`;
                    html += `<span class="text-sm text-green-800">Décroissant</span>`;
                    html += `</label>`;
                    html += `<label class="flex items-center gap-2 cursor-pointer">`;
                    html += `<input type="radio" name="chartSortOrder" value="asc" class="w-4 h-4 text-green-600 focus:ring-green-500">`;
                    html += `<span class="text-sm text-green-800">Croissant</span>`;
                    html += `</label>`;
                    html += `</div>`;
                    html += `</div>`;
                    html += `<div class="relative">`;
                    html += `<div class="space-y-2" id="top10RacesList" style="max-height: 400px; overflow-y: auto;"></div>`;
                    html += `<div id="chartRacesCount" class="text-xs text-green-600 mt-2 text-right"></div>`;
                    html += `</div>`;
                    html += `<div id="chartButtonsContainer" class="flex justify-center mt-4"></div>`;
                    html += `</div>`;
                }

                statsContent.innerHTML = html;

                // Vérifier s'il y a des courses futures et afficher l'engrenage si nécessaire
                const statsSettingsBtn = document.getElementById('statsSettingsBtn');
                const futureInfo = getFutureRacesInfo();
                if (futureInfo.totalFutureRaces > 0 && statsSettingsBtn) {
                    statsSettingsBtn.classList.remove('hidden');
                } else if (statsSettingsBtn) {
                    statsSettingsBtn.classList.add('hidden');
                }

                // Initialiser le graphique
                if (hasChartData) {
                    updateChart('distance', 'desc', 10);

                    // Gérer les changements de type de graphique
                    const chartTypeSelect = document.getElementById('chartTypeSelect');
                    if (chartTypeSelect) {
                        chartTypeSelect.addEventListener('change', function () {
                            const currentLimit = parseInt(document.getElementById('chartButtonsContainer').dataset.currentLimit) || 10;
                            const sortOrder = document.querySelector('input[name="chartSortOrder"]:checked')?.value || 'desc';
                            updateChart(this.value, sortOrder, currentLimit);
                        });
                    }

                    // Gérer les changements de tri
                    const sortOrderRadios = document.querySelectorAll('input[name="chartSortOrder"]');
                    sortOrderRadios.forEach(radio => {
                        radio.addEventListener('change', function () {
                            const currentLimit = parseInt(document.getElementById('chartButtonsContainer').dataset.currentLimit) || 10;
                            const chartType = document.getElementById('chartTypeSelect')?.value || 'distance';
                            updateChart(chartType, this.value, currentLimit);
                        });
                    });
                }

                // Initialiser le graphique d'évolution si les données existent
                if (chronologicalRaces.length >= 2) {
                    const metricSelect = document.getElementById('evolutionMetricSelect');
                    if (metricSelect) {
                        metricSelect.addEventListener('change', function () {
                            updateEvolutionChart(chronologicalRaces, this.value);
                        });
                        // Premier affichage
                        updateEvolutionChart(chronologicalRaces, metricSelect.value);
                    }
                }

                // Attacher les écouteurs sur tous les liens de courses dans les stats
                statsContent.querySelectorAll('.stat-race-link').forEach(link => {
                    link.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const raceId = this.getAttribute('data-race-id');
                        if (raceId) openRaceFromStats(raceId);
                    });
                });

                // Attacher l'écouteur sur les boutons d'explication des 4 carrés de statistiques (distance, prix, dénivelé, temps)
                statsContent.querySelectorAll('.metric-calc-info-btn').forEach(btn => {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const metric = this.getAttribute('data-metric');
                        openMetricCalcInfoModal(metric, stats);
                    });
                });

                // Attacher l'écouteur sur les boutons d'explication du calcul des temps & RP
                statsContent.querySelectorAll('.paces-calc-info-btn').forEach(btn => {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        openPacesCalcInfoModal();
                    });
                });

                // Attacher l'écouteur sur le bouton Indice de fatigue
                const fatigueBadgeBtn = statsContent.querySelector('#fatigueIndexBadgeBtn');
                if (fatigueBadgeBtn && stats.estimatedPaces) {
                    fatigueBadgeBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        openFatigueInfoModal(stats.estimatedPaces.fatigueExponent);
                    });
                }
            } catch (e) {
                console.error('[stats-modal] Erreur affichage stats:', e);
            }
        };

        // Fonction pour ouvrir la mini-modale d'explication de l'indice de fatigue
        function openFatigueInfoModal(score) {
            const existing = document.getElementById('fatigueInfoModal');
            if (existing) existing.remove();

            const numScore = parseFloat(score) || 1.07;
            let interpretationTitle = '';
            let interpretationDesc = '';
            let badgeStyle = '';

            if (numScore < 1.06) {
                interpretationTitle = 'Profil très endurant (Marathonien / Ultra)';
                interpretationDesc = 'Vous conservez une excellente régularité de vitesse sur la durée. Votre dégradation d\'allure due à la fatigue sur le semi-marathon est minime.';
                badgeStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300';
            } else if (numScore <= 1.09) {
                interpretationTitle = 'Profil équilibré (Standard régulier)';
                interpretationDesc = 'Votre gestion de l\'effort est saine et équilibrée. Votre allure diminue progressivement et naturellement avec la distance selon les standards athlétiques.';
                badgeStyle = 'bg-green-100 text-green-900 border-green-300';
            } else {
                interpretationTitle = 'Profil explosif / Vitesse (Court & Intense)';
                interpretationDesc = 'Vous avez une très bonne vitesse sur les formats courts (1km à 10km), mais l\'accumulation de fatigue réduit plus vite votre allure au-delà de 15 km.';
                badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300';
            }

            const modalHtml = `
            <div id="fatigueInfoModal" class="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200" style="z-index: 10005;">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-5 sm:p-6 border border-gray-100">
                    <!-- Header -->
                    <div class="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                        <div class="flex items-center gap-2">
                            <h3 class="text-lg font-semibold text-green-800 flex items-center gap-2">
                                <i class="fas fa-heartbeat text-red-500"></i>
                                <span>Indice de fatigue</span>
                            </h3>
                        </div>
                        <button type="button" id="closeFatigueInfoModal" class="text-gray-400 hover:text-green-800 text-xl transition cursor-pointer" title="Fermer">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="space-y-4 text-sm text-gray-700">
                        <p class="text-xs text-gray-600 leading-relaxed">
                            Issu de la formule de <strong>Peter Riegel</strong>, cet indice mesure l'évolution de votre allure lorsque la distance augmente.
                        </p>

                        <!-- Score utilisateur -->
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3.5">
                            <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs text-green-800 font-semibold">Votre score :</span>
                                <span class="px-2 py-0.5 rounded text-xs font-bold bg-white text-green-900 border border-green-300">
                                    ${numScore.toFixed(2)}
                                </span>
                            </div>
                            <p class="font-bold text-gray-900 text-xs mb-1">
                                ${interpretationTitle}
                            </p>
                            <p class="text-xs text-gray-600 leading-normal">
                                ${interpretationDesc}
                            </p>
                        </div>

                        <!-- Grille repères -->
                        <div class="grid grid-cols-3 gap-2 text-center text-xs">
                            <div class="bg-gray-50 border border-gray-200 p-2 rounded">
                                <span class="block font-bold text-green-800">&lt; 1.06</span>
                                <span class="text-[10px] text-gray-500">Endurant</span>
                            </div>
                            <div class="bg-gray-50 border border-gray-200 p-2 rounded">
                                <span class="block font-bold text-green-800">1.06 - 1.09</span>
                                <span class="text-[10px] text-gray-500">Standard</span>
                            </div>
                            <div class="bg-gray-50 border border-gray-200 p-2 rounded">
                                <span class="block font-bold text-green-800">&gt; 1.09</span>
                                <span class="text-[10px] text-gray-500">Explosif</span>
                            </div>
                        </div>

                        <!-- Section calcul -->
                        <div class="border-t border-gray-100 pt-3">
                            <h4 class="font-bold text-gray-800 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <i class="fas fa-calculator text-green-600"></i> Comment est-il calculé ?
                            </h4>
                            <p class="text-xs text-gray-600 leading-relaxed">
                                L'application compare vos allures réelles entre vos courses courtes (&le; 10 km) et plus longues (&ge; 15 km), en ajustant le dénivelé (<strong>100m D+ = 1 km à plat</strong>). La formule athlétique de Peter Riegel <span class="font-mono text-[11px] bg-gray-100 px-1 py-0.5 rounded text-gray-700">T₂ = T₁ &times; (D₂/D₁)^F</span> en déduit précisément votre coefficient personnel d'endurance.
                            </p>
                        </div>

                        <!-- Lien En savoir plus -->
                        <div class="pt-1 flex items-center justify-between">
                            <a href="https://www.u-run.fr/30595-la-formule-de-riegel" target="_blank" rel="noopener noreferrer" class="text-xs text-green-700 hover:text-green-900 hover:underline inline-flex items-center gap-1 font-medium transition-colors">
                                <i class="fas fa-book-open text-green-600 text-[11px]"></i>
                                <span>En savoir plus sur la formule de Riegel</span>
                                <i class="fas fa-external-link-alt text-[9px] opacity-70"></i>
                            </a>
                        </div>

                        <button type="button" id="okFatigueInfoModal" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition cursor-pointer mt-2">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modalEl = document.getElementById('fatigueInfoModal');
            const closeBtn = document.getElementById('closeFatigueInfoModal');
            const okBtn = document.getElementById('okFatigueInfoModal');

            function closeModal() {
                if (modalEl) modalEl.remove();
                document.removeEventListener('keydown', handleEsc);
            }

            function handleEsc(e) {
                if (e.key === 'Escape') closeModal();
            }

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (okBtn) okBtn.addEventListener('click', closeModal);
            if (modalEl) {
                modalEl.addEventListener('click', function (e) {
                    if (e.target === modalEl) closeModal();
                });
            }
            document.addEventListener('keydown', handleEsc);
        }

        // Fonction pour ouvrir la modale d'explication du calcul des temps & records (1km, 10km, semi)
        function openPacesCalcInfoModal() {
            const existing = document.getElementById('pacesCalcInfoModal');
            if (existing) existing.remove();

            const modalHtml = `
            <div id="pacesCalcInfoModal" class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200" style="z-index: 10010;">
                <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-green-200 overflow-hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-xs text-sm">
                                <i class="fas fa-calculator"></i>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-bold text-green-900 leading-tight">
                                    Comment sont calculés vos temps & records ?
                                </h3>
                                <p class="text-[11px] sm:text-xs text-green-700 mt-0.5">
                                    Comprendre le rôle du dénivelé et le calcul du 1 km, 10 km et Semi-Marathon
                                </p>
                            </div>
                        </div>
                        <button type="button" id="closePacesCalcInfoModal" class="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white/80 flex items-center justify-center transition cursor-pointer text-lg" title="Fermer">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Body scrollable -->
                    <div class="p-4 sm:p-6 space-y-4 overflow-y-auto text-sm text-gray-700 flex-1 leading-relaxed">
                        
                        <!-- Règle d'or du Dénivelé -->
                        <div class="bg-emerald-50/90 border border-emerald-200 rounded-lg p-3.5 sm:p-4">
                            <div class="flex items-start gap-2.5">
                                <i class="fas fa-mountain text-emerald-600 text-base mt-0.5"></i>
                                <div>
                                    <h4 class="font-bold text-emerald-950 text-sm mb-1">
                                        1. La règle d'or du Dénivelé (100 m D+ = 1 km à plat)
                                    </h4>
                                    <p class="text-xs text-emerald-900 leading-relaxed">
                                        Courir en montée demande un effort physique bien plus important qu'à plat. Pour comparer équitablement toutes vos courses, l'application utilise la règle officielle du <strong>kilomètre-effort</strong> :
                                    </p>
                                    <div class="bg-white/95 border border-emerald-300 rounded p-2.5 mt-2 text-xs text-emerald-950 font-medium">
                                        📌 <strong>Distance d'effort</strong> = Distance réelle + (Dénivelé positif D+ / 100)
                                        <div class="text-[11px] text-emerald-800 font-normal mt-1">
                                            Exemple : un 10 km avec 300 m D+ représente un effort équivalent à <strong>13 km à plat</strong> (10 + 3).
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Différence Réel vs Estimé -->
                        <div class="bg-amber-50/90 border border-amber-200 rounded-lg p-3.5 sm:p-4">
                            <div class="flex items-start gap-2.5">
                                <i class="fas fa-tags text-amber-600 text-base mt-0.5"></i>
                                <div>
                                    <h4 class="font-bold text-amber-950 text-sm mb-1">
                                        2. La différence entre « Réel » et « Estimé »
                                    </h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                                        <div class="bg-white p-2.5 rounded border border-amber-200">
                                            <span class="inline-block px-1.5 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900 mb-1">Badge Réel</span>
                                            <p class="text-gray-600 text-[11px]">
                                                Vous avez couru une course (ou un tour de relais/Hyrox) qui correspond à cette distance. C'est votre meilleur chrono direct.
                                            </p>
                                        </div>
                                        <div class="bg-white p-2.5 rounded border border-amber-200">
                                            <span class="inline-block px-1.5 py-0.5 rounded font-bold text-[10px] bg-gray-100 text-gray-800 mb-1">Badge Estimé</span>
                                            <p class="text-gray-600 text-[11px]">
                                                Vous n'avez pas de course directe sur cette distance. Le système extrapole votre temps théorique depuis vos autres courses avec la formule athlétique d'endurance de <strong>Peter Riegel</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Détail des 3 distances avec exemples concrets -->
                        <div class="space-y-3">
                            <h4 class="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <i class="fas fa-list-ol text-green-600"></i>
                                <span>Détail et exemple pour chacune des 3 distances :</span>
                            </h4>

                            <!-- Carte 1 km -->
                            <div class="border border-green-200 rounded-lg p-3.5 bg-white shadow-2xs">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="font-bold text-green-900 text-sm flex items-center gap-1.5">
                                        <i class="fas fa-bolt text-amber-500"></i> 1 km
                                    </span>
                                    <span class="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Vitesse & Explosivité</span>
                                </div>
                                <p class="text-xs text-gray-600 leading-relaxed mb-2">
                                    <strong>Comment c'est calculé :</strong> Si vous avez couru une épreuve courte (~1 km d'effort, relais ou segment Hyrox), elle est prise en repère réel. Sinon, le système prend votre course la plus rapide et projette votre vitesse sur 1 km.
                                </p>
                                <div class="bg-gray-50 border-l-4 border-amber-500 p-2.5 rounded-r text-xs">
                                    <span class="font-semibold text-gray-800 block mb-0.5">💡 Pourquoi une course où vous avez eu une "perf moyenne" peut ressortir ?</span>
                                    <p class="text-gray-600 text-[11px] leading-relaxed">
                                        <strong>Exemple concret :</strong> Imaginez un <strong>Trail de 10 km avec 800 m de D+ couru en 1h15</strong>. Vous avez marché dans les montées et vous avez l'impression d'avoir fait un chrono moyen (allure réelle de 7'30/km). Mais pour le système : 10 km + 800 m D+ = <strong>18 km d'effort à plat</strong>.
                                        En ramenant cet effort global à 1 km, la formule mathématique estime que sur du plat sec vous vaudriez <strong>3'25 au km</strong> ! Ce trail ressort alors comme votre meilleur 1 km estimé, car le fort dénivelé a gonflé la distance d'effort. De même, si vous avez un tour d'Hyrox de 1 km (même couru fatigué), il sera pris comme un 1 km réel.
                                    </p>
                                </div>
                            </div>

                            <!-- Carte 10 km -->
                            <div class="border border-green-200 rounded-lg p-3.5 bg-white shadow-2xs">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="font-bold text-green-900 text-sm flex items-center gap-1.5">
                                        <i class="fas fa-running text-green-600"></i> 10 km
                                    </span>
                                    <span class="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Distance de référence</span>
                                </div>
                                <p class="text-xs text-gray-600 leading-relaxed mb-2">
                                    <strong>Comment c'est calculé :</strong> Le système recherche vos courses autour de 10 km d'effort. Si vous avez couru des 10 km sur route, votre record personnel est tout simplement votre meilleur chrono direct.
                                </p>
                                <div class="bg-gray-50 border-l-4 border-green-500 p-2.5 rounded-r text-xs">
                                    <span class="font-semibold text-gray-800 block mb-0.5">💡 Exemple concret :</span>
                                    <p class="text-gray-600 text-[11px] leading-relaxed">
                                        Si vous avez couru un 10 km sur route plat en <strong>45 min 00 s</strong>, votre RP est directement de 45 min (allure 4'30/km).
                                        Si vous n'aviez jamais fait de 10 km mais un <strong>Trail court de 6 km avec 400 m de D+</strong> (6 + 4 = 10 km d'effort), il est également comptabilisé comme un 10 km d'effort.
                                    </p>
                                </div>
                            </div>

                            <!-- Carte Semi-Marathon -->
                            <div class="border border-green-200 rounded-lg p-3.5 bg-white shadow-2xs">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="font-bold text-green-900 text-sm flex items-center gap-1.5">
                                        <i class="fas fa-mountain text-teal-600"></i> Semi-Marathon (21,1 km)
                                    </span>
                                    <span class="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Endurance aérobie</span>
                                </div>
                                <p class="text-xs text-gray-600 leading-relaxed mb-2">
                                    <strong>Comment c'est calculé :</strong> Si vous avez couru un semi officiel, c'est votre meilleur temps direct. Si vous n'en avez jamais couru, le système projette votre temps depuis votre 10 km en appliquant la fatigue naturelle au fil des kilomètres.
                                </p>
                                <div class="bg-gray-50 border-l-4 border-teal-500 p-2.5 rounded-r text-xs">
                                    <span class="font-semibold text-gray-800 block mb-0.5">💡 Exemple concret :</span>
                                    <p class="text-gray-600 text-[11px] leading-relaxed">
                                        Si vous courez le 10 km en <strong>50 min</strong>, votre semi-marathon estimé ne sera pas simplement de 1h40 (50 min &times; 2) : sur la distance, le coureur ralentit sous l'effet de la fatigue. La formule d'endurance calcule une projection réaliste d'environ <strong>1h51</strong> (allure 5'16/km). De même, un trail de 15 km avec 600 m D+ (15 + 6 = 21 km d'effort) est considéré comme un semi-marathon d'effort.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Conseil pour le coureur -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2.5">
                            <i class="fas fa-lightbulb text-blue-500 text-sm mt-0.5"></i>
                            <div>
                                <span class="font-bold">Bon à savoir pour le coureur :</span>
                                <p class="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                                    Vos temps et allures moyens reflètent l'ensemble de votre historique de courses. Si vous faites des trails ou de l'Hyrox, leurs chronos et dénivelés participent à ces calculs. Pour établir des records réels incontestables sur 1 km, 10 km ou semi, n'hésitez pas à courir des courses officielles sur route plate !
                                </p>
                            </div>
                        </div>

                    </div>

                    <!-- Footer -->
                    <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <button type="button" id="okPacesCalcInfoModal" class="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition cursor-pointer shadow-xs active:scale-95">
                            J'ai compris
                        </button>
                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modalEl = document.getElementById('pacesCalcInfoModal');
            const closeBtn = document.getElementById('closePacesCalcInfoModal');
            const okBtn = document.getElementById('okPacesCalcInfoModal');

            function closeModal() {
                if (modalEl) modalEl.remove();
                document.removeEventListener('keydown', handleEsc);
            }

            function handleEsc(e) {
                if (e.key === 'Escape') closeModal();
            }

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (okBtn) okBtn.addEventListener('click', closeModal);
            if (modalEl) {
                modalEl.addEventListener('click', function (e) {
                    if (e.target === modalEl) closeModal();
                });
            }
            document.addEventListener('keydown', handleEsc);
        }

        // Fonction pour ouvrir la modale d'explication des 4 carrés statistiques (distance, prix, dénivelé, temps)
        function openMetricCalcInfoModal(metricType, stats) {
            if (!stats) return;
            const existing = document.getElementById('metricCalcInfoModal');
            if (existing) existing.remove();

            let title = '';
            let iconClass = '';
            let statsObj = null;
            let racesList = [];
            let formatVal = v => String(v);
            let unitName = '';

            if (metricType === 'distance') {
                title = 'Statistiques sur les distances';
                iconClass = 'fa-route text-green-600';
                statsObj = stats.distanceStats;
                racesList = stats.racesWithDistance || [];
                unitName = 'km';
                formatVal = v => (typeof v === 'number' ? (Math.round(v * 100) / 100).toLocaleString('fr-FR') : v) + ' km';
            } else if (metricType === 'price') {
                title = 'Statistiques sur les prix';
                iconClass = 'fa-euro-sign text-green-600';
                statsObj = stats.priceStats;
                racesList = stats.racesWithPrice || [];
                unitName = '€';
                formatVal = v => (typeof v === 'number' ? (Math.round(v * 100) / 100).toLocaleString('fr-FR') : v) + ' €';
            } else if (metricType === 'elevation') {
                title = 'Statistiques sur le dénivelé positif (D+)';
                iconClass = 'fa-mountain text-green-600';
                statsObj = stats.elevationStats;
                racesList = stats.racesWithElevation || [];
                unitName = 'm';
                formatVal = v => (typeof v === 'number' ? Math.round(v).toLocaleString('fr-FR') : v) + ' m';
            } else if (metricType === 'elevationNeg') {
                title = 'Statistiques sur le dénivelé négatif (D-)';
                iconClass = 'fa-mountain text-blue-500';
                statsObj = stats.elevationNegStats;
                racesList = stats.racesWithElevationNeg || [];
                unitName = 'm';
                formatVal = v => (typeof v === 'number' ? Math.round(v).toLocaleString('fr-FR') : v) + ' m';
            } else if (metricType === 'time') {
                title = 'Statistiques sur les temps';
                iconClass = 'fa-clock text-green-600';
                statsObj = stats.timeStats;
                racesList = stats.racesWithTime || [];
                unitName = '';
                formatVal = v => secondsToTime(v);
            }

            if (!statsObj || !racesList || racesList.length === 0) return;

            // Trier les courses par valeur croissante (du plus petit au plus grand) pour visualiser la médiane
            const sortedRaces = [...racesList].sort((a, b) => a.value - b.value);
            const n = sortedRaces.length;

            // Min, Max, Médiane
            const minVal = sortedRaces[0].value;
            const maxVal = sortedRaces[n - 1].value;
            const medianIndices = n % 2 === 0 ? [(n / 2) - 1, n / 2] : [Math.floor(n / 2)];

            // Explication de la médiane selon n pair ou impair
            let medianFormulaText = '';
            if (n % 2 === 0) {
                const idx1 = (n / 2);
                const idx2 = idx1 + 1;
                medianFormulaText = `Le nombre de courses (${n}) est pair : la médiane est la moyenne entre la ${idx1}ᵉ course (${formatVal(sortedRaces[idx1 - 1].value)}) et la ${idx2}ᵉ course (${formatVal(sortedRaces[idx2 - 1].value)}).`;
            } else {
                const midIdx = Math.floor(n / 2) + 1;
                medianFormulaText = `Le nombre de courses (${n}) est impair : la médiane est exactement la valeur de la ${midIdx}ᵉ course du classement (${formatVal(sortedRaces[midIdx - 1].value)}).`;
            }

            // Génération des lignes de courses avec badges
            let racesRowsHtml = '';
            sortedRaces.forEach((item, idx) => {
                const rank = idx + 1;
                const r = item.race;
                const val = item.value;
                const isMin = (val === minVal);
                const isMax = (val === maxVal);
                const isMedian = medianIndices.includes(idx);

                let badgeHtml = '';
                if (isMin) {
                    badgeHtml += `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">Min</span> `;
                }
                if (isMedian) {
                    badgeHtml += `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Médiane</span> `;
                }
                if (isMax) {
                    badgeHtml += `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Max</span> `;
                }

                const dateStr = r.date ? new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

                racesRowsHtml += `
                <div class="flex items-center justify-between py-2 px-3 hover:bg-green-50/60 rounded transition-colors text-xs border-b border-gray-100 last:border-b-0">
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                        <span class="w-6 text-gray-400 font-mono text-[11px] font-semibold text-right">#${rank}</span>
                        <div class="truncate">
                            <span class="font-semibold text-gray-800 cursor-pointer hover:text-green-700 hover:underline stat-calc-race-link" data-race-id="${r.id}" title="Cliquer pour voir la fiche">${r.name}</span>
                            ${dateStr ? `<span class="text-gray-400 text-[10px] ml-1.5">(${dateStr})</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        ${badgeHtml}
                        <span class="font-bold text-gray-900">${formatVal(val)}</span>
                    </div>
                </div>
                `;
            });

            const modalHtml = `
            <div id="metricCalcInfoModal" class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200" style="z-index: 10010;">
                <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-green-200 overflow-hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-xs text-sm">
                                <i class="fas ${iconClass}"></i>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-bold text-green-900 leading-tight">
                                    ${title}
                                </h3>
                                <p class="text-[11px] sm:text-xs text-green-700 mt-0.5">
                                    Détail pas-à-pas des calculs et liste des courses prises en compte
                                </p>
                            </div>
                        </div>
                        <button type="button" id="closeMetricCalcInfoModal" class="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white/80 flex items-center justify-center transition cursor-pointer text-lg" title="Fermer">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Body scrollable -->
                    <div class="p-4 sm:p-6 space-y-5 overflow-y-auto text-sm text-gray-700 flex-1 leading-relaxed">
                        
                        <!-- Explication pédagogique simple de chaque indicateur -->
                        <div class="space-y-3">
                            <h4 class="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-calculator text-green-600"></i> Comment chaque valeur est calculée :
                            </h4>

                            <!-- Moyenne -->
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-green-900">📊 Moyenne : <strong>${formatVal(statsObj.mean)}</strong></span>
                                    <span class="text-[10px] text-gray-500">Total / ${n} courses</span>
                                </div>
                                <p class="text-gray-600 text-[11px]">
                                    L'addition de toutes les valeurs (${formatVal(statsObj.sum)}) divisée par le nombre de courses (${n}).
                                </p>
                            </div>

                            <!-- Médiane -->
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-blue-900">🎯 Médiane : <strong>${formatVal(statsObj.median)}</strong></span>
                                    <span class="text-[10px] text-gray-500">Milieu du classement</span>
                                </div>
                                <p class="text-gray-600 text-[11px]">
                                    La valeur centrale du classement : 50% de vos courses sont inférieures ou égales, et 50% sont supérieures.
                                </p>
                                <p class="text-[10px] text-blue-700 font-medium">
                                    📌 ${medianFormulaText}
                                </p>
                            </div>

                            <!-- Étendue -->
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-amber-900">📏 Étendue : <strong>${formatVal(statsObj.range)}</strong></span>
                                    <span class="text-[10px] text-gray-500">Max &minus; Min</span>
                                </div>
                                <p class="text-gray-600 text-[11px]">
                                    La différence entre votre plus grande valeur (${formatVal(maxVal)}) et votre plus petite (${formatVal(minVal)}).
                                </p>
                            </div>

                            <!-- Écart-type -->
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-purple-900">📐 Écart-type : <strong>${typeof statsObj.standardDeviation === 'number' ? (Math.round(statsObj.standardDeviation * 100) / 100).toLocaleString('fr-FR') : statsObj.standardDeviation} ${unitName}</strong></span>
                                    <span class="text-[10px] text-gray-500">Indice de dispersion</span>
                                </div>
                                <p class="text-gray-600 text-[11px]">
                                    Mesure si vos courses sont proches de votre moyenne (écart-type faible = pratique très régulière) ou très éloignées (écart-type élevé = grande diversité de courses).
                                </p>
                            </div>

                            <!-- Total -->
                            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-gray-900">➕ Total cumulé : <strong>${formatVal(statsObj.sum)}</strong></span>
                                    <span class="text-[10px] text-gray-500">Somme de toutes les courses</span>
                                </div>
                                <p class="text-gray-600 text-[11px]">
                                    L'addition brute de l'ensemble de vos ${n} courses enregistrées.
                                </p>
                            </div>
                        </div>

                        <!-- Liste des courses impliquées dans le calcul -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <i class="fas fa-list-ol text-green-600"></i>
                                    <span>Courses classées (${n} courses prises en compte) :</span>
                                </h4>
                                <span class="text-[10px] text-gray-500">Triées du plus petit au plus grand</span>
                            </div>
                            <div class="border border-gray-200 rounded-lg max-h-56 overflow-y-auto bg-white divide-y divide-gray-100 shadow-2xs">
                                ${racesRowsHtml}
                            </div>
                        </div>

                    </div>

                    <!-- Footer -->
                    <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <button type="button" id="okMetricCalcInfoModal" class="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition cursor-pointer shadow-xs active:scale-95">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modalEl = document.getElementById('metricCalcInfoModal');
            const closeBtn = document.getElementById('closeMetricCalcInfoModal');
            const okBtn = document.getElementById('okMetricCalcInfoModal');

            function closeModal() {
                if (modalEl) modalEl.remove();
                document.removeEventListener('keydown', handleEsc);
            }

            function handleEsc(e) {
                if (e.key === 'Escape') closeModal();
            }

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (okBtn) okBtn.addEventListener('click', closeModal);
            if (modalEl) {
                modalEl.addEventListener('click', function (e) {
                    if (e.target === modalEl) closeModal();
                });
                // Écouteur pour ouvrir la fiche de course si clic sur une course dans la liste
                modalEl.querySelectorAll('.stat-calc-race-link').forEach(link => {
                    link.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const raceId = this.getAttribute('data-race-id');
                        closeModal();
                        if (raceId) openRaceFromStats(raceId);
                    });
                });
            }
            document.addEventListener('keydown', handleEsc);
        }

        // Fonction pour mettre à jour le graphique
        function updateChart(chartType = 'distance', sortOrder = 'desc', limit = 10) {
            const stats = calculateRaceStats(window.statsIncludeFuture);
            if (!stats) return;

            // Sélectionner les données selon le type
            let sortedRaces = [];
            let typeLabel = '';
            let unit = '';

            switch (chartType) {
                case 'distance':
                    if (!stats.racesWithDistance || stats.racesWithDistance.length === 0) return;
                    sortedRaces = [...stats.racesWithDistance];
                    typeLabel = 'distances';
                    unit = 'km';
                    break;
                case 'price':
                    if (!stats.racesWithPrice || stats.racesWithPrice.length === 0) return;
                    sortedRaces = [...stats.racesWithPrice];
                    typeLabel = 'prix';
                    unit = '€';
                    break;
                case 'time':
                    if (!stats.racesWithTime || stats.racesWithTime.length === 0) return;
                    sortedRaces = [...stats.racesWithTime];
                    typeLabel = 'temps';
                    unit = '';
                    break;
                case 'elevation':
                    if (!stats.racesWithElevation || stats.racesWithElevation.length === 0) return;
                    sortedRaces = [...stats.racesWithElevation];
                    typeLabel = 'dénivelés D+';
                    unit = 'm';
                    break;
                case 'elevationNeg':
                    if (!stats.racesWithElevationNeg || stats.racesWithElevationNeg.length === 0) return;
                    sortedRaces = [...stats.racesWithElevationNeg];
                    typeLabel = 'dénivelés D-';
                    unit = 'm';
                    break;
                case 'pricePerKm':
                    if (!stats.racesWithPricePerKm || stats.racesWithPricePerKm.length === 0) return;
                    sortedRaces = [...stats.racesWithPricePerKm];
                    typeLabel = 'prix au km';
                    unit = '€/km';
                    break;
                case 'pricePerKmWithElevation':
                    if (!stats.racesWithPricePerKmWithElevation || stats.racesWithPricePerKmWithElevation.length === 0) return;
                    sortedRaces = [...stats.racesWithPricePerKmWithElevation];
                    typeLabel = 'prix au km (ft. dénivelé)';
                    unit = '€/km';
                    break;
                default:
                    return;
            }

            const chartContainer = document.getElementById('top10RacesList');
            const chartButtonsContainer = document.getElementById('chartButtonsContainer');
            const chartTitle = document.getElementById('chartTitle');
            if (!chartContainer || !chartButtonsContainer) return;

            chartContainer.innerHTML = '';

            // Trier selon l'ordre sélectionné
            if (sortOrder === 'asc') {
                sortedRaces.sort((a, b) => a.value - b.value);
            } else {
                sortedRaces.sort((a, b) => b.value - a.value);
            }

            // Sauvegarder la liste complète
            const fullSortedRaces = [...sortedRaces];
            const totalItems = sortedRaces.length;

            // Limiter selon le paramètre limit
            let itemsToShow = limit;
            const distinctRanks = new Set();
            itemsToShow = 0;
            for (let i = 0; i < sortedRaces.length; i++) {
                const currentValue = sortedRaces[i].value;
                if (!distinctRanks.has(currentValue)) {
                    distinctRanks.add(currentValue);
                }
                itemsToShow = i + 1;
                if (distinctRanks.size >= limit) {
                    for (let j = i + 1; j < sortedRaces.length; j++) {
                        if (sortedRaces[j].value === currentValue) {
                            itemsToShow = j + 1;
                        } else {
                            break;
                        }
                    }
                    break;
                }
            }

            // Limiter le tableau
            sortedRaces = sortedRaces.slice(0, itemsToShow);

            // Afficher le bouton "Voir plus" si nécessaire
            chartButtonsContainer.innerHTML = '';
            chartButtonsContainer.dataset.currentLimit = limit.toString();

            if (itemsToShow < totalItems) {
                const nextLimitValue = limit + 10;
                const showMoreBtn = document.createElement('button');
                showMoreBtn.className = 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors';
                showMoreBtn.textContent = `Voir plus (+10)`;
                chartButtonsContainer.appendChild(showMoreBtn);

                showMoreBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    updateChart(chartType, sortOrder, nextLimitValue);
                });
            }

            // Afficher le nombre de courses
            const chartRacesCount = document.getElementById('chartRacesCount');
            if (chartRacesCount) {
                chartRacesCount.textContent = `${itemsToShow} course${itemsToShow > 1 ? 's' : ''} affichée${itemsToShow > 1 ? 's' : ''} (cliquez pour ouvrir)`;
            }

            // Calculer la valeur maximale pour l'échelle
            const maxValue = sortedRaces.length > 0 ? Math.max(...sortedRaces.map(r => r.value)) : 0;

            // Calculer les classements en gérant les égalités avec numérotation continue
            const rankings = [];
            let currentRank = 1;
            for (let i = 0; i < sortedRaces.length; i++) {
                if (i > 0 && sortedRaces[i].value !== sortedRaces[i - 1].value) {
                    currentRank++;
                }
                rankings.push(currentRank);
            }

            // Fonction pour formater la valeur
            const formatValue = (val) => {
                if (chartType === 'time') return secondsToTime(val);
                if (chartType === 'distance' || chartType === 'price' || chartType.startsWith('pricePerKm')) return val.toFixed(2);
                return val;
            };

            sortedRaces.forEach((item, index) => {
                const percent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                let barColor = 'bg-green-500';
                if (chartType === 'price') barColor = 'bg-yellow-500';
                if (chartType === 'time') barColor = 'bg-blue-500';
                if (chartType === 'elevation') barColor = 'bg-purple-500';
                if (chartType.startsWith('pricePerKm')) barColor = 'bg-red-500';
                const rank = rankings[index];
                let rankColor = 'text-green-800 bg-green-100';
                if (rank === 1) rankColor = 'text-yellow-800 bg-yellow-100 border border-yellow-300';
                if (rank === 2) rankColor = 'text-gray-800 bg-gray-100 border border-gray-300';
                if (rank === 3) rankColor = 'text-orange-800 bg-orange-100 border border-orange-300';

                const div = document.createElement('div');
                div.className = 'flex items-center gap-3 p-2 bg-white/70 hover:bg-white rounded-lg transition-all cursor-pointer group border border-transparent hover:border-green-300 hover:shadow-xs';
                div.setAttribute('data-race-id', item.race.id);
                div.setAttribute('title', `Cliquer pour voir la fiche de ${item.race.name}`);
                div.innerHTML = `
                    <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${rankColor} group-hover:scale-105 transition-transform">
                        ${rank}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-medium text-sm truncate mr-2 group-hover:text-green-800 transition-colors" title="${item.race.name} (${new Date(item.race.date).getFullYear()})">
                                ${getUniqueRaceName(item.race, fullSortedRaces.map(r => r.race), true)}
                                <i class="fas fa-arrow-up-right-from-square text-[10px] text-green-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1"></i>
                            </span>
                            <span class="text-sm font-bold text-gray-700">${formatValue(item.value)} ${unit}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="${barColor} h-2.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
                div.addEventListener('click', function () {
                    if (item.race && item.race.id) {
                        openRaceFromStats(item.race.id);
                    }
                });
                chartContainer.appendChild(div);
            });
        }

        // Fonction pour mettre à jour le graphique d'évolution (Chart.js)
        function updateEvolutionChart(races, metric = 'speed') {
            const canvas = document.getElementById('evolutionChartCanvas');
            if (!canvas) return;

            // Détruire l'instance précédente si elle existe
            if (evolutionChartInstance) {
                evolutionChartInstance.destroy();
            }

            const ctx = canvas.getContext('2d');
            
            // Préparer les données
            const labels = races.map(r => {
                const d = new Date(r.date);
                return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
            });
            
            const data = races.map(r => {
                const dist = parseFloat(r.distance);
                const seconds = timeToSeconds(r.time);
                const speed = dist / (seconds / 3600);
                
                if (metric === 'speed') {
                    return parseFloat(speed.toFixed(2));
                } else {
                    // Pace in min/km (decimal)
                    const pace = 60 / speed;
                    return parseFloat(pace.toFixed(2));
                }
            });

            // Trouver le meilleur et le pire
            let bestIndex = -1;
            let worstIndex = -1;
            if (data.length > 0) {
                let bestVal, worstVal;
                if (metric === 'speed') {
                    bestVal = Math.max(...data);
                    worstVal = Math.min(...data);
                } else {
                    bestVal = Math.min(...data); // Allure : plus bas est mieux
                    worstVal = Math.max(...data);
                }
                bestIndex = data.indexOf(bestVal);
                worstIndex = data.lastIndexOf(worstVal);
            }

            const metricLabel = metric === 'speed' ? 'Vitesse (km/h)' : 'Allure (min/km)';
            const rootStyle = getComputedStyle(document.documentElement);
            const greenPrimary = rootStyle.getPropertyValue('--color-green-600').trim() || '#16a34a';
            const emeraldPrimary = rootStyle.getPropertyValue('--color-emerald-600').trim() || '#059669';
            const emeraldRgb = rootStyle.getPropertyValue('--color-emerald-600-rgb').trim() || '5, 150, 105';

            const borderColor = metric === 'speed' ? '#2563eb' : emeraldPrimary;
            const bgColor = metric === 'speed' ? 'rgba(37, 99, 235, 0.1)' : `rgba(${emeraldRgb}, 0.1)`;

            // Plugin personnalisé pour dessiner les barres verticales Best/Worst
            const verticalLinePlugin = {
                id: 'verticalLinePlugin',
                afterDatasetsDraw(chart) {
                    const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
                    
                    const drawVLine = (idx, color, label) => {
                        if (idx === -1) return;
                        const xPos = x.getPixelForValue(idx);
                        
                        ctx.save();
                        ctx.beginPath();
                        ctx.setLineDash([6, 4]);
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = color;
                        ctx.moveTo(xPos, top);
                        ctx.lineTo(xPos, bottom);
                        ctx.stroke();
                        ctx.restore();
                    };

                    if (bestIndex !== -1 && bestIndex !== worstIndex) {
                        drawVLine(bestIndex, greenPrimary);
                    }
                    if (worstIndex !== -1) {
                        drawVLine(worstIndex, '#dc2626');
                    }
                }
            };

            // Créer le graphique
            evolutionChartInstance = new Chart(ctx, {
                type: 'line',
                plugins: [verticalLinePlugin],
                data: {
                    labels: labels,
                    datasets: [{
                        label: metricLabel,
                        data: data,
                        borderColor: borderColor,
                        backgroundColor: bgColor,
                        borderWidth: 2,
                        pointBackgroundColor: borderColor,
                        pointRadius: function(context) {
                            const index = context.dataIndex;
                            return (index === bestIndex || index === worstIndex) ? 6 : 3;
                        },
                        pointHoverRadius: 8,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (event, elements, chart) => {
                        let targetRace = null;
                        if (elements && elements.length > 0) {
                            const index = elements[0].index;
                            targetRace = races[index];
                        } else if (chart && typeof chart.getElementsAtEventForMode === 'function') {
                            const nativeEvent = event.native || event;
                            const points = chart.getElementsAtEventForMode(nativeEvent, 'nearest', { intersect: false }, true);
                            if (points && points.length > 0) {
                                const index = points[0].index;
                                targetRace = races[index];
                            }
                        }
                        if (targetRace && targetRace.id) {
                            openRaceFromStats(targetRace.id);
                        }
                    },
                    onHover: (event, chartElement) => {
                        const target = (event.native ? event.native.target : event.target);
                        if (target) {
                            target.style.cursor = chartElement && chartElement.length > 0 ? 'pointer' : 'default';
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            padding: 10,
                            titleFont: { size: 12, weight: 'bold' },
                            bodyFont: { size: 13 },
                            callbacks: {
                                title: (context) => {
                                    const index = context[0].dataIndex;
                                    const race = races[index];
                                    return race.name;
                                },
                                label: (context) => {
                                    const val = context.parsed.y;
                                    const index = context.dataIndex;
                                    const race = races[index];
                                    const date = labels[index];
                                    return [
                                        `Performance : ${val} ${metric === 'speed' ? 'km/h' : 'min/km'}`,
                                        `Date : ${date}`,
                                        `Distance : ${race.distance} km`
                                    ];
                                },
                                afterBody: () => {
                                    return ['', '👉 Cliquer pour ouvrir la fiche de course'];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                font: { size: 11 },
                                callback: function(value) {
                                    return value + (metric === 'speed' ? ' km/h' : ' min/km');
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: { size: 10 },
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }

        // --- GESTION DES ÉVÉNEMENTS ---

        // Ouvrir la modale
        if (statsBtn) {
            statsBtn.addEventListener('click', function () {
                if (window.isSelectionMode) return;
                statsModal.classList.remove('hidden');
                saveUserFlag('statsModalViewed');
                setTimeout(() => {
                    const content = statsModal.querySelector('.fade-in');
                    if (content) {
                        content.classList.add('active');
                    }
                }, 10);
                window.displayRaceStats();
            });
        }

        // Fermer la modale
        if (closeStatsModal) {
            closeStatsModal.addEventListener('click', function () {
                const content = statsModal.querySelector('.fade-in');
                if (content) {
                    content.classList.remove('active');
                    setTimeout(() => {
                        statsModal.classList.add('hidden');
                    }, 300);
                } else {
                    statsModal.classList.add('hidden');
                }
            });
        }

        // Fermer en cliquant en dehors
        statsModal.addEventListener('click', function (e) {
            if (e.target === statsModal) {
                closeStatsModal.click();
            }
        });

        // Gestion de la modale de paramètres
        const statsSettingsBtn = document.getElementById('statsSettingsBtn');
        const statsSettingsModal = document.getElementById('statsSettingsModal');
        const closeStatsSettingsModal = document.getElementById('closeStatsSettingsModal');
        const statsSettingsContent = document.getElementById('statsSettingsContent');

        if (statsSettingsBtn) {
            statsSettingsBtn.addEventListener('click', function () {
                // Générer le contenu des paramètres
                const futureInfo = getFutureRacesInfo();
                let html = '<div class="space-y-4">';

                // Message sur les courses futures
                if (futureInfo.totalFutureRaces > 0) {
                    html += `<div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">`;
                    html += `<p class="text-blue-800 mb-3">
                        Vous avez <strong>${futureInfo.totalFutureRaces}</strong> course${futureInfo.totalFutureRaces > 1 ? 's' : ''} future${futureInfo.totalFutureRaces > 1 ? 's' : ''} qui ne ${futureInfo.totalFutureRaces > 1 ? 'sont' : 'est'} pas comptée${futureInfo.totalFutureRaces > 1 ? 's' : ''} dans les stats par défaut.
                     </p>`;

                    html += `<div class="bg-white p-3 rounded border border-blue-100">`;
                    html += `<h4 class="text-sm font-semibold text-blue-800 mb-2">Liste des courses à venir :</h4>`;
                    html += `<ul class="list-disc list-inside space-y-1 text-sm text-blue-700 max-h-40 overflow-y-auto pr-2">`;

                    futureInfo.futureRaces.forEach(race => {
                        const raceDate = new Date(race.date);
                        const dateStr = raceDate.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        });
                        html += `<li><span class="font-medium">${race.name}</span> <span class="text-xs text-gray-500">(${dateStr})</span></li>`;
                    });

                    html += `</ul></div>`;
                    html += `</div>`;
                } else {
                    html += '<p class="text-gray-600 mb-4">Personnalisez l\'affichage des statistiques.</p>';
                }

                html += '<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">';
                html += '<div>';
                html += '<h4 class="font-medium text-gray-800">Inclure les courses futures</h4>';
                html += '<p class="text-sm text-gray-500">Afficher également les statistiques prévisionnelles</p>';
                html += '</div>';
                html += `<label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="includeFutureStatsToggle" class="sr-only peer" ${window.statsIncludeFuture ? 'checked' : ''}>
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>`;
                html += '</div>';
                html += '</div>';

                if (statsSettingsContent) {
                    statsSettingsContent.innerHTML = html;
                }

                statsSettingsModal.classList.remove('hidden');

                // Listener pour le toggle
                const toggle = document.getElementById('includeFutureStatsToggle');
                if (toggle) {
                    toggle.addEventListener('change', function () {
                        window.statsIncludeFuture = this.checked;
                        localStorage.setItem('statsIncludeFuture', this.checked);
                        // Rafraîchir les stats
                        window.displayRaceStats();
                    });
                }
            });
        }

        if (closeStatsSettingsModal) {
            closeStatsSettingsModal.addEventListener('click', function () {
                statsSettingsModal.classList.add('hidden');
            });
        }

    }

    // Démarrer l'initialisation
    initStatsModal();

})();
