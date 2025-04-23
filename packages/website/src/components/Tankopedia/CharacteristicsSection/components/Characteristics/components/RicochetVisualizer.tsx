import { asset } from '@blitzkit/core';
import { literals } from '@blitzkit/i18n';
import { Box, Card, Code, Flex, Text } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { clamp, degToRad, radToDeg } from 'three/src/math/MathUtils.js';
import { Var } from '../../../../../../core/radix/var';
import { useLocale } from '../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../stores/duel';
import type { StatsAcceptorProps } from './HullTraverseVisualizer';

export function RicochetVisualizer({ stats }: StatsAcceptorProps) {
  const shell = Duel.use((state) => state.protagonist.shell);
  const container = useRef<HTMLDivElement>(null);
  const normalization = degToRad(stats.shellNormalization);
  const ricochet = degToRad(stats.shellRicochet ?? 90);
  const [angle, setAngle] = useState(degToRad(-25));
  const doesRicochet = Math.abs(angle) >= ricochet;
  const effectiveAngle = doesRicochet
    ? -angle + Math.PI
    : Math.sign(angle) * Math.max(0, Math.abs(angle) - normalization);
  const { strings } = useLocale();

  return (
    <Card
      variant="classic"
      style={{
        aspectRatio: '1 / 1',
      }}
      mb="6"
      ref={container}
      onPointerMove={(event) => {
        if (!container.current) return;

        const rect = container.current.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 3;
        const y = event.clientY - rect.top - rect.height / 2;
        const angle = clamp(Math.atan2(-y, x), -Math.PI / 2, Math.PI / 2);

        setAngle(angle);
      }}
    >
      <Box
        width="33%"
        height="100%"
        position="absolute"
        top="0"
        left="0"
        style={{
          background: `linear-gradient(to right, ${Var('gray-a1')}, ${Var('gray-a5')})`,
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            opacity: 2 ** -3,
            backgroundImage: `url(/assets/images/tankopedia/visualizers/ricochet/armor-hash.png)`,
          }}
        />
      </Box>

      <Box
        left="33%"
        top="0"
        width="67%"
        height="100%"
        position="absolute"
        style={{
          background: `conic-gradient(
            at 0 50%,

            ${Var('ruby-a2')},
            ${Var('ruby-a1')} ${Math.PI / 2 - ricochet}rad,

            ${Var('jade-a2')} ${Math.PI / 2 - ricochet}rad,
            ${Var('jade-a4')} ${Math.PI / 2 - normalization}rad,

            ${Var('cyan-a5')} ${Math.PI / 2 - normalization}rad,
            ${Var('cyan-a3')} ${Math.PI / 2 + normalization}rad,

            ${Var('jade-a2')} ${Math.PI / 2 + normalization}rad,
            ${Var('jade-a4')} ${Math.PI / 2 + ricochet}rad,

            ${Var('ruby-a1')} ${Math.PI / 2 + ricochet}rad,
            ${Var('ruby-a2')} 180deg
          `,
        }}
      />

      <Box
        position="absolute"
        left="33%"
        top="50%"
        height="18rem"
        style={{
          transformOrigin: 'top center',
          transform: `translateX(-50%) rotate(${-Math.PI / 2 - angle}rad)`,
        }}
      >
        <Box
          position="absolute"
          width="1px"
          height="100%"
          bottom="100%"
          style={{
            transform: 'translateX(-50%)',
            backgroundColor: Var('gray-a5'),
          }}
        />
        <Box
          position="absolute"
          width="2px"
          height="100%"
          style={{
            transform: 'translateX(-50%)',
            background: `linear-gradient(${Var('gray-a11')}, ${Var('gray-a4')})`,
          }}
        />

        <img
          src={asset(`icons/shells/${shell.icon}.webp`)}
          style={{
            objectFit: 'contain',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            position: 'absolute',
            width: '2rem',
            height: '2rem',
            top: '6rem',
            left: 0,
            filter: 'drop-shadow(0px 0px 4px black)',
          }}
        />
      </Box>

      <Box
        position="absolute"
        left="33%"
        top="50%"
        height="16rem"
        style={{
          transformOrigin: 'top center',
          transform: `translateX(-50%) rotate(${-Math.PI / 2 - effectiveAngle}rad)`,
        }}
      >
        <Box
          position="absolute"
          width="2px"
          height="100%"
          top="-100%"
          style={{
            transform: 'translateX(-50%)',
            background: `linear-gradient(${Var('gray-a4')}, ${Var('gray-a11')})`,
          }}
        />
      </Box>

      <Flex
        style={{ userSelect: 'none' }}
        gap="4"
        position="absolute"
        top="0"
        left="0"
        p="3"
        width="100%"
        justify="between"
      >
        <Flex gap="2">
          <Text color="gray" size="1">
            {strings.website.tools.tankopedia.visualizers.ricochet.angle}
          </Text>
          <Code size="1" variant="ghost">
            {literals(strings.common.units.deg, [
              radToDeg(Math.abs(angle)).toFixed(0),
            ])}
          </Code>
        </Flex>

        <Flex gap="2">
          <Text color="gray" size="1">
            {
              strings.website.tools.tankopedia.visualizers.ricochet
                .normalization
            }
          </Text>
          <Code size="1" variant="ghost">
            {doesRicochet
              ? '-'
              : literals(strings.common.units.deg, [
                  radToDeg(Math.min(normalization, Math.abs(angle))).toFixed(0),
                ])}
          </Code>
        </Flex>
      </Flex>

      <Flex
        style={{ userSelect: 'none' }}
        gap="4"
        position="absolute"
        bottom="0"
        left="0"
        p="3"
        width="100%"
        justify="between"
      >
        <Flex gap="2">
          <Text color="gray" size="1">
            {
              strings.website.tools.tankopedia.visualizers.ricochet
                .effective_angle
            }
          </Text>
          <Code size="1" variant="ghost">
            {doesRicochet
              ? '-'
              : literals(strings.common.units.deg, [
                  radToDeg(Math.abs(effectiveAngle)).toFixed(0),
                ])}
          </Code>
        </Flex>

        <Flex gap="2">
          <Text color="gray" size="1">
            {strings.website.tools.tankopedia.visualizers.ricochet.armor}
          </Text>
          <Code size="1" variant="ghost">
            {doesRicochet
              ? '-'
              : literals(strings.common.units.percentage, [
                  (100 / Math.cos(effectiveAngle)).toFixed(0),
                ])}
          </Code>
        </Flex>
      </Flex>
    </Card>
  );
}
