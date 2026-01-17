/**
 * js/admin-stats.js
 * Affichage des statistiques administrateur sur la page index.html
 */

let currentAdminFilter = 'all'; // 'all' ou 'past'

// Fonction globale pour changer le filtre
window.updateAdminStatsFilter = function (filter) {
    currentAdminFilter = filter;

    // Update UI Buttons
    const btnAll = document.getElementById('btnAdminFilterAll');
    const btnPast = document.getElementById('btnAdminFilterPast');

    if (btnAll && btnPast) {
        if (filter === 'all') {
            btnAll.className = 'px-3 py-1 text-sm rounded-full bg-red-600 text-white font-bold transition shadow-sm';
            btnPast.className = 'px-3 py-1 text-sm rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm';
        } else {
            btnAll.className = 'px-3 py-1 text-sm rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm';
            btnPast.className = 'px-3 py-1 text-sm rounded-full bg-red-600 text-white font-bold transition shadow-sm';
        }
    }

    // Reload stats
    loadAdminStats();
};

async function loadAdminStats() {
    // Vérifier si l'utilisateur est admin
    if (typeof window.isAdminUser !== 'function') {
        return;
    }

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

    try {
        // Récupérer toutes les courses publiques de tous les utilisateurs
        // Note: On récupère TOUT pour avoir les stats complètes, le filtrage se fera en JS
        const allRacesSnapshot = await db.collectionGroup('races').get();

        // Récupérer tous les utilisateurs
        const usersSnapshot = await db.collection('users').get();

        // Calculer les statistiques
        const stats = {
            totalUsers: 0,
            activeUsers: 0, // Utilisateurs ayant au moins une course
            totalRaces: 0,
            publicRaces: 0,
            privateRaces: 0,
            upcomingRaces: 0,
            pastRaces: 0,
            totalKm: 0,
            totalElevation: 0,
            averageRacesPerUser: 0,
            usersWithWishlist: 0,
            totalPrice: 0,
            priceCount: 0,
            totalTimeSeconds: 0,
            timeCount: 0,
            terrains: {},
            startHours: { 'Matin': 0, 'Midi': 0, 'Après-midi': 0, 'Soirée': 0 }
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Compter les utilisateurs (NON affecté par le filtre courses)
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
                // Si on filtre "Passées", on ignore les courses futures ou d'aujourd'hui
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

            // Upcoming/Past (toujours pertinent même si filtré "past", upcoming sera 0)
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

            // 3. Temps de course (Durée) - Format HH:MM:SS
            if (race.time && /^\d{2}:\d{2}:\d{2}$/.test(race.time)) {
                const parts = race.time.split(':');
                const secs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                stats.totalTimeSeconds += secs;
                stats.timeCount++;
            }

            // 4. Heure de départ (race.hour) - Format HH:MM
            if (race.hour) {
                const h = parseInt(race.hour.split(':')[0]);
                if (!isNaN(h)) {
                    if (h >= 5 && h < 12) stats.startHours['Matin']++;
                    else if (h >= 12 && h < 14) stats.startHours['Midi']++;
                    else if (h >= 14 && h < 18) stats.startHours['Après-midi']++;
                    else stats.startHours['Soirée']++; // 18-5 roughly (incluant nuit)
                }
            }
        });

        // Compter les utilisateurs actifs (basé sur les courses filtrées)
        Object.values(userRaceCount).forEach(count => {
            if (count > 0) {
                stats.activeUsers++;
            }
        });

        // Moyenne de courses par utilisateur actif
        if (stats.activeUsers > 0) {
            stats.averageRacesPerUser = (stats.totalRaces / stats.activeUsers).toFixed(1);
        }

        // Compter les utilisateurs avec wishlist (NON affecté par le filtre courses)
        // Note: C'est une opération lourde à répéter, mais acceptable pour admin.
        // Optimisation : On ne le fait qu'une fois ? Non, on laisse simple.
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

        // Statistiques temporelles utilisateurs (NON affecté)
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

        // Top Terrain
        let topTerrain = "N/A";
        let maxT = 0;
        for (const [t, count] of Object.entries(stats.terrains)) {
            if (count > maxT) {
                maxT = count;
                topTerrain = t.charAt(0).toUpperCase() + t.slice(1); // Capitalize
            }
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

        // Start Hour Fav
        let favStart = "N/A";
        let maxStart = 0;
        for (const [period, count] of Object.entries(stats.startHours)) {
            if (count > maxStart) {
                maxStart = count;
                favStart = period;
            }
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

        // Afficher les statistiques
        document.getElementById('adminStatTotalUsers').textContent = stats.totalUsers.toLocaleString('fr-FR');
        document.getElementById('adminStatActiveUsers').textContent = stats.activeUsers.toLocaleString('fr-FR');

        // Stats filtrables
        document.getElementById('adminStatTotalRaces').textContent = stats.totalRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatPublicRaces').textContent = stats.publicRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatPrivateRaces').textContent = stats.privateRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatUpcomingRaces').textContent = stats.upcomingRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatPastRaces').textContent = stats.pastRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatTotalKm').textContent = Math.round(stats.totalKm).toLocaleString('fr-FR');
        document.getElementById('adminStatTotalElevation').textContent = Math.round(stats.totalElevation).toLocaleString('fr-FR');
        document.getElementById('adminStatAvgRacesPerUser').textContent = stats.averageRacesPerUser;

        // New stats DOM update
        const elTerrain = document.getElementById('adminStatTerrain');
        const elPrice = document.getElementById('adminStatPrice');
        const elTime = document.getElementById('adminStatTime');
        const elStartHour = document.getElementById('adminStatStartHour');

        if (elTerrain) elTerrain.textContent = topTerrain;
        if (elPrice) elPrice.textContent = avgPrice;
        if (elTime) elTime.textContent = avgTimeStr;
        if (elStartHour) elStartHour.textContent = favStart;

        document.getElementById('adminStatUsersWithWishlist').textContent = stats.usersWithWishlist.toLocaleString('fr-FR');
        document.getElementById('adminStatAvgWishlistItems').textContent = avgWishlistItems;

        // Afficher les statistiques temporelles
        document.getElementById('adminStatLastLogin').textContent = formatDate(lastLoginDate, lastLoginUser);

    } catch (error) {
        console.error('Erreur lors du chargement des statistiques admin:', error);
        console.error('Stack:', error.stack);
    }
}

// Charger les stats admin au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que Firebase soit initialisé
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
