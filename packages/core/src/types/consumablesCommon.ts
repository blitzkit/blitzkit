import { ConsumablesVehicleFilter } from "./consumablesVehicleFilter";

export interface ConsumablesCommon {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    category: string;
    tags: string;
    vehicleFilter?: {
      include: { vehicle: ConsumablesVehicleFilter; nations?: string };
      exclude?: { vehicle: ConsumablesVehicleFilter; nations?: string };
    };
    script: {
      "#text": string;
      automatic?: boolean;
      cooldown: number;
      duration?: number;
      shotEffect?: string;
      bonusValues?: { [key: string]: number };
    } & Record<string, string>;
  };
}
