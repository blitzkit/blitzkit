export const maxModulesPerRow = 5;

export const alternativeLines: Record<string, string> = {
  guns: "alternative_guns",
};

export function isAlternativeLine(line: string) {
  for (const key in alternativeLines) {
    if (alternativeLines[key] === line) {
      return true;
    }
  }

  return false;
}

export function originalLineName(line: string) {
  for (const key in alternativeLines) {
    if (alternativeLines[key] === line) {
      return key;
    }
  }
}
