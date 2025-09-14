import { Box, Progress } from "@radix-ui/themes";
import { useStableProgress } from "../../../../../../../hooks/useStableProgress";

interface Props {
  fontSize?: string;
}

export function Tracker({ fontSize }: Props) {
  const progress = useStableProgress();

  return (
    <Box
      position="absolute"
      left="50%"
      top="50%"
      width="min(100%, 16rem)"
      style={{
        transform: `translate(-50%, calc(${fontSize} / 2 + var(--space-4)))`,
      }}
    >
      <Progress color="gray" value={progress} />
    </Box>
  );
}
