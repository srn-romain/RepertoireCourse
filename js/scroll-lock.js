/**
 * scroll-lock.js
 * Gèle le scroll de l'arrière-plan lorsqu'une modale est ouverte.
 */
(function () {
    'use strict';

    function isAnyModalOpen() {
        const candidates = document.querySelectorAll('.modal, [id*="odal"]');
        for (const el of candidates) {
            if (!el.classList.contains('hidden') && !el.classList.contains('invisible')) {
                const cs = window.getComputedStyle(el);
                if (cs.display !== 'none' && cs.visibility !== 'hidden' && cs.position === 'fixed') {
                    return true;
                }
            }
        }
        return false;
    }

    function syncBodyScroll() {
        const shouldLock = isAnyModalOpen();
        document.body.style.overflow = shouldLock ? 'hidden' : '';
    }

    function init() {
        // Synchronisation initiale
        syncBodyScroll();

        // Observer tout changement de classe sur le body et ses enfants
        const observer = new MutationObserver(function () {
            syncBodyScroll();
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }

    // Lancer dès que possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
