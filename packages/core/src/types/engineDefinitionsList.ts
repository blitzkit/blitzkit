export interface EngineDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
  shared: {
    [key: string]: {
      userString: string;
      level: number;
      fireStartingChance: number;
      weight: number;
      power: number;
    };
  };
}
