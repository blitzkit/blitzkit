import { alias } from "@blitzkit/core";
import { uniqBy } from "lodash-es";
import { api } from "../../api/dynamic";
import { SKIN_NUMBER } from "../../constants/skinNumber";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

const camouflageDefinitions = await api.camouflages();

export function TankopediaSkinSwitcher() {
  const unwrap = useUnwrapper();

  const tank = useDuel("protagonist", DuelModule.Tank);

  const skin = Tankopedia.use((state) => state.loaders.skin.requested);
  const requestedDisplay = Tankopedia.use(
    (state) => state.loaders.display.requested,
  );
  const revealed = Tankopedia.use((state) => state.revealed);

  const skins = uniqBy(
    Object.values(camouflageDefinitions.camouflages).filter(
      (camouflage) => camouflage.tank_id === tank.id,
    ),
    (camouflage) => unwrap(camouflage.name!),
  );

  if (skins.length === 0) return null;

  const groups = [
    skins.filter((camouflage) => !camouflage.attachment),
    skins.filter((camouflage) => camouflage.attachment),
  ].filter((group) => group.length > 0);

  return (
    <div
      className={styles["skin-switcher"]}
      data-visible={revealed && requestedDisplay === TankopediaDisplay.Model}
    >
      {groups.map((group, index) => (
        <div className={styles.group} key={index}>
          {group.map((camouflage) => {
            const name = unwrap(camouflage.name!).replace(
              "%(camo_num)",
              SKIN_NUMBER,
            );

            const selected = skin === camouflage.id;

            return (
              <Tooltip key={camouflage.id} tooltip={name} side="left">
                <IconButton
                  parentListChild="vertical"
                  color={selected ? undefined : "gray"}
                  variant={selected ? "solid" : "soft"}
                  highContrast={selected}
                  size="major"
                  onClick={() => {
                    Tankopedia.mutate((draft) => {
                      draft.loaders.skin.requested =
                        draft.loaders.skin.requested === camouflage.id
                          ? undefined
                          : camouflage.id;
                    });
                  }}
                >
                  <img
                    className={styles["camouflage-icon"]}
                    alt={name}
                    src={alias(
                      "api",
                      `/icons/camouflages/${camouflage.id}.webp`,
                    )}
                  />
                </IconButton>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
}
