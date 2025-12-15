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
                "primary": "#f09942", // Updated to match new design
                "primary-hover": "#e08830",
                "secondary": "#9a734c",
                "background-light": "#fcfaf8",
                "background-dark": "#221910", // Updated
                "card-light": "#ffffff",
                "card-dark": "#2a221b",
                "border-light": "#e7dbcf",
                "border-dark": "#44392f",
                "text-main": "#1b140d",
                "text-muted": "#9a734c",
                // Dashboard specific colors
                "secondary-bg": "#fcfaf8",
                "border-subtle": "#efece8",
                "accent-orange": "#FFF0E0",
                "dashboard-muted": "#8c8075",
                "primary-light": "#fbdcb8", // Updated
                "text-dark": "#1b140d", // Keep for backward compatibility
                "border-color": "#f3ede7", // Keep for backward compatibility
                orange: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f09942', // Updated Primary Brand Color
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                    950: '#431407',
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Lexend', 'sans-serif'], // Updated to Lexend
                body: ['Noto Sans', 'sans-serif'], // Added Noto Sans
            },
            borderRadius: {
                "lg": "2rem",
                "xl": "3rem",
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
                'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.08)',
                'glow': '0 0 20px rgba(255, 122, 0, 0.3)',
                'neon': '0 0 20px rgba(255, 122, 0, 0.4), 0 0 40px rgba(255, 122, 0, 0.2)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.2s ease-out forwards',
                'shimmer': 'shimmer 2s linear infinite',
                'spotlight': 'spotlight 2s ease .75s 1 forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    from: { backgroundPosition: '0 0' },
                    to: { backgroundPosition: '-200% 0' },
                },
                spotlight: {
                    '0%': { opacity: 0, transform: 'translate(-72%, -62%) scale(0.5)' },
                    '100%': { opacity: 1, transform: 'translate(-50%,-40%) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
