import type { SpotLightProps } from '@react-three/fiber';
import { memo } from 'react';
import { Color } from 'three';
import { isHalloween } from '../core/blitzkit/isHalloween';

interface Props extends SpotLightProps {
  debug?: boolean;
}

export const HelpingSpotLight = memo<Props>(({ debug, ...props }) => {
  const color = new Color();

  if (isHalloween()) color.set(1, 0.25, 0.25);

  return (
    <>
      {debug && (
        <mesh position={props.position}>
          <icosahedronGeometry args={[0.1, 2]} />
          <meshBasicMaterial color={props.color} />
        </mesh>
      )}

      <spotLight color={color} {...props} />
    </>
  );
});
