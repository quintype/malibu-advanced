const FONTS = Object.freeze({
  "title-font": { value: "Roboto Serif, sans-serif", fallback: "sans-serif" },
  "content-font": { value: "Montserrat, sans-serif", fallback: "sans-serif" },
});

export default {
  preloadFonts: [
    { fontName: "Roboto Serif", data: { weight: 400 } },
    { fontName: "Roboto Serif", data: { weight: 600 } },
    { fontName: "Montserrat", data: { weight: 400 } },
    { fontName: "Montserrat", data: { weight: 700 } },
  ],
  fontSettings: FONTS,
};
