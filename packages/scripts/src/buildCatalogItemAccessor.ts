import { readdir, readFile, writeFile } from "fs/promises";
import { lowerFirst } from "lodash-es";

const SOURCES = "../../packages/closed/protos";
const TARGET = "../../packages/closed/src/unreal/catalogItemAccessor.ts";

const componentPattern = /^export interface (\w+Component) {/gm;
const componentSuffixPattern = /Component$/;
const tsSuffixPattern = /\.ts$/;
const blitzStaticPrefixPattern = /^BlitzStatic/;

let imports = "";
let methods = "";

const files = await readdir(SOURCES);

for (const file of files) {
  if (!file.endsWith("_component.ts")) continue;

  const buffer = await readFile(`${SOURCES}/${file}`);
  const content = buffer.toString();
  const matches = content.matchAll(componentPattern);

  for (const match of matches) {
    const interfaceName = match[1];
    const componentName = interfaceName.split("_").at(-1)!;
    const fieldName = lowerFirst(
      componentName.replace(blitzStaticPrefixPattern, ""),
    );
    const methodName = componentName.replace(componentSuffixPattern, "");
    const importName = file.replace(tsSuffixPattern, "");

    imports += `import { ${interfaceName} } from "@protos/${importName}";\n`;

    methods += `  ${methodName}(name = "${fieldName}") {\n`;
    methods += `    return this.component(name, ${interfaceName});`;
    methods += "\n  }\n";
  }
}

let body = "";

body += imports;
body +=
  'import { BaseCatalogItemAccessor } from "./baseCatalogItemAccessor";\n\n';
body += `export class CatalogItemAccessor extends BaseCatalogItemAccessor {\n`;
body += methods;
body += `}\n`;

await writeFile(TARGET, body);
