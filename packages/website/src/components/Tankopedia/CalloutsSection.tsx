import { assertSecret, fetchTankDefinitions } from "@blitzkit/core";
import { MinusCircledIcon } from "@radix-ui/react-icons";
import { Callout, Flex } from "@radix-ui/themes";
import { uniq } from "lodash-es";
import { useEffect } from "react";
import { Duel } from "../../stores/duel";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { AesonPlug } from "../AesonPlug";
import { ExperimentIcon } from "../ExperimentIcon";
import { MAX_RECENTLY_VIEWED } from "../TankSearch/constants";

const tankDefinitions = await fetchTankDefinitions();

export function CalloutsSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const promoteAeson =
    assertSecret(import.meta.env.PUBLIC_BRANCH) === "preview";

  useEffect(() => {
    TankopediaPersistent.mutate((draft) => {
      draft.recentlyViewed = uniq([tank.id, ...draft.recentlyViewed])
        .filter((id) => id in tankDefinitions.tanks)
        .slice(0, MAX_RECENTLY_VIEWED);
    });
  }, [tank]);

  if (!tank.testing && !tank.deprecated && !promoteAeson) return null;

  return (
    <Flex direction="column" align="center" gap="2" mb="4" px="4">
      {promoteAeson && <AesonPlug />}

      {tank.deprecated && (
        <Callout.Root color="red">
          <Callout.Icon>
            <MinusCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Deprecated tanks may display undefined behavior.
          </Callout.Text>
        </Callout.Root>
      )}

      {tank.testing && (
        <Callout.Root color="red">
          <Callout.Icon>
            <ExperimentIcon style={{ width: "1em", height: "1em" }} />
          </Callout.Icon>
          <Callout.Text>
            Tanks in testing are subject to change and may not represent the
            final product.
          </Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}
