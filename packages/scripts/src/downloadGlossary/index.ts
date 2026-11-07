import { assertSecret, fetchGlossary } from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import { mkdir, writeFile } from "fs/promises";

// saved under plain names, so builds without the glossary secrets, like pull
// requests, can read them as files
const GLOSSARY_FILE = "../../temp/glossary.json";
const GLOSSARY_DIR = "../../temp/glossary";

console.log("Downloading glossary...");

const response = await fetch(assertSecret(import.meta.env.WOTB_GLOSSARY));

if (!response.ok) {
  throw new Error(`Glossary response error status: ${response.status}`);
}

await writeFile(GLOSSARY_FILE, await response.text());
await mkdir(GLOSSARY_DIR, { recursive: true });

for (const supported of locales.supported) {
  const locale = supported.blitz ?? supported.locale;

  console.log(`Downloading ${locale} glossary...`);

  const glossary = await fetchGlossary(locale);

  await writeFile(`${GLOSSARY_DIR}/${locale}.json`, JSON.stringify(glossary));
}
