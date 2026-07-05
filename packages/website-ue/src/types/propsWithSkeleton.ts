export type PropsWithSkeleton<Props> =
  | { skeleton: true; onIntersection?: () => void }
  | (Props & { skeleton?: false });
