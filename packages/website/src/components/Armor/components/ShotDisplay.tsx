import { J_HAT, K_HAT } from '@blitzkit/core';
import { Box, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { invalidate, useFrame } from '@react-three/fiber';
import { clamp } from 'lodash-es';
import { useEffect, useRef, type ComponentProps } from 'react';
import {
  BufferGeometry,
  DoubleSide,
  Euler,
  Group,
  Line,
  LineDashedMaterial,
  Mesh,
  MeshBasicMaterial,
  Path,
  Quaternion,
} from 'three';
import { isHalloween } from '../../../core/blitzkit/isHalloween';
import { LocaleProvider, useLocale } from '../../../hooks/useLocale';
import {
  TankopediaEphemeral,
  type ShotLayerNonExternal,
  type ShotStatus,
} from '../../../stores/tankopediaEphemeral';
import { ShotDisplayCard } from './ShotDisplayCard';

export const shotStatusColors: Record<
  ShotStatus,
  ComponentProps<typeof Text>['color']
> = {
  blocked: 'red',
  penetration: 'green',
  ricochet: 'yellow',
  splash: 'orange',
};

const SURFACE_POINT_SIZE = 12;
export const SHOT_DISPLAY_LENGTH_INFINITY = 4;
const TRACER_THICK = 1 / 32;
const TRACER_THIN = TRACER_THICK / 2;

export function ShotDisplay() {
  const shot = TankopediaEphemeral.use((state) => state.shot);
  const inTracer = useRef<Mesh>(null);
  const outTracer = useRef<Mesh>(null);
  const splashRadiusWrapper = useRef<Group>(null);
  const splashRadiusMaterial = useRef<MeshBasicMaterial>(null);
  let animationStartTime: number | null = null;
  const { locale } = useLocale();

  useEffect(() => {
    if (shot?.splashRadius !== undefined) {
      const outlineGeometry = new BufferGeometry().setFromPoints(
        new Path().absarc(0, 0, 1, 0, Math.PI * 2).getSpacedPoints(50),
      );
      const outlineMaterial = new LineDashedMaterial({
        color: 'orange',
        dashSize: 0.05,
        gapSize: 0.025,
      });
      const outline = new Line(
        outlineGeometry,
        outlineMaterial,
      ).computeLineDistances();

      splashRadiusWrapper.current?.add(outline);

      return () => {
        splashRadiusWrapper.current?.remove(outline);
      };
    }
  });

  useEffect(() => {
    if (
      isHalloween() &&
      shot?.splashRadius !== undefined &&
      shot.in.status === 'penetration'
    ) {
      const audio = new Audio('/assets/audio/lotta-damage.mp3');

      audio.currentTime = 0.7;
      audio.volume = 0.25;
      audio.play();
    }
  }, [shot]);

  useFrame(({ clock }) => {
    if (!shot) return;

    const t = clock.elapsedTime;

    if (inTracer.current) {
      const tracerT1 = t % 1;
      const tracerT2 = (t + 0.5) % 1;

      inTracer.current.scale.set(1, 1 - 2 * Math.abs(tracerT1 - 0.5), 1);
      inTracer.current.position.set(0, (1 - tracerT1) * inLength, 0);

      if (outTracer.current) {
        outTracer.current.scale.set(1, 1 - 2 * Math.abs(tracerT2 - 0.5), 1);
        outTracer.current.position.set(0, tracerT2 * outLength, 0);
      }

      invalidate();
    }

    if (
      shot.splashRadius !== undefined &&
      splashRadiusWrapper.current &&
      splashRadiusMaterial.current
    ) {
      if (animationStartTime === null) animationStartTime = t;

      const scale =
        clamp(4 * (t - animationStartTime), 0, 1) * shot.splashRadius;
      const opacity = 1 - clamp(2 * (t - animationStartTime), 0, 1);

      splashRadiusWrapper.current.scale.set(scale, scale, scale);
      splashRadiusMaterial.current.opacity = opacity;

      invalidate();
    }
  });

  if (!shot) return null;

  const inLength =
    shot.in.layers.reduce((accumulator, layer) => {
      if (layer.type === null) return accumulator + layer.distance;
      return accumulator;
    }, 0) + SHOT_DISPLAY_LENGTH_INFINITY;
  const outLength =
    shot.out && shot.out.layers.length > 0
      ? (shot.in.layers.at(-1) as ShotLayerNonExternal).point.distanceTo(
          (shot.out.layers.at(-1) as ShotLayerNonExternal).point,
        )
      : SHOT_DISPLAY_LENGTH_INFINITY;
  const inLast = shot.in.layers.findLast(
    (layer) => layer.type !== null,
  ) as ShotLayerNonExternal;
  const outTitleColor = shot.out
    ? shotStatusColors[shot.out.status]
    : undefined;
  const inTitleColor = shotStatusColors[shot.in.status];
  const tracerGoingUp =
    shot.in.surfaceNormal.y + (shot.out?.surfaceNormal.y ?? 0) > 0;

  return (
    <group>
      {shot.splashRadius && (
        <group
          position={inLast.point}
          ref={splashRadiusWrapper}
          rotation={new Euler().setFromQuaternion(
            new Quaternion().setFromUnitVectors(K_HAT, shot.in.surfaceNormal),
          )}
        >
          <mesh>
            <circleGeometry />
            <meshBasicMaterial
              side={DoubleSide}
              color="orange"
              transparent
              ref={splashRadiusMaterial}
            />
          </mesh>
        </group>
      )}

      <Html position={inLast.point} center>
        <Box
          style={{
            pointerEvents: 'none',
            transform: `translateY(${tracerGoingUp ? 50 : -50}%)`,
          }}
          mb={tracerGoingUp ? '0' : '9'}
          pb={tracerGoingUp ? '0' : '4'}
          mt={tracerGoingUp ? '9' : '0'}
          pt={tracerGoingUp ? '4' : '0'}
        >
          <LocaleProvider locale={locale}>
            <ShotDisplayCard shot={shot} />
          </LocaleProvider>
        </Box>
      </Html>

      {[...shot.in.layers, ...(shot.out?.layers ?? [])].map((layer, index) => {
        if (layer.type === null) return null;

        const shotStatusColor =
          shot.in.status === 'splash'
            ? shotStatusColors.splash
            : shotStatusColors[layer.status];

        return (
          <Html
            position={layer.point}
            key={index}
            style={{
              pointerEvents: 'none',
              transform: 'translateY(-50%)',
            }}
          >
            <Flex
              style={{
                marginLeft: -SURFACE_POINT_SIZE / 2,
              }}
            >
              <div
                style={{
                  width: SURFACE_POINT_SIZE,
                  height: SURFACE_POINT_SIZE,
                  backgroundColor: shotStatusColor,
                  opacity: 0.75,
                  borderRadius: SURFACE_POINT_SIZE / 2,
                }}
              />
            </Flex>
          </Html>
        );
      })}

      <group
        position={inLast.point}
        rotation={new Euler().setFromQuaternion(
          new Quaternion().setFromUnitVectors(J_HAT, shot.in.surfaceNormal),
        )}
      >
        <mesh position={[0, inLength / 2, 0]} renderOrder={2}>
          <cylinderGeometry
            args={[TRACER_THIN / 2, TRACER_THIN / 2, inLength]}
          />
          <meshBasicMaterial depthTest={false} transparent />
        </mesh>

        <mesh ref={inTracer} position={[0, inLength / 2, 0]} renderOrder={3}>
          <cylinderGeometry
            args={[TRACER_THICK / 2, TRACER_THICK / 2, inLength]}
          />
          <meshBasicMaterial
            color={inTitleColor}
            depthTest={false}
            transparent
          />
        </mesh>
      </group>

      {shot.out && (
        <group
          position={inLast.point}
          rotation={new Euler().setFromQuaternion(
            new Quaternion().setFromUnitVectors(
              J_HAT,
              shot.out.surfaceNormal.clone(),
            ),
          )}
        >
          <mesh position={[0, outLength / 2, 0]} renderOrder={2}>
            <cylinderGeometry
              args={[TRACER_THIN / 2, TRACER_THIN / 2, outLength]}
            />
            <meshBasicMaterial depthTest={false} transparent />
          </mesh>

          <mesh
            ref={outTracer}
            position={[0, outLength / 2, 0]}
            renderOrder={3}
          >
            <cylinderGeometry
              args={[TRACER_THICK / 2, TRACER_THICK / 2, outLength]}
            />
            <meshBasicMaterial
              color={outTitleColor}
              depthTest={false}
              transparent
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
