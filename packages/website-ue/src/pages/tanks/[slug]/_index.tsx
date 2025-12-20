import { times } from "lodash-es";
import { Suspense, useMemo } from "react";
import { api } from "../../../core/api/dynamic";
import { aggregateStageParameters } from "../../../core/tankopedia/aggregateStageParameters";
import { characteristicsOrder } from "../../../core/tankopedia/characteristicsOrder";
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

  Tankopedia.useInitialization(tank.upgrade_stages.length);

  const protagonist = Tankopedia.use((state) => state.protagonist);
  const parameters = useMemo(
    () =>
      aggregateStageParameters(
        tank.base_stats!,
        tank.upgrade_stages.slice(0, protagonist.stage)
      ),
    [protagonist]
  );
  const characteristics = useMemo(
    () => computeCharacteristics(parameters, protagonist),
    [protagonist]
  );

  return (
    <>
      <h1>{id}</h1>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {times(tank.upgrade_stages.length + 1, (index) => (
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

      <br />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {parameters.shells_upgrades.map((shell) => (
          <button
            key={shell.shell_id}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.protagonist.shell = shell.shell_id;
              });
            }}
          >
            Shell {shell.shell_id}{" "}
            {shell.shell_id === protagonist.shell && "(selected)"}
          </button>
        ))}
      </div>

      {characteristicsOrder.map(({ group, order }) => (
        <>
          <h2 key={group}>{group}</h2>

          {order.map((entry) => {
            if ("toy" in entry) {
              return <p>toy: {entry.toy}</p>;
            } else {
              const characteristic = characteristics[entry.name];

              if (characteristic === null) return null;

              let rendered: string | number;

              if (Number.isFinite(characteristic)) {
                if (entry.decimals === undefined) {
                  rendered = characteristic;
                } else {
                  rendered = characteristic.toFixed(entry.decimals);
                }
              } else {
                rendered = `${Math.sign(characteristic) === 1 ? "" : "-"}∞`;
              }

              return (
                <p key={entry.name}>
                  {entry.name}: {rendered} {entry.units && `${entry.units}`}
                </p>
              );
            }
          })}
        </>
      ))}
    </>
  );
}
