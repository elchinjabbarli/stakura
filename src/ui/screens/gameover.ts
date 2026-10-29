/** Game-over screen — height reached, best, gems earned, retry/home/share. */
import { el, qs } from '../dom';
import { t } from '../i18n';
import { ICONS } from '../icons';
import type { GameOverData, ScreenCtx } from '../types';

export function createGameOverScreen(ctx: ScreenCtx, data: GameOverData): HTMLElement {
  const node = el(`
    <div class="screen gameover-screen">
      <div class="panel gameover-panel">
        <h2 class="gameover-title">${t('over.title')}</h2>
        ${
          data.isRecord
            ? `<div class="new-best-badge">${ICONS.trophy}<span>${t('over.newBest')}</span></div>`
            : ''
        }
        <div class="gameover-height">
          <span class="gameover-height-n">${data.height}</span><span class="gameover-height-u">m</span>
        </div>
        <div class="gameover-sub">${t('over.stacked', { n: data.height })}</div>
        <div class="gameover-stats">
          <div class="gameover-stat">
            <span class="gameover-stat-label">${t('over.best')}</span>
            <span class="gameover-stat-value">${data.best}m</span>
          </div>
          <div class="gameover-stat">
            <span class="gameover-stat-label">${ICONS.gem}<span class="sr-only">gems</span></span>
            <span class="gameover-stat-value">${t('over.gems', { n: data.gems })}</span>
          </div>
        </div>
        <button class="btn btn-primary ui-block" type="button" data-action="retry">${t('over.tryAgain')}</button>
        <div class="btn-row">
          <button class="btn btn-ghost ui-block" type="button" data-action="home">${t('over.home')}</button>
          <button class="btn btn-ghost btn-icon ui-block" type="button" data-action="share" aria-label="${t('over.share')}">${ICONS.share}</button>
        </div>
      </div>
    </div>
  `);

  qs(node, '[data-action="retry"]').addEventListener('click', () => {
    ctx.audio.uiTick();
    ctx.game.restart();
  });
  qs(node, '[data-action="home"]').addEventListener('click', () => {
    ctx.audio.uiTick();
    ctx.game.toMenu();
  });
  qs(node, '[data-action="share"]').addEventListener('click', async () => {
    ctx.audio.uiTick();
    const text = t('over.shareText', { n: data.height });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Stakura', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      ctx.ui.toast.show(t('toast.copied'));
    } catch {
      /* user cancelled — fine */
    }
  });
  return node;
}
