import { alias } from "@blitzkit/core";
import { uniqBy } from "lodash-es";
import { api } from "../../api/dynamic";
import { SKIN_NUMBER } from "../../constants/skinNumber";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import { SidebarIconButton } from "../Tankopedia/HeroSection/components/Options/components/SidebarIconButton";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

const camouflageDefinitions = await api.camouflages();

export function TankopediaSkinSwitcher() {
  const unwrap = useUnwrapper();

  const tank = useDuel("protagonist", DuelModule.Tank);

  const skin = Tankopedia.use((state) => state.requestedSkin);
  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const disturbed = Tankopedia.use((state) => state.disturbed);

  const skins = uniqBy(
    Object.values(camouflageDefinitions.camouflages).filter(
      (camouflage) => camouflage.tank_id === tank.id,
    ),
    (camouflage) => unwrap(camouflage.name!),
  );

  if (skins.length === 0) return null;

  return (
    <div
      className={styles["skin-switcher"]}
      data-visible={disturbed && requestedDisplay === TankopediaDisplay.Model}
    >
      {skins.map((camouflage, index) => {
        const name = unwrap(camouflage.name!).replace(
          "%(camo_num)",
          SKIN_NUMBER,
        );
        const top = index === 0 ? "var(--radius-full)" : "0";
        const bottom = index === skins.length - 1 ? "var(--radius-full)" : "0";

        return (
          <Tooltip key={camouflage.id} tooltip={name} side="left">
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
    </div>
  );
}
