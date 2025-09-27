import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Thanks GuCire!
 *
 * https://stackoverflow.com/a/65008608/12294756
 */
export function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver>(null!);

  useEffect(() => {
    observer.current = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    );
  }, [ref]);

  useEffect(() => {
    if (!ref.current) return;

    observer.current?.observe(ref.current);
    return () => observer.current?.disconnect();
  }, [ref]);

  return isIntersecting;
}
