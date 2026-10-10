import { alias } from "@blitzkit/core";
import { HoverCard, Text } from "@radix-ui/themes";
import { uniqBy } from "lodash-es";
import { SKIN_NUMBER } from "../../../../../../constants/skinNumber";
import { api } from "../../../../../../core/blitzkit/api";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaDisplay } from "../../../../../../stores/tankopediaPersistent/constants";
import { SidebarIconButton, SidebarIconGroup } from "./SidebarIconButton";

const camouflageDefinitions = await api.camouflageDefinitions();

export function SkinSwitcher() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const skin = Tankopedia.use((state) => state.skin);
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
    <SidebarIconGroup
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
      {skins.map((camouflage) => {
        const name = unwrap(camouflage.name!).replace(
          "%(camo_num)",
          SKIN_NUMBER,
        );

        return (
          <HoverCard.Root key={camouflage.id}>
            <HoverCard.Trigger>
              <SidebarIconButton
                selected={skin === camouflage.id}
                alt={name}
                src={alias("api", `/icons/camouflages/${camouflage.id}.webp`)}
                size={{ initial: "3", sm: "4" }}
                imageStyle={{
                  width: "70%",
                  height: "70%",
                  borderRadius: "50%",
                }}
                onClick={() => {
                  Tankopedia.mutate((draft) => {
                    draft.skin =
                      draft.skin === camouflage.id ? undefined : camouflage.id;
                  });
                }}
              />
            </HoverCard.Trigger>

            <HoverCard.Content side="left" style={{ maxWidth: 280 }}>
              <Text size="2">{name}</Text>
            </HoverCard.Content>
          </HoverCard.Root>
        );
      })}
    </SidebarIconGroup>
  );
}
