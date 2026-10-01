/**
 * js/reviews.js
 * Gestion des avis utilisateurs :
 * - Affichage du formulaire dans la modale de paramètres (user-settings.js injecte la section)
 * - Sauvegarde dans Firestore (collection 'reviews')
 * - Affichage carrousel défilant sur index.html
 */

// ─────────────────────────────────────────────
//  HTML du bloc "Laisser un avis" (injecté dans user-settings)
// ─────────────────────────────────────────────
const reviewFormHTML = `
<!-- Laisser un avis -->
<div id="reviewSection" class="mb-4">
    <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <i class="fas fa-star text-yellow-400"></i> Laisser un avis
            <div class="group relative inline-block">
                <i class="fas fa-info-circle text-gray-300 hover:text-blue-400 cursor-help transition-colors text-xs"></i>
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-[10px] p-2 rounded-lg shadow-xl z-50 text-center leading-snug">
                    Votre avis sera affiché dans le carrousel de la page d'accueil pour aider les autres utilisateurs
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            </div>
        </h3>
        <div id="reviewStatusBadge" class="hidden text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"></div>
    </div>
    <p class="text-xs text-gray-400 mb-3 italic">Votre retour aide la communauté à découvrir l'application</p>

    <div class="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 space-y-3">
        <!-- État actuel explication -->
        <div id="reviewStateExplanation" class="hidden text-[10px] text-amber-700 bg-white/50 border border-amber-100 rounded-lg p-2 italic leading-tight">
            <!-- Rempli par le JS -->
        </div>

        <!-- Étoiles -->
        <div>
            <p class="text-xs font-semibold text-gray-600 mb-2">Votre note</p>
            <div id="reviewStars" class="flex gap-1" role="group" aria-label="Note de 1 à 5 étoiles">
                ${[1,2,3,4,5].map(i => `
                <button type="button" data-star="${i}" class="review-star text-3xl text-gray-300 hover:text-yellow-400 transition-colors duration-150 focus:outline-none" aria-label="${i} étoile${i>1?'s':''}">
                    ★
                </button>`).join('')}
            </div>
            <p id="reviewStarLabel" class="text-xs text-gray-400 mt-1 italic h-4"></p>
        </div>

        <!-- Message -->
        <div>
            <p class="text-xs font-semibold text-gray-600 mb-1">Votre message <span class="text-gray-400 font-normal">(optionnel)</span></p>
            <textarea id="reviewMessage"
                class="w-full px-3 py-2 bg-white border border-yellow-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                rows="3"
                maxlength="250"
                placeholder="Partagez votre expérience avec l'application..."></textarea>
            <p class="text-right text-xs text-gray-400 mt-0.5"><span id="reviewCharCount">0</span>/250</p>
        </div>

        <!-- Boutons d'actions -->
        <div class="flex flex-col gap-2">
            <button id="submitReviewBtn"
                class="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs">
                <i class="fas fa-paper-plane"></i> Publier l'avis
            </button>
            <button id="draftReviewBtn"
                class="w-full py-2 bg-white border border-yellow-200 hover:bg-yellow-100 text-yellow-700 font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs">
                <i class="fas fa-save"></i> Enregistrer en brouillon
            </button>
        </div>

        <!-- Suppression -->
        <button id="deleteReviewBtn" class="hidden w-full py-1 text-red-400 hover:text-red-600 text-[10px] font-medium transition-colors flex items-center justify-center gap-1 mt-1">
            <i class="fas fa-trash-alt"></i> Supprimer mon avis
        </button>

        <div id="reviewFormMessage" class="hidden text-xs text-center rounded-lg py-2 px-3 font-medium"></div>
    </div>
</div>
`;

const deleteReviewModalHTML = `
<div id="deleteReviewModal" class="fixed inset-0 z-[100] flex items-center justify-center hidden">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl p-6 w-full max-w-sm m-4 shadow-2xl border border-red-50 transform transition-all scale-100">
        <div class="text-center">
            <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-trash-alt text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Supprimer l'avis ?</h3>
            <p class="text-sm text-gray-500 mb-6">Voulez-vous vraiment supprimer votre avis ? Cette action est définitive.</p>
        </div>
        <div class="flex gap-3">
            <button id="cancelDeleteReviewBtn" class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-semibold">
                Annuler
            </button>
            <button id="confirmDeleteReviewBtn" class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-red-100">
                Supprimer
            </button>
        </div>
    </div>
</div>
`;

// Labels selon le nb d'étoiles
const starLabels = ['', 'Pas convaincu 😕', 'Peut mieux faire 🙂', 'Bien ! 👍', 'Très bien ! 😊', 'Excellent ! 🌟'];

