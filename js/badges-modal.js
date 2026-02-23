/**
 * Badges Modal Component
 * Externalized from dashboard.html
 */

const badgesModalHTML = `
    <!-- Modale de Badges -->
    <div id="badgesModal" class="fixed inset-0 flex items-center justify-center z-50 hidden modal">
        <div class="absolute inset-0 bg-black bg-opacity-50 blur-bg"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-6xl mx-4 z-10 flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50 rounded-t-xl">
                <h3 class="text-2xl font-bold text-purple-800 flex items-center gap-2">
                    <i class="fas fa-award"></i> Badges et Records
                </h3>
                <button id="closeBadgesModal" class="text-gray-500 hover:text-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div id="badgesContent" class="p-6 overflow-y-auto bg-gray-50 flex-grow rounded-b-xl">
                <!-- Le contenu sera généré dynamiquement -->
            </div>
        </div>
    </div>
`;

// Inject HTML into DOM and initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('badgesModal')) {
        const div = document.createElement('div');
        div.innerHTML = badgesModalHTML;
        document.body.appendChild(div);

        setupBadgesListeners();

        // Listener for badge items on cards or details
        document.addEventListener('click', function (e) {
            const badgeElement = e.target.closest('.detail-badge-item');
            if (badgeElement) {
                displayRaceBadgesModal();
            }
        });

        // Initial visibility check
        if (typeof updateBadgesButtonVisibility === 'function') {
            updateBadgesButtonVisibility();
        }
    }
});

/**
 * Update the visibility of the Badges button in the header
 */
function updateBadgesButtonVisibility() {
    const badgesBtn = document.getElementById('badgesBtn');
    if (!badgesBtn) return;

    // Check if authenticated (relying on global isAuthenticated)
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        badgesBtn.classList.add('hidden');
        return;
    }

    // Calculate badges if necessary
    if (typeof races !== 'undefined') {
        window.raceBadges = calculateRaceBadges(races);
    }

    const badgesList = window.raceBadges || {};
    let hasAnyBadge = false;

    // Check if there is at least one badge across all races
    for (const raceId in badgesList) {
        const b = badgesList[raceId];
        if (b.hasRPMile || b.hasMostExpensive || b.hasMostElevation || b.hasLongestDistance) {
            hasAnyBadge = true;
            break;
        }
    }

    if (hasAnyBadge) {
        badgesBtn.classList.remove('hidden');
    } else {
        badgesBtn.classList.add('hidden');
    }
}

/**
 * Global display function to be used by the button and other components
 */
function displayRaceBadgesModal() {
    const modal = document.getElementById('badgesModal');
    const content = document.getElementById('badgesContent');

    if (!modal || !content) return;

    // Recalculate badges if possible
    if (typeof races !== 'undefined') {
        window.raceBadges = calculateRaceBadges(races);
    }

    const badgesList = window.raceBadges || {};

    const badgeRaces = {
        hasRPMile: [],
        hasMostExpensive: [],
        hasMostElevation: [],
        hasLongestDistance: []
    };

    if (typeof races !== 'undefined') {
        races.forEach(race => {
            if (badgesList[race.id]) {
                if (badgesList[race.id].hasRPMile) badgeRaces.hasRPMile.push(race);
                if (badgesList[race.id].hasMostExpensive) badgeRaces.hasMostExpensive.push(race);
                if (badgesList[race.id].hasMostElevation) badgeRaces.hasMostElevation.push(race);
                if (badgesList[race.id].hasLongestDistance) badgeRaces.hasLongestDistance.push(race);
            }
        });
    }

    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">';
    const badgeKeys = ['hasRPMile', 'hasMostExpensive', 'hasMostElevation', 'hasLongestDistance'];

    badgeKeys.forEach(badgeKey => {
        const badgeInfo = getBadgeInfo(badgeKey) || { name: badgeKey, icon: 'fa-star', description: '' };
        const racesWithBadge = badgeRaces[badgeKey];

        html += `<div class="badge-card bg-white border-2 border-purple-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">`;
        html += `<div class="flex flex-col items-center text-center mb-3">`;
        html += `<div class="bg-purple-100 rounded-full p-4 mb-3">`;
        html += `<i class="fas ${badgeInfo.icon} text-4xl text-purple-600"></i>`;
        html += `</div>`;
        html += `<h4 class="text-lg font-bold text-purple-800 mb-2">${badgeInfo.name}</h4>`;
        html += `<p class="text-xs text-gray-600 mb-3 leading-tight">${badgeInfo.description}</p>`;
        html += `</div>`;

        html += `<div class="border-t-2 border-purple-100 pt-3 mt-3">`;
        if (racesWithBadge.length > 0) {
            html += `<div class="flex flex-col gap-1 max-h-32 overflow-y-auto">`;
            racesWithBadge.sort((a, b) => new Date(b.date) - new Date(a.date));

            racesWithBadge.forEach(race => {
                const year = new Date(race.date).getFullYear();
                html += `<span class="bg-purple-50 text-purple-800 px-2 py-1 rounded text-xs text-center truncate cursor-pointer hover:bg-purple-200 hover:underline transition-colors badge-race-name" data-race-id="${race.id}" title="${race.name}">${race.name} <span class="text-gray-500 text-[10px]">(${year})</span></span>`;
            });
            html += `</div>`;
        } else {
            html += `<p class="text-xs text-gray-500 italic text-center">Aucune course</p>`;
        }
        html += `</div></div>`;
    });

    html += '</div>';
    content.innerHTML = html;

    content.querySelectorAll('.badge-race-name').forEach(el => {
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            const raceId = this.getAttribute('data-race-id');
            modal.classList.add('hidden');
            if (typeof showRaceDetails === 'function') showRaceDetails(raceId);
        });
    });

    modal.classList.remove('hidden');
}

