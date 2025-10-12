import { Region } from "../blitz/regions";

const TIME_ZONE_MAPPINGS: Record<Region, number> = {
  com: -5, // Central North American Time
  eu: +1, // Central European Time
  asia: +7, // Central Asia Standard Time
};

export function getTimeDaysAgo(region: Region, daysAgo: number) {
  const now = new Date();
  if (daysAgo === 0) now.getTime() / 1000;

  const time = new Date();

  time.setUTCHours(-TIME_ZONE_MAPPINGS[region], 0, 0, 0);
  if (time > now) time.setUTCDate(time.getUTCDate() - 1);
  time.setUTCDate(time.getUTCDate() - daysAgo + 1);

  return time.getTime() / 1000;
}
