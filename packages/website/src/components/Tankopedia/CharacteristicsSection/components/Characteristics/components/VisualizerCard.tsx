import { Card, type CardProps } from '@radix-ui/themes';
import { forwardRef } from 'react';

export const VisualizerCard = forwardRef<HTMLDivElement, CardProps>(
  ({ style, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="classic"
        mt="4"
        mb="6"
        style={{ aspectRatio: '1 / 1', ...style }}
        {...props}
      />
    );
  },
);
