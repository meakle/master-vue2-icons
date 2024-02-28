import fs from 'fs';
import path from 'path';

import { optimize } from 'svgo';

export const createPackage = (packageDir: string) => {
  fs.existsSync(packageDir) || fs.mkdirSync(packageDir, { recursive: true });  
  return packageDir;
};

export const preprocessSvg = (svgString: string) => {
  let svgO = optimize(svgString).data;

  svgO = svgO
    .replace(/<g[^>]*>((?:\n.*)*)<\/g>/, '$1')
    .replace(/<defs>(\n.*)*<\/defs>/, '')
    .replace('width="16"', 'width="1em"')
    .replace('height="16"', 'height="1em"')
    .replace(/fill="none"/g, '')

  // 判断是否为单色图标, 只有单色图标才会替换fill
  const fillResList = svgO.match(/fill="([^"]*)"/g);
  const isSingleColored  = new Set(fillResList).size <= 1;

  if (isSingleColored) {
    svgO = svgO.replace(/(fill|stroke)=[\'\"](?!none)[^\'\"]*[\'\"]/g, '$1="currentcolor"')
  }

  return svgO;
}

export const genCompFile = (
  sourceDir: string,
  targetDir: string,
  callback: (
    sourcePath: string,
    targetDir: string
  ) => void
) => {
  const sourceList = fs.readdirSync(sourceDir);

  for (const sourceString of sourceList) {
    const sourcePath = path.resolve(sourceDir, sourceString);

    const strategy = {
      isDir: () => genCompFile(sourcePath, targetDir, callback),
      isSvgFile: () => callback(sourcePath, targetDir),
      empty: () => {}
    }

    const isDir = fs.lstatSync(sourcePath).isDirectory() && 'isDir';
    const isSvgFile = sourcePath.endsWith('.svg') && 'isSvgFile';

    const strategyKey = isDir || isSvgFile || 'empty';
    strategy[strategyKey]();
  }
}

export const deleteFilesRecursively = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) return;
  if (fs.lstatSync(dirPath).isFile()) return fs.unlinkSync(dirPath);

  fs.readdirSync(dirPath).forEach(file => {
    const curPath = path.join(dirPath, file)
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFilesRecursively(curPath)
      return;
    }

    fs.unlinkSync(curPath)
  })

  fs.rmdirSync(dirPath)
}

interface IconItem {
  "name": string,
  "catalog": string,
  "ukey": string,
  "signature": string,
  "content": string,
}

interface ConfigJson {
  "version": string,
  "icons": IconItem[],
}

export const genConfigJson = (jsonPath: string, targetPath: string) => {
  // 读取 json 文件
  const jsonObj: ConfigJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  for (const item of jsonObj.icons) {
    const name = item.name;
    const content = item.content;

    const filePath = path.resolve(targetPath, `${name}.svg`);
    fs.writeFileSync(filePath, content);
  }
};
