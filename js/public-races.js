
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

        // Cache object (persisted across function calls could be better but let's keep it simple locally first)
        // Actually, if we want to reuse cache across re-runs (if any), we should define it outside.
        // But for atomic display, local is fine.
        const userCache = {};

        for (const doc of snapshot.docs) {
            const race = { id: doc.id, ...doc.data() };

            // Get User Email
            // Get User Pseudo
            const uid = doc.ref.parent.parent ? doc.ref.parent.parent.id : null;
            let ownerPseudo = "Coureur mystère";

            if (uid) {
                if (userCache[uid]) {
                    ownerPseudo = userCache[uid];
                } else {
                    try {
                        const userDoc = await db.collection('users').doc(uid).get();
                        if (userDoc.exists) {
                            const data = userDoc.data();
                            console.log("User data found for", uid, data); // Debug log
                            // Priorité au Pseudo, sinon Email, sinon fallback
                            if (data && data.pseudo) {
                                ownerPseudo = data.pseudo;
                                userCache[uid] = ownerPseudo;
                            } else if (data && data.email) {
                                // Fallback si pas de pseudo (anciens comptes)
                                // On peut choisir d'afficher le début de l'email ou "Anonyme"
                                ownerPseudo = data.email.split('@')[0]; // Affiche juste la partie avant @
                                userCache[uid] = ownerPseudo;
                            } else {
                                ownerPseudo = "Pseudo non disponible";
                                userCache[uid] = ownerPseudo;
                            }
                        } else {
                            console.warn("User doc not found for uid:", uid);
                        }
                    } catch (e) {
                        console.error("Error fetching user", uid, e);
                        // Do not cache error
                    }
                }
            }

            // === FILTER: Hide Unknown Users ===
            // Si on n'a pas trouvé de nom valide
            if (ownerPseudo === "Coureur mystère" || ownerPseudo === "Pseudo non disponible") {
                continue;
            }

            // === FILTER: Visible (Public) Races Only ===
            // Si le champ 'public' existe et est false, on masque.
            // Par défaut (undefined), on considère que c'est visible pour rétrocompatibilité
            if (race.public === false) {
                continue;
            }

            // === DISPLAY LOGIC ===
            const raceDate = new Date(race.date);
            const year = raceDate.getFullYear();
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
            const daysSinceRace = Math.floor((today.getTime() - raceDateOnly.getTime()) / (1000 * 60 * 60 * 24));
            const isWithin10Days = daysSinceRace >= 0 && daysSinceRace <= 10;
            const hasCompletedTime = race.time && race.time !== '00:00:00' && race.time.trim() !== '';

            let badgeAvenir = '';
            if (isToday) {
                if (hasCompletedTime) {
                    badgeAvenir = `<span class="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full animate-pulse">New !</span>`;
                } else {
                    badgeAvenir = `<span class="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full animate-pulse">En cours</span>`;
                }
            } else if (isUpcoming) {
                badgeAvenir = `<span class="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full animate-pulse">À venir</span>`;
            }

            if (!isUpcoming && hasCompletedTime && isWithin10Days) {
                badgeAvenir = `<span class="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full animate-pulse">New !</span>`;
            }

            const hasBadges = false;

            const raceCard = document.createElement('div');
            raceCard.className = 'bg-white rounded-xl overflow-hidden shadow-md card-hover relative group';

            raceCard.innerHTML = `
                <div class="p-6 relative">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold text-green-800 mb-1 flex items-center gap-2">
                                <!-- Étoile favori cachée pour le public -->
                                ${race.name || 'Course'} ${badgeAvenir}
                            </h3>
                            <p class="text-green-600 capitalize">
                                <!-- Date formatée: Mois Année uniquement -->
                                ${raceDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <!-- Année cachée dans le coin (ou doublon inutile si on met Mois Année en dessous) 
                             On peut la laisser ou l'enlever. Demandé: "Numéro de date précise caché". 
                             Si je cache le jour, je garde Mois + Année. 
                             Le "Badge Année" en haut à droite est redondant mais stylé. Je le garde ou l'enlève selon le souhait.
                             "Numéro de date précise" -> Je suppose qu'il parle du jour (ex: "02").
                             On garde l'année en haut à droite pour le style ?
                             "numero de date precise" -> je retire le jour.
                        -->
                    </div>

                    <div class="mt-4 flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                            <span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full">
                                <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6h16M4 12h16M4 18h16'/></svg>
                                ${race.distance || '0'} km
                            </span>
                            <span class="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-800 text-xs rounded-full">
                                <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 17l6-6 4 4 6-6'/></svg>
                                +${race.elevation || '0'} m
                            </span>
                            <!-- Lieu caché pour le public -->
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-4 pt-3 flex items-center justify-between border-t border-green-50">
                        <span class="text-xs text-gray-500 flex items-center gap-2" title="${ownerPseudo}">
                            <i class="fas fa-user-circle text-green-600 text-lg"></i>
                            <span class="truncate max-w-[150px] font-semibold">${ownerPseudo}</span>
                        </span>
                        ${race.time ? `<span class="text-sm font-bold text-green-700 font-mono">${race.time}</span>` : ''}
                    </div>

                    <!-- Image -->
                    <div class="absolute bottom-3 right-3 h-28 w-28 group-hover:scale-105 transition-transform duration-300">
                        ${hasBadges ? `
                        <div class="absolute -top-3 -right-3 z-20 filter drop-shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                             <div class="relative scale-75">
                                 <!-- Badge UI -->
                                 <div class="relative bg-white text-blue-900 rounded-full w-8 h-8 flex items-center justify-center border-4 border-red-600 shadow-md z-10">
                                     <div class="bg-blue-800 rounded-full w-3 h-3"></div>
                                 </div>
                             </div>
                        </div>
                        ` : ''}
                        
                        ${race.photo ?
                    `<img src="${race.photo}" alt="Photo course" class="h-full w-full object-cover rounded-lg shadow-md border border-green-200" />`
                    :
                    `<div class="h-full w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <p class="mt-1 text-xs text-gray-400">Aucune image</p>
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
        isLoadingPublicRaces = false;
    }
}
