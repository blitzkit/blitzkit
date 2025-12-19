import { characteristicsOrder } from "../../../core/tankopedia/characteristicsOrder";

/**
 * The naked man fears no pickpocket.
 */
export function GET() {
  return Response.json(characteristicsOrder);
}
