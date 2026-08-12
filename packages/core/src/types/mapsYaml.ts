export interface MapsYaml {
  maps: {
    [key: string]: {
      id: number;
      tags?: string;
      localName: string;
      avaliableInTrainingRoom: boolean; // lol wg typo
      spriteFrame: number;
      supremacyPointsThreshold?: number;
      availableModes: number[];
      shadowMapsAvailable?: boolean;
      assaultRespawnPoints: {
        allies: MapAlly[];
        enemies: MapAlly[];
      };
      levels?: number[];
    };
  };
}

export interface MapAlly {
  respawnNumber: number;
  points: Array<number[]>;
}
