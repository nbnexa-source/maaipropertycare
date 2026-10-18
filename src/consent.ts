// Small, dismissible cookie notice. The choice is remembered in localStorage.
import "./consent.css";

const KEY = "maai-cookie-consent";

function readChoice(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function showBanner(): void {
  if (readChoice()) return;
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie notice");
  banner.innerHTML =
    '<p>We use cookies to run this site, understand visits and, in future, show ads from Google. See our <a href="/privacy-policy/">Privacy Policy</a>.</p>' +
    '<button type="button">OK, got it</button>';
  banner.querySelector("button")?.addEventListener("click", () => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    } catch {
      /* storage blocked: just hide for this visit */
    }
    banner.classList.remove("is-visible");
    window.setTimeout(() => banner.remove(), 400);
  });
  document.body.appendChild(banner);
  window.requestAnimationFrame(() => banner.classList.add("is-visible"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showBanner);
} else {
  window.setTimeout(showBanner, 1200);
}
