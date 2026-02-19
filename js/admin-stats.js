/**
 * js/admin-stats.js
 * Affichage des statistiques administrateur avec Carte OpenStreetMap
 */

let currentAdminFilter = 'all'; // 'all' ou 'past'

// Variables globales pour la carte
let adminMap = null;
let geoCache = {};

// Charger le cache au démarrage
try {
    geoCache = JSON.parse(localStorage.getItem('raceLocationGeoCache_v3') || '{}');
} catch (e) {
    geoCache = {};
}

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
    const buttons = [btnAll, btnPast].filter(b => b);

    // 1. Mise à jour visuelle immédiate
    if (btnAll && btnPast) {
        if (filter === 'all') {
            btnAll.className = 'px-3 py-1 text-sm rounded-full bg-red-600 text-white font-bold transition shadow-sm';
            btnPast.className = 'px-3 py-1 text-sm rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm';
        } else {
            btnAll.className = 'px-3 py-1 text-sm rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm';
            btnPast.className = 'px-3 py-1 text-sm rounded-full bg-red-600 text-white font-bold transition shadow-sm';
        }
    }

    // 2. Geler les boutons
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });

    // 3. Charger les stats
    await loadAdminStats();

    // 4. Dégeler les boutons
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
};

async function loadAdminStats() {
    if (typeof window.isAdminUser !== 'function') return;
    const isAdmin = await window.isAdminUser();
    if (!isAdmin) return;

    const adminSection = document.getElementById('adminStatsSection');
    if (!adminSection) return;
    adminSection.classList.remove('hidden');

    setAdminStatsLoading(true);

    try {
        const allRacesSnapshot = await db.collectionGroup('races').get();
        const usersSnapshot = await db.collection('users').get();

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

        const userRaceCount = {};
        const userNames = {};
        usersSnapshot.forEach(doc => {
            stats.totalUsers++;
            userRaceCount[doc.id] = 0;
            const d = doc.data();
            userNames[doc.id] = d.pseudo || d.email || 'Utilisateur';
        });

        // Map pour stocker les lieux et les utilisateurs associés : { "Paris": Set("User1", "User2") }
        const locationUsersMap = {};

        allRacesSnapshot.forEach(doc => {
            const race = doc.data();
            if (race.deleted) return; // Ignorer les courses supprimées
            const userId = doc.ref.parent.parent?.id;

            const raceDate = new Date(race.date);
            raceDate.setHours(0, 0, 0, 0);

            // --- FILTRE ---
            if (currentAdminFilter === 'past') {
                if (raceDate >= today) return;
            }

            // Stats de base
            stats.totalRaces++;
            if (userId && userRaceCount.hasOwnProperty(userId)) {
                userRaceCount[userId]++;
            }

            if (race.public === true) stats.publicRaces++; else stats.privateRaces++;
            if (raceDate >= today) stats.upcomingRaces++; else stats.pastRaces++;

            if (race.distance) {
                const dist = parseFloat(race.distance.toString().replace(',', '.'));
                if (!isNaN(dist)) stats.totalKm += dist;
            }
            if (race.elevation) {
                const elev = parseFloat(race.elevation.toString().replace(',', '.'));
                if (!isNaN(elev)) stats.totalElevation += elev;
            }

            if (race.terrain) {
                const t = race.terrain.trim().toLowerCase();
                if (t) stats.terrains[t] = (stats.terrains[t] || 0) + 1;
            }
            if (race.price) {
                const p = parseFloat(race.price);
                if (!isNaN(p)) { stats.totalPrice += p; stats.priceCount++; }
            }
            if (race.time && /^\d{2}:\d{2}:\d{2}$/.test(race.time)) {
                const parts = race.time.split(':');
                const secs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                stats.totalTimeSeconds += secs;
                stats.timeCount++;
            }
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

            // CARTE : Collecter les lieux
            // CARTE : Collecter les lieux et associer l'utilisateur
            if (race.location && typeof race.location === 'string' && race.location.trim().length > 2) {
                const loc = race.location.trim();
                const uName = userNames[userId];

                // N'afficher sur la carte que si l'utilisateur existe encore (pas de "fantôme")
                if (uName) {
                    if (!locationUsersMap[loc]) {
                        locationUsersMap[loc] = new Set();
                    }
                    locationUsersMap[loc].add(uName);
                }
            }
        });

        // Fin Calcul Users
        Object.values(userRaceCount).forEach(count => {
            if (count > 0) stats.activeUsers++;
        });
        if (stats.activeUsers > 0) {
            stats.averageRacesPerUser = (stats.totalRaces / stats.activeUsers).toFixed(1);
        }

        // Wishlists
        const wishlistPromises = [];
        for (const uid of Object.keys(userRaceCount)) {
            wishlistPromises.push(db.collection('users').doc(uid).collection('wishlist').get().then(s => s.size));
        }
        const wCounts = await Promise.all(wishlistPromises);
        stats.usersWithWishlist = wCounts.filter(c => c > 0).length;
        const totalWItems = wCounts.reduce((a, b) => a + b, 0);
        const avgWItems = stats.usersWithWishlist > 0 ? (totalWItems / stats.usersWithWishlist).toFixed(1) : 0;

        // Last 5 Logins (Exclure Admin)
        const allLogins = [];
        usersSnapshot.forEach(doc => {
            const u = doc.data();
            if (u.role === 'admin') return;
            if (u.lastLogin) {
                const d = u.lastLogin.toDate ? u.lastLogin.toDate() : new Date(u.lastLogin);
                const userName = u.pseudo || u.email?.split('@')[0] || 'User';
                const userPhoto = u.photoURL || null;
                allLogins.push({ date: d, user: userName, photoURL: userPhoto });
            }
        });

        // Trier par date décroissante
        allLogins.sort((a, b) => b.date - a.date);
        const last5Logins = allLogins.slice(0, 5);

        // --- PREPARATION AFFICHAGE ---

        // Terrain (Full list, small text)
        let topTerrainFull = "N/A";
        const totalTypes = Object.values(stats.terrains).reduce((a, b) => a + b, 0);
        if (totalTypes > 0) {
            const sorted = Object.entries(stats.terrains).sort((a, b) => b[1] - a[1]);
            topTerrainFull = sorted.map(([t, c]) => {
                const pct = Math.round((c / totalTypes) * 100);
                return `${t.charAt(0).toUpperCase() + t.slice(1)} (${pct}%)`;
            }).join(', ');
        }

        const avgPrice = stats.priceCount > 0 ? (stats.totalPrice / stats.priceCount).toFixed(2) + ' €' : '0 €';

        let avgTimeStr = "0h";
        if (stats.timeCount > 0) {
            const avgSecs = Math.round(stats.totalTimeSeconds / stats.timeCount);
            const hrs = Math.floor(avgSecs / 3600);
            const mins = Math.floor((avgSecs % 3600) / 60);
            avgTimeStr = `${hrs}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
        }

        let favStart = "N/A";
        if (stats.startHourCount > 0) {
            const avgMins = Math.round(stats.totalStartMinutes / stats.startHourCount);
            const h = Math.floor(avgMins / 60);
            const m = avgMins % 60;
            favStart = `${h}h${m.toString().padStart(2, '0')}`;
        }

        const formatFullDate = (date) => {
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        };

        // --- AFFICHAGE DOM ---
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        setText('adminStatTotalUsers', stats.totalUsers.toLocaleString());
        setText('adminStatActiveUsers', stats.activeUsers.toLocaleString());
        setText('adminStatTotalRaces', stats.totalRaces.toLocaleString());
        setText('adminStatPublicRaces', stats.publicRaces.toLocaleString());
        setText('adminStatPrivateRaces', stats.privateRaces.toLocaleString());
        setText('adminStatUpcomingRaces', stats.upcomingRaces.toLocaleString());
        setText('adminStatPastRaces', stats.pastRaces.toLocaleString());
        setText('adminStatTotalKm', Math.round(stats.totalKm).toLocaleString());
        setText('adminStatTotalElevation', Math.round(stats.totalElevation).toLocaleString());
        setText('adminStatAvgRacesPerUser', stats.averageRacesPerUser);
        setText('adminStatUsersWithWishlist', stats.usersWithWishlist.toLocaleString());
        setText('adminStatAvgWishlistItems', avgWItems);

        // Affichage des 5 dernières connexions
        const elLastLogin = document.getElementById('adminStatLastLogin');
        if (elLastLogin) {
            if (last5Logins.length > 0) {
                elLastLogin.innerHTML = last5Logins.map(l =>
                    `<div class="text-xs border-b border-gray-100 last:border-0 py-1 flex items-center gap-2 px-2">
                        ${l.photoURL ?
                        `<img src="${l.photoURL}" class="w-5 h-5 rounded-full object-cover border border-blue-100">` :
                        `<i class="fas fa-user-circle text-blue-400 text-base"></i>`
                    }
                        <div class="flex flex-col items-start leading-tight">
                            <span class="font-semibold text-blue-600">${l.user}</span> 
                            <span class="text-[10px] text-gray-400">${formatFullDate(l.date)}</span>
                        </div>
                    </div>`
                ).join('');
                elLastLogin.classList.remove('text-blue-600', 'font-bold', 'text-sm'); // Reset styles for list
                elLastLogin.classList.add('text-center');
            } else {
                elLastLogin.textContent = "-";
            }
        }

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

        // --- INITIALISER LA CARTE (Async) ---
        // On ne pèse pas sur le thread principal pour les stats, on charge la carte après
        initAdminMap(locationUsersMap);

    } catch (error) {
        console.error('Erreur stats admin:', error);
    }
}

// Fonction asynchrone pour gérer la carte et le géocodage progressif
async function initAdminMap(locationData) {
    // Vérifier si Leaflet est chargé
    if (typeof L === 'undefined') {
        const statusEl = document.getElementById('mapLoadingStatus');
        if (statusEl) statusEl.textContent = "Erreur : Leaflet non chargé.";
        return;
    }

    const mapId = 'adminRacesMap';
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer) return;

    // Extraire les noms de lieux
    const locations = Object.keys(locationData);

    // Status
    const statusEl = document.getElementById('mapLoadingStatus');
    if (statusEl) statusEl.textContent = `${locations.length} lieux détectés. Initialisation...`;

    // Init Map si pas encore fait
    if (!adminMap) {
        // Centre France approximatif, Zoom 5
        adminMap = L.map(mapId, { worldCopyJump: true }).setView([46.60, 1.88], 5);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 18
        }).addTo(adminMap);
    } else {
        // Nettoyer marqueurs existants
        adminMap.eachLayer(layer => {
            if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
                adminMap.removeLayer(layer);
            }
        });
    }

    let resolvedCount = 0;

    // Fonction Helper Delay
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Définir l'icône une seule fois
    const dotIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div style="background-color: #22c55e; width: 12px; height: 12px; border-radius: 50%; border: 2px solid green;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    // Boucle de traitement des lieux
    for (const locationName of locations) {
        let coords = geoCache[locationName.toLowerCase().trim()];

        if (!coords) {
            // Pas en cache -> Appel API Nominatim
            if (statusEl) statusEl.textContent = `Géocodage en cours : ${locationName}...`;

            try {
                // Rate limit : attendre 1.1s
                await delay(1100);

                // Recherche globale sans forcer la France pour supporter l'étranger
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
                const response = await fetch(url, {
                    headers: { 'User-Agent': 'CourseAppAdmin/1.0' } // Politess header
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                        // Save cache
                        geoCache[locationName.toLowerCase().trim()] = coords;
                        localStorage.setItem('raceLocationGeoCache_v3', JSON.stringify(geoCache));
                    }
                }
            } catch (e) {
                console.warn(`Erreur géocodage ${locationName}`, e);
            }
        }

        // Si on a des coordonnées, on affiche
        if (coords) {
            // Récupérer les utilisateurs pour ce lieu
            const usersSet = locationData[locationName];
            const usersList = usersSet ? Array.from(usersSet).join(', ') : '';

            // Utiliser L.marker avec divIcon pour supporter worldCopyJump (les vector layers ne sautent pas)
            L.marker([coords.lat, coords.lon], { icon: dotIcon })
                .bindPopup(`<b>${locationName.toUpperCase()}</b><br><span class="text-sm text-gray-600">${usersList}</span>`)
                .bindTooltip(`<b>${usersList}</b>`, {
                    direction: 'top',
                    offset: [0, -5],
                    className: 'px-2 py-1 bg-black text-white text-xs rounded shadow-lg border-0'
                })
                .addTo(adminMap);
            resolvedCount++;
        }
    }

    if (statusEl) statusEl.textContent = `Carte à jour : ${resolvedCount} lieux affichés.`;
}


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
