/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#0A0F1E',
                    secondary: '#0D1B40',
                    card: '#111827',
                    cardHover: '#1a2540',
                },
                accent: {
                    saffron: '#FF6B35',
                    gold: '#F7C948',
                    cyan: '#00D4FF',
                    green: '#00FF88',
                },
                text: {
                    primary: '#F5F5F5',
                    muted: '#94A3B8',
                    dark: '#1A1A2E',
                },
            },
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'spin-slow': 'spin 20s linear infinite',
                'morphText': 'morphText 0.5s ease-in-out',
                'wave': 'wave 8s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(255,107,53,0.5)' },
                    '50%': { boxShadow: '0 0 30px rgba(255,107,53,0.9), 0 0 60px rgba(247,201,72,0.5)' },
                },
                wave: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(-50px)' },
                },
            },
            backgroundImage: {
                'saffron-gold': 'linear-gradient(135deg, #FF6B35, #F7C948)',
                'dark-radial': 'radial-gradient(ellipse at center, #0D1B40 0%, #0A0F1E 100%)',
                'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            },
        },
    },
    plugins: [],
}
