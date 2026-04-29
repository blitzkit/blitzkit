import { Grade } from "@blitzkit/closed/protos/game/proto/legacy/blitz_static_standard_grades_enum";
import { PenetrationGroup_CommonData } from "@blitzkit/closed/protos/game/proto/legacy/blitz_static_tank_penetration_group";
import {
  PenetrationGroupUpgrade_TankPart,
  StageParameters_StageType,
  TankAttributeChange_AttributeName,
} from "@blitzkit/closed/protos/game/proto/legacy/blitz_static_tank_upgrade_single_stage";
import { api } from "../../../../core/api/dynamic";
import { aggregateParameters } from "../../../../core/tankopedia/aggregateParameters";
import { useAwait } from "../../../../hooks/useAwait";
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

  const protagonist = Tankopedia.use((state) => state.protagonist);
  const protagonistTank = useAwait(
    () => api.tank(protagonist.id),
    `tank-${protagonist.id}`,
  );

  const parameters = aggregateParameters(
    protagonistTank.tank!,
    protagonist.upgrades,
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

      <h2>parameters</h2>

      <h3>attributes</h3>

      {parameters.attributes.map((attribute) => {
        return (
          <span>
            {TankAttributeChange_AttributeName[attribute.attribute_name]}:{" "}
            {attribute.value}
          </span>
        );
      })}

      <h3>penetration groups</h3>

      {parameters.penetration_groups_upgrades.map((upgrade) => {
        return (
          <>
            <h4>{PenetrationGroupUpgrade_TankPart[upgrade.tank_part]}</h4>

            <span>
              primary armor ({upgrade.primary_armor.length}):{" "}
              {upgrade.primary_armor}
            </span>

            <br />

            {upgrade.penetration_groups.map((group) => {
              return (
                <span>
                  {group.group_name}: {group.armor} (
                  {PenetrationGroup_CommonData[group.common_data]})
                </span>
              );
            })}
          </>
        );
      })}
    </>
  );
}
