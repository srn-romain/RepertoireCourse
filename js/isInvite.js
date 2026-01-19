/**
 * js/isInvite.js
 * Gestion centralisée de la vérification du statut invité
 * Doit être inclus après firebase-config.js
 */

/**
 * Vérifie si l'utilisateur connecté est un invité en lisant directement le champ 'role' dans Firestore
 * @returns {Promise<boolean>} True si role === 'invite', false sinon
 */
window.isInviteUser = async function () {
    const user = firebase.auth().currentUser;

    if (!user) {
        return false;
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const role = userDoc.data().role;
            console.log(`[isInvite] Role de l'utilisateur ${user.email}: ${role}`);
            return role === 'invite';
        }
    } catch (error) {
        console.error('[isInvite] Erreur lors de la vérification du rôle:', error);
    }

    return false;
};
