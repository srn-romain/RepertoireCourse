/**
 * modal-auth.js
 * Gère l'injection et la logique des modales de connexion/inscription
 * Nécessite firebase-config.js chargé au préalable
 */

const authModalsHTML = `
<!-- LOGIN MODAL -->
<div id="loginModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-8 w-full max-w-md m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300">
        <button onclick="checkAndCloseAuthModal('loginModal')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
        </button>

        <div id="loginHeader">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-green-800 mb-2">Bon retour !</h2>
                <p class="text-gray-600">Connectez-vous pour accéder à votre carnet.</p>
            </div>
        </div>

        <form id="loginForm" class="space-y-5">
            <div>
                <label for="login-email" class="block text-sm font-semibold text-gray-700 mb-1">Identifiant</label>
                <input type="text" inputmode="email" id="login-email" required autocomplete="username"
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400"
                    placeholder="Email">
            </div>
            <div>
                <label for="login-password" class="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
                <div class="relative">
                    <input type="password" id="login-password" required 
                        class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400 pr-10"
                        placeholder="••••••••">
                    <button type="button" id="login-toggle-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i class="fas fa-eye" id="login-eye"></i>
                        <i class="fas fa-eye-slash hidden" id="login-eye-off"></i>
                    </button>
                </div>
                <button type="button" id="btnShowForgotPassword" class="text-xs text-gray-500 hover:text-green-600 underline mt-2 block w-full text-right cursor-pointer">Mot de passe oublié ?</button>
            </div>

            <div id="login-error" class="hidden text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200"></div>

            <button type="submit" id="loginSubmitBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition transform hover:scale-[1.02] shadow-lg flex justify-center items-center">
                <span>Se connecter</span>
                <i class="fas fa-spinner fa-spin ml-2 hidden" id="login-loading"></i>
            </button>
        </form>

        <!-- FORGOT PASSWORD FORM (HIDDEN) -->
        <div id="forgotPasswordForm" class="hidden space-y-5">
            <div class="text-center mb-4">
                <h3 class="text-xl font-bold text-green-800 mb-1">Mot de passe oublié</h3>
                <p class="text-sm text-gray-600">Saisissez votre email pour réinitialiser votre mot de passe.</p>
            </div>
            <div>
                <label for="forgot-email" class="block text-sm font-semibold text-gray-700 mb-1">Adresse Email</label>
                <input type="email" id="forgot-email" 
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400"
                    placeholder="nom@exemple.com">
            </div>
            
            <div id="forgot-error" class="hidden text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200"></div>
            <div id="forgot-success" class="hidden text-green-600 text-sm text-center bg-green-50 p-2 rounded-lg border border-green-200"></div>

            <button type="button" id="forgotSubmitBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition transform hover:scale-[1.02] shadow-lg flex justify-center items-center">
                <span>Envoyer le mail</span>
                <i class="fas fa-spinner fa-spin ml-2 hidden" id="forgot-loading"></i>
            </button>
            
            <button type="button" id="btnBackToLogin" class="w-full text-sm text-gray-500 hover:text-green-600 font-semibold transition cursor-pointer text-center block">
                <i class="fas fa-arrow-left mr-2"></i>Retour à la connexion
            </button>
        </div>


        <!-- SEPARATEUR OU -->
        <div class="relative flex items-center py-5">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">OU</span>
            <div class="flex-grow border-t border-gray-300"></div>
        </div>

        <!-- GOOGLE LOGIN -->
        <button type="button" onclick="loginWithGoogle()" class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-full transition transform hover:scale-[1.02] shadow-sm">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
            <span>Continuer avec Google</span>
        </button>

        <div class="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?
            <button onclick="switchModal('loginModal', 'signupModal')" class="text-green-600 font-bold hover:underline cursor-pointer">Créer un compte</button>
        </div>
    </div>
</div>

<!-- SIGNUP MODAL -->
<div id="signupModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-8 w-full max-w-md m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300">
        <button onclick="checkAndCloseAuthModal('signupModal')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
        </button>

        <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-green-800 mb-2">Bienvenue !</h2>
            <p class="text-gray-600">Créez votre compte pour commencer.</p>
        </div>

        <form id="signupForm" class="space-y-4">
            <div>
                <label for="signup-pseudo" class="block text-sm font-semibold text-gray-700 mb-1">Pseudo</label>
                <input type="text" id="signup-pseudo" required autocomplete="username"
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400"
                    placeholder="Votre pseudo">
            </div>
            <div>
                <label for="signup-email" class="block text-sm font-semibold text-gray-700 mb-1">Adresse Email</label>
                <input type="email" id="signup-email" required autocomplete="email"
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400"
                    placeholder="nom@exemple.com">
            </div>
            <div>
                <label for="signup-password" class="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
                <div class="relative">
                    <input type="password" id="signup-password" required minlength="8" autocomplete="new-password"
                        class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400 pr-10"
                        placeholder="••••••••">
                    <button type="button" id="signup-toggle-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i class="fas fa-eye" id="signup-eye"></i>
                        <i class="fas fa-eye-slash hidden" id="signup-eye-off"></i>
                    </button>
                </div>
                
                <!-- PASSWORD STRENGTH METER -->
                <div class="mt-2">
                    <div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div id="passwordStrengthBar" class="h-full bg-red-500 w-0 transition-all duration-300"></div>
                    </div>
                    <span id="passwordStrengthText" class="text-xs text-gray-400 mt-1 block text-right">Faible</span>
                    
                    <ul class="text-xs text-gray-500 mt-2 space-y-1 grid grid-cols-2 gap-x-2">
                        <li id="lengthResult" class="text-gray-400"><i class="fas fa-circle text-[6px] mr-2 align-middle"></i> 8 caractères min.</li>
                        <li id="uppercaseResult" class="text-gray-400"><i class="fas fa-circle text-[6px] mr-2 align-middle"></i> Majuscule & Minuscule</li>
                        <li id="numberResult" class="text-gray-400"><i class="fas fa-circle text-[6px] mr-2 align-middle"></i> Chiffre</li>
                        <li id="specialResult" class="text-gray-400"><i class="fas fa-circle text-[6px] mr-2 align-middle"></i> Caractère spécial</li>
                    </ul>
                </div>
            </div>
            <div>
                <label for="signup-confirm-password" class="block text-sm font-semibold text-gray-700 mb-1">Confirmer</label>
                <div class="relative">
                    <input type="password" id="signup-confirm-password" required autocomplete="new-password"
                        class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400 pr-10"
                        placeholder="••••••••">
                    <button type="button" id="signup-confirm-toggle-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i class="fas fa-eye" id="signup-confirm-eye"></i>
                        <i class="fas fa-eye-slash hidden" id="signup-confirm-eye-off"></i>
                    </button>
                </div>
            </div>

            <div id="signup-error" class="hidden text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200"></div>

            <button type="submit" id="signupSubmitBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition transform hover:scale-[1.02] shadow-lg flex justify-center items-center">
                <span>S'inscrire</span>
                <i class="fas fa-spinner fa-spin ml-2 hidden" id="signup-loading"></i>
            </button>
            <button type="button" onclick="checkAndCloseAuthModal('signupModal')" class="w-full mt-2.5 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 font-semibold rounded-full transition transform hover:scale-[1.01] border border-gray-200 text-center text-sm cursor-pointer shadow-xs">
                Annuler
            </button>
        </form>

        <!-- SEPARATEUR OU -->
        <div class="relative flex items-center py-5">
            <div class="flex-grow border-t border-gray-300"></div>
            <span class="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">OU</span>
            <div class="flex-grow border-t border-gray-300"></div>
        </div>

        <!-- GOOGLE SIGNUP -->
        <button type="button" onclick="loginWithGoogle()" class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-full transition transform hover:scale-[1.02] shadow-sm">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
            <span>Continuer avec Google</span>
        </button>

        <div class="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?
            <button onclick="switchModal('signupModal', 'loginModal')" class="text-green-600 font-bold hover:underline cursor-pointer">Se connecter</button>
        </div>
    </div>
</div>
`;

