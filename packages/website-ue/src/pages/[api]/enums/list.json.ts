import { ENUMS } from "./[enum].json";

export { getStaticPaths } from "../_index";

export function GET() {
  const list = Object.keys(ENUMS);
  return Response.json(list);
}
