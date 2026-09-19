import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { finishLogo } from "./logo-materials";
import { setupEnquiry } from "./enquiry";
import { createVideoFlow } from "./video-flow";
import { createPropertyCareScene } from "./property-care-scene";

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

function initializePremiumMotion() {
  if (motionPreference.matches) return;
  document.body.classList.add("motion-enhanced");

  // A short opening composition: the headline leads, then the supporting copy
  // and CTA settle in. It remains intentionally restrained for readability.
  const heroCopy = document.querySelector<HTMLElement>(".hero .chapter-copy");
  if (heroCopy) {
    const heroSupport = Array.from(heroCopy.querySelectorAll<HTMLElement>("p, .actions"));
    gsap.fromTo(heroSupport,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.1, ease: "power3.out", delay: 0.28 },
    );
  }

  document.querySelectorAll<HTMLElement>(".eyebrow").forEach((eyebrow) => {
    gsap.fromTo(eyebrow,
      { autoAlpha: 0, x: -14, letterSpacing: "0.8px" },
      { autoAlpha: 1, x: 0, letterSpacing: "2.5px", duration: 0.68, ease: "power3.out", scrollTrigger: { trigger: eyebrow, start: "top 89%", once: true } },
    );
  });

  const spaces = document.querySelector<HTMLElement>("#spaces .space-grid");
  if (spaces) {
    gsap.fromTo(spaces, { y: 26 }, {
      y: -12,
      ease: "none",
      scrollTrigger: { trigger: "#spaces", start: "top bottom", end: "bottom top", scrub: 0.55 },
    });
  }

  const process = document.querySelector<HTMLElement>(".process-list");
  if (process) {
    gsap.fromTo(process, { "--path-progress": 0 }, {
      "--path-progress": 1,
      ease: "none",
      scrollTrigger: { trigger: process, start: "top 78%", end: "bottom 58%", scrub: 0.45 },
    });
  }

  // Small magnetic response gives CTAs a physical feel without shifting layout.
  document.querySelectorAll<HTMLElement>(".button, .header-cta, .floating-talk, .guided-form-button").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
      gsap.to(element, { x, y, duration: 0.34, ease: "power3.out", overwrite: "auto" });
    });
    element.addEventListener("pointerleave", () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.62, ease: "elastic.out(1, 0.55)", overwrite: "auto" });
    });
  });
}
initializePremiumMotion();

function initializeLocationMotion() {
  const section = document.querySelector<HTMLElement>(".location-section");
  const camera = document.querySelector<HTMLElement>(".map-camera");
  const marker = document.querySelector<HTMLElement>(".map-marker");
  const copy = document.querySelector<HTMLElement>(".location-copy");
  if (!section || !camera || !marker || !copy) return;
  if (motionPreference.matches) {
    section.classList.add("location-visible");
    return;
  }
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom bottom", scrub: 0.7 },
  });
  timeline
    .fromTo(camera, { scale: 0.84, yPercent: 5, rotateX: 7 }, { scale: 2.12, yPercent: 0, rotateX: 0, ease: "none" }, 0)
    .fromTo(marker, { autoAlpha: 0, scale: 0.45, y: 34 }, { autoAlpha: 1, scale: 1, y: 0, ease: "power3.out", duration: 0.26 }, 0.56)
    .fromTo(copy, { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.3 }, 0.63);
}
initializeLocationMotion();

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
  const propertyCareScene = createPropertyCareScene();
  rig.add(propertyCareScene.group);
  let loaded = false;
  let orbitFrame = 0;
  let lastOrbitFrame = 0;
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
    // Preserve the original left/right rhythm on every chapter change. The
    // travel begins with the first scroll movement and lands at the boundary.
    const horizontal = THREE.MathUtils.smootherstep(local, 0, 1);
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
    // A gentle dolly adds depth to the existing view-offset camera path while
    // keeping the logo alignment with each chapter's typography intact.
    camera.position.z = 6 - (mobile ? 0.1 : 0.22) * Math.sin(local * Math.PI);
    camera.setViewOffset(w, h, (0.5 - x) * w, (0.5 - y) * h, w, h);
    camera.updateProjectionMatrix();
    rig.scale.setScalar(scale);
    // A 360° turn follows the full journey into the next page. At the
    // boundary, 2π becomes 0 again, which keeps the mark front-facing.
    const turn = _still || step === 7 ? 0 : entrance * Math.PI * 2;
    rig.rotation.set(0, turn, 0);
    propertyCareScene.update(journey / 8, mobile, _still, performance.now() / 1000);
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
  const animateOrbit = (time: number) => {
    orbitFrame = window.requestAnimationFrame(animateOrbit);
    // 45fps is visually smooth for this slow ambient movement and leaves more
    // time for video decoding and scroll work on mid-range mobile devices.
    if (paused || document.hidden || !loaded || time - lastOrbitFrame < 1000 / 45) return;
    lastOrbitFrame = time;
    const mobile = window.innerWidth <= 700;
    propertyCareScene.update(THREE.MathUtils.clamp(state.position, 0, 7.999) / 8, mobile, false, time / 1000);
    renderer.render(scene, camera);
  };
  orbitFrame = window.requestAnimationFrame(animateOrbit);
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(orbitFrame), { once: true });
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
