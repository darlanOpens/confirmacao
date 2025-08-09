/*
  Utilitários para consumir tokens do design.json com resolução de referências
  como {foundations.colors.primitives.red_600} e atalhos relativos
  como {colors.primitives.red_600}.
*/

import design from '../../design.json';

type AnyObject = Record<string, any>;

function isObject(value: unknown): value is AnyObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Tenta obter uma propriedade por caminho, considerando chaves com pontos (ex.: "bg.app").
function getBySmartPath(obj: AnyObject, path: string): any {
  const segments = path.split('.');
  let current: any = obj;
  let i = 0;

  while (i < segments.length) {
    if (!isObject(current)) return undefined;

    // Tenta achar a combinação mais longa possível juntando com ponto
    let found = false;
    let combined = '';
    for (let j = segments.length; j > i; j--) {
      combined = segments.slice(i, j).join('.');
      if (combined in current) {
        current = current[combined];
        i = j;
        found = true;
        break;
      }
    }

    if (!found) {
      return undefined;
    }
  }

  return current;
}

// Normaliza referências relativas para caminhos absolutos dentro de design.json
function normalizeRef(ref: string): string {
  const roots = [
    'meta',
    'foundations',
    'components',
    'layout',
    'motion',
    'patterns',
    'assets_policy',
    'implementation',
  ];

  const first = ref.split('.')[0];
  if (roots.includes(first)) return ref;

  // Mapear atalhos comuns para foundations
  const shortcutRoots: Record<string, string> = {
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

  if (first in shortcutRoots) {
    return `${shortcutRoots[first]}.${ref.split('.').slice(1).join('.')}`;
  }

  return ref; // fallback: usa como veio
}

// Resolve todas as ocorrências {path} dentro de uma string
export function resolveString(input: string): string {
  if (typeof input !== 'string') return input as unknown as string;
  const tokenRegex = /\{([^}]+)\}/g;
  let result = input;
  let guard = 0;

  // Evita loops infinitos com um limite razoável de substituições recursivas
  while (tokenRegex.test(result) && guard < 25) {
    guard++;
    result = result.replace(tokenRegex, (_, rawRef) => {
      const ref = normalizeRef(String(rawRef).trim());
      const value = getBySmartPath(design as AnyObject, ref);
      if (value == null) return '';
      if (typeof value === 'string') return resolveString(value);
      // Para valores não-string, tenta serializar (e.g., números)
      return String(value);
    });
  }

  return result;
}

export function getToken(path: string): any {
  const normalized = normalizeRef(path);
  const value = getBySmartPath(design as AnyObject, normalized);
  if (typeof value === 'string') return resolveString(value);
  return value;
}

// Tokens úteis já resolvidos para uso no app
export const tokens = {
  // Cores semânticas principais
  backgroundApp: getToken('foundations.colors.semantic.bg.app') as string,
  textPrimary: getToken('foundations.colors.semantic.text.primary') as string,
  textSecondary: getToken('foundations.colors.semantic.text.secondary') as string,
  textMuted: getToken('foundations.colors.semantic.text.muted') as string,
  borderDefault: getToken('foundations.colors.semantic.border.default') as string,
  borderGlass: getToken('foundations.colors.semantic.border.glass') as string,
  borderGlassStrong: getToken('foundations.colors.semantic.border.glass_strong') as string,

  // Primitivas
  red600: getToken('foundations.colors.primitives.red_600') as string,
  purple700: getToken('foundations.colors.primitives.purple_700') as string,
  white: getToken('foundations.colors.primitives.white') as string,
  black: getToken('foundations.colors.primitives.black') as string,

  // Gradientes
  primaryGradient: getToken('foundations.colors.gradients.primary_linear') as string,
  primaryHoverGradient: getToken('foundations.colors.gradients.primary_hover') as string,

  // Alpha úteis
  alphaWhite05: getToken('foundations.colors.alpha.white_05') as string,
  alphaWhite10: getToken('foundations.colors.alpha.white_10') as string,
  alphaWhite25: getToken('foundations.colors.alpha.white_25') as string,
  alphaWhite50: getToken('foundations.colors.alpha.white_50') as string,
  alphaWhite70: getToken('foundations.colors.alpha.white_70') as string,
  alphaWhite80: getToken('foundations.colors.alpha.white_80') as string,

  // Radii
  radii: {
    none: getToken('foundations.radii.none') as number,
    sm: getToken('foundations.radii.sm') as number,
    md: getToken('foundations.radii.md') as number,
    lg: getToken('foundations.radii.lg') as number,
    xl: getToken('foundations.radii.xl') as number,
    pill: getToken('foundations.radii.pill') as number,
    full: getToken('foundations.radii.full') as number,
  },

  // Blur e sombras
  blurBackdropMd: `${getToken('foundations.blur.backdrop.md')}px`,
  blurBackdropLg: `${getToken('foundations.blur.backdrop.lg')}px`,
  shadowGlassInnerWeak: getToken('foundations.shadows.glass.inner_weak') as string,
  focusRing: getToken('foundations.shadows.focus.ring') as string,

  // Sucesso
  success: {
    bg: getToken('foundations.colors.semantic.success.bg') as string,
    border: getToken('foundations.colors.semantic.success.border') as string,
    text: getToken('foundations.colors.semantic.success.text') as string,
  },
};

export default design;


