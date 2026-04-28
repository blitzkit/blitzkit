import { times } from "lodash-es";
import { Suspense, useMemo } from "react";
import { TankopediaCharacteristic } from "../../../../components/TankopediaCharacteristic";
import { TankopediaToy } from "../../../../components/TankopediaToy";
import { api } from "../../../../core/api/dynamic";
import { characteristicsOrder } from "../../../../core/tankopedia/characteristicsOrder";
import { computeCharacteristics } from "../../../../core/tankopedia/computeCharacteristics";
import { TerrainHardness } from "../../../../core/tankopedia/tankState";
import { useAwait } from "../../../../hooks/useAwait";
import { useGameStrings } from "../../../../hooks/useGameStrings";
import { LocaleProvider } from "../../../../hooks/useLocale";
import { Tankopedia, TankopediaCompare } from "../../../../stores/tankopedia";

interface PageProps {
  id: string;
  locale: string;
}

export function Page({ id, locale }: PageProps) {
  const tank = useAwait(() => api.tank(id), `tank-${id}`);

  Tankopedia.useInitialization(tank);

  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );

  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const tankEntityGameStrings = useGameStrings("TankEntity");

  const protagonist = Tankopedia.use((state) => state.protagonist);
  const protagonistTank = useAwait(
    () => api.tank(protagonist.id),
    `tank-${protagonist.id}`,
  );

  return (
    <>
      <h1>{protagonist.id}</h1>

      <br />

      {protagonistTank.tank!.upgrade_lines.map((line) => {
        return (
          <>
            <h2>
              {line.name} ({protagonist.upgrades[line.name]})
            </h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {line.stages.map((stage, index) => {
                return (
                  <button
                    key={stage.tech_name}
                    onClick={() => {
                      Tankopedia.mutate((draft) => {
                        draft.protagonist.upgrades[line.name] = index;
                      });
                    }}
                  >
                    {protagonist.upgrades[line.name] === index && "✓"}{" "}
                    {tankEntityGameStrings[stage.display_name]}
                  </button>
                );
              })}
            </div>
          </>
        );
      })}
    </>
  );

  const compare = Tankopedia.use((state) => state.compare);
  const characteristics = useMemo(
    () => computeCharacteristics(id, tank, protagonist),
    [protagonist],
  );
  // const otherCharacteristics = useMemo(
  //   () =>
  //     tankList.list
  //       .filter((tank) => tank.id !== id)
  //       .map(({ id }) => {
  //         const state = { ...protagonist };
  //         const tank = otherTanks.tanks[id];

  //         return computeCharacteristics(
  //           id,
  //           tank.tank!,
  //           tank.compensation!,
  //           state
  //         );
  //       }),
  //   [protagonist]
  // );

  return (
    <>
      <h1>{id}</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {tank.tank?.feature_screens?.tags.map((tag) => (
          <span>{tag.value}</span>
        ))}
      </div>

      <br />

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {times(tank.tank!.upgrade_stages.length + 1, (index) => (
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
        {characteristics.parameters.shells_upgrades.map((shell) => (
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
        <span>speed (0 - {characteristics.characteristics.speed_forward})</span>
        <input
          type="range"
          min={0}
          max={characteristics.characteristics.speed_forward as number}
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
            ),
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

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {Object.values(TankopediaCompare).map(
          (c) =>
            typeof c === "number" && (
              <button
                key={c}
                onClick={() => {
                  Tankopedia.mutate((draft) => {
                    draft.compare = c;
                  });
                }}
              >
                {TankopediaCompare[c]} {c === compare && "(selected)"}
              </button>
            ),
        )}
      </div>

      <br />

      {characteristicsOrder.map(({ group, order }) => (
        <>
          <h2 key={group}>{group}</h2>

          {order.map((config) =>
            "toy" in config ? (
              <TankopediaToy key={`toy-${config.toy}`} toy={config.toy} />
            ) : (
              <TankopediaCharacteristic
                key={`characteristic-${config.name}`}
                characteristic={characteristics.characteristics[config.name]}
                others={[]}
                config={config}
              />
            ),
          )}
        </>
      ))}
    </>
  );
}
