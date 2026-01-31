
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

        // Check Admin Status centrally to avoid N reads
        let isAdmin = false;
        if (typeof window.isAdminUser === 'function') {
            isAdmin = await window.isAdminUser();
        }

        if (snapshot.empty) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Aucune course trouvée.</div>';
            return;
        }

        // Prepare a fragment to batch updates (prevents visual duplicates during render)
        const fragment = document.createDocumentFragment();

        // Cache object
        const userCache = {};

        // Helper function to format numbers (distance, elevation)
        const formatNumber = (val) => {
            if (!val && val !== 0) return '0';
            const num = parseFloat(String(val).replace(',', '.'));
            if (isNaN(num)) return val;
            return num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        };

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
            const currentUser = firebase.auth().currentUser; // Get sync
            const isOwner = currentUser && (uid === currentUser.uid);
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

            // 5. Hide Like Count
            const hideLikeCount = privacy.hideLikeCount === true;
            const shouldShowCount = !hideLikeCount || isOwner || isAdmin;

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

            // === LIKE LOGIC ===
            const likedBy = race.likedBy || [];
            const likeCount = likedBy.length;
            const isLiked = currentUser && likedBy.includes(currentUser.uid);
            // isOwner moved up
            const showLikers = isOwner || isAdmin;
            const racePath = doc.ref.path;

            const heartClass = isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
            const likeAnimation = isLiked ? 'pulse-once' : '';

            // Interaction
            const likeAction = `event.stopPropagation(); toggleRaceLike('${racePath}', this)`;
            raceCard.setAttribute('ondblclick', `toggleRaceLike('${racePath}', this.querySelector('.like-btn-wrapper'))`);

            // Likers Button (Eye)
            const likersBtn = (showLikers && likeCount > 0)
                ? `<button onclick="event.stopPropagation(); openLikersModal('${racePath}')" class="ml-2 text-xs text-green-600 hover:text-green-800 underline" title="Voir qui a aimé">Voir</button>`
                : '';

            // Like Button HTML
            // Button is ALWAYS visible (so visitors can like even if count is hidden).
            // Count text is hidden if shouldShowCount is false.
            const likeButtonHtml = `
                <div class="flex flex-col items-end z-10 like-btn-wrapper relative group/likes">
                    <div class="flex items-center gap-1">
                        <button onclick="${likeAction}" 
                            class="transition flex items-center gap-1 focus:outline-none group/btn pt-1 pr-1"
                            title="${isLiked ? 'Je n\'aime plus' : 'J\'aime'}">
                            <i class="${heartClass} text-xl transition-all duration-300 ${likeAnimation} transform group-active/btn:scale-90 group-hover/btn:scale-110"></i>
                            <span class="text-xs font-bold text-gray-600 like-count-display ml-0.5" data-hidden="${!shouldShowCount}">${shouldShowCount && likeCount > 0 ? likeCount : ''}</span>
                        </button>
                        ${likersBtn}
                    </div>
                </div>`;

            // === CARD CONTENT ===
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
                         <!-- LIKE BUTTON (Top Right) -->
                        ${likeButtonHtml}
                    </div>

                    <div class="mt-4 flex flex-col gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full">
                                <i class="fas fa-ruler-horizontal text-green-500"></i>
                                ${formatNumber(race.distance)} km
                            </span>
                             <span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full">
                                <i class="fas fa-mountain text-green-500"></i>
                                +${formatNumber(race.elevation)} m
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
// === LIKE SYSTEM HANDLERS ===
window.toggleRaceLike = async function (racePath, btn) {
    // 1. Check Auth
    const user = firebase.auth().currentUser;
    if (!user) {
        const modal = document.getElementById('permissionDeniedModal');
        if (modal) {
            const msg = document.getElementById('permissionDeniedMessage');
            if (msg) msg.textContent = "Vous devez être connecté pour aimer une course.";
            modal.classList.remove('hidden');
        }
        return;
    }

    // Identify UI elements
    let btnElement = btn;
    if (btn.classList.contains('like-btn-wrapper')) {
        btnElement = btn.querySelector('button');
    }
    const icon = btnElement.querySelector('i');
    const countSpan = btnElement.querySelector('.like-count-display');

    if (!icon) return;

    // 2. Toggle UI (Optimistic)
    const wasLiked = icon.classList.contains('fas');
    const uid = user.uid;

    if (wasLiked) {
        icon.classList.remove('fas', 'text-red-500');
        icon.classList.add('far', 'text-gray-400');
        if (countSpan && countSpan.dataset.hidden !== 'true') {
            let c = parseInt(countSpan.innerText) || 0;
            c = Math.max(0, c - 1);
            countSpan.innerText = c > 0 ? c : '';
        }
    } else {
        icon.classList.remove('far', 'text-gray-400');
        icon.classList.add('fas', 'text-red-500');
        icon.classList.add('scale-125');
        setTimeout(() => icon.classList.remove('scale-125'), 200);
        if (countSpan && countSpan.dataset.hidden !== 'true') {
            let c = parseInt(countSpan.innerText) || 0;
            countSpan.innerText = c + 1;
        }
    }

    // 3. Update DB
    try {
        const raceRef = db.doc(racePath);
        if (wasLiked) {
            await raceRef.update({
                likedBy: firebase.firestore.FieldValue.arrayRemove(uid)
            });
        } else {
            await raceRef.update({
                likedBy: firebase.firestore.FieldValue.arrayUnion(uid)
            });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        // Revert UI on error
        if (wasLiked) {
            icon.classList.add('fas', 'text-red-500');
            icon.classList.remove('far', 'text-gray-400');
            if (countSpan) countSpan.innerText = (parseInt(countSpan.innerText) || 0) + 1;
        } else {
            icon.classList.add('far', 'text-gray-400');
            icon.classList.remove('fas', 'text-red-500');
            if (countSpan && countSpan.dataset.hidden !== 'true') {
                let c = (parseInt(countSpan.innerText) || 0) - 1;
                countSpan.innerText = c > 0 ? c : '';
            }
        }
        alert("Erreur : Impossible de liker. Vérifiez que vous êtes bien connecté. Si le problème persiste, il s'agit probablement d'une restriction des droits d'accès (règles de sécurité Firestore).");
    }
};

// Open Likers Modal
window.openLikersModal = async function (racePath) {
    const modal = document.getElementById('likersModal');
    const content = document.getElementById('likersContent');
    if (!modal || !content) return;

    // Show Modal with Loader
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="flex justify-center py-4"><i class="fas fa-circle-notch fa-spin text-green-500 text-2xl"></i></div>';

    try {
        const raceDoc = await db.doc(racePath).get();
        if (!raceDoc.exists) {
            content.innerHTML = '<p class="text-center text-red-500">Course introuvable.</p>';
            return;
        }

        const likedBy = raceDoc.data().likedBy || [];
        if (likedBy.length === 0) {
            content.innerHTML = '<p class="text-center text-gray-500 italic">Personne n\'a encore aimé cette course.</p>';
            return;
        }

        // Fetch Names
        const names = [];
        await Promise.all(likedBy.map(async (uid) => {
            try {
                const uDoc = await db.collection('users').doc(uid).get();
                if (uDoc.exists) {
                    const d = uDoc.data();
                    const p = d.pseudo || d.email.split('@')[0];
                    names.push(p);
                } else {
                    names.push("Utilisateur inconnu");
                }
            } catch (e) { names.push("Erreur chargement"); }
        }));

        if (names.length > 0) {
            content.innerHTML = `<ul class="space-y-2">
                ${names.map(n => `
                    <li class="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-800">
                        <i class="fas fa-user-circle text-xl"></i>
                        <span class="font-medium truncate">${n}</span>
                    </li>
                `).join('')}
            </ul>`;
        } else {
            content.innerHTML = '<p class="text-center text-gray-500">Liste vide.</p>';
        }

    } catch (error) {
        console.error("Error loading likers modal:", error);
        content.innerHTML = '<p class="text-center text-red-500">Erreur lors du chargement de la liste.</p>';
    }
};

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
