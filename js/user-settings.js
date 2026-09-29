/**
 * js/user-settings.js
 * Gère la modale de paramètres utilisateur (changement pseudo, reset mot de passe)
 * Doit être inclus après firebase-config.js et auth.js
 */

const userSettingsModalHTML = `
<div id="userSettingsModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-8 w-full max-w-lg m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300 max-h-[90vh] overflow-y-auto">
        <button onclick="closeSettingsModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
        </button>

        <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-1">Paramètres du compte</h2>
            <p class="text-sm text-gray-500" id="settingsUserEmail"></p>
            
            <!-- Photo de profil -->
            <div class="mt-4 flex flex-col items-center">
                <div class="relative group">
                    <div id="profileImageContainer" class="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img id="settingsProfilePic" src="https://ui-avatars.com/api/?name=User&background=random" onclick="if(this.src && !this.src.includes('ui-avatars.com')) zoomImage(this.src)" class="w-full h-full object-cover cursor-zoom-in">
                        <div id="profilePicLoading" class="hidden absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white">
                            <i class="fas fa-spinner fa-spin text-2xl"></i>
                        </div>
                    </div>
                    <button id="btnEditProfilePic" class="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110">
                        <i class="fas fa-camera text-sm"></i>
                    </button>
                    <input type="file" id="inputProfilePic" class="hidden" accept="image/*">
                </div>
                <button id="btnDeleteProfilePic" class="hidden mt-2 text-xs text-red-500 hover:text-red-700 font-medium transition">
                    <i class="fas fa-trash-alt mr-1"></i> Supprimer la photo
                </button>
            </div>

            <!-- Notice pour les invités -->
            <div id="inviteNotice" class="hidden mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                <p class="text-sm text-blue-800">
                    <i class="fas fa-info-circle mr-2"></i>
                    En mode invité, les options de modification sont limitées. Seule la réinitialisation du mot de passe est disponible.
                </p>
            </div>
        </div>

        <div class="space-y-6">
            <!-- Changer le Pseudo -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Modifier le pseudo</label>
                <form id="updatePseudoForm" class="flex gap-2">
                    <input type="text" id="settingsNewPseudo" required 
                        class="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800"
                        placeholder="Nouveau pseudo">
                    <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-md">
                        <i class="fas fa-save"></i>
                    </button>
                </form>
                <!-- Zone de message spécifique au pseudo -->
                <div id="pseudoMessageContainer" class="hidden mt-2 text-sm"></div>
            </div>

            <hr class="border-gray-100">

            <!-- Confidentialité et visibilité du carnet -->
            <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <i class="fas fa-user-shield text-green-600"></i>
                    <span>Visibilité du carnet & Confidentialité</span>
                </h3>
                <div class="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    
                    <!-- Sélecteur de niveau de visibilité à 3 paliers -->
                    <div class="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Niveau de visibilité</span>
                            <span id="privacyLevelBadge" class="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 transition-all bg-green-100 text-green-800 border border-green-200">
                                <i class="fas fa-file-lines text-green-600"></i> Fiche complète
                            </span>
                        </div>

                        <!-- 3 Boutons segmentés directs (UX tactile et clic immédiat) -->
                        <div class="grid grid-cols-3 gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                            <button type="button" id="btnPrivacyLvl0" onclick="window.setPrivacyLevel(0)"
                                class="privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-gray-600 hover:text-gray-900 cursor-pointer">
                                <i class="fas fa-lock text-sm text-red-500"></i>
                                <span>Privé</span>
                            </button>
                            <button type="button" id="btnPrivacyLvl1" onclick="window.setPrivacyLevel(1)"
                                class="privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-gray-600 hover:text-gray-900 cursor-pointer">
                                <i class="fas fa-eye text-sm text-blue-500"></i>
                                <span>Aperçu</span>
                            </button>
                            <button type="button" id="btnPrivacyLvl2" onclick="window.setPrivacyLevel(2)"
                                class="privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all bg-white text-green-800 shadow-sm border border-green-200 cursor-pointer">
                                <i class="fas fa-file-lines text-sm text-green-600"></i>
                                <span>Fiche complète</span>
                            </button>
                        </div>

                        <input type="hidden" id="privacyLevelInput" value="2">

                        <!-- Explication dynamique du niveau -->
                        <div id="privacyLevelDescription" class="text-xs text-gray-700 bg-green-50/70 p-2.5 rounded-lg border border-green-100 leading-relaxed flex items-start gap-2">
                            <i class="fas fa-info-circle text-green-600 mt-0.5 shrink-0"></i>
                            <div id="privacyLevelDescriptionText">
                                <strong>Fiche détaillée publique :</strong> Vos courses sont publiques et les visiteurs peuvent ouvrir la fiche complète.
                            </div>
                        </div>
                    </div>

                    <!-- Options Niveau 1 & 2 : Informations de base sur l'accueil -->
                    <div id="privacyBasicOptions" class="pt-1 space-y-2.5">
                        <p class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Informations affichées sur l'accueil :</p>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefShowPseudo" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" checked>
                            <span class="ml-2 text-sm text-gray-700">Afficher mon pseudo</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefShowCity" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" checked>
                            <span class="ml-2 text-sm text-gray-700">Afficher la ville de la course</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefShowDay" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" checked>
                            <span class="ml-2 text-sm text-gray-700">Afficher le jour précis (ex: 12 mars)</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefShowFavorite" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Afficher le statut "Favori"</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideLikeCount" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer le nombre de J'aime (pour les visiteurs)</span>
                        </label>
                    </div>

                    <!-- Options Niveau 2 : Masquage spécifique dans la fiche détaillée -->
                    <div id="privacyDetailOptions" class="pt-2 border-t border-gray-200 space-y-2.5">
                        <p class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Masquage dans la fiche détaillée :</p>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideNotes" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mes notes personnelles</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideRanking" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mes classements</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideStats" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer les stats calculées (allure, vitesse, D+/km)</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHidePhotos" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mes photos</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHidePrice" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer le prix d'inscription</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideBib" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer le numéro de dossard</span>
                        </label>
                    </div>

                    <!-- Options Classement des missions (toujours visible quel que soit le niveau des courses) -->
                    <div class="pt-2 border-t border-gray-200">
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefShowPseudoInLeaderboard" class="w-4 h-4 text-green-600 rounded focus:ring-green-500 shrink-0" checked>
                            <span class="ml-2 text-xs text-gray-700">Faire apparaître mon pseudo dans le classement des missions</span>
                        </label>
                    </div>

                    <div class="pt-2 border-t border-gray-200 mt-2">
                        <p class="text-xs text-green-600 font-medium"><i class="fas fa-check-circle mr-1"></i>Les modifications sont automatiquement enregistrées.</p>
                    </div>
                </div>
            </div>

            <hr class="border-gray-100">

            <!-- Préférences d'interface -->
            <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Préférences d'interface</h3>
                <div class="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowWishlistBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" checked>
                        <span class="ml-2 text-sm text-gray-700">Afficher le bouton "Wishlist"</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowStatsBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher le bouton "Statistiques"</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowBadgesBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" checked>
                        <span class="ml-2 text-sm text-gray-700">Afficher le bouton "Badges"</span>
                    </label>
                    <div class="pt-2 border-t border-gray-200 mt-2">
                        <p class="text-xs text-green-600 font-medium"><i class="fas fa-check-circle mr-1"></i>Les modifications sont automatiquement enregistrées.</p>
                    </div>
                </div>
                <div class="flex flex-col gap-1 mt-2">
                     <p class="text-xs text-gray-400 italic">Ces réglages contrôlent l'affichage des boutons dans le tableau de bord.</p>
                </div>
            </div>

            <hr class="border-gray-100">

            <!-- Gestion des données -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Gestion des données</label>
                <div class="grid grid-cols-2 gap-3">
                    <button id="btnSettingsExport" class="py-2.5 px-3 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                    <button id="btnSettingsImport" class="py-2.5 px-3 border border-teal-200 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow">
                        <i class="fas fa-upload"></i>
                        Importer
                    </button>
                </div>
                <p class="text-xs text-gray-400 italic mt-2"> Exportez ou importez vos courses et wishlist au format JSON.</p>
            </div>

            <hr class="border-gray-100">

            <!-- Actions rapides -->
            <div id="userSettingsActions">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
                <div class="space-y-2">
                    <div class="relative group">
                        <button id="btnShowTutorial" class="w-full py-1.5 px-3 border border-green-200 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-50">
                            <i class="fas fa-graduation-cap"></i>
                            Voir le tutoriel
                        </button>
                        <div id="tutorialDisabledTooltip" class="hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                            Veuillez recharger la page pour lancer le tutoriel
                            <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </div>
                    <button id="btnSendPasswordReset" class="w-full py-1.5 px-3 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm">
                        <i class="fas fa-key"></i>
                        Réinitialiser le mot de passe
                    </button>
                </div>
            </div>
            
            <!-- Zone de message -->
            <div id="settingsMessageContainer" class="hidden p-3 rounded-lg text-sm text-center"></div>
            
            <div class="mt-6 border-t border-red-100 pt-4">
                <h3 class="text-sm font-semibold text-red-800 mb-2">Zone Danger</h3>
                <button id="btnInitDeleteAccount" class="w-full py-1.5 px-3 border border-red-300 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2 text-sm">
                    <i class="fas fa-trash-alt"></i>
                    Supprimer mon compte
                </button>
            </div>
        </div>
    </div>
</div>

<!-- WARNING MODAL -->
<div id="deleteAccountWarningModal" class="modal hidden fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-6 w-full max-w-md m-4 rounded-xl shadow-2xl border border-red-200">
        <div class="text-center mb-6">
             <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                <i class="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Attention !</h3>
            <p class="text-gray-600">Vous allez perdre toutes vos données enregistrées (compte et wishlist).</p>
        </div>
        <div class="flex gap-3 justify-center">
             <button onclick="closeModal('deleteAccountWarningModal')" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">Annuler</button>
             <button id="btnConfirmDeleteWarning" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-bold">Confirmer</button>
        </div>
    </div>
</div>

<!-- ULTIMATUM MODAL -->
<div id="deleteAccountUltimatumModal" class="modal hidden fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-6 w-full max-w-lg m-4 rounded-xl shadow-2xl border-2 border-red-500 relative">
        <button onclick="closeModal('deleteAccountUltimatumModal')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
        </button>
        <div class="text-center mb-6">
             <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                <i class="fas fa-heart-broken text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-red-700 mb-4">Voulez-vous vraiment supprimer ?</h3>
            
            <p class="text-gray-700 mb-2 font-medium">Cette action est définitive et irréversible.</p>
            <p class="text-gray-500 mb-6 text-sm">Nous sommes tristes de vous voir partir...</p>

            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 mx-auto max-w-sm">
                <p class="text-blue-800 text-sm">
                    Avez-vous pensé à sauvegarder vos données ?<br>
                    Vous pouvez le faire via le bouton <i class="fas fa-download mx-1"></i> présent en haut à gauche de votre tableau de bord.
                </p>
            </div>
        </div>
        
        <!-- Zone de message d'erreur/succès pour suppression -->
        <div id="deleteAccountErrorContainer" class="hidden p-3 mb-4 rounded-lg text-sm text-center"></div>

        <div class="flex flex-col gap-3">
             <button id="btnFinalDeleteAccount" class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-bold shadow-lg hover:shadow-xl transform active:scale-95">
                OUI, Supprimer mon compte définitivement
             </button>
             <button onclick="closeModal('deleteAccountUltimatumModal')" class="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-semibold">
                Non, je reste !
             </button>
        </div>
    </div>
</div>
`;

