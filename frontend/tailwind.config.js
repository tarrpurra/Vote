/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixle:['Pixelify Sans','sans-serif'],
      },

      backgroundImage: {
        'portal-back': "url('src/assets/Voting.png')",
        'portal-front': "url('src/assets/creation.png')",
        'logo-main':"url('src/assets/logo.png')"



      },
      keyframes:{
        rotate:{
          "0%":{transform:"rotate(0deg)"},
          "100%":{transform:"rotate(180deg)"}
        },
      },
      animation:{
        'spin-slow':'rotate 3s linear infinite'
      }
    },
  },
  plugins: [],
}

