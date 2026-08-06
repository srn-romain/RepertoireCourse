/**
 * js/runner-loader.js
 * Generates HTML for the realistic athletic stickman runner loader component.
 */

function getRunnerLoaderHTML(colSpan = 'col-span-full') {
    let colClass = 'col-span-full';
    if (typeof colSpan === 'number') {
        colClass = `col-span-1 md:col-span-2 lg:col-span-${colSpan}`;
    } else if (typeof colSpan === 'string' && colSpan.length > 0) {
        colClass = colSpan;
    }

    return `
    <div class="${colClass} flex justify-center items-center py-6 w-full">
        <div class="runner-loader-container">
            <!-- Void / Speed background -->
            <div class="runner-void-bg">
                <div class="runner-wind-line wl-1"></div>
                <div class="runner-wind-line wl-2"></div>
                <div class="runner-wind-line wl-3"></div>
                <div class="runner-wind-line wl-4"></div>
            </div>

            <!-- SVG Athletic Runner Stickman Character -->
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
                    <filter id="runnerGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <!-- Ground Shadow (pulsing with flight phase) -->
                <ellipse class="runner-shadow-anim" cx="70" cy="94" rx="20" ry="3.5" fill="rgba(16, 185, 129, 0.25)" />

                <!-- Main Body Group (Bobbing animation) -->
                <g class="runner-body-anim">
                    
                    <!-- BACK ARM -->
                    <g class="runner-arm-back">
                        <path d="M 80 38 L 68 48" stroke="url(#runnerGradDark)" stroke-width="4.5" stroke-linecap="round" fill="none" />
                        <g class="runner-forearm-back">
                            <path d="M 68 48 L 60 56" stroke="url(#runnerGradDark)" stroke-width="4" stroke-linecap="round" fill="none" />
                        </g>
                    </g>

                    <!-- BACK LEG -->
                    <g class="runner-thigh-back">
                        <path d="M 70 60 L 56 74" stroke="url(#runnerGradDark)" stroke-width="5" stroke-linecap="round" fill="none" />
                        <g class="runner-shin-back">
                            <path d="M 56 74 L 46 94 L 52 94" stroke="url(#runnerGradDark)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                        </g>
                    </g>

                    <!-- TORSO (Leaning forward right) -->
                    <path d="M 80 38 L 70 60" stroke="url(#runnerGrad)" stroke-width="6" stroke-linecap="round" filter="url(#runnerGlow)" />

                    <!-- HEAD & VISOR (Facing right) -->
                    <circle cx="88" cy="22" r="7.5" fill="url(#runnerGrad)" filter="url(#runnerGlow)" />
                    <path d="M 92 21 L 95 22 L 92 24" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.9" />

                    <!-- FRONT LEG -->
                    <g class="runner-thigh-front">
                        <path d="M 70 60 L 84 74" stroke="url(#runnerGrad)" stroke-width="5.5" stroke-linecap="round" fill="none" filter="url(#runnerGlow)" />
                        <g class="runner-shin-front">
                            <path d="M 84 74 L 78 94 L 86 94" stroke="url(#runnerGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#runnerGlow)" />
                        </g>
                    </g>

                    <!-- FRONT ARM -->
                    <g class="runner-arm-front">
                        <path d="M 80 38 L 92 48" stroke="url(#runnerGrad)" stroke-width="5" stroke-linecap="round" fill="none" filter="url(#runnerGlow)" />
                        <g class="runner-forearm-front">
                            <path d="M 92 48 L 100 38" stroke="url(#runnerGrad)" stroke-width="4.5" stroke-linecap="round" fill="none" filter="url(#runnerGlow)" />
                        </g>
                    </g>

                </g>

                <!-- Animated Ground Track -->
                <line class="runner-track-line" x1="10" y1="94" x2="150" y2="94" stroke="#10b981" stroke-width="2" stroke-dasharray="8 6" stroke-linecap="round" opacity="0.75" />
            </svg>
        </div>
    </div>
    `;
}

// Expose globally
window.getRunnerLoaderHTML = getRunnerLoaderHTML;
