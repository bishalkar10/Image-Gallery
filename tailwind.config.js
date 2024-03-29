/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],

  theme: {
    fontFamily: {
      BreeSerif: ["Bree Serif", "serif"],
      BrunoAceSC: ["Bruno Ace SC", "cursive"],
      Roboto: ["Roboto", "sans serif"],
    },
    extend: {
      keyframes: {
        logo: {
          "0%": { opacity: "0", transform: "translateY(-100%)" },
          "70%": { opacity: "0" },

          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        welcomeTo: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        to: "welcomeTo 2.5s linear",
        "welcome-to": "welcomeTo 2s linear",
        "logo-animation": "logo 5s linear -2s",
      },
    },
  },
  plugins: [],
};
