/**
 * CameraRig — cinematic camera with three modes (menu orbit / play follow /
 * game-over pullback), critically-damped smoothing and impulse shake.
 */
import * as THREE from 'three';
import { CAMERA } from '../game/constants';

export type RigMode = 'menu' | 'play' | 'over';

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  private mode: RigMode = 'menu';
  private topY = 0;
  private towerH = 10;
  private menuAngle = 0.6;
  private overAngle = 0.6;
  private look = new THREE.Vector3(0, CAMERA.MENU_LOOK_Y, 0);
  private shakeAmp = 0;
  private shakeDur = 0;
  private shakeT = 1;
  private shakeSeed = Math.random() * 100;

  private tmpPos = new THREE.Vector3();
  private tmpLook = new THREE.Vector3();

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(CAMERA.FOV, aspect, CAMERA.NEAR, CAMERA.FAR);
    this.camera.position.set(
      Math.sin(this.menuAngle) * CAMERA.MENU_RADIUS,
      CAMERA.MENU_HEIGHT,
      Math.cos(this.menuAngle) * CAMERA.MENU_RADIUS,
    );
  }

  setMenu(): void {
    this.mode = 'menu';
  }

  setPlay(): void {
    this.mode = 'play';
  }

  setOver(towerHeight: number): void {
    this.mode = 'over';
    this.towerH = Math.max(towerHeight, 4);
    this.overAngle = this.menuAngle;
  }

  addShake(amp: number, dur: number): void {
    if (this.reducedMotion) return;
    this.shakeAmp = Math.max(this.shakeAmp, amp);
    this.shakeDur = Math.max(this.shakeDur, dur);
    this.shakeT = 0;
    this.shakeSeed = Math.random() * 100;
  }

  setReducedMotion(v: boolean): void {
    this.reducedMotion = v;
  }

  private reducedMotion = false;

  update(dt: number, elapsed: number): void {
    let px = 0;
    let py = 0;
    let pz = 0;
    let lx = 0;
    let ly = 0;
    let lz = 0;

    if (this.mode === 'play') {
      px = this.topX;
      py = this.topY + CAMERA.PLAY_OFFSET_Y;
      pz = this.topZ + CAMERA.PLAY_OFFSET_Z;
      lx = this.topX;
      ly = this.topY + CAMERA.PLAY_LOOK_ABOVE;
      lz = this.topZ;
    } else if (this.mode === 'menu') {
      this.menuAngle += dt * CAMERA.MENU_SPIN;
      px = Math.sin(this.menuAngle) * CAMERA.MENU_RADIUS;
      pz = Math.cos(this.menuAngle) * CAMERA.MENU_RADIUS;
      py = CAMERA.MENU_HEIGHT;
      ly = CAMERA.MENU_LOOK_Y;
    } else {
      this.overAngle += dt * CAMERA.OVER_SPIN;
      const radius = THREE.MathUtils.clamp(this.towerH * 0.72 + 10, 13, 55);
      px = Math.sin(this.overAngle) * radius;
      pz = Math.cos(this.overAngle) * radius;
      py = this.towerH * 0.55 + 3.5;
      ly = this.towerH * 0.5;
    }

    const k = 1 - Math.exp(-dt * CAMERA.SMOOTH);
    this.camera.position.lerp(this.tmpPos.set(px, py, pz), k);
    this.look.lerp(this.tmpLook.set(lx, ly, lz), k);

    /* Impulse shake (skipped for reduced-motion users via tiny amp). */
    if (this.shakeT < this.shakeDur) {
      this.shakeT += dt;
      const f = Math.max(0, 1 - this.shakeT / this.shakeDur);
      const a = this.shakeAmp * f * f;
      const s = this.shakeSeed;
      this.camera.position.x += Math.sin(elapsed * 43.7 + s) * a;
      this.camera.position.y += Math.sin(elapsed * 39.2 + s * 2.0) * a * 0.7;
      this.look.x += Math.sin(elapsed * 47.1 + s * 3.0) * a * 0.5;
    } else {
      this.shakeAmp = 0;
    }

    this.camera.lookAt(this.look);
  }

  /** Stage feeds the current tower top each frame (follows x/z drift). */
  setTop(x: number, y: number, z: number): void {
    this.topX = x;
    this.topY = y;
    this.topZ = z;
  }

  private topX = 0;
  private topZ = 0;
}
