import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with clsx.
 * @param {...string} inputs - Class names to merge.
 * @returns {string} - Merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a Hex color to HSL format (h s% l%) for CSS variables.
 * @param {string} hex - The hex color (e.g., "#ffffff").
 * @returns {string} - HSL string (e.g., "0 0% 100%").
 */
export const hexToHsl = (hex) => {
  let c = hex.substring(1).split('');
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  c = '0x' + c.join('');
  
  let r = (c >> 16) & 255;
  let g = (c >> 8) & 255;
  let b = c & 255;
  
  r /= 255; g /= 255; b /= 255;
  
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
};

/**
 * Converts a Hex color to RGBA format.
 * @param {string} hex - The hex color.
 * @param {number} alpha - Alpha value (0-1).
 * @returns {string} - RGBA string (e.g., "rgba(255, 255, 255, 0.5)").
 */
export const hexToRgba = (hex, alpha) => {
  let c = hex.substring(1).split('');
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  c = '0x' + c.join('');
  return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${alpha})`;
};
