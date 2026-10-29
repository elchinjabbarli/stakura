/**
 * FX — two GPU-driven billboard systems:
 *  - Petals: ambient sakura petals looping around the camera (pure vertex
 *    shader animation, zero per-frame CPU work).
 *  - Sparks: pooled burst particles for perfect drops and milestones.
 * Both use canvas-generated textures — no image assets anywhere.
 */
import * as THREE from 'three';
import { LIMITS } from '../game/constants';

function petalTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.save();
  ctx.translate(32, 32);
  ctx.scale(0.72, 1);
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function dotTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 1, 16, 16, 15);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/* Petals                                                              */
/* ------------------------------------------------------------------ */

const PETAL_VERT = /* glsl */ `
attribute float aSeed;
attribute float aScale;
uniform float uTime;
uniform float uCamY;
varying vec2 vUv;
varying float vFade;

void main() {
  vUv = uv;
  float seed = aSeed;
  float fall = uTime * (0.55 + fract(seed * 13.7) * 0.5) + seed * 97.0;
  float span = 42.0;
  float y = mod(fall, span);
  float worldY = uCamY + 17.0 - y;
  float ang = seed * 43.7 + uTime * 0.12 * (seed > 0.5 ? 1.0 : -1.0);
  float rad = 2.2 + fract(seed * 7.31) * 11.0;
  vec3 center = vec3(cos(ang) * rad, worldY, sin(ang) * rad);
  vec4 mv = modelViewMatrix * vec4(center, 1.0);
  float rot = uTime * (1.2 + fract(seed * 3.1) * 2.2) + seed * 6.2831;
  vec2 quad = (uv - 0.5) * aScale;
  float cs = cos(rot);
  float sn = sin(rot);
  vec2 q = vec2(quad.x * cs - quad.y * sn, quad.x * sn + quad.y * cs);
  mv.xy += q;
  vFade = smoothstep(0.0, 3.0, y) * smoothstep(span, span - 4.0, y);
  gl_Position = projectionMatrix * mv;
}
`;

const PETAL_FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uBoost;
varying vec2 vUv;
varying float vFade;

void main() {
  vec4 tex = texture2D(uTex, vUv);
  float a = tex.a * vFade * uOpacity * (1.0 + uBoost);
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor * tex.rgb, min(a, 1.0));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export class Petals {
  readonly mesh: THREE.Mesh;
  private uniforms: {
    uTime: { value: number };
    uCamY: { value: number };
    uColor: { value: THREE.Color };
    uOpacity: { value: number };
    uBoost: { value: number };
    uTex: { value: THREE.Texture };
  };
  private targetColor = new THREE.Color('#f7b8cb');
  private targetOpacity = 0.85;
  private geo: THREE.InstancedBufferGeometry;

  constructor() {
    const plane = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = plane.index;
    geo.setAttribute('position', plane.attributes.position);
    geo.setAttribute('uv', plane.attributes.uv);
    const seeds = new Float32Array(LIMITS.PETALS_MAX);
    const scales = new Float32Array(LIMITS.PETALS_MAX);
    for (let i = 0; i < LIMITS.PETALS_MAX; i++) {
      seeds[i] = Math.random();
      scales[i] = 0.17 + Math.random() * 0.26;
    }
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));
    geo.instanceCount = 160;
    this.geo = geo;

    this.uniforms = {
      uTime: { value: 0 },
      uCamY: { value: 6 },
      uColor: { value: new THREE.Color('#f7b8cb') },
      uOpacity: { value: 0.85 },
      uBoost: { value: 0 },
      uTex: { value: petalTexture() },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: PETAL_VERT,
      fragmentShader: PETAL_FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
  }

  setTheme(color: string, opacity: number, count: number, eco: boolean): void {
    this.targetColor.set(color);
    this.targetOpacity = opacity;
    this.geo.instanceCount = Math.min(count, eco ? 80 : LIMITS.PETALS_MAX);
  }

  boost(v: number): void {
    this.uniforms.uBoost.value = Math.min(1.6, this.uniforms.uBoost.value + v);
  }

  update(dt: number, elapsed: number, camY: number): void {
    this.uniforms.uTime.value = elapsed;
    this.uniforms.uCamY.value = camY;
    this.uniforms.uBoost.value *= Math.exp(-dt * 1.4);
    const k = 1 - Math.exp(-dt * 2.5);
    this.uniforms.uColor.value.lerp(this.targetColor, k);
    this.uniforms.uOpacity.value += (this.targetOpacity - this.uniforms.uOpacity.value) * k;
  }
}

/* ------------------------------------------------------------------ */
/* Sparks (perfect-drop bursts)                                        */
/* ------------------------------------------------------------------ */

