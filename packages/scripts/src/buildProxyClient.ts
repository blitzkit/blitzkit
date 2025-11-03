import { readFile, writeFile } from "fs/promises";

const IMPORT = "@protos/auto_legacy_proxy_client";
const SOURCE = "../../packages/closed/protos/auto_legacy_proxy_client.proto";
const TARGET = "../../packages/closed/src/unreal/methodPopulatedProxyClient.ts";

const requestPattern = /^message (\w+)Request {/gm;
const source = await readFile(SOURCE).then((buffer) => buffer.toString());
const requests = source.matchAll(requestPattern);

const imports: string[] = [];
const names: string[] = [];

for (const match of requests) {
  const name = match[1];

  imports.push(`${name}Request`, `${name}Response`);
  names.push(name);
}

let content = "";

content += "import {\n";
content += imports.map((i) => `  ${i},`).join("\n");
content += `\n} from "${IMPORT}";\n`;

content += 'import { BaseProxyClient } from "./baseProxyClient";\n\n';

content +=
  "export abstract class MethodPopulatedProxyClient extends BaseProxyClient {\n";
content += names
  .map((name) => {
    return `  ${name}(data: ${name}Request) {
    return this.request("${name}Request", ${name}Request, data, ${name}Response);
  }\n`;
  })
  .join("");
content += "}\n";

await writeFile(TARGET, content);
