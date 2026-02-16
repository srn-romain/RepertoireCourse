/**
 * js/admin-modal.js
 * Admin Portal Modal for Statistics and Map
 */

const adminModalHTML = `
<div id="adminModal" class="modal hidden fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-6 w-full max-w-5xl m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300 max-h-[90vh] overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-6 border-b pb-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <i class="fas fa-user-shield text-xl"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Portail Administrateur</h2>
                    <p class="text-xs text-gray-500">Statistiques globales et cartographie</p>
                </div>
            </div>
            <button onclick="closeAdminModal()" class="text-gray-400 hover:text-gray-600 transition p-2">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>

        <div id="adminStatsContent">
            <!-- FILTRES ADMIN -->
            <div class="flex justify-center gap-2 mb-6">
                <button onclick="updateAdminStatsFilter('all')" id="btnAdminFilterAll"
                    class="px-3 py-1 text-sm rounded-full bg-red-600 text-white font-bold transition shadow-sm">Tout</button>
                <button onclick="updateAdminStatsFilter('past')" id="btnAdminFilterPast"
                    class="px-3 py-1 text-sm rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition shadow-sm">Courses passées</button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Utilisateurs -->
                <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100 shadow-sm">
                    <p class="text-2xl font-bold text-blue-600" id="adminStatTotalUsers">0</p>
                    <p class="text-[10px] uppercase tracking-wider text-blue-800 font-bold mt-1">Inscrits</p>
                </div>
                <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100 shadow-sm">
                    <p class="text-2xl font-bold text-green-600" id="adminStatActiveUsers">0</p>
                    <p class="text-[10px] uppercase tracking-wider text-green-800 font-bold mt-1">Actifs</p>
                </div>

                <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-100 shadow-sm col-span-2 md:col-span-1">
                    <p class="text-2xl font-bold text-purple-600" id="adminStatTotalRaces">0</p>
                    <p class="text-[10px] uppercase tracking-wider text-purple-800 font-bold mt-1">Courses Totales</p>
                </div>

                <!-- Distances -->
                <div class="bg-red-50 rounded-xl p-4 text-center border border-red-100 shadow-sm">
                    <p class="text-2xl font-bold text-red-600" id="adminStatTotalKm">0</p>
                    <p class="text-[10px] uppercase tracking-wider text-red-800 font-bold mt-1">Km Totaux</p>
                </div>
                <div class="bg-orange-50 rounded-xl p-4 text-center border border-orange-100 shadow-sm">
                    <p class="text-2xl font-bold text-orange-600" id="adminStatTotalElevation">0</p>
                    <p class="text-[10px] uppercase tracking-wider text-orange-800 font-bold mt-1">D+ Total (m)</p>
                </div>

                <!-- Moyennes & Engagement -->
                <div class="bg-teal-50 rounded-xl p-4 text-center border border-teal-100 shadow-sm text-xs col-span-2 md:col-span-1">
                    <div class="flex flex-col h-full justify-center">
                        <p class="font-bold text-teal-700 mb-1">Engagement</p>
                        <p class="text-gray-600"><span id="adminStatUsersWithWishlist" class="font-bold text-teal-600">0</span> users avec wishlist</p>
                        <p class="text-[10px] text-gray-500"><span id="adminStatAvgWishlistItems">0</span> items (moy.)</p>
                    </div>
                </div>

                <!-- Price/Time -->
                <div class="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 shadow-sm text-xs">
                    <div class="flex flex-col h-full justify-center">
                        <p><span class="font-bold text-gray-700">Prix :</span> <span id="adminStatPrice">0 €</span></p>
                        <p><span class="font-bold text-gray-700">Temps :</span> <span id="adminStatTime">0h</span></p>
                        <p><span class="font-bold text-gray-700">Départ :</span> <span id="adminStatStartHour">N/A</span></p>
                    </div>
                </div>

                <!-- Commentaires -->
                <div class="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100 shadow-sm text-xs col-span-2 md:col-span-1">
                    <div class="flex flex-col h-full justify-center">
                        <p class="font-bold text-yellow-700 mb-1">Commentaires</p>
                        <p class="text-gray-600"><span id="adminStatUsersWithComments" class="font-bold text-yellow-600">0</span> users avec commentaires</p>
                        <p class="text-[10px] text-yellow-800 italic mt-1 font-medium">dans ses courses</p>
                    </div>
                </div>
            </div>

            <!-- Terrain & Connection Timeline -->
            <div class="grid md:grid-cols-2 gap-4 mt-4">
                <div class="bg-white border rounded-xl p-4 shadow-sm">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Répartition Terrain</h4>
                    <div id="adminStatTerrainBar" class="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex mb-3">
                        <!-- Bars injected by JS -->
                    </div>
                    <div id="adminStatTerrainLegend" class="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] mb-6">
                        <!-- Legend injected by JS -->
                    </div>

                    <!-- VISIBILITÉ & TYPE -->
                    <div class="border-t pt-4">
                        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Visibilité & Type</h4>
                        <div class="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p class="text-xl font-bold text-indigo-600" id="adminStatPublicRacesCount">0</p>
                                <p class="text-[9px] text-gray-500 uppercase">Publics</p>
                            </div>
                            <div>
                                <p class="text-xl font-bold text-gray-600" id="adminStatPrivateRaces">0</p>
                                <p class="text-[9px] text-gray-500 uppercase">Privés</p>
                            </div>
                            <div>
                                <p class="text-xl font-bold text-yellow-600" id="adminStatUpcomingRaces">0</p>
                                <p class="text-[9px] text-gray-500 uppercase">À venir</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white border rounded-xl p-4 shadow-sm">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 italic">Dernières connexions</h4>
                    <div id="adminStatLastLogin" class="space-y-1">
                        <div class="flex justify-center py-2">
                             <i class="fas fa-circle-notch fa-spin text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CARTE ADMIN -->
            <div class="mt-6 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                <div class="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                    <h4 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <i class="fas fa-map-marked-alt text-red-500"></i> Répartition Géographique
                    </h4>
                    <p id="mapLoadingStatus" class="text-[10px] text-gray-400 italic">En attente...</p>
                </div>
                <div id="adminRacesMap" class="w-full h-80 bg-gray-50 z-0"></div>
            </div>
        </div>
    </div>
</div>
`;