// Modale de confirmation "modifications non enregistrées"
const unsavedChangesModalHTML = `
<div id="unsavedChangesModal" class="fixed inset-0 z-[999] flex items-center justify-center hidden">
    <div class="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-fadeIn">
        <div class="flex items-center gap-3 mb-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <i class="fas fa-exclamation-triangle text-amber-500 text-lg"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">Modifications non enregistrées</h3>
        </div>
        <p class="text-gray-600 mb-6 text-sm leading-relaxed">Vous avez commencé à remplir des champs. Voulez-vous vraiment quitter sans enregistrer ?</p>
        <div class="flex gap-3">
            <button id="unsavedStayBtn" class="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
                <i class="fas fa-arrow-left mr-1.5"></i> Continuer la saisie
            </button>
            <button id="unsavedLeaveBtn" class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition text-sm">
                <i class="fas fa-times mr-1.5"></i> Annuler / Quitter
            </button>
        </div>
    </div>
</div>
`;

// Inject Modals
document.addEventListener('DOMContentLoaded', () => {
    // Check if modals already exist (avoid duplication)
    if (!document.getElementById('loginModal')) {
        const div = document.createElement('div');
        div.innerHTML = authModalsHTML;
        document.body.appendChild(div);
    }

    // Inject unsaved changes modal
    if (!document.getElementById('unsavedChangesModal')) {
        const unsavedDiv = document.createElement('div');
        unsavedDiv.innerHTML = unsavedChangesModalHTML;
        document.body.appendChild(unsavedDiv);
    }

    // Initialize Logic
    initAuthLogic();
    initUnsavedChangesModal();
});

