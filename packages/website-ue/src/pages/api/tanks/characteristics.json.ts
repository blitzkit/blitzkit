import { characteristicsOrder } from "../../../core/tankopedia/characteristicsOrder";

export function GET() {
  return Response.json(characteristicsOrder);
}
