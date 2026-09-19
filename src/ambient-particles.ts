import * as THREE from "three";

/** Lightweight depth field rendered behind the MAAI logo. */
export function createAmbientParticles(mobile: boolean) {
  const count = mobile ? 42 : 88;
  const positions = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const gold = new THREE.Color(0xe5c078);
  const green = new THREE.Color(0x85c96d);
  const color = new THREE.Color();

  for (let index = 0; index < count; index++) {
    const offset = index * 3;
    const radius = 1.1 + Math.random() * 3.2;
    const angle = Math.random() * Math.PI * 2;
    base[offset] = Math.cos(angle) * radius;
    base[offset + 1] = (Math.random() - 0.5) * 4.4;
    base[offset + 2] = -1.8 + Math.random() * 2.7;
    positions[offset] = base[offset];
    positions[offset + 1] = base[offset + 1];
    positions[offset + 2] = base[offset + 2];
    phase[index] = Math.random() * Math.PI * 2;
    color.copy(index % 3 === 0 ? gold : green).multiplyScalar(0.72 + Math.random() * 0.28);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: mobile ? 0.028 : 0.034,
    transparent: true,
    opacity: mobile ? 0.3 : 0.42,
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
        const wave = elapsed * (0.18 + (index % 5) * 0.025) + phase[index] + progress * 1.6;
        positions[offset] = base[offset] + Math.sin(wave) * 0.09;
        positions[offset + 1] = base[offset + 1] + Math.cos(wave * 1.3) * 0.14;
        positions[offset + 2] = base[offset + 2] + Math.sin(wave * 0.7) * 0.07;
      }
      geometry.attributes.position.needsUpdate = true;
      points.rotation.z = Math.sin(elapsed * 0.08) * 0.035;
    }
    material.opacity = (mobile ? 0.3 : 0.42) * (0.82 + Math.sin(elapsed * 0.7 + progress) * 0.18);
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
  }

  return { points, update, dispose };
}
