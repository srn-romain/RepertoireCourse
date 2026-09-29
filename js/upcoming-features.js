/**
 * js/upcoming-features.js
 * Module de gestion des nouveautés (Onglets "Déjà disponible" & "À venir")
 * Si la liste des nouveautés à venir est vide : aucun onglet n'est affiché (vue classique).
 * Si des nouveautés sont renseignées : active les deux onglets centrés avec cycle 5s et pause 45s.
 * Respecte le design system de l'application et n'expose aucun UID en dur.
 */

(function () {
    let upcomingFeaturesData = [];
    let isUserAdmin = false;
    let geminiApiKey = null; // Clé chargée en BDD Firestore, aucune clé en dur dans le code

    // Gestion du cycle automatique des onglets
    let activeTab = 'current'; // 'current' (Déjà dispo) ou 'upcoming' (À venir)
    let autoCycleInterval = null;
    let interactionPauseTimer = null;
    const CYCLE_DURATION_MS = 5000;       // 5 secondes entre chaque basculement
    const INTERACTION_PAUSE_MS = 45000;    // 45 secondes de pause après une interaction

    // Structure HTML de la modale d'administration des nouveautés
    const upcomingModalHTML = `
    <div id="upcomingFeaturesModal" class="modal hidden fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
        <div class="modal-content bg-white p-5 sm:p-6 w-full max-w-2xl m-3 sm:m-4 rounded-xl shadow-xl relative transform scale-100 transition-transform duration-300 max-h-[92vh] flex flex-col">
            
            <!-- Header -->
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div class="flex items-center gap-2">
                    <span class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <i class="fas fa-rocket text-sm"></i>
                    </span>
                    <div>
                        <h2 class="text-base sm:text-lg font-bold text-gray-800">Fonctionnalités à venir</h2>
                        <p class="text-xs text-gray-500">Gestion de la feuille de route & Assistant IA</p>
                    </div>
                </div>
                <button onclick="closeModal('upcomingFeaturesModal')" class="text-gray-400 hover:text-gray-600 transition p-1">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Description -->
            <div class="py-2 px-3 bg-green-50 border border-green-200 rounded-lg my-2.5 text-xs text-green-900 shrink-0 flex items-start gap-2">
                <i class="fas fa-info-circle text-green-600 mt-0.5 shrink-0"></i>
                <span>Renseignez les prochaines fonctionnalités et leur date prévisionnelle. Si la liste est <strong>vide</strong>, la section reste en affichage simple sans onglets.</span>
            </div>

            <!-- Mini Section IA : Assistant de Rédaction Sobre -->
            <div class="mb-3 bg-purple-50/70 border border-purple-200 rounded-lg p-3 shrink-0">
                <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-1.5">
                        <i class="fas fa-magic text-purple-700 text-xs"></i>
                        <span class="text-xs font-bold text-purple-950">Assistant de rédaction</span>
                        <span id="geminiAiActiveBadge" class="hidden text-[9px] font-semibold bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded border border-purple-300">Gemini IA active</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] text-purple-800/80 hidden sm:inline">Décrivez votre idée en quelques mots</span>
                        <button type="button" onclick="window.promptSetGeminiKey()" class="text-purple-600 hover:text-purple-900 text-xs p-1 transition cursor-pointer" title="Gérer la clé API Gemini en base de données">
                            <i class="fas fa-key"></i>
                        </button>
                    </div>
                </div>

                <div class="flex gap-2">
                    <div class="relative flex-1">
                        <input type="text" id="aiFeaturePromptInput" 
                            class="w-full pl-3 pr-7 py-1.5 text-xs bg-white border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none transition placeholder:text-gray-400 text-gray-800" 
                            placeholder="ex: export gpx montres garmin, mode sombre, tri par dénivelé..."
                            onkeydown="if(event.key === 'Enter'){ event.preventDefault(); window.generateFeatureWithAI(); }">
                        <button type="button" onclick="document.getElementById('aiFeaturePromptInput').value=''; document.getElementById('aiFeaturePromptInput').focus();" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs" title="Effacer">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <button type="button" id="aiGenerateBtn" onclick="window.generateFeatureWithAI()"
                        class="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer">
                        <i class="fas fa-magic text-[11px]"></i>
                        <span>Rédiger</span>
                    </button>
                </div>
            </div>

            <!-- Message d'état -->
            <div id="upcomingModalMessage" class="hidden py-2 px-3 rounded-lg text-xs font-semibold mb-2.5 shrink-0"></div>

            <!-- Liste des fonctionnalités (Scrollable) -->
            <div id="upcomingFeaturesEditorList" class="space-y-3 overflow-y-auto pr-1 flex-1 py-1">
                <!-- Les lignes seront insérées dynamiquement en JS -->
            </div>

            <!-- Bouton Ajouter manuellement une ligne -->
            <div class="pt-2.5 shrink-0">
                <button type="button" onclick="window.addUpcomingFeatureRow()" class="w-full py-2 px-3 border border-dashed border-green-400 hover:border-green-600 text-green-800 hover:bg-green-50 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer">
                    <i class="fas fa-plus"></i> Ajouter une ligne manuellement
                </button>
            </div>

            <!-- Footer / Actions -->
            <div class="flex flex-wrap justify-between items-center gap-2 pt-3 mt-2.5 border-t border-gray-100 shrink-0">
                <button type="button" onclick="window.clearAllUpcomingFeatures()" class="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 hover:bg-red-50 rounded transition flex items-center gap-1.5 cursor-pointer">
                    <i class="fas fa-trash-alt"></i> Tout vider
                </button>
                <div class="flex items-center gap-2 ml-auto">
                    <button type="button" onclick="closeModal('upcomingFeaturesModal')" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors cursor-pointer text-xs font-semibold">
                        Annuler
                    </button>
                    <button type="button" id="saveUpcomingFeaturesBtn" onclick="window.saveUpcomingFeatures()" class="px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer">
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

                // Charger la clé Gemini depuis la BDD (Firestore) du document admin
                if (isUserAdmin) {
                    try {
                        const userDoc = await db.collection('users').doc(user.uid).get();
                        if (userDoc.exists && userDoc.data().geminiApiKey) {
                            geminiApiKey = userDoc.data().geminiApiKey;
                        } else {
                            const cached = localStorage.getItem('admin_gemini_api_key');
                            if (cached) {
                                geminiApiKey = cached;
                                await db.collection('users').doc(user.uid).set({ geminiApiKey: cached }, { merge: true });
                            }
                        }
                    } catch (e) {
                        console.warn("Lecture clé IA BDD :", e);
                    }
                    updateGeminiStatusBadge();
                }
            } else {
                isUserAdmin = false;
                geminiApiKey = null;
                updateGeminiStatusBadge();
            }
            await loadUpcomingFeatures();
        });
    }

    /**
     * Met à jour le badge d'état Gemini
     */
    function updateGeminiStatusBadge() {
        const badge = document.getElementById('geminiAiActiveBadge');
        if (badge) {
            if (geminiApiKey) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    /**
     * Permet à l'administrateur de stocker ou mettre à jour sa clé API en BDD
     */
    window.promptSetGeminiKey = async function () {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser || !isUserAdmin) {
            alert("Accès réservé à l'administrateur.");
            return;
        }

        const currentMasked = geminiApiKey ? (geminiApiKey.substring(0, 8) + '...' + geminiApiKey.slice(-4)) : 'Aucune';
        const entered = prompt(
            `Configuration de la clé API Google Gemini\n\nClé actuelle en BDD : ${currentMasked}\n\nCollez votre clé API Gemini pour l'enregistrer dans votre base de données :`,
            geminiApiKey || ''
        );

        if (entered === null) return; // Annulé

        const cleanKey = entered.trim();

        try {
            if (cleanKey === '') {
                await db.collection('users').doc(currentUser.uid).update({
                    geminiApiKey: firebase.firestore.FieldValue.delete()
                });
                localStorage.removeItem('admin_gemini_api_key');
                geminiApiKey = null;
                showModalMessage("Clé API retirée. Le moteur local sera utilisé.", "success");
            } else {
                await db.collection('users').doc(currentUser.uid).set({
                    geminiApiKey: cleanKey
                }, { merge: true });
                localStorage.setItem('admin_gemini_api_key', cleanKey);
                geminiApiKey = cleanKey;
                showModalMessage("✨ Clé API Gemini enregistrée avec succès en base de données !", "success");
            }
            updateGeminiStatusBadge();
        } catch (err) {
            console.error("Erreur enregistrement clé en BDD :", err);
            showModalMessage("Erreur BDD : " + err.message, "error");
        }
    };

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
        updateUpcomingRowOrderButtons();
    }

    /**
     * Applique une suggestion de prompt rapide et lance la génération IA
     */
    window.applyAiPromptSuggestion = function (text) {
        const input = document.getElementById('aiFeaturePromptInput');
        if (input) {
            input.value = text;
            window.generateFeatureWithAI();
        }
    };

    /**
     * Appelle l'API Google Gemini 1.5 Flash en direct
     * @param {string} rawPrompt Idée saisie par l'admin
     * @param {string} apiKey Clé API Gemini chargée depuis la BDD
     * @returns {Promise<Object>} { title, status, date, description }
     */
    async function callGeminiAPI(rawPrompt, apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const systemPrompt = `Tu es l'assistant de conception d'une application web de gestion de courses à pied et sports d'endurance (running, trail, marathon, décathlon, triathlon, cyclisme, etc.).
L'administrateur te soumet une idée brute de fonctionnalité à venir.
Rédige une proposition élégante, valorisante et réaliste en renvoyant STRICTEMENT un objet JSON valide avec ces 4 clés :
1. "title": Titre accrocheur et concis avec un emoji adapté au début (ex: "🏅 Prise en charge du Décathlon", "⚡ Export GPX & Montres", "🌙 Mode Sombre"). Ne répète pas mot pour mot le prompt brut.
2. "status": Choisis UNIQUEMENT parmi l'une de ces 4 valeurs : "Bientôt disponible", "En cours", "Planifié", "À l'étude".
3. "date": Échéance prévisionnelle réaliste et TOUJOURS FUTURE (ex: "Fin Novembre 2026", "Décembre 2026", "1er Trimestre 2027", "Printemps 2027", etc. sachant que nous sommes vers la fin 2026).
4. "description": Une phrase fluide et attractive expliquant le bénéfice pour les coureurs et l'intérêt concret de la fonctionnalité.

Idée brute de l'administrateur : "${rawPrompt}"`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.75
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `Erreur API Gemini (${response.status})`);
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidate) throw new Error("Réponse Gemini vide");

        const parsed = JSON.parse(candidate);
        return {
            title: parsed.title || "✨ Nouvelle fonctionnalité",
            status: parsed.status || "Planifié",
            date: parsed.date || "Prochainement",
            description: parsed.description || ""
        };
    }

    /**
     * Analyse le prompt de l'admin et génère automatiquement la fonctionnalité avec Gemini ou moteur local
     */
    window.generateFeatureWithAI = async function () {
        window.registerNewsInteraction();

        const input = document.getElementById('aiFeaturePromptInput');
        const generateBtn = document.getElementById('aiGenerateBtn');
        const rawPrompt = input ? input.value.trim() : '';

        if (!rawPrompt) {
            showModalMessage("Veuillez saisir quelques mots pour décrire votre idée.", "error");
            if (input) input.focus();
            return;
        }

        const origBtnHTML = generateBtn ? generateBtn.innerHTML : '';
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-[11px]"></i> Rédaction Gemini...';
        }

        try {
            let generatedFeature = null;

            if (geminiApiKey) {
                try {
                    generatedFeature = await callGeminiAPI(rawPrompt, geminiApiKey);
                } catch (apiErr) {
                    console.warn("Erreur appel Gemini, bascule sur moteur local :", apiErr);
                    generatedFeature = analyzeFeaturePrompt(rawPrompt);
                }
            } else {
                generatedFeature = analyzeFeaturePrompt(rawPrompt);
            }

            // Ajouter la ligne générée dans l'éditeur
            window.addUpcomingFeatureRow(generatedFeature, true);

            showModalMessage(geminiApiKey ? "✨ Rédigé en direct par Google Gemini IA !" : "✨ Proposition générée avec succès !", "success");

            if (input) {
                input.value = '';
            }
        } catch (err) {
            console.error("Erreur génération IA :", err);
            showModalMessage("Erreur lors de la génération IA.", "error");
        } finally {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = origBtnHTML;
            }
        }
    };

    /**
     * Moteur d'analyse sémantique, de reformulation et d'estimation temporelle intelligente
     * @param {string} prompt Texte saisi par l'admin
     * @returns {Object} { title, status, date, description }
     */
    function analyzeFeaturePrompt(prompt) {
        if (!prompt) return { title: '', status: 'Planifié', date: '', description: '' };

        const rawText = prompt.trim();
        const textLower = rawText.toLowerCase();

        // Dates dynamiques relatives et toujours futures
        const now = new Date();
        const currentMonthIdx = now.getMonth(); // 0 = Janvier, ..., 8 = Septembre, 9 = Octobre, 11 = Décembre
        const currentYear = now.getFullYear();

        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        const getRelativeMonth = (offsetMonths) => {
            const targetDate = new Date(currentYear, currentMonthIdx + offsetMonths, 1);
            return {
                name: monthNames[targetDate.getMonth()],
                year: targetDate.getFullYear()
            };
        };

        // Calcul intelligent des échéances temporelles toujours futures
        const getTimelineDate = (horizon) => {
            // horizon: 'short' (~2-4 semaines), 'medium' (~1-2 mois), 'long' (~3-6 mois)
            if (horizon === 'short') {
                if (now.getDate() <= 12) {
                    return `Fin ${monthNames[currentMonthIdx]} ${currentYear}`;
                }
                const target = getRelativeMonth(1);
                return `Courant ${target.name} ${target.year}`;
            }

            if (horizon === 'medium') {
                const target = getRelativeMonth(1);
                return `${target.name} ${target.year}`;
            }

            // Long terme (3 à 6 mois) :
            if (currentMonthIdx >= 6) { // À partir de Juillet jusqu'à Décembre -> Année suivante
                return `1er Trimestre ${currentYear + 1}`;
            } else if (currentMonthIdx >= 3) { // Avril à Juin
                return `Automne ${currentYear}`;
            } else { // Janvier à Mars
                return `2ème Trimestre ${currentYear}`;
            }
        };

        // Helper regex pour mot entier (évite les faux positifs comme 'ai' dans 'traitement')
        const hasWord = (word) => new RegExp(`\\b${word}\\b`, 'i').test(textLower);
        const hasAnyWord = (words) => words.some(w => hasWord(w));

        // Nettoyage des amorces courantes pour extraire le sujet principal
        let coreSubject = rawText
            .replace(/^(traitement d'un nouveau sport\s*:?|traitement de|nouveau sport\s*:?|ajout d'un|ajout de|création d'un|création de|mise en place d'un|mise en place de|possibilité de|pouvoir faire|pouvoir|faire un|faire une|on aimerait|développer|ajouter)\s*/i, '')
            .replace(/^[–—:•*>\s]+/, '')
            .trim();

        if (!coreSubject) coreSubject = rawText;

        // Capitalisation du sujet
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        // Correction des fautes courantes dans les sports / mots techniques
        let cleanSubject = coreSubject
            .replace(/dectahlon/gi, 'Décathlon')
            .replace(/decathlon/gi, 'Décathlon')
            .replace(/triathlon/gi, 'Triathlon')
            .replace(/biathlon/gi, 'Biathlon')
            .replace(/pentathlon/gi, 'Pentathlon')
            .replace(/covoiturage/gi, 'Covoiturage')
            .replace(/strava/gi, 'Strava')
            .replace(/garmin/gi, 'Garmin')
            .replace(/gpx/gi, 'GPX');

        // ─────────────────────────────────────────────────────────────
        // 1. DÉTECTION CONTEXTUELLE PRÉCISE
        // ─────────────────────────────────────────────────────────────

        // A) Sports & Nouvelles disciplines (Décathlon, Triathlon, Biathlon, Cyclisme, etc.)
        if (textLower.includes('dectahlon') || textLower.includes('decathlon')) {
            return {
                title: "🏅 Prise en charge du Décathlon",
                status: "À l'étude",
                date: getTimelineDate('long'),
                description: "Gestion complète des 10 épreuves combinées avec calcul automatique des points officiels, classement live et suivi des records individuels par discipline."
            };
        }

        if (textLower.includes('triathlon')) {
            return {
                title: "🏅 Prise en charge du Triathlon",
                status: "À l'étude",
                date: getTimelineDate('long'),
                description: "Gestion des 3 disciplines enchaînées (natation, vélo, course à pied) avec chronométrage des transitions (T1/T2) et analyse segment par segment."
            };
        }

        if (textLower.includes('biathlon')) {
            return {
                title: "🏅 Prise en charge du Biathlon",
                status: "À l'étude",
                date: getTimelineDate('long'),
                description: "Suivi des épreuves combinées ski/tir avec comptabilisation des tours de pénalité, précision de tir et temps de ski de fond."
            };
        }

        if (textLower.includes('cyclisme') || textLower.includes('vélo') || textLower.includes('velo') || textLower.includes('vtt') || textLower.includes('gravel')) {
            return {
                title: "🚴 Module Cyclisme & Gravel",
                status: "Planifié",
                date: getTimelineDate('medium'),
                description: "Prise en compte des épreuves cyclistes avec profils de dénivelé spécifiques, calcul de puissance estimée et gestion des cols."
            };
        }

        if (textLower.includes('natation') || textLower.includes('nage')) {
            return {
                title: "🏊 Module Natation & Eau Libre",
                status: "À l'étude",
                date: getTimelineDate('long'),
                description: "Gestion des compétitions en bassin et eau libre avec allures aux 100m, temps de passage et suivi des bassins."
            };
        }

        if (textLower.includes('sport') || textLower.includes('discipline')) {
            let specificSport = rawText
                .replace(/^.*?(sport|discipline)\s*:?\s*(le|la|les|un|une|l')?\s*/i, '')
                .replace(/[.–—:•*>\s]+$/, '')
                .trim();
            if (!specificSport || specificSport.length > 30) specificSport = "Nouvelles Disciplines";
            const capSport = capitalize(specificSport);

            return {
                title: `🏅 Prise en charge du ${capSport}`,
                status: "À l'étude",
                date: getTimelineDate('long'),
                description: `Intégration d'un module spécifique dédié au ${specificSport.toLowerCase()} avec règles d'épreuves adaptées, calculs de performances et statistiques sur-mesure.`
            };
        }

        // B) GPX / Montres connectées / GPS / Tracés / Strava / Garmin / Suunto / Coros
        if (hasAnyWord(['gpx', 'garmin', 'coros', 'suunto', 'polar', 'montre', 'montres', 'gps', 'strava', 'komoot', 'openrunner', 'trace', 'tracé', 'tracés', 'itineraire', 'itinéraire'])) {
            return {
                title: "⚡ Export GPX & Synchronisation Montres",
                status: "En cours",
                date: getTimelineDate('medium'),
                description: "Export direct des tracés au format GPX et synchronisation instantanée avec vos montres Garmin, Coros et Suunto avec profil d'altimétrie interactif."
            };
        }

        // C) Mode Sombre / Nuit / Thèmes / Confort visuel
        if (hasAnyWord(['sombre', 'dark', 'nuit', 'theme', 'thème', 'contraste', 'look'])) {
            return {
                title: "🌙 Mode Sombre & Confort Visuel",
                status: "Bientôt disponible",
                date: getTimelineDate('short'),
                description: "Bascule automatique ou manuelle vers un affichage sombre reposant pour les yeux, optimisé pour la consultation nocturne et l'économie de batterie."
            };
        }

        // D) Statistiques / Graphiques / Allure / VMA / Cardio / Chronos / Progression
        if (hasAnyWord(['stat', 'stats', 'statistique', 'statistiques', 'graphique', 'graphiques', 'chart', 'allure', 'vma', 'vitesse', 'cardio', 'chrono', 'chronos', 'progression', 'volume'])) {
            return {
                title: "📊 Tableaux de Bord & Graphiques d'Allure",
                status: "Planifié",
                date: getTimelineDate('medium'),
                description: "Visualisation interactive de l'évolution de vos allures, courbes de dénivelé et analyse comparative de vos temps au kilomètre."
            };
        }

        // E) Réseaux sociaux / Partage / WhatsApp / Stories / Fiches récapitulatives
        if (hasAnyWord(['partage', 'partager', 'whatsapp', 'facebook', 'instagram', 'insta', 'story', 'reseau', 'réseau', 'reseaux', 'réseaux', 'social'])) {
            return {
                title: "🔗 Partage Réseaux & Fiches Récapitulatives",
                status: "Bientôt disponible",
                date: getTimelineDate('short'),
                description: "Génération automatique de visuels élégants prêts à partager sur WhatsApp, Strava et Instagram pour annoncer vos prochains objectifs et résultats."
            };
        }

        // F) Covoiturage / Communauté / Entraide coureurs
        if (hasAnyWord(['covoiturage', 'covoit', 'trajet', 'voiture', 'transport', 'groupe', 'amis'])) {
            return {
                title: "🚗 Module Covoiturage entre Coureurs",
                status: "Planifié",
                date: getTimelineDate('medium'),
                description: "Mise en relation directe des participants d'une même course pour partager les trajets, réduisant les frais de déplacement dans un esprit convivial."
            };
        }

        // G) Météo / Prévisions / Température / Vent
        if (hasAnyWord(['meteo', 'météo', 'pluie', 'vent', 'temperature', 'température', 'climat'])) {
            return {
                title: "☀️ Météo en Direct & Prévisions Course",
                status: "Planifié",
                date: getTimelineDate('medium'),
                description: "Affichage des prévisions météorologiques en temps réel sur vos fiches de course (température, vent, précipitations) pour préparer votre équipement."
            };
        }

        // H) Gamification / Badges / Missions / Défis / Trophées
        if (hasAnyWord(['badge', 'badges', 'mission', 'missions', 'defi', 'defis', 'défi', 'défis', 'trophee', 'trophée', 'gamification', 'xp', 'recompense', 'classement'])) {
            return {
                title: "🏆 Nouveaux Défis & Système de Trophées",
                status: "En cours",
                date: getTimelineDate('medium'),
                description: "Séries inédites de défis sportifs et badges collector à débloquer au fil de vos courses pour célébrer chaque étape clé de votre progression."
            };
        }

        // I) Filtres / Recherche / Tri multicritères / Région
        if (hasAnyWord(['filtre', 'filtres', 'filtrer', 'tri', 'trier', 'recherche', 'rechercher', 'region', 'région', 'departement', 'département', 'tag', 'favori'])) {
            return {
                title: "🔍 Filtres Avancés & Tri Multicritères",
                status: "Bientôt disponible",
                date: getTimelineDate('short'),
                description: "Filtrage ultra-précis par distance, dénivelé positif, région géographique et étiquettes personnalisées pour trouver vos épreuves en un clin d'œil."
            };
        }

        // J) Scanner / OCR / Documents / PDF / Dossards
        if (hasAnyWord(['scan', 'scanner', 'ocr', 'pdf', 'dossard', 'dossards', 'certificat', 'bulletin', 'photo'])) {
            return {
                title: "📄 Import Automatique & Scanner de Dossards",
                status: "À l'étude",
                date: getTimelineDate('long'),
                description: "Extraction intelligente des informations de course à partir de vos fichiers PDF d'inscription et photos de dossards pour un remplissage en 1 clic."
            };
        }

        // K) Notifications / Rappels / Alertes d'inscriptions
        if (hasAnyWord(['notif', 'notification', 'notifications', 'rappel', 'rappels', 'alerte', 'alertes', 'sms', 'mail', 'push'])) {
            return {
                title: "🔔 Rappels Intelligents & Alertes d'Inscriptions",
                status: "Planifié",
                date: getTimelineDate('medium'),
                description: "Alertes programmées pour anticiper l'ouverture des inscriptions, les hausses de tarifs et les dates limites de retrait des dossards."
            };
        }

        // L) IA véritable (vérification stricte de mot entier "ia", "intelligence artificielle", "chatgpt", "gemini")
        if (hasWord('ia') || textLower.includes('intelligence artificielle') || hasWord('ai') || textLower.includes('chatgpt') || textLower.includes('gemini') || hasWord('coach')) {
            return {
                title: "🤖 Assistant IA & Conseils d'Allure Cible",
                status: "À l'étude",
                date: getTimelineDate('long'),
                description: "Recommandations personnalisées d'allure et estimations de temps de course basées sur votre historique pour aborder vos compétitions en confiance."
            };
        }

        // ─────────────────────────────────────────────────────────────
        // 2. MOTEUR DE REFORMULATION DYNAMIQUE SUR-MESURE (Pour toute idée libre)
        // ─────────────────────────────────────────────────────────────
        const cleanPhrase = rawText
            .replace(/^(traitement d'un nouveau sport\s*:?|traitement de|nouveau sport\s*:?|ajout d'un|ajout de|création d'un|création de|mise en place d'un|mise en place de|possibilité de|pouvoir faire|pouvoir|faire un|faire une|on aimerait|développer|ajouter)\s*/i, '')
            .replace(/[.–—:•*>\s]+$/, '')
            .trim();

        const formattedTitle = cleanPhrase.charAt(0).toUpperCase() + cleanPhrase.slice(1);
        
        let emoji = '🚀';
        if (textLower.includes('course') || textLower.includes('trail') || textLower.includes('marathon') || textLower.includes('run')) emoji = '🏃';
        else if (textLower.includes('carte') || textLower.includes('lieu') || textLower.includes('ville')) emoji = '📍';
        else if (textLower.includes('calcul') || textLower.includes('temps') || textLower.includes('heure')) emoji = '⏱️';
        else if (textLower.includes('sécurité') || textLower.includes('contact') || textLower.includes('urgence')) emoji = '🛡️';
        else if (textLower.includes('photo') || textLower.includes('image') || textLower.includes('galerie')) emoji = '📸';
        else if (textLower.includes('prix') || textLower.includes('tarif') || textLower.includes('budget') || textLower.includes('euro')) emoji = '💶';

        let estStatus = "Planifié";
        let estHorizon = 'medium';

        if (textLower.includes('refonte') || textLower.includes('application') || textLower.includes('serveur') || textLower.includes('complet') || textLower.includes('moteur')) {
            estStatus = "À l'étude";
            estHorizon = 'long';
        } else if (textLower.includes('bouton') || textLower.includes('simple') || textLower.includes('rapide') || textLower.includes('ajustement') || textLower.includes('texte') || textLower.includes('affichage')) {
            estStatus = "Bientôt disponible";
            estHorizon = 'short';
        }

        return {
            title: `${emoji} ${formattedTitle}`,
            status: estStatus,
            date: getTimelineDate(estHorizon),
            description: `Développement d'un module dédié pour ${cleanPhrase.toLowerCase()}, facilitant l'organisation de vos épreuves et enrichissant votre suivi sportif.`
        };
    }

    /**
     * Configuration du glisser-déposer (Drag & Drop) pour une ligne
     */
    function setupDragAndDropForRow(row) {
        row.setAttribute('draggable', 'true');

        row.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', row.id);
            row.classList.add('opacity-40', 'border-green-500', 'scale-[0.99]');
        });

        row.addEventListener('dragend', () => {
            row.classList.remove('opacity-40', 'border-green-500', 'scale-[0.99]');
            updateUpcomingRowOrderButtons();
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const list = document.getElementById('upcomingFeaturesEditorList');
            const dragging = list.querySelector('.opacity-40');
            if (dragging && dragging !== row) {
                const rect = row.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                list.insertBefore(dragging, next ? row.nextSibling : row);
            }
        });
    }

    /**
     * Déplace une ligne vers le haut ou vers le bas
     */
    window.moveUpcomingFeatureRow = function (rowId, direction) {
        const row = document.getElementById(rowId);
        if (!row) return;

        if (direction === -1) {
            const prev = row.previousElementSibling;
            if (prev && prev.classList.contains('upcoming-feature-row')) {
                prev.before(row);
                row.classList.add('ring-2', 'ring-green-400');
                setTimeout(() => row.classList.remove('ring-2', 'ring-green-400'), 400);
                updateUpcomingRowOrderButtons();
            }
        } else if (direction === 1) {
            const next = row.nextElementSibling;
            if (next && next.classList.contains('upcoming-feature-row')) {
                next.after(row);
                row.classList.add('ring-2', 'ring-green-400');
                setTimeout(() => row.classList.remove('ring-2', 'ring-green-400'), 400);
                updateUpcomingRowOrderButtons();
            }
        }
    };

    /**
     * Supprime une ligne spécifique et met à jour les boutons d'ordre
     */
    window.deleteUpcomingFeatureRow = function (rowId) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
            updateUpcomingRowOrderButtons();
        }
    };

    /**
     * Met à jour les compteurs et l'état actif/inactif des flèches Haut/Bas
     */
    function updateUpcomingRowOrderButtons() {
        const listContainer = document.getElementById('upcomingFeaturesEditorList');
        if (!listContainer) return;
        const rows = listContainer.querySelectorAll('.upcoming-feature-row');
        rows.forEach((row, idx) => {
            const upBtn = row.querySelector('.btn-move-up');
            const downBtn = row.querySelector('.btn-move-down');
            const numBadge = row.querySelector('.row-number-badge');

            if (numBadge) numBadge.textContent = `#${idx + 1}`;

            if (upBtn) {
                if (idx === 0) {
                    upBtn.disabled = true;
                    upBtn.classList.add('opacity-30', 'cursor-not-allowed');
                    upBtn.classList.remove('hover:text-green-700', 'cursor-pointer');
                } else {
                    upBtn.disabled = false;
                    upBtn.classList.remove('opacity-30', 'cursor-not-allowed');
                    upBtn.classList.add('hover:text-green-700', 'cursor-pointer');
                }
            }

            if (downBtn) {
                if (idx === rows.length - 1) {
                    downBtn.disabled = true;
                    downBtn.classList.add('opacity-30', 'cursor-not-allowed');
                    downBtn.classList.remove('hover:text-green-700', 'cursor-pointer');
                } else {
                    downBtn.disabled = false;
                    downBtn.classList.remove('opacity-30', 'cursor-not-allowed');
                    downBtn.classList.add('hover:text-green-700', 'cursor-pointer');
                }
            }
        });
    }

    /**
     * Ajoute une ligne dans le formulaire d'édition
     */
    window.addUpcomingFeatureRow = function (data = { title: '', status: 'Planifié', date: '', description: '' }, isAiGenerated = false) {
        const listContainer = document.getElementById('upcomingFeaturesEditorList');
        if (!listContainer) return;

        // Si la liste ne contenait qu'une ligne vide par défaut et qu'on insère avec l'IA, on la retire
        if (isAiGenerated) {
            const existingRows = listContainer.querySelectorAll('.upcoming-feature-row');
            if (existingRows.length === 1) {
                const firstTitle = existingRows[0].querySelector('.feature-title');
                if (firstTitle && firstTitle.value.trim() === '') {
                    existingRows[0].remove();
                }
            }
        }

        const rowId = 'upcoming_row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        const currentStatus = data.status || 'Planifié';

        const rowHTML = `
            <div id="${rowId}" class="upcoming-feature-row bg-gray-50 border ${isAiGenerated ? 'border-purple-300 bg-purple-50/40' : 'border-gray-200'} rounded-lg p-3 relative space-y-2 transition duration-300 cursor-default">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                        <i class="fas fa-grip-vertical text-gray-400 cursor-grab px-1 select-none" title="Glisser-déposer pour réorganiser"></i>
                        <span class="row-number-badge text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">#</span>
                        <span class="text-xs font-bold ${isAiGenerated ? 'text-purple-800' : 'text-green-800'} flex items-center gap-1.5 ml-1">
                            <i class="fas ${isAiGenerated ? 'fa-magic text-purple-600' : 'fa-list text-green-600'}"></i>
                            <span>${isAiGenerated ? 'Proposition automatique (modifiable)' : 'Fonctionnalité'}</span>
                        </span>
                    </div>
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="window.moveUpcomingFeatureRow('${rowId}', -1)" class="btn-move-up text-gray-500 hover:text-green-700 p-1 text-xs transition cursor-pointer" title="Monter cette fonctionnalité">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" onclick="window.moveUpcomingFeatureRow('${rowId}', 1)" class="btn-move-down text-gray-500 hover:text-green-700 p-1 text-xs transition cursor-pointer" title="Descendre cette fonctionnalité">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" onclick="window.deleteUpcomingFeatureRow('${rowId}')" class="text-gray-400 hover:text-red-600 transition p-1 text-xs cursor-pointer ml-1.5" title="Supprimer">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div class="sm:col-span-2">
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Nom / Fonctionnalité *</label>
                        <input type="text" class="feature-title w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="ex: Export GPX automatique" value="${escapeHTML(data.title || '')}" required>
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Date approximative</label>
                        <input type="text" class="feature-date w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="ex: Fin Novembre 2026" value="${escapeHTML(data.date || '')}">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div class="sm:col-span-2">
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Description courte (optionnel)</label>
                        <input type="text" class="feature-desc w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="ex: Synchronisation directe de vos tracés avec vos montres..." value="${escapeHTML(data.description || '')}">
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-gray-700 mb-1">Statut</label>
                        <select class="feature-status w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition cursor-pointer">
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

        if (isAiGenerated) {
            listContainer.insertAdjacentHTML('afterbegin', rowHTML);
        } else {
            listContainer.insertAdjacentHTML('beforeend', rowHTML);
        }

        const insertedElement = document.getElementById(rowId);
        if (insertedElement) {
            setupDragAndDropForRow(insertedElement);
            insertedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            if (isAiGenerated) {
                // Atténuation douce de l'effet d'accentuation après 3 secondes
                setTimeout(() => {
                    insertedElement.classList.remove('ring-2', 'ring-purple-400', 'bg-purple-50/50');
                }, 3000);

                const titleInput = insertedElement.querySelector('.feature-title');
                if (titleInput) titleInput.focus();
            }
        }

        updateUpcomingRowOrderButtons();
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
