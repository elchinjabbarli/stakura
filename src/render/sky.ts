/**
 * Sky — gradient dome shader (with sun glow, optional stars) plus two
 * procedural mountain-ridge rings that fade into the fog. All generated
 * at runtime: zero image assets.
 */
import * as THREE from 'three';
import type { ThemeDef } from '../game/themes';

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uBot;
uniform vec3 uSun;
uniform vec3 uSunDir;
uniform float uDark;
uniform float uTime;
varying vec3 vDir;

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uBot, uMid, smoothstep(-0.12, 0.14, h));
  col = mix(col, uTop, smoothstep(0.10, 0.62, h));

  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSun * pow(s, 48.0) * 0.85;
  col += uSun * pow(s, 6.0) * 0.10;

  vec3 cell = floor(d * 62.0);
  float rnd = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float star = step(0.9965, rnd) * uDark * smoothstep(0.08, 0.35, h);
  float tw = 0.55 + 0.45 * sin(uTime * (1.5 + rnd * 2.0) + rnd * 40.0);
  col += vec3(star * tw);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function ridgeHeight(a: number, seed: number): number {
  const v =
    0.55 +
    0.28 * Math.sin(a * 3.0 + seed) +
    0.17 * Math.sin(a * 7.0 + seed * 1.7) +
    0.1 * Math.sin(a * 13.0 + seed * 2.3);
  return Math.max(0.08, v);
}

function ridgeRing(radius: number, hMax: number, seed: number, segments = 110): THREE.BufferGeometry {
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const h = ridgeHeight(a, seed) * hMax;
    const cx = Math.cos(a) * radius;
    const cz = Math.sin(a) * radius;
    const o = i * 6;
    positions[o] = cx;
    positions[o + 1] = -12;
    positions[o + 2] = cz;
    positions[o + 3] = cx;
    positions[o + 4] = -12 + h;
    positions[o + 5] = cz;
  }
  for (let i = 0; i < segments; i++) {
    const b0 = i * 2;
    indices.push(b0, b0 + 1, b0 + 2, b0 + 2, b0 + 1, b0 + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return geo;
}

export class Sky {
  readonly group = new THREE.Group();

  private uniforms: {
    uTop: { value: THREE.Color };
    uMid: { value: THREE.Color };
    uBot: { value: THREE.Color };
    uSun: { value: THREE.Color };
    uSunDir: { value: THREE.Vector3 };
    uDark: { value: number };
    uTime: { value: number };
  };

  private targets: {
    top: THREE.Color;
    mid: THREE.Color;
    bot: THREE.Color;
    sun: THREE.Color;
    dark: number;
    ridgeFar: THREE.Color;
    ridgeNear: THREE.Color;
    sunDir: THREE.Vector3;
  };

  private ridgeFar: THREE.Mesh;
  private ridgeNear: THREE.Mesh;
  private matFar: THREE.MeshBasicMaterial;
  private matNear: THREE.MeshBasicMaterial;

  constructor() {
    this.uniforms = {
      uTop: { value: new THREE.Color('#2b1030') },
      uMid: { value: new THREE.Color('#93415f') },
      uBot: { value: new THREE.Color('#eda05f') },
      uSun: { value: new THREE.Color('#ffd2a0') },
      uSunDir: { value: new THREE.Vector3(-0.45, 0.22, 0.87).normalize() },
      uDark: { value: 0.12 },
      uTime: { value: 0 },
    };
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(90, 32, 16),
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        uniforms: this.uniforms,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    dome.renderOrder = -10;
    this.group.add(dome);

    this.matFar = new THREE.MeshBasicMaterial({ color: '#8a4f62', fog: true, side: THREE.DoubleSide });
    this.matNear = new THREE.MeshBasicMaterial({ color: '#63374b', fog: true, side: THREE.DoubleSide });
    this.ridgeFar = new THREE.Mesh(ridgeRing(41, 7.5, 3.7), this.matFar);
    this.ridgeNear = new THREE.Mesh(ridgeRing(26, 3.4, 8.9), this.matNear);
    this.group.add(this.ridgeFar, this.ridgeNear);

    this.targets = {
      top: new THREE.Color('#2b1030'),
      mid: new THREE.Color('#93415f'),
      bot: new THREE.Color('#eda05f'),
      sun: new THREE.Color('#ffd2a0'),
      dark: 0.12,
      ridgeFar: new THREE.Color('#8a4f62'),
      ridgeNear: new THREE.Color('#63374b'),
      sunDir: new THREE.Vector3(-0.45, 0.22, 0.87).normalize(),
    };
  }

  setTheme(theme: ThemeDef): void {
    this.targets.top.set(theme.sky.top);
    this.targets.mid.set(theme.sky.mid);
    this.targets.bot.set(theme.sky.bot);
    this.targets.sun.set(theme.sky.sun);
    this.targets.dark = theme.sky.dark;
    this.targets.ridgeFar.set(theme.ridges[0]);
    this.targets.ridgeNear.set(theme.ridges[1]);
    this.targets.sunDir
      .set(theme.sky.sunDir[0], theme.sky.sunDir[1], theme.sky.sunDir[2])
      .normalize();
  }

  /** Snap colors instantly (boot). */
  applyNow(): void {
    this.uniforms.uTop.value.copy(this.targets.top);
    this.uniforms.uMid.value.copy(this.targets.mid);
    this.uniforms.uBot.value.copy(this.targets.bot);
    this.uniforms.uSun.value.copy(this.targets.sun);
    this.uniforms.uSunDir.value.copy(this.targets.sunDir);
    this.uniforms.uDark.value = this.targets.dark;
    this.matFar.color.copy(this.targets.ridgeFar);
    this.matNear.color.copy(this.targets.ridgeNear);
  }

  update(dt: number, elapsed: number): void {
    this.uniforms.uTime.value = elapsed;
    const k = 1 - Math.exp(-dt * 2.6);
    this.uniforms.uTop.value.lerp(this.targets.top, k);
    this.uniforms.uMid.value.lerp(this.targets.mid, k);
    this.uniforms.uBot.value.lerp(this.targets.bot, k);
    this.uniforms.uSun.value.lerp(this.targets.sun, k);
    this.uniforms.uSunDir.value.lerp(this.targets.sunDir, k).normalize();
    this.uniforms.uDark.value += (this.targets.dark - this.uniforms.uDark.value) * k;
    this.matFar.color.lerp(this.targets.ridgeFar, k);
    this.matNear.color.lerp(this.targets.ridgeNear, k);
    this.ridgeFar.rotation.y += dt * 0.014;
    this.ridgeNear.rotation.y -= dt * 0.008;
  }
}
