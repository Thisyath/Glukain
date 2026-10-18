/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#4338CA',
        },
        accent: {
          500: '#5B5FEF',
        },
        violet: {
          600: '#702DE1',
        },
        sky: {
          300: '#91BDF4',
        },
        surface: {
          50: '#F3F5FC',
        },
        success: {
          600: '#16A34A',
          100: '#DCFCE7',
        },
        warning: {
          500: '#F5B301',
          100: '#FEF3C7',
        },
        danger: {
          600: '#DC2626',
          100: '#FEE2E2',
        },
        neutral: {
          900: '#1E1B4B',
          500: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        control: '12px',
        button: '12px',
        input: '12px',
        pill: '9999px',
        md: '8px',
        '32': '32px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(67, 56, 202, 0.08)',
        modal: '0 12px 32px rgba(30, 27, 75, 0.18)',
      },
    },
  },
  plugins: [],
}
