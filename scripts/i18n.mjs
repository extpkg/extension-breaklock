import { join } from "node:path";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
  copyFile,
  cp,
} from "node:fs/promises";
import { dirs } from "./utils.mjs";
import YAML from "yaml";

export const getI18nData = async () => {
  const i18nFolder = join(dirs.source, "app", "i18n");

  return Promise.all(
    (await readdir(i18nFolder)).map(async (f) => {
      const code = f.slice(0, -4);
      const p = join(i18nFolder, f);
      const data = YAML.parse((await readFile(p)).toString());
      return { code, data };
    }),
  );
};

export const applyI18n = async (from, to, dict) => {
  const input = (await readFile(from)).toString();
  const output = input.replace(/#@[a-z_0-9]+/g, (t) => {
    return dict[t.slice(2)];
  });
  await writeFile(to, output);
};

export const localize = async () => {
  const i18n = await getI18nData();
  const baseDict = i18n.find((x) => x.code === "en")?.data;

  for (const lang of i18n) {
    await mkdir(join(dirs.dist, lang.code));
    await mkdir(join(dirs.dist, lang.code, "app"));
    await cp(join(dirs.dist, "app"), join(dirs.dist, lang.code, "app"), {
      recursive: true,
    });

    const dict = { ...baseDict, ...lang.data };

    await applyI18n(
      join(dirs.dist, "index.html"),
      join(dirs.dist, lang.code, "index.html"),
      dict,
    );
    await applyI18n(
      join(dirs.dist, "app", "index.js"),
      join(dirs.dist, lang.code, "app", "index.js"),
      dict,
    );
    await applyI18n(
      join(dirs.dist, "app", "index.css"),
      join(dirs.dist, lang.code, "app", "index.css"),
      dict,
    );
  }

  await copyFile(
    join(dirs.dist, "en", "index.html"),
    join(dirs.dist, "index.html"),
  );
  await copyFile(
    join(dirs.dist, "en", "app", "index.js"),
    join(dirs.dist, "app", "index.js"),
  );
  await copyFile(
    join(dirs.dist, "en", "app", "index.css"),
    join(dirs.dist, "app", "index.css"),
  );
};
