import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { finishLogo } from "./logo-materials";
import { setupEnquiry } from "./enquiry";
import { createVideoFlow } from "./video-flow";

gsap.registerPlugin(ScrollTrigger);
const chapters = Array.from(document.querySelectorAll<HTMLElement>(".chapter"));
const copies = chapters.map((chapter) => chapter.querySelector<HTMLElement>(".chapter-copy")!);
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".chapter-nav a"));
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
const enquiryForm = document.querySelector<HTMLElement>("#enquiry-form")!;
const videoFlow = createVideoFlow();
const state = { position: 0 };
let paused = motionPreference.matches;
let starts: number[] = [];
let enquiryStop = 0;
let currentPosition = 0;
let requestedPosition = -1;
let activeChapter = -1;
let renderLogo: (position: number, still: boolean) => void = () => {};
let resizeLogo = () => {};
setupEnquiry(() => {});

function measure() {
  starts = chapters.map((chapter) => chapter.getBoundingClientRect().top + window.scrollY);
  enquiryStop = enquiryForm.getBoundingClientRect().top + window.scrollY - 104;
}
function updateVisuals(position: number, still = false) {
  videoFlow.update(position, still);
  const index = Math.min(7, Math.floor(position));
  const fraction = position - index;
  const blend = THREE.MathUtils.smootherstep(fraction, 0.18, 0.82);
  const right = still ? Math.round(position) % 2 : THREE.MathUtils.lerp(index % 2, Math.min(7, index + 1) % 2, blend);
  document.documentElement.style.setProperty("--copy-right", String(right));
  renderLogo(position, still);
}
function readScroll() {
  const y = window.scrollY;
  let index = 0;
  while (index < starts.length - 1 && y >= starts[index + 1]) index++;
  const distance = (starts[index + 1] ?? starts[index] + window.innerHeight) - starts[index];
  currentPosition = index === 7
    ? 7 + THREE.MathUtils.clamp((y - starts[7]) / Math.max(1, enquiryStop - starts[7]), 0, 1)
    : index + THREE.MathUtils.clamp((y - starts[index]) / distance, 0, 1);
  const chapter = Math.min(7, Math.round(currentPosition));
  if (chapter !== activeChapter) {
    activeChapter = chapter;
    links.forEach((link, i) => { if (i === chapter) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
  }
  const formAtTop = enquiryForm.getBoundingClientRect().top <= 105;
  document.body.classList.toggle("past-journey", formAtTop);
  document.body.classList.toggle("form-at-top", formAtTop);
  document.body.classList.toggle("closing-active", chapter === 7);
  document.querySelector(".site-header")!.classList.toggle("scrolled", y > 60);
  if (paused) {
    // With motion disabled, imagery and logo change discretely with the chapter.
    // No sweeping across the viewport, and no logo sitting on alternating copy.
    state.position = chapter;
    updateVisuals(chapter, true);
  } else if (currentPosition !== requestedPosition) {
    requestedPosition = currentPosition;
    gsap.to(state, { position: currentPosition, duration: 0.8, ease: "power2.out", overwrite: true, onUpdate: () => updateVisuals(state.position) });
  }
  copies.forEach((copy, i) => {
    const delta = Math.abs(currentPosition - i);
    // Native scrolling carries the copy; only a subtle fade is applied near exits.
    copy.style.opacity = paused ? "1" : String(1 - THREE.MathUtils.smoothstep(delta, 0.28, 0.85) * 0.88);
  });
}
motionPreference.addEventListener("change", () => {
  paused = motionPreference.matches;
  gsap.killTweensOf(state);
  requestedPosition = -1;
  document.body.classList.toggle("motion-paused", paused);
  readScroll();
});
document.body.classList.toggle("motion-paused", paused);

function initializeHeadingEffects() {
  const headings = Array.from(document.querySelectorAll<HTMLElement>(".chapter h1, .chapter h2, .contact-section h2"));
  if (motionPreference.matches) {
    headings.forEach((heading) => heading.classList.add("heading-visible"));
    return;
  }
  headings.forEach((heading) => {
    heading.classList.add("heading-reveal");
    gsap.fromTo(heading,
      { autoAlpha: 0.12, y: 46, filter: "blur(9px)", clipPath: "inset(0 0 100% 0)" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: "power3.out", scrollTrigger: { trigger: heading, start: "top 88%", once: true } },
    );
    const accent = heading.querySelector("em");
    if (accent) gsap.fromTo(accent, { x: -22 }, { x: 0, duration: 1.2, ease: "power3.out", delay: 0.12, scrollTrigger: { trigger: heading, start: "top 88%", once: true } });
  });
}
initializeHeadingEffects();

function initializeElementEffects() {
  const groups = [
    ".service-list button",
    ".principles li",
    ".space-grid a",
    ".consultancy-points li",
    ".care-grid li",
    ".process-list li",
  ];
  if (motionPreference.matches) return;
  groups.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
      gsap.fromTo(element,
        { autoAlpha: 0, y: 24, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, delay: Math.min(index % 4, 3) * 0.08, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 91%", once: true } },
      );
    });
  });
  document.querySelectorAll<HTMLElement>(".chapter-copy>p, .chapter-copy>.button, .chapter-copy>.actions, .chapter-copy>.text-link").forEach((element) => {
    gsap.fromTo(element,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 92%", once: true } },
    );
  });
}
initializeElementEffects();

