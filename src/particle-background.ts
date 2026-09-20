import * as THREE from "three";
import { createAmbientParticles } from "./ambient-particles";
import "./sunbeam.css";

/** A shared, fixed 3D particle canvas that stays behind page content. */
export function initializeParticleBackground(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 30);
  camera.position.z = 6;
  const particles = createAmbientParticles(window.innerWidth <= 700);
  scene.add(particles.points);
  let frame = 0;
  let lastFrame = 0;
  let scrollScreens = window.scrollY / Math.max(1, window.innerHeight);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width <= 700 ? 1.25 : 1.5));
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function draw(time: number) {
    frame = window.requestAnimationFrame(draw);
    if (document.hidden || time - lastFrame < 1000 / 40) return;
    const delta = Math.min((time - lastFrame) / 1000, 0.1);
    lastFrame = time;
    const target = window.scrollY / Math.max(1, window.innerHeight);
    scrollScreens = THREE.MathUtils.lerp(scrollScreens, target, 1 - Math.exp(-7 * delta));
    camera.position.x = reducedMotion.matches ? 0 : Math.sin(scrollScreens * 0.4) * 0.32;
    camera.position.y = reducedMotion.matches ? 0 : Math.sin(scrollScreens * 0.3) * 0.18;
    particles.update(time / 1000, scrollScreens, reducedMotion.matches);
    renderer.render(scene, camera);
  }

  resize();
  particles.update(0, 0, reducedMotion.matches);
  renderer.render(scene, camera);
  frame = window.requestAnimationFrame(draw);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(frame);
    particles.dispose();
    renderer.dispose();
  }, { once: true });
}
