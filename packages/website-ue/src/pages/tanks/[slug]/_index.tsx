import { TankAttributeChange_AttributeName } from "@protos/blitz_static_tank_upgrade_single_stage";
import { times } from "lodash-es";
import { Suspense, useMemo } from "react";
import {
  CharacteristicsGroup,
  _characteristicsOrder,
} from "../../../constants/characteristicsOrder";
import { api } from "../../../core/api/dynamic";
import { aggregateAttributes } from "../../../core/blitz/aggregateAttributes";
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

  const attributes = useMemo(
    () =>
      aggregateAttributes(
        tank.base_stats!.attributes,
        tank.upgrade_stages.map((stage) => stage.attributes),
        stage
      ),
    [stage]
  );

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

      {_characteristicsOrder.map((group) => (
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
