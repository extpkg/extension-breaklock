import { applyI18n } from "./i18n.mjs";
import fs from "fs";
import { promisify } from "util";
import { join } from "path";
import { buildFolder, rootFolder } from "./paths.mjs";
import { getL10nData } from "./i18n.mjs";
import { productionCompiler, developmentCompiler } from "./webpackCompiler.mjs";
import fsExtra from "fs-extra";

const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rm);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const cp    = fsExtra.copy;

const devMode = process.env.NODE_ENV;

const handleRelativeCopy = async (from, to) => {
  const text = (await readFile(from)).toString();
  await writeFile(
    to,
    text.replace('../', './'),
  );
};

const build = async () => {
  await rmdir(buildFolder, { recursive: true , force: true});
  await mkdir(buildFolder);
  console.log('Webpacking...');
  await new Promise((res)=> {
    const compiler = devMode === 'development' ? developmentCompiler : productionCompiler;
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(stats.toString({ colors: true }));
        process.exit(0);
      }
      res();
    });
  });
  console.log('Copying files...');
  await Promise.all([
    cp(join(rootFolder, 'index.html'), join(buildFolder, 'index.html')),
    cp(join(rootFolder, 'assets'), join(buildFolder, 'assets')),
  ]);
  console.log('Localizing...');
  const l10n = await getL10nData();
  const baseDict = l10n.find((x)=>x.code==='en').data;
  await Promise.all(l10n.map(async (x)=>{
    await mkdir(join(buildFolder, x.code));
    const dict = { ...baseDict, ...x.data };
    await Promise.all([
      applyI18n(
        join(buildFolder, 'index.html'),
        join(buildFolder, `${x.code}/index.html`),
        dict,
      ),
      applyI18n(
        join(buildFolder, 'app.js'),
        join(buildFolder, `${x.code}/app.js`),
        dict,
      ),
      cp(
        join(buildFolder, 'app.css'),
        join(buildFolder, `${x.code}/app.css`),
      )
    ]);
  }));
  await Promise.all([
    handleRelativeCopy(join(buildFolder, 'en', 'app.css'), join(buildFolder, 'app.css')),
    handleRelativeCopy(join(buildFolder, 'en', 'index.html'), join(buildFolder, 'index.html')),
    handleRelativeCopy(join(buildFolder, 'en', 'app.js'), join(buildFolder, 'app.js')),
  ]);
  console.log('Finished successfully.');
};

build();
