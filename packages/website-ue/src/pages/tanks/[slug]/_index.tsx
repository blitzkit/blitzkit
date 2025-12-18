import { times } from "lodash-es";
import { Suspense, useMemo } from "react";
import { api } from "../../../core/api/dynamic";
import { aggregateStageParameters } from "../../../core/tankopedia/aggregateStageParameters";
import { characteristics } from "../../../core/tankopedia/characteristics";
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
    () =>
      aggregateStageParameters(tank.base_stats!, tank.upgrade_stages, stage),
    [stage]
  );

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
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

      {characteristicsOrder.map(({ group, order }) => (
        <>
          <h2>{group}</h2>

          {order.map((name) => {
            const characteristic = characteristics[name];

            return <span>{}</span>;
          })}
        </>
      ))}
    </>
  );
}
