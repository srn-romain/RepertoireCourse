/**
 * js/toast.js
 * Système de notifications toast moderne, léger et animé
 * Utilisé pour notifier l'utilisateur des actions concrètes (création, suppression, modification, actions en masse...)
 */

(function () {
    'use strict';

    let toastContainer = null;

    function getOrCreateToastContainer() {
        if (!toastContainer || !document.body.contains(toastContainer)) {
            toastContainer = document.getElementById('global-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'global-toast-container';
                toastContainer.className = 'fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-[92vw] sm:max-w-md w-full';
                toastContainer.setAttribute('aria-live', 'polite');
                document.body.appendChild(toastContainer);
            }
        }
        return toastContainer;
    }

    /**
     * Affiche un toast de notification
     * @param {string} message - Message à afficher (peut contenir du HTML simple)
     * @param {'success'|'error'|'info'|'warning'|'delete'} [type='success'] - Type de notification
     * @param {number} [duration=3500] - Durée en millisecondes avant disparition automatique
     */
    function showToast(message, type = 'success', duration = 3500) {
        if (!message) return;

        const container = getOrCreateToastContainer();

        // Config selon le type
        const configs = {
            success: {
                bg: 'bg-white/95 border-emerald-200/90 text-gray-800 shadow-emerald-500/10',
                iconBg: 'bg-emerald-100 text-emerald-600',
                icon: 'fa-check-circle',
                barBg: 'bg-emerald-500'
            },
            delete: {
                bg: 'bg-white/95 border-rose-200/90 text-gray-800 shadow-rose-500/10',
                iconBg: 'bg-rose-100 text-rose-600',
                icon: 'fa-trash-alt',
                barBg: 'bg-rose-500'
            },
            error: {
                bg: 'bg-white/95 border-rose-200/90 text-gray-800 shadow-rose-500/10',
                iconBg: 'bg-rose-100 text-rose-600',
                icon: 'fa-exclamation-circle',
                barBg: 'bg-rose-500'
            },
            warning: {
                bg: 'bg-white/95 border-amber-200/90 text-gray-800 shadow-amber-500/10',
                iconBg: 'bg-amber-100 text-amber-700',
                icon: 'fa-exclamation-triangle',
                barBg: 'bg-amber-500'
            },
            info: {
                bg: 'bg-white/95 border-sky-200/90 text-gray-800 shadow-sky-500/10',
                iconBg: 'bg-sky-100 text-sky-600',
                icon: 'fa-info-circle',
                barBg: 'bg-sky-500'
            }
        };

        const config = configs[type] || configs.success;

        // Création de l'élément toast
        const toast = document.createElement('div');
        toast.className = `pointer-events-auto relative overflow-hidden rounded-xl border p-3.5 sm:px-4 sm:py-3 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-x-8 opacity-0 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${config.bg}`;
        toast.setAttribute('role', 'alert');

        toast.innerHTML = `
            <div class="flex items-center gap-3 min-w-0 flex-grow">
                <div class="w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center shrink-0 shadow-2xs">
                    <i class="fas ${config.icon} text-sm"></i>
                </div>
                <div class="flex-grow min-w-0 leading-snug break-words">
                    ${message}
                </div>
            </div>
            <button type="button" 
                    class="toast-close-btn text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100/80 transition cursor-pointer shrink-0 ml-1" 
                    aria-label="Fermer la notification" 
                    title="Fermer">
                <i class="fas fa-times text-xs"></i>
            </button>
            <div class="toast-progress-bar absolute bottom-0 left-0 h-0.5 ${config.barBg} transition-all" style="width: 100%;"></div>
        `;

        container.appendChild(toast);

        // Animation d'apparition
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-8', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        let remainingTime = duration;
        let startTime = Date.now();
        let timeoutId = null;
        let isPaused = false;
        const progressBar = toast.querySelector('.toast-progress-bar');

        function startTimer() {
            startTime = Date.now();
            if (progressBar) {
                progressBar.style.transition = `width ${remainingTime}ms linear`;
                progressBar.style.width = '0%';
            }
            timeoutId = setTimeout(() => {
                dismissToast();
            }, remainingTime);
        }

        function pauseTimer() {
            if (timeoutId && !isPaused) {
                clearTimeout(timeoutId);
                isPaused = true;
                const elapsed = Date.now() - startTime;
                remainingTime = Math.max(0, remainingTime - elapsed);
                if (progressBar) {
                    const currentWidth = (remainingTime / duration) * 100;
                    progressBar.style.transition = 'none';
                    progressBar.style.width = `${currentWidth}%`;
                }
            }
        }

        function resumeTimer() {
            if (isPaused && remainingTime > 0) {
                isPaused = false;
                startTimer();
            }
        }

        function dismissToast() {
            if (timeoutId) clearTimeout(timeoutId);
            toast.classList.remove('translate-x-0', 'opacity-100');
            toast.classList.add('translate-x-8', 'opacity-0');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }

        // Écouteur bouton fermeture ✕
        const closeBtn = toast.querySelector('.toast-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dismissToast();
            });
        }

        // Pause lors du survol de la souris
        toast.addEventListener('mouseenter', pauseTimer);
        toast.addEventListener('mouseleave', resumeTimer);

        // Lancement du timer si duration > 0
        if (duration > 0) {
            startTimer();
        }

        return dismissToast;
    }

    // Export global
    window.showToast = showToast;

})();
