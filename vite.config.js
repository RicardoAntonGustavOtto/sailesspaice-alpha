/** @format */

import { sveltekit } from "@sveltejs/kit/vite";
import yaml from "@rollup/plugin-yaml";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), yaml()],
  assetsInclude: ["**/*.yaml"],
};

export default config;
