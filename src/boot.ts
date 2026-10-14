// Tiny entry: lets DOMContentLoaded fire immediately, then loads the 3D/scroll experience.
import("./main");
// Safety net: never leave the loading screen up if WebGL or the network is slow.
setTimeout(() => document.getElementById("site-loader")?.classList.add("is-done"), 3500);
