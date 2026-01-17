
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

            <!-- Confidentialité -->
            <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Confidentialité (Affichage public)</h3>
                <div class="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowPseudo" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher mon pseudo</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowCity" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher la ville de la course</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowFavorite" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher le statut "Favori"</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowDay" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher le jour précis (ex: 12 mars)</span>
                    </label>
                    <div class="pt-2 border-t border-gray-200 mt-2">
                        <p class="text-xs text-green-600 font-medium"><i class="fas fa-check-circle mr-1"></i>Les modifications sont automatiquement enregistrées.</p>
                    </div>
                </div>
                <div class="flex flex-col gap-1 mt-2">
                    <p class="text-xs text-gray-400 italic">Ces réglages s'appliquent à toutes vos courses publiques.</p>
                </div>
            </div>

            <hr class="border-gray-100">

            <!-- Préférences d'interface -->
            <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Préférences d'interface</h3>
                <div class="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowImportBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher le bouton "Importer mes données"</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefShowStatsBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher le bouton "Statistiques"</span>
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

            <!-- Actions rapides -->
            <div>
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
             <button onclick="closeModal('deleteAccountWarningModal')" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition">Annuler</button>
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

let settingsHasChanged = false;

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

    initSettingsLogic();
});

// Fonction spécifique de fermeture pour gérer le reload
window.closeSettingsModal = function () {
    const modal = document.getElementById('userSettingsModal');
    if (modal) modal.classList.add('hidden');
    // Aussi fermer les sous-modales si ouvertes
    closeModal('deleteAccountWarningModal');
    closeModal('deleteAccountUltimatumModal');

    document.body.classList.remove('overflow-hidden'); // Unfreeze background

    if (settingsHasChanged) {
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

    // Checkboxes
    const prefShowPseudo = document.getElementById('prefShowPseudo');
    const prefShowCity = document.getElementById('prefShowCity');
    const prefShowFavorite = document.getElementById('prefShowFavorite');
    const prefShowDay = document.getElementById('prefShowDay');

    // Checkboxes UI preferences
    const prefShowImportBtn = document.getElementById('prefShowImportBtn');
    const prefShowStatsBtn = document.getElementById('prefShowStatsBtn');

    // Vérifier si l'utilisateur est invité
    let isInvite = false;
    if (typeof window.isInviteUser === 'function') {
        isInvite = await window.isInviteUser();
    } else {
        // Fallback si isInvite.js n'est pas encore chargé
        console.warn('window.isInviteUser not available, using sessionStorage fallback');
        isInvite = sessionStorage.getItem('authLevel') === 'invite';
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

        // Désactiver toutes les checkboxes de confidentialité
        [prefShowPseudo, prefShowCity, prefShowFavorite, prefShowDay].forEach(cb => {
            if (cb) {
                cb.disabled = true;
                cb.classList.add('opacity-50', 'cursor-not-allowed');
                const label = cb.closest('label');
                if (label) label.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Désactiver toutes les checkboxes de préférences UI
        [prefShowImportBtn, prefShowStatsBtn].forEach(cb => {
            if (cb) {
                cb.disabled = true;
                cb.classList.add('opacity-50', 'cursor-not-allowed');
                const label = cb.closest('label');
                if (label) label.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Désactiver le bouton de suppression de compte
        const deleteAccountBtn = document.getElementById('btnInitDeleteAccount');
        if (deleteAccountBtn) {
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    // Sauvegarder les préférences au changement
    const savePrivacySettings = async () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const privacy = {
            showPseudo: prefShowPseudo.checked,
            showCity: prefShowCity.checked,
            showFavorite: prefShowFavorite.checked,
            showDay: prefShowDay.checked
        };

        try {
            await db.collection('users').doc(user.uid).set({ privacy }, { merge: true });
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
            showImportBtn: prefShowImportBtn.checked,
            showStatsBtn: prefShowStatsBtn.checked
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
        [prefShowPseudo, prefShowCity, prefShowFavorite, prefShowDay].forEach(cb => {
            if (cb) cb.addEventListener('change', savePrivacySettings);
        });

        [prefShowImportBtn, prefShowStatsBtn].forEach(cb => {
            if (cb) cb.addEventListener('change', saveUISettings);
        });
    }

    // Gestion du bouton tutoriel
    const tutorialBtn = document.getElementById('btnShowTutorial');
    const tutorialTooltip = document.getElementById('tutorialDisabledTooltip');

    if (tutorialBtn) {
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

                // Privacy settings
                if (data.privacy) {
                    if (prefShowPseudo) prefShowPseudo.checked = data.privacy.showPseudo !== false; // Default true if undefined? assuming privacy centric maybe false? let's stick to what's stored.
                    if (prefShowCity) prefShowCity.checked = data.privacy.showCity !== false;
                    if (prefShowFavorite) prefShowFavorite.checked = data.privacy.showFavorite !== false;
                    if (prefShowDay) prefShowDay.checked = data.privacy.showDay !== false;
                }

                // UI preferences (Default to true if undefined, as buttons were previously visible)
                if (data.uiPreferences) {
                    if (prefShowImportBtn) prefShowImportBtn.checked = data.uiPreferences.showImportBtn !== false;
                    if (prefShowStatsBtn) prefShowStatsBtn.checked = data.uiPreferences.showStatsBtn !== false;
                } else {
                    // Defaults if no settings saved yet
                    if (prefShowImportBtn) prefShowImportBtn.checked = true; // Default visible logic handled by dashboard
                    if (prefShowStatsBtn) prefShowStatsBtn.checked = true;
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

            try {
                // Mise à jour Firestore
                await db.collection('users').doc(user.uid).update({
                    pseudo: newPseudo
                });

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
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user || !user.email) return;

            // Confirmation
            if (!confirm(`Envoyer un email de réinitialisation à ${user.email} ?`)) return;

            try {
                await firebase.auth().sendPasswordResetEmail(user.email);
                showMessage(`Email envoyé à ${user.email} ! Vérifiez vos spams. (Peut prendre 5-10 min)`);
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
    const user = firebase.auth().currentUser;
    if (!user) return;

    const modal = document.getElementById('userSettingsModal');
    const emailDisplay = document.getElementById('settingsUserEmail');
    const pseudoInput = document.getElementById('settingsNewPseudo');
    const inviteNotice = document.getElementById('inviteNotice');

    // Checkboxes inputs
    const prefShowPseudo = document.getElementById('prefShowPseudo');
    const prefShowCity = document.getElementById('prefShowCity');
    const prefShowFavorite = document.getElementById('prefShowFavorite');
    const prefShowDay = document.getElementById('prefShowDay');

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
    if (pseudoInput) pseudoInput.value = "Chargement...";

    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (pseudoInput) pseudoInput.value = data.pseudo || "";

            const p = data.privacy || {};
            if (prefShowPseudo) prefShowPseudo.checked = (p.showPseudo !== undefined) ? p.showPseudo : true;
            if (prefShowCity) prefShowCity.checked = (p.showCity !== undefined) ? p.showCity : false;
            if (prefShowFavorite) prefShowFavorite.checked = (p.showFavorite !== undefined) ? p.showFavorite : false;
            if (prefShowDay) prefShowDay.checked = (p.showDay !== undefined) ? p.showDay : false;

            // Charger les préférences UI
            const ui = data.uiPreferences || {};
            const prefShowImportBtn = document.getElementById('prefShowImportBtn');
            const prefShowStatsBtn = document.getElementById('prefShowStatsBtn');

            // Par défaut : affiché (true) si non défini
            // Pour Import : Caché par défaut (demande user), activable manuellement.

            let defaultImportState = false;

            if (prefShowImportBtn) prefShowImportBtn.checked = (ui.showImportBtn !== undefined) ? ui.showImportBtn : defaultImportState;
            if (prefShowStatsBtn) prefShowStatsBtn.checked = (ui.showStatsBtn !== undefined) ? ui.showStatsBtn : true;

        } else {
            if (pseudoInput) pseudoInput.value = "";
        }
    } catch (e) {
        console.error(e);
        if (pseudoInput) pseudoInput.value = "";
    }

    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Freeze background
    }
}