function initializeLogo() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 700 ? 1.5 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 30);
  camera.position.set(0, 0, 6);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new RoomEnvironment();
  scene.environment = pmrem.fromScene(studio, 0.04).texture;
  scene.environmentIntensity = 1.1;
  studio.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777568, 0.65));
  const key = new THREE.DirectionalLight(0xfff4df, 2.1);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.25);
  rim.position.set(-4, 3, 2);
  scene.add(rim);
  const rig = new THREE.Group();
  scene.add(rig);
  let loaded = false;
  const headingElements = chapters.map((chapter) => chapter.querySelector<HTMLElement>("h1, h2")!);
  new GLTFLoader().load("/models/maai-logo.glb", (gltf) => {
    const logo = gltf.scene;
    logo.position.sub(new THREE.Box3().setFromObject(logo).getCenter(new THREE.Vector3()));
    logo.traverse((child) => { if (child instanceof THREE.Mesh) finishLogo(child); });
    rig.add(logo); loaded = true;
    canvas.dataset.logoLoaded = "true";
    renderLogo(state.position, paused);
  }, undefined, () => {
    canvas.dataset.logoLoaded = "error";
  });

  renderLogo = (position, _still) => {
    const w = window.innerWidth, h = window.innerHeight;
    const mobile = w <= 700;
    const journey = THREE.MathUtils.clamp(position, 0, 7.999);
    const step = Math.min(7, Math.floor(journey));
    const local = journey - step;
    const next = Math.min(7, step + 1);
    const horizontal = THREE.MathUtils.smootherstep(local, 0.06, 0.94);
    const sideAt = (chapter: number) => chapter % 2 ? -1 : 1;
    const side = THREE.MathUtils.lerp(sideAt(step), sideAt(next), horizontal);
    const x = mobile ? 0.5 : 0.5 + side * 0.235;
    const titleY = (chapter: number) => {
      const rect = headingElements[chapter].getBoundingClientRect();
      return (rect.top + rect.height * 0.5) / h;
    };
    // Keep the mark settled at the centre of its left/right visual column.
    // The hero sits a little lower to balance the larger two-line headline.
    const stableY = (chapter: number) => mobile
      ? 0.3 + Math.min(chapter, 6) * 0.012
      : 0.51 + Math.min(chapter, 6) * 0.018;
    const currentY = step === 7 ? titleY(step) : stableY(step);
    const nextY = next === 7 ? titleY(next) : stableY(next);
    // Begin at the first scroll movement and complete exactly as the next
    // chapter arrives. The eased path starts promptly, then lands softly.
    const entrance = 1 - (1 - local) ** 2;
    // It remains stable first, then shifts downward into the next position
    // with one turn. There is no upward exit movement.
    const finalFollow = THREE.MathUtils.smootherstep(local, 0, 0.26);
    const y = step === 7
      ? THREE.MathUtils.lerp(stableY(6), currentY, finalFollow)
      : step === 6
        ? currentY
        : THREE.MathUtils.lerp(currentY, nextY, entrance);
    const chapterScale = (chapter: number) => mobile
      ? (chapter === 7 ? 1.28 : 1.23)
      : (chapter === 0 ? 1.3 : chapter === 7 ? 1.34 : 1.17);
    const currentScale = chapterScale(step);
    const nextScale = chapterScale(next);
    const scale = THREE.MathUtils.lerp(currentScale, nextScale, horizontal);
    camera.aspect = w / h;
    camera.zoom = mobile ? Math.min(0.74, w / h * 1.35) : Math.min(1, w / h * 0.68);
    camera.setViewOffset(w, h, (0.5 - x) * w, (0.5 - y) * h, w, h);
    camera.updateProjectionMatrix();
    rig.scale.setScalar(scale);
    // A 360° turn follows the full journey into the next page. At the
    // boundary, 2π becomes 0 again, which keeps the mark front-facing.
    const turn = _still || step === 7 ? 0 : entrance * Math.PI * 2;
    rig.rotation.set(0, turn, 0);
    canvas.dataset.logoX = x.toFixed(4);
    canvas.dataset.logoY = y.toFixed(4);
    canvas.dataset.logoVisible = "true";
    canvas.dataset.logoRotation = rig.rotation.y.toFixed(4);
    canvas.dataset.motionPosition = position.toFixed(4);
    canvas.dataset.logoPose = [x, y, rig.scale.x, rig.rotation.y].map(n => n.toFixed(4)).join(",");
    if (loaded && !document.hidden) renderer.render(scene, camera);
  };
  resizeLogo = () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 700 ? 1.5 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderLogo(state.position, paused);
  };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) renderLogo(state.position, paused); });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault(); canvas.style.visibility = "hidden";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    canvas.style.visibility = "visible"; renderLogo(state.position, paused);
  });
  renderLogo(0, paused);
}
try { initializeLogo(); } catch {
  canvas.style.display = "none";
  canvas.dataset.logoLoaded = "error";
}
measure();
ScrollTrigger.create({ trigger: "#journey", start: "top top", end: "bottom top", onUpdate: readScroll, onRefresh: () => { measure(); readScroll(); } });
window.addEventListener("scroll", readScroll, { passive: true });
window.addEventListener("resize", () => { measure(); resizeLogo(); readScroll(); });
document.fonts.ready.then(() => { measure(); ScrollTrigger.refresh(); });
readScroll();
