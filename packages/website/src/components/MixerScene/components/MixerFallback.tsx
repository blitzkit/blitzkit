import { Progress } from "@radix-ui/themes";
import { Html } from "@react-three/drei";
import { useStableProgress } from "../../../hooks/useStableProgress";

export function MixerFallback() {
  const progress = useStableProgress();

  return (
    <Html center>
      <Progress value={progress} style={{ width: "10rem" }} />
    </Html>
  );
}
