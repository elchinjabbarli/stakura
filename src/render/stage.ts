/**
 * Stage — composition root of the render layer. Owns renderer, scene, camera
 * rig, sky, tower, debris, petals, sparks; adaptive quality (DPR tiers);
 * reads the logic model (TowerModel) read-only every frame.
 */
import * as THREE from 'three';
import { CameraRig } from './cameraRig';
import { Sky } from './sky';
import { TowerView } from './towerView';
import { Debris } from './debris';
import { Petals, Sparks } from './fx';
import { WORLD } from '../game/constants';
import { themeById } from '../game/themes';
import { env } from '../platform/env';
import type { ThemeDef } from '../game/themes';
import type { TowerModel } from '../game/stack';
import type { Block, CutPiece, GameState, Quality } from '../game/types';

const DPR_TIERS = [2, 1.5, 1.25, 1];

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly rig: CameraRig;

  private scene = new THREE.Scene();
  private sky = new Sky();
  private towerView = new TowerView();
  private debris = new Debris();
  private petals = new Petals();
  private sparks = new Sparks();

  private theme: ThemeDef;
  private fogTarget = new THREE.Color('#c8847c');
  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private rim: THREE.DirectionalLight;

  private lastActive: unknown = null;
  private elapsed = 0;
  private tier = 0;
  private quality: Quality = 'auto';
  private emaDt = 1 / 60;
  private hotFrames = 0;
  private tmpColor = new THREE.Color();
  private resizeObserver: ResizeObserver | null = null;

  constructor(private container: HTMLElement, themeId: string) {
    this.theme = themeById(themeId);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_TIERS[0]);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(new THREE.Color('#1c1216'));
    const canvas = this.renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    container.appendChild(canvas);

    this.rig = new CameraRig(this.aspect());
    this.scene.fog = new THREE.Fog(new THREE.Color(this.theme.fog), 15, 58);

    this.hemi = new THREE.HemisphereLight(0xffe4d0, 0x33202c, 0.9);
    this.sun = new THREE.DirectionalLight(0xffdcb0, 2.4);
    this.sun.position.set(5, 12, 7);
    this.rim = new THREE.DirectionalLight(0xffc9d8, 0.7);
    this.rim.position.set(-6, 7, -9);
    this.scene.add(this.hemi, this.sun, this.rim);

    this.scene.add(this.sky.group, this.towerView.group, this.debris.group, this.petals.mesh, this.sparks.mesh);

    this.setTheme(themeId, true);
    this.resize();
    this.rig.setReducedMotion(env.prefersReducedMotion);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(container);
    }
    window.addEventListener('orientationchange', () => window.setTimeout(() => this.resize(), 250));
  }

  private aspect(): number {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    return w / h;
  }

  resize(): void {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(w, h, false);
    this.rig.camera.aspect = w / h;
    this.rig.camera.updateProjectionMatrix();
  }

  /* ---------------------------------------------------------------- */
  /* Theme                                                             */
  /* ---------------------------------------------------------------- */

  setTheme(themeId: string, instant = false): void {
    this.theme = themeById(themeId);
    this.fogTarget.set(this.theme.fog);
    this.sky.setTheme(this.theme);
    this.towerView.setTheme(this.theme);
    this.petals.setTheme(
      this.theme.petals.color,
      this.theme.petals.opacity,
      this.theme.petals.count,
      this.quality === 'eco',
    );
    this.sparks.setTheme(this.theme.accent);
    if (instant) {
      this.sky.applyNow();
      (this.scene.fog as THREE.Fog).color.copy(this.fogTarget);
    }
  }

  setQuality(q: Quality): void {
    this.quality = q;
    if (q === 'high') this.applyTier(0);
    else if (q === 'eco') this.applyTier(2);
    else this.applyTier(0);
    this.petals.setTheme(
      this.theme.petals.color,
      this.theme.petals.opacity,
      this.theme.petals.count,
      q === 'eco',
    );
  }

  private applyTier(tier: number): void {
    this.tier = tier;
    const cap = Math.min(window.devicePixelRatio || 1, DPR_TIERS[tier]);
    this.renderer.setPixelRatio(cap);
    this.resize();
  }

  private monitorPerf(dt: number): void {
    if (this.quality !== 'auto') return;
    this.emaDt = this.emaDt * 0.94 + dt * 0.06;
    if (this.emaDt > 1 / 42) {
      this.hotFrames += 1;
      if (this.hotFrames > 110 && this.tier < DPR_TIERS.length - 1) {
        this.applyTier(this.tier + 1);
        this.hotFrames = 0;
      }
    } else {
      this.hotFrames = Math.max(0, this.hotFrames - 0.5);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Game-driven API                                                   */
  /* ---------------------------------------------------------------- */

  menuShowcase(): void {
    const offs = [0, 0.14, -0.2, 0.32, 0.1, -0.28, 0.18, -0.05, 0.22];
    const blocks: Block[] = [];
    for (let i = 0; i < offs.length; i++) {
      blocks.push({
        x: i % 2 === 1 ? offs[i] : 0,
        z: i % 2 === 0 ? offs[i] : 0,
        sx: WORLD.BASE,
        sz: WORLD.BASE,
        y: i * WORLD.BLOCK_H,
        index: i,
      });
    }
    this.towerView.buildPreview(blocks);
    this.debris.clear();
    this.rig.setMenu();
    (this.scene.fog as THREE.Fog).far = 58;
  }

  startRun(): void {
    this.towerView.reset();
    this.debris.clear();
    this.rig.setPlay();
    this.rig.setTop(0, 0, 0);
    (this.scene.fog as THREE.Fog).far = 58;
    this.lastActive = null;
  }

  placeBlock(b: Block, perfect: boolean): void {
    this.towerView.placeBlock(b);
    if (perfect) {
      this.sparks.burst(b.x, b.y, b.z, 18, this.elapsed);
      this.petals.boost(0.25);
    }
  }

  spawnDebris(piece: CutPiece, colorIndex: number): void {
    this.towerView.blockColorAt(colorIndex, this.tmpColor);
    this.debris.spawn(piece, this.tmpColor);
  }

  milestoneFx(x: number, y: number, z: number): void {
    this.sparks.burst(x, y, z, 26, this.elapsed, 3.4, 2.2);
    this.petals.boost(1.0);
    this.rig.addShake(0.07, 0.32);
  }

  missFx(): void {
    this.rig.addShake(0.14, 0.55);
  }

  gameOver(towerHeightWorld: number): void {
    this.rig.setOver(towerHeightWorld);
    this.towerView.clearActive();
    /* Widen the fog so tall towers stay visible during the pullback. */
    (this.scene.fog as THREE.Fog).far = 115;
    this.lastActive = null;
  }

  /* ---------------------------------------------------------------- */
  /* Frame                                                             */
  /* ---------------------------------------------------------------- */

  update(dt: number, elapsed: number, tower: TowerModel, state: GameState, combo: number): void {
    this.elapsed = elapsed;
    this.monitorPerf(dt);

    /* Active block lifecycle (spawn/clear detected by reference). */
    if (tower.active && tower.active !== this.lastActive) {
      this.towerView.spawnActive(tower.active, tower.blocks.length);
    }
    if (!tower.active && this.lastActive) {
      this.towerView.clearActive();
    }
    this.lastActive = tower.active;
    if (tower.active) {
      this.towerView.moveActive(tower.active.x, tower.active.z, combo);
    }

    this.rig.setTop(tower.top.x, tower.top.y, tower.top.z);
    this.towerView.showComboGlow(tower.top, combo);

    this.rig.update(dt, elapsed);
    this.sky.update(dt, elapsed);
    this.towerView.update(dt, elapsed);
    this.debris.update(dt, this.rig.camera.position.y);
    this.petals.update(dt, elapsed, this.rig.camera.position.y);
    this.sparks.update(dt, elapsed);

    const fog = this.scene.fog as THREE.Fog;
    fog.color.lerp(this.fogTarget, 1 - Math.exp(-dt * 2.6));

    this.renderer.render(this.scene, this.rig.camera);
    void state;
  }

  dispose(): void {
    this.resizeObserver?.disconnect();
    this.towerView.dispose();
    this.debris.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
