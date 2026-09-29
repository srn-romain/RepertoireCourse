/**
 * js/migrate-race-privacy.js
 * Script de migration Firestore :
 * 1. Bascule la visibilité publique/privée au niveau du compte utilisateur (users/{userId}.privacy.isPublic)
 * 2. Supprime définitivement les champs individuels (public, isPublic, private, isPrivate, shared) sur chaque document course (users/{userId}/races/{raceId})
 */

(function () {
    'use strict';

    /**
     * Exécute la migration complète sur l'ensemble de la base Firestore
     * @returns {Promise<{success: boolean, totalUsers: number, updatedUsers: number, totalRacesCleaned: number}>}
     */
    async function runPrivacyMigration() {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.error("Firebase Firestore non initialisé.");
            if (typeof window.showToast === 'function') {
                window.showToast("Erreur : Firebase Firestore non disponible.", "error");
            }
            return { success: false, error: "Firebase not ready" };
        }

        const db = firebase.firestore();
        console.log("🚀 [Migration] Démarrage de la migration de visibilité des courses vers le profil utilisateur...");

        if (typeof window.showToast === 'function') {
            window.showToast("Migration en cours : nettoyage des champs de visibilité des courses...", "info", 6000);
        }

        let totalUsers = 0;
        let updatedUsers = 0;
        let totalRacesCleaned = 0;

        try {
            const usersSnapshot = await db.collection('users').get();
            totalUsers = usersSnapshot.size;
            console.log(`[Migration] ${totalUsers} utilisateurs trouvés.`);

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data() || {};
                const currentPrivacy = userData.privacy || {};

                // Récupérer toutes les courses de l'utilisateur
                const racesSnapshot = await db.collection('users').doc(userId).collection('races').get();
                const racesCount = racesSnapshot.size;

                let hasAnyPublicRace = false;
                let hasAnyPrivateRace = false;
                let batch = db.batch();
                let batchOps = 0;

                for (const raceDoc of racesSnapshot.docs) {
                    const rData = raceDoc.data() || {};
                    const hasLegacyField = (
                        rData.public !== undefined ||
                        rData.isPublic !== undefined ||
                        rData.private !== undefined ||
                        rData.isPrivate !== undefined ||
                        rData.shared !== undefined
                    );

                    if (rData.public === true || rData.isPublic === true || rData.shared === true) {
                        hasAnyPublicRace = true;
                    } else if (rData.public === false || rData.isPublic === false || rData.private === true || rData.isPrivate === true) {
                        hasAnyPrivateRace = true;
                    }

                    if (hasLegacyField) {
                        batch.update(raceDoc.ref, {
                            public: firebase.firestore.FieldValue.delete(),
                            isPublic: firebase.firestore.FieldValue.delete(),
                            private: firebase.firestore.FieldValue.delete(),
                            isPrivate: firebase.firestore.FieldValue.delete(),
                            shared: firebase.firestore.FieldValue.delete()
                        });
                        batchOps++;
                        totalRacesCleaned++;

                        // Commit par lot de 450 opérations pour respecter la limite Firestore de 500
                        if (batchOps >= 450) {
                            await batch.commit();
                            batch = db.batch();
                            batchOps = 0;
                        }
                    }
                }

                if (batchOps > 0) {
                    await batch.commit();
                }

                // Déterminer la visibilité globale du compte si elle n'était pas déjà définie
                let accountIsPublic = true;
                if (currentPrivacy.isPublic !== undefined) {
                    accountIsPublic = currentPrivacy.isPublic === true;
                } else if (userData.isPublic !== undefined) {
                    accountIsPublic = userData.isPublic === true;
                } else if (racesCount > 0 && !hasAnyPublicRace && hasAnyPrivateRace) {
                    accountIsPublic = false;
                }

                // Mise à jour du document utilisateur avec la préférence globale
                const updatedPrivacy = {
                    ...currentPrivacy,
                    isPublic: accountIsPublic
                };

                await db.collection('users').doc(userId).set({
                    privacy: updatedPrivacy,
                    isPublic: accountIsPublic
                }, { merge: true });

                updatedUsers++;
                console.log(`[Migration] Utilisateur ${userId} migré : isPublic = ${accountIsPublic}, ${racesCount} courses traitées.`);
            }

            console.log(`✅ [Migration terminée] ${totalUsers} utilisateurs vérifiés, ${totalRacesCleaned} courses nettoyées.`);

            if (typeof window.showToast === 'function') {
                window.showToast(`Migration terminée avec succès ! ${totalRacesCleaned} courses nettoyées sur ${totalUsers} comptes.`, "success", 5000);
            }

            return {
                success: true,
                totalUsers,
                updatedUsers,
                totalRacesCleaned
            };

        } catch (error) {
            console.error("❌ [Migration] Erreur lors de la migration:", error);
            if (typeof window.showToast === 'function') {
                window.showToast(`Erreur lors de la migration : ${error.message}`, "error", 6000);
            }
            return { success: false, error: error.message };
        }
    }

    // Export global
    window.runPrivacyMigration = runPrivacyMigration;

})();
