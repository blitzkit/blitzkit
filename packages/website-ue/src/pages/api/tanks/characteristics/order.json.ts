import { characteristicsOrder } from "../../../../constants/characteristicsOrder";

export function GET() {
  return Response.json(characteristicsOrder);
}
