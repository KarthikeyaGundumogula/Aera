export const THEATRE_FORMATS = {
  // Video / Edit Formats
  IMAX: {
    label: "IMAX Experience",
    sub: "16:9 Cinematic",
    ratio: 1.77,
  },
  ACADEMY: {
    label: "Academy Standard",
    sub: "4:3 Classic",
    ratio: 1.33,
  },
  VERTICAL_VIDEO: {
    label: "Vertical Reel",
    sub: "9:16 Vision",
    ratio: 0.56,
  },
  SQUARE_VIDEO: {
    label: "Social Square",
    sub: "1:1 Ratio",
    ratio: 1.0,
  },
  
  // Static / Poster Formats
  STANDARD_POSTER: {
    label: "Standard Poster",
    sub: "2:3 Portrait",
    ratio: 0.66,
  },
  SQUARE_POSTER: {
    label: "Square Gallery",
    sub: "1:1 Ratio",
    ratio: 1.0,
  },
  VERTICAL_POSTER: {
    label: "Digital Vertical",
    sub: "9:16 Mobile",
    ratio: 0.56,
  }
} as const;
