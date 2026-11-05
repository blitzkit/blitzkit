import { useMemo } from "react";
import { api } from "../api/dynamic";
import { Tankopedia, TankopediaRelativeAgainst } from "../stores/tankopedia";
import { createTankState } from "../tankopedia/createTankState";
import { computeCharacteristics } from "./useCharacteristics";
import { DuelModule, useDuel } from "./useDuel";

const tankDefinitions = await api.tanks();

const candidateStates = new Map(
  Object.values(tankDefinitions.tanks).map((candidate) => {
    const state = createTankState(candidate);
    const turret = candidate.turrets.find((t) => t.id === state.turret)!;
    const gun = turret.guns.find((g) => g.id === state.gun)!;

    return [
      candidate.id,
      {
        state,
        shells: gun.shells.map((shell) => shell.id),
      },
    ];
  }),
);

export function useComparisonCharacteristics() {
  const environment = Tankopedia.use((state) => state.environment);

  const tank = useDuel("protagonist", DuelModule.Tank);
  const gun = useDuel("protagonist", DuelModule.Gun);
  const shell = useDuel("protagonist", DuelModule.Shell);
  const protagonistShellIndex = gun.shells.findIndex((s) => s.id === shell.id);

  const relativeAgainst = Tankopedia.use((state) => state.relative_against);

  const candidates = useMemo(() => {
    return Object.values(tankDefinitions.tanks).filter((candidate) => {
      switch (relativeAgainst) {
        case TankopediaRelativeAgainst.ClassAndTier:
          return candidate.tier === tank.tier && candidate.class === tank.class;

        case TankopediaRelativeAgainst.Tier:
          return candidate.tier === tank.tier;

        case TankopediaRelativeAgainst.All:
          return true;
      }
    });
  }, [tank, relativeAgainst]);

  const characteristics = useMemo(() => {
    return candidates.flatMap((candidate) => {
      const { state: candidateState, shells } = candidateStates.get(
        candidate.id,
      )!;
      const maxStateShellIndex = shells.length - 1;
      const stateShellIndex = Math.min(
        maxStateShellIndex,
        protagonistShellIndex,
      );

      const state = { ...candidateState, shell: shells[stateShellIndex] };

      return [
        computeCharacteristics(
          { protagonist: state, antagonist: state },
          environment,
        ),
      ];
    });
  }, [candidates, environment, protagonistShellIndex]);

  return characteristics;
}
