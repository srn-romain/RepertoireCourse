/**
 * js/isInvite.js
 * Gestion centralisée de la vérification du statut invité
 * Doit être inclus après firebase-config.js
 */

/**
 * Vérifie si l'utilisateur connecté est un invité
 * @param {Object} [providedUser] - Objet utilisateur Firebase optionnel (pour éviter d'attendre l'auth si déjà dispo)
 * @returns {Promise<boolean>} True si l'utilisateur est invité, false sinon
 */
window.isInviteUser = function (providedUser) {
    // Logique de vérification interne réutilisable
    const checkStatus = async (user) => {
        if (!user) {
            return sessionStorage.getItem('authLevel') === 'invite';
        }

        // 1. Check Custom Claims
        try {
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims.invite === true) {
                return true;
            }
        } catch (error) {
            console.error('Erreur check claims:', error);
        }

        // 2. Check Firestore
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().role === 'invite') {
                return true;
            }
        } catch (error) {
            console.error('Erreur check role DB:', error);
        }

        return sessionStorage.getItem('authLevel') === 'invite';
    };

    // Si on a déjà l'utilisateur, on vérifie directement
    if (providedUser) {
        return checkStatus(providedUser);
    }

    // Sinon on attend l'état de l'auth
    return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            unsubscribe();
            resolve(await checkStatus(user));
        });
    });
};
