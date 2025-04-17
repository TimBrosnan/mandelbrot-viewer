export type ColorScheme = {
  name: string;
  getColor: (iteration: number, maxIterations: number) => { r: number; g: number; b: number };
};

export const colorSchemes: ColorScheme[] = [
  {
    name: "Primary & Secondary",
    getColor: (iteration, maxIterations) => {
      if (iteration === maxIterations) return { r: 0, g: 0, b: 0 };
      
      // Define the 6 base colors (3 primary + 3 secondary)
      const baseColors = [
        { r: 255, g: 0, b: 0 },     // Red (Primary)
        { r: 0, g: 255, b: 0 },     // Green (Primary)
        { r: 0, g: 0, b: 255 },     // Blue (Primary)
        { r: 255, g: 255, b: 0 },   // Yellow (Secondary)
        { r: 0, g: 255, b: 255 },   // Cyan (Secondary)
        { r: 255, g: 0, b: 255 }    // Magenta (Secondary)
      ];

      // Calculate which color and shade to use
      const normalizedIteration = iteration / maxIterations;
      const colorIndex = Math.floor(normalizedIteration * 6); // Which base color
      const shadeProgress = (normalizedIteration * 6) % 1; // Progress through shades
      const shadeIndex = Math.floor(shadeProgress * 4); // Which of the 4 shades

      const baseColor = baseColors[Math.min(colorIndex, 5)];
      const shadeFactor = [1, 0.75, 0.5, 0.25][shadeIndex]; // Four shades

      return {
        r: Math.floor(baseColor.r * shadeFactor),
        g: Math.floor(baseColor.g * shadeFactor),
        b: Math.floor(baseColor.b * shadeFactor)
      };
    }
  },
  {
    name: "Ocean",
    getColor: (iteration, maxIterations) => {
      if (iteration === maxIterations) return { r: 0, g: 0, b: 0 };
      
      const normalizedIteration = iteration / maxIterations;
      const hue = 180 + normalizedIteration * 180; // Blue to Green spectrum
      const saturation = 100;
      const lightness = 50;
      
      return hslToRgb(hue, saturation, lightness);
    }
  },
  {
    name: "Psychedelic",
    getColor: (iteration, maxIterations) => {
      if (iteration === maxIterations) return { r: 0, g: 0, b: 0 };
      
      const hue = (iteration * 20) % 360;
      const saturation = 100;
      const lightness = 50;
      
      return hslToRgb(hue, saturation, lightness);
    }
  }
];

function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
} 