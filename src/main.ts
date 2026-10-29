/**
 * Stakura — bootstrap. Wires logic (Game), rendering (Stage) and UI together
 * through the event bus. Nothing here touches rendering internals.
 */
import { GameClock } from './core/loop';
import { Storage } from './core/storage';
import { AudioEngine } from './core/audio';
import { Game } from './game/state';
import { Missions } from './game/missions';
import { Stage } from './render/stage';
import { Ui } from './ui/ui';
import { detectLang, setLang, t } from './ui/i18n';
import { Input } from './platform/input';
import { Haptics } from './platform/haptics';
import { registerServiceWorker } from './platform/pwa';
import { webStore } from './platform/store';
import type { ScreenCtx } from './ui/types';
import type { GameOverData } from './ui/types';

function showError(message: string): void {
  const app = document.getElementById('app');
  if (!app) return;
  const box = document.createElement('div');
  box.className = 'fatal';
  box.setAttribute('role', 'alert');
  box.textContent = message;
  app.appendChild(box);
  const splash = document.getElementById('splash');
  splash?.remove();
}

function boot(): void {
  const app = document.getElementById('app');
  if (!app) return;

  /* ---------------- logic ---------------- */
  const storage = new Storage('stakura');
  const game = new Game(storage);
  const missions = new Missions(game.save, game.bus, () => game.persist());
  game.missions = missions;

  /* First run: follow the device language. */
  if (game.save.stats.runs === 0 && game.save.best === 0 && !game.save.onboarded) {
    game.save.settings.lang = detectLang();
  }
  setLang(game.save.settings.lang);
  document.title = t('meta.title');

  /* ---------------- platform ---------------- */
  const audio = new AudioEngine(game.save.settings);
  const haptics = new Haptics(game.save.settings.haptics);
  void webStore.init();
  registerServiceWorker();

  /* ---------------- rendering ---------------- */
  let stage: Stage;
  try {
    stage = new Stage(app, game.save.theme);
  } catch (err) {
    console.error('[stakura] WebGL init failed', err);
    showError(t('error.noWebgl'));
    return;
  }
  stage.setQuality(game.save.settings.quality);

  /* ---------------- ui ---------------- */
  const ctx = {
    game,
    save: game.save,
    bus: game.bus,
    audio,
    haptics,
    missions,
    ui: null as unknown as Ui,
  } satisfies ScreenCtx;
  const ui = new Ui(app, () => game.pause());
  ui.ctx = ctx;
  ctx.ui = ui;
  ui.qualityHandler = (q) => stage.setQuality(q);

  /* ---------------- input ---------------- */
  new Input(() => game.drop());
  const unlockAudio = (): void => audio.unlock();
  window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
  window.addEventListener('keydown', unlockAudio, { once: true, capture: true });

  const dismissOnboard = (): void => {
    if (ui.current === 'onboard') {
      game.completeOnboarding();
      ui.show('none');
    }
  };
  window.addEventListener('pointerdown', dismissOnboard, { passive: true });
  window.addEventListener('keydown', dismissOnboard);

  /* ---------------- clock ---------------- */
  let overTimer: ReturnType<typeof setTimeout> | null = null;
  const clock = new GameClock((dt, elapsed) => {
    game.update(dt);
    stage.update(dt, elapsed, game.tower, game.state, game.tower.combo);
  });

  /* ---------------- event wiring ---------------- */
  const bus = game.bus;

  bus.on('run:start', () => {
    stage.startRun();
    ui.hud.setGems(game.save.gems);
    ui.hud.setHeight(0);
    audio.runStart();
    if (game.save.onboarded) ui.show('none');
    else ui.show('onboard');
  });

  bus.on('block:place', ({ block, perfect, combo, regrow }) => {
    stage.placeBlock(block, perfect);
    ui.hud.onPlace(block);
    if (perfect) {
      audio.chime(combo, combo);
      haptics.perfect();
      ui.hud.showCombo(combo, regrow);
    } else {
      audio.thump();
      haptics.place();
    }
  });

  bus.on('block:cut', ({ piece }) => {
    stage.spawnDebris(piece, game.tower.blocks.length - 1);
    audio.slice();
  });

  bus.on('block:miss', ({ piece }) => {
    stage.spawnDebris(piece, game.tower.blocks.length);
    haptics.miss();
    stage.missFx();
  });

  bus.on('milestone', ({ height, bonus }) => {
    stage.milestoneFx(game.tower.top.x, height * 0.5, game.tower.top.z);
    audio.milestone();
    haptics.milestone();
    ui.hud.showMilestone(height, bonus);
  });

  bus.on('gems:gain', ({ total }) => ui.hud.setGems(total));

  bus.on('run:end', (payload) => {
    audio.gameOver();
    stage.gameOver(payload.height * 0.5);
    clock.timeScale = 0.35;
    window.setTimeout(() => (clock.timeScale = 1), 700);
    if (overTimer) clearTimeout(overTimer);
    overTimer = window.setTimeout(() => {
      const data: GameOverData = {
        height: payload.height,
        best: payload.best,
        isRecord: payload.isRecord,
        gems: payload.gems,
      };
      ui.show('gameover', data);
    }, 1150);
  });

  bus.on('state:change', ({ to }) => {
    if (to === 'paused') {
      ui.show('pause');
      clock.paused = true;
    } else if (to === 'playing') {
      if (ui.current !== 'onboard') ui.show('none');
      clock.paused = false;
    } else if (to === 'menu') {
      stage.menuShowcase();
      ui.show('menu');
      clock.paused = false;
    }
  });

  bus.on('theme:select', ({ id }) => {
    stage.setTheme(id);
  });

  bus.on('theme:unlock', ({ id }) => {
    ui.toast.show(t('toast.themeUnlocked', { name: t(`theme.${id}`) }));
  });

  bus.on('mission:complete', ({ reward }) => {
    ui.toast.show(t('toast.missionDone') + ` +${reward}`);
  });

  bus.on('settings:change', ({ key }) => {
    switch (key) {
      case 'lang':
        setLang(game.save.settings.lang);
        if (ui.current === 'settings') ui.show('settings');
        break;
      case 'sound':
        audio.setMuted(!game.save.settings.sound);
        break;
      case 'haptics':
        haptics.setEnabled(game.save.settings.haptics);
        break;
      case 'quality':
        stage.setQuality(game.save.settings.quality);
        break;
    }
  });

  /* Flush the debounced save when the tab/app is being hidden or closed. */
  window.addEventListener('pagehide', () => game.persistNow());

  /* Auto-pause when the tab/app loses visibility mid-run. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state === 'playing') game.pause();
  });

  /* Screen wake lock while playing (best-effort). */
  type WakeLockSentinel = { release: () => Promise<void> };
  let wakeLock: WakeLockSentinel | null = null;
  const requestWake = async (): Promise<void> => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<WakeLockSentinel> } };
      if (nav.wakeLock && game.state === 'playing') {
        wakeLock = await nav.wakeLock.request('screen');
      }
    } catch {
      /* not supported — ignore */
    }
  };
  const releaseWake = (): void => {
    try {
      void wakeLock?.release();
    } catch {
      /* ignore */
    }
    wakeLock = null;
  };
  bus.on('state:change', ({ to }) => {
    if (to === 'playing') void requestWake();
    else releaseWake();
  });

  /* ---------------- go ---------------- */
  stage.menuShowcase();
  ui.show('menu');
  clock.start();

  /* QA handle — logic state only (no secrets). Used by Maestro flows & smoke tests. */
  (window as unknown as Record<string, unknown>).__stakura = { game, ui, clock };

  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    window.setTimeout(() => splash.remove(), 750);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
