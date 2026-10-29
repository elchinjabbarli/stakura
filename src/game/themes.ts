/**
 * Theme definitions — every visual parameter of a run.
 * All art is procedural (no external assets): colors, petals, sky, fog.
 * A theme is pure data; the render layer interprets it.
 */

export interface SkyDef {
  top: string;
  mid: string;
  bot: string;
  sun: string;
  /** Direction TO the sun (x, y, z), need not be normalized. */
  sunDir: [number, number, number];
  /** 0 = daylight, 1 = night (enables stars). */
  dark: number;
}

export interface BlocksPalette {
  hue0: number;
  hueStep: number;
  sat: number;
  satAmp: number;
  light: number;
  lightAmp: number;
}

export interface ThemeDef {
  id: string;
  /** i18n key. */
  nameKey: string;
  /** Gem cost. 0 = default, -1 = earned via achievement. */
  cost: number;
  sky: SkyDef;
  fog: string;
  blocks: BlocksPalette;
  petals: { color: string; opacity: number; count: number };
  accent: string;
  accent2: string;
  ridges: [string, string];
}

export const THEMES: readonly ThemeDef[] = [
  {
    id: 'dusk',
    nameKey: 'theme.dusk',
    cost: 0,
    sky: { top: '#2b1030', mid: '#93415f', bot: '#eda05f', sun: '#ffd2a0', sunDir: [-0.45, 0.22, 0.87], dark: 0.12 },
    fog: '#c8847c',
    blocks: { hue0: 335, hueStep: 5.5, sat: 0.5, satAmp: 0.06, light: 0.62, lightAmp: 0.05 },
    petals: { color: '#f7b8cb', opacity: 0.85, count: 160 },
    accent: '#f2a25c',
    accent2: '#ef92ac',
    ridges: ['#8a4f62', '#63374b'],
  },
  {
    id: 'matcha',
    nameKey: 'theme.matcha',
    cost: 40,
    sky: { top: '#242d1e', mid: '#7d8f5e', bot: '#e4d9b0', sun: '#fff2c8', sunDir: [-0.4, 0.3, 0.85], dark: 0.1 },
    fog: '#a9a97e',
    blocks: { hue0: 95, hueStep: 4.5, sat: 0.38, satAmp: 0.05, light: 0.6, lightAmp: 0.05 },
    petals: { color: '#f1ecd2', opacity: 0.8, count: 120 },
    accent: '#c9c46a',
    accent2: '#9fae6f',
    ridges: ['#5c6a4a', '#3e4a33'],
  },
  {
    id: 'coral',
    nameKey: 'theme.coral',
    cost: 60,
    sky: { top: '#33161c', mid: '#c65f63', bot: '#ffd2a8', sun: '#ffe6c4', sunDir: [-0.5, 0.2, 0.84], dark: 0.08 },
    fog: '#d99a93',
    blocks: { hue0: 8, hueStep: 5, sat: 0.58, satAmp: 0.05, light: 0.64, lightAmp: 0.04 },
    petals: { color: '#ffd7c4', opacity: 0.85, count: 150 },
    accent: '#ff9d7a',
    accent2: '#ff7f8e',
    ridges: ['#a05a5e', '#713a44'],
  },
  {
    id: 'honey',
    nameKey: 'theme.honey',
    cost: 80,
    sky: { top: '#2e2110', mid: '#b98a3e', bot: '#ffe1a3', sun: '#fff3d0', sunDir: [-0.35, 0.28, 0.89], dark: 0.1 },
    fog: '#d3b183',
    blocks: { hue0: 40, hueStep: 4.5, sat: 0.55, satAmp: 0.06, light: 0.63, lightAmp: 0.04 },
    petals: { color: '#ffe9b8', opacity: 0.85, count: 130 },
    accent: '#eebf6f',
    accent2: '#d9a054',
    ridges: ['#8a6a3a', '#5c4626'],
  },
  {
    id: 'ember',
    nameKey: 'theme.ember',
    cost: 110,
    sky: { top: '#1f0d0d', mid: '#8f2f2a', bot: '#ff9d5c', sun: '#ffcf9e', sunDir: [-0.42, 0.18, 0.89], dark: 0.3 },
    fog: '#b06a4e',
    blocks: { hue0: 16, hueStep: 6, sat: 0.6, satAmp: 0.05, light: 0.55, lightAmp: 0.06 },
    petals: { color: '#ffb497', opacity: 0.9, count: 170 },
    accent: '#ff8c5a',
    accent2: '#e86a4a',
    ridges: ['#6e2f28', '#47201c'],
  },
  {
    id: 'plum',
    nameKey: 'theme.plum',
    cost: 140,
    sky: { top: '#220f2e', mid: '#7e3a77', bot: '#e79ac2', sun: '#ffd9ef', sunDir: [-0.4, 0.22, 0.87], dark: 0.25 },
    fog: '#b983a8',
    blocks: { hue0: 290, hueStep: 5, sat: 0.5, satAmp: 0.06, light: 0.6, lightAmp: 0.05 },
    petals: { color: '#f0c4e8', opacity: 0.85, count: 150 },
    accent: '#d98fc9',
    accent2: '#b36ac2',
    ridges: ['#6a3a63', '#45243f'],
  },
  {
    id: 'jade',
    nameKey: 'theme.jade',
    cost: 170,
    sky: { top: '#0e211c', mid: '#2f7a63', bot: '#a8d8b8', sun: '#eaffe0', sunDir: [-0.38, 0.3, 0.87], dark: 0.3 },
    fog: '#7fae95',
    blocks: { hue0: 155, hueStep: 4.5, sat: 0.42, satAmp: 0.06, light: 0.58, lightAmp: 0.05 },
    petals: { color: '#d7f0dd', opacity: 0.8, count: 140 },
    accent: '#8fd9ae',
    accent2: '#5cb98a',
    ridges: ['#2f5c4c', '#1d3a30'],
  },
  {
    id: 'midnight',
    nameKey: 'theme.midnight',
    cost: 210,
    sky: { top: '#0b0812', mid: '#2e1c33', bot: '#6e4a4f', sun: '#ffcf8e', sunDir: [-0.3, 0.1, 0.95], dark: 0.9 },
    fog: '#3a2a34',
    blocks: { hue0: 38, hueStep: 6.5, sat: 0.5, satAmp: 0.06, light: 0.5, lightAmp: 0.06 },
    petals: { color: '#ffd98e', opacity: 0.9, count: 120 },
    accent: '#e8b45a',
    accent2: '#c98a4e',
    ridges: ['#241a26', '#141014'],
  },
  {
    id: 'prism',
    nameKey: 'theme.prism',
    cost: 260,
    sky: { top: '#101014', mid: '#3a3a44', bot: '#8a8a96', sun: '#ffffff', sunDir: [-0.3, 0.35, 0.89], dark: 0.7 },
    fog: '#55555f',
    blocks: { hue0: 0, hueStep: 14, sat: 0.6, satAmp: 0.08, light: 0.58, lightAmp: 0.06 },
    petals: { color: '#ffffff', opacity: 0.7, count: 180 },
    accent: '#f0f0f5',
    accent2: '#d0d0dc',
    ridges: ['#26262e', '#181820'],
  },
  {
    id: 'storm',
    nameKey: 'theme.storm',
    cost: -1,
    sky: { top: '#26101f', mid: '#a3446a', bot: '#f4a0b5', sun: '#ffd9e6', sunDir: [-0.45, 0.2, 0.87], dark: 0.2 },
    fog: '#d17a99',
    blocks: { hue0: 340, hueStep: 7, sat: 0.62, satAmp: 0.06, light: 0.6, lightAmp: 0.05 },
    petals: { color: '#fbc3d5', opacity: 0.95, count: 260 },
    accent: '#ff8fae',
    accent2: '#ff6f92',
    ridges: ['#8a3f5c', '#5a2840'],
  },
];

export const DEFAULT_THEME_ID = 'dusk';

/** Height (m) in a single run that unlocks the special "storm" theme. */
export const STORM_UNLOCK_HEIGHT = 150;

export function themeById(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
