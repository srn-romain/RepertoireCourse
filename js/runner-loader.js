/**
 * js/runner-loader.js
 * Generates HTML for the animated stickman runner loader component (anatomically correct facing right).
 */

function getRunnerLoaderHTML(colSpan = 'col-span-full') {
    let colClass = 'col-span-full';
    if (typeof colSpan === 'number') {
        colClass = `col-span-1 md:col-span-2 lg:col-span-${colSpan}`;
    } else if (typeof colSpan === 'string' && colSpan.length > 0) {
        colClass = colSpan;
    }

    return `
    <div class="${colClass} flex justify-center items-center py-8 w-full">
        <div class="runner-loader-container">
            <!-- Void / Speed background -->
            <div class="runner-void-bg">
                <div class="runner-wind-line wl-1"></div>
                <div class="runner-wind-line wl-2"></div>
                <div class="runner-wind-line wl-3"></div>
                <div class="runner-wind-line wl-4"></div>
                <div class="runner-particle p-1"></div>
                <div class="runner-particle p-2"></div>
                <div class="runner-particle p-3"></div>
            </div>

            <!-- SVG Animated Stickman Runner Character -->
            <svg class="runner-svg-character" viewBox="0 0 160 115" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="runnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#34d399" />
                        <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                    <linearGradient id="runnerGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#059669" />
                        <stop offset="100%" stop-color="#047857" />
                    </linearGradient>
                    <filter id="runnerGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <!-- Ground Shadow -->
                <ellipse class="runner-shadow-anim" cx="70" cy="96" rx="22" ry="4" fill="rgba(16, 185, 129, 0.25)" />

                <!-- Main Body Group (Bobbing animation) -->
                <g class="runner-body-anim">
                    
                    <!-- BACK ARM -->
                    <g class="runner-arm-back">
                        <path d="M 82 40 L 68 50" stroke="url(#runnerGradDark)" stroke-width="4.5" stroke-linecap="round" fill="none" />
                        <g class="runner-forearm-back">
                            <path d="M 68 50 L 60 60" stroke="url(#runnerGradDark)" stroke-width="4" stroke-linecap="round" fill="none" />
                        </g>
                    </g>

                    <!-- BACK LEG -->
                    <g class="runner-leg-back">
                        <path d="M 70 62 L 54 76" stroke="url(#runnerGradDark)" stroke-width="5" stroke-linecap="round" fill="none" />
                        <g class="runner-shin-back">
                            <path d="M 54 76 L 44 96 L 50 96" stroke="url(#runnerGradDark)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                        </g>
                    </g>

                    <!-- TORSO (Hips 70,62 to Shoulders 82,40 - leaning forward right) -->
                    <path d="M 82 40 L 70 62" stroke="url(#runnerGrad)" stroke-width="6" stroke-linecap="round" filter="url(#runnerGlow)" />

                    <!-- HEAD (Placed at 90, 26 - forward in front of shoulders, facing right) -->
                    <circle cx="90" cy="26" r="8.5" fill="url(#runnerGrad)" filter="url(#runnerGlow)" />
                    <!-- Runner visor detail facing right -->
                    <path d="M 94 25 L 97 26 L 94 28" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />

                    <!-- FRONT LEG -->
                    <g class="runner-leg-front">
                        <path d="M 70 62 L 86 78" stroke="url(#runnerGrad)" stroke-width="5.5" stroke-linecap="round" fill="none" filter="url(#runnerGlow)" />
                        <g class="runner-shin-front">
                            <path d="M 86 78 L 78 96 L 86 96" stroke="url(#runnerGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#runnerGlow)" />
                        </g>
                    </g>

                    <!-- FRONT ARM -->
                    <g class="runner-arm-front">
                        <path d="M 82 40 L 94 52" stroke="url(#runnerGrad)" stroke-width="5" stroke-linecap="round" fill="none" filter="url(#runnerGlow)" />
                        <g class="runner-forearm-front">
                            <path d="M 94 52 L 104 44" stroke="url(#runnerGrad)" stroke-width="4.5" stroke-linecap="round" fill="none" filter="url(#runnerGlow)" />
                        </g>
                    </g>

                </g>

                <!-- Animated Track underneath -->
                <line class="runner-track-line" x1="10" y1="96" x2="150" y2="96" stroke="#10b981" stroke-width="2.5" stroke-dasharray="8 6" stroke-linecap="round" opacity="0.75" />
            </svg>
        </div>
    </div>
    `;
}

// Expose globally
window.getRunnerLoaderHTML = getRunnerLoaderHTML;
