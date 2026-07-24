import { defineConfig } from "vite";

// base: "./" keeps asset paths relative so the build also works from a
// GitHub Pages project subpath.
export default defineConfig({
  base: "./",
});
