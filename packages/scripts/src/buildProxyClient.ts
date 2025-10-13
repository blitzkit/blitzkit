import { readFile, writeFile } from "fs/promises";

const IMPORT = "@protos/auto_legacy_proxy_client";
const SOURCE = "../../packages/closed/protos/auto_legacy_proxy_client.proto";
const TARGET = "../../packages/closed/src/unreal/methodPopulatedProxyClient.ts";

const requestPattern = /message (\w+)Request {/g;
const source = await readFile(SOURCE).then((buffer) => buffer.toString());
const requests = source.matchAll(requestPattern);

const imports: string[] = [];
const methods: { name: string; method: string }[] = [];

for (const match of requests) {
  const name = match[1];
  // const method =
  //   name.charAt(0).toLowerCase() + name.slice(1).replace(/Async$/, "");
  const method = name;

  imports.push(`${name}Request`, `${name}Response`);
  methods.push({ name, method });
}

let content = "";

content += "import {\n";
content += imports.map((i) => `  ${i},`).join("\n");
content += `\n} from "${IMPORT}";\n`;

content += 'import { BaseProxyClient } from "./baseProxyClient";\n\n';

content +=
  "export abstract class MethodPopulatedProxyClient extends BaseProxyClient {\n";
content += methods
  .map(({ name, method }) => {
    return `  ${method}(data: ${name}Request) {
    return this.request("${name}Request", ${name}Request, data, ${name}Response);
  }\n`;
  })
  .join("");
content += "}\n";

await writeFile(TARGET, content);
