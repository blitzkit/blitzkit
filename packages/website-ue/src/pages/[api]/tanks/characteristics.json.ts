import { characteristicsOrder } from "../../../tankopedia/characteristicsOrder";

export { getStaticPaths } from "../_index";

/**
 * The naked man fears no pickpocket.
 */
export function GET() {
  return Response.json(characteristicsOrder);
}
