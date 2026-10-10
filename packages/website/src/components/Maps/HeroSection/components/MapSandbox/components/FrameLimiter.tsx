import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

const FRAME_INTERVAL = 1000 / 60;

export function FrameLimiter() {
  const advance = useThree((state) => state.advance);
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    let request = 0;
    let last = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });

    function loop(time: number) {
      request = requestAnimationFrame(loop);

      const elapsed = time - last;

      if (!visible || elapsed < FRAME_INTERVAL) return;

      last = time - (elapsed % FRAME_INTERVAL);
      advance(time / 1000);
    }

    observer.observe(canvas);
    request = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
    };
  }, [advance, canvas]);

  return null;
}
