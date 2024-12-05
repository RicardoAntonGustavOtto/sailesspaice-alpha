/** @format */

import { sveltekit } from "@sveltejs/kit/vite";
import yaml from "@rollup/plugin-yaml";
import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), yaml()],
  assetsInclude: ["**/*.yaml"],
  optimizeDeps: {
    include: ["pdfjs-dist"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ["pdfjs-dist"],
        },
      },
    },
  },
};

export default config;
