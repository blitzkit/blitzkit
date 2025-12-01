import {
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { Suspense, useMemo } from "react";
import {
  CharacteristicsGroup,
  characteristicsOrder,
} from "../../../constants/characteristicsOrder";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";
import { Tankopedia } from "../../../stores/tankopedia";

export function Page({ id }: { id: string }) {
  return (
    <Suspense fallback={null}>
      <Content id={id} />
    </Suspense>
  );
}

function Content({ id }: { id: string }) {
  const tank = useAwait(() => api.tank(id), `tank-${id}`);

  const stage = Tankopedia.use((state) => state.stage);

  const attributes = useMemo(() => {
    const attributes: Partial<
      Record<TankAttributeChange_AttributeName, number>
    > = {};

    for (const { attribute_name, value, modifier } of tank.base_stats!
      .attributes) {
      if (modifier !== TankAttributeChange_Modifier.MODIFIER_OVERRIDE) {
        throw new Error(
          `Unexpected modifier ${TankAttributeChange_Modifier[modifier]}`
        );
      }

      attributes[attribute_name] = value;
    }

    return attributes;
  }, [stage]);

  return (
    <>
      <h1>{tank.name?.value}</h1>

      <h2>Characteristics</h2>

      {characteristicsOrder.map((group) => (
        <>
          <h2>{CharacteristicsGroup[group.group]}</h2>

          {group.attributes.map(
            (attribute) =>
              attribute.name in attributes && (
                <p>
                  {TankAttributeChange_AttributeName[attribute.name]}:{" "}
                  {attributes[attribute.name]}
                </p>
              )
          )}
        </>
      ))}
    </>
  );
}
