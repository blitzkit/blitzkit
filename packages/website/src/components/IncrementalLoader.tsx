import { times } from "lodash-es";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { MaybeSkeletonComponentProps } from "../types/maybeSkeletonComponentProps";

export interface IncrementalLoaderProps<Props extends { key: string }> {
  initial: number;
  intermediate: number;
  rate?: number;
  skeleton?: boolean;
  data: Props[];
  Component: (
    props: MaybeSkeletonComponentProps<Omit<Props, "key">>,
  ) => ReactNode;
}

export function IncrementalLoader<Props extends { key: string }>({
  initial,
  rate = 2,
  data,
  skeleton,
  intermediate,
  Component,
}: IncrementalLoaderProps<Props>) {
  const [count, setCount] = useState(initial);
  const sliced = data.slice(0, count);

  // Stable so memoized skeletons skip re-rendering whenever more load in
  const loadMore = useCallback(() => setCount((state) => state + rate), [rate]);

  useEffect(() => setCount(initial), [data, initial]);

  return (
    <>
      {!skeleton &&
        sliced.map(({ key, ...props }) => <Component key={key} {...props} />)}

      {times(
        skeleton
          ? initial + intermediate
          : Math.min(intermediate, data.length - count),
        (index) => (
          <Component key={index} skeleton onIntersection={loadMore} />
        ),
      )}
    </>
  );
}
