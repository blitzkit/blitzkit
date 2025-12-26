import { times } from "lodash-es";
import { Suspense, useMemo } from "react";
import { api } from "../../../core/api/dynamic";
import { characteristicsOrder } from "../../../core/tankopedia/characteristicsOrder";
import { computeCharacteristics } from "../../../core/tankopedia/computeCharacteristics";
import { renderCharacteristic } from "../../../core/tankopedia/renderCharacteristic";
import { TerrainHardness } from "../../../core/tankopedia/tankState";
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
  const { tank, compensation } = useAwait(() => api.tank(id), `tank-${id}`);

  Tankopedia.useInitialization(tank!.upgrade_stages.length);

  const protagonist = Tankopedia.use((state) => state.protagonist);
  const { characteristics, parameters } = useMemo(
    () => computeCharacteristics(id, tank!, compensation!, protagonist),
    [protagonist]
  );

  return (
    <>
      <h1>{id}</h1>

      <br />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {times(tank!.upgrade_stages.length + 1, (index) => (
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

      <br />

      <div>
        <span>speed (0 - {characteristics.speed_forward})</span>
        <input
          type="range"
          min={0}
          max={characteristics.speed_forward as number}
          value={protagonist.speed}
          onChange={(event) => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.speed = event.target.valueAsNumber;
            });
          }}
        />
      </div>

      <br />

      <div>
        <span>isHullTraversing</span>
        <input
          type="checkbox"
          value={`${protagonist.isHullTraversing}`}
          onChange={(event) => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.isHullTraversing = event.target.checked;
            });
          }}
        />
      </div>

      <br />

      <div>
        <span>isTurretTraversing</span>
        <input
          type="checkbox"
          value={`${protagonist.isTurretTraversing}`}
          onChange={(event) => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.isTurretTraversing = event.target.checked;
            });
          }}
        />
      </div>

      <br />

      <div>
        <span>isShooting</span>
        <input
          type="checkbox"
          value={`${protagonist.isShooting}`}
          onChange={(event) => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.isShooting = event.target.checked;
            });
          }}
        />
      </div>

      <br />

      <div>
        <span>isGunDamaged</span>
        <input
          type="checkbox"
          value={`${protagonist.isGunDamaged}`}
          onChange={(event) => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.isGunDamaged = event.target.checked;
            });
          }}
        />
      </div>

      <br />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {Object.values(TerrainHardness).map(
          (hardness) =>
            typeof hardness === "number" && (
              <button
                key={hardness}
                onClick={() => {
                  Tankopedia.mutate((draft) => {
                    draft.protagonist.terrainHardness = hardness;
                  });
                }}
              >
                {TerrainHardness[hardness]}{" "}
                {hardness === protagonist.terrainHardness && "(selected)"}
              </button>
            )
        )}
      </div>

      <br />

      <div>
        <span>isCaughtOnFire</span>
        <input
          type="checkbox"
          value={`${protagonist.isCaughtOnFire}`}
          onChange={(event) => {
            Tankopedia.mutate((draft) => {
              draft.protagonist.isCaughtOnFire = event.target.checked;
            });
          }}
        />
      </div>

      <br />

      {characteristicsOrder.map(({ group, order }) => (
        <>
          <h2 key={group}>{group}</h2>

          {order.map((config) => {
            if ("toy" in config) {
              return <p key={`toy-${config.toy}`}>toy: {config.toy}</p>;
            } else {
              const characteristic = characteristics[config.name];

              if (characteristic === null) return null;

              const rendered = renderCharacteristic(characteristic, config);

              return (
                <p key={`characteristic-${config.name}`}>
                  {config.name}: {rendered} {config.units && `${config.units}`}
                </p>
              );
            }
          })}
        </>
      ))}
    </>
  );
}