let adminMap = null;
let currentAdminFilter = 'all';
let geoCache = {};

function initAdminModal() {
    if (!document.getElementById('adminModal')) {
        const div = document.createElement('div');
        div.innerHTML = adminModalHTML;
        document.body.appendChild(div);

        // Load Cache
        try {
            geoCache = JSON.parse(localStorage.getItem('raceLocationGeoCache_v3') || '{}');
        } catch (e) {
            geoCache = {};
        }
    }
}

window.openAdminModal = async function () {
    const modal = document.getElementById('adminModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    await loadAdminStatsData();
};

window.closeAdminModal = function () {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
};

window.updateAdminStatsFilter = async function (filter) {
    currentAdminFilter = filter;
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
    await loadAdminStatsData();
};

const ADMIN_STAT_IDS = [
    'adminStatTotalUsers', 'adminStatActiveUsers',
    'adminStatTotalRaces', 'adminStatPublicRacesCount', 'adminStatPrivateRaces', 'adminStatUpcomingRaces',
    'adminStatTotalKm', 'adminStatTotalElevation',
    'adminStatAvgRacesPerUser', 'adminStatAvgWishlistItems', 'adminStatUsersWithWishlist',
    'adminStatLastLogin', 'adminStatPrice',
    'adminStatTime', 'adminStatStartHour'
];

function setAdminStatsLoading(isLoading) {
    ADMIN_STAT_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && isLoading) {
            el.innerHTML = '<i class="fas fa-circle-notch fa-spin text-gray-200 text-sm"></i>';
        }
    });
}

