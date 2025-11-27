import { Box, Text } from "@radix-ui/themes";
import { Html } from "@react-three/drei";
import { memo, type ComponentProps } from "react";

interface Props extends ComponentProps<"spotLight"> {
  debug?: boolean;
}

export const HelpingSpotLight = memo<Props>(({ debug, ...props }) => {
  return (
    <>
      {debug && (
        <group position={props.position}>
          <mesh>
            <icosahedronGeometry args={[0.1, 2]} />
            <meshBasicMaterial color={props.color} />
          </mesh>

          <Html center>
            <Box pb="9">
              <Text wrap="nowrap">
                {props.intensity} @ {JSON.stringify(props.userData)}
              </Text>
            </Box>
          </Html>
        </group>
      )}

      <spotLight {...props} />
    </>
  );
});
