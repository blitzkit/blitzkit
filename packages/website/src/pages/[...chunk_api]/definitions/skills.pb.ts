import { SkillDefinitions } from "@blitzkit/core";
import { api } from "../../../blitzkit/api";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.skills();
  const bytes = SkillDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
