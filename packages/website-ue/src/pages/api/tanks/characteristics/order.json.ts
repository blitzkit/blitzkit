import { _characteristicsOrder } from "../../../../core/tankopedia/characteristics";

export function GET() {
  return Response.json(_characteristicsOrder);
}
