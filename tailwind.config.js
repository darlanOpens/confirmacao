/** @type {import('tailwindcss').Config} */

const design = require('./design.json');

function isObject(v) { return typeof v === 'object' && v !== null && !Array.isArray(v); }

function getBySmartPath(obj, path) {
  const segments = path.split('.');
  let current = obj;
  let i = 0;
  while (i < segments.length) {
    if (!isObject(current)) return undefined;
    let found = false;
    for (let j = segments.length; j > i; j--) {
      const combined = segments.slice(i, j).join('.');
      if (Object.prototype.hasOwnProperty.call(current, combined)) {
        current = current[combined];
        i = j;
        found = true;
        break;
      }
    }
    if (!found) return undefined;
  }
  return current;
}

function normalizeRef(ref) {
  const roots = ['meta','foundations','components','layout','motion','patterns','assets_policy','implementation'];
  const first = ref.split('.')[0];
  if (roots.includes(first)) return ref;
  const shortcutRoots = {
    colors: 'foundations.colors',
    typography: 'foundations.typography',
    spacing: 'foundations.spacing',
    radii: 'foundations.radii',
    borders: 'foundations.borders',
    shadows: 'foundations.shadows',
    blur: 'foundations.blur',
    breakpoints: 'foundations.breakpoints',
    z_index: 'foundations.z_index',
  };
  if (shortcutRoots[first]) {
    return `${shortcutRoots[first]}.${ref.split('.').slice(1).join('.')}`;
  }
  return ref;
}

function resolveString(input) {
  if (typeof input !== 'string') return input;
  const tokenRegex = /\{([^}]+)\}/g;
  let result = input;
  let guard = 0;
  while (tokenRegex.test(result) && guard < 25) {
    guard++;
    result = result.replace(tokenRegex, (_, rawRef) => {
      const ref = normalizeRef(String(rawRef).trim());
      const value = getBySmartPath(design, ref);
      if (value == null) return '';
      if (typeof value === 'string') return resolveString(value);
      return String(value);
    });
  }
  return result;
}

const extend = design.implementation?.tailwind?.extend || {};

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  important: true,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        ...(extend.fontFamily || {}),
        butler: ['var(--font-butler)', 'Butler', 'serif'],
        'work-sans': ['Work Sans', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        'helvetica-neue': ['Helvetica Neue', 'sans-serif'],
      },
      colors: Object.fromEntries(
        Object.entries(extend.colors || {}).map(([k, v]) => [k, resolveString(v)])
      ),
      backgroundImage: Object.fromEntries(
        Object.entries(extend.backgroundImage || {}).map(([k, v]) => [k, resolveString(v)])
      ),
    },
  },
  plugins: [],
};