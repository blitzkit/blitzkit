import { readdir, readFile, writeFile } from "fs/promises";

const SOURCES = "../../packages/closed/protos";
const TARGET = "../../packages/closed/src/unreal/catalogItemAccessor.ts";

const componentPattern = /^message (\w+)Component {/gm;

const files = await readdir(SOURCES).then((files) =>
  files.filter(
    (file) =>
      file.startsWith("blitz_static_") && file.endsWith("_component.proto")
  )
);

const imports: { name: string; file: string }[] = [];

for (const file of files) {
  const content = await readFile(`${SOURCES}/${file}`).then((buffer) =>
    buffer.toString()
  );
  const components = content.matchAll(componentPattern);

  for (const match of components) {
    const name = match[1];
    const duplicate = imports.find((_import) => _import.name === name);

    if (duplicate) {
      console.warn(
        `Duplicate component ${name} across ${duplicate.file}.proto and ${file}`
      );
      continue;
    }

    const importFile = file.replace(".proto", "");

    imports.push({ name, file: importFile });
  }
}

let content = "";

for (const _import of imports) {
  content += `import { ${_import.name}Component } from "@protos/${_import.file}";\n`;
}

content +=
  'import { BaseCatalogItemAccessor } from "./baseCatalogItemAccessor";\n\n';
content +=
  "export class CatalogItemAccessor extends BaseCatalogItemAccessor {\n";

for (const _import of imports) {
  const strippedName = _import.name.replace("BlitzStatic", "");
  const defaultName = strippedName[0].toLowerCase() + strippedName.slice(1);

  content += `  ${strippedName}(name = "${defaultName}Component") {\n`;
  content += `    return this.component(name, ${_import.name}Component);\n`;
  content += "  }\n";
}

content += "}\n";

await writeFile(TARGET, content);
