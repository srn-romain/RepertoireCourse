// js/theme.js - Configuration unique et centralisée de Tailwind et du Thème

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
