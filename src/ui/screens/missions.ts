/** Missions screen — daily seeded missions with progress + claim. */
import { el, qs } from '../dom';
import { t } from '../i18n';
import { ICONS } from '../icons';
import type { ScreenCtx } from '../types';
import { gemChip, panelHeader } from './shared';

export function createMissionsScreen(ctx: ScreenCtx): HTMLElement {
  ctx.missions.ensureDaily();
  const node = el(`
    <div class="screen panel-screen">
      <div class="panel">
        <div class="panel-head-slot"></div>
        <div class="missions-list"></div>
        <div class="missions-foot">${ICONS.moon}<span>${t('missions.reset')}</span></div>
      </div>
    </div>
  `);
  const headSlot = qs(node, '.panel-head-slot');
  headSlot.appendChild(
    panelHeader('missions.title', () => ctx.ui.show('menu'), gemChip(ctx.save.gems)),
  );

  const list = qs(node, '.missions-list');
  const items = ctx.missions.view();

  for (const m of items) {
    const pct = Math.round((m.progress / m.target) * 100);
    const card = el(`
      <div class="mission-card ${m.done ? 'done' : ''}">
        <div class="mission-title">${t(m.titleKey, { n: m.target })}</div>
        <div class="mission-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${m.target}" aria-valuenow="${m.progress}">
          <div class="mission-fill" style="width:${pct}%"></div>
        </div>
        <div class="mission-foot">
          <span class="mission-progress">${m.progress}/${m.target}</span>
          ${
            m.claimed
              ? `<span class="mission-claimed">${ICONS.trophy}<span>${t('missions.claimed')}</span></span>`
              : m.done
                ? `<button class="btn btn-small btn-primary ui-block" type="button">${t('missions.claim', { n: m.reward })}</button>`
                : `<span class="mission-reward">${ICONS.gem}<span>${m.reward}</span></span>`
          }
        </div>
      </div>
    `);
    const claimBtn = card.querySelector<HTMLButtonElement>('.btn-small');
    claimBtn?.addEventListener('click', () => {
      const gained = ctx.missions.claim(m.id);
      if (gained > 0) {
        ctx.haptics.milestone();
        ctx.audio.milestone();
        ctx.ui.toast.show(t('toast.claimed', { n: gained }));
        ctx.ui.show('missions');
      }
    });
    list.appendChild(card);
  }
  return node;
}
