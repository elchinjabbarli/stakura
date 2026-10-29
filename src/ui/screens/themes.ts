/** Themes screen — unlock (gems / achievement) and select visual themes. */
import { el, qs } from '../dom';
import { t } from '../i18n';
import { ICONS } from '../icons';
import { STORM_UNLOCK_HEIGHT, THEMES } from '../../game/themes';
import type { ScreenCtx } from '../types';
import { gemChip, panelHeader } from './shared';

function hsl(h: number, s: number, l: number): string {
  return `hsl(${((h % 360) + 360) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

function themeCard(ctx: ScreenCtx, id: string): HTMLElement {
  const theme = THEMES.find((x) => x.id === id)!;
  const unlocked = ctx.save.unlocked.includes(id);
  const selected = ctx.save.theme === id;
  const affordable = ctx.save.gems >= theme.cost;

  const p = theme.blocks;
  const strip = [0, 1, 2, 3, 4]
    .map((i) => {
      const h = p.hue0 + i * p.hueStep * 4;
      const s = p.sat + Math.sin(i * 0.35) * p.satAmp;
      const l = p.light + Math.sin(i * 0.22 + 1.7) * p.lightAmp;
      return `<i style="background:${hsl(h, s, l)}"></i>`;
    })
    .join('');

  const state = selected
    ? `<span class="theme-state active">${t('themes.selected')}</span>`
    : unlocked
      ? `<span class="theme-state">${ICONS.sparkle}</span>`
      : theme.cost < 0
        ? `<span class="theme-state special">${ICONS.trophy}<span>${t('themes.special', { n: STORM_UNLOCK_HEIGHT })}</span></span>`
        : affordable
          ? `<span class="theme-state cost">${ICONS.gem}<span>${t('themes.cost', { n: theme.cost })}</span></span>`
          : `<span class="theme-state cost dim">${ICONS.gem}<span>${t('themes.need', { n: theme.cost - ctx.save.gems })}</span></span>`;

  const card = el(`
    <button class="theme-card ui-block ${selected ? 'selected' : ''} ${unlocked ? '' : 'locked'}" type="button"
      style="--sw-top:${theme.sky.top};--sw-mid:${theme.sky.mid};--sw-bot:${theme.sky.bot}">
      <span class="theme-swatch">
        <span class="theme-strip">${strip}</span>
        <span class="theme-petals" style="color:${theme.petals.color}"></span>
      </span>
      <span class="theme-name">${t(theme.nameKey)}</span>
      ${state}
    </button>
  `);

  card.addEventListener('click', () => {
    ctx.audio.uiTick();
    if (unlocked) {
      ctx.game.selectTheme(id);
      ctx.haptics.ui();
      ctx.ui.show('themes');
      return;
    }
    if (theme.cost < 0) {
      ctx.haptics.ui();
      ctx.ui.toast.show(t('themes.special', { n: STORM_UNLOCK_HEIGHT }));
      return;
    }
    if (ctx.game.buyTheme(id)) {
      ctx.haptics.milestone();
      ctx.ui.toast.show(t('themes.unlocked'));
      ctx.ui.show('themes');
    } else {
      ctx.haptics.ui();
      ctx.ui.toast.show(t('themes.need', { n: theme.cost - ctx.save.gems }));
    }
  });
  return card;
}

export function createThemesScreen(ctx: ScreenCtx): HTMLElement {
  const node = el(`
    <div class="screen panel-screen">
      <div class="panel">
        <div class="panel-head-slot"></div>
        <div class="themes-grid"></div>
      </div>
    </div>
  `);
  const headSlot = qs(node, '.panel-head-slot');
  headSlot.appendChild(
    panelHeader('themes.title', () => ctx.ui.show('menu'), gemChip(ctx.save.gems)),
  );
  const grid = qs(node, '.themes-grid');
  for (const theme of THEMES) grid.appendChild(themeCard(ctx, theme.id));
  return node;
}