// ─── SCROLL LOCK UNIVERSEL ───────────────────────────────────────────────────
// Détecte toute modale ouverte (élément `position:fixed` visible avec z-index élevé)
// et gèle/libère le scroll du body automatiquement.

function updateBodyScroll() {
    if (typeof window.syncBodyScroll === 'function') {
        window.syncBodyScroll();
        return;
    }
    const candidates = document.querySelectorAll('.modal, [id$="Modal"], [id$="modal"]');
    let anyVisible = false;
    candidates.forEach(el => {
        if (el.classList.contains('hidden') || el.classList.contains('invisible')) return;
        const style = getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden' && (style.position === 'fixed' || style.position === 'absolute')) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                anyVisible = true;
            }
        }
    });
    document.body.style.overflow = anyVisible ? 'hidden' : '';
}

// Observer universel : déclenche sur tout changement de classe dans le DOM
(function setupScrollLockObserver() {
    function init() {
        const observer = new MutationObserver(() => {
            updateBodyScroll();
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'style'],
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init(); // DOM déjà prêt
    }
})();
// ─────────────────────────────────────────────────────────────────────────────

let _openModalCount = 0;

window.openModal = function (modalId) {
    if (window.isSelectionMode && modalId !== 'bulkNoteModal' && modalId !== 'bulkDeleteModal') {
        return;
    }
    const modal = document.getElementById(modalId);
    if (modal && modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        _openModalCount++;
        document.body.style.overflow = 'hidden';
    } else if (modal) {
        modal.classList.remove('hidden');
    }
}

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        _openModalCount = Math.max(0, _openModalCount - 1);
        if (_openModalCount === 0) document.body.style.overflow = '';
    }
}

window.switchModal = function (closeId, openId) {
    closeModal(closeId);
    openModal(openId);
}

