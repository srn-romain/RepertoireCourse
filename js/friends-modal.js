(function () {
    'use strict';

    const PERMISSIONS = [
        ['dashboard', 'Carnet'],
        ['wishlist', 'Wishlist'],
        ['stats', 'Statistiques'],
        ['badges', 'Badges'],
        ['details', 'Détails des courses*']
    ];
    const DEFAULT_PERMISSIONS = { dashboard: true, wishlist: false, stats: false, badges: false, details: false };
    const modalHtml = `
        <div id="friendsModal" class="modal hidden fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <header class="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 class="text-xl font-bold text-green-800"><i class="fas fa-user-group mr-2"></i>Amis</h2>
                    <button type="button" id="closeFriendsModal" class="text-gray-500 hover:text-gray-800 text-xl" aria-label="Fermer"><i class="fas fa-times"></i></button>
                </header>
                <nav class="flex border-b border-gray-200">
                    <button type="button" data-friends-tab="following" class="flex-1 px-4 py-3 text-sm font-semibold text-green-800 border-b-2 border-green-600">Mes amis</button>
                    <button type="button" data-friends-tab="notifications" class="flex-1 px-4 py-3 text-sm font-semibold text-gray-500 border-b-2 border-transparent inline-flex items-center justify-center gap-2">
                        Notifications
                        <span id="friendsTabNotificationCount" class="hidden min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] inline-flex items-center justify-center" aria-label="Demandes en attente">0</span>
                    </button>
                </nav>
                <p id="friendsMessage" class="hidden mx-4 mt-3 p-2 rounded text-sm" role="status"></p>
                <div class="p-4 overflow-y-auto flex-1">
                    <section id="friendsFollowingPanel">
                        <p id="friendsCounts" class="text-xs text-gray-500 mb-3"></p>
                        <form id="friendSearchForm" class="flex gap-2 mb-4">
                            <input id="friendSearchInput" type="text" maxlength="60" autocomplete="off" placeholder="Rechercher un pseudo"
                                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <button type="submit" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Rechercher</button>
                        </form>
                        <div id="friendSearchResults" class="space-y-2 mb-5"></div>
                        <h3 class="font-semibold text-gray-800 mb-2">Mes abonnements</h3>
                        <div id="followingList" class="space-y-2"></div>
                    </section>
                    <section id="friendsNotificationsPanel" class="hidden">
                        <div class="mb-4 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1">
                            <p><strong class="text-green-700">Case cochée :</strong> votre ami a le droit d'accéder à l'élément.</p>
                            <p><strong class="text-gray-700">Case décochée :</strong> votre ami n'a pas accès à l'élément.</p>
                        </div>
                        <h3 class="font-semibold text-gray-800 mb-2">Demandes reçues</h3>
                        <div id="friendRequestsList" class="space-y-3 mb-5"></div>
                        <h3 class="font-semibold text-gray-800 mb-2">Mes abonnés</h3>
                        <div id="followersList" class="space-y-3"></div>
                        <p class="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
                            * L'accès aux détails des courses n'inclut pas : vos notes personnelles (qui restent strictement privées), les détails de course de vos accompagnants et les dates de création/modification.
                        </p>
                    </section>
                </div>
            </div>
        </div>
        <div id="friendConfirmModal" class="modal hidden fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div class="friend-confirm-backdrop absolute inset-0 bg-black/60 backdrop-blur-xs"></div>
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 transform scale-100 transition-all">
                <div class="flex items-center gap-3 mb-3">
                    <div id="friendConfirmIconBg" class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <i id="friendConfirmIcon" class="fas fa-user-minus text-red-600 text-lg"></i>
                    </div>
                    <div>
                        <h3 id="friendConfirmTitle" class="text-base font-bold text-gray-800">Confirmation</h3>
                        <p id="friendConfirmSubtitle" class="text-xs text-gray-400">Action requise</p>
                    </div>
                </div>
                <p id="friendConfirmMessage" class="text-gray-600 mb-6 text-sm leading-relaxed"></p>
                <div class="flex gap-2.5">
                    <button type="button" id="friendConfirmCancelBtn" class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition text-xs cursor-pointer">
                        Annuler
                    </button>
                    <button type="button" id="friendConfirmSubmitBtn" class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition text-xs shadow-sm cursor-pointer">
                        Confirmer
                    </button>
                </div>
            </div>
        </div>`;

    const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);

    function currentUser() {
        return typeof firebase !== 'undefined' && firebase.auth ? firebase.auth().currentUser : null;
    }

    function setMessage(text, isError) {
        const element = document.getElementById('friendsMessage');
        if (!element) return;
        element.textContent = text;
        if (!text) {
            element.classList.add('hidden');
            return;
        }
        element.className = `mx-4 mt-3 p-2 rounded text-sm ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`;
    }

    function permissionInputs(uid, permissions, pending) {
        return PERMISSIONS.map(([key, label]) => `
            <label class="inline-flex items-center gap-1 text-xs text-gray-600">
                <input type="checkbox" class="friend-permission rounded text-green-600" data-friend-uid="${escapeHtml(uid)}"
                    data-permission="${key}" ${pending ? 'data-pending="true"' : ''} ${permissions[key] === true ? 'checked' : ''}>
                ${label}
            </label>`).join('');
    }

    function setNotificationCount(count) {
        ['friendsNotificationCount', 'friendsTabNotificationCount'].forEach(id => {
            const badge = document.getElementById(id);
            if (!badge) return;
            badge.textContent = String(count);
            badge.classList.toggle('hidden', count === 0);
        });
    }

    async function readRelations() {
        const user = currentUser();
        if (!user) throw new Error('Connectez-vous pour gérer vos amis.');
        const userRef = db.collection('users').doc(user.uid);
        const [followingSnap, followersSnap, requestsSnap] = await Promise.all([
            userRef.collection('following').get(),
            userRef.collection('followers').get(),
            userRef.collection('friendNotifications').where('status', '==', 'pending').get()
        ]);
        return {
            following: followingSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id })),
            followers: followersSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id })),
            requests: requestsSnap.docs.map(doc => ({ ...doc.data(), uid: doc.id }))
        };
    }

    function renderFollowing(list) {
        const container = document.getElementById('followingList');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<p class="text-sm text-gray-500">Vous ne suivez encore personne.</p>';
            return;
        }
        container.innerHTML = list.map(friend => {
            const isAccepted = friend.status === 'accepted';
            const hasDashboard = friend.permissions && friend.permissions.dashboard === true;
            return `<div class="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                <div class="min-w-0"><p class="font-semibold text-gray-800 truncate">${escapeHtml(friend.targetPseudo || 'Utilisateur')}</p>
                    <p class="text-xs text-gray-500">${friend.status === 'pending' ? 'Demande en attente' : friend.status === 'declined' ? 'Demande refusée' : friend.status === 'revoked' ? 'Accès révoqué' : 'Abonné'}</p></div>
                <div class="flex gap-2 shrink-0">
                    ${isAccepted && hasDashboard ? `<button type="button" data-action="view" data-friend-uid="${escapeHtml(friend.uid)}" class="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold">Voir le carnet</button>` : ''}
                    <button type="button" data-action="unfollow" data-friend-uid="${escapeHtml(friend.uid)}" data-friend-pseudo="${escapeHtml(friend.targetPseudo || 'cet utilisateur')}" class="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded text-xs transition">Ne plus suivre</button>
                </div>
            </div>`;
        }).join('');
    }

    function renderRequests(list) {
        const container = document.getElementById('friendRequestsList');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<p class="text-sm text-gray-500">Aucune nouvelle demande.</p>';
            return;
        }
        container.innerHTML = list.map(request => `<div class="p-3 border border-blue-100 bg-blue-50/50 rounded-lg" data-request-card="${escapeHtml(request.uid)}">
            <p class="text-sm text-gray-800 mb-2"><strong>${escapeHtml(request.requesterPseudo || 'Utilisateur')}</strong> souhaite suivre votre carnet. Choisissez ce qu’il pourra consulter :</p>
            <div class="flex flex-wrap gap-x-4 gap-y-2 mb-3">${permissionInputs(request.uid, DEFAULT_PERMISSIONS, true)}</div>
            <div class="flex gap-2">
                <button type="button" data-action="accept" data-friend-uid="${escapeHtml(request.uid)}" class="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold">Autoriser</button>
                <button type="button" data-action="decline" data-friend-uid="${escapeHtml(request.uid)}" class="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs">Refuser</button>
            </div>
        </div>`).join('');
    }

    function renderFollowers(list, following) {
        const container = document.getElementById('followersList');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<p class="text-sm text-gray-500">Personne ne suit encore votre carnet.</p>';
            return;
        }
        const followingByUid = new Map(following.map(friend => [friend.uid, friend]));
        container.innerHTML = list.map(follower => `<div class="p-3 border border-gray-200 rounded-lg" data-follower-card="${escapeHtml(follower.uid)}">
            <div class="flex items-center justify-between gap-3 mb-3">
                <div class="flex items-center gap-2 min-w-0">
                    <p class="font-semibold text-gray-800 truncate">${escapeHtml(follower.followerPseudo || 'Utilisateur')}</p>
                    ${followingByUid.has(follower.uid) && ['pending', 'accepted'].includes(followingByUid.get(follower.uid).status)
                        ? `<span class="text-[11px] text-gray-500 shrink-0">${followingByUid.get(follower.uid).status === 'accepted' ? 'Déjà suivi' : 'Demande envoyée'}</span>`
                        : `<button type="button" data-action="follow" data-friend-uid="${escapeHtml(follower.uid)}" data-friend-pseudo="${escapeHtml(follower.followerPseudo || 'Utilisateur')}" class="px-2.5 py-1 bg-green-600 text-white rounded text-[11px] font-semibold shrink-0">Suivre en retour</button>`}
                </div>
                <button type="button" data-action="remove-follower" data-friend-uid="${escapeHtml(follower.uid)}" class="text-xs text-red-600 hover:text-red-800">Révoquer</button>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-2">${permissionInputs(follower.uid, follower.permissions || {}, false)}</div>
        </div>`).join('');
    }

    async function refresh() {
        const data = await readRelations();
        const activeFollowing = data.following.filter(friend => ['pending', 'accepted'].includes(friend.status));
        const counts = document.getElementById('friendsCounts');
        if (counts) counts.textContent = `${activeFollowing.length} suivi${activeFollowing.length > 1 ? 's' : ''} · ${data.followers.length} abonné${data.followers.length > 1 ? 's' : ''}`;
        renderFollowing(activeFollowing);
        renderRequests(data.requests);
        renderFollowers(data.followers, data.following);
        setNotificationCount(data.requests.length);
    }

    async function updateNotificationBadge() {
        const user = currentUser();
        if (!user) return;
        const requests = await db.collection('users').doc(user.uid).collection('friendNotifications')
            .where('status', '==', 'pending').get();
        setNotificationCount(requests.size);
    }

    async function searchPseudo(pseudo) {
        const container = document.getElementById('friendSearchResults');
        if (!container) return;
        const query = pseudo.trim();
        if (query.length < 2) {
            container.innerHTML = '<p class="text-sm text-gray-500">Saisissez au moins deux caractères du pseudo.</p>';
            return;
        }
        container.innerHTML = '<p class="text-sm text-gray-500">Recherche…</p>';
        const user = currentUser();
        if (!user) {
            container.innerHTML = '<p class="text-sm text-gray-500">Connectez-vous pour rechercher un ami.</p>';
            return;
        }
        const selfUid = user.uid;
        const queryLower = query.toLowerCase();

        const ownFollowingPromise = db.collection('users').doc(selfUid).collection('following').get();

        // 1. Requête ciblée sur pseudoLower (1 seule lecture si le compte dispose de pseudoLower)
        let matchingUsers = [];
        const usersSnap = await db.collection('users').where('pseudoLower', '==', queryLower).limit(10).get();
        if (!usersSnap.empty) {
            matchingUsers = usersSnap.docs.filter(doc => {
                if (doc.id === selfUid) return false;
                const data = doc.data() || {};
                return data.role !== 'invite';
            });
        }

        // 2. Fallback rétrocompatible pour les comptes anciens sans pseudoLower (ex: UtILISateur X)
        if (!matchingUsers.length) {
            const allUsersSnap = await db.collection('users').get();
            const cleanQuery = queryLower.replace(/\s+/g, ' ');
            matchingUsers = allUsersSnap.docs.filter(doc => {
                if (doc.id === selfUid) return false;
                const data = doc.data() || {};
                if (data.role === 'invite') return false;
                const userPseudo = typeof data.pseudo === 'string' ? data.pseudo.trim().toLowerCase().replace(/\s+/g, ' ') : '';
                return userPseudo === cleanQuery;
            });
        }

        const ownFollowingSnap = await ownFollowingPromise;

        const followingByUid = new Map(ownFollowingSnap.docs.map(doc => [doc.id, doc.data()]));

        if (!matchingUsers.length) {
            container.innerHTML = '<p class="text-sm text-gray-500">Aucun utilisateur trouvé avec ce pseudo.</p>';
            return;
        }

        container.innerHTML = matchingUsers.map(doc => {
            const data = doc.data() || {};
            const userPseudo = data.pseudo || 'Utilisateur';
            const existing = followingByUid.get(doc.id);
            const status = existing ? existing.status : null;

            let buttonHtml = '';
            if (status === 'pending') {
                buttonHtml = `
                    <button type="button" data-action="cancel-request" data-friend-uid="${escapeHtml(doc.id)}" data-friend-pseudo="${escapeHtml(userPseudo)}"
                        class="px-3 py-1.5 bg-amber-50 hover:bg-red-50 text-amber-800 hover:text-red-700 border border-amber-200 hover:border-red-200 rounded text-xs font-semibold flex items-center gap-1.5 transition group"
                        title="Cliquer pour annuler la demande">
                        <i class="fas fa-clock text-amber-600 group-hover:hidden"></i>
                        <i class="fas fa-times text-red-600 hidden group-hover:inline"></i>
                        <span class="group-hover:hidden">Demande envoyée</span>
                        <span class="hidden group-hover:inline">Annuler la demande</span>
                    </button>`;
            } else if (status === 'accepted') {
                buttonHtml = `
                    <button type="button" data-action="cancel-follow" data-friend-uid="${escapeHtml(doc.id)}" data-friend-pseudo="${escapeHtml(userPseudo)}"
                        class="px-3 py-1.5 bg-green-50 hover:bg-red-50 text-green-800 hover:text-red-700 border border-green-200 hover:border-red-200 rounded text-xs font-semibold flex items-center gap-1.5 transition group"
                        title="Cliquer pour ne plus suivre">
                        <i class="fas fa-check text-green-600 group-hover:hidden"></i>
                        <i class="fas fa-user-minus text-red-600 hidden group-hover:inline"></i>
                        <span class="group-hover:hidden">Suivi</span>
                        <span class="hidden group-hover:inline">Ne plus suivre</span>
                    </button>`;
            } else {
                buttonHtml = `
                    <button type="button" data-action="follow" data-friend-uid="${escapeHtml(doc.id)}" data-friend-pseudo="${escapeHtml(userPseudo)}"
                        class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition">
                        <i class="fas fa-user-plus"></i> Ajouter
                    </button>`;
            }

            return `<div class="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                <div class="min-w-0"><p class="font-semibold text-gray-800 truncate">${escapeHtml(userPseudo)}</p></div>
                ${buttonHtml}
            </div>`;
        }).join('');
    }

    async function sendRequest(targetUid, targetPseudo) {
        const user = currentUser();
        if (!user || targetUid === user.uid) return;
        const followingRef = db.collection('users').doc(user.uid).collection('following').doc(targetUid);
        const oldFollowing = await followingRef.get();
        if (oldFollowing.exists && ['pending', 'accepted'].includes(oldFollowing.data().status)) return;
        if (oldFollowing.exists) await followingRef.delete();
        const requesterPseudo = window.currentUserPseudo || localStorage.getItem('userPseudo') || user.displayName || 'Utilisateur';
        const batch = db.batch();
        batch.set(followingRef, {
            targetUid,
            targetPseudo,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        batch.set(db.collection('users').doc(targetUid).collection('friendNotifications').doc(user.uid), {
            requesterUid: user.uid,
            requesterPseudo,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
    }

    async function acceptRequest(followerUid, card) {
        const user = currentUser();
        const selected = {};
        card.querySelectorAll('.friend-permission[data-pending="true"]').forEach(input => {
            selected[input.dataset.permission] = input.checked;
        });
        const requesterProfile = await db.collection('users').doc(followerUid).get();
        const followerPseudo = requesterProfile.exists ? requesterProfile.data().pseudo || 'Utilisateur' : 'Utilisateur';
        const batch = db.batch();
        batch.set(db.collection('users').doc(user.uid).collection('followers').doc(followerUid), {
            followerUid,
            followerPseudo,
            permissions: selected,
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        batch.update(db.collection('users').doc(followerUid).collection('following').doc(user.uid), {
            status: 'accepted',
            permissions: selected,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        batch.delete(db.collection('users').doc(user.uid).collection('friendNotifications').doc(followerUid));
        await batch.commit();
    }

    async function declineRequest(followerUid) {
        const user = currentUser();
        const batch = db.batch();
        batch.update(db.collection('users').doc(followerUid).collection('following').doc(user.uid), {
            status: 'declined',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        batch.delete(db.collection('users').doc(user.uid).collection('friendNotifications').doc(followerUid));
        await batch.commit();
    }

    async function unfollow(targetUid) {
        const user = currentUser();
        const targetRef = db.collection('users').doc(targetUid);
        const followerRef = targetRef.collection('followers').doc(user.uid);
        const notificationRef = targetRef.collection('friendNotifications').doc(user.uid);
        const follower = await followerRef.get();
        const batch = db.batch();
        batch.delete(db.collection('users').doc(user.uid).collection('following').doc(targetUid));
        if (follower.exists) batch.delete(followerRef);
        batch.delete(notificationRef);
        await batch.commit();
    }

    async function removeFollower(followerUid) {
        const user = currentUser();
        const followingRef = db.collection('users').doc(followerUid).collection('following').doc(user.uid);
        const batch = db.batch();
        batch.delete(db.collection('users').doc(user.uid).collection('followers').doc(followerUid));
        batch.update(followingRef, {
            status: 'revoked',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
    }

    async function updatePermission(input) {
        const user = currentUser();
        const card = input.closest('[data-follower-card]');
        const permissions = {};
        PERMISSIONS.forEach(([permission]) => {
            const checkbox = card.querySelector(`.friend-permission[data-permission="${permission}"]`);
            permissions[permission] = checkbox ? checkbox.checked : false;
        });
        const batch = db.batch();
        batch.update(db.collection('users').doc(user.uid).collection('followers').doc(input.dataset.friendUid), {
            permissions
        });
        batch.update(db.collection('users').doc(input.dataset.friendUid).collection('following').doc(user.uid), {
            permissions
        });
        await batch.commit();
        setMessage('Autorisation mise à jour.', false);
    }

    function enforcePermissionDependencies(input) {
        const card = input.closest('[data-follower-card], [data-request-card]');
        if (!card) return;

        const dashboardInput = card.querySelector('.friend-permission[data-permission="dashboard"]');
        if (!dashboardInput) return;

        const otherInputs = Array.from(card.querySelectorAll('.friend-permission:not([data-permission="dashboard"])'));
        if (input.dataset.permission === 'dashboard' && !dashboardInput.checked) {
            otherInputs.forEach(permissionInput => {
                permissionInput.checked = false;
            });
        } else if (input.dataset.permission !== 'dashboard' && input.checked) {
            dashboardInput.checked = true;
        }
    }

    async function openFriendsModal(targetPseudo = null) {
        bindModal();
        const modal = document.getElementById('friendsModal');
        if (!modal) return;

        const user = currentUser();
        if (!user) {
            if (typeof showToast === 'function') {
                showToast("Connectez-vous pour ajouter un ami.", "info");
            }
            if (typeof window.openModal === 'function') {
                window.openModal('loginModal');
            }
            return;
        }

        try {
            const isInvite = typeof window.isInviteUser === 'function' ? await window.isInviteUser() : false;
            if (isInvite || window.isFriendView) {
                if (typeof showToast === 'function') {
                    showToast("Cette fonctionnalité n'est pas disponible dans ce mode.", "warning");
                }
                return;
            }
        } catch (e) {
            console.warn(e);
        }

        modal.classList.remove('hidden');
        setMessage('', false);

        const followingPanel = document.getElementById('friendsFollowingPanel');
        const notifPanel = document.getElementById('friendsNotificationsPanel');
        if (followingPanel) followingPanel.classList.remove('hidden');
        if (notifPanel) notifPanel.classList.add('hidden');
        modal.querySelectorAll('[data-friends-tab]').forEach(item => {
            const isFollowing = item.dataset.friendsTab === 'following';
            item.className = isFollowing
                ? 'flex-1 px-4 py-3 text-sm font-semibold text-green-800 border-b-2 border-green-600'
                : 'flex-1 px-4 py-3 text-sm font-semibold text-gray-500 border-b-2 border-transparent';
        });

        try {
            await refresh();
            await updateNotificationBadge();
        } catch (error) {
            console.error('Erreur de chargement des amis :', error);
            setMessage('Impossible de charger vos amis. Réessayez.', true);
        }

        if (targetPseudo && typeof targetPseudo === 'string') {
            const cleanTarget = targetPseudo.trim();
            const searchInput = document.getElementById('friendSearchInput');
            if (searchInput && cleanTarget) {
                searchInput.value = cleanTarget;
                const myPseudo = (window.currentUserPseudo || localStorage.getItem('userPseudo') || user.displayName || '').trim().toLowerCase();
                if (cleanTarget.toLowerCase() === myPseudo) {
                    setMessage("Il s'agit de votre propre compte.", false);
                } else {
                    try {
                        await searchPseudo(cleanTarget);
                        const resultsEl = document.getElementById('friendSearchResults');
                        if (resultsEl) {
                            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    } catch (err) {
                        console.error('Erreur recherche pseudo ciblé :', err);
                    }
                }
            }
        }
    }

    function showFriendConfirm({ title, subtitle, message, confirmText = 'Confirmer', cancelText = 'Annuler', isDanger = true, icon = 'fa-user-minus' }) {
        return new Promise(resolve => {
            const confirmModal = document.getElementById('friendConfirmModal');
            if (!confirmModal) {
                resolve(confirm(message.replace(/<[^>]+>/g, '')));
                return;
            }

            const titleEl = document.getElementById('friendConfirmTitle');
            const subEl = document.getElementById('friendConfirmSubtitle');
            const msgEl = document.getElementById('friendConfirmMessage');
            const iconEl = document.getElementById('friendConfirmIcon');
            const iconBgEl = document.getElementById('friendConfirmIconBg');
            const cancelBtn = document.getElementById('friendConfirmCancelBtn');
            const submitBtn = document.getElementById('friendConfirmSubmitBtn');

            if (titleEl) titleEl.textContent = title || 'Confirmation';
            if (subEl) subEl.textContent = subtitle || '';
            if (msgEl) msgEl.innerHTML = message || 'Êtes-vous sûr ?';
            if (iconEl) iconEl.className = `fas ${icon} ${isDanger ? 'text-red-600' : 'text-amber-600'} text-lg`;
            if (iconBgEl) iconBgEl.className = `flex-shrink-0 w-10 h-10 rounded-full ${isDanger ? 'bg-red-100' : 'bg-amber-100'} flex items-center justify-center`;
            if (cancelBtn) cancelBtn.textContent = cancelText;
            if (submitBtn) {
                submitBtn.textContent = confirmText;
                submitBtn.className = `flex-1 px-4 py-2.5 ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} text-white rounded-xl font-semibold transition text-xs shadow-sm cursor-pointer`;
            }

            confirmModal.classList.remove('hidden');

            const cleanup = (result) => {
                confirmModal.classList.add('hidden');
                cancelBtn?.removeEventListener('click', onCancel);
                submitBtn?.removeEventListener('click', onSubmit);
                confirmModal?.removeEventListener('click', onBackdrop);
                resolve(result);
            };

            const onCancel = () => cleanup(false);
            const onSubmit = () => cleanup(true);
            const onBackdrop = (e) => {
                if (e.target === confirmModal || e.target.classList.contains('friend-confirm-backdrop')) {
                    cleanup(false);
                }
            };

            cancelBtn?.addEventListener('click', onCancel);
            submitBtn?.addEventListener('click', onSubmit);
            confirmModal?.addEventListener('click', onBackdrop);
        });
    }

    function bindModal() {
        if (!document.getElementById('friendsModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('friendsModal');
        if (!modal || modal.dataset.bound === 'true') return;
        modal.dataset.bound = 'true';

        const button = document.getElementById('friendsBtn');
        if (button) {
            firebase.auth().onAuthStateChanged(async user => {
                if (!user) {
                    button.classList.add('hidden');
                    return;
                }
                try {
                    const isInvite = await window.isInviteUser();
                    if (isInvite || window.isFriendView) {
                        button.classList.add('hidden');
                        return;
                    }
                    await updateNotificationBadge();
                } catch (error) {
                    console.error('Erreur de chargement des notifications ami :', error);
                }
            });

            button.addEventListener('click', () => openFriendsModal());
        }

        const closeBtn = document.getElementById('closeFriendsModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
        }

        modal.addEventListener('click', event => {
            if (event.target === modal) modal.classList.add('hidden');
            const tab = event.target.closest('[data-friends-tab]');
            if (tab) {
                const isFollowing = tab.dataset.friendsTab === 'following';
                document.getElementById('friendsFollowingPanel').classList.toggle('hidden', !isFollowing);
                document.getElementById('friendsNotificationsPanel').classList.toggle('hidden', isFollowing);
                modal.querySelectorAll('[data-friends-tab]').forEach(item => {
                    item.className = item === tab
                        ? 'flex-1 px-4 py-3 text-sm font-semibold text-green-800 border-b-2 border-green-600'
                        : 'flex-1 px-4 py-3 text-sm font-semibold text-gray-500 border-b-2 border-transparent';
                });
            }
        });

        const searchForm = document.getElementById('friendSearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', async event => {
                event.preventDefault();
                try {
                    await searchPseudo(document.getElementById('friendSearchInput').value);
                } catch (error) {
                    console.error('Erreur de recherche d’amis :', error);
                    setMessage('Recherche impossible. Vérifiez votre connexion et réessayez.', true);
                }
            });
        }

        modal.addEventListener('change', async event => {
            const input = event.target.closest('.friend-permission');
            if (!input) return;
            const card = input.closest('[data-follower-card], [data-request-card]');
            const previousStates = card
                ? Array.from(card.querySelectorAll('.friend-permission')).map(permissionInput => ({
                    input: permissionInput,
                    checked: permissionInput.checked
                }))
                : [];
            enforcePermissionDependencies(input);
            if (input.dataset.pending === 'true') return;

            try {
                await updatePermission(input);
            } catch (error) {
                console.error('Erreur de mise à jour des accès ami :', error);
                previousStates.forEach(({ input: permissionInput, checked }) => {
                    permissionInput.checked = checked;
                });
                setMessage('Impossible d’enregistrer cette autorisation.', true);
            }
        });

        modal.addEventListener('click', async event => {
            const actionButton = event.target.closest('[data-action]');
            if (!actionButton) return;
            const { action, friendUid } = actionButton.dataset;
            if (!friendUid) return;
            const friendPseudo = actionButton.dataset.friendPseudo || 'cet utilisateur';
            const originalHTML = actionButton.innerHTML;
            const originalClass = actionButton.className;

            if (action === 'cancel-request') {
                const confirmed = await showFriendConfirm({
                    title: 'Annuler la demande',
                    subtitle: 'Demande en attente',
                    message: `Souhaitez-vous annuler votre demande d’ami envoyée à <strong>${escapeHtml(friendPseudo)}</strong> ?`,
                    confirmText: 'Annuler la demande',
                    cancelText: 'Conserver',
                    isDanger: true,
                    icon: 'fa-times'
                });
                if (!confirmed) return;
            }

            if (action === 'cancel-follow' || action === 'unfollow') {
                const confirmed = await showFriendConfirm({
                    title: 'Ne plus suivre',
                    subtitle: 'Abonnement',
                    message: `Souhaitez-vous vraiment ne plus suivre <strong>${escapeHtml(friendPseudo)}</strong> ?`,
                    confirmText: 'Ne plus suivre',
                    cancelText: 'Annuler',
                    isDanger: true,
                    icon: 'fa-user-minus'
                });
                if (!confirmed) return;
            }

            actionButton.disabled = true;
            try {
                if (action === 'follow') {
                    actionButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Envoi...';
                    await sendRequest(friendUid, friendPseudo);
                    actionButton.disabled = false;
                    actionButton.dataset.action = 'cancel-request';
                    actionButton.className = 'px-3 py-1.5 bg-amber-50 hover:bg-red-50 text-amber-800 hover:text-red-700 border border-amber-200 hover:border-red-200 rounded text-xs font-semibold flex items-center gap-1.5 transition group';
                    actionButton.title = 'Cliquer pour annuler la demande';
                    actionButton.innerHTML = `
                        <i class="fas fa-clock text-amber-600 group-hover:hidden"></i>
                        <i class="fas fa-times text-red-600 hidden group-hover:inline"></i>
                        <span class="group-hover:hidden">Demande envoyée</span>
                        <span class="hidden group-hover:inline">Annuler la demande</span>`;
                    setMessage(`Demande envoyée à ${friendPseudo}.`, false);
                    await refresh();
                    return;
                }

                if (action === 'cancel-request') {
                    actionButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Annulation...';
                    await unfollow(friendUid);
                    actionButton.disabled = false;
                    actionButton.dataset.action = 'follow';
                    actionButton.className = 'px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition';
                    actionButton.title = 'Ajouter en ami';
                    actionButton.innerHTML = '<i class="fas fa-user-plus"></i> Ajouter';
                    setMessage('Demande d’ami annulée.', false);
                    await refresh();
                    return;
                }

                if (action === 'cancel-follow' || action === 'unfollow') {
                    actionButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Suppression...';
                    await unfollow(friendUid);
                    if (action === 'cancel-follow') {
                        actionButton.disabled = false;
                        actionButton.dataset.action = 'follow';
                        actionButton.className = 'px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition';
                        actionButton.title = 'Ajouter en ami';
                        actionButton.innerHTML = '<i class="fas fa-user-plus"></i> Ajouter';
                    }
                    setMessage(`Vous ne suivez plus ${friendPseudo}.`, false);
                    await refresh();
                    return;
                }

                if (action === 'accept') await acceptRequest(friendUid, actionButton.closest('[data-request-card]'));
                if (action === 'decline') await declineRequest(friendUid);
                if (action === 'remove-follower') await removeFollower(friendUid);
                if (action === 'view') {
                    window.location.href = `dashboard.html?friend=${encodeURIComponent(friendUid)}`;
                    return;
                }
                setMessage('Modification enregistrée.', false);
                await refresh();
            } catch (error) {
                console.error(`Erreur lors de l’action ami (${action}) :`, error);
                setMessage(error && error.code === 'permission-denied'
                    ? 'Firestore refuse cette action. Vérifiez que les règles Firestore récentes ont été déployées.'
                    : 'Action impossible. Vérifiez votre connexion et réessayez.', true);
                actionButton.disabled = false;
                actionButton.innerHTML = originalHTML;
                actionButton.className = originalClass;
            }
        });
    }

    window.openFriendsModal = openFriendsModal;
    window.openFriendsModalWithPseudo = openFriendsModal;

    document.addEventListener('DOMContentLoaded', bindModal);
})();
