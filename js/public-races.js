
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

// Helper pour calculer la distance réelle d'une course pour l'utilisateur
function extractRaceDistanceKm(data) {
    if (!data || data.deleted) return 0;
    if (data.terrain === 'triathlon') {
        if (data.raceFormat === 'team') {
            if (data.raceRelaySport === 'swim') {
                return (parseFloat(data.swimDistance) || 0) / 1000;
            } else if (data.raceRelaySport === 'bike') {
                return parseFloat(data.bikeDistance) || 0;
            } else {
                return parseFloat(data.distance) || 0;
            }
        }
        const swim = (parseFloat(data.swimDistance) || 0) / 1000;
        const bike = parseFloat(data.bikeDistance) || 0;
        const run = parseFloat(data.distance) || 0;
        return (swim + bike + run) || 0;
    }
    if (data.terrain === 'relai' && Array.isArray(data.relayLaps) && data.relayLaps.length > 0) {
        return data.relayLaps.reduce((sum, lap) => {
            const runner = String(lap.runner || '').trim().toLowerCase();
            const pseudo = (typeof window !== 'undefined' && window.currentUserPseudo) ? String(window.currentUserPseudo).trim().toLowerCase() : '';
            const isUserLap = !runner || runner === 'moi' || runner === 'tous ensemble' || runner === 'all' || (pseudo && runner === pseudo);
            if (isUserLap) {
                return sum + (parseFloat(lap.dist) || 0);
            }
            return sum;
        }, 0);
    }
    return parseFloat(String(data.distance || '').replace(',', '.')) || 0;
}

