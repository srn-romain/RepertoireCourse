/**
 * modal-auth.js
 * Gère l'injection et la logique des modales de connexion/inscription
 * Nécessite firebase-config.js chargé au préalable
 */

const authModalsHTML = `
<!-- LOGIN MODAL -->
<div id="loginModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-8 w-full max-w-md m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300">
        <button onclick="closeModal('loginModal')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
        </button>

        <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-green-800 mb-2">Bon retour ! 👋</h2>
            <p class="text-gray-600">Connectez-vous pour accéder à votre carnet.</p>
        </div>

        <form id="loginForm" class="space-y-5">
            <div>
                <label for="login-email" class="block text-sm font-semibold text-gray-700 mb-1">Identifiant</label>
                <input type="text" inputmode="email" id="login-email" required 
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400"
                    placeholder="nom@exemple.com">
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
            </div>

            <div id="login-error" class="hidden text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200"></div>

            <button type="submit" id="loginSubmitBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition transform hover:scale-[1.02] shadow-lg flex justify-center items-center">
                <span>Se connecter</span>
                <i class="fas fa-spinner fa-spin ml-2 hidden" id="login-loading"></i>
            </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?
            <button onclick="switchModal('loginModal', 'signupModal')" class="text-green-600 font-bold hover:underline cursor-pointer">Créer un compte</button>
        </div>
    </div>
</div>

<!-- SIGNUP MODAL -->
<div id="signupModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-8 w-full max-w-md m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300">
        <button onclick="closeModal('signupModal')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
        </button>

        <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-green-800 mb-2">Bienvenue ! 🚀</h2>
            <p class="text-gray-600">Créez votre compte pour commencer.</p>
        </div>

        <form id="signupForm" class="space-y-4">
            <div>
                <label for="signup-email" class="block text-sm font-semibold text-gray-700 mb-1">Adresse Email</label>
                <input type="email" id="signup-email" required 
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400"
                    placeholder="nom@exemple.com">
            </div>
            <div>
                <label for="signup-password" class="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
                <div class="relative">
                    <input type="password" id="signup-password" required minlength="6"
                        class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800 placeholder-gray-400 pr-10"
                        placeholder="••••••••">
                    <button type="button" id="signup-toggle-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i class="fas fa-eye" id="signup-eye"></i>
                        <i class="fas fa-eye-slash hidden" id="signup-eye-off"></i>
                    </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">6 caractères minimum</p>
            </div>
            <div>
                <label for="signup-confirm-password" class="block text-sm font-semibold text-gray-700 mb-1">Confirmer</label>
                <div class="relative">
                    <input type="password" id="signup-confirm-password" required
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
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?
            <button onclick="switchModal('signupModal', 'loginModal')" class="text-green-600 font-bold hover:underline cursor-pointer">Se connecter</button>
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

    // Initialize Logic
    initAuthLogic();
});

// GLOBAL FUNCTIONS (Available to buttons in HTML)
window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

window.switchModal = function (closeId, openId) {
    closeModal(closeId);
    openModal(openId);
}

function initAuthLogic() {
    // Close on click outside
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

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

    // SIGNUP SUBMIT
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm-password').value;
            const errorEl = document.getElementById('signup-error');

            if (password !== confirm) {
                showError('signup-error', "Les mots de passe ne correspondent pas.");
                return;
            }

            if (errorEl) errorEl.classList.add('hidden');
            setLoading('signupSubmitBtn', 'signup-loading', true);

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                // Force user doc creation
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user'
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

    // Redirection if already logged in (optional check, maybe only on index?)
    // On manuel.html we might not want auto-redirect, but the modals are only for connecting.
    // If user is already connected, auth state change will trigger.
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('manuel.html')) {
        auth.onAuthStateChanged(user => {
            if (user) {
                const isManuel = window.location.pathname.endsWith('manuel.html');
                // Adjust behavior: if on manual, maybe show "Go to Dashboard" instead of auto redirect?
                // For now, consistent behavior: auto redirect to dashboard if logged in.
                // Except maybe manual page should be readable even if logged in?
                // The user requested: "accessible depuis cette page".
                // If I am logged in, and I go to manuel.html, should I be redirected?
                // Dashboard has everything. Manual is help.
                // Let's NOT auto-redirect from manual.html, only from index.html (landing page).

                if (!isManuel) {
                    window.location.href = 'dashboard.html';
                }
            }
        });
    }
}
