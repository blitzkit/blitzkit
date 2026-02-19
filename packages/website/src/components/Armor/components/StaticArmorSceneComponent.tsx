import { I_HAT, J_HAT } from "@blitzkit/core";
import { invalidate, useThree } from "@react-three/fiber";
import { clamp } from "lodash-es";
import type { QuicklimeEvent } from "quicklime";
import { useEffect, useMemo, type ComponentProps } from "react";
import {
  Box3,
  Color,
  DoubleSide,
  FrontSide,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Plane,
  Quaternion,
  Vector3,
} from "three";
import { unrotateDavaVector } from "../../../core/blitz/unrotateDavaVector";
import { jsxTree } from "../../../core/blitzkit/jsxTree";
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from "../../../core/blitzkit/modelTransform";
import { discardClippingPlane } from "../../../core/three/discardClippingPlane";
import { Tankopedia } from "../../../stores/tankopedia";
import { transitionEvent } from "../../Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { ArmorType } from "./SpacedArmorScene";
import type {
  ArmorUserData,
  ExternalModuleVariant,
} from "./SpacedArmorSceneComponent";
import type { ThicknessRange } from "./StaticArmor";

type StaticArmorSceneComponentProps = {
  name: string;
  thickness: number;
  thicknessRange: ThicknessRange;
  node: Object3D;
  onPointerDown?: ComponentProps<"mesh">["onPointerDown"];
} & (
  | {
      type: Exclude<ArmorType, ArmorType.External>;
    }
  | {
      type: ArmorType.External;
      variant: ExternalModuleVariant;
    }
) &
  (
    | {
        clip?: undefined;
      }
    | {
        clip: Plane;
        hullOrigin: Vector3;
        turretOrigin: Vector3;
        gunOrigin: Vector3;
      }
  );

const unselectedColor = new Color(0x404040);
const externalModuleColor = new Color(192 / 255, 192 / 255, 192 / 255);

