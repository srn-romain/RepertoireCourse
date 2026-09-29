
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

// Helper pour nettoyer les noms de course des termes génériques pour la comparaison de similarité
function getMeaningfulWishlistName(name) {
    if (!name) return "";
    const genericTerms = ["marathon", "relai", "relais", "course", "trail", "run", "triathlon", "semi", "10km", "5km"];
    const words = String(name).toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
        .split(/\s+/);

    return words.filter(word => {
        return word.length > 2 && !genericTerms.includes(word);
    }).join(' ').trim();
}

// Fonction pour vérifier les similarités avec les éléments existants de la wishlist
function findSimilarWishlistItems(itemName, itemsList) {
    const similarItems = [];
    const mNew = getMeaningfulWishlistName(itemName);
    if (!mNew || mNew.length < 3) return similarItems;

    (itemsList || []).forEach(item => {
        const mExisting = getMeaningfulWishlistName(item.name);
        if (!mExisting || mExisting.length < 3) return;

        // 1. Correspondance exacte du sens
        if (mNew === mExisting) {
            similarItems.push(item);
            return;
        }

        // 2. 4 caractères consécutifs ou plus en commun sur les parties significatives
        let foundMatch = false;
        for (let i = 0; i <= mNew.length - 4 && !foundMatch; i++) {
            const fourChars = mNew.substring(i, i + 4);
            if (mExisting.includes(fourChars)) {
                let maxMatch = fourChars;
                for (let j = i + 4; j <= mNew.length; j++) {
                    const longerSubstring = mNew.substring(i, j);
                    if (mExisting.includes(longerSubstring)) {
                        maxMatch = longerSubstring;
                    } else {
                        break;
                    }
                }
                if (maxMatch.length >= 4 && !similarItems.find(s => s.name === item.name)) {
                    similarItems.push(item);
                    foundMatch = true;
                }
            }
        }
    });
    return similarItems;
}

