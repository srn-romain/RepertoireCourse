/**
 * Modale de détails d'une course (Standalone & Réutilisable)
 * Utilisable dans dashboard.html, index.html et tout autre écran.
 */

(function () {
    // État interne de la modale
    let currentRaceIdInDetails = null;
    let currentKeyNavigationHandler = null;
    let cachedRacesListForNav = null;
    const userPseudoCache = {};

    // Template HTML de la modale de détails
    const raceDetailsModalHTML = `
    <div id="detailsModal" class="fixed inset-0 z-[65] hidden modal overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50 blur-bg" id="detailsBackdrop"></div>
        <button id="prevRaceBtn"
            class="fixed md:-translate-x-[296px] top-1/2 left-4 md:left-1/2 md:-translate-x-[280px] transform -translate-y-1/2 text-gray-700 hover:text-gray-900 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-[100]"
            title="Course précédente">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <button id="nextRaceBtn"
            class="fixed top-1/2 right-4 md:right-1/2 md:translate-x-[280px] transform -translate-y-1/2 text-gray-700 hover:text-gray-900 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-[100]"
            title="Course suivante">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </button>
        <div class="flex items-center justify-center min-h-screen p-4 pointer-events-none">
            <div
                class="relative bg-white rounded-xl shadow-xl w-full max-w-md z-[90] overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
                <div class="p-6 pb-6 overflow-y-auto max-w-full">
                    <button id="closeDetailsBtn" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h3 id="detailsTitle" class="text-2xl font-bold text-green-800 mb-2"></h3>
                    <div id="detailsDate" class="text-green-600 mb-2 flex flex-wrap items-center gap-2"></div>
                    <div id="detailsBibContainer" class="mb-4 hidden">
                        <span
                            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                            title="Numéro de dossard">
                            <i class="fas fa-id-badge text-slate-400"></i>
                            <span id="detailsBibText"></span>
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <!-- Triathlon specific fields -->
                        <div class="bg-blue-50 p-3 rounded-lg hidden" id="detailsSwimContainer">
                            <p class="text-sm text-blue-600 flex items-center gap-2">
                                <i class="fas fa-swimmer text-blue-500"></i>
                                <span>Natation</span>
                            </p>
                            <p id="detailsSwim" class="font-semibold text-blue-800"></p>
                        </div>
                        <div class="bg-orange-50 p-3 rounded-lg hidden" id="detailsBikeContainer">
                            <p class="text-sm text-orange-600 flex items-center gap-2">
                                <i class="fas fa-biking text-orange-500"></i>
                                <span>Vélo</span>
                            </p>
                            <p id="detailsBike" class="font-semibold text-orange-800"></p>
                        </div>

                        <div class="bg-green-50 p-3 rounded-lg">
                            <p class="text-sm text-green-600 flex items-center gap-2">
                                <i class="fas fa-ruler-horizontal text-green-500"></i>
                                <span>Distance</span>
                            </p>
                            <p id="detailsDistance" class="font-semibold text-green-800"></p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg" id="detailsElevationContainer">
                            <p class="text-sm text-green-600 flex items-center gap-2" id="detailsElevationLabel">
                                <i class="fas fa-mountain text-green-500" id="detailsElevationIcon"></i>
                                <span id="detailsElevationLabelSpan">Dénivelé</span>
                            </p>
                            <p id="detailsElevation" class="font-semibold text-green-800 text-sm"></p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg" id="detailsTimeContainer">
                            <p class="text-sm text-green-600 flex items-center gap-2">
                                <i class="fas fa-stopwatch text-green-500"></i>
                                <span>Temps</span>
                            </p>
                            <p id="detailsTime" class="font-semibold text-green-800"></p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg">
                            <p class="text-sm text-green-600 flex items-center gap-2">
                                <i class="fas fa-map-marker-alt text-green-500"></i>
                                <span>Lieu</span>
                            </p>
                            <p id="detailsLocation" class="font-semibold text-green-800"></p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg" id="detailsPriceContainer">
                            <p class="text-sm text-green-600 flex items-center gap-2">
                                <i class="fas fa-euro-sign text-green-500"></i>
                                <span>Prix</span>
                            </p>
                            <p id="detailsPrice" class="font-semibold text-green-800"></p>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg" id="TerrainContainer">
                            <p id="DetailTerrainTitle" class="text-sm text-green-600 flex items-center gap-2">
                                <i class="fas fa-route text-green-500"></i>
                                <span>Type de Terrain</span>
                            </p>
                            <p id="DetailTerrainText" class="font-semibold text-green-800">/</p>
                        </div>
                        <div class="bg-yellow-50 p-2 rounded-lg hidden col-span-2 flex-col items-center justify-center gap-1"
                            id="detailsRankingContainer">
                            <p id="detailsRankingTopLabel"
                                class="text-[11px] text-yellow-600 font-semibold uppercase tracking-wider hidden items-center justify-center gap-1.5 w-full">
                                <i class="fas fa-medal opacity-75"></i> Classements
                            </p>
                            <div class="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
                                <div class="flex items-center gap-2" id="detailsGeneralRankingWrapper">
                                    <p class="text-sm text-yellow-600 flex items-center gap-1.5">
                                        <i class="fas fa-medal text-yellow-500" id="detailsGeneralIcon"></i>
                                        <span class="font-medium text-xs" id="detailsGeneralLabelText">Général :</span>
                                    </p>
                                    <span id="detailsRanking" class="font-bold text-yellow-800 text-sm">-</span>
                                </div>
                                <div class="hidden sm:block text-yellow-300 mx-2" id="detailsRankingSeparator">|</div>
                                <div id="detailsGenderRankingContainer" class="flex items-center gap-2 hidden">
                                    <p class="text-sm text-yellow-600 flex items-center gap-1.5">
                                        <i class="fas fa-venus-mars text-yellow-500" id="detailsGenderIcon"></i>
                                        <span class="font-medium text-xs" id="detailsGenderLabelText">Genre :</span>
                                    </p>
                                    <span id="detailsGenderRanking" class="font-bold text-yellow-800 text-sm">-</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div id="aiPredictionSection" class="mb-2 w-full hidden"></div>
                    <div id="averageSpeedInfo" class="mb-2 text-green-700 font-semibold"></div>
                    <div id="detailsLinksContainer" class="mt-4 mb-4 grid grid-cols-1 gap-3 w-full hidden"></div>
                    <div class="mb-4 max-w-full overflow-hidden" id="detailsNotesContainer">
                        <p id="detailsNotesLabel" class="text-sm text-green-600 mb-1 font-semibold">Notes</p>
                        <div id="detailsNotes" class="text-gray-700 text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full leading-relaxed"></div>
                    </div>
                    <div id="detailsCompanions" class="mb-4 hidden"></div>
                    <div id="detailsPhotoContainer" class="mb-4 hidden">
                        <img id="detailsPhoto" class="w-full h-auto rounded-lg shadow-md" alt="Photo de la course">
                    </div>
                    <!-- Nouveau conteneur pour le parcours -->
                    <div id="detailsParcoursContainer" class="mb-4 hidden">
                        <img id="detailsParcours" class="w-full h-auto rounded-lg shadow-md"
                            alt="Parcours de la course">
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="bg-green-50 p-3 rounded-lg flex flex-col justify-between h-full" id="ImageButton" onclick="event.stopPropagation();">
                            <p id="DetailImageTitle" class="text-sm text-green-600 flex items-center gap-2 shrink-0 mb-1"></p>
                            <p id="DetailImageButton" class="font-semibold text-green-800 hidden"></p>
                            <!-- Hidden as text is likely not used with the new logic, but ID kept for safety -->
                            <div class="flex-grow flex items-center w-full mt-1">
                                <button id="voirParcoursBtn" type="button" onclick="event.stopPropagation();"
                                    class="w-full py-1.5 px-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer">
                                    <i class="fas fa-route text-xs"></i>
                                    <span>Voir le parcours</span>
                                </button>
                            </div>
                        </div>
                        <div class="bg-green-50 p-3 rounded-lg flex flex-col justify-between h-full" id="BadgeButton">
                            <p class="text-sm text-green-600 flex items-center gap-2 mb-1 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="8" r="7" />
                                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                </svg>
                                <span>Badge</span>
                            </p>
                            <div id="DetailBadgeButton" class="font-semibold text-green-800 flex flex-col justify-center flex-grow w-full">/
                            </div>
                        </div>
                    </div>
                    <div id="driveButtonContainer" class="mb-4 hidden">
                        <button id="openDriveBtn"
                            class="w-full py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group">
                            <svg class="w-6 h-6 transform group-hover:scale-110 transition-transform"
                                viewBox="0 0 36 36">
                                <g fill="none" fill-rule="evenodd">
                                    <path d="m0 0h36v36h-36z" />
                                    <g fill-rule="nonzero" transform="translate(3 4.363636)">
                                        <path
                                            d="m20.5107955 18.0681818 1.29375 4.4607955 3.3903409 3.6511363c.4585227-.2642045.8488636-.6477272 1.1232954-1.1232954l3.15-5.4545455c.2744318-.4738636.4107955-1.0039772.4107955-1.5340909l-4.8375-.9375z"
                                            fill="#ea4335" />
                                        <path
                                            d="m19.6840909.41079546c-.4585227-.26420455-.9852273-.41079546-1.5340909-.41079546h-6.2982955c-.5454545 0-1.0772727.15-1.5340909.41079546l1.3568182 4.56988636 3.3136364 3.51818182.0119318.02386363 3.3375-3.56079545z"
                                            fill="#188038" />
                                        <path
                                            d="m9.48920455 18.0681818-4.82897728-1.1079545-4.5375 1.1079545c0 .5284091.13636364 1.0568182.40909091 1.5323864l3.15 5.45625c.27443182.4738636.66477273.8573863 1.12329546 1.1232954l3.33920454-3.4397727z"
                                            fill="#1967d2" />
                                        <path
                                            d="m25.1369318 9.03409091-4.3295454-7.5c-.2744319-.47556818-.6647728-.85909091-1.1232955-1.12329545l-4.6840909 8.11193181 5.5107955 9.54545453h9.3664772c0-.5301136-.1363636-1.0585227-.4107954-1.5340909z"
                                            fill="#fbbc04" />
                                        <path
                                            d="m20.5107955 18.0681818h-11.02159095l-4.68409091 8.1119318c.45852272.2642046.98522727.4107955 1.53409091.4107955h17.31988635c.5488636 0 1.0755682-.1465909 1.5340909-.4107955z"
                                            fill="#4285f4" />
                                        <path
                                            d="m15 8.52272727-4.6823864-8.11193181c-.45852269.26420454-.84715905.64602272-1.12159087 1.11988636l-8.66420455 15.00852268c-.27272727.4738637-.40909091 1.0022728-.40909091 1.5289773h9.36647728z"
                                            fill="#34a853" />
                                    </g>
                                </g>
                            </svg>
                            <span class="font-bold text-gray-700">Dossier Google Drive</span>
                        </button>
                    </div>
                    <div id="detailsActionsContainer"
                        class="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button id="editFromDetailsBtn"
                            class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Modifier
                        </button>
                        <button id="generatePdfBtn"
                            class="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                                    clip-rule="evenodd" />
                            </svg>
                            PDF
                        </button>
                        <button id="exportSingleRaceBtn"
                            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            title="Exporter cette course au format JSON">
                            <i class="fas fa-file-export"></i>
                            Exporter
                        </button>
                    </div>
                    <p id="detailsTimestamps" class="text-[10px] text-gray-400 italic mt-2 text-center"></p>
                </div>
            </div>
        </div>
    </div>`;

    // S'assure que la modale est injectée dans le DOM
    function ensureModalInDom() {
        if (!document.getElementById('detailsModal')) {
            const container = document.createElement('div');
            container.innerHTML = raceDetailsModalHTML;
            document.body.appendChild(container.firstElementChild);
            bindModalStaticEvents();
        }
    }

    // Helper: Échapper le HTML pour éviter les failles XSS
    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Helper: Formater la distance
    function formatDist(d) {
        if (d === undefined || d === null || d === '') return '/';
        const num = parseFloat(d);
        if (isNaN(num)) return String(d);
        return num.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    }

    // Helper: Convertir "HH:MM:SS" en secondes
    function timeToSeconds(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.trim().split(':').map(Number);
        if (parts.some(isNaN)) return 0;
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return parts[0] || 0;
    }

    // Helper: Convertir des secondes en "HH:MM:SS"
    function secondsToTime(totalSeconds) {
        if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00:00';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.round(totalSeconds % 60);
        const pad = n => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    // Helper: Calculer l'allure (min/km)
    function calculatePace(distKm, timeSeconds) {
        const d = parseFloat(distKm);
        const s = parseFloat(timeSeconds);
        if (!d || isNaN(d) || d <= 0 || !s || isNaN(s) || s <= 0) return '-';
        const paceSecs = s / d;
        const mins = Math.floor(paceSecs / 60);
        const secs = Math.round(paceSecs % 60);
        return `${mins}:${String(secs).padStart(2, '0')} min/km`;
    }

    /**
     * Calcule la prédiction IA personnalisée pour une course à venir en fonction de l'historique du coureur.
     * Prend en compte :
     * - Le type de terrain (Route, Trail, Relai, etc.)
     * - La distance exacte de l'épreuve
     * - Le dénivelé D+ (équivalent Effort-km : 100m D+ = 1 km plat)
     * - L'endurance personnalisée (indice de Peter Riegel)
     * - La dynamique / tendance de progression récente
     * 
     * Règle stricte : Au moins 5 courses complètes passées requises (avec chrono et distance valides).
     * Si moins de 5 courses complètes : retourne null (rien ne s'affiche).
     */
    function predictRacePerformance(targetRace, allRaces) {
        if (!targetRace || !allRaces || !Array.isArray(allRaces)) return null;

        // Déterminer la distance et le dénivelé de la course cible
        let targetDist = parseFloat(targetRace.distance) || 0;
        let targetElev = parseFloat(targetRace.elevation) || 0;
        let targetTerrain = (targetRace.terrain || 'route').toLowerCase();

        // Spécificité Relais : si l'utilisateur a des segments assignés
        if (targetTerrain === 'relai' && Array.isArray(targetRace.relayLaps) && targetRace.relayLaps.length > 0) {
            const currentUserPseudo = window.currentUserPseudo || 'Moi';
            let uDist = 0, uElev = 0;
            targetRace.relayLaps.forEach(lap => {
                const runnerLower = String(lap.runner || '').trim().toLowerCase();
                const isUser = !runnerLower || runnerLower === 'moi' || runnerLower === 'tous ensemble' || runnerLower === 'all' || (currentUserPseudo && runnerLower === currentUserPseudo.toLowerCase());
                if (isUser) {
                    uDist += parseFloat(lap.dist) || 0;
                    uElev += parseInt(lap.elev) || 0;
                }
            });
            if (uDist > 0) {
                targetDist = uDist;
                if (uElev > 0) targetElev = uElev;
            }
        }

        // Si pas de distance valide pour la course cible, impossible d'estimer un temps
        if (targetDist <= 0 || isNaN(targetDist)) return null;

        // Récupérer toutes les courses complétées passées
        const completedRuns = [];

        allRaces.forEach(r => {
            if (!r || r.id === targetRace.id) return;

            // Cas relais : vérifier les segments de l'utilisateur
            if (r.terrain === 'relai' && Array.isArray(r.relayLaps) && r.relayLaps.length > 0) {
                const currentUserPseudo = window.currentUserPseudo || 'Moi';
                let uDist = 0, uElev = 0, uTimeS = 0;
                r.relayLaps.forEach(lap => {
                    const runnerLower = String(lap.runner || '').trim().toLowerCase();
                    const isUser = !runnerLower || runnerLower === 'moi' || runnerLower === 'tous ensemble' || runnerLower === 'all' || (currentUserPseudo && runnerLower === currentUserPseudo.toLowerCase());
                    if (isUser) {
                        uDist += parseFloat(lap.dist) || 0;
                        uElev += parseInt(lap.elev) || 0;
                        uTimeS += timeToSeconds(lap.time) || 0;
                    }
                });
                if (uDist > 0 && uTimeS > 0) {
                    const flatDist = uDist + (uElev > 0 ? uElev / 100 : 0);
                    const speed = (uDist / uTimeS) * 3600;
                    const pace = uTimeS / uDist;
                    if (speed >= 4 && speed <= 30) {
                        completedRuns.push({
                            id: r.id,
                            date: r.date ? new Date(r.date) : new Date(0),
                            dist: uDist,
                            elev: uElev,
                            flatDist,
                            timeSec: uTimeS,
                            speedKmH: speed,
                            paceSecKm: pace,
                            terrain: 'relai'
                        });
                    }
                }
                return;
            }

            // Cas courses standards (hors triathlon solo)
            if (r.terrain !== 'triathlon') {
                const dist = parseFloat(r.distance) || 0;
                const elev = parseFloat(r.elevation) || 0;
                const tSec = timeToSeconds(r.time);
                if (dist > 0 && tSec && tSec > 0) {
                    const speed = (dist / tSec) * 3600;
                    const pace = tSec / dist;
                    if (speed >= 4 && speed <= 30) {
                        const flatDist = dist + (elev > 0 ? elev / 100 : 0);
                        completedRuns.push({
                            id: r.id,
                            date: r.date ? new Date(r.date) : new Date(0),
                            dist,
                            elev,
                            flatDist,
                            timeSec: tSec,
                            speedKmH: speed,
                            paceSecKm: pace,
                            terrain: (r.terrain || 'route').toLowerCase()
                        });
                    }
                }
            }
        });

        // RÈGLE STRICTE : Au moins 5 courses complètes requises
        if (completedRuns.length < 5) {
            return null;
        }

        // Tri chronologique des courses (anciennes -> récentes)
        completedRuns.sort((a, b) => a.date - b.date);

        // 1. Calcul du coefficient d'endurance de Peter Riegel personnalisé
        let fatigueExponent = 1.07;
        const shortRuns = completedRuns.filter(r => r.flatDist >= 3.0 && r.flatDist <= 12.0);
        const longRuns = completedRuns.filter(r => r.flatDist >= 15.0);

        if (shortRuns.length > 0 && longRuns.length > 0) {
            const avgShortDist = shortRuns.reduce((s, r) => s + r.flatDist, 0) / shortRuns.length;
            const avgShortTime = shortRuns.reduce((s, r) => s + r.timeSec, 0) / shortRuns.length;
            const avgLongDist = longRuns.reduce((s, r) => s + r.flatDist, 0) / longRuns.length;
            const avgLongTime = longRuns.reduce((s, r) => s + r.timeSec, 0) / longRuns.length;

            if (avgLongDist > avgShortDist * 1.3 && avgLongTime > avgShortTime) {
                const customF = Math.log(avgLongTime / avgShortTime) / Math.log(avgLongDist / avgShortDist);
                if (!isNaN(customF) && customF >= 1.03 && customF <= 1.18) {
                    fatigueExponent = customF;
                }
            }
        } else {
            const maxDist = Math.max(...completedRuns.map(r => r.flatDist));
            if (maxDist < 10) fatigueExponent = 1.085;
            else if (maxDist >= 21) fatigueExponent = 1.06;
        }

        // 2. Détermination du facteur de technicité de terrain
        const trailRuns = completedRuns.filter(r => r.terrain === 'trail');
        const roadRuns = completedRuns.filter(r => r.terrain === 'route' || r.terrain === 'nature' || r.terrain === 'cross' || r.terrain === 'piste');

        let trailSlowdownFactor = 0.88; // Par défaut : un trail est ~12% plus lent à effort-km égal
        if (trailRuns.length >= 2 && roadRuns.length >= 2) {
            const avgTrailFlatSpeed = trailRuns.reduce((s, r) => s + ((r.flatDist / r.timeSec) * 3600), 0) / trailRuns.length;
            const avgRoadFlatSpeed = roadRuns.reduce((s, r) => s + ((r.flatDist / r.timeSec) * 3600), 0) / roadRuns.length;
            if (avgRoadFlatSpeed > 0 && avgTrailFlatSpeed > 0) {
                const ratio = avgTrailFlatSpeed / avgRoadFlatSpeed;
                if (ratio >= 0.70 && ratio <= 0.98) {
                    trailSlowdownFactor = ratio;
                }
            }
        }

        // 3. Distance d'effort cible (Effort-km : 100m D+ = 1 km plat)
        const targetEffortDist = targetDist + (targetElev > 0 ? targetElev / 100 : 0);

        // 4. Projection pour chaque course passée avec pondération multi-critères
        let totalWeight = 0;
        let weightedProjectedTime = 0;
        const n = completedRuns.length;

        completedRuns.forEach((r, idx) => {
            let projectedSec = r.timeSec * Math.pow(targetEffortDist / r.flatDist, fatigueExponent);

            // Ajustement selon le terrain de la course passée vs cible
            if (targetTerrain === 'trail') {
                if (r.terrain !== 'trail') {
                    projectedSec = projectedSec / trailSlowdownFactor;
                }
            } else if (targetTerrain === 'route') {
                if (r.terrain === 'trail') {
                    projectedSec = projectedSec * trailSlowdownFactor;
                }
            } else if (targetTerrain === 'relai') {
                if (r.terrain === 'trail') {
                    projectedSec = projectedSec * trailSlowdownFactor;
                }
                if (targetDist <= 10) {
                    projectedSec *= 0.98;
                }
            }

            // Pondération 1 : Similarité de terrain
            let terrainWeight = 1.0;
            if (targetTerrain === 'trail') {
                terrainWeight = (r.terrain === 'trail') ? 3.0 : 0.8;
            } else if (targetTerrain === 'route') {
                terrainWeight = (r.terrain === 'route' || r.terrain === 'piste') ? 2.5 : ((r.terrain === 'trail') ? 0.7 : 1.2);
            } else if (targetTerrain === 'relai') {
                terrainWeight = (r.terrain === 'relai') ? 3.0 : ((r.terrain === 'route') ? 1.5 : 0.7);
            } else {
                terrainWeight = (r.terrain === targetTerrain) ? 2.5 : 1.0;
            }

            // Pondération 2 : Proximité de distance
            const distRatio = Math.max(r.dist / targetDist, targetDist / r.dist);
            const distWeight = 1 / (1 + Math.log(distRatio));

            // Pondération 3 : Récence
            const recencyWeight = 0.5 + 0.5 * ((idx + 1) / n);

            const weight = terrainWeight * distWeight * recencyWeight;
            weightedProjectedTime += projectedSec * weight;
            totalWeight += weight;
        });

        if (totalWeight <= 0) return null;

        let finalTimeSec = weightedProjectedTime / totalWeight;

        // 5. Ajustement de tendance récente (momentum de forme sur les 5 dernières courses)
        if (completedRuns.length >= 5) {
            const recentRuns = completedRuns.slice(-5);
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            recentRuns.forEach((r, i) => {
                const speed = (r.flatDist / r.timeSec) * 3600;
                sumX += i;
                sumY += speed;
                sumXY += i * speed;
                sumX2 += i * i;
            });
            const count = recentRuns.length;
            const slope = (count * sumXY - sumX * sumY) / (count * sumX2 - sumX * sumX);
            if (!isNaN(slope)) {
                const avgRecentSpeed = sumY / count;
                if (avgRecentSpeed > 0) {
                    const trendFactor = 1 - Math.max(-0.03, Math.min(0.03, (slope * 2) / avgRecentSpeed));
                    finalTimeSec *= trendFactor;
                }
            }
        }

        // Sécurité physique : allure min 2'30"/km, max 15'00"/km
        const predPaceSec = finalTimeSec / targetDist;
        if (predPaceSec < 150) finalTimeSec = 150 * targetDist;
        if (predPaceSec > 900) finalTimeSec = 900 * targetDist;

        const predSpeedKmH = (targetDist / finalTimeSec) * 3600;
        const finalPaceSec = finalTimeSec / targetDist;
        const paceMins = Math.floor(finalPaceSec / 60);
        const paceSecs = Math.round(finalPaceSec % 60);
        const formattedPace = `${paceMins}'${String(paceSecs).padStart(2, '0')}"`;

        // Formatage du temps prédit
        const hours = Math.floor(finalTimeSec / 3600);
        const minutes = Math.floor((finalTimeSec % 3600) / 60);
        const seconds = Math.round(finalTimeSec % 60);

        let formattedTime = '';
        if (hours > 0) {
            formattedTime = `${hours}h${String(minutes).padStart(2, '0')}'${String(seconds).padStart(2, '0')}"`;
        } else {
            formattedTime = `${minutes}'${String(seconds).padStart(2, '0')}"`;
        }

        return {
            timeSec: Math.round(finalTimeSec),
            formattedTime,
            pace: formattedPace,
            speed: predSpeedKmH.toFixed(1),
            targetDist,
            targetElev,
            targetTerrain,
            basedOnRacesCount: completedRuns.length
        };
    }

    /**
     * Détermine les classes de couleur de la fenêtre de prédiction IA pour qu'elle
    /**
     * Helper: Détermine dynamiquement une palette de couleur pour la prédiction IA qui
     * contraste nettement avec le thème choisi par l'utilisateur dans les réglages
     * tout en restant parfaitement lisible et esthétique.
     */
    function getPredictionThemeColors() {
        const userTheme = (typeof window !== 'undefined' && window.currentThemeColor)
            || (typeof localStorage !== 'undefined' ? localStorage.getItem('userThemeColor') : null)
            || 'green';

        // Si l'utilisateur a choisi un thème violet, indigo ou bleu :
        // basculer sur une teinte ambre/or chaleureuse, lumineuse et ultra visible
        if (userTheme === 'purple' || userTheme === 'indigo' || userTheme === 'blue') {
            return {
                bgClass: 'bg-amber-50 ai-prediction-card-amber',
                borderClass: 'border-amber-200',
                headerBorderClass: 'border-amber-200',
                headerTextClass: 'text-amber-900',
                iconColorClass: 'text-amber-600',
                labelClass: 'text-amber-700',
                valueClass: 'text-amber-950',
                badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
            };
        }

        // Pour tous les autres thèmes (vert classique, sarcelle, rose, ambre, ardoise),
        // utiliser une palette violette/pourpre IA moderne, élégante et parfaitement visible
        return {
            bgClass: 'bg-purple-50 ai-prediction-card-purple',
            borderClass: 'border-purple-200',
            headerBorderClass: 'border-purple-200',
            headerTextClass: 'text-purple-900',
            iconColorClass: 'text-purple-600',
            labelClass: 'text-purple-700',
            valueClass: 'text-purple-950',
            badgeClass: 'bg-purple-100 text-purple-900 border-purple-300'
        };
    }

    // Helper: Surlignage de texte recherché
    function highlightSearchMatch(text, searchQuery) {
        if (!searchQuery || !text) return text;
        const searchLower = searchQuery.toLowerCase();
        const textStr = String(text);
        const textLower = textStr.toLowerCase();
        if (!textLower.includes(searchLower)) return textStr;
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return textStr.replace(regex, '<mark class="bg-yellow-200 text-yellow-800 rounded px-1">$1</mark>');
    }

    // Helper: Récupération des informations sur les utilisateurs qui ont aimé
    async function getLikersInfo(uids) {
        if (!uids || uids.length === 0) return [];
        const results = [];
        for (const uid of uids) {
            if (userPseudoCache[uid]) {
                results.push(userPseudoCache[uid]);
            } else {
                try {
                    if (typeof db !== 'undefined' && db && db.collection) {
                        const doc = await db.collection('users').doc(uid).get();
                        const data = doc.data() || {};
                        const info = {
                            pseudo: data.pseudo || data.email?.split('@')[0] || "Inconnu",
                            photo: data.photo || null
                        };
                        userPseudoCache[uid] = info;
                        results.push(info);
                    } else {
                        results.push({ pseudo: "Membre", photo: null });
                    }
                } catch (e) {
                    results.push({ pseudo: "Anonyme", photo: null });
                }
            }
        }
        return results;
    }

    // Helper: Exporter une seule course au format JSON
    function exportSingleRace(raceId, raceObj) {
        const rId = raceId || currentRaceIdInDetails;
        let race = raceObj;
        if (!race && rId) {
            const list = cachedRacesListForNav || window.races || window.publicRaces || window.originalRaces || [];
            race = list.find(r => r.id === rId || String(r.id) === String(rId));
        }
        if (!race) return;

        const { id, ...raceData } = race;
        if (!raceData.hasOwnProperty('public')) {
            raceData.public = true;
        }

        const data = {
            timestamp: new Date().toISOString(),
            races: [{ id, ...raceData }],
            wishlist: []
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);

        const safeRaceName = (race.name || 'course').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadAnchorNode.setAttribute("download", `export_course_${safeRaceName}_${new Date().toISOString().slice(0, 10)}.json`);

        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    window.exportSingleRace = exportSingleRace;

    // Helper: Toggle d'une sous-ligne de relai
    window.toggleRelayRow = function (subRowId, rowEl) {
        const subRow = document.getElementById(subRowId);
        if (subRow) {
            subRow.classList.toggle('hidden');
            if (rowEl) {
                const chevron = rowEl.querySelector('.relay-chevron');
                if (chevron) chevron.classList.toggle('rotate-180');
            }
        }
    };

    // Fermer la modale de détails
    function closeRaceDetails() {
        const modal = document.getElementById('detailsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        const aiPredictionContainer = document.getElementById('aiPredictionSection');
        if (aiPredictionContainer) {
            aiPredictionContainer.innerHTML = '';
            aiPredictionContainer.classList.add('hidden');
        }
        if (currentKeyNavigationHandler) {
            document.removeEventListener('keydown', currentKeyNavigationHandler);
            currentKeyNavigationHandler = null;
        }
    }
    window.closeRaceDetails = closeRaceDetails;

    // Lier les événements statiques de la modale
    function bindModalStaticEvents() {
        const closeBtn = document.getElementById('closeDetailsBtn');
        if (closeBtn) {
            closeBtn.onclick = closeRaceDetails;
        }

        const backdrop = document.getElementById('detailsModalBackdrop');
        if (backdrop) {
            backdrop.onclick = closeRaceDetails;
        }

        const editBtn = document.getElementById('editFromDetailsBtn');
        if (editBtn) {
            editBtn.onclick = async () => {
                const isInviteUser = (typeof isInviteAsync === 'function')
                    ? await isInviteAsync()
                    : ((typeof isInvite === 'function') ? isInvite() : false);

                if (isInviteUser) {
                    if (typeof showPermissionDeniedModal === 'function') {
                        showPermissionDeniedModal('modifier une course');
                    } else {
                        alert('Action réservée aux membres autorisés.');
                    }
                    return;
                }

                if (currentRaceIdInDetails) {
                    closeRaceDetails();
                    const modalTitle = document.getElementById('modalTitle');
                    if (modalTitle) modalTitle.textContent = 'Modifier la course';
                    if (typeof populateEditForm === 'function') {
                        populateEditForm(currentRaceIdInDetails);
                    }
                    const raceModal = document.getElementById('raceModal');
                    if (raceModal) raceModal.classList.remove('hidden');
                    const raceNameInput = document.getElementById('raceName');
                    if (raceNameInput) raceNameInput.focus();
                }
            };
        }

        const pdfBtn = document.getElementById('generatePdfBtn');
        if (pdfBtn) {
            pdfBtn.onclick = () => {
                if (currentRaceIdInDetails && typeof generateRacePdf === 'function') {
                    generateRacePdf(currentRaceIdInDetails);
                }
            };
        }

        const exportBtn = document.getElementById('exportSingleRaceBtn');
        if (exportBtn) {
            exportBtn.onclick = () => {
                if (currentRaceIdInDetails) {
                    exportSingleRace(currentRaceIdInDetails);
                }
            };
        }

        // Si l'utilisateur modifie la palette de couleur dans les paramètres, adapter immédiatement la prédiction
        if (typeof window !== 'undefined') {
            window.addEventListener('themeChanged', () => {
                if (currentRaceIdInDetails) {
                    const detailsModal = document.getElementById('detailsModal');
                    if (detailsModal && !detailsModal.classList.contains('hidden')) {
                        showRaceDetails(currentRaceIdInDetails, cachedRacesListForNav);
                    }
                }
            });
        }
    }

    // Afficher les détails d'une course
    function showRaceDetails(idOrRace, optionalRacesList, authorPrivacy) {
        if (window.isSelectionMode) return;

        ensureModalInDom();

        const detailsModal = document.getElementById('detailsModal');
        if (!detailsModal) return;

        // Résoudre l'objet course
        let race = null;
        let racesList = optionalRacesList || window.races || window.publicRaces || window.originalRaces || [];

        if (typeof idOrRace === 'object' && idOrRace !== null) {
            race = idOrRace;
            if (!racesList.some(r => r.id === race.id)) {
                racesList = [race, ...racesList];
            }
        } else {
            const searchId = idOrRace;
            race = racesList.find(r => r.id === searchId || String(r.id) === String(searchId));
        }

        if (!race) return;

        const effectivePrivacy = authorPrivacy || race._authorPrivacy || race.privacy || null;
        const currentUid = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser.uid : null;
        const isOwner = (race._uid && currentUid && race._uid === currentUid) || (!race._uid && (typeof window.location !== 'undefined' && window.location.pathname.includes('dashboard')));

        cachedRacesListForNav = racesList;
        currentRaceIdInDetails = race.id;
        window.currentRaceIdInDetails = race.id;

        // Gestion des droits / boutons d'action
        const detailsActionsContainer = document.getElementById('detailsActionsContainer');
        const isInviteCheck = (typeof isInvite === 'function')
            ? isInvite()
            : ((typeof BackendAPI !== 'undefined' && BackendAPI.isInvite) ? BackendAPI.isInvite() : false);
        const isOnPublicPage = (typeof window.location !== 'undefined' && (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')));
        const isDashboard = !isOnPublicPage && ((typeof window.location !== 'undefined' && window.location.pathname.includes('dashboard')) || !!document.getElementById('racesContainer'));

        if (detailsActionsContainer) {
            if (isOnPublicPage || isInviteCheck || typeof populateEditForm !== 'function') {
                detailsActionsContainer.classList.add('hidden');
            } else {
                detailsActionsContainer.classList.remove('hidden');
            }
        }

        const raceDate = new Date(race.date);
        const todayForTime = new Date();
        todayForTime.setHours(0, 0, 0, 0);
        const raceDateOnlyForTime = new Date(raceDate);
        raceDateOnlyForTime.setHours(0, 0, 0, 0);

        // Badge selon la date de la course
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const raceDateOnly = new Date(raceDate);
        raceDateOnly.setHours(0, 0, 0, 0);
        const isToday = raceDateOnly.getTime() === today.getTime();
        const isUpcoming = raceDateOnly.getTime() > today.getTime();
        const isPast = raceDateOnly.getTime() < today.getTime();

        let badgeAvenir = '';
        if (isToday) {
            badgeAvenir = '<span class="inline-flex items-center px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full animate-pulse">Jour J</span>';
        } else if (isUpcoming) {
            const diffTime = raceDateOnly.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            badgeAvenir = `<span class="inline-flex items-center px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full animate-pulse">À venir J-${diffDays}</span>`;
        } else if (isPast) {
            const diffTime = today.getTime() - raceDateOnly.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            badgeAvenir = `<span class="inline-flex items-center px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">J+${diffDays}</span>`;
        }

        const searchQuery = window.currentSearchQuery || '';

        function fieldMatchesSearch(value, searchQ) {
            if (!searchQ || !value) return false;
            return String(value).toLowerCase().includes(searchQ.toLowerCase());
        }

        // Titre avec cadenas si compte privé
        const titleElement = document.getElementById('detailsTitle');
        const isAccountPublicForLock = (typeof window.prefAccountPublicRaces !== 'undefined')
            ? (window.prefAccountPublicRaces === true)
            : (localStorage.getItem('prefAccountPublicRaces') !== 'false');
        const lockIcon = (!isAccountPublicForLock)
            ? '<i class="fas fa-lock text-gray-400 mr-2 cursor-pointer hover:text-gray-600 transition-colors" onclick="if(typeof showPrivateInfo===\'function\')showPrivateInfo();" title="Compte privé (courses privées)"></i>'
            : '';

        if (titleElement) {
            if (fieldMatchesSearch(race.name, searchQuery)) {
                titleElement.innerHTML = lockIcon + highlightSearchMatch(race.name, searchQuery);
            } else {
                titleElement.innerHTML = lockIcon;
                titleElement.appendChild(document.createTextNode(race.name || 'Course'));
            }
        }

        // Heure
        let heureHtml = '';
        if (race.hour) {
            const hourDisplay = fieldMatchesSearch(race.hour, searchQuery)
                ? highlightSearchMatch(race.hour, searchQuery)
                : race.hour;
            heureHtml = `<span class="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">${hourDisplay}</span>`;
        }

        // Date
        const dateElement = document.getElementById('detailsDate');
        if (dateElement) {
            const dateStr = raceDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).replace(/^[a-z]/, c => c.toUpperCase());

            const dateDisplay = fieldMatchesSearch(dateStr, searchQuery) ||
                fieldMatchesSearch(raceDate.getFullYear().toString(), searchQuery) ||
                fieldMatchesSearch((raceDate.getMonth() + 1).toString(), searchQuery) ||
                fieldMatchesSearch(raceDate.getDate().toString(), searchQuery)
                ? highlightSearchMatch(dateStr, searchQuery)
                : dateStr;

            dateElement.innerHTML = `<span class="font-medium">${dateDisplay}</span>${heureHtml}${badgeAvenir}`;
        }

        // Champs Triathlon & Conteneurs généraux
        const swimContainer = document.getElementById('detailsSwimContainer');
        const bikeContainer = document.getElementById('detailsBikeContainer');
        const detailsSwim = document.getElementById('detailsSwim');
        const detailsBike = document.getElementById('detailsBike');
        const distanceElement = document.getElementById('detailsDistance');
        const elevationElement = document.getElementById('detailsElevation');
        const timeElement = document.getElementById('detailsTime');
        const terrainContainer = document.getElementById('TerrainContainer');

        const distanceLabelContainer = distanceElement ? distanceElement.previousElementSibling : null;
        const distanceLabelSpan = distanceLabelContainer ? distanceLabelContainer.querySelector('span') : null;
        const distanceIcon = distanceLabelContainer ? distanceLabelContainer.querySelector('i') : null;

        const elevationContainer = elevationElement ? elevationElement.parentElement : null;
        const elevationLabelSpan = elevationContainer ? elevationContainer.querySelector('span') : null;
        const elevationIcon = elevationContainer ? elevationContainer.querySelector('i') : null;

        const timeContainer = timeElement ? timeElement.parentElement : null;
        const timeTitle = timeContainer ? timeContainer.querySelector('p') : null;
        const timeLabelSpan = timeContainer ? timeContainer.querySelector('span') : null;
        const timeIcon = timeContainer ? timeContainer.querySelector('i') : null;

        // Reset containers styles
        const aiPredictionContainer = document.getElementById('aiPredictionSection');
        if (aiPredictionContainer) {
            aiPredictionContainer.innerHTML = '';
            aiPredictionContainer.classList.add('hidden');
        }

        [distanceElement?.parentElement, elevationElement?.parentElement, timeElement?.parentElement, terrainContainer].forEach(el => {
            if (el) {
                el.classList.remove('hidden', 'bg-blue-50', 'bg-orange-50', 'bg-green-50');
                el.classList.add('bg-green-50');
                const p = el.querySelector('p');
                if (p) {
                    p.classList.remove('text-blue-600', 'text-orange-600', 'text-green-600');
                    p.classList.add('text-green-600');
                }
                const val = el.querySelector('.font-semibold');
                if (val) {
                    val.classList.remove('text-blue-800', 'text-orange-800', 'text-green-800');
                    val.classList.add('text-green-800');
                }
                const icon = el.querySelector('i');
                if (icon && el.id !== 'TerrainContainer') icon.className = '';
            }
        });

        if (swimContainer) {
            swimContainer.classList.remove('bg-green-50', 'bg-orange-50');
            swimContainer.classList.add('bg-blue-50');
            const p = swimContainer.querySelector('p');
            if (p) { p.classList.remove('text-green-600', 'text-orange-600'); p.classList.add('text-blue-600'); }
            const val = swimContainer.querySelector('.font-semibold');
            if (val) { val.classList.remove('text-green-800', 'text-orange-800'); val.classList.add('text-blue-800'); }
        }
        if (bikeContainer) {
            bikeContainer.classList.remove('bg-green-50', 'bg-blue-50');
            bikeContainer.classList.add('bg-orange-50');
            const p = bikeContainer.querySelector('p');
            if (p) { p.classList.remove('text-green-600', 'text-blue-600'); p.classList.add('text-orange-600'); }
            const val = bikeContainer.querySelector('.font-semibold');
            if (val) { val.classList.remove('text-green-800', 'text-blue-800'); val.classList.add('text-orange-800'); }
        }

        if (race.terrain === 'triathlon') {
            const isRelay = race.raceFormat === 'team';
            const sport = race.raceRelaySport;

            if (isRelay) {
                if (sport === 'swim') {
                    if (swimContainer) {
                        swimContainer.classList.remove('hidden');
                        let swimText = '? m';
                        const swimDist = parseFloat(race.swimDistance);
                        if (!isNaN(swimDist)) {
                            swimText = swimDist > 999 ? parseFloat((swimDist / 1000).toFixed(2)) + ' km' : swimDist + ' m';
                        }
                        if (detailsSwim) detailsSwim.textContent = swimText;
                    }
                    if (bikeContainer) bikeContainer.classList.add('hidden');
                    if (terrainContainer) terrainContainer.classList.add('hidden');
                    if (distanceElement?.parentElement) distanceElement.parentElement.classList.add('hidden');
                    if (elevationElement?.parentElement) elevationElement.parentElement.classList.add('hidden');

                    if (timeElement && timeElement.parentElement) {
                        const timeParent = timeElement.parentElement;
                        timeParent.classList.remove('bg-green-50');
                        timeParent.classList.add('bg-blue-50');
                        const p = timeParent.querySelector('p');
                        if (p) p.classList.replace('text-green-600', 'text-blue-600');
                        timeElement.className = "font-semibold text-blue-800";
                        const span = timeParent.querySelector('span');
                        if (span) span.textContent = 'Temps';
                        const icon = timeParent.querySelector('i');
                        if (icon) icon.className = 'fas fa-stopwatch text-blue-500';
                        timeElement.textContent = race.swimTime || '/';
                    }

                } else if (sport === 'bike') {
                    if (swimContainer) swimContainer.classList.add('hidden');
                    if (bikeContainer) {
                        bikeContainer.classList.remove('hidden');
                        if (detailsBike) detailsBike.textContent = formatDist(race.bikeDistance) + ' km';
                    }

                    if (distanceElement && distanceElement.parentElement) {
                        const distParent = distanceElement.parentElement;
                        distParent.classList.remove('bg-green-50');
                        distParent.classList.add('bg-orange-50');
                        const p = distParent.querySelector('p');
                        if (p) p.classList.replace('text-green-600', 'text-orange-600');
                        distanceElement.className = "font-semibold text-orange-800";
                        const span = distParent.querySelector('span');
                        if (span) span.textContent = 'Temps';
                        const icon = distParent.querySelector('i');
                        if (icon) icon.className = 'fas fa-stopwatch text-orange-500';
                        distanceElement.textContent = race.bikeTime || '/';
                    }

                    if (timeElement && timeElement.parentElement) {
                        const timeParent = timeElement.parentElement;
                        timeParent.classList.remove('bg-green-50');
                        timeParent.classList.add('bg-orange-50');
                        const p = timeParent.querySelector('p');
                        if (p) p.classList.replace('text-green-600', 'text-orange-600');
                        timeElement.className = "font-semibold text-orange-800";
                        const span = timeParent.querySelector('span');
                        if (span) span.textContent = 'Dénivelé';
                        const icon = timeParent.querySelector('i');
                        if (icon) icon.className = 'fas fa-mountain text-orange-500';
                        timeElement.className = "font-semibold text-orange-800 text-sm";
                        const hasBikeElev = race.bikeElevation !== null && race.bikeElevation !== undefined;
                        const hasBikeElevNeg = race.bikeElevationNeg !== null && race.bikeElevationNeg !== undefined;
                        if (hasBikeElev || hasBikeElevNeg) {
                            let bikeElevText = hasBikeElev ? `D+ ${race.bikeElevation}m` : '';
                            if (hasBikeElevNeg) bikeElevText += (bikeElevText ? ' / ' : '') + `D- ${race.bikeElevationNeg}m`;
                            timeElement.textContent = bikeElevText;
                        } else {
                            timeElement.textContent = '/';
                        }
                    }

                    if (elevationElement?.parentElement) elevationElement.parentElement.classList.add('hidden');
                    if (terrainContainer) terrainContainer.classList.remove('hidden');

                } else if (sport === 'run') {
                    if (swimContainer) swimContainer.classList.add('hidden');
                    if (bikeContainer) bikeContainer.classList.add('hidden');

                    if (distanceElement && distanceElement.parentElement) {
                        const distParent = distanceElement.parentElement;
                        const span = distParent.querySelector('span');
                        if (span) span.textContent = 'Distance';
                        const icon = distParent.querySelector('i');
                        if (icon) icon.className = 'fas fa-running text-green-500';
                        distanceElement.textContent = formatDist(race.distance) + ' km';
                    }

                    if (timeElement && timeElement.parentElement) {
                        const timeParent = timeElement.parentElement;
                        const span = timeParent.querySelector('span');
                        if (span) span.textContent = 'Temps';
                        const icon = timeParent.querySelector('i');
                        if (icon) icon.className = 'fas fa-stopwatch text-green-500';
                        timeElement.textContent = race.runTime || '/';
                    }

                    if (elevationElement && elevationElement.parentElement) {
                        const elevParent = elevationElement.parentElement;
                        const span = elevParent.querySelector('span');
                        if (span) span.textContent = 'Dénivelé';
                        const icon = elevParent.querySelector('i');
                        if (icon) icon.className = 'fas fa-mountain text-green-500';
                        elevationElement.className = "font-semibold text-green-800 text-sm";
                        const hasRunElev = race.runElevation !== null && race.runElevation !== undefined;
                        const hasRunElevNeg = race.runElevationNeg !== null && race.runElevationNeg !== undefined;
                        if (hasRunElev || hasRunElevNeg) {
                            let runElevText = hasRunElev ? `D+ ${race.runElevation}m` : '';
                            if (hasRunElevNeg) runElevText += (runElevText ? ' / ' : '') + `D- ${race.runElevationNeg}m`;
                            elevationElement.textContent = runElevText;
                        } else {
                            elevationElement.textContent = '/';
                        }
                    }

                    if (terrainContainer) terrainContainer.classList.remove('hidden');
                }

            } else {
                // Solo Triathlon
                if (swimContainer) swimContainer.classList.remove('hidden');
                if (bikeContainer) bikeContainer.classList.remove('hidden');
                if (terrainContainer) terrainContainer.classList.remove('hidden');

                if (detailsSwim) {
                    let swimText = '';
                    const swimDist = parseFloat(race.swimDistance);
                    swimText = !isNaN(swimDist) ? (swimDist > 999 ? parseFloat((swimDist / 1000).toFixed(2)) + ' km' : swimDist + ' m') : '? m';
                    if (race.swimTime) swimText += ' | ' + race.swimTime;
                    detailsSwim.textContent = swimText;
                }

                if (detailsBike) {
                    let bikeText = formatDist(race.bikeDistance) + ' km';
                    if (race.bikeTime) bikeText += ' | ' + race.bikeTime;
                    detailsBike.textContent = bikeText;
                }

                if (distanceLabelSpan) distanceLabelSpan.textContent = 'Course à pied';
                if (distanceIcon) distanceIcon.className = 'fas fa-running text-green-500';
                let runText = formatDist(race.distance) + ' km';
                if (race.runTime) runText += ' | ' + race.runTime;
                if (distanceElement) distanceElement.textContent = runText;

                if (elevationLabelSpan) elevationLabelSpan.textContent = "Dénivelé à pied";
                if (elevationIcon) elevationIcon.className = "fas fa-mountain text-green-500";
                if (elevationElement) {
                    elevationElement.className = "font-semibold text-green-800 text-sm";
                    const hasRunElev2 = race.runElevation !== null && race.runElevation !== undefined;
                    const hasRunElevNeg2 = race.runElevationNeg !== null && race.runElevationNeg !== undefined;
                    if (hasRunElev2 || hasRunElevNeg2) {
                        let runElevText = hasRunElev2 ? `D+ ${race.runElevation}m` : '';
                        if (hasRunElevNeg2) runElevText += (runElevText ? ' / ' : '') + `D- ${race.runElevationNeg}m`;
                        elevationElement.textContent = runElevText;
                    } else {
                        elevationElement.textContent = '/';
                    }
                }

                if (timeElement && timeElement.parentElement) {
                    const timeParent = timeElement.parentElement;
                    timeParent.classList.remove('bg-green-50');
                    timeParent.classList.add('bg-orange-50');
                    if (timeTitle) {
                        timeTitle.classList.remove('text-green-600');
                        timeTitle.classList.add('text-orange-600');
                    }
                    if (timeLabelSpan) timeLabelSpan.textContent = "Dénivelé vélo";
                    if (timeIcon) timeIcon.className = "fas fa-mountain text-orange-500";
                    timeElement.className = "font-semibold text-orange-800 text-sm";
                    const hasBikeElev2 = race.bikeElevation !== null && race.bikeElevation !== undefined;
                    const hasBikeElevNeg2 = race.bikeElevationNeg !== null && race.bikeElevationNeg !== undefined;
                    if (hasBikeElev2 || hasBikeElevNeg2) {
                        let bikeElevText = hasBikeElev2 ? `D+ ${race.bikeElevation}m` : '';
                        if (hasBikeElevNeg2) bikeElevText += (bikeElevText ? ' / ' : '') + `D- ${race.bikeElevationNeg}m`;
                        timeElement.textContent = bikeElevText;
                    } else {
                        timeElement.textContent = '/';
                    }
                }
            }
        } else {
            // Standard Race
            if (swimContainer) swimContainer.classList.add('hidden');
            if (bikeContainer) bikeContainer.classList.add('hidden');
            if (terrainContainer) terrainContainer.classList.remove('hidden');

            if (distanceLabelSpan) distanceLabelSpan.textContent = 'Distance';
            if (distanceIcon) distanceIcon.className = 'fas fa-ruler-horizontal text-green-500';

            if (distanceElement) {
                if (race.distance && !isNaN(race.distance)) {
                    const distanceText = `${formatDist(race.distance)} km`;
                    if (fieldMatchesSearch(race.distance, searchQuery) || fieldMatchesSearch('km', searchQuery)) {
                        distanceElement.innerHTML = highlightSearchMatch(distanceText, searchQuery);
                    } else {
                        distanceElement.textContent = distanceText;
                    }
                } else {
                    distanceElement.textContent = '/';
                }
            }

            if (elevationLabelSpan) elevationLabelSpan.textContent = "Dénivelé";
            if (elevationIcon) elevationIcon.className = 'fas fa-mountain text-green-500';
            if (elevationElement) {
                elevationElement.className = "font-semibold text-green-800 text-sm";
                const hasElev = race.elevation && !isNaN(race.elevation);
                const hasElevNeg = race.elevationNeg !== null && race.elevationNeg !== undefined && !isNaN(race.elevationNeg);
                if (hasElev || hasElevNeg) {
                    let elevText = hasElev ? `D+ ${race.elevation}m` : '';
                    if (hasElevNeg) elevText += (elevText ? ' / ' : '') + `D- ${race.elevationNeg}m`;
                    elevationElement.textContent = elevText;
                } else {
                    elevationElement.textContent = '/';
                }
            }

            if (timeLabelSpan) timeLabelSpan.textContent = "Temps";
            if (timeIcon) timeIcon.className = "fas fa-stopwatch text-green-500";

            if (timeElement) {
                let timeDisplay = '';
                const hasCompletedTime = race.time && race.time !== 'undefined' && race.time !== '00:00:00' && race.time.trim() !== '';
                const daysSinceRace = Math.floor((todayForTime.getTime() - raceDateOnlyForTime.getTime()) / (1000 * 60 * 60 * 24));

                if (raceDateOnlyForTime > todayForTime) {
                    timeDisplay = 'À venir';
                    timeElement.className = 'font-semibold text-yellow-600';
                } else if (raceDateOnlyForTime.getTime() === todayForTime.getTime()) {
                    if (hasCompletedTime) {
                        timeDisplay = race.time;
                        timeElement.className = 'font-semibold text-green-800';
                    } else {
                        timeDisplay = 'En cours';
                        timeElement.className = 'font-semibold text-green-600 animate-pulse';
                    }
                } else {
                    if (hasCompletedTime) {
                        timeDisplay = race.time;
                        timeElement.className = 'font-semibold text-green-800';
                    } else {
                        if (daysSinceRace >= 1 && daysSinceRace <= 10) {
                            timeDisplay = 'En attente...';
                            timeElement.className = 'font-semibold text-amber-600 animate-pulse';
                        } else {
                            timeDisplay = '/';
                            timeElement.className = 'font-semibold text-green-800';
                        }
                    }
                }

                if (fieldMatchesSearch(timeDisplay, searchQuery)) {
                    timeElement.innerHTML = highlightSearchMatch(timeDisplay, searchQuery);
                } else {
                    timeElement.textContent = timeDisplay;
                }

                // Prédiction IA personnalisée dans sa fenêtre dédiée au-dessus de Statistiques calculées (uniquement sur le dashboard)
                const aiPredictionContainer = document.getElementById('aiPredictionSection');
                if (aiPredictionContainer) {
                    const isRelayWithTime = race.terrain === 'relai' && (typeof userRelayTimeS !== 'undefined' && userRelayTimeS > 0);
                    const isTriathlonSolo = race.terrain === 'triathlon' && race.raceFormat !== 'team';

                    if (isDashboard && !hasCompletedTime && !isRelayWithTime && !isTriathlonSolo) {
                        const allAvailableRaces = window.allUserRaces || window.originalRaces || window.races || racesList || [];
                        const prediction = predictRacePerformance(race, allAvailableRaces);

                        if (prediction) {
                            const themeColors = getPredictionThemeColors();

                            let terrainBadgeName = 'Route';
                            let elevText = '';
                            if (prediction.targetTerrain === 'trail') {
                                terrainBadgeName = 'Trail';
                                if (prediction.targetElev > 0) {
                                    elevText = `• D+ ${prediction.targetElev}m`;
                                    terrainBadgeName = `Trail (+${prediction.targetElev}m)`;
                                }
                            } else if (prediction.targetTerrain === 'relai') {
                                terrainBadgeName = 'Relai';
                            } else if (prediction.targetTerrain) {
                                terrainBadgeName = prediction.targetTerrain.charAt(0).toUpperCase() + prediction.targetTerrain.slice(1);
                            }

                            aiPredictionContainer.innerHTML = `
                                <div class="${themeColors.bgClass} p-3 rounded-lg w-full border ${themeColors.borderClass} mb-4 shadow-sm transition-all duration-200">
                                    <h4 class="font-bold ${themeColors.headerTextClass} text-center mb-3 text-sm border-b ${themeColors.headerBorderClass} pb-2 flex items-center justify-center gap-2">
                                        <i class="fas fa-robot ${themeColors.iconColorClass}"></i>
                                        <span>Prédiction IA de la course</span>
                                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${themeColors.badgeClass} ml-1">
                                            ${terrainBadgeName}
                                        </span>
                                    </h4>
                                    <div class="flex flex-col gap-2 text-sm items-center">
                                        <div class="flex items-center justify-between w-full max-w-sm px-4">
                                            <span class="${themeColors.labelClass} font-medium">Temps estimé :</span>
                                            <span class="font-bold ${themeColors.valueClass} text-right text-base">${prediction.formattedTime}</span>
                                        </div>
                                        <div class="flex items-center justify-between w-full max-w-sm px-4">
                                            <span class="${themeColors.labelClass} font-medium">Allure estimée :</span>
                                            <span class="font-semibold ${themeColors.valueClass} text-right">${prediction.pace}/km</span>
                                        </div>
                                        <div class="flex items-center justify-between w-full max-w-sm px-4">
                                            <span class="${themeColors.labelClass} font-medium">Vitesse estimée :</span>
                                            <span class="font-semibold ${themeColors.valueClass} text-right">${prediction.speed} km/h</span>
                                        </div>
                                    </div>
                                    <p class="text-[10.5px] ${themeColors.labelClass} opacity-80 italic text-center mt-2.5 pt-2 border-t ${themeColors.headerBorderClass}">
                                        Basé sur vos ${prediction.basedOnRacesCount} courses passées • Distance : ${formatDist(prediction.targetDist)} km ${elevText}
                                    </p>
                                </div>
                            `;
                            aiPredictionContainer.classList.remove('hidden');
                        } else {
                            aiPredictionContainer.innerHTML = '';
                            aiPredictionContainer.classList.add('hidden');
                        }
                    } else {
                        aiPredictionContainer.innerHTML = '';
                        aiPredictionContainer.classList.add('hidden');
                    }
                }
            }
        }

        // Lieu
        const locationElement = document.getElementById('detailsLocation');
        if (locationElement) {
            if (race.location && race.location.trim() !== '') {
                if (fieldMatchesSearch(race.location, searchQuery)) {
                    locationElement.innerHTML = highlightSearchMatch(race.location, searchQuery);
                } else {
                    locationElement.textContent = race.location;
                }
                locationElement.style.cursor = 'pointer';
                locationElement.className = 'font-semibold underline text-green-800 hover:text-yellow-600 hover:underline cursor-pointer';
                locationElement.onclick = function () {
                    const query = encodeURIComponent(race.location);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                };
            } else {
                locationElement.textContent = '/';
                locationElement.style.cursor = 'default';
                locationElement.className = 'font-semibold text-green-800';
                locationElement.onclick = null;
            }
        }

        // Accompagnants
        const detailsCompanions = document.getElementById('detailsCompanions');
        if (detailsCompanions) {
            if (race.companions && race.companions.length > 0) {
                detailsCompanions.className = 'bg-green-50 rounded-lg p-4 mb-4 text-center block';
                const companionsLi = race.companions.map(comp => {
                    const name = typeof comp === 'object' ? comp.name : comp;
                    const type = typeof comp === 'object' ? comp.type : 'runner';
                    const iconClass = type === 'spectator' ? 'fa-eye' : 'fa-running';
                    return `<li class="flex items-center gap-2 text-sm text-green-800"><i class="fas ${iconClass} text-green-600 w-4"></i><span>${name}</span></li>`;
                }).join('');

                detailsCompanions.innerHTML = `
                    <h4 class="font-bold text-green-800 text-center mb-3 text-sm border-b border-green-200 pb-2">Accompagnants</h4>
                    <ul class="grid grid-cols-2 gap-1 text-left">
                        ${companionsLi}
                    </ul>`;
                detailsCompanions.classList.remove('hidden');
            } else {
                detailsCompanions.classList.add('hidden');
            }
        }

        // Relais & Hyrox
        let detailsRelayContainer = document.getElementById('detailsRelayContainer');
        if (!detailsRelayContainer) {
            detailsRelayContainer = document.createElement('div');
            detailsRelayContainer.id = 'detailsRelayContainer';
            const notesSection = document.querySelector('#detailsModal .mb-4:has(#detailsNotes)') || document.getElementById('detailsNotesContainer');
            if (notesSection && notesSection.parentNode) {
                notesSection.parentNode.insertBefore(detailsRelayContainer, notesSection.nextSibling);
            } else if (detailsCompanions && detailsCompanions.parentNode) {
                detailsCompanions.parentNode.insertBefore(detailsRelayContainer, detailsCompanions.nextSibling);
            }
        }

        if (race.terrain === 'relai' && race.relayLaps && race.relayLaps.length > 0) {
            const currentUserPseudo = window.currentUserPseudo || 'Moi';
            let totalRelayDist = 0, totalRelayElev = 0, totalRelayElevNeg = 0, totalRelayTimeS = 0;
            let userRelayDist = 0, userRelayElev = 0, userRelayElevNeg = 0, userRelayTimeS = 0;
            let userRelayCount = 0;
            let userRelayLaps = [];

            race.relayLaps.forEach((lap, idx) => {
                const d = parseFloat(lap.dist) || 0;
                const e = parseInt(lap.elev) || 0;
                const en = parseInt(lap.elevNeg) || 0;
                const s = timeToSeconds(lap.time);

                totalRelayDist += d;
                totalRelayElev += e;
                totalRelayElevNeg += en;
                totalRelayTimeS += s;

                const runnerLower = String(lap.runner || '').trim().toLowerCase();
                const isUser = !runnerLower || runnerLower === 'moi' || runnerLower === 'tous ensemble' || runnerLower === 'all' || (currentUserPseudo && runnerLower === currentUserPseudo.toLowerCase());
                if (isUser) {
                    userRelayDist += d;
                    userRelayElev += e;
                    userRelayElevNeg += en;
                    userRelayTimeS += s;
                    userRelayCount++;
                    userRelayLaps.push(idx + 1);
                }
            });
            const totalRelayCount = race.relayLaps.length;
            const hasStartHour = !!race.hour && race.relayLaps.every(lap => lap.time && lap.time.trim() !== '');
            const hasAnyComment = race.relayLaps.some(lap => lap.comment && lap.comment.trim() !== '');
            const showSubRowColumn = hasStartHour || hasAnyComment;

            function addTimeToHour(startHour, elapsedSeconds) {
                const [sh, sm] = startHour.split(':').map(Number);
                const totalSec = sh * 3600 + sm * 60 + Math.round(elapsedSeconds);
                const h = Math.floor(totalSec / 3600) % 24;
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;
                const pad = n => String(n).padStart(2, '0');
                return `${pad(h)}:${pad(m)}:${pad(s)}`;
            }

            let relayHtml = `
                <div class="bg-blue-50 p-3 rounded-lg w-full border border-blue-100 mb-4 shadow-sm">
                    <div class="flex items-center justify-between border-b border-blue-200 pb-2 mb-3">
                        <h4 class="font-bold text-blue-800 text-sm flex items-center gap-2">
                            <i class="fas fa-user text-blue-600"></i> Ma performance (${currentUserPseudo})
                        </h4>
                        <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase">Individuel</span>
                    </div>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div>
                            <p class="text-[10px] text-blue-600 uppercase">Distance</p>
                            <p class="font-bold text-blue-800 text-xs whitespace-nowrap">${userRelayDist.toFixed(2)}&nbsp;km</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-blue-600 uppercase">Dénivelé</p>
                            <p class="font-bold text-blue-800 text-[9px] sm:text-[11px] whitespace-nowrap">${(() => {
                    const dp = userRelayElev > 0 ? `\u2191${userRelayElev}m` : '';
                    const dn = userRelayElevNeg > 0 ? `\u2193${userRelayElevNeg}m` : '';
                    return [dp, dn].filter(Boolean).join(' ') || '0m';
                })()}</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-blue-600 uppercase">Temps</p>
                            <p class="font-bold text-blue-800 text-xs whitespace-nowrap">${secondsToTime(userRelayTimeS)}</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-blue-600 uppercase">Allure</p>
                            <p class="font-bold text-blue-800 text-xs whitespace-nowrap">${calculatePace(userRelayDist, userRelayTimeS)}</p>
                        </div>
                    </div>
                    <div class="mt-3 pt-2 border-t border-blue-200 flex items-center justify-center gap-2">
                        <i class="fas fa-person-running text-blue-500 text-xs"></i>
                        <span class="text-[11px] text-blue-700 font-semibold">${userRelayCount} relai${userRelayCount > 1 ? 's' : ''} effectué${userRelayCount > 1 ? 's' : ''} (${userRelayLaps.join(', ')})</span>
                    </div>
                </div>
            `;

            let cumulativeSeconds = 0;
            const relayLapsRowsHtml = race.relayLaps.map((lap, idx) => {
                const runnerLower = String(lap.runner || '').trim().toLowerCase();
                const isMoi = !runnerLower || runnerLower === 'moi' || (currentUserPseudo && runnerLower === currentUserPseudo.toLowerCase());
                const isTousEnsemble = runnerLower === 'tous ensemble' || runnerLower === 'all';
                const lapSeconds = timeToSeconds(lap.time);
                const departureTime = hasStartHour ? addTimeToHour(race.hour, cumulativeSeconds) : null;
                cumulativeSeconds += lapSeconds;
                const arrivalTime = hasStartHour ? addTimeToHour(race.hour, cumulativeSeconds) : null;
                const subRowId = `relay-sub-${idx}`;
                const showRowDetails = hasStartHour || (lap.comment && lap.comment.trim() !== '');
                const colCount = showSubRowColumn ? 6 : 5;
                const dp = lap.elev ? `\u2191${lap.elev}` : '';
                const dn = lap.elevNeg ? `\u2193${lap.elevNeg}` : '';
                const lapElevStr = [dp, dn].filter(Boolean).join(' ') || '-';
                const runnerDisplay = isTousEnsemble ? 'Tous' : (isMoi ? currentUserPseudo : (lap.runner === 'Personne' ? '-' : lap.runner));

                return `
                    <tr
                        class="${isMoi ? 'bg-blue-50/50 hover:bg-blue-100' : isTousEnsemble ? 'bg-purple-50/60 hover:bg-purple-100' : 'hover:bg-green-100'} transition-colors ${showRowDetails ? 'cursor-pointer select-none' : ''}"
                        ${showRowDetails ? `onclick="window.toggleRelayRow('${subRowId}', this)"` : ''}>
                        <td class="pl-1.5 pr-1 py-1 font-medium text-green-700 text-center">${idx + 1}</td>
                        <td class="pl-1 pr-2 py-1 ${isMoi ? 'font-bold text-blue-700' : isTousEnsemble ? 'font-bold text-purple-700' : ''}">${runnerDisplay}</td>
                        <td class="px-1.5 py-1">${formatDist(lap.dist)}</td>
                        <td class="px-1.5 py-1 whitespace-nowrap">${lapElevStr}</td>
                        <td class="px-1.5 py-1 font-mono text-xs">${lap.time || '-'}</td>
                        ${showSubRowColumn ? `<td class="px-1 py-1 text-center text-indigo-400">${showRowDetails ? '<i class="fas fa-chevron-down relay-chevron text-[9px] transition-transform duration-200"></i>' : ''}</td>` : ''}
                    </tr>
                    ${showRowDetails ? `
                    <tr id="${subRowId}" class="hidden">
                        <td colspan="${colCount}" class="px-3 py-2 bg-indigo-50 border-t border-indigo-100">
                            <div class="flex flex-col gap-2">
                                ${hasStartHour ? `
                                <div class="flex items-center justify-center gap-6 text-xs">
                                    <div class="flex items-center gap-1.5">
                                        <i class="fas fa-flag text-indigo-400 text-[10px]"></i>
                                        <span class="text-indigo-500 uppercase text-[10px] font-semibold">Départ</span>
                                        <span class="font-mono font-bold text-indigo-700">${departureTime}</span>
                                    </div>
                                    <div class="flex items-center gap-1.5">
                                        <i class="fas fa-flag-checkered text-indigo-400 text-[10px]"></i>
                                        <span class="text-indigo-500 uppercase text-[10px] font-semibold">Arrivée</span>
                                        <span class="font-mono font-bold text-indigo-700">${arrivalTime}</span>
                                    </div>
                                </div>` : ''}
                                ${lap.comment && lap.comment.trim() !== '' ? `
                                <div class="text-[11px] text-indigo-700 text-center ${hasStartHour ? 'mt-2 pt-2 border-t border-indigo-200/60' : ''}">
                                    <span class="font-semibold text-indigo-500"><i class="fas fa-comment text-indigo-400 mr-1 text-[10px]"></i> Commentaire :</span>
                                    <span class="italic text-indigo-800">${escapeHtml(lap.comment.trim())}</span>
                                </div>` : ''}
                            </div>
                        </td>
                    </tr>` : ''}
                `;
            }).join('');

            const totalRelayDp = totalRelayElev > 0 ? `\u2191${totalRelayElev}m` : '';
            const totalRelayDn = totalRelayElevNeg > 0 ? `\u2193${totalRelayElevNeg}m` : '';
            const totalRelayElevStr = [totalRelayDp, totalRelayDn].filter(Boolean).join(' ') || '-';

            const pdfBtnRelais = (typeof generateRelayTableOnlyPdf === 'function')
                ? `<span class="text-green-300">-</span>
                   <button onclick="generateRelayTableOnlyPdf('${race.id}')" class="group font-bold flex items-center gap-1 underline hover:text-orange-500 transition-colors" title="Télécharger uniquement le tableau détaillé en PDF">
                       <i class="fas fa-file-pdf text-green-600 group-hover:text-orange-500 transition-colors"></i> PDF Relais
                   </button>`
                : '';

            relayHtml += `
                <div class="bg-green-50 p-3 rounded-lg w-full border border-green-100 mb-4 shadow-sm">
                    <div class="flex items-center justify-between border-b border-green-200 pb-2 mb-3">
                        <h4 class="font-bold text-green-800 text-sm flex items-center gap-2">
                            <i class="fas fa-users text-green-600"></i> Performance du Groupe
                        </h4>
                        <span class="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold uppercase">Relais Complet</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left text-green-800">
                            <thead class="bg-green-100 text-green-900 uppercase font-semibold">
                                <tr>
                                    <th class="pl-1.5 pr-1 py-1 w-6 text-center">#</th>
                                    <th class="pl-1 pr-2 py-1">Coureur</th>
                                    <th class="px-1.5 py-1">Km</th>
                                    <th class="px-1.5 py-1">Dénivelé</th>
                                    <th class="px-1.5 py-1">Temps</th>
                                    ${showSubRowColumn ? '<th class="px-1 py-1 text-indigo-600 text-center" title="Cliquez sur une ligne pour voir les détails"><i class="fas fa-clock"></i></th>' : ''}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-green-200">
                                ${relayLapsRowsHtml}
                            </tbody>
                            <tfoot class="bg-green-100 font-bold">
                                <tr>
                                    <td colspan="2" class="pl-1.5 pr-2 py-1">Total Grp</td>
                                    <td class="px-1.5 py-1 whitespace-nowrap">${totalRelayDist.toFixed(2)}&nbsp;km</td>
                                    <td class="px-1.5 py-1 whitespace-nowrap">${totalRelayElevStr}</td>
                                    <td class="px-1.5 py-1 font-mono text-xs">${secondsToTime(totalRelayTimeS)}</td>
                                    ${showSubRowColumn ? '<td class="px-1 py-1"></td>' : ''}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="mt-3 pt-2 border-t border-green-200 flex items-center justify-center gap-2 text-[11px] text-green-700">
                        <i class="fas fa-flag-checkered text-green-500 text-xs"></i>
                        <span class="font-semibold">${totalRelayCount} relai${totalRelayCount > 1 ? 's' : ''} au total</span>
                        ${pdfBtnRelais}
                    </div>
                </div>
            `;

            // Stats coéquipiers
            const teamColors = [
                { bg: 'bg-orange-50', border: 'border-orange-200', headerBorder: 'border-orange-300', title: 'text-orange-800', sub: 'text-orange-600', badge: 'bg-orange-100 text-orange-800', foot: 'border-orange-200', icon: 'text-orange-500' },
                { bg: 'bg-violet-50', border: 'border-violet-200', headerBorder: 'border-violet-300', title: 'text-violet-800', sub: 'text-violet-600', badge: 'bg-violet-100 text-violet-800', foot: 'border-violet-200', icon: 'text-violet-500' },
                { bg: 'bg-rose-50', border: 'border-rose-200', headerBorder: 'border-rose-300', title: 'text-rose-800', sub: 'text-rose-600', badge: 'bg-rose-100 text-rose-800', foot: 'border-rose-200', icon: 'text-rose-500' },
                { bg: 'bg-teal-50', border: 'border-teal-200', headerBorder: 'border-teal-300', title: 'text-teal-800', sub: 'text-teal-600', badge: 'bg-teal-100 text-teal-800', foot: 'border-teal-200', icon: 'text-teal-500' },
                { bg: 'bg-amber-50', border: 'border-amber-200', headerBorder: 'border-amber-300', title: 'text-amber-800', sub: 'text-amber-600', badge: 'bg-amber-100 text-amber-800', foot: 'border-amber-200', icon: 'text-amber-500' },
                { bg: 'bg-cyan-50', border: 'border-cyan-200', headerBorder: 'border-cyan-300', title: 'text-cyan-800', sub: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-800', foot: 'border-cyan-200', icon: 'text-cyan-500' },
                { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', headerBorder: 'border-fuchsia-300', title: 'text-fuchsia-800', sub: 'text-fuchsia-600', badge: 'bg-fuchsia-100 text-fuchsia-800', foot: 'border-fuchsia-200', icon: 'text-fuchsia-500' },
                { bg: 'bg-lime-50', border: 'border-lime-200', headerBorder: 'border-lime-300', title: 'text-lime-800', sub: 'text-lime-600', badge: 'bg-lime-100 text-lime-800', foot: 'border-lime-200', icon: 'text-lime-500' },
            ];

            const teammateNames = [...new Set(
                race.relayLaps
                    .map(l => l.runner)
                    .filter(r => r && r !== 'Moi' && r !== 'Tous ensemble' && r !== 'Personne')
            )];

            if (teammateNames.length > 0) {
                const teammateStats = {};
                teammateNames.forEach(name => {
                    teammateStats[name] = { dist: 0, elev: 0, elevNeg: 0, timeS: 0, count: 0, laps: [] };
                });

                race.relayLaps.forEach((lap, idx) => {
                    const isTousEnsemble = lap.runner === 'Tous ensemble';
                    const targets = isTousEnsemble ? teammateNames : (lap.runner && lap.runner !== 'Moi' && lap.runner !== 'Personne' ? [lap.runner] : []);
                    const d = parseFloat(lap.dist) || 0;
                    const e = parseInt(lap.elev) || 0;
                    const en = parseInt(lap.elevNeg) || 0;
                    const s = timeToSeconds(lap.time);
                    targets.forEach(name => {
                        if (teammateStats[name]) {
                            teammateStats[name].dist += d;
                            teammateStats[name].elev += e;
                            teammateStats[name].elevNeg += en;
                            teammateStats[name].timeS += s;
                            teammateStats[name].count++;
                            teammateStats[name].laps.push(idx + 1);
                        }
                    });
                });

                const teammateCardsHtml = teammateNames.map((name, idx) => {
                    const c = teamColors[idx % teamColors.length];
                    const st = teammateStats[name];
                    const tDp = st.elev > 0 ? `\u2191${st.elev}m` : '';
                    const tDn = st.elevNeg > 0 ? `\u2193${st.elevNeg}m` : '';
                    const teammateElevStr = [tDp, tDn].filter(Boolean).join(' ') || '0m';

                    return `
                        <div class="${c.bg} p-3 rounded-lg w-full border ${c.border} shadow-sm">
                            <div class="flex items-center justify-between border-b ${c.headerBorder} pb-2 mb-3">
                                <h4 class="font-bold ${c.title} text-sm flex items-center gap-2">
                                    <i class="fas fa-user ${c.icon}"></i> ${name}
                                </h4>
                                <span class="text-[10px] ${c.badge} px-2 py-0.5 rounded-full font-bold uppercase">Coéquipier</span>
                            </div>
                            <div class="grid grid-cols-4 gap-2 text-center">
                                <div>
                                    <p class="text-[10px] ${c.sub} uppercase">Distance</p>
                                    <p class="font-bold ${c.title} text-xs whitespace-nowrap">${st.dist.toFixed(2)}&nbsp;km</p>
                                </div>
                                <div>
                                    <p class="text-[10px] ${c.sub} uppercase">Dénivelé</p>
                                    <p class="font-bold ${c.title} text-[9px] sm:text-[11px] whitespace-nowrap">${teammateElevStr}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] ${c.sub} uppercase">Temps</p>
                                    <p class="font-bold ${c.title} text-xs whitespace-nowrap">${secondsToTime(st.timeS)}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] ${c.sub} uppercase">Allure</p>
                                    <p class="font-bold ${c.title} text-xs whitespace-nowrap">${calculatePace(st.dist, st.timeS)}</p>
                                </div>
                            </div>
                            <div class="mt-3 pt-2 border-t ${c.foot} flex items-center justify-center gap-2">
                                <i class="fas fa-person-running ${c.icon} text-xs"></i>
                                <span class="text-[11px] ${c.title} font-semibold">${st.count} relai${st.count > 1 ? 's' : ''} effectué${st.count > 1 ? 's' : ''} (${st.laps.join(', ')})</span>
                            </div>
                        </div>
                    `;
                }).join('');

                relayHtml += `
                    <div class="w-full mb-2">
                        <button
                            onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('i.toggle-chevron').classList.toggle('rotate-180')"
                            class="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                            <i class="fas fa-users text-green-500 text-[10px]"></i>
                            Détail par coéquipier
                            <i class="fas fa-chevron-down toggle-chevron text-[10px] text-green-500 transition-transform duration-200"></i>
                        </button>
                        <div class="hidden mt-3 space-y-3">
                            ${teammateCardsHtml}
                        </div>
                    </div>
                `;
            }

            detailsRelayContainer.innerHTML = relayHtml;
            detailsRelayContainer.classList.remove('hidden');

            // Mise à jour des carrés principaux du haut avec les valeurs personnelles de l'utilisateur
            const relayElevElement = document.getElementById('detailsElevation');
            if (relayElevElement) {
                relayElevElement.className = 'font-semibold text-green-800 text-sm';
                const hasD = userRelayElev > 0;
                const hasDNeg = userRelayElevNeg > 0;
                if (hasD || hasDNeg) {
                    let elevStr = hasD ? `D+ ${userRelayElev}m` : '';
                    if (hasDNeg) elevStr += (elevStr ? ' / ' : '') + `D- ${userRelayElevNeg}m`;
                    relayElevElement.textContent = elevStr;
                } else if (race.elevation && !isNaN(race.elevation)) {
                    let elevStr = `D+ ${race.elevation}m`;
                    if (race.elevationNeg) elevStr += ` / D- ${race.elevationNeg}m`;
                    relayElevElement.textContent = elevStr;
                } else {
                    relayElevElement.textContent = '/';
                }
            }

            const relayDistElement = document.getElementById('detailsDistance');
            if (relayDistElement && userRelayDist > 0) {
                relayDistElement.textContent = `${formatDist(userRelayDist)} km`;
            }

            const relayTimeElement = document.getElementById('detailsTime');
            if (relayTimeElement && userRelayTimeS > 0) {
                relayTimeElement.textContent = secondsToTime(userRelayTimeS);
                relayTimeElement.className = 'font-semibold text-green-800';
                const aiPred = document.getElementById('aiPredictionSection');
                if (aiPred) {
                    aiPred.innerHTML = '';
                    aiPred.classList.add('hidden');
                }
            }

        } else if (race.terrain === 'hyrox' && race.hyroxLaps && race.hyroxLaps.length > 0) {
            const hyroxEvents = window.hyroxEvents || [
                "1km Run", "1000m SkiErg", "1km Run", "50m Sled Push",
                "1km Run", "50m Sled Pull", "1km Run", "80m Burpee Broad Jumps",
                "1km Run", "1000m Rowing", "1km Run", "200m Farmers Carry",
                "1km Run", "100m Sandbag Lunges", "1km Run", "75/100 Wall Balls"
            ];
            const hyroxRowsHtml = hyroxEvents.map((eventName, idx) => {
                const lapTime = race.hyroxLaps[idx] || '-';
                return `
                    <tr class="hover:bg-orange-100 transition-colors">
                        <td class="px-2 py-1 font-medium text-orange-700">${eventName}</td>
                        <td class="px-2 py-1 font-mono text-xs">${lapTime}</td>
                    </tr>
                `;
            }).join('');

            const hyroxHtml = `
                <div class="bg-orange-50 p-3 rounded-lg w-full border border-orange-100 mb-4 shadow-sm">
                    <h4 class="font-bold text-orange-800 text-center mb-3 text-sm border-b border-orange-200 pb-2">Détails Hyrox</h4>
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left text-orange-800">
                            <thead class="bg-orange-100 text-orange-900 uppercase font-semibold">
                                <tr>
                                    <th class="px-2 py-1">Étape</th>
                                    <th class="px-2 py-1">Temps</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-orange-200">
                                ${hyroxRowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            detailsRelayContainer.innerHTML = hyroxHtml;
            detailsRelayContainer.classList.remove('hidden');
        } else {
            detailsRelayContainer.innerHTML = '';
            detailsRelayContainer.classList.add('hidden');
        }

        // Statistiques calculées
        let distance = parseFloat(race.distance);
        let elevation = parseFloat(race.elevation);

        if (race.terrain === 'triathlon') {
            if (race.raceFormat === 'team') {
                if (race.raceRelaySport === 'swim') {
                    distance = parseFloat(race.swimDistance) / 1000;
                    elevation = 0;
                } else if (race.raceRelaySport === 'bike') {
                    distance = parseFloat(race.bikeDistance);
                    elevation = parseFloat(race.bikeElevation);
                } else if (race.raceRelaySport === 'run') {
                    elevation = parseFloat(race.runElevation);
                }
            } else {
                const swimKm = (parseFloat(race.swimDistance) || 0) / 1000;
                const bikeKm = parseFloat(race.bikeDistance) || 0;
                const runKm = parseFloat(race.distance) || 0;
                distance = swimKm + bikeKm + runKm;
            }
        }

        const timeStr = race.time;
        const isTodayForSpeed = raceDateOnly.getTime() === todayForTime.getTime();
        const isUpcomingForSpeed = raceDateOnly > todayForTime;
        const hasCompletedTime = timeStr && timeStr !== '00:00:00' && timeStr.trim() !== '';

        let statsList = [];

        // Prix / km
        if (race.price && !isNaN(parseFloat(race.price)) && !isNaN(distance) && distance > 0) {
            const price = parseFloat(race.price);
            const pricePerKm = price / distance;
            statsList.push({ label: 'Prix au km', value: `${pricePerKm.toFixed(2)} €/km` });

            if (!isNaN(elevation) && elevation > 0) {
                const equivalentDistance = distance + (elevation / 100);
                const pricePerKmWithElevation = price / equivalentDistance;
                statsList.push({ label: 'Prix au km (ft. déniv.)', value: `${pricePerKmWithElevation.toFixed(3)} €/km` });
            }
        }

        // Triathlon stats totales
        if (race.terrain === 'triathlon' && race.raceFormat !== 'team') {
            if (race.time && race.time !== '00:00:00') {
                statsList.push({ label: 'Temps total', value: race.time });
            }
            if (race.elevation && !isNaN(race.elevation)) {
                statsList.push({ label: 'Dénivelé total D+', value: `${race.elevation} m` });
            }
            if (race.elevationNeg && !isNaN(race.elevationNeg)) {
                statsList.push({ label: 'Dénivelé total D-', value: `${race.elevationNeg} m` });
            }
        }

        // Vitesse moyenne
        const shouldShowSpeed = !isUpcomingForSpeed &&
            !(isTodayForSpeed && !hasCompletedTime) &&
            !isNaN(distance) &&
            hasCompletedTime;

        if (shouldShowSpeed) {
            const parts = timeStr.split(':');
            let hours = 0;
            if (parts.length === 3) {
                hours = parseInt(parts[0]) + parseInt(parts[1]) / 60 + parseInt(parts[2]) / 3600;
            } else if (parts.length === 2) {
                hours = parseInt(parts[0]) + parseInt(parts[1]) / 60;
            } else {
                hours = parseInt(parts[0]);
            }

            if (hours > 0) {
                const speed = distance / hours;
                const timePerKm = 60 / speed;
                statsList.push({ label: 'Vitesse moyenne', value: `${speed.toFixed(2)} km/h` });
                statsList.push({ label: 'Moyenne au km', value: `${timePerKm.toFixed(2)} min/km` });
                const isSwimRace = (race.terrain === 'triathlon' && race.raceFormat === 'team' && race.raceRelaySport === 'swim') || race.terrain === 'natation' || race.raceRelaySport === 'swim';
                if (isSwimRace) {
                    const totalSecs100m = Math.round((timePerKm * 60) / 10);
                    const mins100m = Math.floor(totalSecs100m / 60);
                    const secs100m = totalSecs100m % 60;
                    statsList.push({ label: 'Moyenne au 100m', value: `${mins100m}:${String(secs100m).padStart(2, '0')} min/100m` });
                }
            }
        }

        const avgSpeedContainer = document.getElementById('averageSpeedInfo');
        if (avgSpeedContainer) {
            if (statsList.length > 0) {
                const statsItemsHtml = statsList.map(item => `
                    <div class="flex items-center justify-between w-full max-w-sm px-4">
                        <span class="text-green-600">${item.label} :</span>
                        <span class="font-semibold text-green-800 text-right">${item.value}</span>
                    </div>
                `).join('');

                avgSpeedContainer.innerHTML = `
                    <div class="bg-green-50 p-3 rounded-lg w-full border border-green-100 mb-4 shadow-sm">
                        <h4 class="font-bold text-green-800 text-center mb-3 text-sm border-b border-green-200 pb-2">Statistiques calculées</h4>
                        <div class="flex flex-col gap-2 text-sm items-center">
                            ${statsItemsHtml}
                        </div>
                    </div>`;
                avgSpeedContainer.className = "mb-2 w-full";
            } else {
                avgSpeedContainer.innerHTML = '';
            }
        }

        // Notes
        const notesElement = document.getElementById('detailsNotes');
        const notesLabel = document.getElementById('detailsNotesLabel');
        const notesSection = document.getElementById('detailsNotesContainer') || (notesElement ? notesElement.parentElement : null);

        if (notesElement && race.notes && race.notes.replace(/<[^>]*>/g, '').trim() !== '') {
            if (notesSection) notesSection.classList.remove('hidden');
            if (notesLabel) notesLabel.textContent = 'Note';

            let formattedNotes = race.notes;
            if (!formattedNotes.includes('<a ') && !formattedNotes.includes('<a\n')) {
                const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
                formattedNotes = formattedNotes.replace(urlRegex, (url) => {
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-800 underline break-all font-medium transition-colors" onclick="event.stopPropagation();">${url}</a>`;
                });
            } else {
                formattedNotes = formattedNotes.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>(.*?)<\/a>/gi, (match, href, rest, text) => {
                    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-800 underline break-all font-medium transition-colors" onclick="event.stopPropagation();">${text}</a>`;
                });
            }

            if (fieldMatchesSearch(race.notes, searchQuery) && !race.notes.includes('<')) {
                notesElement.innerHTML = highlightSearchMatch(formattedNotes, searchQuery);
            } else {
                notesElement.innerHTML = formattedNotes;
            }
        } else {
            if (notesSection) notesSection.classList.add('hidden');
        }

        // Prix
        const priceContainer = document.getElementById('detailsPriceContainer');
        const priceElement = document.getElementById('detailsPrice');
        if (priceElement && priceContainer) {
            if (race.price !== undefined && race.price !== null && race.price !== '') {
                const priceValue = parseFloat(race.price);
                if (!isNaN(priceValue)) {
                    const priceText = `${priceValue.toFixed(2)} €`;
                    if (fieldMatchesSearch(race.price, searchQuery) || fieldMatchesSearch('€', searchQuery)) {
                        priceElement.innerHTML = highlightSearchMatch(priceText, searchQuery);
                    } else {
                        priceElement.textContent = priceText;
                    }
                    priceContainer.style.display = '';
                } else {
                    priceElement.textContent = '/';
                    priceContainer.style.display = '';
                }
            } else {
                priceElement.textContent = '/';
                priceContainer.style.display = '';
            }
        }

        // Classement
        const rankingContainer = document.getElementById('detailsRankingContainer');
        const rankingElement = document.getElementById('detailsRanking');
        const genderRankingContainer = document.getElementById('detailsGenderRankingContainer');
        const genderRankingElement = document.getElementById('detailsGenderRanking');
        const rankingSeparator = document.getElementById('detailsRankingSeparator');
        const isRaceUpcoming = raceDateOnlyForTime > todayForTime;

        if (rankingContainer && rankingElement) {
            if (isRaceUpcoming) {
                rankingContainer.classList.remove('flex');
                rankingContainer.classList.add('hidden');
            } else if (race.rankPos || race.rankGenderPos) {
                rankingContainer.classList.remove('hidden');
                rankingContainer.classList.add('flex');

                const hasGeneral = race.rankPos != null && race.rankPos !== '';
                const hasGender = race.rankGenderPos != null && race.rankGenderPos !== '';

                const topLabel = document.getElementById('detailsRankingTopLabel');
                const generalWrapper = document.getElementById('detailsGeneralRankingWrapper') || rankingElement.parentElement;
                const generalTextLabel = document.getElementById('detailsGeneralLabelText') || generalWrapper.querySelector('p span.font-medium');
                const generalIcon = document.getElementById('detailsGeneralIcon') || generalWrapper.querySelector('i.fa-medal');
                const genderTextLabel = document.getElementById('detailsGenderLabelText') || document.querySelector('#detailsGenderRankingContainer p span.font-medium');
                const genderIcon = document.getElementById('detailsGenderIcon') || document.querySelector('#detailsGenderRankingContainer i.fa-venus-mars');

                if (hasGeneral && hasGender && topLabel) {
                    topLabel.classList.remove('hidden');
                    topLabel.classList.add('flex');
                } else if (topLabel) {
                    topLabel.classList.add('hidden');
                    topLabel.classList.remove('flex');
                }

                if (hasGeneral) {
                    generalWrapper.classList.remove('hidden');
                    generalWrapper.classList.add('flex');
                    if (race.rankTotal) rankingElement.textContent = `${race.rankPos} / ${race.rankTotal}`;
                    else rankingElement.textContent = `${race.rankPos}e`;

                    if (!hasGender) {
                        if (generalTextLabel) {
                            generalTextLabel.classList.remove('hidden');
                            generalTextLabel.textContent = "Classement général :";
                        }
                        if (generalIcon) generalIcon.classList.remove('hidden');
                    } else {
                        if (generalTextLabel) {
                            generalTextLabel.classList.remove('hidden');
                            generalTextLabel.textContent = "Général :";
                        }
                        if (generalIcon) generalIcon.classList.add('hidden');
                    }
                } else {
                    generalWrapper.classList.add('hidden');
                    generalWrapper.classList.remove('flex');
                }

                if (rankingSeparator) {
                    if (hasGeneral && hasGender) {
                        rankingSeparator.classList.remove('hidden', 'sm:hidden');
                        rankingSeparator.classList.add('hidden', 'sm:block');
                    } else {
                        rankingSeparator.classList.remove('sm:block');
                        rankingSeparator.classList.add('hidden');
                    }
                }

                if (genderRankingContainer && genderRankingElement) {
                    if (hasGender) {
                        genderRankingContainer.classList.remove('hidden');
                        genderRankingContainer.classList.add('flex');
                        if (race.rankGenderTotal) genderRankingElement.textContent = `${race.rankGenderPos} / ${race.rankGenderTotal}`;
                        else genderRankingElement.textContent = `${race.rankGenderPos}e`;

                        if (!hasGeneral) {
                            if (genderTextLabel) {
                                genderTextLabel.classList.remove('hidden');
                                genderTextLabel.textContent = "Classement par Genre / Catégorie :";
                            }
                            if (genderIcon) {
                                genderIcon.classList.remove('fa-venus-mars', 'hidden');
                                genderIcon.classList.add('fa-medal');
                            }
                        } else {
                            if (genderTextLabel) {
                                genderTextLabel.classList.remove('hidden');
                                genderTextLabel.textContent = "Genre/Cat. :";
                            }
                            if (genderIcon) {
                                genderIcon.classList.remove('fa-medal', 'hidden');
                                genderIcon.classList.add('fa-venus-mars', 'hidden');
                            }
                        }
                    } else {
                        genderRankingContainer.classList.add('hidden');
                        genderRankingContainer.classList.remove('flex');
                    }
                }
            } else {
                rankingContainer.classList.remove('flex');
                rankingContainer.classList.add('hidden');
            }
        }

        // Photo & Parcours
        const photoContainer = document.getElementById('detailsPhotoContainer');
        const photo = document.getElementById('detailsPhoto');
        const parcoursBtn = document.getElementById('voirParcoursBtn');
        const parcoursImg = document.getElementById('detailsParcours');
        const parcoursContainer = document.getElementById('detailsParcoursContainer');
        const detailImageTitle = document.getElementById('DetailImageTitle');
        let showParcours = false;

        const zoomHelper = (src) => {
            if (typeof zoomImage === 'function') {
                zoomImage(src);
            } else if (typeof window.zoomImage === 'function') {
                window.zoomImage(src);
            } else if (src) {
                window.open(src, '_blank');
            }
        };

        if (photo) {
            photo.onclick = (e) => {
                e.stopPropagation();
                if (photo.src) zoomHelper(photo.src);
            };
        }
        if (parcoursImg) {
            parcoursImg.onclick = (e) => {
                e.stopPropagation();
                if (parcoursImg.src) zoomHelper(parcoursImg.src);
            };
        }

        let parcoursPlaceholder = document.getElementById('detailsParcoursPlaceholder');
        if (!parcoursPlaceholder && parcoursContainer) {
            parcoursPlaceholder = document.createElement('div');
            parcoursPlaceholder.id = 'detailsParcoursPlaceholder';
            parcoursPlaceholder.className = 'mb-4 flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200';
            parcoursPlaceholder.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="mt-2 text-sm text-gray-400">Aucune image sélectionnée</p>
            `;
            parcoursContainer.appendChild(parcoursPlaceholder);
        }

        let photoPlaceholder = document.getElementById('detailsPhotoPlaceholder');
        if (!photoPlaceholder && photoContainer) {
            photoPlaceholder = document.createElement('div');
            photoPlaceholder.id = 'detailsPhotoPlaceholder';
            photoPlaceholder.className = 'mb-4 flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200';
            photoPlaceholder.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="mt-2 text-sm text-gray-400">Aucune image sélectionnée</p>
            `;
            photoContainer.appendChild(photoPlaceholder);
        }

        function updateImageDisplay() {
            if (showParcours) {
                if (photoContainer) photoContainer.classList.add('hidden');
                if (parcoursContainer) parcoursContainer.classList.remove('hidden');
                if (parcoursBtn) {
                    parcoursBtn.innerHTML = '<i class="fas fa-camera text-xs"></i> <span>Image course</span>';
                }
                if (detailImageTitle) {
                    detailImageTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> <span>Course</span>';
                }
                if (race.parcours) {
                    if (parcoursImg) {
                        parcoursImg.src = race.parcours;
                        parcoursImg.classList.remove('hidden');
                    }
                    if (parcoursPlaceholder) parcoursPlaceholder.classList.add('hidden');
                } else {
                    if (parcoursImg) parcoursImg.classList.add('hidden');
                    if (parcoursPlaceholder) parcoursPlaceholder.classList.remove('hidden');
                }
            } else {
                if (photoContainer) photoContainer.classList.remove('hidden');
                if (parcoursContainer) parcoursContainer.classList.add('hidden');
                if (parcoursBtn) {
                    parcoursBtn.innerHTML = '<i class="fas fa-map-marked-alt text-xs"></i> <span>Image parcours</span>';
                }
                if (detailImageTitle) {
                    detailImageTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> <span>Parcours</span>';
                }
                if (race.photo) {
                    if (photoImg) {
                        photoImg.src = race.photo;
                        photoImg.classList.remove('hidden');
                    }
                    if (photoPlaceholder) photoPlaceholder.classList.add('hidden');
                } else {
                    if (photoImg) photoImg.classList.add('hidden');
                    if (photoPlaceholder) photoPlaceholder.classList.remove('hidden');
                }
            }
        }

        const photoImg = document.getElementById('detailsPhoto');
        if (race.photo && photoImg) photoImg.src = race.photo;
        if (race.parcours && parcoursImg) parcoursImg.src = race.parcours;

        showParcours = false;
        updateImageDisplay();

        if (parcoursBtn) {
            parcoursBtn.onclick = function (e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                showParcours = !showParcours;
                updateImageDisplay();
            };
        }

        // Timestamps création / modification (Métadonnées strictement privées pour le tableau de bord)
        const timestampsElement = document.getElementById('detailsTimestamps');
        if (timestampsElement) {
            if (isOnPublicPage || effectivePrivacy) {
                timestampsElement.textContent = '';
                timestampsElement.classList.add('hidden');
            } else {
                timestampsElement.classList.remove('hidden');
                let timestampHtml = '';
                const formatOpts = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };

                let createdStr = '';
                if (race.createdAt) {
                    const cDate = (typeof race.createdAt.toDate === 'function') ? race.createdAt.toDate() : new Date(race.createdAt);
                    if (!isNaN(cDate.getTime())) {
                        createdStr = `Créée le ${cDate.toLocaleDateString('fr-FR', formatOpts)}`;
                    }
                }

                let updatedStr = '';
                if (race.updatedAt) {
                    const uDate = (typeof race.updatedAt.toDate === 'function') ? race.updatedAt.toDate() : new Date(race.updatedAt);
                    if (!isNaN(uDate.getTime())) {
                        updatedStr = `Modifiée le ${uDate.toLocaleDateString('fr-FR', formatOpts)}`;
                    }
                }

                if (createdStr) {
                    timestampHtml = createdStr;
                    if (updatedStr && updatedStr !== createdStr) {
                        timestampHtml += ` | ${updatedStr}`;
                    }
                } else if (updatedStr) {
                    timestampHtml = updatedStr;
                }

                timestampsElement.textContent = timestampHtml;
            }
        }

        // Terrain label
        const detailTerrainText = document.getElementById('DetailTerrainText');
        const detailBadgeText = document.getElementById('DetailBadgeButton');
        let terrainLabel = '/';
        if (race.terrain) {
            switch (race.terrain) {
                case 'route': terrainLabel = 'Route'; break;
                case 'trail': terrainLabel = 'Trail'; break;
                case 'triathlon': terrainLabel = 'Triathlon'; break;
                case 'relai': terrainLabel = 'Relai'; break;
                default: terrainLabel = race.terrain.charAt(0).toUpperCase() + race.terrain.slice(1);
            }
        }
        if (detailTerrainText) detailTerrainText.textContent = terrainLabel;

        // Badges, J'aime et Dossard
        const badgeButton = document.getElementById('BadgeButton');
        const gridContainer = badgeButton ? badgeButton.parentElement : null;

        let likesRow = document.getElementById('detailsLikesRow');
        if (likesRow) likesRow.remove();
        let bibRow = document.getElementById('detailsBibBottomRow');
        if (bibRow) bibRow.remove();

        const bibContainer = document.getElementById('detailsBibContainer');
        const bibText = document.getElementById('detailsBibText');
        if (bibContainer) bibContainer.classList.add('hidden');

        const rawBib = (race.bibNumber !== undefined && race.bibNumber !== null) ? String(race.bibNumber).trim() : '';
        const bibVal = rawBib.slice(0, 6);
        const hasBib = bibVal !== '';
        const bibDisplay = hasBib ? (fieldMatchesSearch(bibVal, searchQuery) ? highlightSearchMatch(bibVal, searchQuery) : bibVal) : '';

        if (badgeButton) {
            const badgeTitleP = badgeButton.querySelector('p');
            if (badgeTitleP) {
                badgeTitleP.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                    <span>Badge</span>
                `;
            }
        }

        const likedBy = race.likedBy || [];
        const likeCount = likedBy.length;
        const likeText = `${likeCount} like${likeCount > 1 ? 's' : ''}`;

        // Nettoyer les anciennes cocardes inclinées
        document.querySelectorAll('#detailsModal .record-corner-cocarde').forEach(el => el.remove());

        if (typeof calculateRecordCocardes === 'function' && typeof races !== 'undefined') {
            window.recordCocardes = calculateRecordCocardes(races);
        }

        const raceCocardesInfo = (window.recordCocardes && window.recordCocardes.byRaceId && window.recordCocardes.byRaceId[race.id]) ? window.recordCocardes.byRaceId[race.id] : null;

        const createCornerCocarde = (title) => {
            const div = document.createElement('div');
            div.className = 'record-corner-cocarde absolute -top-3 -right-3 z-20 pointer-events-auto cursor-help transform rotate-12 hover:rotate-0 transition-transform duration-300';
            div.setAttribute('title', `🏆 ${title}`);
            div.innerHTML = `
                <div class="relative scale-75">
                    <div class="absolute top-0 right-1/2 translate-x-1/2 mt-4">
                        <div class="relative">
                            <div class="absolute top-0 right-0 h-8 w-3 bg-red-600 transform -rotate-15 origin-top-right rounded-sm shadow-sm"></div>
                            <div class="absolute top-0 left-0 h-8 w-3 bg-blue-600 transform rotate-15 origin-top-left rounded-sm shadow-sm"></div>
                        </div>
                    </div>
                    <div class="relative bg-white text-blue-900 rounded-full w-8 h-8 flex items-center justify-center border-4 border-red-600 shadow-md z-10">
                        <div class="bg-blue-800 rounded-full w-3 h-3"></div>
                    </div>
                </div>
            `;
            return div;
        };

        if (raceCocardesInfo) {
            if (raceCocardesInfo.hasPace && timeElement && timeElement.parentElement) {
                timeElement.parentElement.classList.add('relative');
                timeElement.parentElement.appendChild(createCornerCocarde(`Record : RP Allure au km (${raceCocardesInfo.paceInfo.formattedPace})`));
            }
            if (raceCocardesInfo.hasElevation && elevationElement && elevationElement.parentElement) {
                elevationElement.parentElement.classList.add('relative');
                elevationElement.parentElement.appendChild(createCornerCocarde(`Record : Plus grand dénivelé (${raceCocardesInfo.elevationInfo.formattedElevation})`));
            }
            if (raceCocardesInfo.hasDistance && distanceElement && distanceElement.parentElement) {
                distanceElement.parentElement.classList.add('relative');
                distanceElement.parentElement.appendChild(createCornerCocarde(`Record : Plus longue distance (${raceCocardesInfo.distanceInfo.formattedDistance})`));
            }
        }

        let hasBadges = false;
        let badgeHtml = '<span class="text-xs text-gray-400 font-normal italic">/</span>';

        if (raceCocardesInfo && (raceCocardesInfo.hasPace || raceCocardesInfo.hasElevation || raceCocardesInfo.hasDistance)) {
            hasBadges = true;
            const badgesPills = [];
            const cocardesCount = (raceCocardesInfo.hasPace ? 1 : 0) + (raceCocardesInfo.hasDistance ? 1 : 0) + (raceCocardesInfo.hasElevation ? 1 : 0);

            const isSingle = cocardesCount === 1;
            const isDouble = cocardesCount === 2;

            const padClass = isSingle ? 'px-2 py-1.5' : (isDouble ? 'px-1.5 py-1' : 'px-1 py-0.5');
            const textClass = isSingle ? 'text-[11px]' : (isDouble ? 'text-[10px]' : 'text-[9px]');
            const valTextClass = isSingle ? 'text-[10.5px]' : (isDouble ? 'text-[9.5px]' : 'text-[8.5px]');

            if (raceCocardesInfo.hasPace) {
                badgesPills.push(`
                    <div class="w-full ${padClass} bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-md flex items-center justify-between gap-1 ${textClass} font-medium shadow-2xs cursor-pointer transition select-none" onclick="if(typeof displayRaceBadgesModal === 'function') displayRaceBadgesModal();" title="Record Personnel Allure / Temps : ${raceCocardesInfo.paceInfo.formattedPace}">
                        <div class="flex items-center gap-1 min-w-0 truncate">
                            <span class="shrink-0">⚡</span>
                            <span class="font-semibold truncate">RP Allure</span>
                        </div>
                        <span class="font-bold text-amber-900 bg-white/90 px-1 py-0.2 rounded border border-amber-200 shrink-0 ${valTextClass}">${raceCocardesInfo.paceInfo.formattedPace}</span>
                    </div>
                `);
            }
            if (raceCocardesInfo.hasDistance) {
                badgesPills.push(`
                    <div class="w-full ${padClass} bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 rounded-md flex items-center justify-between gap-1 ${textClass} font-medium shadow-2xs cursor-pointer transition select-none" onclick="if(typeof displayRaceBadgesModal === 'function') displayRaceBadgesModal();" title="Course la Plus Longue : ${raceCocardesInfo.distanceInfo.formattedDistance}">
                        <div class="flex items-center gap-1 min-w-0 truncate">
                            <span class="shrink-0">🏃‍♂️</span>
                            <span class="font-semibold truncate">Distance</span>
                        </div>
                        <span class="font-bold text-blue-900 bg-white/90 px-1 py-0.2 rounded border border-blue-200 shrink-0 ${valTextClass}">${raceCocardesInfo.distanceInfo.formattedDistance}</span>
                    </div>
                `);
            }
            if (raceCocardesInfo.hasElevation) {
                badgesPills.push(`
                    <div class="w-full ${padClass} bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-md flex items-center justify-between gap-1 ${textClass} font-medium shadow-2xs cursor-pointer transition select-none" onclick="if(typeof displayRaceBadgesModal === 'function') displayRaceBadgesModal();" title="Plus Grand Dénivelé : ${raceCocardesInfo.elevationInfo.formattedElevation}">
                        <div class="flex items-center gap-1 min-w-0 truncate">
                            <span class="shrink-0">⛰️</span>
                            <span class="font-semibold truncate">Dénivelé D+</span>
                        </div>
                        <span class="font-bold text-emerald-900 bg-white/90 px-1 py-0.2 rounded border border-emerald-200 shrink-0 ${valTextClass}">${raceCocardesInfo.elevationInfo.formattedElevation}</span>
                    </div>
                `);
            }

            badgeHtml = `<div class="flex flex-col gap-1 w-full justify-center my-auto">${badgesPills.join('')}</div>`;
        }

        const isAccountPublicForLikes = (typeof window.prefAccountPublicRaces !== 'undefined')
            ? (window.prefAccountPublicRaces === true)
            : (localStorage.getItem('prefAccountPublicRaces') !== 'false');
        const likesLockIcon = (!isAccountPublicForLikes)
            ? `<i class="fas fa-lock text-green-500 cursor-pointer" title="Votre compte est privé (courses privées), elles ne peuvent pas recevoir de J'aime de la communauté" onclick="event.stopPropagation(); const prm=document.getElementById('privateRaceModal'); if(prm) prm.classList.remove('hidden');"></i>`
            : '';

        if (hasBadges) {
            if (detailBadgeText) detailBadgeText.innerHTML = badgeHtml;

            const likeHoverHtml = (likeCount > 0) ? `
                <div class="like-hover-trigger-modal inline-flex items-center gap-2 cursor-help relative group/likes-modal"
                     data-liked-by='${JSON.stringify(likedBy)}'>
                    <span class="font-normal text-green-800 flex items-center gap-2">${likeText}</span>
                    ${likesLockIcon}

                    <div class="liker-tooltip hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-white border border-red-100 shadow-xl rounded-xl p-3 z-[100]">
                        <p class="text-[10px] text-gray-400 mb-2 border-b pb-1 font-bold uppercase tracking-wider">Aimé par :</p>
                        <ul class="liker-list space-y-2 max-h-40 overflow-y-auto">
                            <li class="text-[10px] italic text-gray-400">Chargement...</li>
                        </ul>
                        <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-red-100 transform rotate-45"></div>
                    </div>
                </div>
            ` : `<span class="font-normal text-green-800 flex items-center gap-2">${likeText} ${likesLockIcon}</span>`;

            likesRow = document.createElement('div');
            likesRow.id = 'detailsLikesRow';

            if (hasBib) {
                likesRow.className = 'grid grid-cols-2 gap-4 mb-4';
                likesRow.innerHTML = `
                    <div class="bg-green-50 p-3 rounded-lg flex flex-col justify-center">
                        <p class="text-sm text-green-600 flex items-center gap-2 mb-1">
                            <i class="fas fa-heart text-green-500"></i>
                            <span>J'aime</span>
                        </p>
                        ${likeHoverHtml}
                    </div>
                    <div class="bg-green-50 p-3 rounded-lg flex flex-col justify-center">
                        <p class="text-sm text-green-600 flex items-center gap-2 mb-1">
                            <i class="fas fa-id-badge text-green-500"></i>
                            <span>Dossard</span>
                        </p>
                        <p class="font-semibold text-green-800 text-sm">N°${bibDisplay}</p>
                    </div>
                `;
            } else {
                likesRow.className = 'bg-green-50 p-3 rounded-lg w-full mb-4 border border-green-100';
                likesRow.innerHTML = `
                    <p class="text-sm text-green-600 flex items-center gap-2 mb-1">
                        <i class="fas fa-heart text-green-500"></i>
                        <span>J'aime (communauté)</span>
                    </p>
                    ${likeHoverHtml}
                `;
            }
            if (gridContainer && gridContainer.parentNode) {
                gridContainer.parentNode.insertBefore(likesRow, gridContainer.nextSibling);
            }

        } else {
            const badgeTitleP = badgeButton?.querySelector('p');
            const showBibInBadgeBox = hasBib && (!effectivePrivacy || !effectivePrivacy.hideBib);

            if (isOnPublicPage) {
                if (badgeButton) badgeButton.classList.add('hidden');
                if (bibContainer) {
                    if (hasBib && (!effectivePrivacy || !effectivePrivacy.hideBib) && bibText) {
                        bibText.innerHTML = `Dossard n°${bibDisplay}`;
                        bibContainer.classList.remove('hidden');
                    } else {
                        bibContainer.classList.add('hidden');
                    }
                }
            } else {
                if (hasBib && likeCount === 0) {
                    if (badgeTitleP) {
                        badgeTitleP.innerHTML = `
                            <i class="fas fa-id-badge text-green-500"></i>
                            <span>Dossard</span>
                        `;
                    }
                    if (detailBadgeText) {
                        detailBadgeText.innerHTML = `<span class="font-semibold text-green-800 text-sm">N°${bibDisplay}</span>`;
                    }
                    if (bibContainer) bibContainer.classList.add('hidden');
                } else {
                    if (badgeTitleP) {
                        badgeTitleP.innerHTML = `
                            <i class="fas fa-heart text-green-500"></i>
                            <span>J'aime</span>
                        `;
                    }
                    if (detailBadgeText) {
                        const likeHoverHtml = (likeCount > 0) ? `
                            <div class="like-hover-trigger-modal inline-flex items-center gap-2 cursor-help relative group/likes-modal"
                                 data-liked-by='${JSON.stringify(likedBy)}'>
                                <span class="font-normal text-green-800 text-sm flex items-center gap-2">${likeText}</span>
                                ${likesLockIcon}

                                <div class="liker-tooltip hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white border border-red-100 shadow-xl rounded-xl p-3 z-[1000]">
                                    <p class="text-[10px] text-gray-400 mb-2 border-b pb-1 font-bold uppercase tracking-wider">Aimé par :</p>
                                    <ul class="liker-list space-y-2 max-h-40 overflow-y-auto">
                                        <li class="text-[10px] italic text-gray-400">Chargement...</li>
                                    </ul>
                                    <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-red-100 transform rotate-45"></div>
                                </div>
                            </div>
                        ` : `<span class="font-normal text-green-800 text-sm flex items-center gap-2">${likeText} ${likesLockIcon}</span>`;

                        detailBadgeText.innerHTML = likeHoverHtml;
                    }

                    if (hasBib && bibContainer && bibText) {
                        bibText.innerHTML = `Dossard n°${bibDisplay}`;
                        bibContainer.classList.remove('hidden');
                    } else if (bibContainer) {
                        bibContainer.classList.add('hidden');
                    }
                }
            }
        }

        // Liens GPX / Site Web / Résultats
        let linksContainer = document.getElementById('detailsLinksContainer');
        const avgInfoEl = document.getElementById('averageSpeedInfo');

        if (!linksContainer) {
            linksContainer = document.createElement('div');
            linksContainer.id = 'detailsLinksContainer';
            linksContainer.className = 'mt-4 mb-4 grid grid-cols-1 gap-3 w-full';
            if (avgInfoEl && avgInfoEl.parentNode) {
                avgInfoEl.parentNode.insertBefore(linksContainer, avgInfoEl.nextSibling);
            }
        }
        linksContainer.innerHTML = '';

        const hasWebsite = race.website && race.website.trim() !== '';
        const hasResultUrl = race.resultUrl && race.resultUrl.trim() !== '';
        const hasGpx = race.gpxUrl && race.gpxUrl.trim() !== '';

        if (hasWebsite || hasResultUrl || hasGpx) {
            linksContainer.classList.remove('hidden');
            const colSpanClass = 'col-span-1';

            if (hasWebsite) {
                const websiteText = 'Voir le site de la course';
                const websiteLinkText = fieldMatchesSearch(race.website, searchQuery) || fieldMatchesSearch(websiteText, searchQuery)
                    ? highlightSearchMatch(websiteText, searchQuery)
                    : websiteText;

                const webBtn = document.createElement('a');
                webBtn.href = race.website;
                webBtn.target = '_blank';
                webBtn.rel = 'noopener';
                webBtn.className = `block w-full text-center py-2.5 px-4 bg-blue-600 btn-race-website text-white rounded-lg hover:bg-blue-700 transition-all font-semibold no-underline shadow-sm text-sm ${colSpanClass}`;
                webBtn.innerHTML = `<i class="fas fa-external-link-alt mr-2 text-xs"></i>${websiteLinkText}`;
                linksContainer.appendChild(webBtn);
            }

            if (hasResultUrl) {
                const resultText = 'Voir les résultats en ligne';
                const resultLinkText = fieldMatchesSearch(race.resultUrl, searchQuery) || fieldMatchesSearch(resultText, searchQuery)
                    ? highlightSearchMatch(resultText, searchQuery)
                    : resultText;

                const resultBtn = document.createElement('a');
                resultBtn.href = race.resultUrl;
                resultBtn.target = '_blank';
                resultBtn.rel = 'noopener';
                resultBtn.className = `block w-full text-center py-2.5 px-4 bg-orange-500 btn-race-results text-white rounded-lg hover:bg-orange-600 transition-all font-semibold no-underline shadow-sm text-sm ${colSpanClass}`;
                resultBtn.innerHTML = `<i class="fas fa-trophy mr-2 text-xs"></i>${resultLinkText}`;
                linksContainer.appendChild(resultBtn);
            }

            if (hasGpx) {
                const gpxText = 'Voir le GPX';
                const gpxLinkText = fieldMatchesSearch(race.gpxUrl, searchQuery) || fieldMatchesSearch('gpx', searchQuery)
                    ? highlightSearchMatch(gpxText, searchQuery)
                    : gpxText;

                const gpxBtn = document.createElement('a');
                gpxBtn.href = race.gpxUrl;
                gpxBtn.target = '_blank';
                gpxBtn.rel = 'noopener';
                gpxBtn.className = `block w-full text-center py-2.5 px-4 bg-green-600 btn-race-gpx text-white rounded-lg hover:bg-green-700 transition-all font-semibold no-underline shadow-sm text-sm ${colSpanClass}`;
                gpxBtn.innerHTML = `<i class="fas fa-route mr-2 text-xs"></i>${gpxLinkText}`;
                linksContainer.appendChild(gpxBtn);
            }
        } else {
            linksContainer.classList.add('hidden');
        }

        // Navigation précédente / suivante
        const sortedRaces = [...racesList].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });

        const currentIndex = sortedRaces.findIndex(r => r.id === race.id || String(r.id) === String(race.id));
        const prevRaceBtn = document.getElementById('prevRaceBtn');
        const nextRaceBtn = document.getElementById('nextRaceBtn');

        function navigateToPrev() {
            if (currentIndex > 0) {
                const prevRace = sortedRaces[currentIndex - 1];
                if (prevRace) showRaceDetails(prevRace, racesList);
            }
        }

        function navigateToNext() {
            if (currentIndex < sortedRaces.length - 1) {
                const nextRace = sortedRaces[currentIndex + 1];
                if (nextRace) showRaceDetails(nextRace, racesList);
            }
        }

        if (prevRaceBtn) {
            if (currentIndex > 0) {
                prevRaceBtn.disabled = false;
                prevRaceBtn.onclick = (e) => {
                    e.stopPropagation();
                    navigateToPrev();
                };
            } else {
                prevRaceBtn.disabled = true;
                prevRaceBtn.onclick = null;
            }
        }

        if (nextRaceBtn) {
            if (currentIndex < sortedRaces.length - 1 && currentIndex !== -1) {
                nextRaceBtn.disabled = false;
                nextRaceBtn.onclick = (e) => {
                    e.stopPropagation();
                    navigateToNext();
                };
            } else {
                nextRaceBtn.disabled = true;
                nextRaceBtn.onclick = null;
            }
        }

        // Navigation au clavier
        if (currentKeyNavigationHandler) {
            document.removeEventListener('keydown', currentKeyNavigationHandler);
        }

        function handleKeyNavigation(e) {
            if (detailsModal && !detailsModal.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft' && prevRaceBtn && !prevRaceBtn.disabled) {
                    navigateToPrev();
                } else if (e.key === 'ArrowRight' && nextRaceBtn && !nextRaceBtn.disabled) {
                    navigateToNext();
                } else if (e.key === 'Escape') {
                    closeRaceDetails();
                }
            }
        }

        currentKeyNavigationHandler = handleKeyNavigation;
        document.addEventListener('keydown', handleKeyNavigation);

        // Tooltip likes
        const modalLikeTrigger = detailsModal.querySelector('.like-hover-trigger-modal');
        if (modalLikeTrigger) {
            modalLikeTrigger.addEventListener('mouseenter', async () => {
                const tooltip = modalLikeTrigger.querySelector('.liker-tooltip');
                const list = modalLikeTrigger.querySelector('.liker-list');
                const likedByUids = JSON.parse(modalLikeTrigger.dataset.likedBy || '[]');

                if (tooltip) tooltip.classList.remove('hidden');

                if (likedByUids.length > 0) {
                    try {
                        const likersInfo = await getLikersInfo(likedByUids);
                        if (list) {
                            list.innerHTML = likersInfo.map(info => `
                                <li class="flex items-center gap-2">
                                    <i class="fas fa-user text-[8px] text-gray-300"></i>
                                    <span class="text-[10px] text-gray-700 font-medium">${escapeHtml(info.pseudo)}</span>
                                </li>
                            `).join('');
                        }
                    } catch (e) {
                        if (list) list.innerHTML = '<li class="text-[10px] text-red-400">Erreur</li>';
                    }
                } else {
                    if (list) list.innerHTML = '<li class="text-[10px] text-gray-400 italic">Personne</li>';
                }
            });

            modalLikeTrigger.addEventListener('mouseleave', () => {
                const tooltip = modalLikeTrigger.querySelector('.liker-tooltip');
                if (tooltip) tooltip.classList.add('hidden');
            });
        }

        // Google Drive Link
        const driveContainer = document.getElementById('driveButtonContainer');
        const openDriveBtn = document.getElementById('openDriveBtn');
        const getCleanDriveId = (id) => {
            if (typeof extractDriveFolderId === 'function') return extractDriveFolderId(id);
            if (typeof window !== 'undefined' && typeof window.extractDriveFolderId === 'function') return window.extractDriveFolderId(id);
            if (!id || typeof id !== 'string') return '';
            let val = id.trim();
            const folderMatch = val.match(/\/folders\/([a-zA-Z0-9_-]+)/);
            if (folderMatch && folderMatch[1]) return folderMatch[1];
            const dMatch = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (dMatch && dMatch[1]) return dMatch[1];
            const idParamMatch = val.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
            if (val.startsWith('http://') || val.startsWith('https://') || val.includes('drive.google.com')) {
                val = val.split('?')[0].split('#')[0].replace(/\/+$/, '');
                const segments = val.split('/');
                const last = segments[segments.length - 1] || '';
                if (['drive', 'folders', 'view', 'edit', 'mobile', 'u', 'google.com', 'drive.google.com'].includes(last.toLowerCase())) {
                    return '';
                }
                return last;
            }
            if (val.includes('?') || val.includes('#')) val = val.split('?')[0].split('#')[0];
            return val.replace(/\/+$/, '').trim();
        };

        const cleanDriveId = getCleanDriveId(race.driveId);
        if (cleanDriveId && !isOnPublicPage) {
            if (driveContainer) driveContainer.classList.remove('hidden');
            if (openDriveBtn) {
                openDriveBtn.onclick = () => {
                    if (typeof openDriveExplorer === 'function') {
                        openDriveExplorer(cleanDriveId);
                    } else if (typeof window.openDriveExplorer === 'function') {
                        window.openDriveExplorer(cleanDriveId);
                    } else {
                        window.open(`https://drive.google.com/drive/folders/${cleanDriveId}`, '_blank');
                    }
                };
            }
        } else {
            if (driveContainer) driveContainer.classList.add('hidden');
        }

        // Application des restrictions de confidentialité
        if (effectivePrivacy) {
            if (effectivePrivacy.hideNotes) {
                const notesContainer = document.getElementById('detailsNotesContainer');
                if (notesContainer) notesContainer.classList.add('hidden');
            }
            if (effectivePrivacy.hideRanking) {
                const rankingContainer = document.getElementById('detailsRankingContainer');
                if (rankingContainer) {
                    rankingContainer.classList.add('hidden');
                    rankingContainer.classList.remove('flex');
                }
            }
            if (effectivePrivacy.hideStats) {
                const speedInfo = document.getElementById('averageSpeedInfo');
                if (speedInfo) speedInfo.innerHTML = '';
            }
            if (effectivePrivacy.hidePhotos) {
                const photoContainer = document.getElementById('detailsPhotoContainer');
                const parcoursContainer = document.getElementById('detailsParcoursContainer');
                const imageButton = document.getElementById('ImageButton');
                if (photoContainer) photoContainer.classList.add('hidden');
                if (parcoursContainer) parcoursContainer.classList.add('hidden');
                if (imageButton) imageButton.classList.add('hidden');
            }
            if (effectivePrivacy.hidePrice) {
                // Pour raisons esthétiques, le carré reste visible dans la grille mais le montant est flouté
                const priceContainer = document.getElementById('detailsPriceContainer');
                const priceElement = document.getElementById('detailsPrice');
                if (priceContainer) {
                    priceContainer.classList.remove('hidden');
                    priceContainer.style.display = '';
                }
                if (priceElement) {
                    priceElement.innerHTML = `<span class="inline-block filter blur-[4px] select-none text-green-800 font-semibold opacity-70 cursor-not-allowed" title="Prix confidentiel">25.00 €</span>`;
                }
            }
            if (effectivePrivacy.hideBib) {
                const bibContainer = document.getElementById('detailsBibContainer');
                if (bibContainer) bibContainer.classList.add('hidden');
            }
            if (effectivePrivacy.hideCompanions) {
                const detailsCompanions = document.getElementById('detailsCompanions');
                if (detailsCompanions) detailsCompanions.classList.add('hidden');
            }
        }

        if (isOnPublicPage) {
            const badgeBtn = document.getElementById('BadgeButton');
            const imgBtn = document.getElementById('ImageButton');
            if (badgeBtn) badgeBtn.classList.add('hidden');
            if (imgBtn && !imgBtn.classList.contains('hidden')) {
                imgBtn.classList.add('col-span-2');
            }
            const aiPred = document.getElementById('aiPredictionSection');
            if (aiPred) {
                aiPred.innerHTML = '';
                aiPred.classList.add('hidden');
            }
        }

        // Afficher la modale
        detailsModal.classList.remove('hidden');
    }

    // Exposer les méthodes publiquement
    window.showRaceDetails = showRaceDetails;

    // Initialiser au chargement du DOM si nécessaire
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureModalInDom);
    } else {
        ensureModalInDom();
    }
})();
