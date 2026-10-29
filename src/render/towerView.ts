/**
 * TowerView — instanced rendering of every placed block (one draw call),
 * the moving block, the decorative base column and the combo glow plane.
 * Squash-and-stretch on landing; per-block palette from the theme.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LIMITS, WORLD } from '../game/constants';
import type { ThemeDef } from '../game/themes';
import type { ActiveBlock, Block } from '../game/types';

interface BlockRecord {
  x: number;
  y: number;
  z: number;
  sx: number;
  sz: number;
}

export class TowerView {
  readonly group = new THREE.Group();

  private geometry = new RoundedBoxGeometry(1, 1, 1, 3, 0.07);
  private material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  private instances: THREE.InstancedMesh;
  private count = 0;
  private records: BlockRecord[] = [];

  private baseMesh: THREE.Mesh;
  private baseMat: THREE.MeshLambertMaterial;

  private activeMesh: THREE.Mesh;
  private activeMat: THREE.MeshLambertMaterial;

  private glowMesh: THREE.Mesh;
  private glowMat: THREE.MeshBasicMaterial;
  private glowOpacity = 0;

  private squashes: { i: number; t: number }[] = [];
  private m4 = new THREE.Matrix4();
  private color = new THREE.Color();
  private theme: ThemeDef | null = null;
  private activeIndex = 0;

  constructor() {
    this.instances = new THREE.InstancedMesh(this.geometry, this.material, LIMITS.MAX_INSTANCED_BLOCKS);
    this.instances.count = 0;
    this.instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instances.frustumCulled = false;
    this.group.add(this.instances);

    this.baseMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.baseMesh = new THREE.Mesh(this.geometry, this.baseMat);
    this.baseMesh.scale.set(WORLD.BASE, WORLD.BASE_COLUMN_DEPTH, WORLD.BASE);
    this.baseMesh.position.y = -WORLD.BASE_COLUMN_DEPTH / 2;
    this.group.add(this.baseMesh);

    this.activeMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: new THREE.Color('#f2a25c'),
      emissiveIntensity: 0,
    });
    this.activeMesh = new THREE.Mesh(this.geometry, this.activeMat);
    this.activeMesh.visible = false;
    this.group.add(this.activeMesh);

    this.glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffd9a0'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.glowMat);
    this.glowMesh.rotation.x = -Math.PI / 2;
    this.glowMesh.visible = false;
    this.group.add(this.glowMesh);
  }

  /** Palette for a given floor index — smooth hue walk with gentle waves. */
  private colorFor(index: number, out: THREE.Color): THREE.Color {
    const p = this.theme!.blocks;
    const hue = ((((p.hue0 + index * p.hueStep) % 360) + 360) % 360) / 360;
    const sat = THREE.MathUtils.clamp(p.sat + Math.sin(index * 0.35) * p.satAmp, 0.05, 0.95);
    const light = THREE.MathUtils.clamp(p.light + Math.sin(index * 0.22 + 1.7) * p.lightAmp, 0.2, 0.9);
    return out.setHSL(hue, sat, light);
  }

  /** Public color lookup (used by the stage for debris tinting). */
  blockColorAt(index: number, out: THREE.Color): THREE.Color {
    return this.colorFor(index, out);
  }

  setTheme(theme: ThemeDef): void {
    this.theme = theme;
    this.baseMat.color.copy(this.colorFor(0, this.color)).multiplyScalar(0.82);
    this.activeMat.emissive.set(theme.accent);
    this.glowMat.color.set(theme.accent);
    /* Recolor existing instances (theme can change from the menu). */
    for (let i = 0; i < this.count; i++) {
      this.instances.setColorAt(i, this.colorFor(i, this.color));
    }
    if (this.instances.instanceColor) this.instances.instanceColor.needsUpdate = true;
    if (this.activeMesh.visible) this.syncActiveColor();
  }

  reset(): void {
    this.count = 0;
    this.instances.count = 0;
    this.records.length = 0;
    this.squashes.length = 0;
    this.clearActive();
    this.setGlow(null);
  }

  /** Menu showcase: stack a decorative little tower. */
  buildPreview(blocks: Block[]): void {
    this.reset();
    for (const b of blocks) this.placeBlock(b);
  }

  placeBlock(b: Block): void {
    if (this.count >= LIMITS.MAX_INSTANCED_BLOCKS) return;
    const i = this.count++;
    this.instances.count = this.count;
    this.records[i] = { x: b.x, y: b.y - WORLD.BLOCK_H / 2, z: b.z, sx: b.sx, sz: b.sz };
    this.writeMatrix(i, 1, 1);
    this.instances.setColorAt(i, this.colorFor(b.index, this.color));
    this.instances.instanceMatrix.needsUpdate = true;
    if (this.instances.instanceColor) this.instances.instanceColor.needsUpdate = true;
    this.squashes.push({ i, t: 0 });
  }

  /** Compose the instance matrix. sq/bulge are squash-and-stretch factors. */
  private writeMatrix(i: number, sq: number, bulge: number): void {
    const r = this.records[i];
    this.m4.makeScale(r.sx * bulge, WORLD.BLOCK_H * sq, r.sz * bulge);
    /* Anchor the squash at the block's BOTTOM so the top surface dips, not the tower. */
    const y = r.y - (WORLD.BLOCK_H / 2) * (1 - sq);
    this.m4.setPosition(r.x, y, r.z);
    this.instances.setMatrixAt(i, this.m4);
  }

  spawnActive(a: ActiveBlock, nextIndex: number): void {
    this.activeMesh.visible = true;
    this.activeMesh.scale.set(a.sx, WORLD.BLOCK_H, a.sz);
    this.activeMesh.position.set(a.x, a.y - WORLD.BLOCK_H / 2, a.z);
    this.activeIndex = nextIndex;
    this.syncActiveColor();
  }

  private syncActiveColor(): void {
    this.activeMat.color.copy(this.colorFor(this.activeIndex, this.color));
  }

  moveActive(x: number, z: number, combo: number): void {
    this.activeMesh.position.set(x, this.activeMesh.position.y, z);
    this.activeMat.emissiveIntensity = Math.min(combo, 8) * 0.055;
  }

  clearActive(): void {
    this.activeMesh.visible = false;
    this.activeMat.emissiveIntensity = 0;
  }

  private setGlow(b: Block | null): void {
    if (!b) {
      this.glowMesh.visible = false;
      this.glowOpacity = 0;
      return;
    }
    this.glowMesh.visible = true;
    this.glowMesh.scale.set(b.sx * 1.08, b.sz * 1.08, 1);
    this.glowMesh.position.set(b.x, b.y + 0.02, b.z);
  }

  /** Keep a soft glow on the top block while a combo streak is alive. */
  showComboGlow(top: Block | null, combo: number): void {
    if (combo >= 2 && top) {
      this.setGlow(top);
      this.glowOpacity = Math.min(0.45, 0.16 + combo * 0.05);
    } else {
      this.glowOpacity = Math.max(0, this.glowOpacity - 0.05);
      if (this.glowOpacity <= 0) this.setGlow(null);
    }
  }

  update(dt: number, elapsed: number): void {
    /* Squash-and-stretch landing animation (~140ms). */
    let dirty = false;
    for (let n = this.squashes.length - 1; n >= 0; n--) {
      const s = this.squashes[n];
      s.t += dt / 0.14;
      if (s.t >= 1) {
        this.squashes.splice(n, 1);
        this.writeMatrix(s.i, 1, 1);
        dirty = true;
        continue;
      }
      const wave = Math.sin(Math.PI * s.t);
      this.writeMatrix(s.i, 1 - 0.14 * wave, 1 + 0.05 * wave);
      dirty = true;
    }
    if (dirty) this.instances.instanceMatrix.needsUpdate = true;

    if (this.glowMesh.visible) {
      const pulse = 0.7 + 0.3 * Math.sin(elapsed * 6.0);
      this.glowMat.opacity = this.glowOpacity * pulse;
    }
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.baseMat.dispose();
    this.activeMat.dispose();
    this.glowMat.dispose();
    this.instances.dispose();
  }
}
