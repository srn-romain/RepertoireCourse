/**
 * js/city-autocomplete.js
 * Autocomplétion dynamique des communes et départements français via l'API Découpage Administratif (Geo Gouv)
 * URL API : https://geo.api.gouv.fr/communes?nom={QUERY}&fields=nom,codeDepartement,departement,region&boost=population&limit=5
 */

(function () {
    'use strict';

    /**
     * Initialise l'autocomplétion sur un champ de saisie de ville / lieu
     * @param {HTMLInputElement|string} inputOrId - Élément input ou ID
     * @param {Object} [options={}] - Options de configuration
     */
    function initCityAutocomplete(inputOrId, options = {}) {
        const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
        if (!input || input._cityAutocompleteInitialized) return;
        input._cityAutocompleteInitialized = true;

        const deptInput = options.deptInputId ? document.getElementById(options.deptInputId) : (options.deptInput || document.getElementById('raceDepartment'));
        const regionInput = options.regionInputId ? document.getElementById(options.regionInputId) : (options.regionInput || document.getElementById('raceRegion'));
        const onSelectCallback = options.onSelect || null;

        // S'assurer que le conteneur parent est en position relative
        const parent = input.parentElement;
        if (parent && !parent.classList.contains('relative') && getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }

        // Création du menu déroulant de suggestions
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown absolute left-0 right-0 top-full mt-1 bg-white border border-green-200 rounded-xl shadow-2xl overflow-hidden z-[9999] hidden max-h-64 overflow-y-auto text-left divide-y divide-gray-100';
        dropdown.setAttribute('role', 'listbox');
        parent.appendChild(dropdown);

        let debounceTimer = null;
        let currentResults = [];
        let selectedIndex = -1;
        let isSelecting = false;
        let lastSelectedValue = '';

        function closeDropdown() {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
                debounceTimer = null;
            }
            dropdown.classList.add('hidden');
            dropdown.innerHTML = '';
            currentResults = [];
            selectedIndex = -1;
        }

        function renderResults(results) {
            dropdown.innerHTML = '';
            currentResults = results || [];
            selectedIndex = -1;

            if (!currentResults || currentResults.length === 0 || isSelecting) {
                dropdown.classList.add('hidden');
                return;
            }

            currentResults.forEach((city, index) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item px-3.5 py-2.5 hover:bg-green-50/90 cursor-pointer transition flex items-center justify-between gap-3 text-xs sm:text-sm select-none';
                item.setAttribute('role', 'option');
                item.setAttribute('data-index', index);

                const deptName = (city.departement && city.departement.nom) ? city.departement.nom : (city.codeDepartement || '');
                const deptCode = city.codeDepartement || '';
                const regionName = (city.region && city.region.nom) ? city.region.nom : '';

                item.innerHTML = `
                    <div class="flex items-center gap-2.5 min-w-0 flex-grow">
                        <div class="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 text-xs">
                            <i class="fas fa-map-pin"></i>
                        </div>
                        <div class="min-w-0 leading-tight">
                            <div class="font-bold text-gray-900 truncate">${city.nom}</div>
                            <div class="text-[11px] text-gray-500 truncate mt-0.5">${deptName} (${deptCode}) ${regionName ? '— ' + regionName : ''}</div>
                        </div>
                    </div>
                    <div class="shrink-0">
                        <span class="px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-extrabold text-[11px] border border-green-200">
                            ${deptCode}
                        </span>
                    </div>
                `;

                // Gestion de la sélection par mousedown
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectCity(city);
                });

                dropdown.appendChild(item);
            });

            dropdown.classList.remove('hidden');
        }

        function selectCity(city) {
            if (!city) return;

            isSelecting = true;
            lastSelectedValue = city.nom;

            // Annuler tout timer en cours et fermer immédiatement
            closeDropdown();

            // Renseigner le champ de la ville
            input.value = city.nom;

            // Renseigner le département associé
            if (deptInput) {
                deptInput.value = city.codeDepartement || '';
            }

            // Renseigner la région associée si présente
            if (regionInput) {
                regionInput.value = (city.region && city.region.nom) ? city.region.nom : '';
            }

            // Déclencher les événements change sans relancer la recherche
            input.dispatchEvent(new Event('change', { bubbles: true }));

            if (typeof onSelectCallback === 'function') {
                onSelectCallback(city);
            }

            setTimeout(() => {
                isSelecting = false;
                closeDropdown();
            }, 100);
        }

        async function fetchCities(query) {
            if (isSelecting) return;
            const cleanQuery = query.trim();
            if (cleanQuery.length < 3 || cleanQuery === lastSelectedValue) {
                closeDropdown();
                return;
            }

            try {
                const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cleanQuery)}&fields=nom,codeDepartement,departement,region&boost=population&limit=5`;
                const response = await fetch(url);
                if (!response.ok) {
                    closeDropdown();
                    return;
                }
                const data = await response.json();
                if (!isSelecting) {
                    renderResults(data);
                }
            } catch (err) {
                console.warn('[CityAutocomplete] Error fetching Geo Gouv API:', err);
                closeDropdown();
            }
        }

        // Événement input avec debounce (300ms) déclenché uniquement par la saisie utilisateur réelle
        input.addEventListener('input', (e) => {
            if (isSelecting) return;
            if (debounceTimer) clearTimeout(debounceTimer);

            const val = input.value || '';
            // Si la valeur est identique à la dernière sélection, ne pas rouvrir
            if (val.trim() === lastSelectedValue) {
                closeDropdown();
                return;
            }

            // Si l'utilisateur a modifié le texte, réinitialiser la dernière valeur sélectionnée
            lastSelectedValue = '';

            if (val.trim().length < 3) {
                closeDropdown();
                return;
            }

            debounceTimer = setTimeout(() => {
                fetchCities(val);
            }, 300);
        });

        // Navigation au clavier
        input.addEventListener('keydown', (e) => {
            if (dropdown.classList.contains('hidden') || currentResults.length === 0) return;

            const items = dropdown.querySelectorAll('.autocomplete-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateKeyboardHighlight(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateKeyboardHighlight(items);
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
                    e.preventDefault();
                    selectCity(currentResults[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        function updateKeyboardHighlight(items) {
            items.forEach((item, idx) => {
                if (idx === selectedIndex) {
                    item.classList.add('bg-green-100/90');
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.classList.remove('bg-green-100/90');
                }
            });
        }

        // Fermeture propre au blur
        input.addEventListener('blur', () => {
            setTimeout(() => {
                closeDropdown();
            }, 150);
        });

        // Fermeture globale au clic à l'extérieur
        document.addEventListener('click', (e) => {
            if (!parent.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    // Auto-initialisation sur les champs du DOM
    function autoInit() {
        // Champ course principal
        const raceLocationInput = document.getElementById('raceLocation');
        if (raceLocationInput) {
            initCityAutocomplete(raceLocationInput, {
                deptInputId: 'raceDepartment',
                regionInputId: 'raceRegion'
            });
        }

        // Tous les inputs marqués avec [data-city-autocomplete]
        document.querySelectorAll('[data-city-autocomplete]').forEach(input => {
            initCityAutocomplete(input);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // Export global
    window.initCityAutocomplete = initCityAutocomplete;

})();
