// js/theme.js - Configuration unique et centralisée de Tailwind et du Système de Thèmes

const THEME_PALETTES = {
    green: {
        id: 'green',
        name: 'Vert Émeraude',
        subtitle: 'Classique (Défaut)',
        previewHex: '#16a34a',
        primary: {
            hex: '#16a34a', rgb: '22, 163, 74',
            hoverHex: '#15803d', hoverRgb: '21, 128, 61',
            lightHex: '#f0fdf4', lightRgb: '240, 253, 244',
            borderHex: '#bbf7d0', borderRgb: '187, 247, 208',
            focusHex: '#16a34a', focusRgb: '22, 163, 74'
        },
        greenShades: {
            50: { hex: '#f0fdf4', rgb: '240, 253, 244' },
            100: { hex: '#dcfce7', rgb: '220, 252, 231' },
            200: { hex: '#bbf7d0', rgb: '187, 247, 208' },
            300: { hex: '#86efac', rgb: '134, 239, 172' },
            400: { hex: '#4ade80', rgb: '74, 222, 128' },
            500: { hex: '#22c55e', rgb: '34, 197, 94' },
            600: { hex: '#16a34a', rgb: '22, 163, 74' },
            700: { hex: '#15803d', rgb: '21, 128, 61' },
            800: { hex: '#166534', rgb: '22, 101, 52' },
            900: { hex: '#14532d', rgb: '20, 83, 45' },
            950: { hex: '#052e16', rgb: '5, 46, 22' }
        },
        emeraldShades: {
            50: { hex: '#ecfdf5', rgb: '236, 253, 245' },
            100: { hex: '#d1fae5', rgb: '209, 250, 229' },
            200: { hex: '#a7f3d0', rgb: '167, 243, 208' },
            300: { hex: '#6ee7b7', rgb: '110, 231, 183' },
            400: { hex: '#34d399', rgb: '52, 211, 153' },
            500: { hex: '#10b981', rgb: '16, 185, 129' },
            600: { hex: '#059669', rgb: '5, 150, 105' },
            700: { hex: '#047857', rgb: '4, 120, 87' },
            800: { hex: '#065f46', rgb: '6, 95, 70' },
            900: { hex: '#064e3b', rgb: '6, 78, 59' },
            950: { hex: '#022c22', rgb: '2, 44, 34' }
        },
        confetti: ['#10B981', '#059669', '#34D399', '#16A34A', '#22C55E', '#86EFAC', '#F59E0B', '#3B82F6']
    },
    blue: {
        id: 'blue',
        name: 'Bleu Océan',
        subtitle: 'Sérénité & Horizon',
        previewHex: '#2563eb',
        primary: {
            hex: '#2563eb', rgb: '37, 99, 235',
            hoverHex: '#1d4ed8', hoverRgb: '29, 78, 216',
            lightHex: '#eff6ff', lightRgb: '239, 246, 255',
            borderHex: '#bfdbfe', borderRgb: '191, 219, 254',
            focusHex: '#2563eb', focusRgb: '37, 99, 235'
        },
        greenShades: {
            50: { hex: '#eff6ff', rgb: '239, 246, 255' },
            100: { hex: '#dbeafe', rgb: '219, 234, 254' },
            200: { hex: '#bfdbfe', rgb: '191, 219, 254' },
            300: { hex: '#93c5fd', rgb: '147, 197, 253' },
            400: { hex: '#60a5fa', rgb: '96, 165, 250' },
            500: { hex: '#3b82f6', rgb: '59, 130, 246' },
            600: { hex: '#2563eb', rgb: '37, 99, 235' },
            700: { hex: '#1d4ed8', rgb: '29, 78, 216' },
            800: { hex: '#1e40af', rgb: '30, 64, 175' },
            900: { hex: '#1e3a8a', rgb: '30, 58, 138' },
            950: { hex: '#172554', rgb: '23, 37, 84' }
        },
        emeraldShades: {
            50: { hex: '#f0f9ff', rgb: '240, 249, 255' },
            100: { hex: '#e0f2fe', rgb: '224, 242, 254' },
            200: { hex: '#bae6fd', rgb: '186, 230, 253' },
            300: { hex: '#7dd3fc', rgb: '125, 211, 252' },
            400: { hex: '#38bdf8', rgb: '56, 189, 248' },
            500: { hex: '#0ea5e9', rgb: '14, 165, 233' },
            600: { hex: '#0284c7', rgb: '2, 132, 199' },
            700: { hex: '#0369a1', rgb: '3, 105, 161' },
            800: { hex: '#075985', rgb: '7, 89, 133' },
            900: { hex: '#0c4a6e', rgb: '12, 74, 110' },
            950: { hex: '#082f49', rgb: '8, 47, 73' }
        },
        confetti: ['#2563EB', '#3B82F6', '#60A5FA', '#0284C7', '#38BDF8', '#93C5FD', '#F59E0B', '#10B981']
    },
    indigo: {
        id: 'indigo',
        name: 'Indigo Nuit',
        subtitle: 'Élégant & Profond',
        previewHex: '#4f46e5',
        primary: {
            hex: '#4f46e5', rgb: '79, 70, 229',
            hoverHex: '#4338ca', hoverRgb: '67, 56, 202',
            lightHex: '#eef2ff', lightRgb: '238, 242, 255',
            borderHex: '#c7d2fe', borderRgb: '199, 210, 254',
            focusHex: '#4f46e5', focusRgb: '79, 70, 229'
        },
        greenShades: {
            50: { hex: '#eef2ff', rgb: '238, 242, 255' },
            100: { hex: '#e0e7ff', rgb: '224, 231, 255' },
            200: { hex: '#c7d2fe', rgb: '199, 210, 254' },
            300: { hex: '#a5b4fc', rgb: '165, 180, 252' },
            400: { hex: '#818cf8', rgb: '129, 140, 248' },
            500: { hex: '#6366f1', rgb: '99, 102, 241' },
            600: { hex: '#4f46e5', rgb: '79, 70, 229' },
            700: { hex: '#4338ca', rgb: '67, 56, 202' },
            800: { hex: '#3730a3', rgb: '55, 48, 163' },
            900: { hex: '#312e81', rgb: '49, 46, 129' },
            950: { hex: '#1e1b4b', rgb: '30, 27, 75' }
        },
        emeraldShades: {
            50: { hex: '#f5f3ff', rgb: '245, 243, 255' },
            100: { hex: '#ede9fe', rgb: '237, 233, 254' },
            200: { hex: '#ddd6fe', rgb: '221, 214, 254' },
            300: { hex: '#c4b5fd', rgb: '196, 181, 253' },
            400: { hex: '#a78bfa', rgb: '167, 139, 250' },
            500: { hex: '#8b5cf6', rgb: '139, 92, 246' },
            600: { hex: '#7c3aed', rgb: '124, 58, 237' },
            700: { hex: '#6d28d9', rgb: '109, 40, 217' },
            800: { hex: '#5b21b6', rgb: '91, 33, 182' },
            900: { hex: '#4c1d95', rgb: '76, 29, 149' },
            950: { hex: '#2e1065', rgb: '46, 16, 101' }
        },
        confetti: ['#4F46E5', '#6366F1', '#818CF8', '#8B5CF6', '#A78BFA', '#C7D2FE', '#F59E0B', '#EC4899']
    },
    teal: {
        id: 'teal',
        name: 'Sarcelle Lagon',
        subtitle: 'Frais & Tonique',
        previewHex: '#0d9488',
        primary: {
            hex: '#0d9488', rgb: '13, 148, 136',
            hoverHex: '#0f766e', hoverRgb: '15, 118, 110',
            lightHex: '#f0fdfa', lightRgb: '240, 253, 250',
            borderHex: '#99f6e4', borderRgb: '153, 246, 228',
            focusHex: '#0d9488', focusRgb: '13, 148, 136'
        },
        greenShades: {
            50: { hex: '#f0fdfa', rgb: '240, 253, 250' },
            100: { hex: '#ccfbf1', rgb: '204, 251, 241' },
            200: { hex: '#99f6e4', rgb: '153, 246, 228' },
            300: { hex: '#5eead4', rgb: '94, 234, 212' },
            400: { hex: '#2dd4bf', rgb: '45, 212, 191' },
            500: { hex: '#14b8a6', rgb: '20, 184, 166' },
            600: { hex: '#0d9488', rgb: '13, 148, 136' },
            700: { hex: '#0f766e', rgb: '15, 118, 110' },
            800: { hex: '#115e59', rgb: '17, 94, 89' },
            900: { hex: '#134e4a', rgb: '19, 78, 74' },
            950: { hex: '#042f2e', rgb: '4, 47, 46' }
        },
        emeraldShades: {
            50: { hex: '#ecfeff', rgb: '236, 254, 255' },
            100: { hex: '#cffafe', rgb: '207, 250, 254' },
            200: { hex: '#a5f3fc', rgb: '165, 243, 252' },
            300: { hex: '#67e8f9', rgb: '103, 232, 249' },
            400: { hex: '#22d3ee', rgb: '34, 211, 238' },
            500: { hex: '#06b6d4', rgb: '6, 182, 212' },
            600: { hex: '#0891b2', rgb: '8, 145, 178' },
            700: { hex: '#0e7490', rgb: '14, 116, 144' },
            800: { hex: '#155e75', rgb: '21, 94, 117' },
            900: { hex: '#164e63', rgb: '22, 78, 99' },
            950: { hex: '#083344', rgb: '8, 51, 68' }
        },
        confetti: ['#0D9488', '#14B8A6', '#2DD4BF', '#059669', '#34D399', '#5EEAD4', '#F59E0B', '#3B82F6']
    },
    amber: {
        id: 'amber',
        name: 'Ambre Chaud',
        subtitle: 'Chaleur & Terroir',
        previewHex: '#d97706',
        primary: {
            hex: '#d97706', rgb: '217, 119, 6',
            hoverHex: '#b45309', hoverRgb: '180, 83, 9',
            lightHex: '#fffbeb', lightRgb: '255, 251, 235',
            borderHex: '#fde68a', borderRgb: '253, 230, 138',
            focusHex: '#d97706', focusRgb: '217, 119, 6'
        },
        greenShades: {
            50: { hex: '#fffbeb', rgb: '255, 251, 235' },
            100: { hex: '#fef3c7', rgb: '254, 243, 199' },
            200: { hex: '#fde68a', rgb: '253, 230, 138' },
            300: { hex: '#fcd34d', rgb: '252, 211, 77' },
            400: { hex: '#fbbf24', rgb: '251, 191, 36' },
            500: { hex: '#f59e0b', rgb: '245, 158, 11' },
            600: { hex: '#d97706', rgb: '217, 119, 6' },
            700: { hex: '#b45309', rgb: '180, 83, 9' },
            800: { hex: '#92400e', rgb: '146, 64, 14' },
            900: { hex: '#78350f', rgb: '120, 53, 15' },
            950: { hex: '#451a03', rgb: '69, 26, 3' }
        },
        emeraldShades: {
            50: { hex: '#fff7ed', rgb: '255, 247, 237' },
            100: { hex: '#ffedd5', rgb: '255, 237, 213' },
            200: { hex: '#fed7aa', rgb: '254, 215, 170' },
            300: { hex: '#fdba74', rgb: '253, 186, 116' },
            400: { hex: '#fb923c', rgb: '251, 146, 60' },
            500: { hex: '#f97316', rgb: '249, 115, 22' },
            600: { hex: '#ea580c', rgb: '234, 88, 12' },
            700: { hex: '#c2410c', rgb: '194, 65, 12' },
            800: { hex: '#9a3412', rgb: '154, 52, 18' },
            900: { hex: '#7c2d12', rgb: '124, 45, 18' },
            950: { hex: '#431407', rgb: '67, 20, 7' }
        },
        confetti: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#EA580C', '#FB923C', '#10B981', '#6366F1']
    },
    rose: {
        id: 'rose',
        name: 'Rose Boisé',
        subtitle: 'Chaleureux & Subtil',
        previewHex: '#e11d48',
        primary: {
            hex: '#e11d48', rgb: '225, 29, 72',
            hoverHex: '#be123c', hoverRgb: '190, 18, 60',
            lightHex: '#fff1f2', lightRgb: '255, 241, 242',
            borderHex: '#fecdd3', borderRgb: '254, 205, 211',
            focusHex: '#e11d48', focusRgb: '225, 29, 72'
        },
        greenShades: {
            50: { hex: '#fff1f2', rgb: '255, 241, 242' },
            100: { hex: '#ffe4e6', rgb: '255, 228, 230' },
            200: { hex: '#fecdd3', rgb: '254, 205, 211' },
            300: { hex: '#fda4af', rgb: '253, 164, 175' },
            400: { hex: '#fb7185', rgb: '251, 113, 133' },
            500: { hex: '#f43f5e', rgb: '244, 63, 94' },
            600: { hex: '#e11d48', rgb: '225, 29, 72' },
            700: { hex: '#be123c', rgb: '190, 18, 60' },
            800: { hex: '#9f1239', rgb: '159, 18, 57' },
            900: { hex: '#881337', rgb: '136, 19, 55' },
            950: { hex: '#4c0519', rgb: '76, 5, 25' }
        },
        emeraldShades: {
            50: { hex: '#fdf2f8', rgb: '253, 242, 248' },
            100: { hex: '#fce7f3', rgb: '252, 231, 243' },
            200: { hex: '#fbcfe8', rgb: '251, 207, 232' },
            300: { hex: '#f472b6', rgb: '244, 114, 182' },
            400: { hex: '#ec4899', rgb: '236, 72, 153' },
            500: { hex: '#db2777', rgb: '219, 39, 119' },
            600: { hex: '#be185d', rgb: '190, 24, 93' },
            700: { hex: '#9d174d', rgb: '157, 23, 77' },
            800: { hex: '#831843', rgb: '131, 24, 67' },
            900: { hex: '#701a39', rgb: '112, 26, 57' },
            950: { hex: '#500724', rgb: '80, 7, 36' }
        },
        confetti: ['#E11D48', '#F43F5E', '#FB7185', '#EC4899', '#F472B6', '#FDA4AF', '#F59E0B', '#8B5CF6']
    },
    purple: {
        id: 'purple',
        name: 'Pourpre Royal',
        subtitle: 'Noble & Intense',
        previewHex: '#9333ea',
        primary: {
            hex: '#9333ea', rgb: '147, 51, 234',
            hoverHex: '#7e22ce', hoverRgb: '126, 34, 206',
            lightHex: '#faf5ff', lightRgb: '250, 245, 255',
            borderHex: '#e9d5ff', borderRgb: '233, 213, 255',
            focusHex: '#9333ea', focusRgb: '147, 51, 234'
        },
        greenShades: {
            50: { hex: '#faf5ff', rgb: '250, 245, 255' },
            100: { hex: '#f3e8ff', rgb: '243, 232, 255' },
            200: { hex: '#e9d5ff', rgb: '233, 213, 255' },
            300: { hex: '#d8b4fe', rgb: '216, 180, 254' },
            400: { hex: '#c084fc', rgb: '192, 132, 252' },
            500: { hex: '#a855f7', rgb: '168, 85, 247' },
            600: { hex: '#9333ea', rgb: '147, 51, 234' },
            700: { hex: '#7e22ce', rgb: '126, 34, 206' },
            800: { hex: '#6b21a8', rgb: '107, 33, 168' },
            900: { hex: '#581c87', rgb: '88, 28, 135' },
            950: { hex: '#3b0764', rgb: '59, 7, 100' }
        },
        emeraldShades: {
            50: { hex: '#fdf4ff', rgb: '253, 244, 255' },
            100: { hex: '#fae8ff', rgb: '250, 232, 255' },
            200: { hex: '#f5d0fe', rgb: '245, 208, 254' },
            300: { hex: '#f0abfc', rgb: '240, 171, 252' },
            400: { hex: '#e879f9', rgb: '232, 121, 249' },
            500: { hex: '#d946ef', rgb: '217, 70, 239' },
            600: { hex: '#c026d3', rgb: '192, 38, 211' },
            700: { hex: '#a21caf', rgb: '162, 28, 175' },
            800: { hex: '#86198f', rgb: '134, 25, 143' },
            900: { hex: '#701a75', rgb: '112, 26, 117' },
            950: { hex: '#4a044e', rgb: '74, 4, 78' }
        },
        confetti: ['#9333EA', '#A855F7', '#C084FC', '#8B5CF6', '#7C3AED', '#E9D5FF', '#F59E0B', '#10B981']
    },
    slate: {
        id: 'slate',
        name: 'Ardoise Zinc',
        subtitle: 'Sobre & Urbain',
        previewHex: '#475569',
        primary: {
            hex: '#475569', rgb: '71, 85, 105',
            hoverHex: '#334155', hoverRgb: '51, 65, 85',
            lightHex: '#f8fafc', lightRgb: '248, 250, 252',
            borderHex: '#cbd5e1', borderRgb: '203, 213, 225',
            focusHex: '#475569', focusRgb: '71, 85, 105'
        },
        greenShades: {
            50: { hex: '#f8fafc', rgb: '248, 250, 252' },
            100: { hex: '#f1f5f9', rgb: '241, 245, 249' },
            200: { hex: '#e2e8f0', rgb: '226, 232, 240' },
            300: { hex: '#cbd5e1', rgb: '203, 213, 225' },
            400: { hex: '#94a3b8', rgb: '148, 163, 184' },
            500: { hex: '#64748b', rgb: '100, 116, 139' },
            600: { hex: '#475569', rgb: '71, 85, 105' },
            700: { hex: '#334155', rgb: '51, 65, 85' },
            800: { hex: '#1e293b', rgb: '30, 41, 59' },
            900: { hex: '#0f172a', rgb: '15, 23, 42' },
            950: { hex: '#020617', rgb: '2, 6, 23' }
        },
        emeraldShades: {
            50: { hex: '#f9fafb', rgb: '249, 250, 251' },
            100: { hex: '#f3f4f6', rgb: '243, 244, 246' },
            200: { hex: '#e5e7eb', rgb: '229, 231, 235' },
            300: { hex: '#d1d5db', rgb: '209, 213, 219' },
            400: { hex: '#9ca3af', rgb: '156, 163, 175' },
            500: { hex: '#6b7280', rgb: '107, 114, 128' },
            600: { hex: '#4b5563', rgb: '75, 85, 99' },
            700: { hex: '#374151', rgb: '55, 65, 81' },
            800: { hex: '#1f2937', rgb: '31, 41, 55' },
            900: { hex: '#111827', rgb: '17, 24, 39' },
            950: { hex: '#030712', rgb: '3, 7, 18' }
        },
        confetti: ['#475569', '#64748B', '#94A3B8', '#334155', '#3B82F6', '#10B981', '#F59E0B', '#CBD5E1']
    }
};

