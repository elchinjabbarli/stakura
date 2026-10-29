/**
 * Debris — pooled tumbling slices. The overhang (or the whole block on a
 * miss) drops with gravity and spin, then despawns below the fog line.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LIMITS, WORLD } from '../game/constants';
import type { CutPiece } from '../game/types';

interface DebrisItem {
  mesh: THREE.Mesh;
  mat: THREE.MeshLambertMaterial;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  alive: boolean;
  life: number;
}

export class Debris {
  readonly group = new THREE.Group();
  private pool: DebrisItem[] = [];
  private geometry = new RoundedBoxGeometry(1, 1, 1, 1, 0.03);

  constructor() {
    for (let i = 0; i < LIMITS.DEBRIS_POOL; i++) {
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(this.geometry, mat);
      mesh.visible = false;
      this.group.add(mesh);
      this.pool.push({ mesh, mat, vel: new THREE.Vector3(), angVel: new THREE.Vector3(), alive: false, life: 0 });
    }
  }

  spawn(piece: CutPiece, color: THREE.Color): void {
    const item = this.pool.find((d) => !d.alive);
    if (!item) return; /* pool exhausted — silently skip, purely cosmetic */
    item.alive = true;
    item.life = 0;
    item.mesh.visible = true;
    item.mesh.position.set(piece.x, piece.y - WORLD.BLOCK_H / 2, piece.z);
    item.mesh.scale.set(Math.max(piece.sx, 0.02), WORLD.BLOCK_H, Math.max(piece.sz, 0.02));
    item.mesh.rotation.set(0, 0, 0);
    item.mat.color.copy(color);

    /* Nudge outward along the sliding axis (from the model) + a touch of up. */
    let vx = (Math.random() - 0.5) * 1.2;
    let vz = (Math.random() - 0.5) * 1.2;
    if (piece.axis === 'x') vx += (piece.dir ?? 1) * 0.9;
    if (piece.axis === 'z') vz += (piece.dir ?? 1) * 0.9;
    item.vel.set(vx, 1.6 + Math.random() * 1.2, vz);
    item.angVel.set(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 5,
    );
  }

  update(dt: number, cameraY: number): void {
    for (const d of this.pool) {
      if (!d.alive) continue;
      d.life += dt;
      d.vel.y -= 22 * dt;
      d.mesh.position.addScaledVector(d.vel, dt);
      d.mesh.rotation.x += d.angVel.x * dt;
      d.mesh.rotation.y += d.angVel.y * dt;
      d.mesh.rotation.z += d.angVel.z * dt;
      if (d.mesh.position.y < cameraY - 45 || d.life > 6) {
        d.alive = false;
        d.mesh.visible = false;
      }
    }
  }

  clear(): void {
    for (const d of this.pool) {
      d.alive = false;
      d.mesh.visible = false;
    }
  }

  dispose(): void {
    this.geometry.dispose();
    for (const d of this.pool) d.mat.dispose();
  }
}
