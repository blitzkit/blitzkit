import { alias } from "@blitzkit/core";
import { Flex, type FlexProps, Progress } from "@radix-ui/themes";
import { useProgress } from "@react-three/drei";

import { Maps } from "../../../../stores/maps";

type MapSandboxLoaderProps = FlexProps & {
  progressOffset?: string;
};

export function MapSandboxLoader({
  progressOffset,
  ...props
}: MapSandboxLoaderProps) {
  const data = useProgress();
  const id = Maps.use((state) => state.id);

  return (
    <Flex width="100%" height="100%" align="center" justify="center" {...props}>
      <img
        src={alias("api", `/maps/${id}/icons/big.webp`)}
        style={{ height: "75%", filter: "blur(1rem)" }}
      />
      <Progress
        size="3"
        value={data.progress}
        style={{
          position: "absolute",
          width: "16rem",
          maxWidth: "50vw",
          top: progressOffset ? `calc(50% + ${progressOffset})` : undefined,
        }}
      />
    </Flex>
  );
}