// ─────────────────────────────────────────────
//  Injection du formulaire dans la modale settings
// ─────────────────────────────────────────────
function injectReviewForm() {
    // Ne pas injecter si déjà présent
    if (document.getElementById('reviewSection')) {
        return;
    }

    // Injecter la modale de confirmation de suppression si elle n'existe pas
    if (!document.getElementById('deleteReviewModal')) {
        const div = document.createElement('div');
        div.innerHTML = deleteReviewModalHTML;
        document.body.appendChild(div.firstElementChild);
    }

    // Chercher le conteneur principal du formulaire de settings
    const modal = document.getElementById('userSettingsModal');
    if (!modal) return;

    // Chercher la zone "Actions"
    const actionsZone = modal.querySelector('#userSettingsActions');
    if (!actionsZone) return;

    // Insérer le bloc avis juste avant la zone d'actions (tous les enfants)
    const template = document.createElement('template');
    template.innerHTML = reviewFormHTML;
    actionsZone.parentNode.insertBefore(template.content, actionsZone);

    initReviewForm();
}

// ─────────────────────────────────────────────
//  Init logique du formulaire
// ─────────────────────────────────────────────
function initReviewForm() {
    let selectedStars = 0;
    const stars = document.querySelectorAll('.review-star');
    const label = document.getElementById('reviewStarLabel');
    const textarea = document.getElementById('reviewMessage');
    const charCount = document.getElementById('reviewCharCount');
    const submitBtn = document.getElementById('submitReviewBtn');
    const draftBtn = document.getElementById('draftReviewBtn');
    const deleteBtn = document.getElementById('deleteReviewBtn');
    const statusBadge = document.getElementById('reviewStatusBadge');
    const formMsg = document.getElementById('reviewFormMessage');

    if (!stars.length) return;

    // Compteur caractères
    if (textarea) {
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
    }

    // Gestion étoiles
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => highlightStars(parseInt(star.dataset.star)));
        star.addEventListener('mouseleave', () => highlightStars(selectedStars));
        star.addEventListener('click', () => {
            selectedStars = parseInt(star.dataset.star);
            highlightStars(selectedStars);
            if (label) label.textContent = starLabels[selectedStars];
        });
    });

    function highlightStars(count) {
        stars.forEach((s, i) => {
            s.classList.toggle('text-yellow-400', i < count);
            s.classList.toggle('text-gray-300', i >= count);
        });
    }

    function updateUIStatus(approved) {
        if (!statusBadge) return;
        statusBadge.classList.remove('hidden');
        
        const explanation = document.getElementById('reviewStateExplanation');
        if (explanation) explanation.classList.remove('hidden');

        if (approved) {
            statusBadge.textContent = 'Publié';
            statusBadge.className = 'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-700';
            if (explanation) {
                explanation.innerHTML = '<b>Publié :</b> cet avis est visible par tout le monde sur la page d\'accueil de l\'application.';
                explanation.className = 'text-[10px] text-center text-green-700 bg-green-50/50 border border-green-100 rounded-lg p-2 italic leading-tight';
            }
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-edit"></i> Mettre à jour';
            if (draftBtn) draftBtn.innerHTML = '<i class="fas fa-undo"></i> Remettre en brouillon';
        } else {
            statusBadge.textContent = 'Brouillon';
            statusBadge.className = 'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700';
            if (explanation) {
                explanation.innerHTML = '<b>Brouillon :</b> votre avis n\'est pas encore visible par la communauté. Vous seul pouvez le voir ici.';
                explanation.className = 'text-[10px] text-center text-amber-700 bg-white/50 border border-amber-100 rounded-lg p-2 italic leading-tight';
            }
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publier l\'avis';
            if (draftBtn) draftBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer en brouillon';
        }
        if (deleteBtn) deleteBtn.classList.remove('hidden');
    }

    // Vérifier si l'utilisateur a déjà soumis un avis
    const user = firebase.auth().currentUser;
    if (user) {
        db.collection('reviews').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                selectedStars = data.stars || 0;
                highlightStars(selectedStars);
                if (label) label.textContent = starLabels[selectedStars];
                if (textarea) textarea.value = data.message || '';
                if (charCount) charCount.textContent = (data.message || '').length;
                updateUIStatus(data.approved !== false);
                saveUserFlag('userFeedbackSent');
            } else {
                localStorage.removeItem('userFeedbackSent');
                window.feedbackSent = false;
            }
        }).catch(e => console.warn('Erreur chargement avis:', e));
    }

    // Fonction de sauvegarde générique
    async function saveReview(isApproved) {
        if (selectedStars === 0) {
            showReviewMsg('Veuillez choisir une note en étoiles.', 'error');
            return;
        }

        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;

        const btn = isApproved ? submitBtn : draftBtn;
        const originalHTML = btn.innerHTML;
        
        // Disable both buttons
        if (submitBtn) submitBtn.disabled = true;
        if (draftBtn) draftBtn.disabled = true;
        btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${isApproved ? 'Publication...' : 'Enregistrement...'}`;

        try {
            // Récupérer le pseudo et la photo
            let pseudo = 'Anonyme';
            let photoURL = '';
            try {
                const uDoc = await db.collection('users').doc(currentUser.uid).get();
                if (uDoc.exists) {
                    const uData = uDoc.data();
                    if (uData.pseudo) pseudo = uData.pseudo;
                    if (uData.photoURL) photoURL = uData.photoURL;
                }
            } catch(e) {}

            const reviewData = {
                stars: selectedStars,
                message: textarea ? textarea.value.trim() : '',
                pseudo,
                photoURL,
                uid: currentUser.uid,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                approved: isApproved
            };
            
            // Si nouveau, ajouter createdAt
            const docRef = db.collection('reviews').doc(currentUser.uid);
            const doc = await docRef.get();
            if (!doc.exists) {
                reviewData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            }

            await docRef.set(reviewData, { merge: true });

            saveUserFlag('userFeedbackSent');

            showReviewMsg(isApproved ? 'Votre avis a été publié ! Merci 🎉' : 'Brouillon enregistré.', 'success');
            
            // Update UI
            updateUIStatus(isApproved);
            
            // Marquer comme modifié pour recharger la page à la fermeture de la modale
            window.settingsHasChanged = true;
        } catch (e) {
            console.error('Erreur soumission avis:', e);
            showReviewMsg('Erreur lors de l\'enregistrement. Réessayez.', 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (draftBtn) draftBtn.disabled = false;
            if (submitBtn) submitBtn.innerHTML = isApproved ? (isApproved ? '<i class="fas fa-edit"></i> Mettre à jour' : '<i class="fas fa-paper-plane"></i> Publier l\'avis') : submitBtn.innerHTML;
            // On laisse updateUIStatus gérer le contenu des boutons normalement, mais au cas où :
            if (isApproved) updateUIStatus(true); else updateUIStatus(false);
        }
    }

    // Listeners
    if (submitBtn) submitBtn.addEventListener('click', () => saveReview(true));
    if (draftBtn) draftBtn.addEventListener('click', () => saveReview(false));

    // Gérer la suppression
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            const modal = document.getElementById('deleteReviewModal');
            if (!modal) return;

            modal.classList.remove('hidden');

            const confirmBtn = document.getElementById('confirmDeleteReviewBtn');
            const cancelBtn = document.getElementById('cancelDeleteReviewBtn');

            // On utilise onclick pour écraser les précédents listeners
            confirmBtn.onclick = async () => {
                modal.classList.add('hidden');
                await executeDelete();
            };

            cancelBtn.onclick = () => {
                modal.classList.add('hidden');
            };
            
            // Fermer si clic sur le backdrop
            modal.onclick = (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            };
        };
    }

    async function executeDelete() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Suppression...';

        try {
            await db.collection('reviews').doc(user.uid).delete();
            localStorage.removeItem('userFeedbackSent');
            window.feedbackSent = false;
            
            // Reset UI
            selectedStars = 0;
            highlightStars(0);
            if (label) label.textContent = '';
            if (textarea) textarea.value = '';
            if (charCount) charCount.textContent = '0';
            if (statusBadge) statusBadge.classList.add('hidden');
            
            const explanation = document.getElementById('reviewStateExplanation');
            if (explanation) explanation.classList.add('hidden');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publier l\'avis';
            }
            if (draftBtn) {
                draftBtn.disabled = false;
                draftBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer en brouillon';
            }
            
            deleteBtn.classList.add('hidden');
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Supprimer mon avis';
            
            showReviewMsg('Votre avis a été supprimé.', 'success');
            window.settingsHasChanged = true;
        } catch (e) {
            console.error('Erreur suppression avis:', e);
            showReviewMsg('Erreur lors de la suppression.', 'error');
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Supprimer mon avis';
        }
    }

    function showReviewMsg(msg, type) {
        if (!formMsg) return;
        formMsg.textContent = msg;
        formMsg.className = `text-xs text-center rounded-lg py-2 px-3 font-medium ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
        formMsg.classList.remove('hidden');
        setTimeout(() => formMsg.classList.add('hidden'), 5000);
    }
}

