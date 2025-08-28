import { Box } from '@radix-ui/themes';
import { useRef } from 'react';
import { MixerScene } from '../../../components/MixerScene';
import { PageWrapper } from '../../../components/PageWrapper';
import { awaitableTankDefinitions } from '../../../core/awaitables/tankDefinitions';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../hooks/useLocale';
import { MixerEphemeral } from '../../../stores/mixerEphemeral';

const tankDefinitions = await awaitableTankDefinitions;
const tanks = Object.values(tankDefinitions.tanks);

export function Page({ locale }: LocaleAcceptorProps) {
  const hull = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const turretTank = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const turret = useRef(
    turretTank.current.turrets[
      Math.floor(Math.random() * turretTank.current.turrets.length)
    ],
  );
  const gunTank = useRef(tanks[Math.floor(Math.random() * tanks.length)]);
  const gunTurret = useRef(
    gunTank.current.turrets[
      Math.floor(Math.random() * gunTank.current.turrets.length)
    ],
  );
  const gun = useRef(
    gunTurret.current.guns[
      Math.floor(Math.random() * gunTurret.current.guns.length)
    ],
  );

  return (
    <LocaleProvider locale={locale}>
      <MixerEphemeral.Provider
        data={{
          hull: hull.current,
          turret: { tank: turretTank.current, turret: turret.current },
          gun: {
            tank: gunTank.current,
            turret: gunTurret.current,
            gun: gun.current,
          },
        }}
      >
        <Content />
      </MixerEphemeral.Provider>
    </LocaleProvider>
  );
}

function Content() {
  return (
    <PageWrapper p="0">
      <Box flexGrow="1" position="relative">
        <Box position="absolute" width="100%" height="100%" top="0" left="0">
          <MixerScene />
        </Box>
      </Box>
    </PageWrapper>
  );
}
