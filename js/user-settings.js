
/**
 * js/user-settings.js
 * Gère la modale de paramètres utilisateur (changement pseudo, reset mot de passe)
 * Doit être inclus après firebase-config.js et auth.js
 */

const userSettingsModalHTML = `
<div id="userSettingsModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-8 w-full max-w-md m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300">
        <button onclick="closeSettingsModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
        </button>

        <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-1">Paramètres du compte</h2>
            <p class="text-sm text-gray-500" id="settingsUserEmail"></p>
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
            </div>

            <hr class="border-gray-100">

            <!-- Réinitialiser mot de passe -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Sécurité</label>
                <button id="btnSendPasswordReset" class="w-full py-2 px-4 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2">
                    <i class="fas fa-key"></i>
                    Réinitialiser le mot de passe
                </button>
                <p class="text-xs text-gray-400 mt-1 text-center">Vous recevrez un email pour changer votre mot de passe.</p>
            </div>
            
            <!-- Zone de message -->
            <div id="settingsMessageContainer" class="hidden p-3 rounded-lg text-sm text-center"></div>
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

    initSettingsLogic();
});

// Fonction spécifique de fermeture pour gérer le reload
window.closeSettingsModal = function () {
    const modal = document.getElementById('userSettingsModal');
    if (modal) modal.classList.add('hidden');

    if (settingsHasChanged) {
        window.location.reload();
    }
}

// Helper global closeModal (si modal-auth absent) - On le garde pour compatibilité générique
if (typeof window.closeModal === 'undefined') {
    window.closeModal = window.closeSettingsModal; // Alias
}

function initSettingsLogic() {
    const pseudoForm = document.getElementById('updatePseudoForm');
    const resetBtn = document.getElementById('btnSendPasswordReset');
    const msgContainer = document.getElementById('settingsMessageContainer');

    // Fonction d'affichage de message
    function showMessage(msg, type = 'success') {
        msgContainer.textContent = msg;
        msgContainer.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');

        if (type === 'success') {
            msgContainer.classList.add('bg-green-100', 'text-green-800');
        } else {
            msgContainer.classList.add('bg-red-100', 'text-red-800');
        }

        setTimeout(() => {
            msgContainer.classList.add('hidden');
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

                // Feedback
                showMessage("Pseudo mis à jour avec succès !");

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
                showMessage("Erreur lors de la mise à jour.", "error");
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
}

// Fonction globale pour ouvrir les paramètres
window.openUserSettings = async function () {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const modal = document.getElementById('userSettingsModal');
    const emailDisplay = document.getElementById('settingsUserEmail');
    const pseudoInput = document.getElementById('settingsNewPseudo');

    if (emailDisplay) emailDisplay.textContent = user.email;

    // Pré-remplir le pseudo actuel
    if (pseudoInput) {
        pseudoInput.value = "Chargement...";
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists && doc.data().pseudo) {
                pseudoInput.value = doc.data().pseudo;
            } else {
                pseudoInput.value = "";
            }
        } catch (e) {
            pseudoInput.value = "";
        }
    }

    if (modal) modal.classList.remove('hidden');
}
