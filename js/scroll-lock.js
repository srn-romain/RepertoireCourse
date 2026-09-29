/**
 * scroll-lock.js
 * Gèle le scroll de l'arrière-plan lorsqu'une modale est ouverte.
 */
(function () {
    'use strict';

    function isAnyModalOpen() {
        const candidates = document.querySelectorAll('.modal, [id$="Modal"], [id$="modal"]');
        for (const el of candidates) {
            if (el.classList.contains('hidden') || el.classList.contains('invisible')) {
                continue;
            }
            const cs = window.getComputedStyle(el);
            if (cs.display !== 'none' && cs.visibility !== 'hidden' && (cs.position === 'fixed' || cs.position === 'absolute')) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
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
        syncBodyScroll();

        const observer = new MutationObserver(function () {
            syncBodyScroll();
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'style'],
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.syncBodyScroll = syncBodyScroll;
})();

