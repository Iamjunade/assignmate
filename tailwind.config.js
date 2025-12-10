/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium Glass Palette
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                    400: 'rgba(255, 255, 255, 0.4)',
                    500: 'rgba(255, 255, 255, 0.5)',
                    600: 'rgba(255, 255, 255, 0.6)',
                    700: 'rgba(255, 255, 255, 0.7)',
                    800: 'rgba(255, 255, 255, 0.8)',
                    900: 'rgba(255, 255, 255, 0.9)',
                },
                // Dark Glass Palette
                'glass-dark': {
                    100: 'rgba(0, 0, 0, 0.1)',
                    200: 'rgba(0, 0, 0, 0.2)',
                    300: 'rgba(0, 0, 0, 0.3)',
                    400: 'rgba(0, 0, 0, 0.4)',
                    500: 'rgba(0, 0, 0, 0.5)',
                    600: 'rgba(0, 0, 0, 0.6)',
                    700: 'rgba(0, 0, 0, 0.7)',
                    800: 'rgba(0, 0, 0, 0.8)',
                    900: 'rgba(0, 0, 0, 0.9)',
                },
                orange: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                    950: '#431407',
                },
                slate: {
                    850: '#1e293b', // Custom dark shade
                    950: '#020617', // Deepest slate
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.05)',
                'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
                'neon': '0 0 10px rgba(249, 115, 22, 0.5), 0 0 20px rgba(249, 115, 22, 0.3)',
            },
            backgroundImage: {
                'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                'gradient-glass-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05))',
            }
        },
    },
    plugins: [],
}
