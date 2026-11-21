import { useMemo } from "react";
import { api } from "../api/dynamic";
import { Tankopedia, TankopediaRelativeAgainst } from "../stores/tankopedia";
import { createTankState } from "../tankopedia/createTankState";
import { computeCharacteristics } from "./useCharacteristics";
import { useDuelModules } from "./useDuelModules";

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

  const protagonist = useDuelModules("protagonist");
  const protagonistShellIndex = protagonist.gun.shells.findIndex(
    (s) => s.id === protagonist.shell.id,
  );

  const relativeAgainst = Tankopedia.use((state) => state.relative_against);

  const candidates = useMemo(() => {
    return Object.values(tankDefinitions.tanks).filter((candidate) => {
      switch (relativeAgainst) {
        case TankopediaRelativeAgainst.ClassAndTier:
          return (
            candidate.tier === protagonist.tank.tier &&
            candidate.class === protagonist.tank.class
          );

        case TankopediaRelativeAgainst.Tier:
          return candidate.tier === protagonist.tank.tier;

        case TankopediaRelativeAgainst.All:
          return true;
      }
    });
  }, [protagonist.tank, relativeAgainst]);

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