window.loginWithGoogle = async function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Capturer le token de connexion Google pour Drive
        if (result.credential && result.credential.accessToken) {
            localStorage.setItem('googleDriveToken', result.credential.accessToken);
        }

        // Ensure user document exists in Firestore
        const userDocRef = db.collection('users').doc(user.uid);
        const doc = await userDocRef.get();
        if (!doc.exists) {
            const initialPseudo = user.displayName || user.email.split('@')[0];
            await userDocRef.set({
                email: user.email,
                pseudo: initialPseudo,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user'
            });
            window.currentUserPseudo = initialPseudo;
            localStorage.setItem('userPseudo', initialPseudo);
        } else {
            // Respecter le pseudo personnalisé existant dans Firestore
            const existingPseudo = doc.data().pseudo || user.displayName || user.email.split('@')[0];
            window.currentUserPseudo = existingPseudo;
            localStorage.setItem('userPseudo', existingPseudo);

            // Synchroniser le profil Auth pour que displayName reflète le pseudo choisi
            if (user && typeof user.updateProfile === 'function') {
                await user.updateProfile({ displayName: existingPseudo }).catch(() => {});
            }

            // Update last login
            await userDocRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                photoURL: doc.data().photoURL || user.photoURL
            });
        }

        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Google Auth Error:", error);
        if (error.code !== 'auth/popup-closed-by-user') {
            alert("Erreur de connexion avec Google : " + error.message);
        }
    }
}

