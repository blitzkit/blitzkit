import { alias } from "@blitzkit/core";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { uniqBy } from "lodash-es";
import { api } from "../../api/dynamic";
import { SKIN_NUMBER } from "../../constants/skinNumber";
import { useAbsoluteDisplay } from "../../hooks/useAbsoluteDisplay";
import { useDuelModules } from "../../hooks/useDuelModules";
import { hasSkinAnimations } from "../../hooks/useSkin";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

const camouflageDefinitions = await api.camouflages();

export function TankopediaSkinSwitcher() {
  const unwrap = useUnwrapper();

  const protagonist = useDuelModules("protagonist");

  const skin = Tankopedia.use((state) => state.loaders.skin.requested);
  const showControls = Tankopedia.use((state) => state.showControls);
  const isModelDisplay = useAbsoluteDisplay(TankopediaDisplay.Model);
  const loadedSkin = Tankopedia.use((state) => state.loaders.skin.loaded);
  const loadedAttachment = Tankopedia.use(
    (state) => state.loaders.attachment.loaded,
  );
  const playing = Tankopedia.use((state) => state.animate);

  const skins = uniqBy(
    Object.values(camouflageDefinitions.camouflages).filter(
      (camouflage) => camouflage.tank_id === protagonist.tank.id,
    ),
    (camouflage) => unwrap(camouflage.name!),
  );

  if (skins.length === 0) return null;

  const groups = [
    skins.filter((camouflage) => !camouflage.attachment),
    skins.filter((camouflage) => camouflage.attachment),
  ].filter((group) => group.length > 0);

  const isVisible = showControls && isModelDisplay;
  const hasAnimations =
    hasSkinAnimations(protagonist.tank.id, loadedSkin) ||
    hasSkinAnimations(protagonist.tank.id, loadedAttachment);

  return (
    <div className={styles["skin-switcher"]} data-visible={isVisible}>
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

      {hasAnimations && (
        <Tooltip
          tooltip={playing ? "Pause animations" : "Play animations"}
          side="left"
        >
          <IconButton
            color="gray"
            variant="soft"
            size="major"
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.animate = !draft.animate;
              });
            }}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}
