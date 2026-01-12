import { ENUMS } from "./[enum].json";

export function GET() {
  const enums: Record<string, Record<number, string>> = {};

  for (const name in ENUMS) {
    const _enum = ENUMS[name as keyof typeof ENUMS];
    const map: Record<number, string> = {};

    for (const key in _enum) {
      const value = _enum[key];
      if (typeof value !== "string") continue;
      map[key] = value;
    }

    enums[name] = map;
  }

  return Response.json(enums);
}
