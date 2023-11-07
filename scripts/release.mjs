// @ts-check

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
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

if (!existsSync("key.pem")) {
  console.error("key.pem file not found!");
  process.exit(1);
}

const outputFileName = process.argv[2] || "extension.ext";

try {
  execSync(`npx ext-packager pack ./dist -k key.pem -o ${outputFileName} -f`, {
    stdio: "inherit",
  });
} catch (error) {
  console.error("Error running npm run release:", error);
  process.exit(1);
}