// Helper pour vérifier si une course est passée/réalisée
function isRaceCompletedOrPast(race) {
    if (!race || !race.date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const raceDate = new Date(race.date);
    raceDate.setHours(0, 0, 0, 0);
    const hasValidTime = race.time && race.time !== '00:00:00' && String(race.time).trim() !== '';
    return raceDate < today || hasValidTime;
}

// Clés et TTL de cache pour optimiser drastiquement les lectures Firebase
const COMMUNITY_KM_STORAGE_KEY = 'repertoire_community_total_km_v2';
const COMMUNITY_KM_TTL_MS = 60 * 60 * 1000; // 1 heure de cache pour le total communautaire
const USER_KM_STORAGE_KEY_PREFIX = 'repertoire_user_total_km_v2_';
const USER_KM_TTL_MS = 15 * 60 * 1000; // 15 minutes de cache pour le coureur connecté

// Nettoyer les anciennes clés de cache obsolètes
try {
    localStorage.removeItem('repertoire_community_total_km_v1');
    sessionStorage.removeItem('repertoire_user_total_km_');
} catch (e) {}

let isCalculatingCommunityStats = false;

// Fonction de rendu UI du compteur communautaire et contribution
function renderCommunityKmUI(communityKm, userKm, isUserLoggedIn) {
    const totalKmEl = document.getElementById('communityTotalKmText');
    const contribEl = document.getElementById('userCommunityContribution');
    if (!totalKmEl) return;

    if (communityKm > 0) {
        const roundedComm = Math.round(communityKm * 10) / 10;
        const formattedCommunityKm = (roundedComm % 1 === 0 ? Math.round(roundedComm) : roundedComm).toLocaleString('fr-FR');
        totalKmEl.textContent = `${formattedCommunityKm} km`;
    }

    if (!contribEl) return;

    if (isUserLoggedIn) {
        if (userKm > 0 && communityKm > 0) {
            const userPercent = (userKm / communityKm) * 100;
            let formattedPercent = userPercent.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
            if (userPercent < 0.1) formattedPercent = '< 0,1';
            const roundedUser = Math.round(userKm * 10) / 10;
            const formattedUserKm = (roundedUser % 1 === 0 ? Math.round(roundedUser) : roundedUser).toLocaleString('fr-FR');

            contribEl.innerHTML = `
                <div class="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-200/80 text-green-900 font-semibold text-xs">
                        <i class="fas fa-user-check text-green-700 text-[10px]"></i> Votre carnet : <strong>${formattedUserKm} km</strong>
                    </span>
                    <span class="text-green-800 text-xs sm:text-sm">
                        soit <strong>${formattedPercent} %</strong> du total de la communauté !
                    </span>
                </div>
            `;
            contribEl.classList.remove('hidden');
        } else {
            contribEl.innerHTML = `
                <span class="text-green-700/80 text-xs sm:text-sm">Ajoutez vos courses sur votre carnet pour contribuer au compteur collectif !</span>
            `;
            contribEl.classList.remove('hidden');
        }
    } else {
        contribEl.classList.add('hidden');
    }
}

// Fonction optimisée pour charger et afficher le total des kilomètres de la communauté et la contribution
async function loadCommunityKmStats() {
    const totalKmEl = document.getElementById('communityTotalKmText');
    if (!totalKmEl) return;

    if (isCalculatingCommunityStats) return;
    isCalculatingCommunityStats = true;

    try {
        const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        
        // 1. Lire le cache local communautaire
        let cachedCommunity = null;
        try {
            const rawComm = localStorage.getItem(COMMUNITY_KM_STORAGE_KEY);
            if (rawComm) cachedCommunity = JSON.parse(rawComm);
        } catch (e) {}

        const now = Date.now();
        let communityKm = (cachedCommunity && cachedCommunity.totalKm) ? cachedCommunity.totalKm : 0;
        const isCommCacheValid = cachedCommunity && (now - cachedCommunity.timestamp < COMMUNITY_KM_TTL_MS) && communityKm > 0;

        // 2. Récupérer les km de l'utilisateur (depuis la mémoire ou cache session)
        let userKm = 0;
        let isUserCacheValid = false;

        if (currentUser) {
            if (Array.isArray(window.allUserRaces) && window.allUserRaces.length > 0) {
                // Déjà en mémoire dans la session courante (0 lecture Firebase !)
                userKm = window.allUserRaces
                    .filter(r => isRaceCompletedOrPast(r))
                    .reduce((sum, r) => sum + extractRaceDistanceKm(r), 0);
                isUserCacheValid = true;
                try {
                    sessionStorage.setItem(USER_KM_STORAGE_KEY_PREFIX + currentUser.uid, JSON.stringify({
                        userKm: userKm,
                        timestamp: Date.now()
                    }));
                } catch (e) {}
            } else {
                try {
                    const rawUser = sessionStorage.getItem(USER_KM_STORAGE_KEY_PREFIX + currentUser.uid);
                    if (rawUser) {
                        const parsedUser = JSON.parse(rawUser);
                        if (now - parsedUser.timestamp < USER_KM_TTL_MS) {
                            userKm = parsedUser.userKm || 0;
                            isUserCacheValid = true;
                        }
                    }
                } catch (e) {}
            }
        }

        // 3. Affichage immédiat dès la première frame si disponible en cache (Zéro latence UI, zéro read)
        if (communityKm > 0) {
            renderCommunityKmUI(communityKm, userKm, !!currentUser);
        }

        // 4. Si le cache communautaire a expiré ou est absent, on rafraîchit
        if (!isCommCacheValid) {
            let fetchedCommunityKm = 0;
            // Tentative 1: Document de stats agrégées (1 seule lecture au lieu de tout scanner)
            try {
                const statsDoc = await db.collection('config').doc('publicStats').get();
                if (statsDoc.exists && typeof statsDoc.data().totalCommunityKm === 'number') {
                    fetchedCommunityKm = statsDoc.data().totalCommunityKm;
                }
            } catch (e) {}

            // Tentative 2: Si pas de doc agrégé, scanner le collectionGroup et mettre en cache pour 1h
            if (!fetchedCommunityKm) {
                const snapshot = await db.collectionGroup('races').get();
                snapshot.forEach(doc => {
                    const rData = doc.data();
                    if (isRaceCompletedOrPast(rData)) {
                        const dist = extractRaceDistanceKm(rData);
                        if (dist > 0) fetchedCommunityKm += dist;
                    }
                });
            }

            if (fetchedCommunityKm > 0) {
                communityKm = fetchedCommunityKm;
                try {
                    localStorage.setItem(COMMUNITY_KM_STORAGE_KEY, JSON.stringify({
                        totalKm: communityKm,
                        timestamp: Date.now()
                    }));
                } catch (e) {}
            }
        }

        // 5. Si l'utilisateur est connecté et que ses km ne sont pas en cache, interroger UNIQUEMENT ses courses (pas toute la base !)
        if (currentUser && !isUserCacheValid) {
            try {
                const userRacesSnap = await db.collection('users').doc(currentUser.uid).collection('races').get();
                let computedUserKm = 0;
                userRacesSnap.forEach(doc => {
                    const rData = doc.data();
                    if (isRaceCompletedOrPast(rData)) {
                        const dist = extractRaceDistanceKm(rData);
                        if (dist > 0) computedUserKm += dist;
                    }
                });
                userKm = computedUserKm;
                try {
                    sessionStorage.setItem(USER_KM_STORAGE_KEY_PREFIX + currentUser.uid, JSON.stringify({
                        userKm: userKm,
                        timestamp: Date.now()
                    }));
                } catch (e) {}
            } catch (e) {
                console.warn("[public-races] Impossible de charger les km de l'utilisateur:", e);
            }
        }

        // 6. Rendu final avec les données fraîches
        renderCommunityKmUI(communityKm, userKm, !!currentUser);

    } catch (e) {
        console.warn("[public-races] Erreur calcul km communauté:", e);
    } finally {
        isCalculatingCommunityStats = false;
    }
}

window.loadCommunityKmStats = loadCommunityKmStats;

document.addEventListener('DOMContentLoaded', () => {
    loadPublicRaces();
    loadCommunityKmStats();
});

if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(() => {
        loadCommunityKmStats();
    });
}