async function loadAdminStatsData() {
    if (typeof window.isAdminUser !== 'function') return;
    const isAdmin = await window.isAdminUser();
    if (!isAdmin) return;

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
            totalKm: 0,
            totalElevation: 0,
            averageRacesPerUser: 0,
            usersWithWishlist: 0,
            usersWithComments: 0,
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
        const usersWithCommentsSet = new Set();
        usersSnapshot.forEach(doc => {
            stats.totalUsers++;
            userRaceCount[doc.id] = 0;
            const d = doc.data();
            userNames[doc.id] = d.pseudo || d.email || 'Utilisateur';
        });

        const locationUsersMap = {};

        allRacesSnapshot.forEach(doc => {
            const race = doc.data();
            if (race.deleted) return;
            const userId = doc.ref.parent.parent?.id;

            const raceDate = new Date(race.date);
            raceDate.setHours(0, 0, 0, 0);

            if (currentAdminFilter === 'past' && raceDate >= today) return;

            stats.totalRaces++;
            if (userId && userRaceCount.hasOwnProperty(userId)) userRaceCount[userId]++;

            if (race.notes && race.notes.trim() !== '' && userId) {
                usersWithCommentsSet.add(userId);
            }

            if (raceDate >= today) {
                stats.upcomingRaces++;
            } else {
                if (race.public === true) stats.publicRaces++; else stats.privateRaces++;
            }

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
                stats.totalTimeSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
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

            if (race.location && typeof race.location === 'string' && race.location.trim().length > 2) {
                const loc = race.location.trim();
                const uName = userNames[userId];
                if (uName) {
                    if (!locationUsersMap[loc]) locationUsersMap[loc] = new Set();
                    locationUsersMap[loc].add(uName);
                }
            }
        });

        Object.values(userRaceCount).forEach(count => { if (count > 0) stats.activeUsers++; });
        if (stats.activeUsers > 0) stats.averageRacesPerUser = (stats.totalRaces / stats.activeUsers).toFixed(1);

        // Wishlists
        const wishlistPromises = [];
        for (const uid of Object.keys(userRaceCount)) {
            wishlistPromises.push(db.collection('users').doc(uid).collection('wishlist').get().then(s => s.size));
        }
        const wCounts = await Promise.all(wishlistPromises);
        stats.usersWithWishlist = wCounts.filter(c => c > 0).length;
        const totalWItems = wCounts.reduce((a, b) => a + b, 0);
        const avgWItems = stats.usersWithWishlist > 0 ? (totalWItems / stats.usersWithWishlist).toFixed(1) : 0;
        stats.usersWithComments = usersWithCommentsSet.size;

        // Last 5 Logins
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
        allLogins.sort((a, b) => b.date - a.date);
        const last5Logins = allLogins.slice(0, 5);

        // UI Updates
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('adminStatTotalUsers', stats.totalUsers.toLocaleString());
        setText('adminStatActiveUsers', stats.activeUsers.toLocaleString());
        setText('adminStatTotalRaces', stats.totalRaces.toLocaleString());
        setText('adminStatPublicRacesCount', stats.publicRaces.toLocaleString());
        setText('adminStatPrivateRaces', stats.privateRaces.toLocaleString());
        setText('adminStatUpcomingRaces', stats.upcomingRaces.toLocaleString());
        setText('adminStatTotalKm', Math.round(stats.totalKm).toLocaleString());
        setText('adminStatTotalElevation', Math.round(stats.totalElevation).toLocaleString());
        setText('adminStatAvgRacesPerUser', stats.averageRacesPerUser);
        setText('adminStatUsersWithWishlist', stats.usersWithWishlist.toLocaleString());
        setText('adminStatAvgWishlistItems', avgWItems);
        setText('adminStatUsersWithComments', stats.usersWithComments.toLocaleString());

        const avgPrice = stats.priceCount > 0 ? (stats.totalPrice / stats.priceCount).toFixed(2) + ' €' : '0 €';
        setText('adminStatPrice', avgPrice);

        let avgTimeStr = "0h";
        if (stats.timeCount > 0) {
            const avgSecs = Math.round(stats.totalTimeSeconds / stats.timeCount);
            avgTimeStr = `${Math.floor(avgSecs / 3600)}h${Math.floor((avgSecs % 3600) / 60).toString().padStart(2, '0')}`;
        }
        setText('adminStatTime', avgTimeStr);

        let favStart = "N/A";
        if (stats.startHourCount > 0) {
            const avgMins = Math.round(stats.totalStartMinutes / stats.startHourCount);
            favStart = `${Math.floor(avgMins / 60)}h${(avgMins % 60).toString().padStart(2, '0')}`;
        }
        setText('adminStatStartHour', favStart);

        const elTerrainBar = document.getElementById('adminStatTerrainBar');
        const elTerrainLegend = document.getElementById('adminStatTerrainLegend');
        if (elTerrainBar && elTerrainLegend) {
            const sortedT = Object.entries(stats.terrains).sort((a, b) => b[1] - a[1]);
            const totalT = Object.values(stats.terrains).reduce((a, b) => a + b, 0);

            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];
            elTerrainBar.innerHTML = '';
            elTerrainLegend.innerHTML = '';

            sortedT.forEach(([t, c], idx) => {
                const pct = (c / totalT) * 100;
                const color = colors[idx % colors.length];

                // Add segment to bar
                const segment = document.createElement('div');
                segment.style.width = `${pct}%`;
                segment.style.backgroundColor = color;
                segment.title = `${t}: ${Math.round(pct)}%`;
                elTerrainBar.appendChild(segment);

                // Add legend item
                const legendItem = document.createElement('div');
                legendItem.className = 'flex items-center gap-1';
                legendItem.innerHTML = `
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${color}"></span>
                    <span class="text-gray-600 truncate">${t.charAt(0).toUpperCase() + t.slice(1)}</span>
                    <span class="font-bold text-gray-800 ml-auto">${Math.round(pct)}%</span>
                `;
                elTerrainLegend.appendChild(legendItem);
            });

            if (sortedT.length === 0) {
                elTerrainBar.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">N/A</div>';
                elTerrainLegend.innerHTML = '<div class="col-span-2 text-center text-gray-400">Aucune donnée</div>';
            }
        }

        const elLastLogin = document.getElementById('adminStatLastLogin');
        if (elLastLogin) {
            elLastLogin.innerHTML = last5Logins.map(l => `
                <div class="text-xs border-b border-gray-100 last:border-0 py-1 flex items-center gap-2 px-2">
                    ${l.photoURL ? `<img src="${l.photoURL}" class="w-5 h-5 rounded-full object-cover border">` : `<i class="fas fa-user-circle text-blue-400"></i>`}
                    <div class="flex flex-col items-start leading-tight">
                        <span class="font-semibold text-blue-600">${l.user}</span> 
                        <span class="text-[9px] text-gray-400">${l.date.toLocaleString()}</span>
                    </div>
                </div>`).join('') || "-";
        }

        initAdminMap(locationUsersMap);

    } catch (error) {
        console.error('Erreur stats admin:', error);
    }
}

