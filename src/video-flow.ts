/** The user-supplied film is seeked by scroll, never autoplayed. */
export function createVideoFlow() {
  const container = document.querySelector<HTMLElement>(".backdrop")!;
  const video = document.createElement("video");
  video.id = "property-film";
  video.className = "video-frame";
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.poster = "/videos/maai-property-poster-v4.jpg";
  video.setAttribute("aria-hidden", "true");
  video.setAttribute("disablepictureinpicture", "");
  video.tabIndex = -1;
  video.src = window.innerWidth <= 700
    ? "/videos/maai-property-scroll-v4-mobile.mp4"
    : "/videos/maai-property-scroll-v4.mp4";
  container.append(video);

  let wantedTime = 0;
  let lastPosition = 0;
  let still = false;
  let frameRequest = 0;
  let failed = false;
  const frameDuration = 1 / 30;
  function scheduleSeek() {
    if (!frameRequest && !failed) frameRequest = window.requestAnimationFrame(seek);
  }
  function seek() {
    frameRequest = 0;
    if (failed || document.hidden || video.readyState < 1 || video.seeking) return;
    if (Math.abs(video.currentTime - wantedTime) > frameDuration / 2) {
      // Wait for the decoder to finish before applying the newest target. This
      // coalesces fast scroll updates rather than stacking competing seeks.
      video.currentTime = wantedTime;
    }
  }
  function update(position: number, reducedMotion = false) {
    lastPosition = position;
    still = reducedMotion;
    const end = Number.isFinite(video.duration) ? Math.max(0, video.duration - frameDuration) : 0;
    // Position 8 is reached only when the enquiry form arrives at the header.
    wantedTime = still ? 0 : Math.min(1, Math.max(0, position / 8)) * end;
    video.dataset.targetTime = wantedTime.toFixed(4);
    video.dataset.motionMode = still ? "static" : "scroll";
    scheduleSeek();
  }
  video.addEventListener("loadedmetadata", () => {
    video.dataset.duration = String(video.duration);
    update(lastPosition, still);
  });
  video.addEventListener("loadeddata", () => {
    video.classList.add("is-ready");
    container.dataset.videoReady = "true";
    scheduleSeek();
  });
  video.addEventListener("seeked", () => {
    video.dataset.displayedTime = video.currentTime.toFixed(4);
    scheduleSeek();
  });
  video.addEventListener("error", () => {
    failed = true;
    video.classList.remove("is-ready");
    container.dataset.videoReady = "error";
    const label = document.querySelector<HTMLElement>(".scene-label");
    if (label) label.textContent = "Still preview · video unavailable";
  });
  // The exported background has no audio track; retaining muted + playsInline
  // also keeps mobile browsers from presenting a full-screen media player.
  video.addEventListener("play", () => video.pause());
  document.addEventListener("visibilitychange", () => { if (!document.hidden) scheduleSeek(); });
  update(0);
  return { update };
}
