
const API_KEY = import.meta.env.VITE_GOOG_FONT_API_KEY;
const BASE_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

let fontsCache = null;

/**
 * Fetch all Google Fonts (cached in memory).
 * @returns {Promise<Array>} List of font objects.
 */
export async function getAllFonts() {
  if (fontsCache) return fontsCache;

  if (!API_KEY) {
    console.error("Google Fonts API Key is missing!");
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}&sort=popularity`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fonts: ${response.status}`);
    }
    const data = await response.json();
    fontsCache = data.items || [];
    return fontsCache;
  } catch (error) {
    console.error("Error fetching fonts:", error);
    return [];
  }
}

/**
 * Get paginated fonts with search.
 * @param {number} page - Current page (1-based).
 * @param {number} limit - Items per page.
 * @param {string} query - Search query.
 * @returns {Promise<{ items: Array, total: number, hasMore: boolean }>}
 */
export async function getFonts({ page = 1, limit = 6, query = '' }) {
  const allFonts = await getAllFonts();
  
  let filtered = allFonts;
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = allFonts.filter(font => font.family.toLowerCase().includes(lowerQuery));
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = filtered.slice(start, end);
  
  return {
    items,
    total,
    hasMore: end < total
  };
}

/**
 * Construct the Google Fonts CSS URL for a list of families.
 * @param {Array<string>} families - List of font family names.
 * @returns {string} CSS URL.
 */
export function getGoogleFontsUrl(families) {
  if (!families || families.length === 0) return '';
  
  // Format: family=Roboto:ital,wght@0,100;0,300...&family=Open+Sans...
  // For simplicity, we'll request regular (400) and bold (700) for now.
  const formattedFamilies = families.map(f => {
    const name = f.replace(/ /g, '+');
    return `family=${name}:wght@400;700`;
  }).join('&');

  return `https://fonts.googleapis.com/css2?${formattedFamilies}&display=swap`;
}

/**
 * Inject a font stylesheet into the document head.
 * @param {string} family - Font family name.
 */
export function loadFont(family) {
  if (!family) return;
  const linkId = `font-${family.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(linkId)) return; // Already loaded

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = getGoogleFontsUrl([family]);
  document.head.appendChild(link);
}
