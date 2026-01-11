document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const loadingIcon = document.getElementById('loadingIcon');
    const submitBtn = document.getElementById('submitBtn');

    // Helper to toggle loading state
    const setLoading = (isLoading) => {
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            const textSpan = submitBtn.querySelector('span');
            if (isLoading) {
                if (textSpan) textSpan.classList.add('opacity-50');
                if (loadingIcon) loadingIcon.classList.remove('hidden');
            } else {
                if (textSpan) textSpan.classList.remove('opacity-50');
                if (loadingIcon) loadingIcon.classList.add('hidden');
            }
        }
    };

    // Helper to show error
    const showError = (message) => {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        } else {
            alert(message);
        }
    };

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            setLoading(true);
            errorMessage.classList.add('hidden');

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);

                // Vérification de sécurité : s'assurer que le document utilisateur existe
                const userDocRef = db.collection('users').doc(userCredential.user.uid);
                const doc = await userDocRef.get();
                if (!doc.exists) {
                    await userDocRef.set({
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: 'user'
                    });
                } else if (!doc.data().email) {
                    // Réparer l'email manquant
                    await userDocRef.update({ email: email });
                }

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Login error:", error);
                let msg = "Erreur de connexion.";
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    msg = "Email ou mot de passe incorrect.";
                } else if (error.code === 'auth/invalid-email') {
                    msg = "Email invalide.";
                } else if (error.code === 'auth/too-many-requests') {
                    msg = "Trop de tentatives. Veuillez réessayer plus tard.";
                }
                showError(msg);
                setLoading(false);
            }
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showError("Les mots de passe ne correspondent pas.");
                return;
            }

            setLoading(true);
            errorMessage.classList.add('hidden');

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                console.log("Compte Auth créé avec succès. UID:", userCredential.user.uid);

                // Create user document explicitly
                try {
                    await db.collection('users').doc(userCredential.user.uid).set({
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: 'user'
                    });
                    console.log("Document User créé avec succès dans Firestore.");
                } catch (firestoreError) {
                    console.error("ERREUR CRITIQUE lors de la création du document User:", firestoreError);
                    alert("Erreur base de données : " + firestoreError.message);
                }

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Signup error:", error);
                let msg = "Erreur d'inscription.";
                if (error.code === 'auth/email-already-in-use') {
                    msg = "Cet email est déjà utilisé.";
                } else if (error.code === 'auth/weak-password') {
                    msg = "Le mot de passe doit contenir au moins 6 caractères.";
                } else if (error.code === 'auth/invalid-email') {
                    msg = "Email invalide.";
                }
                showError(msg);
                setLoading(false);
            }
        });
    }

    // Check if already logged in (redirect to dashboard only if on login/signup pages)
    // Avoid loop if auth check is also in dashboard
    auth.onAuthStateChanged(user => {
        if (user) {
            // We are on login or signup, redirect to dashboard
            // BUT wait, maybe the user wants to logout? No, these pages are for entry.
            if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html')) {
                window.location.href = 'dashboard.html';
            }
        }
    });
});
