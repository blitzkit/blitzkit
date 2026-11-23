import { UpdateIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { Button } from "../../../../components/Button";
import { MixerModuleChooser } from "../../../../components/MixerModuleChooser";
import { MixerModuleSeparator } from "../../../../components/MixerModuleSeparator";
import { MixerScene } from "../../../../components/MixerScene";
import { ScreenshotButton } from "../../../../components/ScreenshotButton";
import { curateMixer } from "../../../../core/blitzkit/curateMixer";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import { useStrings } from "../../../../hooks/useStrings";
import { Mixer } from "../../../../stores/mixer";
import { Tankopedia } from "../../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";
import styles from "./_index.module.css";

export const Page = withLocale(
  withErrorWrapper(({ skeleton }: MaybeSkeletonComponentProps) => {
    const initial = useRef(curateMixer());

    Mixer.useInitialization(() => initial.current);
    Tankopedia.useInitialization(() => initial.current.hull);

    return (
      <div className={styles.wrapper}>
        <Content skeleton={skeleton} />
      </div>
    );
  })
);

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  const hullTankId = Mixer.use((state) => state.hull);
  const turretTankId = Mixer.use((state) => state.turret.tank.id);
  const turretTurretId = Mixer.use((state) => state.turret.turret.id);
  const gunTankId = Mixer.use((state) => state.gun.tank.id);
  const gunTurretId = Mixer.use((state) => state.gun.turret.id);
  const gunGunId = Mixer.use((state) => state.gun.gun.id);
  const canvas = useRef<HTMLCanvasElement>(null!);
  const strings = useStrings();

  return (
    <div className={styles.content}>
      <div className={styles.scene}>
        {!skeleton && <MixerScene ref={canvas} />}
      </div>

      <div className={styles.controls}>
        <div className={styles.row}>
          <ScreenshotButton
            name={hullTankId.slug}
            canvas={canvas}
            variant="surface"
          >
            {strings.mixer.screenshot}
          </ScreenshotButton>

          <Button
            variant="surface"
            onClick={() => {
              const mixed = curateMixer();

              Mixer.mutate((draft) => {
                Object.assign(draft, mixed);
              });
            }}
          >
            <UpdateIcon />
            {strings.mixer.randomize}
          </Button>
        </div>

        <div className={styles.modules}>
          <MixerModuleChooser
            skeleton={skeleton}
            tank={hullTankId.id}
            onSelect={(tank) => {
              Mixer.mutate((draft) => {
                draft.hull = tank;
              });
            }}
          />
          <MixerModuleSeparator />
          <MixerModuleChooser
            skeleton={skeleton}
            tank={turretTankId}
            turret={turretTurretId}
            onSelect={(tank, turret) => {
              Mixer.mutate((draft) => {
                draft.turret = {
                  tank,
                  turret: turret ?? tank.turrets.at(-1)!,
                };
              });
            }}
          />
          <MixerModuleSeparator />
          <MixerModuleChooser
            skeleton={skeleton}
            tank={gunTankId}
            turret={gunTurretId}
            gun={gunGunId}
            onSelect={(tank, turret, gun) => {
              Mixer.mutate((draft) => {
                draft.gun = {
                  tank,
                  turret: turret ?? tank.turrets.at(-1)!,
                  gun:
                    gun ??
                    turret?.guns.at(-1) ??
                    tank.turrets.at(-1)!.guns.at(-1)!,
                };
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
