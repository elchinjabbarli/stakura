/** Settings screen — sound, haptics, graphics quality, language, reset. */
import { el, qs } from '../dom';
import { t } from '../i18n';
import { LANGS } from '../i18n';
import { ICONS } from '../icons';
import { VERSION } from '../../game/constants';
import type { Quality } from '../../game/types';
import type { ScreenCtx } from '../types';
import { panelHeader } from './shared';

function switchRow(icon: string, label: string, checked: boolean, onChange: (v: boolean) => void): HTMLElement {
  const row = el(`
    <div class="settings-row">
      <span class="settings-icon">${icon}</span>
      <span class="settings-label">${label}</span>
      <button class="switch ui-block ${checked ? 'on' : ''}" type="button" role="switch" aria-checked="${checked}" aria-label="${label}">
        <span class="switch-knob"></span>
      </button>
    </div>
  `);
  const sw = qs(row, '.switch');
  sw.addEventListener('click', () => {
    const on = !sw.classList.contains('on');
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-checked', String(on));
    onChange(on);
  });
  return row;
}

function segmentRow<T extends string>(
  icon: string,
  label: string,
  options: { value: T; label: string }[],
  value: T,
  onChange: (v: T) => void,
): HTMLElement {
  const row = el(`
    <div class="settings-row settings-row-col">
      <div class="settings-row-head">
        <span class="settings-icon">${icon}</span>
        <span class="settings-label">${label}</span>
      </div>
      <div class="segmented" role="radiogroup" aria-label="${label}">
        ${options
          .map(
            (o) =>
              `<button class="seg-btn ui-block ${o.value === value ? 'active' : ''}" type="button" role="radio" aria-checked="${o.value === value}" data-value="${o.value}">${o.label}</button>`,
          )
          .join('')}
      </div>
    </div>
  `);
  for (const btn of row.querySelectorAll<HTMLButtonElement>('.seg-btn')) {
    btn.addEventListener('click', () => {
      onChange(btn.dataset.value as T);
    });
  }
  return row;
}

export function createSettingsScreen(ctx: ScreenCtx): HTMLElement {
  const node = el(`
    <div class="screen panel-screen">
      <div class="panel">
        <div class="panel-head-slot"></div>
        <div class="settings-list"></div>
        <div class="settings-about">${t('settings.version', { v: VERSION })}</div>
      </div>
    </div>
  `);
  const headSlot = qs(node, '.panel-head-slot');
  headSlot.appendChild(panelHeader('settings.title', () => ctx.ui.show('menu')));

  const list = qs(node, '.settings-list');

  list.appendChild(
    switchRow(ICONS.sound, t('settings.sound'), ctx.save.settings.sound, (v) => {
      ctx.game.setSetting('sound', v);
      ctx.audio.setMuted(!v);
      if (v) ctx.audio.uiTick();
    }),
  );
  list.appendChild(
    switchRow(ICONS.vibe, t('settings.haptics'), ctx.save.settings.haptics, (v) => {
      ctx.game.setSetting('haptics', v);
      ctx.haptics.setEnabled(v);
    }),
  );
  list.appendChild(
    segmentRow<Quality>(
      ICONS.sparkle,
      t('settings.quality'),
      [
        { value: 'auto', label: t('settings.qualityAuto') },
        { value: 'high', label: t('settings.qualityHigh') },
        { value: 'eco', label: t('settings.qualityEco') },
      ],
      ctx.save.settings.quality,
      (v) => {
        ctx.game.setSetting('quality', v);
        ctx.ui.onQualityChange(v);
        ctx.audio.uiTick();
      },
    ),
  );
  list.appendChild(
    segmentRow(
      ICONS.globe,
      t('settings.language'),
      LANGS.map((l) => ({ value: l.id, label: l.label })),
      ctx.save.settings.lang,
      (v) => {
        ctx.game.setSetting('lang', v);
      },
    ),
  );

  /* Reset progress with inline confirm. */
  const resetRow = el(`
    <div class="settings-row settings-row-col">
      <button class="btn btn-danger ui-block" type="button">${t('settings.reset')}</button>
      <div class="reset-confirm hidden">
        <span class="reset-text">${t('settings.resetConfirm')}</span>
        <div class="btn-row">
          <button class="btn btn-danger btn-small ui-block" type="button" data-yes>${t('settings.resetYes')}</button>
          <button class="btn btn-ghost btn-small ui-block" type="button" data-no>${t('settings.resetNo')}</button>
        </div>
      </div>
    </div>
  `);
  const resetBtn = qs(resetRow, '.btn-danger:not(.btn-small)');
  const confirmBox = qs(resetRow, '.reset-confirm');
  resetBtn.addEventListener('click', () => {
    ctx.audio.uiTick();
    confirmBox.classList.remove('hidden');
    resetBtn.classList.add('hidden');
  });
  qs(resetRow, '[data-no]').addEventListener('click', () => {
    confirmBox.classList.add('hidden');
    resetBtn.classList.remove('hidden');
  });
  qs(resetRow, '[data-yes]').addEventListener('click', () => {
    ctx.game.resetProgress();
    window.location.reload();
  });
  list.appendChild(resetRow);

  return node;
}
