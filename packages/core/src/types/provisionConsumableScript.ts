export type ProvisionConsumableScript = {
  "#text": string;

  cooldown?: number;
  automatic?: boolean;

  bonusValues?: Record<string, number>;
  attributes?: Record<string, string>;
  shotEffect?: string;
} & Record<string, number>;
