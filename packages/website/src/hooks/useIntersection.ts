import { type RefObject, useEffect, useRef } from "react";

interface UseIntersectionOptions extends IntersectionObserverInit {
  disabled: boolean;
}

export function useIntersection(
  callback: () => void,
  ref: RefObject<HTMLElement>,
  options?: UseIntersectionOptions
) {
  const observer = useRef<IntersectionObserver>(null!);

  useEffect(() => {
    if (options?.disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const visible = !(rect.bottom < 0 || rect.top - window.innerHeight >= 0);

    if (visible) callback();

    observer.current = new IntersectionObserver(callback, options);
    observer.current.observe(ref.current);

    return () => observer.current!.disconnect();
  }, []);

  return observer;
}
