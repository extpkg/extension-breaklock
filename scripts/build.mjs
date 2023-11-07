// @ts-check

import * as esbuild from "esbuild";
import {
  clean,
  copyAssets,
  typeCheck,
  updateManifestWithPackageVersions,
} from "./utils.mjs";
import { appBuildOptions, extBuildOptions } from "./esbuild.config.mjs";
import { localize } from "./i18n.mjs";

export const build = async () => {
  await clean();
  const isTypeCheckOk = await typeCheck();
  if (!isTypeCheckOk) process.exit(1);

  await esbuild.build(appBuildOptions);
  await esbuild.build(extBuildOptions);

  await copyAssets();
  await localize();
  await updateManifestWithPackageVersions();
};

await build();