function initAuthLogic() {
    // Password Toggles
    function setupToggle(toggleId, inputId, eyeId, eyeOffId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        const eye = document.getElementById(eyeId);
        const eyeOff = document.getElementById(eyeOffId);

        if (toggle && input && eye && eyeOff) {
            toggle.onclick = () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                eye.classList.toggle('hidden');
                eyeOff.classList.toggle('hidden');
            };
        }
    }

    setupToggle('login-toggle-password', 'login-password', 'login-eye', 'login-eye-off');
    setupToggle('signup-toggle-password', 'signup-password', 'signup-eye', 'signup-eye-off');
    setupToggle('signup-confirm-toggle-password', 'signup-confirm-password', 'signup-confirm-eye', 'signup-confirm-eye-off');

    // Helpers
    const showError = (elementId, msg) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = msg;
            el.classList.remove('hidden');
        }
    };

    const setLoading = (btnId, loadingId, isLoading) => {
        const btn = document.getElementById(btnId);
        const loading = document.getElementById(loadingId);
        if (btn && loading) {
            btn.disabled = isLoading;
            const span = btn.querySelector('span');
            if (span) span.style.opacity = isLoading ? '0.5' : '1';
            if (isLoading) loading.classList.remove('hidden'); else loading.classList.add('hidden');
        }
    };

    // LOGIN SUBMIT
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');

            // Auto format 'invite' user
            if (email.trim().toLowerCase() === 'invite') {
                email = 'invite@gmail.com';
            }

            if (errorEl) errorEl.classList.add('hidden');
            setLoading('loginSubmitBtn', 'login-loading', true);

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);

                // Auto-repair check
                const userDocRef = db.collection('users').doc(userCredential.user.uid);
                const doc = await userDocRef.get();
                if (!doc.exists) {
                    await userDocRef.set({
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: 'user'
                    });
                } else if (!doc.data().email) {
                    await userDocRef.update({ email: email });
                }

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Login error:", error);
                let msg = "Erreur de connexion.";
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') msg = "Email ou mot de passe incorrect.";
                else if (error.code === 'auth/invalid-email') msg = "Email invalide.";
                else if (error.code === 'auth/too-many-requests') msg = "Trop de tentatives. Réessayez plus tard.";
                showError('login-error', msg);
                setLoading('loginSubmitBtn', 'login-loading', false);
            }
        });
    }

    // FORGOT PASSWORD LOGIC
    const btnShowForgot = document.getElementById('btnShowForgotPassword');
    const btnBackToLogin = document.getElementById('btnBackToLogin');
    const forgotForm = document.getElementById('forgotPasswordForm');
    const loginFormEl = document.getElementById('loginForm');
    const forgotSubmitBtn = document.getElementById('forgotSubmitBtn');

    const loginHeader = document.getElementById('loginHeader');

    if (btnShowForgot && forgotForm && loginFormEl && loginHeader) {
        btnShowForgot.addEventListener('click', () => {
            loginFormEl.classList.add('hidden');
            loginHeader.classList.add('hidden');
            forgotForm.classList.remove('hidden');
            // Pré-remplir l'email si déjà tapé
            const loginEmail = document.getElementById('login-email').value;
            if (loginEmail && loginEmail.includes('@')) {
                document.getElementById('forgot-email').value = loginEmail;
            }
        });
    }

    if (btnBackToLogin && forgotForm && loginFormEl && loginHeader) {
        btnBackToLogin.addEventListener('click', () => {
            forgotForm.classList.add('hidden');
            loginFormEl.classList.remove('hidden');
            loginHeader.classList.remove('hidden');
            const errorEl = document.getElementById('forgot-error');
            const successEl = document.getElementById('forgot-success');
            if (errorEl) errorEl.classList.add('hidden');
            if (successEl) successEl.classList.add('hidden');
        });
    }

    if (forgotSubmitBtn) {
        document.getElementById('forgot-email')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                forgotSubmitBtn.click();
            }
        });

        forgotSubmitBtn.addEventListener('click', async () => {
            const email = document.getElementById('forgot-email').value.trim();
            const errorEl = document.getElementById('forgot-error');
            const successEl = document.getElementById('forgot-success');

            if (!email) {
                showError('forgot-error', "Veuillez saisir votre email.");
                return;
            }

            if (errorEl) errorEl.classList.add('hidden');
            if (successEl) successEl.classList.add('hidden');
            setLoading('forgotSubmitBtn', 'forgot-loading', true);

            try {
                // 1. Envoyer directement le mail de réinitialisation via Firebase Auth
                // (Sécurisé : évite l'énumération d'adresses et fonctionne avec les nouvelles règles Firestore sans permission de listage)
                await auth.sendPasswordResetEmail(email);

                // 2. Succès
                if (successEl) {
                    successEl.textContent = "Email envoyé ! Vérifiez vos spams.";
                    successEl.classList.remove('hidden');
                }
                setLoading('forgotSubmitBtn', 'forgot-loading', false);

                // On vide le champ
                document.getElementById('forgot-email').value = '';

            } catch (error) {
                console.error("Forgot password error:", error);
                let msg = "Erreur lors de l'envoi de l'email.";
                if (error.code === 'auth/invalid-email') msg = "Email invalide.";
                else if (error.code === 'auth/user-not-found') msg = "Cet email n'est pas reconnu.";
                showError('forgot-error', msg);
                setLoading('forgotSubmitBtn', 'forgot-loading', false);
            }
        });
    }


    // SIGNUP FORM LOGIC WITH PASSWORD STRENGTH
    const signupPasswordInput = document.getElementById('signup-password');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');

    // Critères
    const lengthResult = document.getElementById('lengthResult');
    const uppercaseResult = document.getElementById('uppercaseResult');
    const numberResult = document.getElementById('numberResult');
    const specialResult = document.getElementById('specialResult');

    // Barre de force
    const passwordStrengthBar = document.getElementById('passwordStrengthBar');
    const passwordStrengthText = document.getElementById('passwordStrengthText');

    function checkPasswordStrength(password) {
        let score = 0;
        let validCount = 0;
        const missing = [];

        // 1. Longueur (8 min)
        if (password.length >= 8) {
            lengthResult.classList.remove('text-gray-400');
            lengthResult.classList.add('text-green-600', 'font-bold');
            lengthResult.innerHTML = '<i class="fas fa-check mr-1"></i> 8 caractères min.';
            score += 25;
            validCount++;
        } else {
            lengthResult.classList.remove('text-green-600', 'font-bold');
            lengthResult.classList.add('text-gray-400');
            lengthResult.innerHTML = '<i class="fas fa-circle text-[6px] mr-2 align-middle"></i> 8 caractères min.';
            missing.push('au moins 8 caractères');
        }

        // 2. Majuscule & Minuscule (support des accents)
        const hasUpper = /[A-ZÀ-ÖØ-ß]/.test(password);
        const hasLower = /[a-zà-öø-ÿ]/.test(password);
        if (hasUpper && hasLower) {
            uppercaseResult.classList.remove('text-gray-400');
            uppercaseResult.classList.add('text-green-600', 'font-bold');
            uppercaseResult.innerHTML = '<i class="fas fa-check mr-1"></i> Majuscule & Minuscule';
            score += 25;
            validCount++;
        } else {
            uppercaseResult.classList.remove('text-green-600', 'font-bold');
            uppercaseResult.classList.add('text-gray-400');
            uppercaseResult.innerHTML = '<i class="fas fa-circle text-[6px] mr-2 align-middle"></i> Majuscule & Minuscule';
            missing.push('une majuscule et une minuscule');
        }

        // 3. Chiffre
        if (/[0-9]/.test(password)) {
            numberResult.classList.remove('text-gray-400');
            numberResult.classList.add('text-green-600', 'font-bold');
            numberResult.innerHTML = '<i class="fas fa-check mr-1"></i> Chiffre';
            score += 25;
            validCount++;
        } else {
            numberResult.classList.remove('text-green-600', 'font-bold');
            numberResult.classList.add('text-gray-400');
            numberResult.innerHTML = '<i class="fas fa-circle text-[6px] mr-2 align-middle"></i> Chiffre';
            missing.push('un chiffre');
        }

        // 4. Caractère spécial
        if (/[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s]/.test(password)) {
            specialResult.classList.remove('text-gray-400');
            specialResult.classList.add('text-green-600', 'font-bold');
            specialResult.innerHTML = '<i class="fas fa-check mr-1"></i> Caractère spécial';
            score += 25;
            validCount++;
        } else {
            specialResult.classList.remove('text-green-600', 'font-bold');
            specialResult.classList.add('text-gray-400');
            specialResult.innerHTML = '<i class="fas fa-circle text-[6px] mr-2 align-middle"></i> Caractère spécial';
            missing.push('un caractère spécial');
        }

        // Mise à jour Barre
        passwordStrengthBar.style.width = score + '%';
        passwordStrengthBar.className = 'h-1 rounded-full transition-all duration-300 '; // reset base

        if (score < 50) {
            passwordStrengthBar.classList.add('bg-red-500');
            passwordStrengthText.textContent = 'Faible';
            passwordStrengthText.className = 'text-xs text-red-500 font-semibold mt-1 block text-right';
        } else if (score < 100) {
            passwordStrengthBar.classList.add('bg-yellow-500');
            passwordStrengthText.textContent = 'Moyen';
            passwordStrengthText.className = 'text-xs text-yellow-600 font-semibold mt-1 block text-right';
        } else {
            passwordStrengthBar.classList.add('bg-green-500');
            passwordStrengthText.textContent = 'Fort';
            passwordStrengthText.className = 'text-xs text-green-600 font-bold mt-1 block text-right animate-pulse';

            // Animation "Succès" interactive
            if (!passwordStrengthBar.dataset.animate) {
                passwordStrengthBar.dataset.animate = "true";
                signupPasswordInput.classList.add('border-green-500', 'ring-2', 'ring-green-100');
                setTimeout(() => signupPasswordInput.classList.remove('ring-2', 'ring-green-100'), 1000);
            }
        }

        checkPasswordStrength.missing = missing;
        return validCount === 4;
    }

    if (signupPasswordInput) {
        signupPasswordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }

    // SIGNUP SUBMIT
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const pseudo = document.getElementById('signup-pseudo').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm-password').value;
            const errorEl = document.getElementById('signup-error');

            if (password !== confirm) {
                showError('signup-error', "Les mots de passe ne correspondent pas.");
                return;
            }

            if (!checkPasswordStrength(password)) {
                const missingList = checkPasswordStrength.missing || [];
                const missingDetail = missingList.length > 0 ? ` : il manque ${missingList.join(', ')}.` : '.';
                showError('signup-error', `Le mot de passe ne respecte pas les critères de sécurité${missingDetail}`);
                // Animation shake
                signupForm.classList.add('animate-pulse'); // Simple pulse for now
                setTimeout(() => signupForm.classList.remove('animate-pulse'), 500);
                return;
            }

            const forbiddenPseudos = ['inconnu', 'unknown', 'anonyme', 'anonymous', 'deleted', 'supprimé', 'undefined', 'null', 'admin', 'administrator', 'moderator'];
            if (forbiddenPseudos.includes(pseudo.trim().toLowerCase())) {
                showError('signup-error', "Ce pseudo n'est pas autorisé.");
                return;
            }

            if (pseudo.trim() === "") {
                showError('signup-error', "Le pseudo est obligatoire.");
                return;
            }

            if (errorEl) errorEl.classList.add('hidden');
            setLoading('signupSubmitBtn', 'signup-loading', true);

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                // Force user doc creation with pseudo
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    pseudo: pseudo,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user',
                    privacy: {
                        hidePseudo: false,
                        hideCity: false,
                        hideFavorite: false,
                        hideLikeCount: false,
                        hideNotes: false,
                        hideRanking: false,
                        hideStats: false,
                        hidePhotos: false,
                        hidePrice: false,
                        hideBib: false,
                        hideCompanions: false
                    },
                    uiPreferences: {
                        hideStatsBtn: false,
                        hideBadgesBtn: false,
                        hideWishlistBtn: false
                    }
                }, { merge: true });

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Signup error:", error);
                let msg = "Erreur d'inscription.";
                if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
                else if (error.code === 'auth/weak-password') msg = "Mot de passe trop faible.";
                else if (error.code === 'auth/invalid-email') msg = "Email invalide.";
                showError('signup-error', msg);
                setLoading('signupSubmitBtn', 'signup-loading', false);
            }
        });
    }
}

