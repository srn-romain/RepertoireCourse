// ====================================================================
// GESTION DES FILTRES AVANCÉS
// ====================================================================

(function () {
    let isInitialized = false;
    // Variables pour stocker les filtres actifs de la deuxième ligne
    let activeTypeFilter = '';
    let activeRankFilter = '';
    let activeCommentsFilter = '';
    let activeCompanionsFilter = '';

    // Attendre que tout soit chargé
    let waitLogged = false;
    function initAdvancedFilters() {
        if (isInitialized) return;

        const displayFn = window.displayRaces || (typeof displayRaces !== 'undefined' ? displayRaces : null);

        // Vérifier que les dépendances sont disponibles
        if (typeof window.races === 'undefined' || !displayFn) {
            if (!waitLogged) {
                console.log('[advanced-filters] En attente des dépendances...');
                waitLogged = true;
            }
            setTimeout(initAdvancedFilters, 100);
            return;
        }

        isInitialized = true;

        const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
        const toggleFiltersIcon = document.getElementById('toggleFiltersIcon');
        const filtersContent = document.getElementById('filtersContent');
        const advancedFiltersPanel = document.getElementById('advancedFiltersPanel');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');
        const searchInput = document.getElementById('searchInput');

        // Vérifier que les éléments essentiels sont présents
        if (!toggleFiltersBtn || !filtersContent || !advancedFiltersPanel) {
            setTimeout(initAdvancedFilters, 100);
            return;
        }

        console.log('[advanced-filters] Initialisation des filtres avancés');

        // Afficher le panneau de filtres avancés
        if (advancedFiltersPanel) {
            advancedFiltersPanel.classList.remove('hidden');
        }

        // S'assurer que le contenu des filtres est caché au démarrage
        if (filtersContent) {
            filtersContent.classList.add('hidden');
        }

        // Toggle le contenu des filtres
        if (toggleFiltersBtn && filtersContent) {
            console.log('[advanced-filters] Event listener pour toggleFiltersBtn ajouté');
            toggleFiltersBtn.addEventListener('click', () => {
                console.log('[advanced-filters] Clic sur toggleFiltersBtn');
                const isHidden = filtersContent.classList.contains('hidden');
                console.log('[advanced-filters] Actuellement caché:', isHidden);

                if (isHidden) {
                    filtersContent.classList.remove('hidden');
                    console.log('[advanced-filters] Contenu affiché');
                } else {
                    filtersContent.classList.add('hidden');
                    console.log('[advanced-filters] Contenu caché');
                }

                // Rotation de l'icône
                if (toggleFiltersIcon) {
                    toggleFiltersIcon.classList.toggle('rotate-180');
                }
            });
        } else {
            console.log('[advanced-filters] ERREUR: toggleFiltersBtn ou filtersContent introuvable!', {
                toggleFiltersBtn: !!toggleFiltersBtn,
                filtersContent: !!filtersContent
            });
        }

        // Remplir la liste des lieux à partir des courses
        function populateLocationFilter() {
            const filterLocation = document.getElementById('filterLocation');
            if (!filterLocation || !window.races) return;

            // Récupérer tous les lieux uniques
            const locations = new Set();
            window.races.forEach(race => {
                if (race.location && race.location.trim() !== '') {
                    locations.add(race.location.trim());
                }
            });

            const sortedLocations = Array.from(locations).sort();

            while (filterLocation.options.length > 1) {
                filterLocation.remove(1);
            }

            sortedLocations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                filterLocation.appendChild(option);
            });
        }

        // Fonction principale d'application des filtres
        function applyAdvancedFilters() {
            console.log('[advanced-filters] Application des filtres avancés');

            // Récupérer TOUS les filtres
            const locationFilter = document.getElementById('filterLocation')?.value || '';
            const priceFilter = document.getElementById('filterPrice')?.value || '';
            const elevationFilter = document.getElementById('filterElevation')?.value || '';
            const distanceFilter = document.getElementById('filterDistance')?.value || '';

            // Utiliser les valeurs actives pour les filtres de la 2ème ligne
            const typeFilter = activeTypeFilter;
            const rankFilter = activeRankFilter;
            const commentsFilter = activeCommentsFilter;
            const companionsFilter = activeCompanionsFilter;

            const nameQuery = (searchInput?.value || '').toLowerCase().trim();

            console.log('[advanced-filters] Filtres 1ère ligne:', { locationFilter, priceFilter, elevationFilter, distanceFilter });
            console.log('[advanced-filters] Filtres 2ème ligne:', { typeFilter, rankFilter, commentsFilter, companionsFilter });
            console.log('[advanced-filters] Recherche:', nameQuery);

            // Utiliser les données non filtrées si disponibles
            // Sinon on risque de filtrer une liste déjà filtrée
            const sourceRaces = (window.originalRaces && Array.isArray(window.originalRaces)) ? window.originalRaces : window.races;

            // Toujours travailler sur une copie
            let filteredRaces = [...sourceRaces];

            // Filtre par mots clés (nom, lieu, date, dénivelé, temps, note, classements)
            if (nameQuery) {
                filteredRaces = filteredRaces.filter(race => {
                    const searchStr = `
                        ${race.name || ''} 
                        ${race.location || ''} 
                        ${race.date || ''} 
                        ${race.elevation || ''} ${race.elevation || ''}m +${race.elevation || ''}m
                        ${race.distance || ''} ${race.distance || ''}km
                        ${race.time || ''} 
                        ${race.rating || ''} 
                        ${race.notes || ''} 
                        ${race.bibNumber || ''} 
                        ${race.rankCategoryName || ''} ${race.rankCategoryCode || ''}
                        ${race.rankPos || ''}/${race.rankTotal || ''} 
                        ${race.rankPos || ''} / ${race.rankTotal || ''}
                        ${race.rankCategoryPos || ''}/${race.rankCategoryTotal || ''}
                        ${race.rankCategoryPos || ''} / ${race.rankCategoryTotal || ''}
                        ${race.rankGenderPos || ''}/${race.rankGenderTotal || ''}
                        ${race.rankGenderPos || ''} / ${race.rankGenderTotal || ''}
                    `.toLowerCase();
                    return searchStr.includes(nameQuery);
                });
            }

            // Filtre par lieu
            if (locationFilter) {
                filteredRaces = filteredRaces.filter(race =>
                    race.location && race.location.trim() === locationFilter
                );
            }

            // Filtre par prix
            if (priceFilter) {
                filteredRaces = filteredRaces.filter(race => {
                    const price = parseFloat(race.price);
                    if (isNaN(price)) return false;

                    if (priceFilter === '0-20') return price >= 0 && price <= 20;
                    if (priceFilter === '20-40') return price > 20 && price <= 40;
                    if (priceFilter === '40-60') return price > 40 && price <= 60;
                    if (priceFilter === '60-80') return price > 60 && price <= 80;
                    if (priceFilter === '80+') return price > 80;
                    return true;
                });
            }

            // Filtre par dénivelé
            if (elevationFilter) {
                filteredRaces = filteredRaces.filter(race => {
                    const elevation = parseFloat(race.elevation);
                    if (isNaN(elevation)) return false;

                    if (elevationFilter === '0-500') return elevation >= 0 && elevation <= 500;
                    if (elevationFilter === '500-1000') return elevation > 500 && elevation <= 1000;
                    if (elevationFilter === '1000-1500') return elevation > 1000 && elevation <= 1500;
                    if (elevationFilter === '1500-2000') return elevation > 1500 && elevation <= 2000;
                    if (elevationFilter === '2000+') return elevation > 2000;
                    return true;
                });
            }

            // Filtre par distance
            if (distanceFilter) {
                filteredRaces = filteredRaces.filter(race => {
                    const distance = parseFloat(race.distance);
                    if (isNaN(distance)) return false;

                    if (distanceFilter === '0-10') return distance >= 0 && distance <= 10;
                    if (distanceFilter === '10-20') return distance > 10 && distance <= 20;
                    if (distanceFilter === '20-30') return distance > 20 && distance <= 30;
                    if (distanceFilter === '30-40') return distance > 30 && distance <= 40;
                    if (distanceFilter === '40-50') return distance > 40 && distance <= 50;
                    if (distanceFilter === '50+') return distance > 50;
                    return true;
                });
            }

            // Filtre par type de course
            if (typeFilter) {
                const beforeTypeFilter = filteredRaces.length;
                filteredRaces = filteredRaces.filter(race => {
                    return (race.terrain || '') === typeFilter;
                });
                console.log(`[advanced-filters] Filtre type (${typeFilter}): ${beforeTypeFilter} → ${filteredRaces.length} courses`);
            }



            // Fonction utilitaire pour calculer le pourcentage du classement dans le peloton
            function getRaceRankPercent(race) {
                const pos = parseFloat(race.rankPos);
                const total = parseFloat(race.rankTotal);
                if (!isNaN(pos) && !isNaN(total) && total > 0 && pos > 0) {
                    return (pos / total) * 100;
                }
                const hasNewRankingSchema = Number(race.rankingFieldsVersion) >= 2 ||
                    (race.rankCategoryPos != null && race.rankCategoryPos !== '') ||
                    (race.rankCategoryTotal != null && race.rankCategoryTotal !== '');
                const categoryPos = parseFloat(hasNewRankingSchema ? race.rankCategoryPos : race.rankGenderPos);
                const categoryTotal = parseFloat(hasNewRankingSchema ? race.rankCategoryTotal : race.rankGenderTotal);
                const genderPos = hasNewRankingSchema ? parseFloat(race.rankGenderPos) : NaN;
                const genderTotal = hasNewRankingSchema ? parseFloat(race.rankGenderTotal) : NaN;
                const gPos = Number.isFinite(categoryPos) && Number.isFinite(categoryTotal)
                    ? categoryPos
                    : genderPos;
                const gTotal = Number.isFinite(categoryPos) && Number.isFinite(categoryTotal)
                    ? categoryTotal
                    : genderTotal;
                if (!isNaN(gPos) && !isNaN(gTotal) && gTotal > 0 && gPos > 0) {
                    return (gPos / gTotal) * 100;
                }
                return null;
            }

            // Filtre par classement (% peloton / quartiles)
            if (rankFilter) {
                const beforeRankFilter = filteredRaces.length;
                filteredRaces = filteredRaces.filter(race => {
                    const pct = getRaceRankPercent(race);
                    if (rankFilter === 'none') return pct === null;
                    if (pct === null) return false;

                    if (rankFilter === 'top10') return pct <= 10;
                    if (rankFilter === '0-25') return pct <= 25;
                    if (rankFilter === '25-50') return pct > 25 && pct <= 50;
                    if (rankFilter === 'top50') return pct <= 50;
                    if (rankFilter === '50-75') return pct > 50 && pct <= 75;
                    if (rankFilter === '75-100') return pct > 75 && pct <= 100;
                    return true;
                });
                console.log(`[advanced-filters] Filtre classement (${rankFilter}): ${beforeRankFilter} → ${filteredRaces.length} courses`);
            }

            // Filtre par commentaires
            if (commentsFilter) {
                const beforeCommentsFilter = filteredRaces.length;
                filteredRaces = filteredRaces.filter(race => {
                    const hasNotes = race.notes && typeof race.notes === 'string' && race.notes.trim() !== '';
                    if (commentsFilter === 'yes') return hasNotes;
                    if (commentsFilter === 'no') return !hasNotes;
                    return true;
                });
                console.log(`[advanced-filters] Filtre commentaires (${commentsFilter}): ${beforeCommentsFilter} → ${filteredRaces.length} courses`);
            }

            // Filtre par accompagnants
            if (companionsFilter) {
                const beforeCompanionsFilter = filteredRaces.length;
                filteredRaces = filteredRaces.filter(race => {
                    const hasCompanions = race.companions && (
                        (Array.isArray(race.companions) && race.companions.some(c => (typeof c === 'object' ? c.name : c)?.trim())) ||
                        (typeof race.companions === 'string' && race.companions.trim() !== '')
                    );
                    if (companionsFilter === 'yes') return hasCompanions;
                    if (companionsFilter === 'no') return !hasCompanions;
                    return true;
                });
                console.log(`[advanced-filters] Filtre accompagnants (${companionsFilter}): ${beforeCompanionsFilter} → ${filteredRaces.length} courses`);
            }

            // Appliquer le filtre d'année si nécessaire
            const activeYearFilter = window.currentYearFilter || (typeof currentYearFilter !== 'undefined' ? currentYearFilter : 'all');
            if (activeYearFilter && activeYearFilter !== 'all') {
                filteredRaces = filteredRaces.filter(race => {
                    if (!race || !race.date) return false;
                    const raceDate = new Date(race.date);
                    return raceDate.getFullYear().toString() === activeYearFilter.toString();
                });
            }

            // Appliquer le filtre de favoris si nécessaire
            const isFavFilterActive = !!(window.currentFavoritesFilter || (typeof currentFavoritesFilter !== 'undefined' && currentFavoritesFilter));
            if (isFavFilterActive) {
                filteredRaces = filteredRaces.filter(race => race.favorite === true || race.favorite === 'true');
            }

            console.log(`[advanced-filters] Total: ${window.races.length} → ${filteredRaces.length} courses`);

            // Mettre à jour les statistiques
            if (typeof window.updateStats === 'function') {
                window.updateStats(filteredRaces);
            }

            // Afficher les courses filtrées
            if (typeof window.displayRaces === 'function') {
                // SOLUTION DE CONTOURNEMENT: displayRaces utilise window.races
                // On le remplace temporairement
                const originalRaces = window.races;
                window.races = filteredRaces;
                window.displayRaces(filteredRaces);
                window.races = originalRaces;
            }
        }

        // Réinitialiser les filtres
        function resetAdvancedFilters() {
            console.log('[advanced-filters] Réinitialisation des filtres');

            document.getElementById('filterLocation').value = '';
            document.getElementById('filterPrice').value = '';
            document.getElementById('filterElevation').value = '';
            document.getElementById('filterDistance').value = '';
            document.getElementById('filterType').value = '';
            if (document.getElementById('filterRank')) document.getElementById('filterRank').value = '';
            document.getElementById('filterComments').value = '';
            document.getElementById('filterCompanions').value = '';

            // Réinitialiser aussi les variables actives
            activeTypeFilter = '';
            activeRankFilter = '';
            activeCommentsFilter = '';
            activeCompanionsFilter = '';

            if (searchInput) {
                searchInput.value = '';
            }

            // Réafficher toutes les courses
            if (typeof window.updateStats === 'function') {
                window.updateStats(window.races);
            }
            if (typeof window.displayRaces === 'function') {
                window.displayRaces(window.races);
            }
        }

        // Event listener pour le bouton "Rechercher"
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                console.log('[advanced-filters] Clic sur bouton Rechercher');

                // Mettre à jour les valeurs actives des filtres de la deuxième ligne
                activeTypeFilter = document.getElementById('filterType')?.value || '';
                activeRankFilter = document.getElementById('filterRank')?.value || '';
                activeCommentsFilter = document.getElementById('filterComments')?.value || '';
                activeCompanionsFilter = document.getElementById('filterCompanions')?.value || '';

                console.log('[advanced-filters] Valeurs stockées:', {
                    activeTypeFilter,
                    activeRankFilter,
                    activeCommentsFilter,
                    activeCompanionsFilter
                });

                applyAdvancedFilters();
            });
        }

        // Event listener pour le bouton "Réinitialiser"
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', resetAdvancedFilters);
        }

        // Initialiser
        populateLocationFilter();

        // Exposer la fonction pour l'utiliser ailleurs si besoin
        window.populateLocationFilter = populateLocationFilter;
        window.applyAdvancedFilters = applyAdvancedFilters;

        console.log('[advanced-filters] Filtres avancés initialisés avec succès');
    }

    // Démarrer l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdvancedFilters);
    } else {
        initAdvancedFilters();
    }
})();
