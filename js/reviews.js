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
<hr class="border-gray-100" id="reviewSectionDivider">

<!-- Laisser un avis -->
<div id="reviewSection">
    <h3 class="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
        <i class="fas fa-star text-yellow-400"></i> Laisser un avis
    </h3>
    <p class="text-xs text-gray-400 mb-3 italic">Votre retour aide la communauté à découvrir l'application ✨</p>

    <div class="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 space-y-3">
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

        <!-- Bouton -->
        <button id="submitReviewBtn"
            class="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-paper-plane"></i> Publier mon avis
        </button>

        <div id="reviewFormMessage" class="hidden text-xs text-center rounded-lg py-2 px-3 font-medium"></div>
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

    // Chercher le conteneur principal du formulaire de settings
    const modal = document.getElementById('userSettingsModal');
    if (!modal) return;

    // Chercher la zone "Actions" (avant la zone danger)
    const dangerZone = modal.querySelector('.border-red-100');
    if (!dangerZone) return;

    // Insérer le bloc avis juste avant la zone danger (tous les enfants)
    const template = document.createElement('template');
    template.innerHTML = reviewFormHTML;
    dangerZone.parentNode.insertBefore(template.content, dangerZone);

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
                if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-edit"></i> Modifier mon avis';
            }
        }).catch(e => console.warn('Erreur chargement avis:', e));
    }

    // Soumettre
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (selectedStars === 0) {
                showReviewMsg('Veuillez choisir une note en étoiles.', 'error');
                return;
            }

            const currentUser = firebase.auth().currentUser;
            if (!currentUser) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Publication...';

            try {
                // Récupérer le pseudo
                let pseudo = 'Anonyme';
                try {
                    const uDoc = await db.collection('users').doc(currentUser.uid).get();
                    if (uDoc.exists && uDoc.data().pseudo) pseudo = uDoc.data().pseudo;
                } catch(e) {}

                const reviewData = {
                    stars: selectedStars,
                    message: textarea ? textarea.value.trim() : '',
                    pseudo,
                    uid: currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    approved: true // Auto-approuvé, on peut changer plus tard
                };

                // Utiliser l'UID comme ID de document (1 avis par utilisateur)
                await db.collection('reviews').doc(currentUser.uid).set(reviewData);

                showReviewMsg('Votre avis a été publié ! Merci 🎉', 'success');
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Avis publié !';
            } catch (e) {
                console.error('Erreur soumission avis:', e);
                showReviewMsg('Erreur lors de la publication. Réessayez.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publier mon avis';
            }
        });
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
//  Carrousel des avis (index.html)
// ─────────────────────────────────────────────
async function loadReviewsCarousel() {
    const container = document.getElementById('reviewsCarouselTrack');
    if (!container) return;

    try {
        // Requête simple sans index composite
        const snapshot = await db.collection('reviews').limit(30).get();

        if (snapshot.empty) {
            const section = document.getElementById('reviewsSection');
            if (section) section.classList.add('hidden');
            return;
        }

        const reviews = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Filtrer côté client
            if (data.approved !== false) reviews.push(data);
        });

        if (reviews.length === 0) {
            const section = document.getElementById('reviewsSection');
            if (section) section.classList.add('hidden');
            return;
        }

        // Trier côté client du plus récent au plus ancien
        reviews.sort((a, b) => {
            const ta = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : 0) : 0;
            const tb = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : 0) : 0;
            return tb - ta;
        });

        // Dupliquer pour un défilement continu seamless
        const allReviews = reviews.length > 1 ? [...reviews, ...reviews] : reviews;

        container.innerHTML = allReviews.map(r => buildReviewCard(r)).join('');

        // Ajuster la vitesse selon le nb de cartes
        const duration = Math.max(20, reviews.length * 5);
        container.style.animationDuration = `${duration}s`;

        // Afficher la section si elle était cachée
        const section = document.getElementById('reviewsSection');
        if (section) section.classList.remove('hidden');

    } catch (e) {
        console.error('Erreur chargement avis carrousel:', e);
        const section = document.getElementById('reviewsSection');
        if (section) section.classList.add('hidden');
    }
}

function buildReviewCard(review) {
    const stars = review.stars || 0;
    const filledStars = '★'.repeat(stars);
    const emptyStars = '☆'.repeat(5 - stars);
    const initials = (review.pseudo || 'A').charAt(0).toUpperCase();
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    const colorClass = colors[initials.charCodeAt(0) % colors.length];

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
    <div class="review-card flex-shrink-0 w-72 bg-white rounded-2xl shadow-md border border-gray-100 p-5 mx-3 flex flex-col gap-3">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                ${initials}
            </div>
            <div class="min-w-0">
                <p class="font-semibold text-gray-800 text-sm truncate">${escapeHtml(review.pseudo || 'Anonyme')}</p>
                <p class="text-yellow-400 text-base leading-none mt-0.5">${filledStars}<span class="text-gray-200">${emptyStars}</span></p>
            </div>
        </div>
        ${review.message ? `<p class="text-gray-600 text-sm leading-relaxed italic flex-1">"${escapeHtml(review.message)}"</p>` : ''}
        ${dateStr ? `<p class="text-xs text-gray-400 mt-auto">${dateStr}</p>` : ''}
    </div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─────────────────────────────────────────────
//  Initialisation
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Charger le carrousel si on est sur index.html
    if (document.getElementById('reviewsSection')) {
        loadReviewsCarousel();
    }
});

// Exposer pour appel externe
window.injectReviewForm = injectReviewForm;
window.loadReviewsCarousel = loadReviewsCarousel;
