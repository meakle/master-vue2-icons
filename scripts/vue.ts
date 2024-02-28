import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import { createPackage, deleteFilesRecursively, genCompFile, preprocessSvg } from './utils';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const getVueExportTemplate = (svg: string, name: string) => {
  const propsHandle = svg.replace('<svg', '<svg\n:style="{fontSize:size,color: fill,transform:`rotate(${rotate}deg)`}"\n')

  const temp = 
`
<template>
  ${propsHandle}
</template>

<script lang="ts">
export default {
  name: '${name}',
  props: {
    size: {
      type: String,
      default: 'inherit'
    },
    rotate: {
      type: String,
      default: '0'
    },
    fill: {
      type: String,
      default: 'none'
    }
  }
};
</script>
`
return temp;
}

const genIndexFile = (path: string) => {
  const temp =
`
import * as iconMap from './map';
export { iconMap };

export * from './map';
  
export function install(Vue) {
  Object.values(iconMap).forEach(icon => {
      Vue.component(icon.name, icon);
  });
}
  `;
  fs.writeFileSync(path, temp)
}

const genMappingFile = (
  mappingFilePath: string,
  svgSet: Set<string>
) => {
  const getMappingExportTemplate = (component: string) => {
    const svgName = path.basename(component, '.svg');
    const temp = `export { default as ${svgName} } from './icons/${svgName}.vue';`
    return temp;
  }

  const mappingExportTemplate = Array.from(svgSet).map(getMappingExportTemplate).join('\n');
  fs.writeFileSync(mappingFilePath, mappingExportTemplate);
}

export const genVue = (sourcesSVGs: string[]) => {
  const vue2Config = {
    targetComponents: path.resolve(dirname, '../icons'),
    mapDirPath: path.resolve(dirname, '../map.ts'),
    indexDirPath: path.resolve(dirname, '../index.ts'),
  }

  const { targetComponents, mapDirPath, indexDirPath } = vue2Config;

  [targetComponents, mapDirPath, indexDirPath].forEach(deleteFilesRecursively);

  const iconsSet = new Set<string>();

  for (const sourcesSVG of sourcesSVGs) {
    fs.readdirSync(sourcesSVG).forEach((icon) => iconsSet.add(icon));
    const packageDir = createPackage(targetComponents);

    genCompFile(sourcesSVG, packageDir, (sourcePath, targetDir) => {
      const sourceFileName = path.basename(sourcePath, '.svg');
      const targetPath = path.resolve(targetDir, `${sourceFileName}.vue`);

      const sourceContent = preprocessSvg(fs.readFileSync(sourcePath, 'utf-8'));
      const vueCompString = getVueExportTemplate(sourceContent, sourceFileName);

      fs.writeFileSync(targetPath, vueCompString);
    })
  }

  genMappingFile(mapDirPath, iconsSet);
  genIndexFile(indexDirPath)
}
