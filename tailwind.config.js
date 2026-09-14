/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF7',
        ink: {
          DEFAULT: '#161A23',
          soft: '#3A4152',
          faint: '#7C8394',
        },
        line: '#E7E5DD',
        panel: '#FFFFFF',
        dark: {
          bg: '#10131A',
          panel: '#181C25',
          line: '#2A2F3B',
          ink: '#F3F1E9',
          soft: '#C7CBD6',
          faint: '#8B90A2',
        },
        teal: {
          50: '#EAF6F2',
          100: '#CFEBE1',
          400: '#2E9C7C',
          500: '#1F8A70',
          600: '#186B58',
        },
        amber: {
          50: '#FCF3E3',
          100: '#F7E2B8',
          400: '#E2A73E',
          500: '#CE8F22',
          600: '#A8721A',
        },
        rose: {
          50: '#FBEAEA',
          400: '#D0605A',
          500: '#B94B45',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        bento: '22px',
        chip: '10px',
      },
      boxShadow: {
        bento: '0 1px 2px rgba(22,26,35,0.04), 0 8px 24px -12px rgba(22,26,35,0.10)',
        bentoHover: '0 1px 2px rgba(22,26,35,0.06), 0 16px 32px -12px rgba(22,26,35,0.16)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
