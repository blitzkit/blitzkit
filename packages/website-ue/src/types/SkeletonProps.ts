export type SkeletonProps<Props> =
  | { skeleton: true }
  | (Props & { skeleton?: false });
