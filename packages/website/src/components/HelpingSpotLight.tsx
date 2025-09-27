import { memo, type ComponentProps } from "react";

interface Props extends ComponentProps<"spotLight"> {
  debug?: boolean;
}

export const HelpingSpotLight = memo<Props>(({ debug, ...props }) => {
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
});
