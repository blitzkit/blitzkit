import locales from "@blitzkit/i18n/locales.json";
import type { EncyclopediaVehicle } from "../blitz/fetchEncyclopedia";
import type { TankDefinition } from "../protos";
import { descriptionMatches } from "./descriptionMatches";

const EUROPEAN_NATIONS = ["czech", "sweden", "poland", "italy"];
const MAX_TIER_DIFFERENCE = 2;
const MIN_NAME_SIMILARITY = 0.5;

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function stripTagPrefix(tag: string) {
  return tag.toLowerCase().replace(/^[a-z]{1,3}\d+_/, "");
}

function nameSimilarity(a: string, b: string) {
  const normalizedA = normalizeName(a);
  const normalizedB = normalizeName(b);

  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) {
    return 1;
  }

  let shared = 0;

  while (
    shared < Math.min(normalizedA.length, normalizedB.length) &&
    normalizedA[shared] === normalizedB[shared]
  ) {
    shared++;
  }

  return shared / Math.max(normalizedA.length, normalizedB.length);
}

export interface DescriptionMatch {
  via: "blitz" | "file" | "id" | "tag" | "name";
  vehicle: EncyclopediaVehicle;
}

export function matchDescription(
  tank: TankDefinition,
  blitzVehicles: Map<number, EncyclopediaVehicle>,
  wotVehicles: EncyclopediaVehicle[],
): DescriptionMatch | null {
  const tankNames = [tank.name, tank.name_full]
    .map((name) => name?.locales[locales.default])
    .filter((name) => name !== undefined);
  const blitzVehicle = blitzVehicles.get(tank.id);

  if (blitzVehicle?.description) return { via: "blitz", vehicle: blitzVehicle };

  if (tank.dev_name in descriptionMatches) {
    const tag = descriptionMatches[tank.dev_name];
    const vehicle = wotVehicles.find((vehicle) => vehicle.tag === tag);

    if (tag !== null && !vehicle) {
      throw new Error(
        `Description match for ${tank.dev_name} points to unknown tag ${tag}`,
      );
    }

    return vehicle ? { via: "file", vehicle } : null;
  }

  const candidates = wotVehicles.filter(
    (vehicle) =>
      vehicle.description &&
      (vehicle.nation === tank.nation ||
        (tank.nation === "european" &&
          EUROPEAN_NATIONS.includes(vehicle.nation))) &&
      Math.abs(vehicle.tier - tank.tier) <= MAX_TIER_DIFFERENCE,
  );
  const byId = candidates.find(
    (vehicle) =>
      vehicle.tank_id === tank.id &&
      tankNames.some(
        (tankName) =>
          nameSimilarity(vehicle.name, tankName) >= MIN_NAME_SIMILARITY,
      ),
  );

  if (byId) return { via: "id", vehicle: byId };

  const byTag =
    candidates.find(
      (vehicle) => vehicle.tag?.toLowerCase() === tank.dev_name.toLowerCase(),
    ) ??
    candidates.find(
      (vehicle) =>
        vehicle.tag !== undefined &&
        stripTagPrefix(vehicle.tag) === stripTagPrefix(tank.dev_name),
    );

  if (byTag) return { via: "tag", vehicle: byTag };

  const byName = candidates.find((vehicle) =>
    tankNames.some(
      (tankName) => normalizeName(vehicle.name) === normalizeName(tankName),
    ),
  );

  if (byName) return { via: "name", vehicle: byName };

  return null;
}
