import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, MOUSE, Spherical, Vector3 } from "three";
import { type OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { resetViewEvent } from "../../../../../../core/maps/resetView";
import { Maps } from "../../../../../../stores/maps";
import { DEFAULT_EXTENT, initialCamera } from "../constants";

const MOVE_SPEED = 12;
const SPRINT_MULTIPLIER = 4;
const PAN_DISTANCE_SCALE = 100;
const MOVE_KEYS = ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE"];
const TRACKED_KEYS = [...MOVE_KEYS, "ShiftLeft", "ShiftRight"];
const LOOK_BUTTON = 2;
const LOOK_SPEED = 0.0015;
const LOOK_POLAR_LIMIT = 0.01;
const ORBIT_SPEED = 0.5;
const ZOOM_SPEED = 0.5;
const PAN_SPEED = 0.5;
const MOUSE_BUTTONS = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY };

export function Controls() {
  const controls = useRef<OrbitControlsImpl>(null);
  const canvas = useThree((state) => state.gl.domElement);
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    let looking = false;

    function disturb() {
      Maps.mutate((draft) => {
        draft.disturbed = true;
      });
    }

    function reset() {
      if (!controls.current) return;

      controls.current.target.set(0, 0, 0);
      controls.current.object.position.copy(
        initialCamera(Maps.state.extent ?? DEFAULT_EXTENT),
      );
      controls.current.update();
    }

    function handleResetView() {
      disturb();
      reset();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        !TRACKED_KEYS.includes(event.code) ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      pressedKeys.current.add(event.code);

      if (MOVE_KEYS.includes(event.code)) disturb();
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.code);
    }

    function handleBlur() {
      pressedKeys.current.clear();
      looking = false;
    }

    function handlePointerDown(event: PointerEvent) {
      disturb();

      if (event.button === LOOK_BUTTON) looking = true;
    }

    function handlePointerUp(event: PointerEvent) {
      if (event.button === LOOK_BUTTON) looking = false;
    }

    function handlePointerMove(event: PointerEvent) {
      const orbit = controls.current;

      if (!looking || !orbit) return;

      const camera = orbit.object;
      const view = new Spherical().setFromVector3(
        orbit.target.clone().sub(camera.position),
      );

      view.theta -= event.movementX * LOOK_SPEED;
      view.phi = MathUtils.clamp(
        view.phi + event.movementY * LOOK_SPEED,
        LOOK_POLAR_LIMIT,
        Math.PI - LOOK_POLAR_LIMIT,
      );
      orbit.target.setFromSpherical(view).add(camera.position);
      orbit.update();
    }

    const unsubscribeExtent = Maps.on((state) => state.extent, reset);

    resetViewEvent.on(handleResetView);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("wheel", disturb);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      unsubscribeExtent();
      resetViewEvent.off(handleResetView);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("wheel", disturb);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [canvas]);

  useFrame(({ camera }, delta) => {
    const orbit = controls.current;

    if (!orbit) return;

    const keys = pressedKeys.current;
    const forward = orbit.target.clone().sub(camera.position).setY(0);

    if (forward.lengthSq() === 0) {
      forward.set(0, 1, 0).applyQuaternion(camera.quaternion).setY(0);
    }

    if (forward.lengthSq() === 0) forward.set(0, 0, -1);

    forward.normalize();

    const right = new Vector3(-forward.z, 0, forward.x);
    const movement = forward
      .multiplyScalar(Number(keys.has("KeyW")) - Number(keys.has("KeyS")))
      .add(
        right.multiplyScalar(
          Number(keys.has("KeyD")) - Number(keys.has("KeyA")),
        ),
      )
      .add(
        new Vector3(0, Number(keys.has("KeyE")) - Number(keys.has("KeyQ")), 0),
      );

    if (movement.lengthSq() === 0) return;

    const speed =
      MOVE_SPEED *
      Math.max(
        1,
        camera.position.distanceTo(orbit.target) / PAN_DISTANCE_SCALE,
      ) *
      (keys.has("ShiftLeft") || keys.has("ShiftRight") ? SPRINT_MULTIPLIER : 1);

    movement.normalize().multiplyScalar(speed * delta);
    orbit.target.add(movement);
    camera.position.add(movement);
    orbit.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={false}
      mouseButtons={MOUSE_BUTTONS}
      rotateSpeed={ORBIT_SPEED}
      zoomSpeed={ZOOM_SPEED}
      panSpeed={PAN_SPEED}
      maxDistance={3000}
      minDistance={5}
    />
  );
}
