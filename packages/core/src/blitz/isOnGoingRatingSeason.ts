import { getRatingInfo } from "./getRatingInfo";

export async function isOnGoingRatingSeason() {
  const ratingInfo = await getRatingInfo("com");
  return ratingInfo.detail === undefined;
}
