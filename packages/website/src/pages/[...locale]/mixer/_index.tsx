import { Box } from "@radix-ui/themes";
import { useRef } from "react";
import { MixerScene } from "../../../components/MixerScene";
import { awaitableModelDefinitions } from "../../../core/awaitables/modelDefinitions";
import { awaitableTankDefinitions } from "../../../core/awaitables/tankDefinitions";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../../hooks/useLocale";
import { Mixer } from "../../../stores/mixer";

const tankDefinitions = await awaitableTankDefinitions;
const modelDefinitions = await awaitableModelDefinitions;
const tanks = Object.values(tankDefinitions.tanks).filter((tank) => {
  const tankModel = modelDefinitions.models[tank.id];
  const turret = tank.turrets.at(-1)!;
  const turretModel = tankModel.turrets[turret.id];

  return tank.tier >= 10 && !turretModel.yaw;
});

export function Page({ locale }: LocaleAcceptorProps) {
  const hull = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const turretTank = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const turret = useRef(
    turretTank.current.turrets[
      Math.floor(Math.random() * turretTank.current.turrets.length)
    ]
  );
  const gunTank = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const gunTurret = useRef(
    gunTank.current.turrets[
      Math.floor(Math.random() * gunTank.current.turrets.length)
    ]
  );
  const gun = useRef(
    gunTurret.current.guns[
      Math.floor(Math.random() * gunTurret.current.guns.length)
    ]
  );

  Mixer.useInitialization({
    hull: hull.current,
    turret: { tank: turretTank.current, turret: turret.current },
    gun: {
      tank: gunTank.current,
      turret: gunTurret.current,
      gun: gun.current,
    },
  });

  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  return (
    <Box flexGrow="1" position="relative">
      <Box position="absolute" width="100%" height="100%" top="0" left="0">
        <MixerScene />
      </Box>
    </Box>
  );
}
