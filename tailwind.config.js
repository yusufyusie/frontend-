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
                // Ethiopian IT Park Brand Colors
                brand: {
                    navy: '#16284F',      // Navy Blue - Authority, headers, footers
                    teal: '#0C7C92',      // Teal Blue - PRIMARY brand color
                    mint: '#6EC9C4',      // Mint Green - Accents, highlights
                },
                primary: {
                    50: '#e6f7f9',
                    100: '#b3e7ed',
                    200: '#80d7e1',
                    300: '#4dc7d5',
                    400: '#1ab7c9',
                    500: '#0C7C92',      // Main brand color
                    600: '#0a6a7d',
                    700: '#085868',
                    800: '#064653',
                    900: '#04343e',
                    950: '#022229',
                },
                secondary: {
                    50: '#e8ecf3',
                    100: '#c4ccdc',
                    200: '#a0acc5',
                    300: '#7c8cae',
                    400: '#586c97',
                    500: '#16284F',      // Navy Blue
                    600: '#122142',
                    700: '#0e1a35',
                    800: '#0a1328',
                    900: '#060c1b',
                },
                accent: {
                    50: '#edf9f8',
                    100: '#d1f0ed',
                    200: '#b5e7e2',
                    300: '#99ded7',
                    400: '#7dd5cc',
                    500: '#6EC9C4',      // Mint Green
                    600: '#5eb4af',
                    700: '#4e9f9a',
                    800: '#3e8a85',
                    900: '#2e7570',
                },
            },
            fontFamily: {
                sans: ['Roboto', 'Inter', 'system-ui', 'sans-serif'],
                brand: ['Roboto', 'system-ui'],
                amharic: ['Ethiopic Sadiss', 'Noto Sans Ethiopic', 'system-ui'],
            },
        },
    },
    plugins: [],
}
