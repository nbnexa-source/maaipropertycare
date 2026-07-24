import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-driven camera path.
 *
 * There is one waypoint per <section>. As you scroll, the camera eases from one
 * waypoint to the next. With "reduce motion" enabled we skip the sweep and snap
 * the camera to whichever section is in view instead.
 */

// ---- waypoints: edit these to change the journey --------------------------

type Waypoint = { camera: [number, number, number]; look: [number, number, number] };

const WAYPOINTS: Waypoint[] = [
  { camera: [0, 0, 6], look: [0, 0, 0] },
  { camera: [4, 1, 4], look: [0, 0, 0] },
  { camera: [0, 3, 3], look: [0, 0, 0] },
  { camera: [-4, 0, 4], look: [0, 0, 0] },
  { camera: [0, 0, 9], look: [0, 0, 0] },
];

// ---- scene ----------------------------------------------------------------

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#070a12");
scene.fog = new THREE.FogExp2("#070a12", 0.06);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(...WAYPOINTS[0].camera);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.PointLight(0x88aaff, 60, 0, 2);
light.position.set(3, 4, 5);
scene.add(light);

// A little cloud of shapes to fly around.
const shapes = new THREE.Group();
const geo = new THREE.IcosahedronGeometry(0.4, 0);
for (let i = 0; i < 40; i++) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.6, 0.55),
    roughness: 0.4,
    metalness: 0.1,
    flatShading: true,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10);
  m.scale.setScalar(0.5 + Math.random());
  shapes.add(m);
}
scene.add(shapes);

// ---- camera movement ------------------------------------------------------

const lookTarget = new THREE.Vector3(...WAYPOINTS[0].look);

function applyWaypoint(w: Waypoint) {
  camera.position.set(...w.camera);
  lookTarget.set(...w.look);
}

if (reducedMotion) {
  // No scrubbed motion. Snap to the section that scrolls into view.
  const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-step]"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const step = Number(e.target.getAttribute("data-step"));
          applyWaypoint(WAYPOINTS[step] ?? WAYPOINTS[0]);
        }
      }
    },
    { threshold: 0.5 },
  );
  sections.forEach((s) => io.observe(s));
} else {
  // Build one scrubbed timeline that tweens the camera through every waypoint.
  const proxy = {
    x: WAYPOINTS[0].camera[0],
    y: WAYPOINTS[0].camera[1],
    z: WAYPOINTS[0].camera[2],
    lx: WAYPOINTS[0].look[0],
    ly: WAYPOINTS[0].look[1],
    lz: WAYPOINTS[0].look[2],
  };
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    },
  });
  for (let i = 1; i < WAYPOINTS.length; i++) {
    const w = WAYPOINTS[i];
    tl.to(proxy, {
      x: w.camera[0],
      y: w.camera[1],
      z: w.camera[2],
      lx: w.look[0],
      ly: w.look[1],
      lz: w.look[2],
      ease: "power1.inOut",
      onUpdate: () => {
        camera.position.set(proxy.x, proxy.y, proxy.z);
        lookTarget.set(proxy.lx, proxy.ly, proxy.lz);
      },
    });
  }
}

// ---- resize + loop --------------------------------------------------------

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  if (!reducedMotion) shapes.rotation.y += 0.001;
  camera.lookAt(lookTarget);
  renderer.render(scene, camera);
});
