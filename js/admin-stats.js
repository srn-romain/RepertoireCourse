/**
 * js/admin-stats.js
 * Affichage des statistiques administrateur sur la page index.html
 */

let currentAdminFilter = 'all'; // 'all' ou 'past'

// Liste des IDs des éléments de stats pour le loading
const ADMIN_STAT_IDS = [
    'adminStatTotalUsers', 'adminStatActiveUsers',
    'adminStatTotalRaces', 'adminStatPublicRaces', 'adminStatPrivateRaces',
    'adminStatUpcomingRaces', 'adminStatPastRaces',
    'adminStatTotalKm', 'adminStatTotalElevation',
    'adminStatAvgRacesPerUser',
    'adminStatUsersWithWishlist', 'adminStatAvgWishlistItems',
    'adminStatLastLogin',
    'adminStatTerrain', 'adminStatPrice', 'adminStatTime', 'adminStatStartHour'
];

// Fonction pour afficher/masquer le chargement sur les cartes
function setAdminStatsLoading(isLoading) {
    ADMIN_STAT_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && isLoading) {
            // On met un spinner gris discret
            el.innerHTML = '<i class="fas fa-circle-notch fa-spin text-gray-300 text-sm"></i>';
        }
    });
}

// Fonction globale pour changer le filtre
window.updateAdminStatsFilter = async function (filter) {
    currentAdminFilter = filter;

    const btnAll = document.getElementById('btnAdminFilterAll');
    const btnPast = document.getElementById('btnAdminFilterPast');
    const buttons = [btnAll, btnPast].filter(b => b); // Filtrer si null

    // 1. Mise à jour visuelle immédiate des boutons (Style Actif/Inactif)
    if (btnAll && btnPast) {
        if (filter === 'all') {
            btnAll.className = 'px-3 py-1 text-sm rounded-full bg-red-600 text-white font-bold transition shadow-sm';
            btnPast.className = 'px-3 py-1 text-sm rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm';
        } else {
            btnAll.className = 'px-3 py-1 text-sm rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm';
            btnPast.className = 'px-3 py-1 text-sm rounded-full bg-red-600 text-white font-bold transition shadow-sm';
        }
    }

    // 2. Geler les boutons (UI Loading State)
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });

    // 3. Charger les stats (avec loading visible)
    await loadAdminStats();

    // 4. Dégeler les boutons
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
};

