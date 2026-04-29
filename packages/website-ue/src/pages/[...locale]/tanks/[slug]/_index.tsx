import { Grade } from "@blitzkit/closed/protos/game/proto/legacy/blitz_static_standard_grades_enum";
import { StageParameters_StageType } from "@blitzkit/closed/protos/game/proto/legacy/blitz_static_tank_upgrade_single_stage";
import { useMemo } from "react";
import { api } from "../../../../core/api/dynamic";
import { characteristicsOrder } from "../../../../core/tankopedia/characteristicsOrder";
import { computeCharacteristics } from "../../../../core/tankopedia/computeCharacteristics";
import { useAwait } from "../../../../hooks/useAwait";
import { useCharacteristicRenderer } from "../../../../hooks/useCharacteristicRenderer";
import { useGameStrings } from "../../../../hooks/useGameStrings";
import { LocaleProvider } from "../../../../hooks/useLocale";
import { Tankopedia } from "../../../../stores/tankopedia";

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
}

function Content() {
  const tankEntityGameStrings = useGameStrings("TankEntity");
  const renderCharacteristic = useCharacteristicRenderer();

  const protagonist = Tankopedia.use((state) => state.protagonist);
  const protagonistTank = useAwait(
    () => api.tank(protagonist.id),
    `tank-${protagonist.id}`,
  );

  const { characteristics } = useMemo(
    () => computeCharacteristics(protagonistTank, protagonist),
    [protagonist],
  );

  return (
    <>
      <h1>{protagonist.id}</h1>

      <br />

      <h2>upgrades</h2>

      {protagonistTank.tank!.upgrade_lines.map((line) => {
        return (
          <>
            <h3>
              {line.name} ({protagonist.upgrades[line.name]})
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              {line.stages.map((stage, index) => {
                if (stage.custom_picture) {
                  throw new Error("Custom picture not supported");
                }

                return (
                  <button
                    key={stage.tech_name}
                    onClick={() => {
                      Tankopedia.mutate((draft) => {
                        draft.protagonist.upgrades[line.name] = index;

                        for (const required of stage.required_upgrades) {
                          for (const line of protagonistTank.tank!
                            .upgrade_lines) {
                            let i = 0;

                            for (const stage of line.stages) {
                              if (stage.tech_name === required) {
                                draft.protagonist.upgrades[line.name] =
                                  Math.max(
                                    draft.protagonist.upgrades[line.name],
                                    i,
                                  );
                              }

                              i++;
                            }
                          }
                        }

                        for (const line of protagonistTank.tank!
                          .upgrade_lines) {
                          let i = draft.protagonist.upgrades[line.name];

                          while (i > 0) {
                            const currentStage = line.stages[i];
                            const valid = currentStage.required_upgrades.every(
                              (required) => {
                                for (const line of protagonistTank.tank!
                                  .upgrade_lines) {
                                  const idx =
                                    draft.protagonist.upgrades[line.name];

                                  if (
                                    line.stages[idx]?.tech_name === required
                                  ) {
                                    return true;
                                  }
                                }

                                return false;
                              },
                            );

                            if (valid) break;

                            i--;
                          }

                          draft.protagonist.upgrades[line.name] = i;
                        }
                      });
                    }}
                    style={{
                      backgroundColor:
                        protagonist.upgrades[line.name] === index
                          ? "green"
                          : undefined,
                    }}
                  >
                    {stage.tech_name}: {Grade[stage.grade]}
                    {StageParameters_StageType[stage.stage_type]}
                    {tankEntityGameStrings[stage.display_name]}
                  </button>
                );
              })}
            </div>
          </>
        );
      })}

      <h2>characteristics</h2>

      {characteristicsOrder.map((group) => {
        return (
          <>
            <h3>{group.group}</h3>

            {group.order.map((item) => {
              if ("toy" in item) {
                return <span>toy: {item.toy}</span>;
              }

              const value = characteristics[item.name];

              if (value == null) return null;

              return (
                <span>
                  {item.name}: {renderCharacteristic(value, item)}
                </span>
              );
            })}
          </>
        );
      })}
    </>
  );

  // const parameters = aggregateParameters(
  //   protagonistTank.tank!,
  //   protagonist.upgrades,
  // );

  // if (parameters.modules_upgrades.length > 0) {
  //   throw new Error("Modules upgrades display not implemented");
  // }

  // return (
  //   <>
  //     <h1>{protagonist.id}</h1>

  //     <br />

  //     <h2>upgrades</h2>

  //     {protagonistTank.tank!.upgrade_lines.map((line) => {
  //       return (
  //         <>
  //           <h3>
  //             {line.name} ({protagonist.upgrades[line.name]})
  //           </h3>

  //           <div
  //             style={{
  //               display: "flex",
  //               flexDirection: "column",
  //               alignItems: "flex-start",
  //               gap: 8,
  //             }}
  //           >
  //             {line.stages.map((stage, index) => {
  //               if (stage.custom_picture) {
  //                 throw new Error("Custom picture not supported");
  //               }

  //               return (
  //                 <button
  //                   key={stage.tech_name}
  //                   onClick={() => {
  //                     Tankopedia.mutate((draft) => {
  //                       draft.protagonist.upgrades[line.name] = index;

  //                       for (const required of stage.required_upgrades) {
  //                         for (const line of protagonistTank.tank!
  //                           .upgrade_lines) {
  //                           let i = 0;

  //                           for (const stage of line.stages) {
  //                             if (stage.tech_name === required) {
  //                               draft.protagonist.upgrades[line.name] =
  //                                 Math.max(
  //                                   draft.protagonist.upgrades[line.name],
  //                                   i,
  //                                 );
  //                             }

  //                             i++;
  //                           }
  //                         }
  //                       }

  //                       for (const line of protagonistTank.tank!
  //                         .upgrade_lines) {
  //                         let i = draft.protagonist.upgrades[line.name];

  //                         while (i > 0) {
  //                           const currentStage = line.stages[i];
  //                           const valid = currentStage.required_upgrades.every(
  //                             (required) => {
  //                               for (const line of protagonistTank.tank!
  //                                 .upgrade_lines) {
  //                                 const idx =
  //                                   draft.protagonist.upgrades[line.name];

  //                                 if (
  //                                   line.stages[idx]?.tech_name === required
  //                                 ) {
  //                                   return true;
  //                                 }
  //                               }

  //                               return false;
  //                             },
  //                           );

  //                           if (valid) break;

  //                           i--;
  //                         }

  //                         draft.protagonist.upgrades[line.name] = i;
  //                       }
  //                     });
  //                   }}
  //                   style={{
  //                     backgroundColor:
  //                       protagonist.upgrades[line.name] === index
  //                         ? "green"
  //                         : undefined,
  //                   }}
  //                 >
  //                   {stage.tech_name}: {Grade[stage.grade]}
  //                   {StageParameters_StageType[stage.stage_type]}
  //                   {tankEntityGameStrings[stage.display_name]}
  //                 </button>
  //               );
  //             })}
  //           </div>
  //         </>
  //       );
  //     })}

  //     <h2>characteristics</h2>

  //     {}

  //     <h2>parameters</h2>

  //     <h3>attributes</h3>

  //     {parameters.attributes.map((attribute) => {
  //       return (
  //         <span>
  //           {TankAttributeChange_AttributeName[attribute.attribute_name]}:{" "}
  //           {attribute.value}
  //         </span>
  //       );
  //     })}

  //     <h3>penetration groups</h3>

  //     {parameters.penetration_groups_upgrades.map((upgrade) => {
  //       return (
  //         <>
  //           <h4>{PenetrationGroupUpgrade_TankPart[upgrade.tank_part]}</h4>

  //           <span>
  //             primary armor ({upgrade.primary_armor.length}):{" "}
  //             {upgrade.primary_armor}
  //           </span>

  //           <br />

  //           {upgrade.penetration_groups.map((group) => {
  //             return (
  //               <span>
  //                 {group.group_name}: {group.armor} (
  //                 {PenetrationGroup_CommonData[group.common_data]})
  //               </span>
  //             );
  //           })}
  //         </>
  //       );
  //     })}

  //     <h2>modules ({parameters.modules_upgrades.length})</h2>

  //     {parameters.modules_upgrades.map((upgrade) => {
  //       return (
  //         <span>{ModuleUpgrade_AttributeName[upgrade.attribute_name]}</span>
  //       );
  //     })}

  //     <h2>shells</h2>

  //     {parameters.shells_upgrades.map((upgrade) => {
  //       return (
  //         <>
  //           <h3>
  //             {upgrade.shell_id}: {ShellUpgrade_ShellType[upgrade.shell_type]}
  //           </h3>

  //           <pre>
  //             silver_price: {JSON.stringify(upgrade.silver_price, null, 2)}
  //           </pre>

  //           <pre>
  //             tray_shells: {JSON.stringify(upgrade.tray_shells, null, 2)}
  //           </pre>
  //         </>
  //       );
  //     })}
  //   </>
  // );
}
