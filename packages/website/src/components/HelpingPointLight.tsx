import type { PointLightProps } from '@react-three/fiber';

interface Props extends PointLightProps {
  debug?: boolean;
}

export function HelpingPointLight({ debug, ...props }: Props) {
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
