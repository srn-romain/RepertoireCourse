/**
 * js/confetti.js
 * Moteur de confetti festif pour la célébration des missions et succès.
 * Fait traverser un jet continu de confettis sur tout l'écran pendant une durée configurable (10s+).
 */

(function () {
    'use strict';

    /**
     * Fallback autonome de confettis en Canvas natif si canvas-confetti externe n'est pas chargé
     */
    function runNativeCanvasConfetti(durationSeconds) {
        let canvas = document.getElementById('mission-confetti-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'mission-confetti-canvas';
            canvas.className = 'fixed inset-0 pointer-events-none z-[99998]';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;';
            document.body.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const onResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', onResize);

        const colors = (typeof window.getThemeConfettiColors === 'function') 
            ? window.getThemeConfettiColors() 
            : ['#10B981', '#059669', '#34D399', '#F59E0B', '#FBBF24', '#3B82F6', '#6366F1', '#EC4899', '#8B5CF6'];
        const particles = [];
        const endTime = Date.now() + (durationSeconds * 1000);
        let animationFrameId = null;

        function spawnParticles() {
            const countPerSide = 3;
            // Jet gauche tirant vers le haut et la droite à travers l'écran
            for (let i = 0; i < countPerSide; i++) {
                particles.push({
                    x: -10,
                    y: height * 0.75 + (Math.random() * 80 - 40),
                    vx: Math.random() * 14 + 10,
                    vy: -(Math.random() * 16 + 12),
                    size: Math.random() * 8 + 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rot: Math.random() * 360,
                    rotSpeed: Math.random() * 12 - 6,
                    wobble: Math.random() * 10,
                    wobbleSpeed: Math.random() * 0.1 + 0.05,
                    opacity: 1
                });
            }

            // Jet droit tirant vers le haut et la gauche à travers l'écran
            for (let i = 0; i < countPerSide; i++) {
                particles.push({
                    x: width + 10,
                    y: height * 0.75 + (Math.random() * 80 - 40),
                    vx: -(Math.random() * 14 + 10),
                    vy: -(Math.random() * 16 + 12),
                    size: Math.random() * 8 + 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rot: Math.random() * 360,
                    rotSpeed: Math.random() * 12 - 6,
                    wobble: Math.random() * 10,
                    wobbleSpeed: Math.random() * 0.1 + 0.05,
                    opacity: 1
                });
            }
        }

        function updateAndDraw() {
            ctx.clearRect(0, 0, width, height);

            const now = Date.now();
            if (now < endTime) {
                spawnParticles();
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.38; // Gravité
                p.vx *= 0.99; // Frottement horizontal
                p.rot += p.rotSpeed;
                p.wobble += p.wobbleSpeed;

                // Dessin du confetti
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rot * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;

                const currentWidth = p.size * Math.cos(p.wobble);
                ctx.fillRect(-currentWidth / 2, -p.size / 2, currentWidth, p.size);
                ctx.restore();

                // Sortie d'écran
                if (p.y > height + 20) {
                    particles.splice(i, 1);
                }
            }

            if (now < endTime || particles.length > 0) {
                animationFrameId = requestAnimationFrame(updateAndDraw);
            } else {
                window.removeEventListener('resize', onResize);
                if (canvas && canvas.parentNode) {
                    canvas.remove();
                }
            }
        }

        animationFrameId = requestAnimationFrame(updateAndDraw);
    }

    /**
     * Lance un jet continu de confettis traversant l'écran pendant durationSeconds (3s par défaut, max 10s)
     * @param {number} [durationSeconds=3]
     */
    function launchMissionConfetti(durationSeconds = 3) {
        // Durée plafonnée à 10 secondes maximum
        const safeDuration = Math.min(10, Math.max(1, durationSeconds || 3));

        // Si canvas-confetti est disponible
        if (typeof window.confetti === 'function') {
            const end = Date.now() + (safeDuration * 1000);
            const colors = (typeof window.getThemeConfettiColors === 'function')
                ? window.getThemeConfettiColors()
                : ['#10B981', '#059669', '#34D399', '#F59E0B', '#FBBF24', '#3B82F6', '#6366F1', '#EC4899', '#8B5CF6'];

            (function frame() {
                // Jet depuis la gauche traversant vers la droite
                window.confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 60,
                    origin: { x: 0, y: 0.75 },
                    colors: colors,
                    zIndex: 99998
                });

                // Jet depuis la droite traversant vers la gauche
                window.confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 60,
                    origin: { x: 1, y: 0.75 },
                    colors: colors,
                    zIndex: 99998
                });

                // Bouffée occasionnelle au centre
                if (Math.random() < 0.2) {
                    window.confetti({
                        particleCount: 5,
                        angle: 90,
                        spread: 110,
                        origin: { x: 0.5, y: 0.85 },
                        colors: colors,
                        zIndex: 99998
                    });
                }

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
        } else {
            // Moteur natif autonome
            runNativeCanvasConfetti(safeDuration);
        }
    }

    window.launchMissionConfetti = launchMissionConfetti;

})();