/**
 * Function to get badge information
 */
function getBadgeInfo(badgeKey) {
    const badgesInfo = {
        hasRPMile: {
            name: "RP temps",
            icon: "fa-tachometer-alt",
            description: "Record personnel : la course avec le temps le plus rapide au km"
        },
        hasMostExpensive: {
            name: "Course la plus cher",
            icon: "fa-sack-dollar",
            description: "La course avec le prix d'inscription le plus élevé"
        },
        hasMostElevation: {
            name: "Course avec le plus de denivelé",
            icon: "fa-mountain",
            description: "La course avec le plus grand dénivelé positif"
        },
        hasLongestDistance: {
            name: "Course la plus longue",
            icon: "fa-route",
            description: "La course avec la plus longue distance"
        }
    };
    return badgesInfo[badgeKey] || null;
}

/**
 * Function to calculate badges for all races
 */
function calculateRaceBadges(racesList) {
    const badges = {};
    if (!racesList || racesList.length === 0) return badges;

    // Initialize badges object for each race
    racesList.forEach(race => {
        badges[race.id] = {};
    });

    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Filter out future races
    const eligibleRaces = racesList.filter(race => race.date <= today);
    if (eligibleRaces.length === 0) return badges;

    // 1. Longest Distance
    let maxDistance = 0;
    eligibleRaces.forEach(race => {
        const dist = parseFloat(race.distance);
        if (!isNaN(dist) && dist > maxDistance) maxDistance = dist;
    });
    if (maxDistance > 0) {
        eligibleRaces.forEach(race => {
            if (parseFloat(race.distance) === maxDistance) {
                badges[race.id].hasLongestDistance = true;
            }
        });
    }

    // 2. Most Elevation
    let maxElevation = 0;
    eligibleRaces.forEach(race => {
        const elev = parseFloat(race.elevation);
        if (!isNaN(elev) && elev > maxElevation) maxElevation = elev;
    });
    if (maxElevation > 0) {
        eligibleRaces.forEach(race => {
            if (parseFloat(race.elevation) === maxElevation) {
                badges[race.id].hasMostElevation = true;
            }
        });
    }

    // 3. Most Expensive
    let maxPrice = 0;
    eligibleRaces.forEach(race => {
        const price = parseFloat(race.price);
        if (!isNaN(price) && price > maxPrice) maxPrice = price;
    });
    if (maxPrice > 0) {
        eligibleRaces.forEach(race => {
            if (parseFloat(race.price) === maxPrice) {
                badges[race.id].hasMostExpensive = true;
            }
        });
    }

    // 4. RP temps (shortest time per KM)
    let minSecondsPerKm = Infinity;

    const parseTimeToSeconds = (timeStr) => {
        if (!timeStr || timeStr === '00:00:00') return null;
        const parts = timeStr.split(':');
        if (parts.length !== 3) return null;
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    };

    eligibleRaces.forEach(race => {
        const dist = parseFloat(race.distance);
        const seconds = parseTimeToSeconds(race.time);
        if (!isNaN(dist) && dist > 0 && seconds !== null && seconds > 0) {
            const secondsPerKm = seconds / dist;
            if (secondsPerKm < minSecondsPerKm) {
                minSecondsPerKm = secondsPerKm;
            }
        }
    });

    if (minSecondsPerKm !== Infinity) {
        eligibleRaces.forEach(race => {
            const dist = parseFloat(race.distance);
            const seconds = parseTimeToSeconds(race.time);
            if (!isNaN(dist) && dist > 0 && seconds !== null && seconds > 0) {
                const secondsPerKm = seconds / dist;
                if (Math.abs(secondsPerKm - minSecondsPerKm) < 0.001) {
                    badges[race.id].hasRPMile = true;
                }
            }
        });
    }

    return badges;
}

/**
 * Function to setup listeners
 */
function setupBadgesListeners() {
    const badgesBtn = document.getElementById('badgesBtn');
    const modal = document.getElementById('badgesModal');
    const closeBtn = document.getElementById('closeBadgesModal');

    if (badgesBtn) {
        badgesBtn.onclick = (e) => {
            e.preventDefault();
            displayRaceBadgesModal();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => { if (modal) modal.classList.add('hidden'); };
    }
}

// Export functions to window to ensure backward compatibility
window.getBadgeInfo = getBadgeInfo;
window.calculateRaceBadges = calculateRaceBadges;
window.displayRaceBadgesModal = displayRaceBadgesModal;
window.robustDisplayBadges = displayRaceBadgesModal;
window.updateBadgesButtonVisibility = updateBadgesButtonVisibility;
