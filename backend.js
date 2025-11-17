/**
 * BACKEND - Code sensible (Authentification, Gestion des rôles)
 * Ce fichier contient toute la logique d'authentification et de gestion des permissions
 */

// Configuration Firebase (sensible)
const firebaseConfig = {
    apiKey: "AIzaSyAQl3f8x9uafRTFIDvf6WtZPbjZtPbzU9M",
    authDomain: "macollectiondecourses.firebaseapp.com",
    projectId: "macollectiondecourses",
    storageBucket: "macollectiondecourses.firebasestorage.app",
    messagingSenderId: "749698169073",
    appId: "1:749698169073:web:a3e784c97af0151eb49150"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Références Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const usersCollection = db.collection('users');

// Variables pour la gestion de l'inactivité
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes en millisecondes
let lastActivityTime = Date.now();

/**
 * Backend API - Objet exposant les fonctions d'authentification
 */
const BackendAPI = {
    /**
     * Obtenir l'instance d'authentification Firebase
     */
    getAuth: () => auth,
    
    /**
     * Obtenir l'instance Firestore
     */
    getDb: () => db,
    
    /**
     * Obtenir la collection users
     */
    getUsersCollection: () => usersCollection,
    
    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated: () => {
        const user = auth.currentUser;
        if (!user) {
            return sessionStorage.getItem('authenticated') === 'true' || sessionStorage.getItem('authLevel') === 'invite';
        }
        return true;
    },
    
    /**
     * Vérifier si l'utilisateur est admin (version synchrone)
     */
    isAdmin: () => {
        return sessionStorage.getItem('authLevel') === 'admin';
    },
    
    /**
     * Vérifier si l'utilisateur est admin (version async - vérifie Firebase)
     */
    isAdminAsync: async () => {
        const user = auth.currentUser;
        if (!user) {
            return sessionStorage.getItem('authLevel') === 'admin';
        }
        
        // Vérifier les custom claims d'abord
        try {
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims.admin === true) {
                return true;
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des custom claims:', error);
        }
        
        // Sinon vérifier dans la collection users
        try {
            const userDoc = await usersCollection.doc(user.uid).get();
            if (userDoc.exists && userDoc.data().role === 'admin') {
                return true;
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du rôle admin:', error);
        }
        
        return sessionStorage.getItem('authLevel') === 'admin';
    },
    
    /**
     * Vérifier si l'utilisateur est invité (version synchrone)
     */
    isInvite: () => {
        return sessionStorage.getItem('authLevel') === 'invite';
    },
    
    /**
     * Vérifier si l'utilisateur est invité (version async - vérifie Firebase)
     */
    isInviteAsync: async () => {
        const user = auth.currentUser;
        if (!user) {
            return sessionStorage.getItem('authLevel') === 'invite';
        }
        
        // Vérifier les custom claims d'abord
        try {
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims.invite === true) {
                return true;
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des custom claims:', error);
        }
        
        // Sinon vérifier dans la collection users
        try {
            const userDoc = await usersCollection.doc(user.uid).get();
            if (userDoc.exists && userDoc.data().role === 'invite') {
                return true;
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du rôle invite:', error);
        }
        
        return sessionStorage.getItem('authLevel') === 'invite';
    },
    
    /**
     * Connexion avec Firebase Auth
     */
    signIn: async (email, password) => {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Vérifier le rôle dans la collection users
            let userRole = null;
            try {
                const userDoc = await usersCollection.doc(user.uid).get();
                if (userDoc.exists) {
                    userRole = userDoc.data().role;
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du rôle:', error);
                throw new Error('Erreur lors de la récupération du rôle');
            }

            // Stocker le rôle dans sessionStorage
            if (userRole) {
                sessionStorage.setItem('authLevel', userRole);
                sessionStorage.setItem('authenticated', 'true');
            }
            
            // Réinitialiser le timer d'inactivité
            resetInactivityTimer();
            
            return { success: true, user, role: userRole };
        } catch (error) {
            console.error('Erreur de connexion:', error);
            return { success: false, error };
        }
    },
    
    /**
     * Déconnexion
     */
    signOut: async () => {
        try {
            await auth.signOut();
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('authLevel');
            clearInactivityTimer();
            return { success: true };
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            return { success: false, error };
        }
    },
    
    /**
     * Obtenir l'utilisateur actuel
     */
    getCurrentUser: () => {
        return auth.currentUser;
    },
    
    /**
     * Écouter les changements d'état d'authentification
     */
    onAuthStateChanged: (callback) => {
        return auth.onAuthStateChanged(callback);
    }
};

/**
 * Gestion de l'inactivité - Déconnexion automatique après 15 minutes
 */
function resetInactivityTimer() {
    // Réinitialiser le timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    lastActivityTime = Date.now();
    
    // Si l'utilisateur est connecté, configurer le timer
    if (BackendAPI.isAuthenticated()) {
        inactivityTimer = setTimeout(() => {
            // Vérifier si l'utilisateur est toujours inactif
            const timeSinceLastActivity = Date.now() - lastActivityTime;
            if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
                // Déconnexion automatique
                BackendAPI.signOut().then(() => {
                    // Afficher une notification
                    if (typeof showInactivityNotification === 'function') {
                        showInactivityNotification();
                    }
                    // Recharger la page ou mettre à jour l'UI
                    if (typeof onAutoLogout === 'function') {
                        onAutoLogout();
                    }
                });
            }
        }, INACTIVITY_TIMEOUT);
    }
}

function clearInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

// Événements d'activité utilisateur
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
activityEvents.forEach(event => {
    document.addEventListener(event, () => {
        if (BackendAPI.isAuthenticated()) {
            resetInactivityTimer();
        }
    }, { passive: true });
});

// Écouter les changements d'état d'authentification
BackendAPI.onAuthStateChanged(async (user) => {
    if (user) {
        // Utilisateur connecté, vérifier le rôle
        try {
            const userDoc = await usersCollection.doc(user.uid).get();
            if (userDoc.exists) {
                const role = userDoc.data().role;
                sessionStorage.setItem('authLevel', role);
                sessionStorage.setItem('authenticated', 'true');
                resetInactivityTimer();
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du rôle:', error);
        }
    } else {
        // Utilisateur déconnecté
        sessionStorage.removeItem('authLevel');
        sessionStorage.removeItem('authenticated');
        clearInactivityTimer();
    }
    
    // Notifier le frontend du changement
    if (typeof onAuthStateChanged === 'function') {
        onAuthStateChanged(user);
    }
});

// Initialiser le timer si l'utilisateur est déjà connecté au chargement
if (BackendAPI.isAuthenticated()) {
    resetInactivityTimer();
}

