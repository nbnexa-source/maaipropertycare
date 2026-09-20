import * as THREE from "three";

/** Full-scene atmospheric depth field, kept behind all foreground logo motion. */
export function createAmbientParticles(mobile: boolean) {
  const count = mobile ? 100 : 240;
  const positions = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const gold = new THREE.Color(0xe5c078);
  const green = new THREE.Color(0xffefd6);
  const color = new THREE.Color();

  for (let index = 0; index < count; index++) {
    const offset = index * 3;
    // Spread across a large box rather than around the logo. Negative Z keeps
    // the entire field visually behind the logo and foreground copy.
    base[offset] = (Math.random() - 0.5) * (mobile ? 10 : 17);
    base[offset + 1] = (Math.random() - 0.5) * (mobile ? 9 : 12);
    base[offset + 2] = -2.2 - Math.random() * 6.5;
    positions[offset] = base[offset];
    positions[offset + 1] = base[offset + 1];
    positions[offset + 2] = base[offset + 2];
    phase[index] = Math.random() * Math.PI * 2;
    color.copy(index % 5 === 0 ? gold : green).multiplyScalar(0.62 + Math.random() * 0.25);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  // Feathered sprites catch light like airborne dust instead of square pixels.
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const context = sprite.getContext("2d")!;
  const glow = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.18, "rgba(255,255,255,.85)");
  glow.addColorStop(0.45, "rgba(255,255,255,.3)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(sprite);
  const material = new THREE.PointsMaterial({
    map: texture,
    size: mobile ? 0.12 : 0.17,
    transparent: true,
    opacity: mobile ? 0.6 : 0.72,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);

  function update(elapsed: number, progress: number, reducedMotion: boolean) {
    if (!reducedMotion) {
      for (let index = 0; index < count; index++) {
        const offset = index * 3;
        const wave = elapsed * (0.14 + (index % 5) * 0.018) + phase[index] + progress * 0.28;
        positions[offset] = base[offset] + Math.sin(wave) * 0.13;
        positions[offset + 1] = base[offset + 1] + Math.cos(wave * 1.2) * 0.18;
        positions[offset + 2] = base[offset + 2] + Math.sin(wave * 0.72) * 0.045;
      }
      geometry.attributes.position.needsUpdate = true;
    }
    material.opacity = (mobile ? 0.6 : 0.72) * (reducedMotion ? 1 : 0.92 + Math.sin(elapsed * 0.3 + progress) * 0.08);
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  }

  return { points, update, dispose };
}
