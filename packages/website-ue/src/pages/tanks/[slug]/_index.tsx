import { times } from "lodash-es";
import { Suspense, useMemo } from "react";
import { api } from "../../../core/api/dynamic";
import { aggregateStageParameters } from "../../../core/tankopedia/aggregateStageParameters";
import { characteristicsGroups } from "../../../core/tankopedia/characteristicsGroups";
import { computeCharacteristics } from "../../../core/tankopedia/computeCharacteristics";
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

  const protagonist = Tankopedia.use((state) => state.protagonist);
  const parameters = useMemo(
    () =>
      aggregateStageParameters(
        tank.base_stats!,
        tank.upgrade_stages,
        protagonist.shell
      ),
    [protagonist]
  );
  const characteristics = useMemo(
    () => computeCharacteristics(parameters, protagonist),
    [protagonist]
  );

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {times(tank.upgrade_stages.length, (index) => (
          <button
            key={index}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.protagonist.stage = index;
              });
            }}
          >
            Stage {index} {index === protagonist.stage && "(selected)"}
          </button>
        ))}
      </div>

      {characteristicsGroups.map(({ group, order }) => (
        <>
          <h2>{group}</h2>

          {order.map(({ name, decimals }) => {
            const characteristic = characteristics[name];

            if (characteristic === null) return null;

            let rendered: string | number = characteristic;

            if (typeof rendered === "number") {
              if (decimals !== undefined) rendered = rendered.toFixed(decimals);
            }

            return (
              <p>
                {name}: {rendered}
              </p>
            );
          })}
        </>
      ))}
    </>
  );
}
