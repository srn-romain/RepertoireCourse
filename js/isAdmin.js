/**
 * js/isAdmin.js
 * Gestion centralisée de la vérification du statut administrateur
 * Doit être inclus après firebase-config.js
 */

/**
 * Vérifie si l'utilisateur connecté est administrateur
 * @returns {Promise<boolean>} True si l'utilisateur est admin, false sinon
 */
window.isAdminUser = async function () {
    const user = firebase.auth().currentUser;

    if (!user) {
        return false;
    }

    // Vérifier les custom claims d'abord
    try {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin === true) {
            return true;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des custom claims admin:', error);
    }

    // Sinon vérifier dans la collection users
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().role === 'admin') {
            return true;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du rôle admin:', error);
    }

    return false;
};
