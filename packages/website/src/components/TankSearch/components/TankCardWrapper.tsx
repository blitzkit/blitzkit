import { Grid, type GridProps } from "@radix-ui/themes";

export function TankCardWrapper(props: GridProps) {
  return (
    <Grid
      py="4"
      columns="repeat(auto-fill, minmax(7rem, 1fr))"
      flow="dense"
      gap="4"
      gapY="8"
      {...props}
    />
  );
}
