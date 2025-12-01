import { _characteristicsOrder } from "../../../../constants/characteristicsOrder";

export function GET() {
  return Response.json(_characteristicsOrder);
}
