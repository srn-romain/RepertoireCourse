// ====================================================================
// GESTION DES FILTRES AVANCÉS
// ====================================================================

(function () {
    // Attendre que BackendAPI soit disponible
    function initAdvancedFilters() {
        if (typeof BackendAPI === 'undefined') {
            // BackendAPI n'est pas encore défini, réessayer dans 100ms
            setTimeout(initAdvancedFilters, 100);
            return;
        }

        const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
        const toggleFiltersIcon = document.getElementById('toggleFiltersIcon');
        const filtersContent = document.getElementById('filtersContent');
        const advancedFiltersPanel = document.getElementById('advancedFiltersPanel');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');

        // Vérifier que les éléments essentiels sont présents
        if (!toggleFiltersBtn || !filtersContent || !advancedFiltersPanel) {
            console.warn('⚠️ Filtres avancés: éléments DOM non trouvés, nouvelle tentative...');
            setTimeout(initAdvancedFilters, 100);
            return;
        }

        console.log('✅ Filtres avancés: initialisation réussie');

        // Afficher le panneau de filtres si l'utilisateur est connecté
        function updateFiltersVisibility() {
            if (BackendAPI.isAuthenticated() && advancedFiltersPanel) {
                advancedFiltersPanel.classList.remove('hidden');
                console.log('✅ Panneau de filtres affiché');
            }
        }

        // S'assurer que le contenu des filtres est caché au démarrage
        if (filtersContent) {
            filtersContent.style.display = 'none';
            console.log('🔒 Contenu des filtres initialement caché');
        }

        // Toggle le contenu des filtres (utilise uniquement display, pas la classe hidden)
        if (toggleFiltersBtn && filtersContent) {
            toggleFiltersBtn.addEventListener('click', () => {
                console.log('🔄 Toggle filtres cliqué');

                // Vérifier l'état actuel via le style display
                const currentDisplay = window.getComputedStyle(filtersContent).display;
                console.log('📊 Display actuel:', currentDisplay);

                if (currentDisplay === 'none') {
                    // Afficher le contenu
                    filtersContent.style.display = 'block';
                    filtersContent.classList.remove('hidden');
                    console.log('✅ Filtres OUVERTS');
                } else {
                    // Cacher le contenu
                    filtersContent.style.display = 'none';
                    filtersContent.classList.add('hidden');
                    console.log('❌ Filtres FERMÉS');
                }

                // Rotation de l'icône
                if (toggleFiltersIcon) {
                    toggleFiltersIcon.classList.toggle('rotate-180');
                }
            });
            console.log('✅ Event listener toggle ajouté');
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

            // Trier alphabétiquement
            const sortedLocations = Array.from(locations).sort();

            // Vider les options existantes (sauf la première)
            while (filterLocation.options.length > 1) {
                filterLocation.remove(1);
            }

            // Ajouter les nouvelles options
            sortedLocations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                filterLocation.appendChild(option);
            });
        }

        // Appliquer les filtres
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                const filterLocation = document.getElementById('filterLocation')?.value || '';
                const filterPrice = document.getElementById('filterPrice')?.value || '';
                const filterElevation = document.getElementById('filterElevation')?.value || '';
                const filterDistance = document.getElementById('filterDistance')?.value || '';

                // Filtrer les courses
                let filteredRaces = [...window.races];

                // Filtre par lieu
                if (filterLocation) {
                    filteredRaces = filteredRaces.filter(race =>
                        race.location && race.location.trim() === filterLocation
                    );
                }

                // Filtre par prix
                if (filterPrice) {
                    filteredRaces = filteredRaces.filter(race => {
                        const price = parseFloat(race.price);
                        if (isNaN(price)) return false;

                        if (filterPrice === '0-20') return price >= 0 && price <= 20;
                        if (filterPrice === '20-40') return price > 20 && price <= 40;
                        if (filterPrice === '40-60') return price > 40 && price <= 60;
                        if (filterPrice === '60-80') return price > 60 && price <= 80;
                        if (filterPrice === '80+') return price > 80;
                        return true;
                    });
                }

                // Filtre par dénivelé
                if (filterElevation) {
                    filteredRaces = filteredRaces.filter(race => {
                        const elevation = parseFloat(race.elevation);
                        if (isNaN(elevation)) return false;

                        if (filterElevation === '0-500') return elevation >= 0 && elevation <= 500;
                        if (filterElevation === '500-1000') return elevation > 500 && elevation <= 1000;
                        if (filterElevation === '1000-1500') return elevation > 1000 && elevation <= 1500;
                        if (filterElevation === '1500-2000') return elevation > 1500 && elevation <= 2000;
                        if (filterElevation === '2000+') return elevation > 2000;
                        return true;
                    });
                }

                // Filtre par distance
                if (filterDistance) {
                    filteredRaces = filteredRaces.filter(race => {
                        const distance = parseFloat(race.distance);
                        if (isNaN(distance)) return false;

                        if (filterDistance === '0-10') return distance >= 0 && distance <= 10;
                        if (filterDistance === '10-20') return distance > 10 && distance <= 20;
                        if (filterDistance === '20-30') return distance > 20 && distance <= 30;
                        if (filterDistance === '30-40') return distance > 30 && distance <= 40;
                        if (filterDistance === '40-50') return distance > 40 && distance <= 50;
                        if (filterDistance === '50+') return distance > 50;
                        return true;
                    });
                }

                // Afficher les courses filtrées
                if (typeof displayRaces === 'function') {
                    displayRaces(filteredRaces);
                }
            });
        }

        // Réinitialiser les filtres
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                // Réinitialiser tous les selects
                document.getElementById('filterLocation').value = '';
                document.getElementById('filterPrice').value = '';
                document.getElementById('filterElevation').value = '';
                document.getElementById('filterDistance').value = '';

                // Réafficher toutes les courses
                if (typeof displayRaces === 'function' && window.races) {
                    displayRaces(window.races);
                }
            });
        }

        // Initialiser les filtres au chargement
        updateFiltersVisibility();

        // Mettre à jour après l'authentification
        BackendAPI.onAuthStateChanged(() => {
            updateFiltersVisibility();
        });

        // Exposer la fonction pour l'utiliser ailleurs si besoin
        window.populateLocationFilter = populateLocationFilter;
    }

    // Démarrer l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdvancedFilters);
    } else {
        initAdvancedFilters();
    }
})();