window.THEME_PALETTES = THEME_PALETTES;
window.currentThemeColor = localStorage.getItem('userThemeColor') || 'green';

/**
 * Applique immédiatement les variables CSS correspondant à la palette choisie
 * @param {string} themeKey - id de la palette (ex: 'green', 'blue', 'indigo'...)
 * @param {boolean} [persist=false] - si true, sauvegarde dans localStorage et met à jour Firestore si connecté
 */
window.applyThemeColor = function (themeKey, persist = false) {
    const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.green;
    const actualKey = THEME_PALETTES[themeKey] ? themeKey : 'green';
    window.currentThemeColor = actualKey;

    const root = document.documentElement;
    if (!root) return;

    // 1. Définir les variables Primary
    root.style.setProperty('--color-primary', palette.primary.hex);
    root.style.setProperty('--color-primary-rgb', palette.primary.rgb);
    root.style.setProperty('--color-primary-hover', palette.primary.hoverHex);
    root.style.setProperty('--color-primary-hover-rgb', palette.primary.hoverRgb);
    root.style.setProperty('--color-primary-light', palette.primary.lightHex);
    root.style.setProperty('--color-primary-light-rgb', palette.primary.lightRgb);
    root.style.setProperty('--color-primary-border', palette.primary.borderHex);
    root.style.setProperty('--color-primary-border-rgb', palette.primary.borderRgb);
    root.style.setProperty('--color-primary-focus', palette.primary.focusHex);
    root.style.setProperty('--color-primary-focus-rgb', palette.primary.focusRgb);

    // 2. Définir les nuances Green
    Object.keys(palette.greenShades).forEach(shade => {
        const item = palette.greenShades[shade];
        root.style.setProperty(`--color-green-${shade}`, item.hex);
        root.style.setProperty(`--color-green-${shade}-rgb`, item.rgb);
    });

    // 3. Définir les nuances Emerald
    Object.keys(palette.emeraldShades).forEach(shade => {
        const item = palette.emeraldShades[shade];
        root.style.setProperty(`--color-emerald-${shade}`, item.hex);
        root.style.setProperty(`--color-emerald-${shade}-rgb`, item.rgb);
    });

    // 4. Mettre à jour meta theme-color pour navigateur / PWA
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', palette.primary.hex);
    }

    if (persist) {
        try {
            localStorage.setItem('userThemeColor', actualKey);
        } catch (e) {
            console.warn('Erreur écriture localStorage theme:', e);
        }

        // Sauvegarder dans Firestore si l'utilisateur est authentifié
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser && typeof db !== 'undefined') {
            const uid = firebase.auth().currentUser.uid;
            db.collection('users').doc(uid).set({ themeColor: actualKey }, { merge: true })
                .then(() => console.log('Thème enregistré dans Firestore:', actualKey))
                .catch(err => console.warn('Erreur sauvegarde thème Firestore:', err));
        }
    }

    // Émettre un événement global pour que les composants (ex: swatch picker dans modal) se synchronisent
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { themeKey: actualKey, palette } }));
};

