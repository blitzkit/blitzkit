import { Region, RegionSubdomain } from "./regions";

export function regionSubdomainToRegion(regionDomain: RegionSubdomain): Region {
  return regionDomain === "na" ? "com" : regionDomain;
}
