/**
 * js/tutorial.js
 * Système de tutoriel interactif guidé pour l'application
 */

(function () {
    'use strict';

    // Configuration des étapes du tutoriel
    const tutorialSteps = [
        {
            target: '#statsText',
            title: 'Bienvenue ! 🎉',
            content: 'Voici vos statistiques générales : nombre de courses, distance totale, dénivelé, et temps de course. Ces données se mettent à jour automatiquement.',
            position: 'bottom'
        },
        {
            target: '#wishlistBtn',
            title: 'Wishlist 📝',
            content: 'Gérez votre liste de courses à faire ! Ajoutez des courses que vous souhaitez réaliser à l\'avenir. Vous pourrez ensuite les transformer en courses réalisées.',
            position: 'bottom'
        },
        {
            target: '#statsBtn',
            title: 'Statistiques détaillées 📊',
            content: 'Consultez des statistiques avancées : graphiques, records personnels, répartition des distances, des dénivelés, et bien plus !',
            position: 'bottom'
        },
        {
            target: '#badgesBtn',
            title: 'Badges 🏅',
            content: 'Visualisez vos badges et accomplissements ! Débloquez-les en atteignant différents objectifs (nombre de courses, distance totale, etc.).',
            position: 'bottom'
        },
        {
            target: '#addRaceBtn',
            title: 'Ajouter une course ➕',
            content: 'Ajoutez une nouvelle course à votre carnet. Astuce : si vous ne mettez pas de photo, l\'application cherchera automatiquement une image pertinente pour vous via le site web de la course ou son nom !',
            position: 'bottom'
        },
        {
            target: '#openCardConfigBtn',
            title: 'Configurer la carte ⚙️',
            content: 'Personnalisez les boutons d\'actions rapides affichés sur vos cartes de course. Choisissez jusqu\'à 3 raccourcis via un système de glisser-déposer intuitif et profitez d\'un aperçu en temps réel.',
            position: 'bottom'
        },
        {
            target: '#searchInput',
            title: 'Recherche 🔍',
            content: 'Recherchez rapidement une course par son nom, lieu, date, distance, dénivelé, temps, notes, ou tout autre critère. La recherche est instantanée !',
            position: 'bottom'
        },
        {
            target: '#toggleFiltersBtn',
            title: 'Filtres avancés 🎛️',
            content: 'Accédez aux filtres avancés pour affiner votre recherche : terrain, prix, heure de départ, et autres critères spécifiques.',
            position: 'top'
        },
        {
            target: '#yearFilter',
            title: 'Filtre par année 📅',
            content: 'Filtrez vos courses par année pour voir vos performances sur une période spécifique. Sélectionnez "Toutes" pour voir l\'ensemble de votre historique.',
            position: 'bottom'
        },
        {
            target: '#favoritesFilterBtn',
            title: 'Courses favorites ⭐',
            content: 'Affichez uniquement vos courses favorites. Marquez une course comme favorite en cliquant sur l\'étoile dans sa carte.',
            position: 'bottom'
        },
        {
            target: '.race-card',
            title: 'Détails & PDF 🏃',
            content: 'Cliquez sur une carte pour voir tous les détails, modifier la course, ou télécharger un superbe rapport PDF. Vous pouvez aussi y voir vos accompagnants et la météo de la course.',
            position: 'top',
            fallback: '#racesContainer'
        },
        {
            target: '#userSettingsBtn',
            title: 'Paramètres du compte ⚙️',
            content: 'Gérez vos paramètres : pseudo, confidentialité, importer/exporter vos données, et choisir quels boutons afficher dans le tableau de bord (Wishlist, Statistiques, Badges).',
            position: 'bottom'
        },
        {
            target: '#disconnectBtn',
            title: 'Déconnexion 🚪',
            content: 'Déconnectez-vous de votre compte en toute sécurité. Vos données resteront sauvegardées dans le cloud.',
            position: 'left'
        },
        {
            target: '#anniversaryBtn',
            title: 'Souvenirs 🎂',
            content: 'Revivez vos souvenirs ! Ce bouton vous montre vos courses passées à la même période. Parfait pour se remémorer ses exploits d\'il y a 1, 2 ou 3 ans.',
            position: 'right'
        },
        {
            target: null,
            title: 'Tutoriel terminé ! 🎓',
            content: 'Vous êtes maintenant prêt à utiliser votre carnet de courses ! N\'hésitez pas à explorer toutes les fonctionnalités. Bon run ! 🏃‍♂️💨',
            position: 'center'
        }
    ];

    let currentStep = 0;
    let tutorialActive = false;

    // Créer l'overlay et le tooltip
    function createTutorialElements() {
        // Overlay sombre
        const overlay = document.createElement('div');
        overlay.id = 'tutorialOverlay';
        overlay.className = 'fixed inset-0 bg-black transition-opacity duration-300 pointer-events-none';
        overlay.style.cssText = 'z-index: 9998; opacity: 0.7;';

        // Tooltip container
        const tooltip = document.createElement('div');
        tooltip.id = 'tutorialTooltip';
        tooltip.className = 'fixed bg-white rounded-xl shadow-2xl p-6 max-w-md transition-all duration-300';
        tooltip.style.cssText = 'z-index: 10000;';
        tooltip.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <h3 id="tutorialTitle" class="text-lg font-bold text-green-800 flex-1"></h3>
                <button id="tutorialClose" class="text-gray-400 hover:text-gray-600 transition ml-2">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <p id="tutorialContent" class="text-gray-700 mb-4 leading-relaxed"></p>
            <div class="flex items-center justify-between">
                <span id="tutorialProgress" class="text-sm text-gray-500"></span>
                <div class="flex gap-2">
                    <button id="tutorialPrev" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition font-medium">
                        <i class="fas fa-arrow-left mr-2"></i>Précédent
                    </button>
                    <button id="tutorialNext" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-bold shadow-md">
                        Suivant<i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;

        // Highlight element
        const highlight = document.createElement('div');
        highlight.id = 'tutorialHighlight';
        highlight.className = 'fixed transition-all duration-300 pointer-events-none';
        highlight.style.cssText = 'z-index: 9999; box-shadow: 0 0 0 4px rgba(var(--color-green-500-rgb, 34, 197, 94), 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7); border-radius: 8px;';

        document.body.appendChild(overlay);
        document.body.appendChild(highlight);
        document.body.appendChild(tooltip);

        // Event listeners
        document.getElementById('tutorialClose').addEventListener('click', () => endTutorial(false));
        document.getElementById('tutorialNext').addEventListener('click', nextStep);
        document.getElementById('tutorialPrev').addEventListener('click', prevStep);
    }

    // Positionner le tooltip
    function positionTooltip(targetElement, position) {
        const tooltip = document.getElementById('tutorialTooltip');
        const highlight = document.getElementById('tutorialHighlight');

        if (!targetElement) {
            // Tooltip centré
            tooltip.style.cssText = `
                z-index: 10000;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                max-width: 90%;
                width: 500px;
            `;
            highlight.style.display = 'none';
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Highlight l'élément
        highlight.style.display = 'block';
        highlight.style.top = `${rect.top - 4}px`;
        highlight.style.left = `${rect.left - 4}px`;
        highlight.style.width = `${rect.width + 8}px`;
        highlight.style.height = `${rect.height + 8}px`;

        // Scroll to element
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Position tooltip
        let top, left;
        const spacing = 20;

        switch (position) {
            case 'bottom':
                top = rect.bottom + spacing;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = rect.top - tooltipRect.height - spacing;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - spacing;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + spacing;
                break;
            default:
                top = rect.bottom + spacing;
                left = rect.left;
        }

        // Ajustements pour rester dans la fenêtre
        const maxLeft = window.innerWidth - tooltipRect.width - 20;
        const maxTop = window.innerHeight - tooltipRect.height - 20;
        left = Math.max(20, Math.min(left, maxLeft));
        top = Math.max(20, Math.min(top, maxTop));

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.transform = 'none';
        tooltip.style.maxWidth = '90vw';
    }

    // Afficher une étape
    function showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= tutorialSteps.length) return;

        const step = tutorialSteps[stepIndex];
        const tooltip = document.getElementById('tutorialTooltip');

        document.getElementById('tutorialTitle').textContent = step.title;
        document.getElementById('tutorialContent').textContent = step.content;
        document.getElementById('tutorialProgress').textContent = `Étape ${stepIndex + 1} sur ${tutorialSteps.length}`;

        // Boutons
        const prevBtn = document.getElementById('tutorialPrev');
        const nextBtn = document.getElementById('tutorialNext');

        prevBtn.style.display = stepIndex === 0 ? 'none' : 'inline-flex';

        if (stepIndex === tutorialSteps.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Terminer';
        } else {
            nextBtn.innerHTML = 'Suivant<i class="fas fa-arrow-right ml-2"></i>';
        }

        // Trouver l'élément cible (seulement s'il est visible)
        let targetElement = null;
        if (step.target) {
            const el = document.querySelector(step.target);
            if (el && !el.classList.contains('hidden') && window.getComputedStyle(el).display !== 'none') {
                targetElement = el;
            }
            // Essayer le fallback si la cible n'est pas visible
            if (!targetElement && step.fallback) {
                const fb = document.querySelector(step.fallback);
                if (fb && !fb.classList.contains('hidden') && window.getComputedStyle(fb).display !== 'none') {
                    targetElement = fb;
                }
            }
        }

        // Si l'élément n'est pas visible, le tooltip sera centré sans highlight
        positionTooltip(targetElement, targetElement ? step.position : 'center');
    }

    // Navigation
    function nextStep() {
        if (currentStep < tutorialSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            endTutorial(true);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    }

    // Démarrer le tutoriel
    function startTutorial() {
        if (tutorialActive) return;

        tutorialActive = true;
        currentStep = 0;
        createTutorialElements();
        showStep(0);

        // Freeze le body
        document.body.style.overflow = 'hidden';
    }

    // Terminer le tutoriel (seulement si isCompleted est true)
    async function endTutorial(isCompleted = false) {
        tutorialActive = false;

        // Supprimer les éléments
        const overlay = document.getElementById('tutorialOverlay');
        const tooltip = document.getElementById('tutorialTooltip');
        const highlight = document.getElementById('tutorialHighlight');

        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();
        if (highlight) highlight.remove();

        // Restore body
        document.body.style.overflow = '';

        window.tutorialCompleted = true;
        localStorage.setItem('tutorialCompleted', 'true');
        if (typeof saveUserFlag === 'function') {
            saveUserFlag('tutorialCompleted', true);
        }

        // Marquer le tutoriel comme terminé dans Firestore
        const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        if (user && typeof db !== 'undefined') {
            try {
                await db.collection('users').doc(user.uid).set({
                    tutorialCompleted: true,
                    tutorialCompletedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error('Erreur lors de la sauvegarde du statut du tutoriel:', error);
            }
        }
    }

    // Refuser / Fermer la proposition de tutoriel
    async function dismissTutorialPrompt() {
        const modal = document.getElementById('tutorialPromptModal');
        if (modal) modal.classList.add('hidden');

        window.tutorialCompleted = true;
        localStorage.setItem('tutorialCompleted', 'true');
        if (typeof saveUserFlag === 'function') {
            saveUserFlag('tutorialCompleted', true);
        }

        const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        if (user && typeof db !== 'undefined') {
            try {
                await db.collection('users').doc(user.uid).set({
                    tutorialCompleted: true,
                    tutorialDismissedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.warn('Erreur lors de la sauvegarde du refus du tutoriel:', error);
            }
        }
    }

    // Vérifier si l'utilisateur a déjà vu le tutoriel
    async function shouldShowTutorialPrompt() {
        // 1. Vérification rapide locale (si déjà complété ou refusé)
        if (localStorage.getItem('tutorialCompleted') === 'true' || window.tutorialCompleted === true) {
            return false;
        }

        const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        if (!user) return false;

        // Ne pas afficher pour les invités
        if (typeof window.isInviteUser === 'function') {
            const isInvite = await window.isInviteUser();
            if (isInvite) return false;
        }

        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data() || {};
                const isCompleted = (data.tutorialCompleted === true || data.tutorialCompleted === 'true') ||
                                   (data.flags && (data.flags.tutorialCompleted === true || data.flags.tutorialCompleted === 'true'));
                if (isCompleted) {
                    localStorage.setItem('tutorialCompleted', 'true');
                    window.tutorialCompleted = true;
                    return false; // Déjà vu / validé
                }
            }
            return true; // Pas encore vu
        } catch (error) {
            console.error('Erreur lors de la vérification du tutoriel:', error);
            return false;
        }
    }

    // Afficher la modale de proposition
    function showTutorialPrompt() {
        const modal = document.getElementById('tutorialPromptModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Initialisation
    window.initTutorial = async function () {
        // Attendre un peu que la page charge
        setTimeout(async () => {
            const shouldShow = await shouldShowTutorialPrompt();
            if (shouldShow) {
                showTutorialPrompt();
            }
        }, 1000);
    };

    // Exposer les fonctions globalement
    window.startTutorial = startTutorial;
    window.endTutorial = endTutorial;
    window.dismissTutorialPrompt = dismissTutorialPrompt;

})();
