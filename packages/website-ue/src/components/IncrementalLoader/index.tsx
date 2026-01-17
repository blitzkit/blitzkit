import { times } from "lodash-es";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PropsWithSkeleton } from "../../types/propsWithSkeleton";
import "./index.css";

export interface IncrementalLoaderProps<Props extends { key: string }> {
  initial: number;
  intermediate: number;
  rate?: number;

  skeleton?: boolean;
  data: Props[];
  Component: (props: PropsWithSkeleton<Omit<Props, "key">>) => ReactNode;
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
          <Item key={index} rate={rate} setCount={setCount}>
            <Component skeleton />
          </Item>
        )
      )}
    </>
  );
}

interface ItemProps {
  children: ReactNode;
  rate: number;
  setCount: (setter: (state: number) => number) => void;
}

function Item({ setCount, rate, children }: ItemProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    function dispose() {
      observer.current?.disconnect();
      observer.current = null;
    }

    if (!wrapper.current) return;

    if (observer.current === null) {
      observer.current = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        setCount((state) => state + rate);
      });

      observer.current.observe(wrapper.current);
    }

    return dispose;
  }, []);

  return (
    <div ref={wrapper} className="incremental-loader">
      {children}
    </div>
  );
}
