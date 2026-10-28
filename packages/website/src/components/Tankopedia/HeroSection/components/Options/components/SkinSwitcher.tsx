import { alias } from "@blitzkit/core";
import { Flex, Tooltip } from "@radix-ui/themes";
import { uniqBy } from "lodash-es";
import { SKIN_NUMBER } from "../../../../../../constants/skinNumber";
import { api } from "../../../../../../core/blitzkit/api";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaDisplay } from "../../../../../../stores/tankopediaPersistent/constants";
import { SidebarIconButton } from "./SidebarIconButton";

const camouflageDefinitions = await api.camouflageDefinitions();

export function SkinSwitcher() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const skin = Tankopedia.use((state) => state.requestedSkin);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const { unwrap } = useLocale();
  const skins = uniqBy(
    Object.values(camouflageDefinitions.camouflages).filter(
      (camouflage) => camouflage.tank_id === tank.id,
    ),
    (camouflage) => unwrap(camouflage.name!),
  );

  if (skins.length === 0) return null;

  return (
    <Flex
      direction="column"
      top="50%"
      right={
        disturbed && requestedDisplay === TankopediaDisplay.Model
          ? "3"
          : "-4rem"
      }
      style={{
        position: "absolute",
        transform: "translateY(-50%)",
        transitionDuration: "200ms",
        pointerEvents: "auto",
      }}
    >
      {skins.map((camouflage, index) => {
        const name = unwrap(camouflage.name!).replace(
          "%(camo_num)",
          SKIN_NUMBER,
        );
        const top = index === 0 ? "var(--radius-full)" : "0";
        const bottom = index === skins.length - 1 ? "var(--radius-full)" : "0";

        return (
          <Tooltip key={camouflage.id} content={name} side="left">
            <SidebarIconButton
              selected={skin === camouflage.id}
              alt={name}
              src={alias("api", `/icons/camouflages/${camouflage.id}.webp`)}
              size={{ initial: "3", sm: "4" }}
              radius="full"
              style={{
                borderRadius: `${top} ${top} ${bottom} ${bottom}`,
              }}
              imageStyle={{
                width: "70%",
                height: "70%",
                borderRadius: "50%",
              }}
              onClick={() => {
                Tankopedia.mutate((draft) => {
                  draft.requestedSkin =
                    draft.requestedSkin === camouflage.id
                      ? undefined
                      : camouflage.id;
                });
              }}
            />
          </Tooltip>
        );
      })}
    </Flex>
  );
}