// Helper pour déterminer si une course est déjà dans la wishlist (correspondance exacte ou sens complet identique)
function checkIsRaceInWishlist(raceName, itemsList) {
    if (!raceName || !itemsList || itemsList.length === 0) return false;
    const cleanName = String(raceName).trim().toLowerCase();
    
    // 1. Correspondance exacte insensible à la casse
    const exact = itemsList.some(item => (item.name || '').trim().toLowerCase() === cleanName);
    if (exact) return true;
    
    // 2. Correspondance exacte sur le sens complet (ex: "Marathon de Paris" vs "Paris Marathon")
    const mNew = getMeaningfulWishlistName(raceName);
    if (mNew && mNew.length >= 3) {
        return itemsList.some(item => {
            const mExisting = getMeaningfulWishlistName(item.name);
            return mExisting && mExisting === mNew;
        });
    }

    return false;
}

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

    // Show loading runner animation
    setPublicFiltersLoading(true); // Ensure frozen
    grid.innerHTML = typeof getRunnerLoaderHTML === 'function' ? getRunnerLoaderHTML(3) : '<div class="col-span-full flex justify-center items-center py-12"><i class="fas fa-circle-notch fa-spin text-green-500 text-4xl"></i></div>';

    try {
        const fetchLimit = Math.max(publicRaceFilters.limit * 3, 50);
        const snapshot = await db.collectionGroup('races')
            .orderBy('date', publicRaceFilters.sort) // Tri dynamique
            .limit(fetchLimit)
            .get();

        // Check Admin Status centrally to avoid N reads
        let isAdmin = false;
        if (typeof window.isAdminUser === 'function') {
            isAdmin = await window.isAdminUser();
        }

        // Check Invite Status
        let isInvite = false;
        if (typeof window.isInviteUser === 'function') {
            isInvite = await window.isInviteUser();
        }

        const currentUser = firebase.auth().currentUser;

        // Fetch connected user's wishlist for duplicate / similarity checking
        let userWishlist = [];
        if (currentUser && !isInvite) {
            try {
                const wishSnap = await db.collection('users').doc(currentUser.uid).collection('wishlist').get();
                wishSnap.forEach(d => {
                    userWishlist.push({ id: d.id, ...d.data() });
                });
                window.currentUserWishlist = userWishlist;
            } catch (e) {
                console.warn("Could not load user wishlist for public races:", e);
                window.currentUserWishlist = window.currentUserWishlist || [];
                userWishlist = window.currentUserWishlist;
            }
        } else {
            window.currentUserWishlist = [];
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
            if (!val && val !== 0) return '?';
            const num = parseFloat(String(val).replace(',', '.'));
            if (isNaN(num)) return '?';
            return num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        };

        let displayedCount = 0;
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

                            // Photo URL Logic
                            let pic = data.photoURL || null;

                            // Privacy Logic
                            let priv = data.privacy || {};

                            // Store in cache
                            userData = { pseudo: p, privacy: priv, photoURL: pic };
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

            // 1. Pseudo & Photo
            const isPseudoHidden = (privacy.hidePseudo === true) || (privacy.showPseudo === false);
            let ownerPseudoDisplay = userData.pseudo;
            if (isPseudoHidden) {
                ownerPseudoDisplay = "Utilisateur Anonyme";
                userData.photoURL = null;
            }

            // 2. City
            const isCityHidden = (privacy.hideCity === true) || (privacy.showCity === false);
            const showCity = !isCityHidden;

            // 3. Favorite
            const isFavoriteHidden = (privacy.hideFavorite === true);
            const showFavorite = !isFavoriteHidden;

            // 4. Hide Like Count
            const hideLikeCount = privacy.hideLikeCount === true;
            const shouldShowCount = !hideLikeCount;

            // === FILTER: Account Privacy Level (0 = 100% Privé, 1 = Aperçu simple, 2 = Fiche complète) ===
            let privacyLevel = 2; // default
            if (privacy.level !== undefined) {
                privacyLevel = parseInt(privacy.level);
            } else if (privacy.isPublic !== undefined) {
                privacyLevel = privacy.isPublic === true ? 2 : 0;
            } else if (userData.isPublic !== undefined) {
                privacyLevel = userData.isPublic === true ? 2 : 0;
            }

            if (privacyLevel === 0) continue;

            // === DISPLAY LOGIC ===
            const raceDate = new Date(race.date);

            // Date Format : Le jour précis est toujours divulgué pour une course publique
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const dateStr = raceDate.toLocaleDateString('fr-FR', dateOptions);

            let locationDisplay = race.location || '';
            const maxLength = (race.photo || race.parcours) ? 15 : 20;
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
                if (hasCompletedTime) badgeAvenir = `<span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full animate-pulse">New !</span>`;
                else badgeAvenir = `<span class="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full animate-pulse">En cours</span>`;
            } else if (isUpcoming) {
                badgeAvenir = `<span class="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full animate-pulse">À venir</span>`;
            } else if (!isUpcoming) {
                if (hasCompletedTime && isWithin10Days) {
                    badgeAvenir = `<span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full animate-pulse">New !</span>`;
                } else if (!hasCompletedTime && isWithin10Days) {
                    badgeAvenir = `<span class="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-[10px] sm:text-[11px] font-semibold rounded-full animate-pulse whitespace-nowrap">Chrono en attente</span>`;
                }
            }

            // Lien officiel de la course (recherche sur tous les champs possibles : website, link, siteUrl, url, resultUrl, site)
            const rawLink = (race.website || race.link || race.siteUrl || race.url || race.resultUrl || race.site)
                ? String(race.website || race.link || race.siteUrl || race.url || race.resultUrl || race.site).trim()
                : '';
            const officialUrl = rawLink
                ? (rawLink.startsWith('http://') || rawLink.startsWith('https://') ? rawLink : 'https://' + rawLink)
                : null;

            const raceCard = document.createElement('div');
            if (privacyLevel === 2) {
                raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md card-hover cursor-pointer relative group h-full public-race-card';
                raceCard.addEventListener('click', (e) => {
                    if (e.target.closest('button, a, img, .like-btn-wrapper')) return;
                    if (typeof window.showRaceDetails === 'function') {
                        window.showRaceDetails(race, null, privacy);
                    }
                });
            } else if (privacyLevel === 1 && officialUrl) {
                raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md card-hover cursor-pointer relative group h-full public-race-card';
                raceCard.addEventListener('click', (e) => {
                    if (e.target.closest('button, a, img, .like-btn-wrapper')) return;
                    window.open(officialUrl, '_blank');
                });
            } else {
                raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md relative group h-full public-race-card';
            }

            // Attacher les métadonnées de l'auteur sur l'objet race
            race._uid = uid;
            race._authorPrivacy = privacy;
            raceCard._raceData = race;
            raceCard._authorPrivacy = privacy;

            // Favorite Icon conditional
            const favIcon = (showFavorite && race.favorite)
                ? `<i class="fas fa-star text-yellow-400 mr-2" title="Favori"></i>`
                : '';

            // City conditional
            const cityHtml = (showCity && locationDisplay)
                ? `<span class="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-800 text-xs rounded-full" title="${escapeHtml(race.location || '')}">
                     <i class="fas fa-map-marker-alt text-teal-500"></i> ${escapeHtml(locationDisplay)}
                   </span>`
                : '';

            // === LIKE LOGIC ===
            const likedBy = race.likedBy || [];
            const likeCount = likedBy.length;
            const isLiked = currentUser && likedBy.includes(currentUser.uid);
            const showLikers = isOwner || isAdmin;
            const racePath = doc.ref.path;

            const heartClass = isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
            const likeAnimation = isLiked ? 'pulse-once' : '';

            // Interaction
            const likeAction = `event.stopPropagation(); toggleRaceLike('${racePath}', this)`;
            if (!isInvite) {
                raceCard.setAttribute('ondblclick', `toggleRaceLike('${racePath}', this.querySelector('.like-btn-wrapper'))`);
            }

            // Likers Button (Eye)
            const CounterTag = showLikers ? 'button' : 'span';
            const counterClickAttr = showLikers ? `onclick="event.stopPropagation(); openLikersModal('${racePath}')"` : '';
            const counterHoverClass = showLikers ? 'hover:text-green-700 cursor-pointer hover:underline decoration-green-700 underline-offset-2' : '';

            // Like Button HTML
            const likeButtonTitle = isInvite ? "Fonctionnalité désactivée pour le compte invité" : (isLiked ? "Je n'aime plus" : "J'aime");

            const likeButtonHtml = `
                <div class="flex flex-col items-end z-10 like-btn-wrapper relative group/likes shrink-0">
                    <div class="flex items-center gap-1">
                        <button onclick="${likeAction}" ${isInvite ? 'disabled' : ''}
                            class="transition flex items-center gap-1 focus:outline-none group/btn pt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="${likeButtonTitle}">
                            <i class="${heartClass} text-xl transition-all duration-300 ${likeAnimation} transform group-active/btn:scale-90 group-hover/btn:scale-110"></i>
                        </button>
                        <${CounterTag} ${counterClickAttr}
                            class="text-xs font-bold text-gray-600 like-count-display ml-1 min-w-[10px] text-center ${counterHoverClass}" 
                            title="${showLikers ? 'Voir qui a aimé' : ''}"
                            data-hidden="${!shouldShowCount}">
                            ${shouldShowCount && likeCount > 0 ? likeCount : ''}
                        </${CounterTag}>
                    </div>
                </div>`;

            // Titre avec lien ou ouverture de modale selon le niveau de confidentialité
            let titleHtml = '';
            if (privacyLevel === 2) {
                titleHtml = `
                    <h3 class="text-xl font-bold text-green-800 mb-1 flex items-center gap-1.5 cursor-pointer"
                        title="Ouvrir la fiche complète de la course"
                        onclick="event.stopPropagation(); if(typeof window.showRaceDetails==='function') window.showRaceDetails(this.closest('.public-race-card')?._raceData || null, null, this.closest('.public-race-card')?._authorPrivacy || null);">
                        ${favIcon}
                        <span>${escapeHtml(race.name || 'Course')}</span>
                    </h3>
                `;
            } else if (privacyLevel === 1) {
                const discreetLock = `<i class="fas fa-lock text-gray-400 text-xs shrink-0 ml-1" title="Aperçu simple (fiche détaillée confidentielle)"></i>`;
                if (officialUrl) {
                    titleHtml = `
                        <h3 class="text-xl font-bold text-green-800 mb-1 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                            ${favIcon}
                            <a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer" 
                               class="group-hover:text-blue-600 group-hover:underline flex items-center gap-1.5 text-inherit no-underline"
                               onclick="event.stopPropagation();"
                               title="Accéder au site officiel de la course : ${escapeHtml(officialUrl)}">
                                <span>${escapeHtml(race.name || 'Course')}</span>
                                <i class="fas fa-external-link-alt text-xs text-blue-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                            </a>
                            ${discreetLock}
                        </h3>
                    `;
                } else {
                    titleHtml = `
                        <h3 class="text-xl font-bold text-green-800 mb-1 flex items-center gap-1.5" title="Aperçu simple (fiche détaillée confidentielle, aucun lien officiel renseigné)">
                            ${favIcon}
                            <span>${escapeHtml(race.name || 'Course')}</span>
                            ${discreetLock}
                        </h3>
                    `;
                }
            }

            // === WISHLIST BUTTON (Only for connected user, not owner, not guest/invite) ===
            let wishlistBtnHtml = '';
            if (currentUser && !isOwner && !isInvite) {
                const rawTerrain = (race.terrain || '').toLowerCase();
                let wishlistCategory = 'route';
                if (rawTerrain === 'trail') wishlistCategory = 'trail';
                else if (rawTerrain === 'triathlon') wishlistCategory = 'triathlon';
                else if (rawTerrain === 'relai') wishlistCategory = 'relai';

                const raceName = (race.name || '').trim();
                const raceDateStr = race.date ? (typeof race.date === 'string' ? race.date.split('T')[0] : '') : '';
                const raceLink = officialUrl || '';

                const isAlreadyInWishlist = checkIsRaceInWishlist(raceName, window.currentUserWishlist);

                if (isAlreadyInWishlist) {
                    wishlistBtnHtml = `
                        <span onclick="event.stopPropagation();" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-300 shrink-0 shadow-xs" title="Cette course est déjà dans votre wishlist">
                            <i class="fas fa-check text-emerald-600 text-[10px]"></i>
                            <span>Dans ma wishlist</span>
                        </span>
                    `;
                } else {
                    wishlistBtnHtml = `
                        <button type="button"
                            onclick="event.stopPropagation(); window.addPublicRaceToWishlist(this)"
                            data-name="${escapeHtml(raceName)}"
                            data-category="${escapeHtml(wishlistCategory)}"
                            data-date="${escapeHtml(raceDateStr)}"
                            data-link="${escapeHtml(raceLink)}"
                            class="wishlist-add-btn inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold border border-emerald-200 hover:border-emerald-300 transition-all shrink-0 shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                            title="Ajouter « ${escapeHtml(raceName)} » à ma wishlist">
                            <i class="far fa-bookmark text-emerald-600 text-[10px]"></i>
                            <span>+ Wishlist</span>
                        </button>
                    `;
                }
            }

            // === CARD CONTENT ===
            raceCard.innerHTML = `
                <div class="p-6 relative h-full flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start">
                        <div>
                            ${titleHtml}
                            <p class="text-green-600 capitalize">
                                ${dateStr}
                            </p>
                        </div>
                         <!-- LIKE BUTTON (Top Right) -->
                        ${likeButtonHtml}
                    </div>

                    <div class="mt-4 flex flex-col gap-2 pr-28">
                        <div class="flex flex-wrap items-center gap-2">
                            ${race.terrain === 'triathlon' ?
                    (race.raceFormat === 'team' ?
                        (() => {
                            const relaySportVal = (() => {
                                if (race.raceRelaySport === 'swim') {
                                    const val = formatNumber(race.swimDistance);
                                    return `<span class="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full" title="Natation (Relais)">
                                                        <i class="fas fa-swimmer text-blue-500"></i> ${val}m
                                                     </span>`;
                                } else if (race.raceRelaySport === 'bike') {
                                    const distVal = formatNumber(race.bikeDistance);
                                    const elevVal = formatNumber(race.bikeElevation);
                                    let html = `<span class="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-800 text-xs rounded-full" title="Vélo (Relais)">
                                                            <i class="fas fa-biking text-orange-500"></i> ${distVal}km
                                                         </span>`;
                                    if (elevVal !== '?') {
                                        html += `<span class="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-800 text-xs rounded-full" title="Dénivelé">
                                                            <i class="fas fa-mountain text-orange-500"></i> +${elevVal}m
                                                         </span>`;
                                    }
                                    return html;
                                } else { // Run
                                    const distVal = formatNumber(race.distance);
                                    const elevVal = formatNumber(race.runElevation);
                                    let html = `<span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full" title="Course à pied (Relais)">
                                                            <i class="fas fa-running text-green-500"></i> ${distVal}km
                                                         </span>`;
                                    if (elevVal !== '?') {
                                        html += `<span class="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-800 text-xs rounded-full" title="Dénivelé">
                                                            <i class="fas fa-mountain text-orange-500"></i> +${elevVal}m
                                                         </span>`;
                                    }
                                    return html;
                                }
                            })();
                            return `${relaySportVal}
                                             <span class="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-full" title="Relais">
                                                <i class="fas fa-users text-indigo-500"></i> Relais
                                             </span>`;
                        })()
                        :
                        // STANDARD TRIATHLON DISPLAY
                        `
                                 <span class="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full" title="Natation">
                                         <i class="fas fa-swimmer text-blue-500"></i> ${formatNumber(race.swimDistance)}m
                                     </span>
                                 <span class="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-800 text-xs rounded-full" title="Vélo">
                                         <i class="fas fa-biking text-orange-500"></i> ${formatNumber(race.bikeDistance)}km
                                     </span>
                                 <span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full" title="Course à pied">
                                         <i class="fas fa-running text-green-500"></i> ${formatNumber(race.distance)}km
                                     </span>
                         `)
                    :
                    `
                     ${formatNumber(race.distance) !== '?' ? `<span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full">
                        <i class="fas fa-ruler-horizontal text-green-500"></i> ${formatNumber(race.distance)} km
                     </span>` : ''}
                     ${race.terrain !== 'hyrox' && race.elevation && race.elevation !== '0' && race.elevation !== 0 && race.elevation !== '-' && formatNumber(race.elevation) !== '?' ? `
                     <span class="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-800 text-xs rounded-full">
                        <i class="fas fa-mountain text-orange-500"></i> +${formatNumber(race.elevation)} m
                     </span>
                     ` : ''}
                     ${race.terrain === 'relai' ? `
                     <span class="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-full"><i class="fas fa-users text-indigo-500"></i> Relais</span>
                     ` : ''}
                     ${cityHtml}
                     ${race.terrain === 'hyrox' ? `
                     <span class="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-full"><i class="fas fa-dumbbell text-indigo-500"></i> Hyrox</span>
                     ` : ''}
                     ${race.terrain === 'trail' ? `
                     <span class="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-full"><i class="fas fa-tree text-indigo-500"></i> Trail</span>
                     ` : ''}
                     ${race.terrain === 'route' || (!race.terrain && race.terrain !== 'hyrox' && race.terrain !== 'relai' && race.terrain !== 'trail') ? `
                     <span class="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-full"><i class="fas fa-road text-indigo-500"></i> Route</span>
                     ` : ''}`
                }
                        </div>
                    </div>
</div>

                    <!-- Footer -->
                    <div class="mt-4 pt-3 flex items-center border-t border-green-50 pr-28">
                        <span class="text-xs text-gray-500 flex items-center gap-2" title="${escapeHtml(ownerPseudoDisplay)}">
                            ${userData.photoURL ?
                    `<img src="${escapeHtml(userData.photoURL)}" onclick="event.stopPropagation(); zoomImage('${escapeHtml(userData.photoURL)}')" class="w-6 h-6 rounded-full object-cover border border-green-200 shadow-sm cursor-zoom-in hover:scale-110 transition-transform">` :
                    `<i class="fas fa-user-circle text-green-600 text-lg"></i>`
                }
                            <span class="truncate max-w-[150px] font-semibold">${escapeHtml(ownerPseudoDisplay)}</span>
                            ${badgeAvenir}
                        </span>
                    </div>

                    <!-- Wishlist & Image (Bottom Right) -->
                    <div class="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 z-10">
                        ${wishlistBtnHtml}
                        <div class="h-28 w-28 group-hover:scale-105 transition-transform duration-300">
                            ${race.photo ?
                        `<img src="${race.photo}" onclick="event.stopPropagation(); zoomImage('${race.photo}')" alt="Photo course" class="h-full w-full object-cover rounded-lg shadow-md border border-green-200 cursor-zoom-in" />`
                        : (race.parcours ?
                        `<img src="${race.parcours}" onclick="event.stopPropagation(); zoomImage('${race.parcours}')" alt="Parcours course" class="h-full w-full object-cover rounded-lg shadow-md border border-green-200 cursor-zoom-in" />`
                        :
                        `<div class="h-full w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                                    <i class="fas fa-running text-gray-300 text-3xl"></i>
                                </div>`)
                    }
                        </div>
                    </div>
                </div>
            `;

            fragment.appendChild(raceCard);
            displayedCount++;
            if (displayedCount >= publicRaceFilters.limit) {
                break;
            }
        }

        if (fragment.children.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Aucune course publique trouvée.</div>';
            return;
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

// === WISHLIST HANDLER FOR PUBLIC RACES ===
window.addPublicRaceToWishlist = async function (btn) {
    const user = firebase.auth().currentUser;
    if (!user) {
        const modal = document.getElementById('permissionDeniedModal');
        if (modal) {
            const msg = document.getElementById('permissionDeniedMessage');
            if (msg) msg.textContent = "Vous devez être connecté pour ajouter une course à votre wishlist.";
            modal.classList.remove('hidden');
        }
        return;
    }

    const name = (btn.dataset.name || '').trim();
    const category = (btn.dataset.category || 'route').trim();
    const date = (btn.dataset.date || '').trim();
    const link = (btn.dataset.link || '').trim();

    if (!name) return;

    btn.disabled = true;
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-circle-notch fa-spin text-emerald-600 text-[10px]"></i> <span>Ajout...</span>`;

    try {
        window.currentUserWishlist = window.currentUserWishlist || [];

        // Check if race already exists in wishlist (exact or similar)
        const alreadyExists = checkIsRaceInWishlist(name, window.currentUserWishlist);
        if (alreadyExists) {
            if (typeof showToast === 'function') {
                showToast(`« ${name} » est déjà dans votre wishlist !`, 'info');
            }
            updateWishlistButtonsForRace(name);
            return;
        }

        const newItem = {
            name: name,
            category: category || 'route',
            date: date || '',
            link: link || '',
            favorite: false,
            addedAt: new Date().toISOString()
        };

        const docRef = await db.collection('users').doc(user.uid).collection('wishlist').add(newItem);
        newItem.id = docRef.id;
        window.currentUserWishlist.push(newItem);

        // Update all buttons for this race on the page
        updateWishlistButtonsForRace(name);

        if (typeof showToast === 'function') {
            showToast(`« ${name} » ajoutée à votre wishlist !`, 'success');
        }

        if (typeof window.checkBadgesForNewUnlocks === 'function') {
            window.checkBadgesForNewUnlocks();
        }
    } catch (err) {
        console.error("Erreur lors de l'ajout à la wishlist :", err);
        btn.disabled = false;
        btn.innerHTML = originalContent;
        if (typeof showToast === 'function') {
            showToast("Erreur lors de l'ajout à la wishlist", "error");
        }
    }
};

function updateWishlistButtonsForRace(raceName) {
    const buttons = document.querySelectorAll('.wishlist-add-btn');
    const badgeHtml = `
        <span onclick="event.stopPropagation();" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-300 shrink-0 shadow-xs" title="Cette course est dans votre wishlist">
            <i class="fas fa-check text-emerald-600 text-[10px]"></i>
            <span>Dans ma wishlist</span>
        </span>
    `;
    buttons.forEach(b => {
        const bName = (b.dataset.name || '').trim();
        if (bName.toLowerCase() === raceName.toLowerCase() || checkIsRaceInWishlist(bName, [{ name: raceName }])) {
            b.outerHTML = badgeHtml;
        }
    });
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
    const wrapper = btn.classList.contains('like-btn-wrapper') ? btn : btn.closest('.like-btn-wrapper');
    if (!wrapper) return;

    const icon = wrapper.querySelector('i');
    const countSpan = wrapper.querySelector('.like-count-display');

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
            try {
                if (typeof window.saveUserFlag === 'function') {
                    window.saveUserFlag('hasLikedPublicRace');
                } else if (typeof saveUserFlag === 'function') {
                    saveUserFlag('hasLikedPublicRace');
                }
            } catch (flagErr) {
                console.warn('[Like] saveUserFlag error:', flagErr);
            }
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
        if (typeof showToast === 'function') {
            showToast("Impossible de liker. Vérifiez les règles de sécurité Firestore.", "error");
        } else {
            alert("Erreur : Impossible de liker. Vérifiez que vous êtes bien connecté. Si le problème persiste, il s'agit probablement d'une restriction des droits d'accès (règles de sécurité Firestore).");
        }
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

        // Fetch Names and Photos
        const likers = [];
        await Promise.all(likedBy.map(async (uid) => {
            try {
                const uDoc = await db.collection('users').doc(uid).get();
                if (uDoc.exists) {
                    const d = uDoc.data();
                    const p = d.pseudo || d.email.split('@')[0];
                    const pic = d.photoURL || null;
                    likers.push({ name: p, photoURL: pic });
                } else {
                    likers.push({ name: "Utilisateur inconnu", photoURL: null });
                }
            } catch (e) { likers.push({ name: "Erreur chargement", photoURL: null }); }
        }));

        if (likers.length > 0) {
            content.innerHTML = `<ul class="space-y-2">
                ${likers.map(l => `
                    <li class="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-800">
                        ${l.photoURL ?
                    `<img src="${escapeHtml(l.photoURL)}" onclick="zoomImage('${escapeHtml(l.photoURL)}')" class="w-6 h-6 rounded-full object-cover border border-green-200 shadow-sm cursor-zoom-in hover:scale-110 transition-transform">` :
                    `<i class="fas fa-user-circle text-xl"></i>`
                }
                        <span class="font-medium truncate">${escapeHtml(l.name)}</span>
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

function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}