// ─────────────────────────────────────────────
//  Affichage cyclique des avis (index.html)
// ─────────────────────────────────────────────
let allReviewsPool = [];
let reviewsIntervalId = null;

async function initReviewsDisplay() {
    const container = document.getElementById('reviewsStaticContainer');
    if (!container) return;

    try {
        const snapshot = await db.collection('reviews').limit(50).get();

        if (snapshot.empty) {
            const section = document.getElementById('reviewsSection');
            if (section) section.classList.add('hidden');
            return;
        }

        allReviewsPool = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.approved !== false) allReviewsPool.push(data);
        });

        if (allReviewsPool.length === 0) {
            const section = document.getElementById('reviewsSection');
            if (section) section.classList.add('hidden');
            return;
        }

        // Premier affichage
        displayRandomReviews();

        // Calcul et affichage de la moyenne globale des avis
        updateReviewsAverage();

        // Lancer le cycle toutes les 10 secondes
        if (reviewsIntervalId) clearInterval(reviewsIntervalId);
        reviewsIntervalId = setInterval(rotateReviews, 10000);

        const section = document.getElementById('reviewsSection');
        if (section) section.classList.remove('hidden');

    } catch (e) {
        console.error('Erreur chargement avis:', e);
        const section = document.getElementById('reviewsSection');
        if (section) section.classList.add('hidden');
    }
}

