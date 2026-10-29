/** Pause screen — resume / restart / home. */
import { el, qs } from '../dom';
import { t } from '../i18n';
import { ICONS } from '../icons';
import type { ScreenCtx } from '../types';

export function createPauseScreen(ctx: ScreenCtx): HTMLElement {
  const node = el(`
    <div class="screen pause-screen">
      <div class="panel pause-panel">
        <h2 class="pause-title">${ICONS.pause}<span>${t('pause.title')}</span></h2>
        <button class="btn btn-primary ui-block" type="button" data-action="resume">${t('pause.resume')}</button>
        <button class="btn btn-ghost ui-block" type="button" data-action="restart">${t('pause.restart')}</button>
        <button class="btn btn-ghost ui-block" type="button" data-action="home">${t('pause.home')}</button>
      </div>
    </div>
  `);
  qs(node, '[data-action="resume"]').addEventListener('click', () => {
    ctx.audio.uiTick();
    ctx.game.resume();
  });
  qs(node, '[data-action="restart"]').addEventListener('click', () => {
    ctx.audio.uiTick();
    ctx.game.restart();
  });
  qs(node, '[data-action="home"]').addEventListener('click', () => {
    ctx.audio.uiTick();
    ctx.game.toMenu();
  });
  return node;
}
