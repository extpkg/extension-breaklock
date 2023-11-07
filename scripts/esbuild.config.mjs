//@ts-check

import metaUrlPlugin from "@chialab/esbuild-plugin-meta-url";
import { sassPlugin } from "esbuild-sass-plugin";
import { isDev } from "./utils.mjs";

/**
 * @type {import('esbuild').BuildOptions}
 */
export const buildOptions = {
  bundle: true,
  sourcemap: isDev,
  minify: !isDev,
  format: "esm",
  target: "chrome100",
  plugins: [metaUrlPlugin(), sassPlugin()],
};

/**
 * @type {import('esbuild').BuildOptions}
 */
export const appBuildOptions = {
  ...buildOptions,
  entryPoints: ["./src/app/index.js"],
  loader: {
    ".css": "css",
    ".woff": "file",
    ".woff2": "file",
    ".ttf": "file",
  },
  outdir: "./dist/app/",
};

/**
 * @type {import('esbuild').BuildOptions}
 */
export const extBuildOptions = {
  ...buildOptions,
  entryPoints: ["./src/ext/main.ts"],
  outdir: "./dist",
};
