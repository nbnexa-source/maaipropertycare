import * as THREE from "three";

/**
 * A small, reusable visual layer for the existing MAAI mark. It deliberately
 * uses just a few transparent meshes so the logo remains the star and mobile
 * GPU cost stays negligible.
 */
export function createPropertyCareScene() {
  const group = new THREE.Group();
  group.position.z = -0.36;

  const gold = new THREE.MeshBasicMaterial({ color: 0xe5c078, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const leaf = new THREE.MeshBasicMaterial({ color: 0x8fcc66, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.012, 6, 72, Math.PI * 1.72), gold);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.008, 6, 60, Math.PI * 1.2), leaf);
  ringA.rotation.z = -0.56;
  ringB.rotation.z = 0.62;
  group.add(ringA, ringB);

  const glowGeometry = new THREE.SphereGeometry(0.038, 10, 10);
  const glows = Array.from({ length: 5 }, (_, index) => {
    const glow = new THREE.Mesh(glowGeometry, index % 2 ? gold : leaf);
    const angle = (index / 5) * Math.PI * 2;
    glow.position.set(Math.cos(angle) * 1.16, Math.sin(angle) * 1.16, 0.04);
    group.add(glow);
    return glow;
  });

  function update(progress: number, mobile: boolean, reducedMotion: boolean, elapsed = 0) {
    const pulse = reducedMotion ? 0 : 0.5 + Math.sin(elapsed * 1.15 + progress * Math.PI * 2) * 0.5;
    const visible = mobile ? 0.12 : 0.2;
    gold.opacity = visible * (0.72 + pulse * 0.28);
    leaf.opacity = visible * (0.55 + pulse * 0.22);
    group.rotation.z = reducedMotion ? 0 : progress * 0.24 + elapsed * 0.075;
    group.scale.setScalar(mobile ? 0.86 : 1);
    ringA.rotation.y = reducedMotion ? 0 : progress * 0.18 + Math.sin(elapsed * 0.52) * 0.16;
    ringB.rotation.y = reducedMotion ? 0 : -progress * 0.14 + Math.cos(elapsed * 0.42) * 0.13;
    glows.forEach((glow, index) => {
      const orbit = (index / glows.length) * Math.PI * 2 + (reducedMotion ? 0 : elapsed * (index % 2 ? -0.16 : 0.2));
      const radius = 1.15 + Math.sin(elapsed * 0.6 + index) * 0.045;
      glow.position.set(Math.cos(orbit) * radius, Math.sin(orbit) * radius, 0.04 + Math.sin(orbit * 2) * 0.055);
      const flicker = reducedMotion ? 1 : 0.72 + Math.sin(elapsed * 1.8 + progress * Math.PI * 4 + index) * 0.28;
      glow.scale.setScalar(flicker);
    });
  }

  return { group, update };
}
