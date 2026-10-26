// Shared header: accessible mobile menu toggle. Imported by every entry.
import "./site-header.css";

const header = document.querySelector<HTMLElement>(".mpc-header");
const toggle = header?.querySelector<HTMLButtonElement>(".mpc-toggle");
const nav = header?.querySelector<HTMLElement>(".mpc-nav");
if (header && toggle && nav) {
  const mq = window.matchMedia("(max-width: 1180px)");
  const setOpen = (open: boolean, focusToggle = false) => {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("mpc-menu-open", open);
    if (open) nav.querySelector<HTMLAnchorElement>("a")?.focus();
    else if (focusToggle) toggle.focus();
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("is-open")) setOpen(false, true); });
  document.addEventListener("click", (e) => { if (header.classList.contains("is-open") && !header.contains(e.target as Node)) setOpen(false); });
  mq.addEventListener("change", () => setOpen(false));
}
