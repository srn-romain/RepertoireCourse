
// Logic to load and display public races on the landing page
let isLoadingPublicRaces = false;

// Filtres pour les courses publiques
const publicRaceFilters = {
    limit: 15,
    status: 'all', // 'all', 'upcoming', 'past'
    sort: 'desc' // 'desc' (plus récentes), 'asc' (plus anciennes)
};

const PUBLIC_FILTER_BUTTON_IDS = [
    'filterLimit15', 'filterLimit30', 'filterLimit60',
    'filterStatusAll', 'filterStatusUpcoming', 'filterStatusPast',
    // Sort buttons if present in DOM
    'filterSortDesc', 'filterSortAsc'
];

function setPublicFiltersLoading(isLoading) {
    PUBLIC_FILTER_BUTTON_IDS.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = isLoading;
            if (isLoading) {
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    });
}

// Fonction pour mettre à jour les filtres
window.updatePublicRaceFilter = function (type, value) {
    // Vérifier si l'utilisateur est connecté
    if (typeof auth === 'undefined' || !auth.currentUser) {
        // Afficher la modale de permission refusée
        const modal = document.getElementById('permissionDeniedModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        return; // Ne pas appliquer le filtre
    }

    publicRaceFilters[type] = value;

    // Update UI buttons styling immediately
    if (type === 'limit') {
        ['15', '30', '60'].forEach(val => {
            const btn = document.getElementById(`filterLimit${val}`);
            if (btn) {
                if (parseInt(val) === value) {
                    btn.className = 'px-3 py-1.5 text-sm rounded-full bg-green-600 text-white border border-green-600';
                } else {
                    btn.className = 'px-3 py-1.5 text-sm rounded-full border border-green-200 hover:bg-green-50 transition';
                }
            }
        });
    } else if (type === 'status') {
        ['all', 'upcoming', 'past'].forEach(val => {
            const btn = document.getElementById(`filterStatus${val.charAt(0).toUpperCase() + val.slice(1)}`);
            if (btn) {
                if (val === value) {
                    btn.className = 'px-3 py-1.5 text-sm rounded-full bg-green-600 text-white border border-green-600';
                } else {
                    btn.className = 'px-3 py-1.5 text-sm rounded-full border border-green-200 hover:bg-green-50 transition';
                }
            }
        });
    } else if (type === 'sort') {
        ['desc', 'asc'].forEach(val => {
            const btn = document.getElementById(`filterSort${val.charAt(0).toUpperCase() + val.slice(1)}`);
            if (btn) {
                if (val === value) {
                    btn.className = 'px-3 py-1.5 text-sm rounded-full bg-green-600 text-white border border-green-600';
                } else {
                    btn.className = 'px-3 py-1.5 text-sm rounded-full border border-green-200 hover:bg-green-50 transition';
                }
            }
        });
    }

    // Freeze buttons immediately for feedback
    setPublicFiltersLoading(true);

    // Reload races
    loadPublicRaces();
};

document.addEventListener('DOMContentLoaded', () => {
    loadPublicRaces();
    fetchGlobalCommunityStats();
});

async function loadPublicRaces() {
    // Prevent concurrent executions
    if (isLoadingPublicRaces) return;
    isLoadingPublicRaces = true;

    const grid = document.getElementById('publicRacesGrid');
    if (!grid) {
        isLoadingPublicRaces = false;
        return;
    }

    // Show loading spinner
    setPublicFiltersLoading(true); // Ensure frozen
    grid.innerHTML = '<div class="col-span-full flex justify-center items-center py-12"><i class="fas fa-circle-notch fa-spin text-green-500 text-4xl"></i></div>';

    try {
        const snapshot = await db.collectionGroup('races')
            .where('public', '==', true) // SÉCURITÉ : Ne demande QUE les courses publiques
            .orderBy('date', publicRaceFilters.sort) // Tri dynamique
            .limit(publicRaceFilters.limit) // Limite dynamique
            .get();

        if (snapshot.empty) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Aucune course trouvée.</div>';
            return;
        }

        // Prepare a fragment to batch updates (prevents visual duplicates during render)
        const fragment = document.createDocumentFragment();

        // Cache object
        const userCache = {};

        // Stats Counters
        const statsCount = { count: 0, upcoming: 0, km: 0 };

        for (const doc of snapshot.docs) {
            const race = { id: doc.id, ...doc.data() };

            const uid = doc.ref.parent.parent ? doc.ref.parent.parent.id : null;
            let userData = { pseudo: "Coureur mystère", privacy: {} };

            if (uid) {
                if (userCache[uid]) {
                    userData = userCache[uid];
                } else {
                    try {
                        const userDoc = await db.collection('users').doc(uid).get();
                        if (userDoc.exists) {
                            const data = userDoc.data();

                            // Pseudo Logic
                            let p = "Pseudo non disponible";
                            if (data && data.pseudo) p = data.pseudo;
                            else if (data && data.email) p = data.email.split('@')[0];

                            // Privacy Logic
                            let priv = data.privacy || {};

                            // Store in cache
                            userData = { pseudo: p, privacy: priv };
                            userCache[uid] = userData;
                        }
                    } catch (e) {
                        console.error("Error fetching user", uid, e);
                    }
                }
            }

            // === FILTER: Hide Invalid Users ===
            if (userData.pseudo === "Coureur mystère" || userData.pseudo === "Pseudo non disponible") {
                continue;
            }

            // === PRIVACY LOGIC ===
            const privacy = userData.privacy || {};

            // 1. Pseudo
            let ownerPseudoDisplay = userData.pseudo;
            if (privacy.showPseudo === false) {
                ownerPseudoDisplay = "Utilisateur Anonyme";
            }

            // 2. City
            const showCity = privacy.showCity === true;

            // 3. Favorite
            const showFavorite = privacy.showFavorite === true;

            // 4. Date (Day)
            const showDay = privacy.showDay === true;

            // === FILTER: Public Race ===
            if (race.public === false) continue;

            // === DISPLAY LOGIC ===
            const raceDate = new Date(race.date);

            // Date Format
            const dateOptions = showDay
                ? { day: 'numeric', month: 'long', year: 'numeric' }
                : { month: 'long', year: 'numeric' };
            const dateStr = raceDate.toLocaleDateString('fr-FR', dateOptions);

            let locationDisplay = race.location || '';
            const maxLength = race.photo ? 15 : 20;
            if (locationDisplay && locationDisplay.length > maxLength) {
                locationDisplay = locationDisplay.substring(0, maxLength - 3) + '...';
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const raceDateOnly = new Date(raceDate);
            raceDateOnly.setHours(0, 0, 0, 0);
            const isToday = raceDateOnly.getTime() === today.getTime();
            const isUpcoming = raceDate >= today;

            // === FILTER: Status (À venir / Passées) ===
            if (publicRaceFilters.status === 'upcoming' && !isUpcoming) continue;
            if (publicRaceFilters.status === 'past' && isUpcoming) continue;

            const daysSinceRace = Math.floor((today.getTime() - raceDateOnly.getTime()) / (1000 * 60 * 60 * 24));
            const isWithin10Days = daysSinceRace >= 0 && daysSinceRace <= 10;
            const hasCompletedTime = race.time && race.time !== '00:00:00' && race.time.trim() !== '';

            let badgeAvenir = '';
            if (isToday) {
                if (hasCompletedTime) badgeAvenir = `<span class="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full animate-pulse">New !</span>`;
                else badgeAvenir = `<span class="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full animate-pulse">En cours</span>`;
            } else if (isUpcoming) {
                badgeAvenir = `<span class="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full animate-pulse">À venir</span>`;
            } else if (!isUpcoming && hasCompletedTime && isWithin10Days) {
                badgeAvenir = `<span class="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full animate-pulse">New !</span>`;
            }

            const raceCard = document.createElement('div');
            raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md card-hover relative group';

            // Favorite Icon conditional
            const favIcon = (showFavorite && race.favorite)
                ? `<i class="fas fa-star text-yellow-400 mr-2" title="Favori"></i>`
                : '';

            // City conditional
            const cityHtml = (showCity && locationDisplay)
                ? `<span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full" title="${race.location}">
                     <i class="fas fa-map-marker-alt text-green-500"></i> ${locationDisplay}
                   </span>`
                : '';

            raceCard.innerHTML = `
                <div class="p-6 relative">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold text-green-800 mb-1 flex items-center gap-1">
                                ${favIcon}
                                ${race.name || 'Course'} ${badgeAvenir}
                            </h3>
                            <p class="text-green-600 capitalize">
                                ${dateStr}
                            </p>
                        </div>
                    </div>

                    <div class="mt-4 flex flex-col gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full">
                                <i class="fas fa-ruler-horizontal text-green-500"></i>
                                ${race.distance || '0'} km
                            </span>
                            <span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full">
                                <i class="fas fa-mountain text-green-500"></i>
                                +${race.elevation || '0'} m
                            </span>
                            ${cityHtml}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-4 pt-3 flex items-center justify-between border-t border-green-50">
                        <span class="text-xs text-gray-500 flex items-center gap-2" title="${ownerPseudoDisplay}">
                            <i class="fas fa-user-circle text-green-600 text-lg"></i>
                            <span class="truncate max-w-[150px] font-semibold">${ownerPseudoDisplay}</span>
                        </span>
                        ${race.time ? `<span class="text-sm font-bold text-green-700 font-mono">${race.time}</span>` : ''}
                    </div>

                    <!-- Image -->
                    <div class="absolute bottom-3 right-3 h-28 w-28 group-hover:scale-105 transition-transform duration-300">
                        ${race.photo ?
                    `<img src="${race.photo}" alt="Photo course" class="h-full w-full object-cover rounded-lg shadow-md border border-green-200" />`
                    :
                    `<div class="h-full w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                                <i class="fas fa-running text-gray-300 text-3xl"></i>
                            </div>`
                }
                    </div>
                </div>
            `;

            fragment.appendChild(raceCard);
        }

        // ATOMIC UPDATE: Clear and Append
        grid.innerHTML = '';
        grid.appendChild(fragment);

    } catch (error) {
        console.error("Error loading public races:", error);
        grid.innerHTML = `
            <div class="col-span-full text-center text-red-500 py-8">
                <p>Impossible de charger les courses.</p>
                <p class="text-xs mt-2">${error.message}</p>
            </div>
        `;
    } finally {
        setPublicFiltersLoading(false);
        isLoadingPublicRaces = false;
    }
}

// Nouvelle fonction pour calculer les stats sur TOUTE la base de données
async function fetchGlobalCommunityStats() {
    const totalKmElement = document.getElementById('totalCommunityKm');
    if (!totalKmElement) return;

    try {
        let snapshot;
        let isPartial = false;

        try {
            // TENTATIVE 1 : Récupérer TOUTES les courses (Publiques + Privées)
            snapshot = await db.collectionGroup('races').get();
        } catch (e) {
            console.warn("Accès global refusé, repli sur les courses publiques uniquement.");
            // TENTATIVE 2 : Repli sur les courses publiques uniquement
            snapshot = await db.collectionGroup('races')
                .where('public', '==', true)
                .orderBy('date', 'desc')
                .get();
            isPartial = true;
        }

        let totalKm = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.distance) {
                const dist = parseFloat(data.distance.toString().replace(',', '.'));
                if (!isNaN(dist)) {
                    totalKm += dist;
                }
            }
        });

        // Mise à jour du texte
        totalKmElement.innerHTML = `La communauté a pour le moment parcouru <strong>${Math.round(totalKm).toLocaleString('fr-FR')} km</strong> ${isPartial ? '(courses publiques)' : '(total global)'}.`;

    } catch (error) {
        console.warn("Erreur calcul stats globales:", error);
    }
}
