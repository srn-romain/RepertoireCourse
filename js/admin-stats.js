/**
 * js/admin-stats.js
 * Affichage des statistiques administrateur sur la page index.html
 */

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
            usersWithWishlist: 0
        };

        // Compter les utilisateurs
        const userRaceCount = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        usersSnapshot.forEach(doc => {
            stats.totalUsers++;
            userRaceCount[doc.id] = 0;
        });

        // Analyser les courses
        allRacesSnapshot.forEach(doc => {
            const race = doc.data();
            const userId = doc.ref.parent.parent?.id;

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
            const raceDate = new Date(race.date);
            raceDate.setHours(0, 0, 0, 0);
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

        // Compter les utilisateurs avec wishlist et calculer la moyenne d'items
        const wishlistPromises = [];
        for (const uid of Object.keys(userRaceCount)) {
            wishlistPromises.push(
                db.collection('users').doc(uid).collection('wishlist').get()
                    .then(snapshot => snapshot.size)
            );
        }
        const wishlistCounts = await Promise.all(wishlistPromises);
        stats.usersWithWishlist = wishlistCounts.filter(count => count > 0).length;

        // Calculer la moyenne d'items par wishlist (seulement pour ceux qui ont une wishlist)
        const totalWishlistItems = wishlistCounts.reduce((sum, count) => sum + count, 0);
        const avgWishlistItems = stats.usersWithWishlist > 0
            ? (totalWishlistItems / stats.usersWithWishlist).toFixed(1)
            : 0;

        // Statistiques temporelles
        let lastLoginDate = null;
        let lastLoginUser = null;

        // Parcourir tous les utilisateurs pour trouver la dernière connexion
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.lastLogin) {
                const loginDate = userData.lastLogin.toDate ? userData.lastLogin.toDate() : new Date(userData.lastLogin);
                if (!lastLoginDate || loginDate > lastLoginDate) {
                    lastLoginDate = loginDate;
                    lastLoginUser = userData.pseudo || userData.email?.split('@')[0] || 'Utilisateur';
                }
            }
        });

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

        console.log('Admin Stats:', {
            totalUsers: stats.totalUsers,
            activeUsers: stats.activeUsers,
            totalRaces: stats.totalRaces,
            publicRaces: stats.publicRaces,
            usersWithWishlist: stats.usersWithWishlist,
            avgWishlistItems,
            lastLoginDate,
            lastLoginUser
        });

        // Afficher les statistiques
        document.getElementById('adminStatTotalUsers').textContent = stats.totalUsers.toLocaleString('fr-FR');
        document.getElementById('adminStatActiveUsers').textContent = stats.activeUsers.toLocaleString('fr-FR');
        document.getElementById('adminStatTotalRaces').textContent = stats.totalRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatPublicRaces').textContent = stats.publicRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatPrivateRaces').textContent = stats.privateRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatUpcomingRaces').textContent = stats.upcomingRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatPastRaces').textContent = stats.pastRaces.toLocaleString('fr-FR');
        document.getElementById('adminStatTotalKm').textContent = Math.round(stats.totalKm).toLocaleString('fr-FR');
        document.getElementById('adminStatTotalElevation').textContent = Math.round(stats.totalElevation).toLocaleString('fr-FR');
        document.getElementById('adminStatAvgRacesPerUser').textContent = stats.averageRacesPerUser;
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
