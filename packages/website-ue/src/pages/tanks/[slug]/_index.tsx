import { times } from "lodash-es";
import { Suspense, useMemo } from "react";
import { api } from "../../../core/api/dynamic";
import { aggregateStages } from "../../../core/blitz/aggregateStages";
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
  const parameters = useMemo(
    () => aggregateStages(tank.base_stats!, tank.upgrade_stages, stage),
    [stage]
  );

  return (
    <>
      <div style={{ display: "flex" }}>
        {times(tank.upgrade_stages.length, (index) => (
          <button
            key={index}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.stage = index;
              });
            }}
          >
            Stage {index} {index === stage && "(selected)"}
          </button>
        ))}
      </div>

      <pre children={JSON.stringify(parameters, null, 2)} />
      <h1>{tank.name?.value}</h1>

      <h2>Characteristics</h2>

      {/* {_characteristicsOrder.map((group) => (
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
      ))} */}
    </>
  );
}
