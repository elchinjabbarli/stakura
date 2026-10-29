/** Shared screen chrome: the standard panel header with a back button. */
import { el } from '../dom';
import { ICONS } from '../icons';
import { t } from '../i18n';

export function panelHeader(titleKey: string, onBack: () => void, right = ''): HTMLElement {
  const node = el(`
    <div class="panel-head">
      <button class="hud-btn ui-block" type="button" aria-label="Back"></button>
      <h2 class="panel-title">${t(titleKey)}</h2>
      <div class="panel-head-right">${right}</div>
    </div>
  `);
  const btn = node.querySelector<HTMLButtonElement>('.hud-btn')!;
  btn.innerHTML = ICONS.back;
  btn.addEventListener('click', onBack);
  return node;
}

/** Gem chip used in headers. */
export function gemChip(count: number): string {
  return `<div class="gem-chip"><span class="hud-gem-icon">${ICONS.gem}</span><span>${count}</span></div>`;
}
