import { asset } from "@blitzkit/core";
import { Flex, type FlexProps, Progress } from "@radix-ui/themes";
import { useProgress } from "@react-three/drei";

type TankSandboxLoaderProps = Omit<FlexProps, "id"> & {
  id: number;
};

export function TankSandboxLoader({ id, ...props }: TankSandboxLoaderProps) {
  const data = useProgress();

  return (
    <Flex width="100%" height="100%" align="center" justify="center" {...props}>
      <img
        src={asset(`icons/tanks/big/${id}.webp`)}
        style={{ height: "75%", filter: "blur(1rem)" }}
      />
      <Progress
        size="3"
        value={data.progress}
        style={{ position: "absolute", width: "16rem", maxWidth: "50vw" }}
      />
    </Flex>
  );
}
