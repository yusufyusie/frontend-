/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Ethiopian IT Park Brand Colors - WCAG AA Compliant
                brand: {
                    navy: '#16284F',      // Navy Blue - Authority, headers, footers
                    teal: '#0C7C92',      // Teal Blue - PRIMARY brand color
                    mint: '#6EC9C4',      // Mint Green - Accents, highlights
                },

                // Primary Color (Teal Blue) - Main Brand Color
                primary: {
                    DEFAULT: '#0C7C92',
                    50: '#E6F7F9',
                    100: '#B3E7ED',
                    200: '#80D7E1',
                    300: '#4DC7D5',
                    400: '#1AB7C9',
                    500: '#0C7C92',      // Main - WCAG AA compliant
                    600: '#0A6A7D',
                    700: '#085868',      // Hover state
                    800: '#064653',
                    900: '#04343E',
                },

                // Secondary Color (Navy Blue)
                secondary: {
                    DEFAULT: '#16284F',
                    50: '#E8ECF3',
                    100: '#C4CCDC',
                    200: '#A0ACC5',
                    300: '#7C8CAE',
                    400: '#586C97',
                    500: '#16284F',      // Main - WCAG AA compliant
                    600: '#122142',
                    700: '#0E1A35',
                    800: '#0A1328',
                    900: '#060C1B',
                },

                // Accent Color (Mint Green)
                accent: {
                    DEFAULT: '#6EC9C4',
                    50: '#EDF9F8',
                    100: '#D1F0ED',
                    200: '#B5E7E2',
                    300: '#99DED7',
                    400: '#7DD5CC',
                    500: '#6EC9C4',      // Main
                    600: '#5EB4AF',
                    700: '#4E9F9A',      // WCAG AA compliant variant
                    800: '#3E8A85',
                    900: '#2E7570',
                },

                // Semantic Colors - WCAG AA Compliant
                success: {
                    DEFAULT: '#10B981',
                    50: '#ECFDF5',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                },
                error: {
                    DEFAULT: '#DC2626',
                    50: '#FEF2F2',
                    500: '#DC2626',
                    600: '#B91C1C',
                    700: '#991B1B',
                },
                warning: {
                    DEFAULT: '#D97706',
                    50: '#FFFBEB',
                    500: '#D97706',
                    600: '#B45309',
                    700: '#92400E',
                },
                info: {
                    DEFAULT: '#0C7C92',
                    50: '#F0F9FF',
                    500: '#0C7C92',
                    600: '#085868',
                    700: '#075985',
                },
            },

            fontFamily: {
                sans: ['Roboto', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                brand: ['Roboto', 'system-ui'],
                amharic: ['Ethiopic Sadiss', 'Noto Sans Ethiopic', 'system-ui'],
                mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
            },

            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.5' }],
                sm: ['0.875rem', { lineHeight: '1.5' }],
                base: ['1rem', { lineHeight: '1.5' }],
                lg: ['1.125rem', { lineHeight: '1.5' }],
                xl: ['1.25rem', { lineHeight: '1.5' }],
                '2xl': ['1.5rem', { lineHeight: '1.4' }],
                '3xl': ['1.875rem', { lineHeight: '1.3' }],
                '4xl': ['2.25rem', { lineHeight: '1.2' }],
                '5xl': ['3rem', { lineHeight: '1.1' }],
            },

            spacing: {
                18: '4.5rem',
                112: '28rem',
                128: '32rem',
            },

            borderRadius: {
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
}
