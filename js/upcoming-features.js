/**
 * js/upcoming-features.js
 * Module de gestion des nouveautés (Onglets "Déjà disponible" & "À venir")
 * Si la liste des nouveautés à venir est vide : aucun onglet n'est affiché (vue classique).
 * Si des nouveautés sont renseignées : active les deux onglets centrés avec cycle 5s et pause 45s.
 * Respecte le design system de l'application et n'expose aucun UID en dur.
 */

(function () {
    let upcomingFeaturesData = [];
    let currentAdminDocUid = null;
    let isUserAdmin = false;

    // Gestion du cycle automatique des onglets
    let activeTab = 'current'; // 'current' (Déjà dispo) ou 'upcoming' (À venir)
    let autoCycleInterval = null;
    let interactionPauseTimer = null;
    const CYCLE_DURATION_MS = 5000;       // 5 secondes entre chaque basculement
    const INTERACTION_PAUSE_MS = 45000;    // 45 secondes de pause après une interaction

    // Structure HTML de la modale d'administration des nouveautés
    const upcomingModalHTML = `
    <div id="upcomingFeaturesModal" class="modal hidden fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
        <div class="modal-content bg-white p-6 w-full max-w-2xl m-4 rounded-xl shadow-xl relative transform scale-100 transition-transform duration-300 max-h-[90vh] flex flex-col">
            
            <!-- Header -->
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div class="flex items-center gap-2">
                    <span class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <i class="fas fa-rocket text-sm"></i>
                    </span>
                    <div>
                        <h2 class="text-lg font-bold text-gray-800">Fonctionnalités à venir</h2>
                        <p class="text-xs text-gray-500">Gestion de la feuille de route</p>
                    </div>
                </div>
                <button onclick="closeModal('upcomingFeaturesModal')" class="text-gray-400 hover:text-gray-600 transition p-1">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Description -->
            <div class="py-2.5 px-3 bg-green-50 border border-green-200 rounded-lg my-3 text-xs text-green-900 shrink-0 flex items-start gap-2">
                <i class="fas fa-info-circle text-green-600 mt-0.5 shrink-0"></i>
                <span>Renseignez les prochaines fonctionnalités et leur date approximative. Si la liste est <strong>vide</strong>, la section reste en affichage simple sans onglets.</span>
            </div>

            <!-- Message d'état -->
            <div id="upcomingModalMessage" class="hidden py-2 px-3 rounded-lg text-xs font-semibold mb-3 shrink-0"></div>

            <!-- Liste des fonctionnalités (Scrollable) -->
            <div id="upcomingFeaturesEditorList" class="space-y-3 overflow-y-auto pr-1 flex-1 py-1">
                <!-- Les lignes seront insérées dynamiquement en JS -->
            </div>

            <!-- Bouton Ajouter une ligne -->
            <div class="pt-3 shrink-0">
                <button type="button" onclick="window.addUpcomingFeatureRow()" class="w-full py-2 px-3 border border-dashed border-green-400 hover:border-green-600 text-green-800 hover:bg-green-50 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2">
                    <i class="fas fa-plus"></i> Ajouter une fonctionnalité
                </button>
            </div>

            <!-- Footer / Actions -->
            <div class="flex flex-wrap justify-between items-center gap-2 pt-3 mt-3 border-t border-gray-100 shrink-0">
                <button type="button" onclick="window.clearAllUpcomingFeatures()" class="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 hover:bg-red-50 rounded transition flex items-center gap-1.5">
                    <i class="fas fa-trash-alt"></i> Tout vider
                </button>
                <div class="flex items-center gap-2 ml-auto">
                    <button type="button" onclick="closeModal('upcomingFeaturesModal')" class="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        Annuler
                    </button>
                    <button type="button" id="saveUpcomingFeaturesBtn" onclick="window.saveUpcomingFeatures()" class="px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition flex items-center gap-1.5">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                </div>
            </div>

        </div>
    </div>
    `;

    // Initialisation au chargement de la page
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('upcomingFeaturesModal')) {
            document.body.insertAdjacentHTML('beforeend', upcomingModalHTML);
        }

        setupInteractionListeners();
        initUpcomingFeatures();
    });

    /**
     * Initialise et écoute l'état d'authentification pour charger les données
     */
    function initUpcomingFeatures() {
        if (typeof firebase === 'undefined' || typeof db === 'undefined') {
            console.warn('Firebase non disponible pour les fonctionnalités à venir.');
            return;
        }

        // Charger immédiatement les fonctionnalités publiques pour tous les visiteurs
        loadUpcomingFeatures();

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && typeof window.isAdminUser === 'function') {
                isUserAdmin = await window.isAdminUser();
            } else {
                isUserAdmin = false;
            }
            await loadUpcomingFeatures();
        });
    }

    /**
     * Écoute les interactions utilisateur pour mettre en pause le défilement automatique pendant 45s
     */
    function setupInteractionListeners() {
        const section = document.getElementById('featuresNewsSection');
        if (!section) return;

        const handleInteraction = () => {
            window.registerNewsInteraction();
        };

        section.addEventListener('click', handleInteraction);
        section.addEventListener('touchstart', handleInteraction, { passive: true });
        section.addEventListener('keydown', handleInteraction);
    }

    /**
     * Charge les fonctionnalités à venir depuis Firestore (accessible à tous)
     */
    async function loadUpcomingFeatures() {
        upcomingFeaturesData = [];

        try {
            const publicDoc = await db.collection('public_config').doc('upcomingFeatures').get();
            if (publicDoc.exists) {
                const data = publicDoc.data();
                if (Array.isArray(data.upcomingFeatures)) {
                    upcomingFeaturesData = data.upcomingFeatures;
                }
            }
        } catch (error) {
            console.error("Erreur chargement public_config/upcomingFeatures :", error);
        }

        renderUpcomingFeaturesTab();
    }

    /**
     * Met à jour l'affichage : vue simple (si vide) ou deux onglets (si nouveautés présentes)
     */
    function renderUpcomingFeaturesTab() {
        const singleHeader = document.getElementById('singleVersionHeader');
        const tabsHeader = document.getElementById('tabsNavHeader');
        const singleAdminActions = document.getElementById('singleAdminEditActions');
        const tabsAdminActions = document.getElementById('newsAdminActions');
        const upcomingContainer = document.getElementById('upcomingItemsContainer');
        const panelUpcoming = document.getElementById('tabPanelUpcoming');
        const panelCurrent = document.getElementById('tabPanelCurrent');

        // Filtrer les fonctionnalités valides
        const validItems = (upcomingFeaturesData || []).filter(item => item && item.title && item.title.trim() !== '');

        if (validItems.length === 0) {
            // AUCUNE NOUVEAUTÉ À VENIR : Affichage classique sans onglets
            stopAutoCycle();

            if (tabsHeader) tabsHeader.classList.add('hidden');
            if (singleHeader) singleHeader.classList.remove('hidden');

            if (singleAdminActions) {
                if (isUserAdmin) singleAdminActions.classList.remove('hidden');
                else singleAdminActions.classList.add('hidden');
            }

            // S'assurer que le panneau de la version actuelle est visible
            if (panelUpcoming) {
                panelUpcoming.classList.add('hidden');
                panelUpcoming.classList.remove('opacity-100');
                panelUpcoming.classList.add('opacity-0');
            }
            if (panelCurrent) {
                panelCurrent.classList.remove('hidden');
                panelCurrent.classList.remove('opacity-0');
                panelCurrent.classList.add('opacity-100');
            }

            return;
        }

        // DES NOUVEAUTÉS SONT DISPONIBLES : Activer les deux onglets
        if (singleHeader) singleHeader.classList.add('hidden');
        if (tabsHeader) tabsHeader.classList.remove('hidden');

        if (tabsAdminActions) {
            if (isUserAdmin) tabsAdminActions.classList.remove('hidden');
            else tabsAdminActions.classList.add('hidden');
        }

        if (upcomingContainer) {
            let itemsHTML = '';
            validItems.forEach((item) => {
                let statusBadge = '';
                if (item.status) {
                    let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                    let icon = 'fa-calendar-check';
                    const sLower = item.status.toLowerCase();
                    if (sLower.includes('cours')) {
                        badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                        icon = 'fa-tools';
                    } else if (sLower.includes('bientôt') || sLower.includes('bientot')) {
                        badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                        icon = 'fa-bolt';
                    } else if (sLower.includes('étude') || sLower.includes('etude') || sLower.includes('idée')) {
                        badgeColor = 'bg-gray-100 text-gray-700 border-gray-200';
                        icon = 'fa-lightbulb';
                    }
                    statusBadge = `
                        <span class="text-[10px] font-normal px-2 py-0.5 rounded-full ml-1 border ${badgeColor} inline-flex items-center gap-1 whitespace-nowrap">
                            <i class="fas ${icon} text-[9px]"></i>${escapeHTML(item.status)}
                        </span>
                    `;
                }

                const dateBadge = item.date ? `
                    <span class="text-[10px] bg-green-100 text-green-800 border border-green-200/80 font-normal px-2 py-0.5 rounded-full ml-1 whitespace-nowrap inline-flex items-center gap-1">
                        <i class="far fa-calendar-alt text-[9px] text-green-700"></i>${escapeHTML(item.date)}
                    </span>
                ` : '';

                const descText = item.description ? `
                    <div class="text-green-800/90 text-xs sm:text-sm font-normal mt-0.5 sm:mt-1 ml-1.5 sm:ml-3 leading-snug sm:leading-relaxed">
                        ${escapeHTML(item.description)}
                    </div>
                ` : '';

                itemsHTML += `
                    <li class="flex items-start gap-2">
                        <span class="text-green-500 mt-0.5 font-bold shrink-0">▸</span>
                        <div class="flex-1 leading-snug">
                            <span class="font-bold text-green-900">${escapeHTML(item.title)}</span>${statusBadge}${dateBadge}
                            ${descText}
                        </div>
                    </li>
                `;
            });

            upcomingContainer.innerHTML = itemsHTML;
        }

        // Démarrer le cycle automatique
        startAutoCycle();
    }

    /**
     * Changement d'onglet centré avec transition fluide
     * @param {string} targetTab 'upcoming' ou 'current'
     * @param {boolean} isUserAction Indique si c'est un clic utilisateur
     */
    window.switchNewsTab = function (targetTab, isUserAction = false) {
        if (isUserAction) {
            window.registerNewsInteraction();
        }

        activeTab = targetTab;

        const tabBtnUpcoming = document.getElementById('tabBtnUpcoming');
        const tabBtnCurrent = document.getElementById('tabBtnCurrent');
        const panelUpcoming = document.getElementById('tabPanelUpcoming');
        const panelCurrent = document.getElementById('tabPanelCurrent');

        if (!panelUpcoming || !panelCurrent) return;

        const activeClass = 'flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition bg-white text-green-900 shadow-xs border border-green-200/80';
        const inactiveClass = 'flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition text-green-800 hover:bg-green-100/60 border border-transparent';

        if (targetTab === 'upcoming') {
            if (tabBtnUpcoming) tabBtnUpcoming.className = activeClass;
            if (tabBtnCurrent) tabBtnCurrent.className = inactiveClass;

            panelCurrent.classList.add('opacity-0');
            setTimeout(() => {
                panelCurrent.classList.add('hidden');
                panelUpcoming.classList.remove('hidden');
                void panelUpcoming.offsetWidth;
                panelUpcoming.classList.remove('opacity-0');
                panelUpcoming.classList.add('opacity-100');
            }, 180);

        } else {
            if (tabBtnCurrent) tabBtnCurrent.className = activeClass;
            if (tabBtnUpcoming) tabBtnUpcoming.className = inactiveClass;

            panelUpcoming.classList.add('opacity-0');
            setTimeout(() => {
                panelUpcoming.classList.add('hidden');
                panelCurrent.classList.remove('hidden');
                void panelCurrent.offsetWidth;
                panelCurrent.classList.remove('opacity-0');
                panelCurrent.classList.add('opacity-100');
            }, 180);
        }
    };

    /**
     * Démarre le cycle automatique 5s
     */
    function startAutoCycle() {
        stopAutoCycle();

        const tabsHeader = document.getElementById('tabsNavHeader');
        if (!tabsHeader || tabsHeader.classList.contains('hidden')) {
            return;
        }

        autoCycleInterval = setInterval(() => {
            const nextTab = (activeTab === 'current') ? 'upcoming' : 'current';
            window.switchNewsTab(nextTab, false);
        }, CYCLE_DURATION_MS);
    }

    /**
     * Stoppe le cycle automatique
     */
    function stopAutoCycle() {
        if (autoCycleInterval) {
            clearInterval(autoCycleInterval);
            autoCycleInterval = null;
        }
    }

    /**
     * Enregistre une interaction utilisateur : pause de 45s avant reprise du cycle
     */
    window.registerNewsInteraction = function () {
        stopAutoCycle();

        if (interactionPauseTimer) {
            clearTimeout(interactionPauseTimer);
            interactionPauseTimer = null;
        }

        interactionPauseTimer = setTimeout(() => {
            startAutoCycle();
        }, INTERACTION_PAUSE_MS);
    };

    /**
     * Ouvre la modale d'édition pour l'administrateur
     */
    window.openUpcomingFeaturesModal = async function () {
        window.registerNewsInteraction();

        if (typeof window.isAdminUser === 'function') {
            const admin = await window.isAdminUser();
            if (!admin) {
                alert("Accès réservé aux administrateurs.");
                return;
            }
        }

        renderEditorList();
        if (typeof window.openModal === 'function') {
            window.openModal('upcomingFeaturesModal');
        } else {
            const m = document.getElementById('upcomingFeaturesModal');
            if (m) m.classList.remove('hidden');
        }
    };

    /**
     * Remplit l'éditeur avec les lignes actuelles
     */
    function renderEditorList() {
        const listContainer = document.getElementById('upcomingFeaturesEditorList');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        if (!upcomingFeaturesData || upcomingFeaturesData.length === 0) {
            addUpcomingFeatureRow();
            return;
        }

        upcomingFeaturesData.forEach((item) => {
            addUpcomingFeatureRow(item);
        });
    }

    /**
     * Ajoute une ligne dans le formulaire d'édition
     */
    window.addUpcomingFeatureRow = function (data = { title: '', status: 'Planifié', date: '', description: '' }) {
        const listContainer = document.getElementById('upcomingFeaturesEditorList');
        if (!listContainer) return;

        const rowId = 'upcoming_row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        const currentStatus = data.status || 'Planifié';

        const rowHTML = `
            <div id="${rowId}" class="upcoming-feature-row bg-gray-50 border border-gray-200 rounded-lg p-3 relative space-y-2 transition">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-green-800">
                        <i class="fas fa-magic text-green-600 mr-1"></i> Nouveauté
                    </span>
                    <button type="button" onclick="document.getElementById('${rowId}').remove()" class="text-gray-400 hover:text-red-600 transition p-1 text-xs" title="Supprimer">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div class="sm:col-span-2">
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Nom / Fonctionnalité *</label>
                        <input type="text" class="feature-title w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="ex: Export GPX automatique" value="${escapeHTML(data.title || '')}" required>
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Date approximative</label>
                        <input type="text" class="feature-date w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="ex: Fin Novembre 2026" value="${escapeHTML(data.date || '')}">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div class="sm:col-span-2">
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Description courte (optionnel)</label>
                        <input type="text" class="feature-desc w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="ex: Synchronisation directe de vos tracés avec vos montres..." value="${escapeHTML(data.description || '')}">
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Statut</label>
                        <select class="feature-status w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none">
                            <option value="Planifié" ${currentStatus === 'Planifié' ? 'selected' : ''}>📅 Planifié</option>
                            <option value="En cours" ${currentStatus === 'En cours' ? 'selected' : ''}>⚡ En cours</option>
                            <option value="Bientôt disponible" ${currentStatus === 'Bientôt disponible' ? 'selected' : ''}>🚀 Bientôt dispo</option>
                            <option value="À l'étude" ${currentStatus === "À l'étude" ? 'selected' : ''}>💡 À l'étude</option>
                            <option value="" ${currentStatus === '' ? 'selected' : ''}>- Aucun -</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        listContainer.insertAdjacentHTML('beforeend', rowHTML);
    };

    /**
     * Vide complètement la liste des fonctionnalités
     */
    window.clearAllUpcomingFeatures = function () {
        if (!confirm("Voulez-vous vraiment vider toutes les fonctionnalités à venir ? L'affichage redeviendra simple sans onglets.")) {
            return;
        }
        const listContainer = document.getElementById('upcomingFeaturesEditorList');
        if (listContainer) listContainer.innerHTML = '';
        addUpcomingFeatureRow({ title: '', status: 'Planifié', date: '', description: '' });
    };

    /**
     * Enregistre les modifications dans Firestore
     */
    window.saveUpcomingFeatures = async function () {
        window.registerNewsInteraction();

        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            showModalMessage("Vous devez être connecté pour enregistrer.", "error");
            return;
        }

        if (typeof window.isAdminUser === 'function') {
            const admin = await window.isAdminUser();
            if (!admin) {
                showModalMessage("Permissions insuffisantes.", "error");
                return;
            }
        }

        const rows = document.querySelectorAll('.upcoming-feature-row');
        const updatedFeatures = [];

        rows.forEach(row => {
            const titleInput = row.querySelector('.feature-title');
            const statusInput = row.querySelector('.feature-status');
            const dateInput = row.querySelector('.feature-date');
            const descInput = row.querySelector('.feature-desc');

            const title = titleInput ? titleInput.value.trim() : '';
            const status = statusInput ? statusInput.value.trim() : '';
            const date = dateInput ? dateInput.value.trim() : '';
            const description = descInput ? descInput.value.trim() : '';

            if (title !== '') {
                updatedFeatures.push({ title, status, date, description });
            }
        });

        const saveBtn = document.getElementById('saveUpcomingFeaturesBtn');
        const originalBtnHTML = saveBtn ? saveBtn.innerHTML : '';
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enregistrement...';
        }

        try {
            // Sauvegarde dans la collection publique dédiée
            await db.collection('public_config').doc('upcomingFeatures').set({
                upcomingFeatures: updatedFeatures,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.uid
            });

            upcomingFeaturesData = updatedFeatures;
            showModalMessage("Nouveautés enregistrées avec succès !", "success");

            renderUpcomingFeaturesTab();

            setTimeout(() => {
                if (typeof window.closeModal === 'function') {
                    window.closeModal('upcomingFeaturesModal');
                } else {
                    const m = document.getElementById('upcomingFeaturesModal');
                    if (m) m.classList.add('hidden');
                }
            }, 800);

        } catch (error) {
            console.error("Erreur enregistrement upcoming features:", error);
            showModalMessage("Erreur lors de l'enregistrement : " + error.message, "error");
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalBtnHTML;
            }
        }
    };

    /**
     * Affiche un message dans la modale
     */
    function showModalMessage(msg, type = 'success') {
        const container = document.getElementById('upcomingModalMessage');
        if (!container) return;

        container.textContent = msg;
        container.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');

        if (type === 'success') {
            container.classList.add('bg-green-100', 'text-green-800');
        } else {
            container.classList.add('bg-red-100', 'text-red-800');
        }

        setTimeout(() => {
            container.classList.add('hidden');
        }, 4000);
    }

    /**
     * Échappement des caractères HTML
     */
    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.refreshUpcomingFeatures = loadUpcomingFeatures;

})();
