import type { BlitzGlossary } from "../types";

export const WOTB_GLOSSARY_DOMAIN = "https://na.wotblitz.com";
export const WOTB_GLOSSARY_PATH = "api/glossary/stuff";

export async function fetchGlossary(locale: string) {
  const response = await fetch(
    `${WOTB_GLOSSARY_DOMAIN}/${locale}/${WOTB_GLOSSARY_PATH}`,
  );
  return (await response.json()) as BlitzGlossary;
}
