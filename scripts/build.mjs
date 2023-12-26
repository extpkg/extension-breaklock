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
import { execSync } from "node:child_process";

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

if (process.env.NODE_ENV === "production") {
  try {
    execSync("(rm -f dist.zip && cd dist && zip -r ../dist.zip .)", {
      stdio: "inherit",
    });
  } catch (error) {
    console.error("Error running npm run build:", error);
    process.exit(1);
  }
}