/**
 * Force la rotation des avis et réinitialise le timer de 10 secondes
 */
function handleReviewsRefresh() {
    rotateReviews();
    if (reviewsIntervalId) {
        clearInterval(reviewsIntervalId);
    }
    reviewsIntervalId = setInterval(rotateReviews, 10000);
}

/**
 * Calcul et affichage de la note moyenne globale et du nombre d'avis
 */
function updateReviewsAverage() {
    const avgContainer = document.getElementById('reviewsAverageContainer');
    const starsContainer = document.getElementById('averageStarsContainer');
    const ratingText = document.getElementById('averageRatingText');
    const totalText = document.getElementById('totalReviewsText');
    
    if (!avgContainer || !allReviewsPool || allReviewsPool.length === 0) {
        if (avgContainer) avgContainer.classList.add('hidden');
        return;
    }

    const totalReviews = allReviewsPool.length;
    const sumStars = allReviewsPool.reduce((acc, curr) => acc + (curr.stars || 0), 0);
    const averageRating = sumStars / totalReviews;

    // Formater la moyenne à 1 décimale, ex: 4.8
    const formattedAvg = averageRating.toFixed(1);

    // Générer les étoiles HTML (gestion des pleines, demi-étoiles et vides)
    let starsHtml = '';
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = (averageRating % 1) >= 0.25 && (averageRating % 1) <= 0.75;
    const extraFullStar = (averageRating % 1) > 0.75 ? 1 : 0;
    
    const filledCount = fullStars + extraFullStar;
    const halfCount = hasHalfStar ? 1 : 0;
    const emptyCount = 5 - filledCount - halfCount;

    for (let i = 0; i < filledCount; i++) {
        starsHtml += '<i class="fa-solid fa-star text-yellow-400"></i>';
    }
    if (halfCount) {
        starsHtml += '<i class="fa-solid fa-star-half-stroke text-yellow-400"></i>';
    }
    for (let i = 0; i < emptyCount; i++) {
        starsHtml += '<i class="fa-regular fa-star text-gray-300"></i>';
    }

    if (starsContainer) starsContainer.innerHTML = starsHtml;
    if (ratingText) ratingText.textContent = `${formattedAvg} / 5`;
    if (totalText) {
        totalText.textContent = `${totalReviews} ${totalReviews > 1 ? 'avis' : 'avis'}`;
        if (!totalText.dataset.listenerAttached) {
            totalText.addEventListener('click', handleReviewsRefresh);
            totalText.dataset.listenerAttached = 'true';
        }
    }

    // Afficher avec une animation d'apparition douce
    avgContainer.classList.remove('hidden');
}

