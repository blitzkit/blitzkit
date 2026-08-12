export interface CamouflagesXml {
  camouflages: Record<
    string,
    {
      id: number;
      userString: string;
      description: string;
      category: string;
      group: string;
      kind: string;
      notInShop: boolean;
      unlockCostCategory?: string;
      vehicleFilter: {
        include?: CamouflagesInclude | CamouflagesInclude[];
      };
      script: string[] | string;
      icon?: string;
      unlockPremium?: string;
      unlockQuest?: string;
      unlockClanLevel?: number;
      unlockShopBundle?: string;
      unlockTankRank?: number;
    }
  >;
}

type CamouflagesInclude =
  | {
      nations?: string;
    }
  | {
      vehicle?: { name?: string; minLevel?: number; maxLevel?: number };
    };
