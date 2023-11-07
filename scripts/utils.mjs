// @ts-check

import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import typescript from "typescript";

export const mode = process.env["NODE_ENV"] ?? "development";
export const isDev = mode === "development";
export const __dirname = resolve();
export const dirs = {
  source: resolve(__dirname, "src"),
  public: resolve(__dirname, "public"),
  dist: resolve(__dirname, "dist"),
};

/**
 * Reads typescript config
 * @param {string} configPath
 * @returns {Promise<{options: typescript.CompilerOptions, fileNames: string[]}>}
 */
export const readConfig = async (configPath) => {
  const rawConfig = JSON.parse(await readFile(configPath, "utf-8"));
  const basePath = dirname(configPath);
  const { options, fileNames, errors } = typescript.parseJsonConfigFileContent(
    rawConfig,
    typescript.sys,
    basePath,
  );

  if (errors && errors.length) {
    throw new Error(
      typescript.formatDiagnostics(errors, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: process.cwd,
        getNewLine: () => typescript.sys.newLine,
      }),
    );
  }

  return { options, fileNames };
};

/**
 * Does type checking on ts files
 * @returns {Promise<boolean>}
 */
export const typeCheck = async () => {
  const { options, fileNames } = await readConfig("./tsconfig.json");
  const program = typescript.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = typescript
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  let hasErrors = false;

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.category === typescript.DiagnosticCategory.Error) {
      hasErrors = true;
    }

    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start ?? 0,
      );
      const message = typescript.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n",
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${
          character + 1
        }): ${message}`,
      );
    } else {
      console.log(
        typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      );
    }
  });

  return !hasErrors;
};

export const updateManifestWithPackageVersions = async () => {
  const packageJson = JSON.parse(
    await readFile(resolve(__dirname, "package.json"), "utf-8"),
  );

  const extpkgVersions = {};

  for (const [key, value] of Object.entries(packageJson.devDependencies)) {
    if (key.startsWith("@extpkg/types")) {
      extpkgVersions[key.split("@extpkg/types-")[1]] = value.replace("^", "");
    }
  }

  const manifestJson = JSON.parse(
    await readFile(resolve(dirs.dist, "manifest.json"), "utf-8"),
  );

  for (const [key, value] of Object.entries(extpkgVersions)) {
    if (manifestJson.modules[key]) {
      manifestJson.modules[key].module_version = value;
    }
  }

  await writeFile(
    resolve(dirs.dist, "manifest.json"),
    JSON.stringify(manifestJson, null, 2),
  );
};

export const clean = async () => {
  try {
    await rm(dirs.dist, { recursive: true, force: true });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const copyAssets = async () => {
  if (existsSync(dirs.public)) {
    await cp(dirs.public, dirs.dist, {
      recursive: true,
    });
  }
};
