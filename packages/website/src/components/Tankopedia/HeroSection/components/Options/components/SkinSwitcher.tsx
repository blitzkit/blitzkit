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
  const skin = Tankopedia.use((state) => state.loaders.skin.requested);
  const attachment = Tankopedia.use(
    (state) => state.loaders.attachment.requested,
  );
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const { unwrap } = useLocale();
  const skins = uniqBy(
    Object.values(camouflageDefinitions.camouflages).filter(
      (camouflage) => camouflage.tank_id === tank.id,
    ),
    (camouflage) => unwrap(camouflage.name!),
  );

  // attachments aren't camouflages so they get their own group
  const groups = [
    skins.filter((camouflage) => !camouflage.attachment),
    skins.filter((camouflage) => camouflage.attachment),
  ].filter((group) => group.length > 0);

  if (skins.length === 0) return null;

  return (
    <Flex
      direction="column"
      gap="3"
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
      {groups.map((group) => (
        <Flex key={group[0].id} direction="column">
          {group.map((camouflage, index) => {
            const name = unwrap(camouflage.name!).replace(
              "%(camo_num)",
              SKIN_NUMBER,
            );
            const top = index === 0 ? "var(--radius-full)" : "0";
            const bottom =
              index === group.length - 1 ? "var(--radius-full)" : "0";

            return (
              <Tooltip key={camouflage.id} content={name} side="left">
                <SidebarIconButton
                  selected={
                    (camouflage.attachment ? attachment : skin) ===
                    camouflage.id
                  }
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
                      const loader =
                        draft.loaders[
                          camouflage.attachment ? "attachment" : "skin"
                        ];

                      loader.requested =
                        loader.requested === camouflage.id
                          ? undefined
                          : camouflage.id;
                    });
                  }}
                />
              </Tooltip>
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
}