function rotateReviews() {
    const container = document.getElementById('reviewsStaticContainer');
    if (!container) return;

    const cards = container.querySelectorAll('.review-card-slot');
    if (cards.length === 0) return;

    const tempPool = [...allReviewsPool];
    const newReviews = [];

    // Préparer les 3 nouveaux avis
    for (let i = 0; i < 3; i++) {
        if (tempPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * tempPool.length);
            newReviews.push(tempPool[randomIndex]);
            if (allReviewsPool.length >= 3) tempPool.splice(randomIndex, 1);
        } else {
            const randomIndex = Math.floor(Math.random() * allReviewsPool.length);
            newReviews.push(allReviewsPool[randomIndex]);
        }
    }

    // Appliquer l'effet progressif (Gauche -> Milieu -> Droite)
    cards.forEach((slot, index) => {
        setTimeout(() => {
            // Fade out de la card individuelle
            slot.classList.add('opacity-0', 'scale-95');
            slot.classList.remove('opacity-100', 'scale-100');

            setTimeout(() => {
                // Changer le contenu
                slot.innerHTML = buildReviewCard(newReviews[index]);
                
                // Fade in
                slot.classList.add('opacity-100', 'scale-100');
                slot.classList.remove('opacity-0', 'scale-95');
            }, 600); // Temps de disparition
        }, index * 250); // Délai entre chaque card (effet cascade)
    });
}

function displayRandomReviews() {
    const container = document.getElementById('reviewsStaticContainer');
    if (!container || allReviewsPool.length === 0) return;

    const reviewsToDisplay = [];
    const tempPool = [...allReviewsPool];

    for (let i = 0; i < 3; i++) {
        if (tempPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * tempPool.length);
            reviewsToDisplay.push(tempPool[randomIndex]);
            if (allReviewsPool.length >= 3) tempPool.splice(randomIndex, 1);
        } else {
            const randomIndex = Math.floor(Math.random() * allReviewsPool.length);
            reviewsToDisplay.push(allReviewsPool[randomIndex]);
        }
    }

    // Créer des slots persistants pour permettre les transitions individuelles
    container.innerHTML = reviewsToDisplay.map(r => `
        <div class="review-card-slot transition-all duration-700 ease-in-out transform opacity-100 scale-100">
            ${buildReviewCard(r)}
        </div>
    `).join('');
}

function buildReviewCard(review) {
    const stars = review.stars || 0;
    const filledStars = '★'.repeat(stars);
    const emptyStars = '☆'.repeat(5 - stars);
    const pseudo = review.pseudo || 'Anonyme';
    const initials = pseudo.charAt(0).toUpperCase();
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    const colorClass = colors[initials.charCodeAt(0) % colors.length];

    // Avatar : photo de profil ou initiale colorée
    const avatarHTML = review.photoURL
        ? `<div class="relative w-10 h-10 flex-shrink-0">
               <img src="${escapeHtml(review.photoURL)}" alt="${escapeHtml(pseudo)}" class="w-10 h-10 rounded-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-10 h-10 ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-lg\\'>${initials}</div>'">
           </div>`
        : `<div class="w-10 h-10 ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">${initials}</div>`;

    // Date relative
    let dateStr = '';
    if (review.createdAt && review.createdAt.toDate) {
        const d = review.createdAt.toDate();
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) dateStr = "Aujourd'hui";
        else if (diffDays === 1) dateStr = 'Hier';
        else if (diffDays < 30) dateStr = `Il y a ${diffDays} jours`;
        else dateStr = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    return `
    <div class="review-card w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
        <div class="flex items-center gap-3">
            ${avatarHTML}
            <div class="min-w-0">
                <p class="font-bold text-gray-800 text-sm truncate uppercase tracking-tight">${escapeHtml(pseudo)}</p>
                <p class="text-yellow-400 text-base leading-none mt-0.5">${filledStars}<span class="text-gray-200">${emptyStars}</span></p>
            </div>
        </div>
        ${review.message ? `<p class="text-gray-600 text-sm leading-relaxed italic flex-1">"${escapeHtml(review.message)}"</p>` : ''}
        ${dateStr ? `<p class="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-auto">${dateStr}</p>` : ''}
    </div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─────────────────────────────────────────────
//  Vérification de l'état réel de l'avis utilisateur
// ─────────────────────────────────────────────
async function checkUserReviewState(user) {
    if (!user) {
        user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    }
    if (!user || typeof db === 'undefined') return;

    try {
        const doc = await db.collection('reviews').doc(user.uid).get();
        if (doc.exists && doc.data() && doc.data().stars > 0) {
            saveUserFlag('userFeedbackSent', true);
        } else {
            saveUserFlag('userFeedbackSent', false);
        }
    } catch (e) {
        console.warn('[Reviews] checkUserReviewState error:', e);
    }
}
window.checkUserReviewState = checkUserReviewState;

// ─────────────────────────────────────────────
//  Initialisation
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Charger la section avis si on est sur index.html
    if (document.getElementById('reviewsSection')) {
        initReviewsDisplay();
    }

    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                checkUserReviewState(user);
            }
        });
    }
});

// Exposer pour appel externe
window.injectReviewForm = injectReviewForm;
window.initReviewsDisplay = initReviewsDisplay;

