import { ENUMS } from "./[enum].json";

export function GET() {
  const list = Object.keys(ENUMS);
  return Response.json(list);
}
