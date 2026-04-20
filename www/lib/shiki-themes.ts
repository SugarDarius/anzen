/**
 * Dual Shiki themes for MDX (`source.config.ts`) and client `DynamicCodeBlock`.
 * Vesper is used for dark mode; light stays on GitHub Light for contrast on light backgrounds.
 */
export const SHIKI_DUAL_THEMES = {
  light: 'github-light',
  dark: 'vesper',
} as const
