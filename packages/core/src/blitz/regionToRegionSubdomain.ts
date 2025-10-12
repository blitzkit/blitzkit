import { Region, RegionSubdomain } from "./regions";

export function regionToRegionSubdomain(regionDomain: Region): RegionSubdomain {
  return regionDomain === "com" ? "na" : regionDomain;
}
