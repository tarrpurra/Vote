/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'portal-back': "url('src/assets/portal.webp')",
        'custom-gradient': 'linear-gradient(0deg, rgba(4,106,56,1) 0%, rgba(255,255,255,1) 49%, rgba(255,103,31,1) 100%)',
        'Charkra':"url('src/assets/Ashoka_Chakra.svg.png')",
        'partyA':"url('src/assets/PartyA.webp')",
        'partyB':"url('src/assets/PartyB.webp')",
        'partyC':"url('src/assets/PartyC.webp')"


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

