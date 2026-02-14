// ====================================================================
// AFFICHAGE DES COURSES
// ====================================================================

(function () {
    'use strict';

    // Attendre que le DOM soit prêt
    function initRaceDisplay() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initRaceDisplay);
            return;
        }

        console.log('[race-display] Initialisation du système d\'affichage des courses');

        const racesContainer = document.getElementById('racesContainer');
        const searchInput = document.getElementById('searchInput');

        /**
         * Affiche une liste de courses dans le conteneur
         * @param {Array} racesToDisplay - Tableau des courses à afficher  
         */
        window.displayRaces = function (racesToDisplay) {
            console.log(`[race-display] Affichage de ${racesToDisplay.length} courses`);

            if (!racesContainer) {
                console.error('[race-display] racesContainer introuvable');
                return;
            }

            // Vider le conteneur
            racesContainer.innerHTML = '';

            // Si aucune course à afficher
            if (!racesToDisplay || racesToDisplay.length === 0) {
                racesContainer.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <p class="text-gray-500 text-lg">Aucune course trouvée</p>
                    </div>
                `;
                return;
            }

            // Afficher chaque course
            racesToDisplay.forEach(race => {
                const raceCard = createRaceCard(race);
                racesContainer.appendChild(raceCard);
            });

            console.log(`[race-display] ${racesToDisplay.length} courses affichées`);
        };

        /**
         * Recherche des courses par nom
         * @param {string} query - Terme de recherche
         */
        window.searchRaces = function (query) {
            if (!window.races) {
                console.warn('[race-display] window.races n\'est pas défini');
                return;
            }

            const searchQuery = (query || '').toLowerCase().trim();
            console.log(`[race-display] Recherche: "${searchQuery}"`);

            let filteredRaces = window.races;

            if (searchQuery) {
                filteredRaces = window.races.filter(race => {
                    return (race.name || '').toLowerCase().includes(searchQuery);
                });
            }

            // Mettre à jour les stats si la fonction existe
            if (typeof window.updateStats === 'function') {
                window.updateStats(filteredRaces);
            }

            // Afficher les résultats
            window.displayRaces(filteredRaces);
        };

        /**
         * Crée une carte HTML pour une course
         * @param {Object} race - Données de la course
         * @returns {HTMLElement} - Élément DOM de la carte
         */
        function createRaceCard(race) {
            const card = document.createElement('div');
            card.className = 'race-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer';
            card.dataset.raceId = race.id;

            // Image ou placeholder
            const imageUrl = race.photo || 'https://via.placeholder.com/400x200?text=Course';

            // Formater la date
            const formattedDate = race.date ? new Date(race.date).toLocaleDateString('fr-FR') : 'Date non définie';

            // Terrain icon
            const terrainIcons = {
                'route': '🛣️',
                'trail': '⛰️',
                'triathlon': '🏊‍♂️🚴‍♂️🏃‍♂️',
                '': '🏃'
            };
            const terrainIcon = terrainIcons[race.terrain || ''] || terrainIcons[''];

            // Favori
            const favoriteClass = race.favorite ? 'text-yellow-500' : 'text-gray-300';

            card.innerHTML = `
                <div class="relative">
                    <img src="${imageUrl}" alt="${race.name}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x200?text=Course'">
                    ${race.favorite ? '<div class="absolute top-2 right-2 bg-yellow-400 rounded-full p-2"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></div>' : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg text-green-800 mb-2">${race.name || 'Sans nom'}</h3>
                    <div class="space-y-1 text-sm text-gray-600">
                        <p>${terrainIcon} ${formattedDate}</p>
                        ${race.location ? `<p>📍 ${race.location}</p>` : ''}
                        ${race.distance ? `<p>📏 ${race.distance} km</p>` : ''}
                        ${race.elevation ? `<p>⛰️ ${race.elevation} m D+</p>` : ''}
                    </div>
                </div>
            `;

            // Ajouter l'événement de clic pour afficher les détails
            card.addEventListener('click', () => {
                if (typeof window.showRaceDetails === 'function') {
                    window.showRaceDetails(race.id);
                }
            });

            return card;
        }

        // Event listener pour la recherche
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                window.searchRaces(e.target.value);
            });
        }

        console.log('[race-display] Système d\'affichage initialisé');
    }

    // Démarrer l'initialisation
    initRaceDisplay();
})();
