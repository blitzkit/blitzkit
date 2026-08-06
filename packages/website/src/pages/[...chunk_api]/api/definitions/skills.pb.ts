import { SkillDefinitions } from "@blitzkit/core";
import { api } from "../../../core/blitzkit/api";

export { getStaticPaths } from "../../_index";

export async function GET() {
  const definitions = await api.skillDefinitions();
  const bytes = SkillDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
