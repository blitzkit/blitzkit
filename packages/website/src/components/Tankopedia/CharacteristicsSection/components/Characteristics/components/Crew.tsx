import { CREW_MEMBER_NAMES, CrewType } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { AccessibilityIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Flex, Heading, IconButton, Popover, Text } from "@radix-ui/themes";
import { Fragment } from "react/jsx-runtime";
import { awaitableProvisionDefinitions } from "../../../../../../core/awaitables/provisionDefinitions";
import { useEquipment } from "../../../../../../hooks/useEquipment";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { InfoWithDelta } from "./InfoWithDelta";
import { StatsTableWrapper } from "./StatsTableWrapper";
import type { StatsAcceptorProps } from "./TraverseVisualizer";

const provisionDefinitions = await awaitableProvisionDefinitions;

export function Crew({ stats }: StatsAcceptorProps) {
  const tank = Duel.use((state) => state.protagonist.tank);
  const { strings } = useLocale();
  const provisions = Duel.use((state) => state.protagonist.provisions);
  const hasImprovedVentilation = useEquipment(102);
  const provisionCrewBonus =
    provisions.reduce(
      (total, provision) =>
        provisionDefinitions.provisions[provision].crew
          ? total + provisionDefinitions.provisions[provision].crew! / 100
          : total,
      0
    ) + (hasImprovedVentilation ? 0.08 : 0);
  const commanderMastery = 1 + provisionCrewBonus;

  return (
    <StatsTableWrapper>
      <Flex gap="2" align="center">
        <Heading size="5">
          {strings.website.tools.tankopedia.crew.title}
        </Heading>

        <Popover.Root>
          <Popover.Trigger>
            <IconButton variant="ghost">
              <InfoCircledIcon />
            </IconButton>
          </Popover.Trigger>

          <Popover.Content>
            <Flex gap="1" align="center">
              <AccessibilityIcon />
              <Text>{strings.website.tools.tankopedia.crew.info}</Text>
            </Flex>
          </Popover.Content>
        </Popover.Root>
      </Flex>

      <InfoWithDelta value="crewCount" stats={stats} decimals={0} />

      {tank.crew.map((member) => {
        return (
          <Fragment key={member.type}>
            <InfoWithDelta
              stats={stats}
              key={`${member.type}-root`}
              name={`${
                strings.website.tools.tankopedia.crew[
                  CREW_MEMBER_NAMES[member.type]
                ]
              }${
                member.count > 1
                  ? ` ${literals(strings.common.units.x, { value: member.count })}`
                  : ""
              }`}
              decimals={0}
              noRanking
              value={() =>
                (member.type === CrewType.COMMANDER
                  ? commanderMastery
                  : commanderMastery * 1.1) * 100
              }
            />

            {member.substitute.length > 0 && (
              <InfoWithDelta
                stats={stats}
                key={`${member.type}-substitute`}
                decimals={0}
                indent
                name={
                  <>
                    <Flex align="center" gap="1" display="inline-flex">
                      <AccessibilityIcon />
                      {member.substitute
                        .map((sub, index) =>
                          index === 0
                            ? strings.website.tools.tankopedia.crew[
                                CREW_MEMBER_NAMES[sub]
                              ]
                            : sub
                        )
                        .join(", ")}
                    </Flex>
                  </>
                }
                noRanking
                value={() => commanderMastery * 1.05 * 100}
              />
            )}
          </Fragment>
        );
      })}
    </StatsTableWrapper>
  );
}
