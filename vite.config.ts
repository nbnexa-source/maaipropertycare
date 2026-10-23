import { defineConfig } from "vite";

// base: "./" keeps asset paths relative so the build also works from a
// GitHub Pages project subpath.
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        property: "property.html",
        blog: "blog/index.html",
        blogSector89Checklist: "blog/buying-affordable-home-sector-89-gurgaon-checklist/index.html",
        about: "about/index.html",
        contact: "contact/index.html",
        privacy: "privacy-policy/index.html",
        terms: "terms-and-conditions/index.html",
        disclaimer: "disclaimer/index.html",
        sale: "sale/index.html",
        rent: "rent/index.html",
        plots: "plots/index.html",
        enquiry: "enquiry/index.html",
        team: "team/index.html",
        teamRavinderSaini: "team/ravinder-saini/index.html",
      },
    },
  },
});
