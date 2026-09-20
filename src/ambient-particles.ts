import * as THREE from "three";

/** Full-scene atmospheric depth field, kept behind all foreground logo motion. */
export function createAmbientParticles(mobile: boolean) {
  const count = mobile ? 100 : 240;
  const positions = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const baseColors = new Float32Array(count * 3);
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
    base[offset + 2] = -12 + Math.random() * 15;
    positions[offset] = base[offset];
    positions[offset + 1] = base[offset + 1];
    positions[offset + 2] = base[offset + 2];
    phase[index] = Math.random() * Math.PI * 2;
    color.copy(index % 5 === 0 ? gold : green).multiplyScalar(0.62 + Math.random() * 0.25);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }
  baseColors.set(colors);

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
  // The volume recycles with the camera; its initial bounds are not static.
  points.frustumCulled = false;

  function update(elapsed: number, scrollScreens: number, reducedMotion: boolean) {
    const time = reducedMotion ? 0 : elapsed;
    const travel = reducedMotion ? 0 : scrollScreens * 1.25;
      for (let index = 0; index < count; index++) {
        const offset = index * 3;
        const wave = time * (0.19 + (index % 5) * 0.024) + phase[index];
        // Slow, independent air currents with actual perspective depth travel.
        positions[offset] = base[offset] + Math.sin(wave) * 0.38 + Math.sin(wave * 0.43) * 0.16;
        positions[offset + 1] = base[offset + 1] + Math.cos(wave * 0.72) * 0.55;
        const depth = THREE.MathUtils.euclideanModulo(base[offset + 2] + 12 + travel + Math.sin(wave * 0.5) * 0.22, 15);
        positions[offset + 2] = depth - 12;
        // Fade both ends of the volume so recycling never flashes or pops.
        const fade = THREE.MathUtils.smoothstep(depth, 0, 2) * (1 - THREE.MathUtils.smoothstep(depth, 12, 15));
        for (let channel = 0; channel < 3; channel++) {
          colors[offset + channel] = baseColors[offset + channel] * fade;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    material.opacity = (mobile ? 0.6 : 0.72);
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  }

  return { points, update, dispose };
}
