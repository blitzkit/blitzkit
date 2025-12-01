import {
  TankAttributeChange,
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { times } from "lodash-es";
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

    function patch(changes: TankAttributeChange[]) {
      for (const { attribute_name, value, modifier } of changes) {
        switch (modifier) {
          case TankAttributeChange_Modifier.MODIFIER_OVERRIDE:
            attributes[attribute_name] = value;
            break;

          case TankAttributeChange_Modifier.MODIFIER_MULTIPLY: {
            if (!(attribute_name in attributes)) {
              throw new Error(
                `Missing attribute ${TankAttributeChange_AttributeName[attribute_name]} to modify`
              );
            }
          }

          case TankAttributeChange_Modifier.MODIFIER_MULTIPLY: {
            attributes[attribute_name]! *= value;
            break;
          }

          default:
            throw new Error(
              `Unhandled modified ${TankAttributeChange_Modifier[modifier]}`
            );
        }
      }
    }

    patch(tank.base_stats!.attributes);

    times(stage, (index) => {
      patch(tank.upgrade_stages[index].attributes);
    });

    return attributes;
  }, [stage]);

  return (
    <>
      <h1>{tank.name?.value}</h1>

      <h2>Characteristics</h2>

      <div style={{ display: "flex" }}>
        {times(tank.upgrade_stages.length, (index) => (
          <button
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.stage = index;
              });
            }}
          >
            Stage {index + 1} {index === stage && "(selected)"}
          </button>
        ))}
      </div>

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
