/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        brand: {
          50:'#fdf3f2', 100:'#fbe3e1', 200:'#f7c6c2', 300:'#f09b94',
          400:'#e56458', 500:'#d62b1f', 600:'#b81f16', 700:'#971a13',
          800:'#7c1913', 900:'#661a16', 950:'#380a07',
        },
        ink:   { 900:'#140d0c', 800:'#1e1413', 700:'#2c1e1c', 600:'#3d2c29' },
        signal:{ ok:'#12a06a', warn:'#c47a0a', crit:'#8f1d1d' },
      },
      fontFamily: {
        sans: ['Inter var','Inter','Segoe UI','system-ui','sans-serif'],
        display: ['Sora','Inter','Segoe UI','system-ui','sans-serif'],
        mono: ['JetBrains Mono','IBM Plex Mono','ui-monospace','monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,13,12,.06), 0 8px 24px -12px rgba(20,13,12,.15)',
        lift: '0 2px 4px rgba(20,13,12,.07), 0 18px 44px -18px rgba(214,43,31,.40)',
        glow: '0 0 0 1px rgba(214,43,31,.20), 0 12px 40px -12px rgba(214,43,31,.45)',
      },
      backgroundImage: {
        'grid-light': "linear-gradient(rgba(214,43,31,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(214,43,31,.07) 1px, transparent 1px)",
        'grid-dark': "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
      },
      keyframes: {
        float:   { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-10px)'} },
        pulseRing:{ '0%':{transform:'scale(.85)',opacity:'.7'}, '80%,100%':{transform:'scale(1.6)',opacity:'0'} },
        marquee: { from:{transform:'translateX(0)'}, to:{transform:'translateX(-50%)'} },
        shimmer: { '100%':{transform:'translateX(100%)'} },
        dash:    { to:{ strokeDashoffset:'-1000' } },
      },
      animation: {
        float:'float 6s ease-in-out infinite',
        pulseRing:'pulseRing 2.4s cubic-bezier(.25,.8,.25,1) infinite',
        marquee:'marquee 38s linear infinite',
        shimmer:'shimmer 2.2s infinite',
        dash:'dash 14s linear infinite',
      },
    },
  },
  plugins: [],
};
