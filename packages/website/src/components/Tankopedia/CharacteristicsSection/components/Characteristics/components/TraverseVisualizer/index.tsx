import { literals } from '@blitzkit/i18n';
import { Checkbox, Code, Flex, Tabs, Text } from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import type { TankCharacteristics } from '../../../../../../../core/blitzkit/tankCharacteristics';
import { useLocale } from '../../../../../../../hooks/useLocale';
import { VisualizerCard } from '../VisualizerCard';

export interface StatsAcceptorProps {
  stats: TankCharacteristics;
}

type Terrain = 'Hard' | 'Medium' | 'Soft';

export function TraverseVisualizer({ stats }: StatsAcceptorProps) {
  const hull = useRef<HTMLDivElement>(null);
  const turret = useRef<HTMLImageElement>(null);
  const [terrain, setTerrain] = useState<Terrain>('Hard');
  const [rotateHull, setRotateHull] = useState(true);
  const [rotateTurret, setRotateTurret] = useState(true);
  const { strings } = useLocale();
  const isTurretless =
    stats.azimuthLeft !== undefined || stats.azimuthRight !== undefined;
  const turretAngle = useRef(0);
  const hullAngle = useRef(0);
  const turretSpeedDeg = rotateTurret ? stats.turretTraverseSpeed : 0;
  const hullSpeedDeg = rotateHull ? stats[`hullTraverse${terrain}Terrain`] : 0;

  useEffect(() => {
    let cancel = false;
    const turretSpeedRad = turretSpeedDeg * (Math.PI / 180);
    const hullTraverseRad = hullSpeedDeg * (Math.PI / 180);
    let lastT = Date.now() / 1000;

    function frame() {
      const t = Date.now() / 1000;
      const dt = t - lastT;
      lastT = t;

      if (turret.current) {
        turretAngle.current =
          (turretAngle.current + turretSpeedRad * dt) % (2 * Math.PI);
        turret.current.style.transform = `translate(-50%, -50%) rotate(${-turretAngle.current}rad)`;
      }

      if (hull.current) {
        hullAngle.current =
          (hullAngle.current + hullTraverseRad * dt) % (2 * Math.PI);
        hull.current.style.transform = `translate(-50%, -50%) rotate(${-hullAngle.current}rad)`;
      }

      if (!cancel) requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancel = true;
    };
  }, [terrain, turretSpeedDeg, hullSpeedDeg]);

  return (
    <VisualizerCard>
      <div
        ref={hull}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animationDuration: `${
            rotateHull ? 360 / stats[`hullTraverse${terrain}Terrain`] : 0
          }s`,
        }}
      >
        <img
          draggable="false"
          style={{
            width: isTurretless ? '22rem' : '12rem',
            height: isTurretless ? '22rem' : '12rem',
            objectFit: 'contain',
            filter: 'drop-shadow(0px 0px 4px black)',
          }}
          src={`/assets/images/tankopedia/visualizers/hull-traverse/hull${isTurretless ? '-only' : ''}.png`}
        />

        {!isTurretless && (
          <img
            draggable="false"
            ref={turret}
            style={{
              width: '27rem',
              height: '27rem',
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              filter: 'drop-shadow(0px 0px 4px black)',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${
                rotateTurret ? 360 / stats.turretTraverseSpeed : 0
              }s`,
            }}
            src="/assets/images/tankopedia/visualizers/hull-traverse/turret.png"
          />
        )}
      </div>

      <Flex
        position="absolute"
        bottom="0"
        left="50%"
        style={{
          transform: 'translateX(-50%)',
        }}
      >
        <Tabs.Root
          value={terrain}
          onValueChange={(terrain) => setTerrain(terrain as Terrain)}
        >
          <Tabs.List>
            <Tabs.Trigger value="Hard">
              {strings.website.tools.tankopedia.visualizers.rotator.hard}
            </Tabs.Trigger>
            <Tabs.Trigger value="Medium">
              {strings.website.tools.tankopedia.visualizers.rotator.medium}
            </Tabs.Trigger>
            <Tabs.Trigger value="Soft">
              {strings.website.tools.tankopedia.visualizers.rotator.soft}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </Flex>

      <Flex
        gap="2"
        position="absolute"
        left="50%"
        bottom="7"
        style={{
          transform: 'translateX(-50%)',
        }}
      >
        <Text color="gray" size="1">
          {strings.website.tools.tankopedia.visualizers.rotator.effective}
        </Text>
        <Code size="1" variant="ghost">
          {literals(strings.common.units.deg_s, [
            `${(turretSpeedDeg + hullSpeedDeg).toFixed(1)}`,
          ])}
        </Code>
      </Flex>

      {!isTurretless && (
        <Flex
          position="absolute"
          top="4"
          left="50%"
          width="100%"
          px="5"
          gap="5"
          justify="center"
          style={{
            transform: 'translateX(-50%)',
            userSelect: 'none',
          }}
        >
          <Flex
            align="center"
            gap="2"
            onClick={() => setRotateHull((state) => !state)}
            style={{ cursor: 'pointer' }}
          >
            <Checkbox variant="classic" checked={rotateHull} />
            <Text size="2">
              {strings.website.tools.tankopedia.visualizers.rotator.hull}
            </Text>
          </Flex>

          <Flex
            align="center"
            gap="2"
            onClick={() => setRotateTurret((state) => !state)}
            style={{ cursor: 'pointer' }}
          >
            <Checkbox variant="classic" checked={rotateTurret} />
            <Text size="2">
              {strings.website.tools.tankopedia.visualizers.rotator.turret}
            </Text>
          </Flex>
        </Flex>
      )}
    </VisualizerCard>
  );
}
