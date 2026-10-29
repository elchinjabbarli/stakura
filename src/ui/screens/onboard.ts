/**
 * Onboarding overlay — pointer-events: none so the first tap both dismisses
 * it AND drops the first block (wired in main.ts).
 */
import { el } from '../dom';
import { t } from '../i18n';

export function createOnboardScreen(): HTMLElement {
  return el(`
    <div class="screen onboard-screen" aria-live="polite">
      <div class="onboard-card">
        <div class="onboard-ring" aria-hidden="true"><span></span></div>
        <h2 class="onboard-title">${t('onboard.title')}</h2>
        <p class="onboard-body">${t('onboard.body')}</p>
      </div>
    </div>
  `);
}