window.settingsHasChanged = false;

document.addEventListener('DOMContentLoaded', () => {
    // Injecter la modale si elle n'existe pas
    if (!document.getElementById('userSettingsModal')) {
        const div = document.createElement('div');
        div.innerHTML = userSettingsModalHTML;
        document.body.appendChild(div);
    }

    // Empêcher la fermeture au clic extérieur pour la modale de paramètres
    const modal = document.getElementById('userSettingsModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            // Si on clique sur le backdrop (modal lui-même), ne rien faire
            if (e.target === modal) {
                e.stopPropagation();
                e.preventDefault();
                // Ne pas fermer la modale
                return false;
            }
        });

        // Empêcher la propagation des clics sur le contenu de la modale
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    // Attendre que l'auth soit prête avant d'initialiser les paramètres
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // Petit délai pour laisser le dashboard réparer le profil si nécessaire
            await new Promise(resolve => setTimeout(resolve, 500));
            initSettingsLogic();
        }
    });
});

// Fonction spécifique de fermeture pour gérer le reload
window.closeSettingsModal = function () {
    const modal = document.getElementById('userSettingsModal');
    if (modal) modal.classList.add('hidden');
    // Aussi fermer les sous-modales si ouvertes
    closeModal('deleteAccountWarningModal');
    closeModal('deleteAccountUltimatumModal');

    document.body.classList.remove('overflow-hidden'); // Unfreeze background

    if (window.settingsHasChanged) {
        window.location.reload();
    }
}