async function loadAdminStats() {
    // Vérifier si l'utilisateur est admin
    if (typeof window.isAdminUser !== 'function') {
        return;
    }

    // Note: isAdminUser peut prendre un peu de temps, mais on ne veut pas montrer le bloc loading avant de savoir
    const isAdmin = await window.isAdminUser();
    if (!isAdmin) {
        return;
    }

    // Afficher la section admin
    const adminSection = document.getElementById('adminStatsSection');
    if (!adminSection) {
        return;
    }
    adminSection.classList.remove('hidden');

    // DÉBUT DU CHARGEMENT VISUEL
    setAdminStatsLoading(true);

    try {
        // Récupérer toutes les courses publiques de tous les utilisateurs
        const allRacesSnapshot = await db.collectionGroup('races').get();

        // Récupérer tous les utilisateurs
        const usersSnapshot = await db.collection('users').get();

        // Initialiser l'objet de stats
        const stats = {
            totalUsers: 0,
            activeUsers: 0,
            totalRaces: 0,
            publicRaces: 0,
            privateRaces: 0,
            upcomingRaces: 0,
            pastRaces: 0,
            totalKm: 0,
            totalElevation: 0,
            averageRacesPerUser: 0,
            usersWithWishlist: 0,
            // New Stats
            totalPrice: 0,
            priceCount: 0,
            totalTimeSeconds: 0,
            timeCount: 0,
            terrains: {},
            totalStartMinutes: 0,
            startHourCount: 0
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Compter les utilisateurs
        const userRaceCount = {};
        usersSnapshot.forEach(doc => {
            stats.totalUsers++;
            userRaceCount[doc.id] = 0;
        });

        // Analyser les courses
        allRacesSnapshot.forEach(doc => {
            const race = doc.data();
            const userId = doc.ref.parent.parent?.id;

            // --- FILTRAGE ---
            const raceDate = new Date(race.date);
            raceDate.setHours(0, 0, 0, 0);

            if (currentAdminFilter === 'past') {
                if (raceDate >= today) return;
            }

            // Si on passe le filtre, on compte
            stats.totalRaces++;

            if (userId && userRaceCount.hasOwnProperty(userId)) {
                userRaceCount[userId]++;
            }

            // Public/Private
            if (race.public === true) {
                stats.publicRaces++;
            } else {
                stats.privateRaces++;
            }

            // Upcoming/Past
            if (raceDate >= today) {
                stats.upcomingRaces++;
            } else {
                stats.pastRaces++;
            }

            // Distance et dénivelé
            if (race.distance) {
                const dist = parseFloat(race.distance.toString().replace(',', '.'));
                if (!isNaN(dist)) {
                    stats.totalKm += dist;
                }
            }

            if (race.elevation) {
                const elev = parseFloat(race.elevation.toString().replace(',', '.'));
                if (!isNaN(elev)) {
                    stats.totalElevation += elev;
                }
            }

            // --- NOUVELLES STATS ---

            // 1. Terrain
            if (race.terrain) {
                const t = race.terrain.trim().toLowerCase();
                if (t) stats.terrains[t] = (stats.terrains[t] || 0) + 1;
            }

            // 2. Prix
            if (race.price) {
                const p = parseFloat(race.price);
                if (!isNaN(p)) {
                    stats.totalPrice += p;
                    stats.priceCount++;
                }
            }

            // 3. Temps de course (Durée)
            if (race.time && /^\d{2}:\d{2}:\d{2}$/.test(race.time)) {
                const parts = race.time.split(':');
                const secs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                stats.totalTimeSeconds += secs;
                stats.timeCount++;
            }

            // 4. Heure de départ (race.hour)
            if (race.hour) {
                const parts = race.hour.split(':');
                if (parts.length >= 2) {
                    const h = parseInt(parts[0]);
                    const m = parseInt(parts[1]);
                    if (!isNaN(h) && !isNaN(m)) {
                        stats.totalStartMinutes += (h * 60) + m;
                        stats.startHourCount++;
                    }
                }
            }
        });

        // Compter les utilisateurs actifs
        Object.values(userRaceCount).forEach(count => {
            if (count > 0) {
                stats.activeUsers++;
            }
        });

        // Moyenne de courses par utilisateur actif
        if (stats.activeUsers > 0) {
            stats.averageRacesPerUser = (stats.totalRaces / stats.activeUsers).toFixed(1);
        }

        // Compter les utilisateurs avec wishlist
        const wishlistPromises = [];
        for (const uid of Object.keys(userRaceCount)) {
            wishlistPromises.push(
                db.collection('users').doc(uid).collection('wishlist').get()
                    .then(snapshot => snapshot.size)
            );
        }
        const wishlistCounts = await Promise.all(wishlistPromises);
        stats.usersWithWishlist = wishlistCounts.filter(count => count > 0).length;

        // Calculer la moyenne d'items par wishlist
        const totalWishlistItems = wishlistCounts.reduce((sum, count) => sum + count, 0);
        const avgWishlistItems = stats.usersWithWishlist > 0
            ? (totalWishlistItems / stats.usersWithWishlist).toFixed(1)
            : 0;

        // Statistiques temporelles utilisateurs
        let lastLoginDate = null;
        let lastLoginUser = null;

        usersSnapshot.forEach(doc => {
            const userData = doc.data();

            // Exclure l'admin des stats de dernière connexion
            if (userData.role === 'admin') return;

            if (userData.lastLogin) {
                const loginDate = userData.lastLogin.toDate ? userData.lastLogin.toDate() : new Date(userData.lastLogin);
                if (!lastLoginDate || loginDate > lastLoginDate) {
                    lastLoginDate = loginDate;
                    lastLoginUser = userData.pseudo || userData.email?.split('@')[0] || 'Utilisateur';
                }
            }
        });

        // --- CALCULS FINAUX NOUVELLES STATS ---

        // Top Terrain -> Répartition % (Liste complète directe)
        let topTerrainFull = "N/A";
        const totalTerrains = Object.values(stats.terrains).reduce((a, b) => a + b, 0);

        if (totalTerrains > 0) {
            const sortedTerrains = Object.entries(stats.terrains).sort((a, b) => b[1] - a[1]);
            // Format: "Route (60%), Trail (40%)"
            const parts = sortedTerrains.map(([t, count]) => {
                const pct = Math.round((count / totalTerrains) * 100);
                return `${t.charAt(0).toUpperCase() + t.slice(1)} (${pct}%)`;
            });
            topTerrainFull = parts.join(', '); // La liste complète
        }

        // Prix Moyen
        const avgPrice = stats.priceCount > 0 ? (stats.totalPrice / stats.priceCount).toFixed(2) + ' €' : '0 €';

        // Temps Moyen
        let avgTimeStr = "0h";
        if (stats.timeCount > 0) {
            const avgSecs = Math.round(stats.totalTimeSeconds / stats.timeCount);
            const hrs = Math.floor(avgSecs / 3600);
            const mins = Math.floor((avgSecs % 3600) / 60);
            avgTimeStr = `${hrs}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
        }

        // Heure Moyenne
        let favStart = "N/A";
        if (stats.startHourCount > 0) {
            const avgMins = Math.round(stats.totalStartMinutes / stats.startHourCount);
            const h = Math.floor(avgMins / 60);
            const m = avgMins % 60;
            favStart = `${h}h${m.toString().padStart(2, '0')}`;
        }

        // Formater les dates
        const formatDate = (date, name) => {
            if (!date) return 'Aucune donnée';
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let timeAgo = '';
            if (diffMins < 1) timeAgo = "À l'instant";
            else if (diffMins < 60) timeAgo = `Il y a ${diffMins} min`;
            else if (diffHours < 24) timeAgo = `Il y a ${diffHours}h`;
            else if (diffDays < 7) timeAgo = `Il y a ${diffDays}j`;
            else timeAgo = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

            return name ? `${timeAgo} (${name})` : timeAgo;
        };

        // --- AFFICHAGE (Remplacement des spinners par les valeurs) ---

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setText('adminStatTotalUsers', stats.totalUsers.toLocaleString('fr-FR'));
        setText('adminStatActiveUsers', stats.activeUsers.toLocaleString('fr-FR'));
        setText('adminStatTotalRaces', stats.totalRaces.toLocaleString('fr-FR'));
        setText('adminStatPublicRaces', stats.publicRaces.toLocaleString('fr-FR'));
        setText('adminStatPrivateRaces', stats.privateRaces.toLocaleString('fr-FR'));
        setText('adminStatUpcomingRaces', stats.upcomingRaces.toLocaleString('fr-FR'));
        setText('adminStatPastRaces', stats.pastRaces.toLocaleString('fr-FR'));
        setText('adminStatTotalKm', Math.round(stats.totalKm).toLocaleString('fr-FR'));
        setText('adminStatTotalElevation', Math.round(stats.totalElevation).toLocaleString('fr-FR'));
        setText('adminStatAvgRacesPerUser', stats.averageRacesPerUser);

        // New stats DOM update
        const elTerrain = document.getElementById('adminStatTerrain');
        const elPrice = document.getElementById('adminStatPrice');
        const elTime = document.getElementById('adminStatTime');
        const elStartHour = document.getElementById('adminStatStartHour');

        if (elTerrain) {
            elTerrain.textContent = topTerrainFull;
            elTerrain.className = "text-xs font-bold text-gray-800 break-words";
        }

        if (elPrice) elPrice.textContent = avgPrice;
        if (elTime) elTime.textContent = avgTimeStr;
        if (elStartHour) elStartHour.textContent = favStart;

        setText('adminStatUsersWithWishlist', stats.usersWithWishlist.toLocaleString('fr-FR'));
        setText('adminStatAvgWishlistItems', avgWishlistItems);
        setText('adminStatLastLogin', formatDate(lastLoginDate, lastLoginUser));

    } catch (error) {
        console.error('Erreur lors du chargement des statistiques admin:', error);
        // En cas d'erreur, on pourrait retirer les spinners ou afficher "Erreur"
    }
}

// Charger les stats admin au chargement de la page initial
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    loadAdminStats();
                }
            });
        }
    }, 500);
});
