/**
 * js/user-flags.js
 * Helper pour persister les flags de progression gamification
 * simultanément dans localStorage ET dans Firestore.
 * Cela permet au script de recalcul admin de lire ces flags
 * depuis Firestore sans dépendre du localStorage de chaque utilisateur.
 */

/**
 * Sauvegarde un flag de progression dans localStorage ET Firestore.
 * N'écrit dans Firestore que si le flag n'est pas déjà à true (évite les écritures inutiles).
 * @param {string} flagName - Nom du flag (ex: 'statsModalViewed')
 * @param {boolean} [value=true]
 */
window.saveUserFlag = function(flagName, value = true) {
    // 1. localStorage (synchrone, immédiat)
    if (value) {
        localStorage.setItem(flagName, 'true');
    } else {
        localStorage.removeItem(flagName);
    }

    // 2. window global
    window[flagName] = value;
    if (flagName === 'userFeedbackSent') {
        window.feedbackSent = true;
    }

    // 2.5 Déclencher la détection d'accomplissement de mission
    if (typeof window.checkBadgesForNewUnlocks === 'function') {
        setTimeout(() => {
            try {
                window.checkBadgesForNewUnlocks();
            } catch (e) {
                console.warn('[UserFlags] checkBadgesForNewUnlocks error:', e);
            }
        }, 150);
    }

    // 3. Firestore (asynchrone, en arrière-plan) - seulement si pas déjà sauvegardé
    const alreadySynced = localStorage.getItem(flagName + '_synced') === 'true';
    if (value && !alreadySynced) {
        try {
            const fbUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
            if (fbUser && fbUser.uid && typeof db !== 'undefined') {
                const payload = {};
                payload['flags.' + flagName] = true;
                db.collection('users').doc(fbUser.uid).set(payload, { merge: true })
                    .then(() => {
                        localStorage.setItem(flagName + '_synced', 'true');
                    })
                    .catch(e => console.warn('[UserFlags] Firestore sync error for', flagName, e));
            }
        } catch(e) {
            console.warn('[UserFlags] saveUserFlag error:', e);
        }
    }
};

/**
 * Charge les flags depuis Firestore au démarrage et les injecte dans localStorage.
 * À appeler une fois après la connexion Firebase.
 * Permet à un utilisateur sur un nouvel appareil de récupérer ses flags.
 */
window.loadUserFlagsFromFirestore = async function() {
    try {
        const fbUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        if (!fbUser || !fbUser.uid || typeof db === 'undefined') return;

        const snap = await db.collection('users').doc(fbUser.uid).get();
        if (!snap.exists) return;

        const data = snap.data();
        const flags = data.flags || {};

        const knownFlags = [
            'tutorialCompleted', 'hasConfiguredCards', 'hasLikedPublicRace',
            'pdfDownloaded', 'userFeedbackSent', 'bulkActionUsed', 'bulkNoteUsed',
            'exportDownloaded', 'statsModalViewed', 'searchUsed', 'relayPdfExported'
        ];

        knownFlags.forEach(flag => {
            if (flags[flag] === true) {
                // Synchronise dans localStorage si pas déjà là
                if (localStorage.getItem(flag) !== 'true') {
                    localStorage.setItem(flag, 'true');
                    localStorage.setItem(flag + '_synced', 'true');
                }
                window[flag] = true;
                if (flag === 'userFeedbackSent') {
                    window.feedbackSent = true;
                }
            }
        });

        // Aussi gérer tutorialCompleted au niveau racine du doc (déjà stocké là)
        if (data.tutorialCompleted === true) {
            localStorage.setItem('tutorialCompleted', 'true');
            window.tutorialCompleted = true;
        }

    } catch(e) {
        console.warn('[UserFlags] loadUserFlagsFromFirestore error:', e);
    }
};
