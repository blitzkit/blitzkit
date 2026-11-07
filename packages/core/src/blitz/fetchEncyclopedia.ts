import { assertSecret } from "../blitzkit";
import { patientFetch } from "../blitzkit/patientFetch";

export type EncyclopediaGame = "wotb" | "wot";

export interface EncyclopediaVehicle {
  tank_id: number;
  name: string;
  nation: string;
  tier: number;
  tag?: string;
  description: string | null;
}

type EncyclopediaResponse =
  | { status: "ok"; data: Record<string, EncyclopediaVehicle | null> }
  | { status: "error"; error: { message: string } };

const encyclopediaDomains: Record<EncyclopediaGame, string> = {
  wotb: "https://api.wotblitz.eu/wotb",
  wot: "https://api.worldoftanks.eu/wot",
};

const encyclopediaFields: Record<EncyclopediaGame, string> = {
  wotb: "tank_id,name,nation,tier,description",
  wot: "tank_id,tag,name,nation,tier,description",
};

export async function fetchEncyclopedia(
  game: EncyclopediaGame,
  language: string,
) {
  const response = await patientFetch(
    `${
      encyclopediaDomains[game]
    }/encyclopedia/vehicles/?application_id=${assertSecret(
      import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID,
    )}&fields=${encyclopediaFields[game]}&language=${language}`,
  );

  if (!response.ok) {
    throw new Error(
      `Wargaming ${game} encyclopedia (${language}) failed with HTTP ${response.status}`,
    );
  }

  const json = (await response.json()) as EncyclopediaResponse;

  if (json.status !== "ok") {
    throw new Error(
      `Wargaming ${game} encyclopedia (${language}) failed with "${json.error.message}"`,
    );
  }

  return Object.values(json.data).filter(
    (vehicle): vehicle is EncyclopediaVehicle => vehicle !== null,
  );
}
