import { alias } from "@blitzkit/core";
import { Flex, Text, Tooltip } from "@radix-ui/themes";
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
  const attachment = Tankopedia.use((state) => state.requestedAttachment);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const { unwrap, strings } = useLocale();
  const skins = uniqBy(
    Object.values(camouflageDefinitions.camouflages).filter(
      (camouflage) => camouflage.tank_id === tank.id,
    ),
    (camouflage) =>
      (camouflage.name && unwrap(camouflage.name)) || camouflage.id,
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
            const rawName = camouflage.name && unwrap(camouflage.name);
            const name = rawName
              ? rawName.replace("%(camo_num)", SKIN_NUMBER)
              : strings.website.tools.tankopedia.sandbox.skins.unreleased;
            const top = index === 0 ? "var(--radius-full)" : "0";
            const bottom =
              index === group.length - 1 ? "var(--radius-full)" : "0";

            return (
              <Tooltip
                key={camouflage.id}
                content={
                  rawName ? (
                    name
                  ) : (
                    <Text style={{ color: "var(--orange-9)" }}>{name}</Text>
                  )
                }
                side="left"
              >
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
                    const slot = camouflage.attachment
                      ? "requestedAttachment"
                      : "requestedSkin";

                    Tankopedia.mutate((draft) => {
                      draft[slot] =
                        draft[slot] === camouflage.id
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
