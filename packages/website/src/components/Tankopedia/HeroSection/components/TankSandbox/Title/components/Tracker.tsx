import { Box, Progress } from '@radix-ui/themes';
import { useProgress } from '@react-three/drei';

interface Props {
  fontSize?: string;
}

export function Tracker({ fontSize }: Props) {
  const { loaded, total } = useProgress();
  const progress = total === 0 ? 0 : (loaded / total) * 100;

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
