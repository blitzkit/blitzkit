import { alias, romanize } from "@blitzkit/core";
import type {
  GunDefinition,
  TankDefinition,
  TurretDefinition,
} from "@blitzkit/protos";
import { CaretUpIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { api } from "../../api/dynamic";
import { useStrings } from "../../hooks/useStrings";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { Discriminator } from "../Discriminator";
import { IconButton } from "../IconButton";
import { LazyImage } from "../LazyImage";
import { Popover } from "../Popover";
import { Skeleton } from "../Skeleton";
import { TankSearch } from "../TankSearch";
import styles from "./index.module.css";

const tankDefinitions = await api.tanks();

type MixerModuleChooserProps = MaybeSkeletonComponentProps & {
  tank: number;
  onSelect: (
    tank: TankDefinition,
    turret?: TurretDefinition,
    gun?: GunDefinition
  ) => void;
  turret?: number;
  gun?: number;
};

export function MixerModuleChooser({
  skeleton,
  tank,
  onSelect,
  turret,
  gun,
}: MixerModuleChooserProps) {
  const strings = useStrings();
  const [open, setOpen] = useState(false);
  const tankDefinition = tankDefinitions.tanks[tank];
  const turretDefinition = tankDefinition.turrets.find((t) => t.id === turret);
  const gunDefinition = turretDefinition?.guns.find((g) => g.id === gun);
  const topTurret = tankDefinition.turrets.at(-1)!;
  const subSelector =
    turret !== undefined &&
    (tankDefinition.turrets.length > 1 ||
      (gun !== undefined && turretDefinition!.guns.length > 1));

  return (
    <div className={styles["mixer-module-chooser"]}>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button
            variant="surface"
            listChild="horizontal"
            className={styles.trigger}
          >
            <div className={styles.sizer} />

            {skeleton ? (
              <Skeleton className={styles.skeleton} />
            ) : (
              <div
                className={styles["tank-image"]}
                style={{
                  backgroundImage: `url(${alias(
                    "api",
                    `/tanks/${tank}/icons/big.webp`
                  )})`,
                }}
              />
            )}
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {strings.website.common.tank_search.select_dialog_title}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <TankSearch
                compact
                onSelect={(tank) => {
                  onSelect?.(tank);
                  setOpen(false);
                }}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {subSelector && (
        <Popover.Root>
          <Popover.Trigger asChild>
            <IconButton variant="surface" listChild="horizontal">
              <CaretUpIcon />
            </IconButton>
          </Popover.Trigger>

          <Popover.Content>
            <div className={styles["popover-list"]}>
              {tankDefinition.turrets.length > 1 && (
                <div className={styles["popover-row"]}>
                  {tankDefinition.turrets.map((turret) => (
                    <IconButton
                      key={turret.id}
                      radius="1"
                      size="major"
                      variant={
                        turret.id === turretDefinition?.id ? "surface" : "soft"
                      }
                      color={
                        turret.id === turretDefinition?.id
                          ? turret.id === topTurret.id
                            ? "amber"
                            : undefined
                          : "gray"
                      }
                      className={styles["module-button"]}
                      onClick={() => {
                        onSelect?.(tankDefinition, turret);
                      }}
                    >
                      <LazyImage
                        alt="turret"
                        src={alias("api", "/icons/modules/turret.webp")}
                      />

                      <Discriminator corner="top-left">
                        {romanize(turret.tier)}
                      </Discriminator>
                    </IconButton>
                  ))}
                </div>
              )}

              {turretDefinition && turretDefinition.guns.length > 1 && (
                <div className={styles["popover-row"]}>
                  {turretDefinition.guns.map((gun) => (
                    <IconButton
                      key={gun.id}
                      radius="1"
                      size="major"
                      variant={
                        gun.id === gunDefinition?.id ? "surface" : "soft"
                      }
                      color={
                        gun.id === gunDefinition?.id
                          ? gun.id === topTurret.guns.at(-1)!.id
                            ? "amber"
                            : undefined
                          : "gray"
                      }
                      className={styles["module-button"]}
                      onClick={() => {
                        onSelect?.(tankDefinition, turretDefinition, gun);
                      }}
                    >
                      <LazyImage
                        alt="gun"
                        src={alias("api", "/icons/modules/gun.webp")}
                      />

                      <Discriminator corner="top-left">
                        {romanize(gun.tier)}
                      </Discriminator>
                    </IconButton>
                  ))}
                </div>
              )}
            </div>
          </Popover.Content>
        </Popover.Root>
      )}
    </div>
  );
}