/**
 * Vérifie si des champs sont remplis dans la modale avant de la fermer.
 * Si oui, affiche une modale de confirmation.
 */
window.checkAndCloseAuthModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Chercher tous les inputs/textareas non vides dans la modale
    const inputs = modal.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    let hasDirtyField = false;
    inputs.forEach(input => {
        if (input.value.trim() !== '') hasDirtyField = true;
    });

    if (hasDirtyField) {
        // Afficher la modale de confirmation
        const unsavedModal = document.getElementById('unsavedChangesModal');
        if (unsavedModal) {
            unsavedModal.classList.remove('hidden');
            unsavedModal.dataset.targetModal = modalId;
        }
    } else {
        closeModal(modalId);
    }
};

/**
 * Initialise les boutons de la modale "modifications non enregistrées"
 */
function initUnsavedChangesModal() {
    const stayBtn = document.getElementById('unsavedStayBtn');
    const leaveBtn = document.getElementById('unsavedLeaveBtn');
    const unsavedModal = document.getElementById('unsavedChangesModal');

    if (stayBtn) {
        stayBtn.addEventListener('click', () => {
            if (unsavedModal) unsavedModal.classList.add('hidden');
        });
    }

    if (leaveBtn) {
        leaveBtn.addEventListener('click', () => {
            if (unsavedModal) {
                const targetModalId = unsavedModal.dataset.targetModal;
                const action = unsavedModal.dataset.action;
                unsavedModal.classList.add('hidden');
                delete unsavedModal.dataset.action;

                if (targetModalId) {
                    // Cas sp\u00e9cial : raceModal \u2192 utiliser closeAndResetRaceModal si disponible
                    if (action === 'resetRaceForm' && typeof closeAndResetRaceModal === 'function') {
                        closeAndResetRaceModal();
                    } else {
                        const targetModal = document.getElementById(targetModalId);
                        if (targetModal) {
                            // Vider les champs d'auth avant de fermer
                            targetModal.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(i => i.value = '');
                        }
                        closeModal(targetModalId);
                    }
                }
            }
        });
    }
}