// Helper pour formater les nombres (distance, dénivelé)
function formatNumber(val) {
    if (!val && val !== 0) return '?';
    const num = parseFloat(String(val).replace(',', '.'));
    if (isNaN(num)) return '?';
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Helper pour normaliser le nom de la course pour la comparaison
function normalizeRaceName(name) {
    if (!name) return "";
    return String(name)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\-_']/g, " ")
        .replace(/\s+/g, " ");
}

// Helper pour vérifier si deux dates sont proches (même année, écart <= maxDays)
function areDatesClose(dateStr1, dateStr2, maxDays = 7) {
    if (!dateStr1 || !dateStr2) return false;
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
    // Règle essentielle : ne pas confondre les éditions d'années différentes
    if (d1.getFullYear() !== d2.getFullYear()) return false;
    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= maxDays;
}

// Fonction de regroupement des courses adjacentes qui font la même épreuve
function groupAdjacentSimilarRaces(items) {
    if (!items || items.length === 0) return [];

    const groups = [];
    for (const item of items) {
        let placed = false;

        // 1. Vérifier si l'élément courant correspond au dernier groupe en cours (courses directement consécutives)
        if (groups.length > 0) {
            const lastGroup = groups[groups.length - 1];
            const leadItem = lastGroup[0];
            const isSameName = normalizeRaceName(item.race.name) === normalizeRaceName(leadItem.race.name);
            const isCloseDate = areDatesClose(item.race.date, leadItem.race.date, 7);

            if (isSameName && isCloseDate) {
                lastGroup.push(item);
                placed = true;
            }
        }

        // 2. Si non placé avec le dernier groupe, vérifier s'il correspond à un groupe très récent (ex: dans les 3 derniers)
        // partageant la même date quasi-identique (<= 2 jours), au cas où Firestore a intercalé une autre course
        if (!placed) {
            for (let i = groups.length - 1; i >= 0 && i >= groups.length - 3; i--) {
                const targetGroup = groups[i];
                const leadItem = targetGroup[0];
                const isSameName = normalizeRaceName(item.race.name) === normalizeRaceName(leadItem.race.name);
                const isVeryCloseDate = areDatesClose(item.race.date, leadItem.race.date, 2);

                if (isSameName && isVeryCloseDate) {
                    targetGroup.push(item);
                    placed = true;
                    break;
                }
            }
        }

        // 3. Sinon, créer un nouveau groupe distinct
        if (!placed) {
            groups.push([item]);
        }
    }

    return groups;
}

// Construction du DOM d'une carte de course individuelle (taille et style d'origine préservés à 100%)
function buildSingleRaceCardElement(item, stackInfo = null) {
    const {
        race,
        userData,
        uid,
        privacy,
        privacyLevel,
        officialUrl,
        dateStr,
        locationDisplay,
        badgeAvenir,
        showCity,
        showFavorite,
        shouldShowCount,
        ownerPseudoDisplay,
        isOwner,
        isAdmin,
        isInvite,
        currentUser,
        docPath,
        userWishlist
    } = item;

    const favIcon = (showFavorite && race.favorite)
        ? `<i class="fas fa-star text-yellow-400 mr-2" title="Favori"></i>`
        : '';

    const cityHtml = (showCity && locationDisplay)
        ? `<span class="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-800 text-xs rounded-full" title="${escapeHtml(race.location || '')}">
             <i class="fas fa-map-marker-alt text-teal-500"></i> ${escapeHtml(locationDisplay)}
           </span>`
        : '';

    const likedBy = race.likedBy || [];
    const likeCount = likedBy.length;
    const isLiked = currentUser && likedBy.includes(currentUser.uid);
    const showLikers = isOwner || isAdmin;

    const heartClass = isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
    const likeAnimation = isLiked ? 'pulse-once' : '';

    const likeAction = `event.stopPropagation(); toggleRaceLike('${docPath}', this)`;

    const CounterTag = showLikers ? 'button' : 'span';
    const counterClickAttr = showLikers ? `onclick="event.stopPropagation(); openLikersModal('${docPath}')"` : '';
    const counterHoverClass = showLikers ? 'hover:text-green-700 cursor-pointer hover:underline decoration-green-700 underline-offset-2' : '';

    const likeButtonTitle = isInvite ? "Fonctionnalité désactivée pour le compte invité" : (isLiked ? "Je n'aime plus" : "J'aime");

    const likeButtonHtml = `
        <div class="flex flex-col items-end z-10 like-btn-wrapper relative group/likes shrink-0">
            <div class="flex items-center gap-1">
                <button onclick="${likeAction}" ${isInvite ? 'disabled' : ''}
                    class="transition flex items-center gap-1 focus:outline-none group/btn pt-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                        <i class="fas fa-external-link-alt text-xs text-blue-500 shrink-0"></i>
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

        const isAlreadyInWishlist = checkIsRaceInWishlist(raceName, window.currentUserWishlist || userWishlist);

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

    // Petit bouton clair pour changer de pile de la card (placé tout à gauche)
    const stackBtnHtml = (stackInfo && stackInfo.total > 1) ? `
        <div class="inline-flex items-center rounded-full bg-white border border-emerald-300 shadow-xs text-emerald-800 text-[11px] font-semibold shrink-0 select-none overflow-hidden mr-1.5" title="Même course : ${stackInfo.total} coureurs dans cette pile (cliquez ou molette)">
            <button type="button" class="stack-nav-btn stack-prev-btn px-1.5 py-0.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer" title="Coureur précédent">‹</button>
            <button type="button" class="stack-nav-btn stack-next-btn px-1.5 py-0.5 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-1 transition cursor-pointer font-bold border-l border-r border-emerald-100" title="Passer au coureur suivant">
                <i class="fas fa-layer-group text-[9px] text-emerald-600"></i>
                <span>${stackInfo.index + 1}/${stackInfo.total}</span>
            </button>
            <button type="button" class="stack-nav-btn stack-next-btn px-1.5 py-0.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer font-bold" title="Coureur suivant">›</button>
        </div>
    ` : '';

    const raceCard = document.createElement('div');
    if (privacyLevel === 2) {
        raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md card-hover cursor-pointer relative group h-full public-race-card flex flex-col justify-between';
        raceCard.addEventListener('click', (e) => {
            if (e.target.closest('button, a, img, .like-btn-wrapper, .stack-nav-btn')) return;
            if (typeof window.showRaceDetails === 'function') {
                window.showRaceDetails(race, null, privacy);
            }
        });
    } else if (privacyLevel === 1 && officialUrl) {
        raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md card-hover cursor-pointer relative group h-full public-race-card flex flex-col justify-between';
        raceCard.addEventListener('click', (e) => {
            if (e.target.closest('button, a, img, .like-btn-wrapper, .stack-nav-btn')) return;
            window.open(officialUrl, '_blank');
        });
    } else {
        raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md relative group h-full public-race-card flex flex-col justify-between';
    }

    if (!isInvite) {
        raceCard.setAttribute('ondblclick', `toggleRaceLike('${docPath}', this.querySelector('.like-btn-wrapper'))`);
    }

    // Attacher les métadonnées de l'auteur sur l'objet race et l'élément
    race._uid = uid;
    race._authorPrivacy = privacy;
    raceCard._raceData = race;
    raceCard._authorPrivacy = privacy;

    // Rendu avec le padding p-6 d'origine exact
    raceCard.innerHTML = `
        <div class="p-6 relative h-full flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start">
                    <div class="min-w-0 flex-1 pr-2">
                        ${titleHtml}
                        <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p class="text-green-600 capitalize text-sm">
                                ${dateStr}
                            </p>
                            ${wishlistBtnHtml}
                        </div>
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
            <div class="mt-4 pt-3 flex items-center min-w-0 border-t border-green-50 pr-28">
                <div class="flex items-center gap-1.5 min-w-0 flex-nowrap w-full">
                    ${stackBtnHtml}
                    ${userData.photoURL ?
            `<img src="${escapeHtml(userData.photoURL)}" onclick="event.stopPropagation(); zoomImage('${escapeHtml(userData.photoURL)}')" class="w-6 h-6 rounded-full object-cover border border-green-200 shadow-sm cursor-zoom-in hover:scale-110 transition-transform shrink-0">` :
            `<i class="fas fa-user-circle text-green-600 text-lg shrink-0"></i>`
        }
                    <span class="truncate max-w-[100px] font-semibold text-xs text-gray-700 shrink-0" title="${escapeHtml(ownerPseudoDisplay)}">${escapeHtml(ownerPseudoDisplay)}</span>
                    ${badgeAvenir}
                </div>
            </div>

            <!-- Image (Bottom Right) -->
            <div class="absolute bottom-3 right-3 z-10">
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

    return raceCard;
}

// Construction du composant de pile mutualisée pour courses identiques superposées
function buildRaceStackElement(group) {
    const stackWrapper = document.createElement('div');
    stackWrapper.className = 'public-race-stack-wrapper relative h-full';
    stackWrapper.setAttribute('data-stack-count', group.length);

    // Calques d'arrière-plan réalistes pour matérialiser clairement la pile de cartes
    const layer1 = document.createElement('div');
    layer1.className = 'stack-card-layer stack-card-layer-1';
    stackWrapper.appendChild(layer1);

    if (group.length >= 3) {
        const layer2 = document.createElement('div');
        layer2.className = 'stack-card-layer stack-card-layer-2';
        stackWrapper.appendChild(layer2);
    }

    // Viewport de la pile
    const viewport = document.createElement('div');
    viewport.className = 'stack-card-viewport relative h-full w-full';
    stackWrapper.appendChild(viewport);

    // Conteneur des diapositives de cartes
    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'stack-slides-container relative h-full w-full';
    viewport.appendChild(slidesContainer);

    const slideElements = [];
    let currentIndex = 0;
    const total = group.length;
    let isTransitioning = false;

    group.forEach((item, idx) => {
        const slide = document.createElement('div');
        slide.className = `stack-slide ${idx === 0 ? 'stack-slide-active' : 'stack-slide-hidden'}`;
        slide.setAttribute('data-index', idx);

        const nextPseudo = idx < total - 1 ? group[idx + 1].ownerPseudoDisplay : group[0].ownerPseudoDisplay;
        const prevPseudo = idx > 0 ? group[idx - 1].ownerPseudoDisplay : group[total - 1].ownerPseudoDisplay;

        const cardElem = buildSingleRaceCardElement(item, {
            index: idx,
            total,
            nextPseudo,
            prevPseudo
        });

        // Clic sur les boutons de navigation (petit bouton clair à côté du tag 'À venir')
        const prevBtns = cardElem.querySelectorAll('.stack-prev-btn');
        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                goToIndex(currentIndex - 1, 'prev');
            });
        });

        const nextBtns = cardElem.querySelectorAll('.stack-next-btn');
        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                goToIndex(currentIndex + 1, 'next');
            });
        });

        slide.appendChild(cardElem);
        slidesContainer.appendChild(slide);
        slideElements.push(slide);
    });

    function goToIndex(targetIndex, direction = 'next') {
        if (targetIndex < 0) targetIndex = total - 1;
        if (targetIndex >= total) targetIndex = 0;
        if (targetIndex === currentIndex || isTransitioning) return;

        isTransitioning = true;
        stackWrapper.classList.add('is-animating');

        const currentSlide = slideElements[currentIndex];
        const targetSlide = slideElements[targetIndex];

        // Nettoyer les classes d'animation antérieures
        slideElements.forEach(s => {
            s.classList.remove(
                'stack-slide-pass-behind',
                'stack-slide-rise-front',
                'stack-slide-pull-from-behind',
                'stack-slide-drop-back'
            );
        });

        if (direction === 'next') {
            // Transition spectaculaire : la carte de devant s'élève, sort de la pile et passe DERRIÈRE
            currentSlide.className = 'stack-slide stack-slide-pass-behind';
            targetSlide.className = 'stack-slide stack-slide-rise-front';
        } else {
            // Transition inverse : la carte de derrière est tirée vers l'avant et atterrit sur le dessus
            targetSlide.className = 'stack-slide stack-slide-pull-from-behind';
            currentSlide.className = 'stack-slide stack-slide-drop-back';
        }

        // Fin de l'animation : stabiliser les états actifs et masqués
        setTimeout(() => {
            slideElements.forEach((s, idx) => {
                if (idx === targetIndex) {
                    s.className = 'stack-slide stack-slide-active';
                } else {
                    s.className = 'stack-slide stack-slide-hidden';
                }
            });
            currentIndex = targetIndex;
            isTransitioning = false;
            stackWrapper.classList.remove('is-animating');
        }, 460);
    }

    // Option pour scroller à la molette sur la carte et voir celle du dessous
    let lastWheelTime = 0;
    stackWrapper.addEventListener('wheel', (e) => {
        if (isTransitioning) return;
        if (Math.abs(e.deltaY) < 18) return;

        const now = Date.now();
        if (now - lastWheelTime < 460) return;

        if (e.deltaY > 0) {
            // Défilement vers le bas -> aller vers la carte du dessous (la carte passe derrière)
            if (currentIndex < total - 1) {
                e.preventDefault();
                lastWheelTime = now;
                goToIndex(currentIndex + 1, 'next');
            }
            // Au bout de la pile, on laisse défiler la page normalement sans bloquer l'utilisateur
        } else {
            // Défilement vers le haut -> remonter
            if (currentIndex > 0) {
                e.preventDefault();
                lastWheelTime = now;
                goToIndex(currentIndex - 1, 'prev');
            }
            // Au début de la pile, on laisse défiler la page normalement vers le haut
        }
    }, { passive: false });

    // Option pour swiper au toucher sur mobile
    let touchStartX = 0;
    let touchStartY = 0;
    stackWrapper.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    stackWrapper.addEventListener('touchend', (e) => {
        if (isTransitioning) return;
        if (e.changedTouches && e.changedTouches.length > 0) {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                if (deltaX < 0) {
                    goToIndex(currentIndex + 1, 'next');
                } else {
                    goToIndex(currentIndex - 1, 'prev');
                }
            }
        }
    }, { passive: true });

    return stackWrapper;
}

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
        const fetchLimit = Math.max(publicRaceFilters.limit * 4, 60);
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

        // Cache object
        const userCache = {};
        const validRaceItems = [];

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
                    // Le tag 'Chrono en attente' ne doit être visible que si la fiche détaillée est accessible
                    if (privacyLevel === 2) {
                        badgeAvenir = `<span class="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-[10px] sm:text-[11px] font-semibold rounded-full animate-pulse whitespace-nowrap">Chrono en attente</span>`;
                    }
                }
            }

            // Lien officiel de la course (recherche sur tous les champs possibles : website, link, siteUrl, url, resultUrl, site)
            const rawLink = (race.website || race.link || race.siteUrl || race.url || race.resultUrl || race.site)
                ? String(race.website || race.link || race.siteUrl || race.url || race.resultUrl || race.site).trim()
                : '';
            const officialUrl = rawLink
                ? (rawLink.startsWith('http://') || rawLink.startsWith('https://') ? rawLink : 'https://' + rawLink)
                : null;

            validRaceItems.push({
                race,
                uid,
                userData: { ...userData },
                privacy,
                privacyLevel,
                officialUrl,
                raceDate,
                dateStr,
                locationDisplay,
                badgeAvenir,
                showCity,
                showFavorite,
                shouldShowCount,
                ownerPseudoDisplay,
                isOwner,
                isAdmin,
                isInvite,
                currentUser,
                docPath: doc.ref.path,
                userWishlist
            });

            // Ne pas surcharger le traitement si on a déjà largement de quoi remplir les slots
            if (validRaceItems.length >= publicRaceFilters.limit * 3) {
                break;
            }
        }

        if (validRaceItems.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Aucune course publique trouvée.</div>';
            return;
        }

        // Regrouper les courses identiques et adjacentes (même nom, date proche, même année)
        const groups = groupAdjacentSimilarRaces(validRaceItems);
        const displayGroups = groups.slice(0, publicRaceFilters.limit);

        const fragment = document.createDocumentFragment();
        for (const group of displayGroups) {
            if (group.length === 1) {
                const singleCard = buildSingleRaceCardElement(group[0], false);
                fragment.appendChild(singleCard);
            } else {
                const stackCard = buildRaceStackElement(group);
                fragment.appendChild(stackCard);
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