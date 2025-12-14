import { _characteristicsOrder } from "../../../../constants/characteristics";

export function GET() {
  return Response.json(_characteristicsOrder);
}
