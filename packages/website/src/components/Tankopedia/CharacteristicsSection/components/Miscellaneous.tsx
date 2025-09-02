import { asset } from "@blitzkit/core";
import { Flex, Heading } from "@radix-ui/themes";
import { useLocale } from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { GenericTankComponentButton } from "../../../ModuleButtons/GenericTankComponentButton";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

export function Miscellaneous() {
  const camouflage = Duel.use((state) => state.protagonist.camouflage);
  const cooldownBooster = Duel.use(
    (state) => state.protagonist.cooldownBooster
  );
  const { tank } = Duel.use((state) => state.protagonist);
  const { strings } = useLocale();

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">
        {strings.website.tools.tankopedia.configuration.miscellaneous.title}
      </Heading>

      <Flex gap="2" align="center">
        {!tank.fixed_camouflage && (
          <GenericTankComponentButton
            icon={asset("icons/camo.webp")}
            selected={camouflage}
            iconStyles={{
              top: "50%",
              left: "50%",
              transform: "translate(calc(-50% + 4px), calc(-50% + 4px))",
            }}
            onClick={() => {
              Duel.mutate((draft) => {
                draft.protagonist.camouflage = !camouflage;
              });
            }}
          />
        )}
        <GenericTankComponentButton
          icon={asset("icons/boosters/equipment.webp")}
          selected={cooldownBooster > 0}
          banner={
            cooldownBooster === 0
              ? undefined
              : cooldownBooster === 1
                ? "#afb0abc0"
                : cooldownBooster === 2
                  ? "#5f72cbc0"
                  : "#9b3cc0c0"
          }
          iconStyles={{
            transform: "translate(-50%, -50%) scale(0.8)",
          }}
          onClick={() => {
            Duel.mutate((draft) => {
              draft.protagonist.cooldownBooster++;
              if (draft.protagonist.cooldownBooster === 4)
                draft.protagonist.cooldownBooster = 0;
            });
          }}
        />
      </Flex>
    </ConfigurationChildWrapper>
  );
}
