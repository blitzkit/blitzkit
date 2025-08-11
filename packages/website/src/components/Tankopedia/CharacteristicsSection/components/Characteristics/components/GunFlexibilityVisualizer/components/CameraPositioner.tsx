import { useFrame } from '@react-three/fiber';

export const zoom = 60;

export function CameraPositioner() {
  useFrame(({ camera, gl: { domElement } }) => {
    const { width } = domElement.getBoundingClientRect();
    const physicalWidth = width / zoom;

    camera.position.set(10, 0, -physicalWidth / 6);
  });

  return null;
}
