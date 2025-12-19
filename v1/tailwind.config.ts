import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./services/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Noto Sans TC"', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    900: '#0c4a6e',
                }
            },
            animation: {
                flow: 'flow 1s linear infinite',
            },
            keyframes: {
                flow: {
                    from: { strokeDashoffset: '24' },
                    to: { strokeDashoffset: '0' },
                }
            }
        },
    },
    plugins: [],
} satisfies Config
