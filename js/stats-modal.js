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

        // Variable globale pour stocker le mode d'affichage des stats
        // Restaurer depuis localStorage ou utiliser false par défaut
        window.statsIncludeFuture = localStorage.getItem('statsIncludeFuture') === 'true';

        // Fonction pour détecter les courses futures
        function getFutureRacesInfo() {
            const racesData = window.races || (typeof races !== 'undefined' ? races : []);
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
            const racesData = window.races || (typeof races !== 'undefined' ? races : []);
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
                return includeFuture || raceDate < today;
            });

            if (pastRaces.length === 0) return null;

            // Extraire les valeurs valides pour chaque métrique
            const prices = pastRaces
                .map(r => parseFloat(r.price))
                .filter(p => !isNaN(p) && p > 0);

            const elevations = pastRaces
                .map(r => parseFloat(r.elevation))
                .filter(e => !isNaN(e) && e > 0);

            const times = pastRaces
                .map(r => timeToSeconds(r.time))
                .filter(t => t !== null && t > 0);

            // Trouver les records
            let longestDistanceRace = null;
            let maxDistance = 0;
            pastRaces.forEach(race => {
                // Calculer la distance totale pour chaque course (triathlon inclus)
                let totalDist = parseFloat(race.distance) || 0;
                if (race.terrain === 'triathlon') {
                    const swim = (parseFloat(race.swimDistance) || 0) / 1000;
                    const bike = parseFloat(race.bikeDistance) || 0;
                    const run = parseFloat(race.distance) || 0;
                    totalDist = swim + bike + run;
                }

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
                highestElevationRace = pastRaces.find(r => parseFloat(r.elevation) === maxElevation);
            }

            // Courses avec le temps le plus long
            let longestTimeRace = null;
            if (times.length > 0) {
                const maxTime = Math.max(...times);
                longestTimeRace = pastRaces.find(r => timeToSeconds(r.time) === maxTime);
            }

            // Calculer les distances (gérer le triathlon)
            const distances = pastRaces.map(race => {
                let dist = parseFloat(race.distance) || 0;
                if (race.terrain === 'triathlon') {
                    const swim = (parseFloat(race.swimDistance) || 0) / 1000;
                    const bike = parseFloat(race.bikeDistance) || 0;
                    const run = parseFloat(race.distance) || 0;
                    dist = swim + bike + run;
                }
                return dist;
            }).filter(d => d > 0);

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
            let terrainStats = { route: 0, trail: 0, triathlon: 0, relai: 0, total: 0 };
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
                .map(race => {
                    let val = parseFloat(race.distance) || 0;
                    if (race.terrain === 'triathlon') {
                        const swim = (parseFloat(race.swimDistance) || 0) / 1000;
                        const bike = parseFloat(race.bikeDistance) || 0;
                        const run = parseFloat(race.distance) || 0;
                        val = swim + bike + run;
                    }
                    return {
                        race: race,
                        value: val
                    };
                })
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
                    const time = timeToSeconds(race.time);
                    return {
                        race: race,
                        value: time || 0
                    };
                })
                .filter(r => r.value > 0)
                .sort((a, b) => b.value - a.value);

            // Préparer les données pour le graphique des dénivelés
            const racesWithElevation = pastRaces
                .map(race => ({
                    race: race,
                    value: parseFloat(race.elevation) || 0
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

            return {
                totalRaces: pastRaces.length,
                validRaces: pastRaces,
                longestDistanceRace,
                maxDistance,
                highestPriceRace,
                highestElevationRace,
                longestTimeRace,
                distanceStats,
                priceStats,
                elevationStats,
                timeStats,
                terrainStats,
                racesWithDistance,
                racesWithPrice,
                racesWithTime,
                racesWithElevation,
                racesWithPricePerKm,
                racesWithPricePerKmWithElevation,
                triathlonStats
            };
        }

        // Fonction pour formater le nom de la course (gestion des doublons)
        function getUniqueRaceName(race, contextRaces, isChart = false) {
            if (!race) return '';
            const duplicates = contextRaces.filter(r => r.name.trim().toLowerCase() === race.name.trim().toLowerCase());
            if (duplicates.length > 1 && race.date) {
                const year = new Date(race.date).getFullYear();
                if (isChart === 'text') {
                    return `${race.name} (${year})`;
                } else if (isChart) {
                    return `${race.name} <span class="text-xs text-gray-500 font-normal ml-1">(${year})</span>`;
                } else {
                    return `${race.name} <span class="text-gray-500 font-normal">(${year})</span>`;
                }
            }
            return race.name;
        }

        // Fonction pour afficher les statistiques
        window.displayRaceStats = function displayRaceStats() {
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
                    html += `<li><strong>Plus de dénivelé :</strong> ${getUniqueRaceName(stats.highestElevationRace, stats.validRaces)} (${stats.highestElevationRace.elevation} m D+)</li>`;
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
                    html += `<div class="bg-green-100 p-4 rounded-lg"><h4 class="font-bold text-green-800 mb-3">Statistiques sur les distances</h4>`;
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
                    // Vérifier si l'utilisateur est invité
                    const isInvite = sessionStorage.getItem('authLevel') === 'invite';
                    const blurClass = isInvite ? 'blur-text' : '';

                    html += `<div class="bg-green-100 p-4 rounded-lg"><h4 class="font-bold text-green-800 mb-3">Statistiques sur les prix</h4>`;
                    html += `<ul class="list-disc list-inside space-y-2">`;
                    html += `<li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${ps.mean} €</span></li>`;
                    html += `<li><strong>Médiane :</strong> <span class="text-green-600 font-semibold ${blurClass}">${ps.median} €</span></li>`;
                    html += `<li><strong>Étendue :</strong> <span class="text-green-600 font-semibold ${blurClass}">${ps.range} €</span></li>`;
                    html += `<li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold ${blurClass}">${ps.standardDeviation.toFixed(2)} €</span></li>`;
                    html += `<li><strong>Total :</strong> <span class="text-green-600 font-semibold ${blurClass}">${ps.sum} €</span></li>`;
                    html += `</ul></div>`;
                }

                // Statistiques sur les dénivelés
                if (stats.elevationStats && Object.keys(stats.elevationStats).length > 0) {
                    const es = stats.elevationStats;
                    html += `<div class="bg-green-100 p-4 rounded-lg"><h4 class="font-bold text-green-800 mb-3">Statistiques sur les dénivelés</h4>`;
                    html += `<ul class="list-disc list-inside space-y-2">`;
                    html += `<li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${es.mean} m</span></li>`;
                    html += `<li><strong>Médiane :</strong> <span class="text-green-600 font-semibold">${es.median} m</span></li>`;
                    html += `<li><strong>Étendue :</strong> <span class="text-green-600 font-semibold">${es.range} m</span></li>`;
                    html += `<li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold">${es.standardDeviation} m</span></li>`;
                    html += `<li><strong>Total :</strong> <span class="text-green-600 font-semibold">${es.sum} m</span></li>`;
                    html += `</ul></div>`;
                }

                // Statistiques sur les temps
                if (stats.timeStats && Object.keys(stats.timeStats).length > 0) {
                    const ts = stats.timeStats;
                    html += `<div class="bg-green-100 p-4 rounded-lg"><h4 class="font-bold text-green-800 mb-3">Statistiques sur les temps</h4>`;
                    html += `<ul class="list-disc list-inside space-y-2">`;
                    html += `<li><strong>Moyenne :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.mean)}</span></li>`;
                    html += `<li><strong>Médiane :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.median)}</span></li>`;
                    html += `<li><strong>Étendue :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.range)}</span></li>`;
                    html += `<li><strong>Écart-type :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.standardDeviation)}</span></li>`;
                    html += `<li><strong>Total :</strong> <span class="text-green-600 font-semibold">${secondsToTime(ts.sum)}</span></li>`;
                    html += `</ul></div>`;
                }

                html += '</div>'; // Fermeture de la grid à 2 colonnes

                // Statistiques spécifiques Triathlon (en pleine largeur)
                if (stats.triathlonStats) {
                    const ts = stats.triathlonStats;
                    html += `<div class="bg-blue-100 p-4 rounded-lg mb-6"><h4 class="font-bold text-blue-800 mb-3">Moyennes Triathlon (${ts.count} courses)</h4>`;
                    html += `<ul class="list-disc list-inside space-y-2">`;
                    html += `<li><strong>Natation :</strong> <span class="text-blue-600 font-semibold">${ts.avgSwim} m</span></li>`;
                    html += `<li><strong>Vélo :</strong> <span class="text-blue-600 font-semibold">${ts.avgBike} km</span></li>`;
                    html += `<li><strong>Course à pied :</strong> <span class="text-blue-600 font-semibold">${ts.avgRun} km</span></li>`;
                    html += `</ul></div>`;
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
                    if (ts.relai > 0) html += `<div class="bg-blue-300 h-full transition-all duration-500" style="width: ${getPercent(ts.relai)}%"></div>`;
                    html += `</div>`;

                    // Légende avec pourcentages
                    html += `<div class="flex flex-wrap gap-4 justify-center text-sm text-blue-900">`;
                    if (ts.route > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-900"></span> Route (${ts.route} - ${getPercent(ts.route).toFixed(1)}%)</div>`;
                    if (ts.trail > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-700"></span> Trail (${ts.trail} - ${getPercent(ts.trail).toFixed(1)}%)</div>`;
                    if (ts.triathlon > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span> Triathlon (${ts.triathlon} - ${getPercent(ts.triathlon).toFixed(1)}%)</div>`;
                    if (ts.relai > 0) html += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-300"></span> Relai (${ts.relai} - ${getPercent(ts.relai).toFixed(1)}%)</div>`;
                    html += `</div>`;

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

                    // Vérifier si l'utilisateur est invité
                    const isInvite = sessionStorage.getItem('authLevel') === 'invite';

                    if (stats.racesWithPrice && stats.racesWithPrice.length > 0 && !isInvite) {
                        html += `<option value="price">des prix</option>`;
                    }
                    if (stats.racesWithTime && stats.racesWithTime.length > 0) {
                        html += `<option value="time">des temps</option>`;
                    }
                    if (stats.racesWithElevation && stats.racesWithElevation.length > 0) {
                        html += `<option value="elevation">des dénivelés</option>`;
                    }
                    if (stats.racesWithPricePerKm && stats.racesWithPricePerKm.length > 0 && !isInvite) {
                        html += `<option value="pricePerKm">du prix au km</option>`;
                    }
                    if (stats.racesWithPricePerKmWithElevation && stats.racesWithPricePerKmWithElevation.length > 0 && !isInvite) {
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
            } catch (e) {
                console.error('[stats-modal] Erreur affichage stats:', e);
            }
        };

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
                    typeLabel = 'dénivelés';
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
                chartRacesCount.textContent = `${itemsToShow} course${itemsToShow > 1 ? 's' : ''} affichée${itemsToShow > 1 ? 's' : ''}`;
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

                // Vérifier si l'utilisateur est invité pour les graphiques de prix
                const isInvite = sessionStorage.getItem('authLevel') === 'invite';
                const blurClass = (isInvite && (chartType === 'price' || chartType.startsWith('pricePerKm'))) ? 'blur-text' : '';

                const rank = rankings[index];
                let rankColor = 'text-green-800 bg-green-100';
                if (rank === 1) rankColor = 'text-yellow-800 bg-yellow-100 border border-yellow-300';
                if (rank === 2) rankColor = 'text-gray-800 bg-gray-100 border border-gray-300';
                if (rank === 3) rankColor = 'text-orange-800 bg-orange-100 border border-orange-300';

                const div = document.createElement('div');
                div.className = 'flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors';
                div.innerHTML = `
                    <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${rankColor}">
                        ${rank}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-medium text-sm truncate mr-2" title="${item.race.name} (${new Date(item.race.date).getFullYear()})">
                                ${getUniqueRaceName(item.race, fullSortedRaces.map(r => r.race), true)}
                            </span>
                            <span class="text-sm font-bold text-gray-700 ${blurClass}">${formatValue(item.value)} ${unit}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="${barColor} h-2.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
                chartContainer.appendChild(div);
            });
        }

        // --- GESTION DES ÉVÉNEMENTS ---

        // Ouvrir la modale
        if (statsBtn) {
            statsBtn.addEventListener('click', function () {
                statsModal.classList.remove('hidden');
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