async function initAdminMap(locationData) {
    if (typeof L === 'undefined') return;
    const mapContainer = document.getElementById('adminRacesMap');
    if (!mapContainer) return;

    if (!adminMap) {
        adminMap = L.map('adminRacesMap', { worldCopyJump: true }).setView([46.60, 1.88], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(adminMap);
    } else {
        adminMap.eachLayer(layer => { if (layer instanceof L.CircleMarker || layer instanceof L.Marker) adminMap.removeLayer(layer); });
        adminMap.invalidateSize();
    }

    const locations = Object.keys(locationData);
    const statusEl = document.getElementById('mapLoadingStatus');
    const dotIcon = L.divIcon({ className: 'bg-transparent', html: `<div style="background-color: #ef4444; width: 10px; height: 10px; border-radius: 50%; border: 1px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`, iconSize: [10, 10], iconAnchor: [5, 5] });

    for (const locationName of locations) {
        let coords = geoCache[locationName.toLowerCase().trim()];
        if (!coords) {
            if (statusEl) statusEl.textContent = `Géocodage : ${locationName}...`;
            try {
                await new Promise(res => setTimeout(res, 1000));
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                        geoCache[locationName.toLowerCase().trim()] = coords;
                        localStorage.setItem('raceLocationGeoCache_v3', JSON.stringify(geoCache));
                    }
                }
            } catch (e) { console.warn(e); }
        }
        if (coords) {
            const users = Array.from(locationData[locationName]).join(', ');
            L.marker([coords.lat, coords.lon], { icon: dotIcon })
                .bindPopup(`<b>${locationName.toUpperCase()}</b><br><span class="text-xs">${users}</span>`)
                .addTo(adminMap);
        }
    }
    if (statusEl) statusEl.textContent = `Carte prête (${locations.length} lieux)`;
}

document.addEventListener('DOMContentLoaded', initAdminModal);