/**
 * Récupère les couleurs de confettis pour la palette active
 */
window.getThemeConfettiColors = function () {
    const key = window.currentThemeColor || localStorage.getItem('userThemeColor') || 'green';
    const palette = THEME_PALETTES[key] || THEME_PALETTES.green;
    return palette.confetti || ['#10B981', '#059669', '#34D399', '#F59E0B', '#FBBF24', '#3B82F6'];
};

// Application synchrone immédiate dès l'évaluation du script pour éviter tout flash blanc/vert
(function initEarlyTheme() {
    try {
        const savedTheme = localStorage.getItem('userThemeColor') || 'green';
        window.applyThemeColor(savedTheme, false);
    } catch (e) {
        // En cas d'erreur de stockage, appliquer par défaut 'green'
        window.applyThemeColor('green', false);
    }
})();

// Configuration Tailwind dynamique utilisant les variables CSS
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    green: {
                        50: 'rgba(var(--color-green-50-rgb, 240, 253, 244), <alpha-value>)',
                        100: 'rgba(var(--color-green-100-rgb, 220, 252, 231), <alpha-value>)',
                        200: 'rgba(var(--color-green-200-rgb, 187, 247, 208), <alpha-value>)',
                        300: 'rgba(var(--color-green-300-rgb, 134, 239, 172), <alpha-value>)',
                        400: 'rgba(var(--color-green-400-rgb, 74, 222, 128), <alpha-value>)',
                        500: 'rgba(var(--color-green-500-rgb, 34, 197, 94), <alpha-value>)',
                        600: 'rgba(var(--color-green-600-rgb, 22, 163, 74), <alpha-value>)',
                        700: 'rgba(var(--color-green-700-rgb, 21, 128, 61), <alpha-value>)',
                        800: 'rgba(var(--color-green-800-rgb, 22, 101, 52), <alpha-value>)',
                        900: 'rgba(var(--color-green-900-rgb, 20, 83, 45), <alpha-value>)',
                        950: 'rgba(var(--color-green-950-rgb, 5, 46, 22), <alpha-value>)',
                    },
                    emerald: {
                        50: 'rgba(var(--color-emerald-50-rgb, 236, 253, 245), <alpha-value>)',
                        100: 'rgba(var(--color-emerald-100-rgb, 209, 250, 229), <alpha-value>)',
                        200: 'rgba(var(--color-emerald-200-rgb, 167, 243, 208), <alpha-value>)',
                        300: 'rgba(var(--color-emerald-300-rgb, 110, 231, 183), <alpha-value>)',
                        400: 'rgba(var(--color-emerald-400-rgb, 52, 211, 153), <alpha-value>)',
                        500: 'rgba(var(--color-emerald-500-rgb, 16, 185, 129), <alpha-value>)',
                        600: 'rgba(var(--color-emerald-600-rgb, 5, 150, 105), <alpha-value>)',
                        700: 'rgba(var(--color-emerald-700-rgb, 4, 120, 87), <alpha-value>)',
                        800: 'rgba(var(--color-emerald-800-rgb, 6, 95, 70), <alpha-value>)',
                        900: 'rgba(var(--color-emerald-900-rgb, 6, 78, 59), <alpha-value>)',
                        950: 'rgba(var(--color-emerald-950-rgb, 2, 44, 34), <alpha-value>)',
                    },
                    primary: {
                        DEFAULT: 'rgba(var(--color-primary-rgb, 22, 163, 74), <alpha-value>)',
                        hover: 'rgba(var(--color-primary-hover-rgb, 21, 128, 61), <alpha-value>)',
                        light: 'rgba(var(--color-primary-light-rgb, 240, 253, 244), <alpha-value>)',
                        border: 'rgba(var(--color-primary-border-rgb, 187, 247, 208), <alpha-value>)',
                    }
                }
            }
        }
    };
}