export function StaticArmorSceneComponent({
  name,
  thickness,
  thicknessRange,
  node,
  onPointerDown,
  ...props
}: StaticArmorSceneComponentProps) {
  const camera = useThree((state) => state.camera);
  const x = thickness / thicknessRange.value;
  const xClamped = clamp(x, 0, 1);
  let color: Color;
  let opacity: number;
  let depthWrite = true;

  switch (props.type) {
    case ArmorType.Primary:
      if (x > 1) {
        color = new Color(clamp(2 - x, 0.5, 1), 0, 0);
      } else {
        color = new Color(-((1 - x) ** 2) + 1, -(x ** 2) + 1, 0);
      }
      opacity = 1;
      break;

    case ArmorType.Spaced:
      color = new Color(
        clamp(1 - (7 / 8) * xClamped, 0, 1),
        0,
        clamp(1 - (1 / 8) * xClamped, 0, 1),
      );
      opacity = clamp(x + 1 / 2, 0, 1);
      break;

    case ArmorType.External:
      color = externalModuleColor;
      opacity = 1 / 8;
      depthWrite = false;
      break;
  }

  opacity = clamp(opacity, 0, 1);

  const surfaceMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color,
        transparent: true,
        depthWrite,
        ...(props.clip ? { clippingPlanes: [props.clip] } : {}),
        opacity: 0,
        userData: { opacity0: opacity },
      }),
    [thickness],
  );
  const outlineMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: color
          .clone()
          .multiplyScalar(props.type === ArmorType.Spaced ? 2 ** 2 : 2 ** -1),
        opacity: 0,
        transparent: true,
      }),
    [thickness],
  );

  useEffect(() => {
    function handleHighlightArmor(selectedName?: string) {
      if (selectedName === undefined) {
        // nothing selected, go back to defaults
        surfaceMaterial.opacity = opacity;
        surfaceMaterial.transparent = opacity < 1;
        surfaceMaterial.color = color;
        surfaceMaterial.depthWrite = props.type !== ArmorType.External;
        surfaceMaterial.side = FrontSide;
        outlineMaterial.visible = true;
      } else if (
        selectedName === name ||
        (name.startsWith("chassis_") && selectedName.startsWith("chassis_")) ||
        (name.startsWith("gun_") &&
          selectedName.startsWith("gun_") &&
          !name.includes("_armor_") &&
          !selectedName.includes("_armor_"))
      ) {
        // this selected, stand out!
        surfaceMaterial.opacity = 1;
        surfaceMaterial.transparent = false;
        surfaceMaterial.color = color;
        surfaceMaterial.depthWrite = true;
        surfaceMaterial.side = DoubleSide;
        outlineMaterial.visible = true;
      } else {
        // something else selected, become background
        surfaceMaterial.opacity = 1 / 4;
        surfaceMaterial.transparent = true;
        surfaceMaterial.color = unselectedColor;
        surfaceMaterial.depthWrite = props.type !== ArmorType.External;
        surfaceMaterial.side = FrontSide;
        outlineMaterial.visible = false;
      }

      surfaceMaterial.needsUpdate = true;
      invalidate();
    }

    function handleTransitionEvent(event: QuicklimeEvent<number>) {
      surfaceMaterial.opacity = surfaceMaterial.userData.opacity0 * event.data;
      outlineMaterial.opacity = event.data;

      surfaceMaterial.transparent = surfaceMaterial.opacity < 1;
      outlineMaterial.transparent = outlineMaterial.opacity < 1;
    }

    transitionEvent.on(handleTransitionEvent);

    const unsubscribes = [
      Tankopedia.on(
        (state) => state.highlightArmor?.name,
        handleHighlightArmor,
      ),
      () => transitionEvent.off(handleTransitionEvent),
    ];

    if (props.clip) {
      /**
       * hook inside an if statement?? don't panic! I assure you the clip prop
       * never mutates :)
       */

      const { clip } = props;
      const gunOrigin = unrotateDavaVector(props.gunOrigin.clone());
      const neckOrigin = unrotateDavaVector(props.hullOrigin.clone()).add(
        unrotateDavaVector(props.turretOrigin.clone()),
      );
      const barrelOrigin = neckOrigin.clone().add(gunOrigin);
      const distanceToBarrel = clip.distanceToPoint(barrelOrigin);
      const point = new Vector3();

      function handleModelTransform(
        event: QuicklimeEvent<ModelTransformEventData>,
      ) {
        clip.normal
          .set(0, 0, -1)
          .applyAxisAngle(I_HAT, event.data.pitch)
          .applyAxisAngle(J_HAT, event.data.yaw);
        clip.constant = 0;

        point
          .copy(gunOrigin)
          .applyAxisAngle(J_HAT, event.data.yaw)
          .add(clip.normal.multiplyScalar(-distanceToBarrel))
          .add(neckOrigin);
        clip.normal.normalize();
        clip.constant -= clip.distanceToPoint(point);
      }

      modelTransformEvent.on(handleModelTransform);

      unsubscribes.push(() => modelTransformEvent.off(handleModelTransform));
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [thickness]);

  return (
    <>
      {jsxTree(node, {
        mesh(_, meshProps, key) {
          return (
            <mesh
              {...meshProps}
              key={key}
              material={surfaceMaterial}
              onPointerDown={onPointerDown}
              userData={
                {
                  type: props.type,
                  variant:
                    props.type === ArmorType.External ? props.variant : "gun",
                  thickness,
                } satisfies ArmorUserData
              }
              onClick={(event) => {
                if (discardClippingPlane(event.object, event.point)) return;

                event.stopPropagation();

                const { editStatic } = Tankopedia.state;

                const bounds = new Box3().setFromObject(event.object);
                const point = bounds.min
                  .clone()
                  .add(bounds.max)
                  .divideScalar(2)
                  .setY(bounds.max.y);
                const cameraNormal = camera.position
                  .clone()
                  .sub(point)
                  .normalize();
                const surfaceNormal = event
                  .normal!.clone()
                  .applyQuaternion(
                    event.object.getWorldQuaternion(new Quaternion()),
                  );
                const angle = surfaceNormal.angleTo(cameraNormal);
                const thicknessAngled =
                  thickness / Math.sin(Math.PI / 2 - angle);

                Tankopedia.mutate((draft) => {
                  draft.highlightArmor = {
                    type: props.type,
                    name,
                    point,
                    thickness,
                    thicknessAngled,
                    angle,
                    color: `#${color.getHexString()}`,
                    editingPlate: editStatic,
                  };
                });
              }}
            />
          );
        },
      })}

      {node instanceof Mesh && (
        <lineSegments material={outlineMaterial}>
          <edgesGeometry args={[node.geometry, 45]} />
        </lineSegments>
      )}
    </>
  );
}