const SPARK_VERT = /* glsl */ `
attribute float aBirth;
attribute float aLife;
attribute vec3 aPos;
attribute vec3 aVel;
attribute float aScale;
attribute float aSeed;
uniform float uTime;
varying vec2 vUv;
varying float vAlpha;

void main() {
  vUv = uv;
  float age = uTime - aBirth;
  float t01 = clamp(age / aLife, 0.0, 1.0);
  vec3 pos = aPos + aVel * age + vec3(0.0, -3.2, 0.0) * age * age;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float rot = aSeed * 6.2831 + age * (2.0 + fract(aSeed * 5.7) * 5.0);
  vec2 quad = (uv - 0.5) * aScale * (1.0 - t01 * 0.55);
  float cs = cos(rot);
  float sn = sin(rot);
  vec2 q = vec2(quad.x * cs - quad.y * sn, quad.x * sn + quad.y * cs);
  mv.xy += q;
  vAlpha = (age >= 0.0 && age <= aLife) ? (1.0 - t01) : 0.0;
  gl_Position = projectionMatrix * mv;
}
`;

const SPARK_FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform vec3 uColor;
varying vec2 vUv;
varying float vAlpha;

void main() {
  vec4 tex = texture2D(uTex, vUv);
  float a = tex.a * vAlpha;
  if (a < 0.02) discard;
  gl_FragColor = vec4(uColor * tex.rgb, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export class Sparks {
  readonly mesh: THREE.Mesh;
  private uniforms: {
    uTime: { value: number };
    uColor: { value: THREE.Color };
    uTex: { value: THREE.Texture };
  };
  private targetColor = new THREE.Color('#ffd9a0');
  private cursor = 0;
  private aBirth: THREE.InstancedBufferAttribute;
  private aLife: THREE.InstancedBufferAttribute;
  private aPos: THREE.InstancedBufferAttribute;
  private aVel: THREE.InstancedBufferAttribute;
  private aScale: THREE.InstancedBufferAttribute;
  private aSeed: THREE.InstancedBufferAttribute;

  constructor() {
    const plane = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = plane.index;
    geo.setAttribute('position', plane.attributes.position);
    geo.setAttribute('uv', plane.attributes.uv);
    const N = LIMITS.SPARKS;
    this.aBirth = new THREE.InstancedBufferAttribute(new Float32Array(N).fill(-1e3), 1);
    this.aLife = new THREE.InstancedBufferAttribute(new Float32Array(N).fill(0.8), 1);
    this.aPos = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
    this.aVel = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
    this.aScale = new THREE.InstancedBufferAttribute(new Float32Array(N).fill(0.14), 1);
    this.aSeed = new THREE.InstancedBufferAttribute(new Float32Array(N).map(() => Math.random()), 1);
    geo.setAttribute('aBirth', this.aBirth);
    geo.setAttribute('aLife', this.aLife);
    geo.setAttribute('aPos', this.aPos);
    geo.setAttribute('aVel', this.aVel);
    geo.setAttribute('aScale', this.aScale);
    geo.setAttribute('aSeed', this.aSeed);
    geo.instanceCount = N;

    this.uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ffd9a0') },
      uTex: { value: dotTexture() },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: SPARK_VERT,
      fragmentShader: SPARK_FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 6;
  }

  setTheme(accent: string): void {
    this.targetColor.set(accent);
  }

  /** Emit a radial burst at a world position. */
  burst(x: number, y: number, z: number, count: number, now: number, spread = 2.6, up = 1.6): void {
    const N = LIMITS.SPARKS;
    for (let n = 0; n < count; n++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % N;
      const ang = Math.random() * Math.PI * 2;
      const tilt = (Math.random() - 0.35) * Math.PI;
      const speed = spread * (0.55 + Math.random() * 0.75);
      this.aPos.setXYZ(i, x, y, z);
      this.aVel.setXYZ(
        i,
        Math.cos(ang) * Math.cos(tilt) * speed,
        Math.abs(Math.sin(tilt)) * speed + up,
        Math.sin(ang) * Math.cos(tilt) * speed,
      );
      this.aBirth.setX(i, now);
      this.aLife.setX(i, 0.55 + Math.random() * 0.45);
      this.aScale.setX(i, 0.1 + Math.random() * 0.1);
    }
    this.aPos.needsUpdate = true;
    this.aVel.needsUpdate = true;
    this.aBirth.needsUpdate = true;
    this.aLife.needsUpdate = true;
    this.aScale.needsUpdate = true;
  }

  update(dt: number, elapsed: number): void {
    this.uniforms.uTime.value = elapsed;
    const k = 1 - Math.exp(-dt * 3);
    this.uniforms.uColor.value.lerp(this.targetColor, k);
  }
}
