import { times } from "lodash-es";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SkeletonProps } from "../../types/SkeletonProps";
import "./index.css";

export interface IncrementalLoaderProps<Props> {
  initial: number;
  skeleton: number;
  rate?: number;

  data: Props[];
  Component: (props: SkeletonProps<Props>) => ReactNode;
}

export function IncrementalLoader<Props>({
  initial,
  rate = 2,
  data,
  skeleton,
  Component,
}: IncrementalLoaderProps<Props>) {
  const [count, setCount] = useState(initial);
  console.log(count);
  const sliced = data.slice(0, count);

  return (
    <>
      {sliced.map((item, index) => (
        <Component key={index} {...item} />
      ))}

      {times(Math.min(skeleton, data.length - count), (index) => (
        <Item key={index} rate={rate} setCount={setCount}>
          <Component skeleton />
        </Item>
      ))}
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
