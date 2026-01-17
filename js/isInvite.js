/**
 * js/isInvite.js
 * Gestion centralisée de la vérification du statut invité
 * Doit être inclus après firebase-config.js
 */

/**
 * Vérifie si l'utilisateur connecté est un invité
 * @returns {Promise<boolean>} True si l'utilisateur est invité, false sinon
 */
window.isInviteUser = async function () {
    const user = firebase.auth().currentUser;

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
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().role === 'invite') {
            return true;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du rôle invite:', error);
    }

    return sessionStorage.getItem('authLevel') === 'invite';
};