// Helper global closeModal (si modal-auth absent) - On le garde pour compatibilité générique
if (typeof window.closeModal === 'undefined') {
    window.closeModal = function (modalId) {
        if (modalId) {
            const el = document.getElementById(modalId);
            if (el) el.classList.add('hidden');
        } else {
            window.closeSettingsModal();
        }
    };
}

if (typeof window.openModal === 'undefined') {
    window.openModal = function (modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.remove('hidden');
    };
}

async function initSettingsLogic() {
    const pseudoForm = document.getElementById('updatePseudoForm');
    const resetBtn = document.getElementById('btnSendPasswordReset');
    const msgContainer = document.getElementById('settingsMessageContainer');

    // Contrôles Privacy & Niveau de visibilité
    const privacyLevelInput = document.getElementById('privacyLevelInput');
    const prefShowPseudo = document.getElementById('prefShowPseudo');
    const prefShowCity = document.getElementById('prefShowCity');
    const prefShowFavorite = document.getElementById('prefShowFavorite');
    const prefShowDay = document.getElementById('prefShowDay');
    const prefHideLikeCount = document.getElementById('prefHideLikeCount');
    const prefShowPseudoInLeaderboard = document.getElementById('prefShowPseudoInLeaderboard');

    // Nouveaux masquages spécifiques Fiche détaillée (Niveau 2)
    const prefHideNotes = document.getElementById('prefHideNotes');
    const prefHideRanking = document.getElementById('prefHideRanking');
    const prefHideStats = document.getElementById('prefHideStats');
    const prefHidePhotos = document.getElementById('prefHidePhotos');
    const prefHidePrice = document.getElementById('prefHidePrice');
    const prefHideBib = document.getElementById('prefHideBib');

    // Checkboxes UI preferences
    const prefShowStatsBtn = document.getElementById('prefShowStatsBtn');
    const prefShowBadgesBtn = document.getElementById('prefShowBadgesBtn');
    const prefShowWishlistBtn = document.getElementById('prefShowWishlistBtn');

    let currentSelectedPrivacyLevel = 2;

    // Mise à jour de l'affichage UI selon le niveau de confidentialité
    function updatePrivacyUI(level) {
        const lvl = parseInt(level) || 0;
        currentSelectedPrivacyLevel = lvl;

        const input = document.getElementById('privacyLevelInput');
        if (input) input.value = lvl;

        const badge = document.getElementById('privacyLevelBadge');
        const descText = document.getElementById('privacyLevelDescriptionText');
        const descBox = document.getElementById('privacyLevelDescription');
        const basicOpts = document.getElementById('privacyBasicOptions');
        const detailOpts = document.getElementById('privacyDetailOptions');

        // Boutons segmentés de niveau
        const btn0 = document.getElementById('btnPrivacyLvl0');
        const btn1 = document.getElementById('btnPrivacyLvl1');
        const btn2 = document.getElementById('btnPrivacyLvl2');

        const inactiveBase = "privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 cursor-pointer";
        const activeBase = "privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all bg-white shadow-sm border cursor-pointer";

        if (btn0) btn0.className = lvl === 0 ? `${activeBase} text-red-700 border-red-200` : inactiveBase;
        if (btn1) btn1.className = lvl === 1 ? `${activeBase} text-blue-700 border-blue-200` : inactiveBase;
        if (btn2) btn2.className = lvl === 2 ? `${activeBase} text-green-800 border-green-200` : inactiveBase;

        if (lvl === 0) {
            if (badge) {
                badge.className = "text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200";
                badge.innerHTML = `<i class="fas fa-lock text-red-500"></i> 100% Privé`;
            }
            if (descBox) descBox.className = "text-xs text-gray-700 bg-red-50/70 p-2.5 rounded-lg border border-red-100 leading-relaxed flex items-start gap-2";
            if (descText) {
                descText.innerHTML = `<strong>Totalement privé :</strong> Vos courses sont invisibles sur la page d'accueil communautaire. Vous seul pouvez les consulter dans votre carnet.`;
            }
            if (basicOpts) basicOpts.classList.add('hidden');
            if (detailOpts) detailOpts.classList.add('hidden');
        } else if (lvl === 1) {
            if (badge) {
                badge.className = "text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-blue-100 text-blue-700 border border-blue-200";
                badge.innerHTML = `<i class="fas fa-eye text-blue-500"></i> Aperçu simple`;
            }
            if (descBox) descBox.className = "text-xs text-gray-700 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 leading-relaxed flex items-start gap-2";
            if (descText) {
                descText.innerHTML = `<strong>Aperçu public :</strong> Vos courses apparaissent sur l'accueil avec les données de base (date, distance, terrain). Les visiteurs n'ont pas accès à la fiche détaillée (au clic sur le nom, ils sont redirigés vers le site officiel s'il est renseigné).`;
            }
            if (basicOpts) basicOpts.classList.remove('hidden');
            if (detailOpts) detailOpts.classList.add('hidden');
        } else {
            if (badge) {
                badge.className = "text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 bg-green-100 text-green-800 border border-green-200";
                badge.innerHTML = `<i class="fas fa-file-lines text-green-600"></i> Fiche complète`;
            }
            if (descBox) descBox.className = "text-xs text-gray-700 bg-green-50/70 p-2.5 rounded-lg border border-green-100 leading-relaxed flex items-start gap-2";
            if (descText) {
                descText.innerHTML = `<strong>Fiche détaillée publique :</strong> Vos courses sont publiques et les visiteurs peuvent ouvrir la fiche complète. Vous pouvez choisir ci-dessous les éléments à masquer.`;
            }
            if (basicOpts) basicOpts.classList.remove('hidden');
            if (detailOpts) detailOpts.classList.remove('hidden');
        }
    }

    window.setPrivacyLevel = function (lvl) {
        if (isInvite) return;
        updatePrivacyUI(lvl);
        savePrivacySettings();
    };

    // Vérifier si l'utilisateur est invité
    let isInvite = false;
    if (typeof window.isInviteUser === 'function') {
        isInvite = await window.isInviteUser();
    } else {
        // Fallback si isInvite.js n'est pas encore chargé
        console.warn('window.isInviteUser not available');
    }

    // Désactiver les contrôles pour les invités (sauf le bouton reset password)
    if (isInvite) {
        // Désactiver le formulaire pseudo
        const pseudoInput = document.getElementById('settingsNewPseudo');
        const pseudoSubmitBtn = pseudoForm?.querySelector('button[type="submit"]');
        if (pseudoInput) {
            pseudoInput.disabled = true;
            pseudoInput.classList.add('opacity-50', 'cursor-not-allowed');
        }
        if (pseudoSubmitBtn) {
            pseudoSubmitBtn.disabled = true;
            pseudoSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Désactiver les boutons de niveau de confidentialité et toutes les checkboxes
        ['btnPrivacyLvl0', 'btnPrivacyLvl1', 'btnPrivacyLvl2'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        [
            prefShowPseudo, prefShowCity, prefShowFavorite, prefShowDay, prefHideLikeCount, prefShowPseudoInLeaderboard,
            prefHideNotes, prefHideRanking, prefHideStats, prefHidePhotos, prefHidePrice, prefHideBib
        ].forEach(cb => {
            if (cb) {
                cb.disabled = true;
                cb.classList.add('opacity-50', 'cursor-not-allowed');
                const label = cb.closest('label');
                if (label) label.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Désactiver toutes les checkboxes de préférences UI
        [prefShowStatsBtn, prefShowBadgesBtn, prefShowWishlistBtn].forEach(cb => {
            if (cb) {
                cb.disabled = true;
                cb.classList.add('opacity-50', 'cursor-not-allowed');
                const label = cb.closest('label');
                if (label) label.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Désactiver les boutons import/export pour les invités
        const btnSettingsImport = document.getElementById('btnSettingsImport');
        const btnSettingsExport = document.getElementById('btnSettingsExport');
        if (btnSettingsImport) {
            btnSettingsImport.disabled = true;
            btnSettingsImport.classList.add('opacity-50', 'cursor-not-allowed');
        }
        if (btnSettingsExport) {
            btnSettingsExport.disabled = true;
            btnSettingsExport.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Désactiver le bouton de suppression de compte
        const deleteAccountBtn = document.getElementById('btnInitDeleteAccount');
        if (deleteAccountBtn) {
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Désactiver la photo de profil pour les invités
        const btnEditProfilePic = document.getElementById('btnEditProfilePic');
        if (btnEditProfilePic) {
            btnEditProfilePic.disabled = true;
            btnEditProfilePic.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        }
    }

    // Gestion de la Photo de profil
    const btnEditProfilePic = document.getElementById('btnEditProfilePic');
    const inputProfilePic = document.getElementById('inputProfilePic');
    const btnDeleteProfilePic = document.getElementById('btnDeleteProfilePic');
    const profilePicImg = document.getElementById('settingsProfilePic');
    const profilePicLoading = document.getElementById('profilePicLoading');

    if (btnEditProfilePic && inputProfilePic && !isInvite) {
        btnEditProfilePic.addEventListener('click', () => inputProfilePic.click());

        inputProfilePic.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validation taille (Firestore limit is 1MB total per doc, so 600KB max for image in base64 is safer)
            if (file.size > 600 * 1024) {
                showMessage("L'image est trop volumineuse pour le stockage direct (max 600 Ko).", "error");
                return;
            }

            const user = firebase.auth().currentUser;
            if (!user) return;

            try {
                profilePicLoading.classList.remove('hidden');
                btnEditProfilePic.disabled = true;

                // Lecture du fichier en Base64
                const reader = new FileReader();
                const base64Promise = new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(file);
                const base64String = await base64Promise;

                // Mettre à jour Firestore
                await db.collection('users').doc(user.uid).update({
                    photoURL: base64String
                });

                // Mettre à jour l'UI
                profilePicImg.src = base64String;
                window.currentUserPhoto = base64String;
                localStorage.setItem('userCustomPhoto', base64String);
                if (btnDeleteProfilePic) btnDeleteProfilePic.classList.remove('hidden');
                settingsHasChanged = true;

                showMessage("Photo de profil mise à jour !", "success");
            } catch (error) {
                console.error("Erreur traitement photo:", error);
                showMessage("Erreur lors de l'enregistrement de la photo.", "error");
            } finally {
                profilePicLoading.classList.add('hidden');
                btnEditProfilePic.disabled = false;
            }
        });
    }

    if (btnDeleteProfilePic && !isInvite) {
        btnDeleteProfilePic.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user) return;

            if (!confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) {
                return;
            }

            try {
                profilePicLoading.classList.remove('hidden');

                // Mettre à jour Firestore
                await db.collection('users').doc(user.uid).update({
                    photoURL: firebase.firestore.FieldValue.delete()
                });

                // Mettre à jour l'UI
                const userDoc = await db.collection('users').doc(user.uid).get();
                const currentPseudo = userDoc.exists ? (userDoc.data().pseudo || "User") : "User";
                profilePicImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPseudo)}&background=random`;
                window.currentUserPhoto = null;
                localStorage.removeItem('userCustomPhoto');
                btnDeleteProfilePic.classList.add('hidden');
                settingsHasChanged = true;

                showMessage("Photo supprimée avec succès.", "success");
            } catch (error) {
                console.error("Erreur suppression photo:", error);
                showMessage("Erreur lors de la suppression.", "error");
            } finally {
                profilePicLoading.classList.add('hidden');
            }
        });
    }

    // Sauvegarder les préférences au changement
    const savePrivacySettings = async () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const currentLevel = currentSelectedPrivacyLevel;
        const isAccountPublic = currentLevel > 0;

        const privacy = {
            level: currentLevel,
            isPublic: isAccountPublic,
            showPseudo: prefShowPseudo ? prefShowPseudo.checked : true,
            showCity: prefShowCity ? prefShowCity.checked : true,
            showFavorite: prefShowFavorite ? prefShowFavorite.checked : false,
            showDay: prefShowDay ? prefShowDay.checked : true,
            hideLikeCount: prefHideLikeCount ? prefHideLikeCount.checked : false,
            showPseudoInLeaderboard: prefShowPseudoInLeaderboard ? prefShowPseudoInLeaderboard.checked : true,
            // Nouveaux masquages fiche détaillée
            hideNotes: prefHideNotes ? prefHideNotes.checked : false,
            hideRanking: prefHideRanking ? prefHideRanking.checked : false,
            hideStats: prefHideStats ? prefHideStats.checked : false,
            hidePhotos: prefHidePhotos ? prefHidePhotos.checked : false,
            hidePrice: prefHidePrice ? prefHidePrice.checked : false,
            hideBib: prefHideBib ? prefHideBib.checked : false
        };

        localStorage.setItem('prefAccountPublicRaces', isAccountPublic ? 'true' : 'false');
        window.prefAccountPublicRaces = isAccountPublic;

        if (prefShowPseudoInLeaderboard) {
            localStorage.setItem('prefShowPseudoInLeaderboard', prefShowPseudoInLeaderboard.checked ? 'true' : 'false');
            window.prefShowPseudoInLeaderboard = prefShowPseudoInLeaderboard.checked;
        }

        try {
            await db.collection('users').doc(user.uid).set({ privacy, isPublic: isAccountPublic }, { merge: true });
            console.log("Préférences sauvegardées", privacy);
            settingsHasChanged = true; // Reload required to reflect changes on public page
        } catch (e) {
            console.error("Erreur save privacy", e);
        }
    };

    // Sauvegarder les préférences d'interface
    const saveUISettings = async () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const uiPreferences = {
            showStatsBtn: prefShowStatsBtn.checked,
            showBadgesBtn: prefShowBadgesBtn.checked,
            showWishlistBtn: prefShowWishlistBtn.checked
        };

        try {
            await db.collection('users').doc(user.uid).set({ uiPreferences }, { merge: true });
            console.log("Préférences UI sauvegardées", uiPreferences);
            settingsHasChanged = true; // Reload required to reflect changes
        } catch (e) {
            console.error("Erreur save UI preferences", e);
        }
    };

    // Ne pas attacher les listeners si l'utilisateur est invité
    if (!isInvite) {
        [
            prefShowPseudo, prefShowCity, prefShowFavorite, prefShowDay, prefHideLikeCount, prefShowPseudoInLeaderboard,
            prefHideNotes, prefHideRanking, prefHideStats, prefHidePhotos, prefHidePrice, prefHideBib
        ].forEach(cb => {
            if (cb) cb.addEventListener('change', savePrivacySettings);
        });

        [prefShowStatsBtn, prefShowBadgesBtn, prefShowWishlistBtn].forEach(cb => {
            if (cb) cb.addEventListener('change', saveUISettings);
        });

        // Bouton Importer dans les paramètres
        const btnSettingsImport = document.getElementById('btnSettingsImport');
        if (btnSettingsImport) {
            btnSettingsImport.addEventListener('click', () => {
                // Fermer la modale des paramètres
                const settingsModal = document.getElementById('userSettingsModal');
                if (settingsModal) settingsModal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
                // Ouvrir la modale d'import
                const importJsonModal = document.getElementById('importJsonModal');
                if (importJsonModal) {
                    importJsonModal.classList.remove('hidden');
                    const jsonFileInput = document.getElementById('jsonFileInput');
                    const importPreview = document.getElementById('importPreview');
                    const importMessage = document.getElementById('importMessage');
                    const confirmImportBtn = document.getElementById('confirmImportBtn');
                    if (jsonFileInput) jsonFileInput.value = '';
                    if (importPreview) importPreview.classList.add('hidden');
                    if (importMessage) importMessage.classList.add('hidden');
                    if (confirmImportBtn) confirmImportBtn.disabled = true;
                }
            });
        }

        // Bouton Exporter dans les paramètres
        const btnSettingsExport = document.getElementById('btnSettingsExport');
        if (btnSettingsExport) {
            btnSettingsExport.addEventListener('click', () => {
                // Fermer la modale des paramètres
                const settingsModal = document.getElementById('userSettingsModal');
                if (settingsModal) settingsModal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
                // Ouvrir la modale de backup/export
                const backupModal = document.getElementById('backupConfirmationModal');
                if (backupModal) backupModal.classList.remove('hidden');
            });
        }
    }

    // Gestion du bouton tutoriel
    const tutorialBtn = document.getElementById('btnShowTutorial');
    const tutorialTooltip = document.getElementById('tutorialDisabledTooltip');

    if (tutorialBtn) {
        // Vérifier si on est sur index.html
        const isOnIndexPage = window.location.pathname.includes('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/');

        if (isOnIndexPage) {
            tutorialBtn.disabled = true;
            if (tutorialTooltip) {
                tutorialTooltip.textContent = 'Le tutoriel est uniquement disponible depuis le tableau de bord des courses';
            }
        }

        tutorialBtn.addEventListener('click', function () {
            if (!this.disabled) {
                closeSettingsModal();
                setTimeout(() => {
                    if (typeof startTutorial === 'function') {
                        startTutorial();
                    }
                }, 300);
            }
        });

        // Afficher/masquer le tooltip au hover si désactivé
        tutorialBtn.addEventListener('mouseenter', function () {
            if (this.disabled && tutorialTooltip) {
                tutorialTooltip.classList.remove('hidden');
            }
        });

        tutorialBtn.addEventListener('mouseleave', function () {
            if (tutorialTooltip) {
                tutorialTooltip.classList.add('hidden');
            }
        });
    }

    // CHARGEMENT DES PRÉFÉRENCES ACTUELLES
    const loadCurrentSettings = async () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();

                // Privacy level
                let privacyLevel = 2; // default full
                if (data.privacy && data.privacy.level !== undefined) {
                    privacyLevel = parseInt(data.privacy.level);
                } else if (data.privacy && data.privacy.isPublic !== undefined) {
                    privacyLevel = data.privacy.isPublic === true ? 2 : 0;
                } else if (data.isPublic !== undefined) {
                    privacyLevel = data.isPublic === true ? 2 : 0;
                }

                updatePrivacyUI(privacyLevel);

                const isAccountPublic = privacyLevel > 0;
                localStorage.setItem('prefAccountPublicRaces', isAccountPublic ? 'true' : 'false');
                window.prefAccountPublicRaces = isAccountPublic;

                if (data.privacy) {
                    if (prefShowPseudo) prefShowPseudo.checked = data.privacy.showPseudo !== false;
                    if (prefShowCity) prefShowCity.checked = data.privacy.showCity !== false;
                    if (prefShowFavorite) prefShowFavorite.checked = data.privacy.showFavorite === true;
                    if (prefShowDay) prefShowDay.checked = data.privacy.showDay !== false;
                    if (prefHideLikeCount) prefHideLikeCount.checked = data.privacy.hideLikeCount === true;
                    if (prefShowPseudoInLeaderboard) {
                        const isChecked = data.privacy.showPseudoInLeaderboard === true;
                        prefShowPseudoInLeaderboard.checked = isChecked;
                        localStorage.setItem('prefShowPseudoInLeaderboard', isChecked ? 'true' : 'false');
                        window.prefShowPseudoInLeaderboard = isChecked;
                    }
                    // Nouveaux masquages fiche détaillée
                    if (prefHideNotes) prefHideNotes.checked = data.privacy.hideNotes === true;
                    if (prefHideRanking) prefHideRanking.checked = data.privacy.hideRanking === true;
                    if (prefHideStats) prefHideStats.checked = data.privacy.hideStats === true;
                    if (prefHidePhotos) prefHidePhotos.checked = data.privacy.hidePhotos === true;
                    if (prefHidePrice) prefHidePrice.checked = data.privacy.hidePrice === true;
                    if (prefHideBib) prefHideBib.checked = data.privacy.hideBib === true;
                } else {
                    if (prefShowPseudo) prefShowPseudo.checked = true;
                    if (prefShowCity) prefShowCity.checked = true;
                    if (prefShowFavorite) prefShowFavorite.checked = false;
                    if (prefShowDay) prefShowDay.checked = true;
                    if (prefHideLikeCount) prefHideLikeCount.checked = false;
                    if (prefShowPseudoInLeaderboard) prefShowPseudoInLeaderboard.checked = true;
                    if (prefHideNotes) prefHideNotes.checked = false;
                    if (prefHideRanking) prefHideRanking.checked = false;
                    if (prefHideStats) prefHideStats.checked = false;
                    if (prefHidePhotos) prefHidePhotos.checked = false;
                    if (prefHidePrice) prefHidePrice.checked = false;
                    if (prefHideBib) prefHideBib.checked = false;
                }

                // UI preferences (Default to true if undefined, as buttons were previously visible)
                if (data.uiPreferences) {
                    if (prefShowStatsBtn) prefShowStatsBtn.checked = data.uiPreferences.showStatsBtn !== false;
                    if (prefShowBadgesBtn) prefShowBadgesBtn.checked = data.uiPreferences.showBadgesBtn !== false;
                    if (prefShowWishlistBtn) prefShowWishlistBtn.checked = data.uiPreferences.showWishlistBtn !== false;
                } else {
                    // Defaults if no settings saved yet
                    if (prefShowStatsBtn) prefShowStatsBtn.checked = true;
                    if (prefShowBadgesBtn) prefShowBadgesBtn.checked = true;
                    if (prefShowWishlistBtn) prefShowWishlistBtn.checked = true;
                }

                // Pseudo input
                const pseudoInput = document.getElementById('settingsNewPseudo');
                if (pseudoInput && data.pseudo) {
                    pseudoInput.value = data.pseudo;
                }
            }
        } catch (e) {
            console.error("Erreur chargement settings", e);
        }
    };

    // Appeler le chargement
    loadCurrentSettings();

    // Fonction d'affichage de message
    function showMessage(msg, type = 'success', targetId = 'settingsMessageContainer') {
        const targetContainer = document.getElementById(targetId);
        if (!targetContainer) return;

        targetContainer.textContent = msg;
        targetContainer.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'text-green-600', 'text-red-600');

        if (targetId === 'pseudoMessageContainer') {
            // Style spécifique pour le message sous le pseudo (texte simple coloré)
            if (type === 'success') {
                targetContainer.classList.add('text-green-600');
            } else {
                targetContainer.classList.add('text-red-600');
            }
        } else {
            // Style boîte classique
            if (type === 'success') {
                targetContainer.classList.add('bg-green-100', 'text-green-800');
            } else {
                targetContainer.classList.add('bg-red-100', 'text-red-800');
            }
        }

        targetContainer.classList.remove('hidden');

        setTimeout(() => {
            targetContainer.classList.add('hidden');
        }, 5000);
    }

    // Gestion pseudo
    if (pseudoForm) {
        pseudoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPseudo = document.getElementById('settingsNewPseudo').value.trim();
            const user = firebase.auth().currentUser;

            if (!user) return;
            if (!newPseudo) return;

            const forbiddenPseudos = ['inconnu', 'unknown', 'anonyme', 'anonymous', 'deleted', 'supprimé', 'undefined', 'null', 'admin', 'invite', 'administrator', 'moderator'];
            if (forbiddenPseudos.includes(newPseudo.toLowerCase())) {
                showMessage("Ce pseudo n'est pas autorisé.", "error", "pseudoMessageContainer");
                return;
            }

            try {
                // Mise à jour Firestore
                await db.collection('users').doc(user.uid).update({
                    pseudo: newPseudo
                });

                window.currentUserPseudo = newPseudo;
                localStorage.setItem('userPseudo', newPseudo);

                // Mettre également à jour le profil Firebase Auth pour synchroniser displayName
                if (user && typeof user.updateProfile === 'function') {
                    await user.updateProfile({ displayName: newPseudo }).catch(err => console.warn('updateProfile non supporté:', err));
                }

                // Marquer le changement pour recharger la page à la fermeture
                settingsHasChanged = true;

                // Désactiver le bouton tutoriel et afficher le tooltip
                const tutorialBtn = document.getElementById('btnShowTutorial');
                if (tutorialBtn) {
                    tutorialBtn.disabled = true;
                }

                // Feedback
                showMessage("Pseudo mis à jour avec succès !", "success", "pseudoMessageContainer");

                // Mettre à jour l'affichage dans la barre si possible sans rechargement
                // On peut re-déclencher une mise à jour UI si nécessaire, mais le plus simple est de recharger ou attendre la prochaine nav.
                // Pour l'UX, on peut essayer de mettre à jour le texte du bandeau directement.
                const authStatusText = document.getElementById('authStatusText');
                if (authStatusText && authStatusText.innerHTML.includes('Connecté en tant que')) {
                    // On fait un remplacement simple dans le DOM pour éviter de refetch tout de suite
                    // Mais idéalement on devrait relancer la logique d'auth.
                    // Reload simple pour être sûr ? Non c'est brutal.
                    // On laisse l'utilisateur voir le message.
                }

            } catch (error) {
                console.error("Erreur update pseudo:", error);
                showMessage("Erreur lors de la mise à jour.", "error", "pseudoMessageContainer");
            }
        });
    }

    // Gestion Reset Password
    let passwordResetConfirmPending = false;
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user || !user.email) return;

            // Si pas encore en attente de confirmation
            if (!passwordResetConfirmPending) {
                passwordResetConfirmPending = true;
                resetBtn.innerHTML = '<i class="fas fa-check"></i> Confirmer l\'envoi';
                resetBtn.classList.remove('border-red-200', 'bg-red-50', 'text-red-600', 'hover:bg-red-100');
                resetBtn.classList.add('border-orange-200', 'bg-orange-50', 'text-orange-600', 'hover:bg-orange-100');

                showMessage(`Cliquez à nouveau pour envoyer un email à ${user.email}`, 'warning');

                // Réinitialiser après 5 secondes si pas de confirmation
                setTimeout(() => {
                    if (passwordResetConfirmPending) {
                        passwordResetConfirmPending = false;
                        resetBtn.innerHTML = '<i class="fas fa-key"></i> Réinitialiser le mot de passe';
                        resetBtn.classList.remove('border-orange-200', 'bg-orange-50', 'text-orange-600', 'hover:bg-orange-100');
                        resetBtn.classList.add('border-red-200', 'bg-red-50', 'text-red-600', 'hover:bg-red-100');
                    }
                }, 5000);
                return;
            }

            // Confirmation validée, envoi de l'email
            passwordResetConfirmPending = false;
            resetBtn.innerHTML = '<i class="fas fa-key"></i> Réinitialiser le mot de passe';
            resetBtn.classList.remove('border-orange-200', 'bg-orange-50', 'text-orange-600', 'hover:bg-orange-100');
            resetBtn.classList.add('border-red-200', 'bg-red-50', 'text-red-600', 'hover:bg-red-100');

            try {
                await firebase.auth().sendPasswordResetEmail(user.email);
                showMessage(`Email envoyé à ${user.email} ! Vérifiez vos spams.`, 'success');
            } catch (error) {
                console.error("Erreur reset password:", error);
                showMessage("Erreur lors de l'envoi de l'email.", "error");
            }
        });
    }

    // GESTION SUPPRESSION COMPTE
    const btnInitDelete = document.getElementById('btnInitDeleteAccount');
    const btnConfirmWarning = document.getElementById('btnConfirmDeleteWarning');
    const btnUltimatumDownload = document.getElementById('btnUltimatumDownload');
    const btnFinalDelete = document.getElementById('btnFinalDeleteAccount');

    if (btnInitDelete) {
        btnInitDelete.addEventListener('click', () => {
            // Fermer settings ? Non, on empile ou on switch. 
            // On affiche le Warning par dessus ou on switch.
            // Affichons par dessus (z-index 60 géré dans HTML)
            window.openModal('deleteAccountWarningModal');
        });
    }

    if (btnConfirmWarning) {
        btnConfirmWarning.addEventListener('click', () => {
            window.closeModal('deleteAccountWarningModal');
            window.openModal('deleteAccountUltimatumModal');
        });
    }



    if (btnFinalDelete) {
        btnFinalDelete.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user) return;

            // Désactiver bouton pour éviter double clic
            btnFinalDelete.disabled = true;
            btnFinalDelete.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Suppression en cours...`;

            // Vérification de sécurité (Session récente < 5 min)
            const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (now - lastSignInTime > fiveMinutes) {
                btnFinalDelete.disabled = false;
                btnFinalDelete.innerHTML = "OUI, Supprimer mon compte définitivement";

                const errContainer = document.getElementById('deleteAccountErrorContainer');
                if (errContainer) {
                    errContainer.textContent = "Par sécurité, cette action nécessite une connexion récente (moins de 5 min). Veuillez vous déconnecter et vous reconnecter avant de réessayer.";
                    errContainer.className = "p-3 mb-4 rounded-lg text-sm text-center bg-red-100 text-red-800";
                    errContainer.classList.remove('hidden');
                }
                return;
            }

            try {
                const uid = user.uid;

                // 1. Suppression des sous-collections (batch manuel si possible, ou simple tentative)
                // Note: Client SDK ne peut pas supprimer une collection entière facilement sans cloud function.
                // On va essayer de supprimer les documents visibles dans races et wishlist si les références globales existent.

                const deleteCollectionDocs = async (collectionRef) => {
                    if (!collectionRef) return;
                    try {
                        const snapshot = await collectionRef.get();
                        const batch = db.batch();
                        let count = 0;
                        snapshot.forEach(doc => {
                            batch.delete(doc.ref);
                            count++;
                        });
                        if (count > 0) await batch.commit();
                        console.log(`Supprimé ${count} docs de la collection.`);
                    } catch (e) {
                        console.warn("Erreur clean collection:", e);
                    }
                };

                // On suppose que window.racesCollection / wishlistCollection sont accessibles
                // Si on est dans dashboard.html avec les scripts chargés
                if (typeof racesCollection !== 'undefined') await deleteCollectionDocs(racesCollection);
                if (typeof wishlistCollection !== 'undefined') await deleteCollectionDocs(wishlistCollection);

                // 2. Supprimer la doc user
                await db.collection('users').doc(uid).delete();

                // 3. Supprimer le compte Auth
                await user.delete();

                // 4. Message et Redirection
                const errContainer = document.getElementById('deleteAccountErrorContainer');
                if (errContainer) {
                    errContainer.textContent = "Votre compte a été supprimé. Redirection...";
                    errContainer.className = "p-3 mb-4 rounded-lg text-sm text-center bg-green-100 text-green-800";
                    errContainer.classList.remove('hidden');
                }

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);

            } catch (error) {
                console.error("Erreur suppression compte:", error);
                btnFinalDelete.disabled = false;
                btnFinalDelete.innerText = "Réessayer la suppression";

                const errContainer = document.getElementById('deleteAccountErrorContainer');
                let msg = "Une erreur est survenue : " + error.message;

                if (error.code === 'auth/requires-recent-login') {
                    msg = "Par sécurité, cette opération nécessite une connexion récente. Veuillez vous déconnecter et vous reconnecter, puis réessayez.";
                }

                if (errContainer) {
                    errContainer.textContent = msg;
                    errContainer.className = "p-3 mb-4 rounded-lg text-sm text-center bg-red-100 text-red-800";
                    errContainer.classList.remove('hidden');
                }
            }
        });
    }
}

// Fonction globale pour ouvrir les paramètres
window.openUserSettings = async function () {
    if (window.isSelectionMode) return;
    const modal = document.getElementById('userSettingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Freeze background
    }

    const user = firebase.auth().currentUser;
    if (!user) return;

    const emailDisplay = document.getElementById('settingsUserEmail');
    const pseudoInput = document.getElementById('settingsNewPseudo');
    const inviteNotice = document.getElementById('inviteNotice');

    // Checkboxes inputs
    const prefShowPseudo = document.getElementById('prefShowPseudo');
    const prefShowCity = document.getElementById('prefShowCity');
    const prefShowFavorite = document.getElementById('prefShowFavorite');
    const prefShowDay = document.getElementById('prefShowDay');
    const prefHideLikeCount = document.getElementById('prefHideLikeCount');
    const prefShowPseudoInLeaderboard = document.getElementById('prefShowPseudoInLeaderboard');

    if (emailDisplay) emailDisplay.textContent = user.email;

    // Vérifier si l'utilisateur est invité et afficher le notice
    let isInvite = false;
    if (typeof window.isInviteUser === 'function') {
        isInvite = await window.isInviteUser();
    } else {
        // Fallback si isInvite.js n'est pas encore chargé
        console.warn('window.isInviteUser not available in openUserSettings, using sessionStorage fallback');
        isInvite = sessionStorage.getItem('authLevel') === 'invite';
    }
    if (inviteNotice) {
        if (isInvite) {
            inviteNotice.classList.remove('hidden');
        } else {
            inviteNotice.classList.add('hidden');
        }
    }

    // Pré-remplir le pseudo actuel
    if (pseudoInput && !pseudoInput.value) pseudoInput.value = "Chargement...";

    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (pseudoInput) pseudoInput.value = data.pseudo || "";

            // Photo de profil
            const profilePicImg = document.getElementById('settingsProfilePic');
            const btnDeleteProfilePic = document.getElementById('btnDeleteProfilePic');
            if (profilePicImg) {
                if (data.photoURL) {
                    profilePicImg.src = data.photoURL;
                    if (btnDeleteProfilePic && !isInvite) btnDeleteProfilePic.classList.remove('hidden');
                } else {
                    const nameForAvatar = data.pseudo || "User";
                    profilePicImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`;
                    if (btnDeleteProfilePic) btnDeleteProfilePic.classList.add('hidden');
                }
            }

            const p = data.privacy || {};
            if (prefShowPseudo) prefShowPseudo.checked = (p.showPseudo !== undefined) ? p.showPseudo : true;
            if (prefShowCity) prefShowCity.checked = (p.showCity !== undefined) ? p.showCity : true;
            if (prefShowFavorite) prefShowFavorite.checked = (p.showFavorite !== undefined) ? p.showFavorite : false;
            if (prefShowDay) prefShowDay.checked = (p.showDay !== undefined) ? p.showDay : true;
            if (prefHideLikeCount) prefHideLikeCount.checked = (p.hideLikeCount !== undefined) ? p.hideLikeCount : false;
            if (prefShowPseudoInLeaderboard) prefShowPseudoInLeaderboard.checked = (p.showPseudoInLeaderboard !== undefined) ? p.showPseudoInLeaderboard : true;

            // Charger les préférences UI
            const ui = data.uiPreferences || {};
            const prefShowStatsBtn = document.getElementById('prefShowStatsBtn');
            const prefShowBadgesBtn = document.getElementById('prefShowBadgesBtn');
            const prefShowWishlistBtn = document.getElementById('prefShowWishlistBtn');

            if (prefShowStatsBtn) prefShowStatsBtn.checked = (ui.showStatsBtn !== undefined) ? ui.showStatsBtn : true;
            if (prefShowBadgesBtn) prefShowBadgesBtn.checked = (ui.showBadgesBtn !== undefined) ? ui.showBadgesBtn : true;
            if (prefShowWishlistBtn) prefShowWishlistBtn.checked = (ui.showWishlistBtn !== undefined) ? ui.showWishlistBtn : true;

        } else {
            if (pseudoInput) pseudoInput.value = "";
        }
    } catch (e) {
        console.error(e);
        if (pseudoInput) pseudoInput.value = "";
    }

    // Injecter le formulaire d'avis si disponible
    if (!isInvite && typeof window.injectReviewForm === 'function') {
        setTimeout(() => window.injectReviewForm(), 100);
    }
};

window.openSettingsModal = window.openUserSettings;

// Ouvre les paramètres et surligne précisément la case du classement
window.openUserSettingsForLeaderboard = function () {
    if (window.isSelectionMode) return;
    const badgesModal = document.getElementById('badgesModal');
    if (badgesModal) badgesModal.classList.add('hidden');

    if (typeof window.openUserSettings === 'function') {
        window.openUserSettings();
    } else {
        const modal = document.getElementById('userSettingsModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    }

    const highlightTarget = () => {
        const cb = document.getElementById('prefShowPseudoInLeaderboard');
        if (cb) {
            const label = cb.closest('label');
            if (label) {
                label.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const highlightClasses = ['ring-2', 'ring-emerald-500', 'bg-emerald-100/80', 'p-1.5', '-m-1.5', 'rounded-lg', 'transition-all', 'duration-300'];
                label.classList.add(...highlightClasses);
                setTimeout(() => {
                    label.classList.remove(...highlightClasses);
                }, 3000);
            }
            cb.focus();
        }
    };

    setTimeout(highlightTarget, 100);
    setTimeout(highlightTarget, 350);
};
