import type { SpotLightProps } from '@react-three/fiber';

interface Props extends SpotLightProps {
  debug?: boolean;
}

export function HelpingSpotLight({ debug, ...props }: Props) {
  return (
    <>
      {debug && (
        <mesh position={props.position}>
          <icosahedronGeometry args={[0.1, 2]} />
          <meshBasicMaterial color={props.color} />
        </mesh>
      )}

      <spotLight {...props} />
    </>
  );
}
