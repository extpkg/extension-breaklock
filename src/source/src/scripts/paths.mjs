import path from "path";
export const rootFolder = path.join(process.cwd(), 'src/source');
export const buildFolder = path.join(rootFolder, 'build');
export const targetFolder = path.join(process.cwd(), 'dist/target');
