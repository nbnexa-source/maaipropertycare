// Light script for blog and information pages: no 3D, only gentle reveals.
import "./consent";

const header = document.querySelector(".page-header");
const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 12);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
if (reduce || !("IntersectionObserver" in window)) {
  items.forEach((el) => el.classList.add("is-in"));
} else {
  document.documentElement.classList.add("reveal-ready");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  items.forEach((el) => io.observe(el));
}

// Highlight the current section in the article table of contents.
const tocLinks = document.querySelectorAll<HTMLAnchorElement>(".toc a[href^='#']");
if (tocLinks.length && "IntersectionObserver" in window) {
  const map = new Map<Element, HTMLAnchorElement>();
  tocLinks.forEach((a) => {
    const target = document.getElementById(a.hash.slice(1));
    if (target) map.set(target, a);
  });
  const tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((a) => a.removeAttribute("aria-current"));
        map.get(entry.target)?.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-20% 0px -70% 0px" },
  );
  map.forEach((_a, el) => tocObserver.observe(el));
}
