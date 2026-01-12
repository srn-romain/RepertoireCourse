
// Logic to load and display public races on the landing page
let isLoadingPublicRaces = false;

document.addEventListener('DOMContentLoaded', () => {
    loadPublicRaces();
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

    try {
        // We do NOT clear grid here instantly to keep spinner visible if present
        // Or if we want to show spinner explicitly if it's missing:
        // if (grid.children.length === 0) grid.innerHTML = '<...spinner...>';

        const snapshot = await db.collectionGroup('races')
            .where('public', '==', true) // SÉCURITÉ : Ne demande QUE les courses publiques
            .orderBy('date', 'desc')
            .limit(50)
            .get();

        if (snapshot.empty) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Aucune course trouvée.</div>';
            isLoadingPublicRaces = false;
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

            // Get User Email
            // Get User Pseudo
            // Get User Data & Privacy
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
            // Si l'utilisateur n'existe pas vraiment (erreur technique ou suppression)
            // On le saute. MAIS on ne saute PAS ceux qui ont juste choisi de masquer leur pseudo via 'privacy'.
            // "Coureur mystère" est la valeur par défaut locale si doc non trouvé.
            if (userData.pseudo === "Coureur mystère" || userData.pseudo === "Pseudo non disponible") {
                continue;
            }

            // === PRIVACY LOGIC ===
            const privacy = userData.privacy || {};

            // DEBUG
            //console.log(`Course ${race.name} (User ${uid}) - Privacy:`, privacy);

            // 1. Pseudo
            let ownerPseudoDisplay = userData.pseudo;
            // Si la préférence est EXPLICITEMENT false (par défaut undefined = true/visible)
            if (privacy.showPseudo === false) {
                ownerPseudoDisplay = "Utilisateur Anonyme";
            }

            // 2. City
            const showCity = privacy.showCity === true;

            // 3. Favorite
            const showFavorite = privacy.showFavorite === true; // Default false/hidden

            // 4. Date (Day)
            const showDay = privacy.showDay === true; // Default false/hidden

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

            // STATS CALCULATION
            statsCount.count++;
            if (isUpcoming) statsCount.upcoming++;
            if (race.distance) {
                // Gestion basique des formats style "10,5" ou "10.5"
                const dist = parseFloat(race.distance.toString().replace(',', '.'));
                if (!isNaN(dist)) statsCount.km += dist;
            }

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

        // UPDATE STATS UI
        const statsContainer = document.getElementById('communityStatsContainer');

        if (statsContainer) {
            const elTotal = document.getElementById('statTotalRaces');
            const elUpcoming = document.getElementById('statUpcomingRaces');
            const elKm = document.getElementById('statTotalKm');

            // Animation function (Fondu Vertical Style)
            function animateCounter(element, targetUserValue) {
                const duration = 2500;
                const target = parseInt(targetUserValue);
                if (isNaN(target)) {
                    element.textContent = targetUserValue;
                    return;
                }

                // Logique demandée par l'user (increment par intervalle 50ms)
                const incrementTime = 30;
                const steps = duration / incrementTime;
                const incrementValue = target / steps;

                let current = 0;
                const timer = setInterval(() => {
                    current += incrementValue;
                    if (current >= target) {
                        element.textContent = target.toLocaleString('fr-FR');
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.round(current).toLocaleString('fr-FR');
                    }
                }, incrementTime);
            }

            if (elTotal) animateCounter(elTotal, statsCount.count);
            if (elUpcoming) animateCounter(elUpcoming, statsCount.upcoming);
            if (elKm) animateCounter(elKm, Math.round(statsCount.km));

            statsContainer.classList.remove('hidden');
        }

    } catch (error) {
        console.error("Error loading public races:", error);
        grid.innerHTML = `
            <div class="col-span-full text-center text-red-500 py-8">
                <p>Impossible de charger les courses.</p>
                <p class="text-xs mt-2">${error.message}</p>
            </div>
        `;
    } finally {
        isLoadingPublicRaces = false;
    }
}
