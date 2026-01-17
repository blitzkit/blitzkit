export type PropsWithSkeleton<Props> =
  | { skeleton: true }
  | (Props & { skeleton?: false });
