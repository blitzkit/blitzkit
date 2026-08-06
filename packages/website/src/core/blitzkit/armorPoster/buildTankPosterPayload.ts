import {
  asset,
  I_HAT,
  type Armor,
  type ModelDefinitions,
  type TankDefinition,
} from "@blitzkit/core";
import { NodeIO, type Node } from "@gltf-transform/core";
import { Box3, Vector3 } from "three";
import { CAMERA_FOV_DEGREES, RENDER_HEIGHT, RENDER_WIDTH } from "./constants";

const LIGHT_GRAY = 0.82;
const DARK_GRAY = 0.08;
const CAMERA_MARGIN = 1.12;
/** Normalized direction of the live static-armor hero camera's (-8, 2, -13) offset (see Control.tsx's `inspectModeInitialPosition`) - mostly side-on, shallow elevation, "largely level with the camera". */
const CAMERA_DIRECTION = new Vector3(-8, 2, -13).normalize();
const WORLD_UP = new Vector3(0, 1, 0);

const nodeIO = new NodeIO();

export interface PosterMeshPayload {
  name: string;
  positions: number[];
  indices: number[];
  color: string;
}

export interface PosterPayload {
  meshes: PosterMeshPayload[];
  /** The camera distance this tank's own bounding box would need to fit tightly (with CAMERA_MARGIN) - callers doing a global/standardized scale should take the max of this across every tank and re-render with that as `fixedDistance`. */
  fitDistance: number;
  /** Max/min thickness across hull/turret/gun armor plates only (not wheels/tracks/barrel, which use an unrelated structural "thickness" value) - for a legend showing what the darkest/lightest plate shown actually mean in mm. */
  maxThickness: number;
  minThickness: number;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
}

export function grayHex(thickness: number, range: number): string {
  const x = range > 0 ? thickness / range : 0;
  const t = Math.min(Math.max(x, 0), 1);
  const value = Math.round((LIGHT_GRAY + (DARK_GRAY - LIGHT_GRAY) * t) * 255);
  const channel = value.toString(16).padStart(2, "0");

  return `#${channel}${channel}${channel}`;
}

function nameToArmorId(name: string): number | undefined {
  const match = name.match(/.+_armor_(-?\d+)/);
  return match ? parseInt(match[1]) : undefined;
}

function resolveArmor(armor: Armor, index: number) {
  const spaced = armor.spaced?.includes(index) ?? false;
  const thickness = index === -1 ? 0 : (armor.thickness[index] ?? 0);

  return { spaced, thickness };
}

/** Dava -> three.js Y-up correction (see ModelTankWrapper.tsx's [-PI/2, 0, 0] wrapper rotation). */
function toSceneSpace(vector: Vector3): Vector3 {
  return vector.clone().applyAxisAngle(I_HAT, -Math.PI / 2);
}

/** Dava vector -> scene-space origin offset (see correctZYTuple.ts / rotateDavaVector.ts). */
function correctOrigin(tuple: { x: number; y: number; z: number }): Vector3 {
  return new Vector3(tuple.x, tuple.y, -tuple.z).applyAxisAngle(
    I_HAT,
    Math.PI / 2,
  );
}

export async function buildTankPosterPayload(
  tank: TankDefinition,
  modelDefinitions: ModelDefinitions,
  thicknessRange: number,
  /** When given, frames every tank at the same world-space scale instead of fitting each one individually - see fitDistance on the return value. */
  fixedDistance?: number,
): Promise<PosterPayload | undefined> {
  const tankModelDefinition = modelDefinitions.models[tank.id];

  if (!tankModelDefinition) return undefined;

  const track = tank.tracks.at(-1)!;
  const turret = tank.turrets.at(-1)!;
  const gun = turret.guns.at(-1)!;

  const trackModelDefinition = tankModelDefinition.tracks[track.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition?.guns[gun.id];

  if (!trackModelDefinition || !turretModelDefinition || !gunModelDefinition) {
    return undefined;
  }

  const hullOrigin = correctOrigin(trackModelDefinition.origin!);
  const turretOrigin = correctOrigin(tankModelDefinition.turret_origin!);
  const gunOrigin = correctOrigin(turretModelDefinition.gun_origin!);
  const turretWorldOrigin = hullOrigin.clone().add(turretOrigin);
  const gunWorldOrigin = turretWorldOrigin.clone().add(gunOrigin);

  const turretPrefix = `turret_${turretModelDefinition.model_id.toString().padStart(2, "0")}`;
  const gunPrefix = `gun_${gunModelDefinition.model_id.toString().padStart(2, "0")}`;

  const [armorResponse, modelResponse] = await Promise.all([
    fetch(asset(`3d/tanks/armor/${tank.id}.glb`)),
    fetch(asset(`3d/tanks/models/${tank.id}.glb`)),
  ]);

  if (!armorResponse.ok || !modelResponse.ok) return undefined;

  const [armorDocument, modelDocument] = await Promise.all([
    nodeIO.readBinary(new Uint8Array(await armorResponse.arrayBuffer())),
    nodeIO.readBinary(new Uint8Array(await modelResponse.arrayBuffer())),
  ]);

  const meshes: PosterMeshPayload[] = [];
  const bounds = new Box3();
  const vertex = new Vector3();
  let maxThickness = -Infinity;
  let minThickness = Infinity;

  function addMeshFromNode(
    node: Node,
    name: string,
    origin: Vector3,
    thickness: number,
  ) {
    const primitive = node.getMesh()?.listPrimitives()[0];
    const positionAttribute = primitive?.getAttribute("POSITION");
    const indexAttribute = primitive?.getIndices();

    if (!positionAttribute || !indexAttribute) return;

    const rawPositions = positionAttribute.getArray()!;
    const positions: number[] = new Array(rawPositions.length);

    for (let i = 0; i < rawPositions.length; i += 3) {
      vertex
        .set(rawPositions[i], rawPositions[i + 1], rawPositions[i + 2])
        .add(origin);

      const transformed = toSceneSpace(vertex);

      positions[i] = transformed.x;
      positions[i + 1] = transformed.y;
      positions[i + 2] = transformed.z;

      bounds.expandByPoint(transformed);
    }

    meshes.push({
      name,
      positions,
      indices: Array.from(indexAttribute.getArray()!),
      color: grayHex(thickness, thicknessRange),
    });
  }

  /**
   * Unlike armor.glb (one mesh directly per named node), model.glb nests
   * the actual mesh a level or two under the named node (e.g.
   * `chassis_wheel_L_01` -> child `0000` carries the geometry) - so walk
   * descendants and add every mesh found, accumulating any local
   * translations along the way (all zero in practice, but let's not
   * assume that holds for every tank).
   */
  function addMesh(
    node: Node,
    name: string,
    origin: Vector3,
    thickness: number,
  ) {
    if (node.getMesh()) {
      addMeshFromNode(node, name, origin, thickness);
    }

    for (const child of node.listChildren()) {
      const [x, y, z] = child.getTranslation();
      addMesh(child, name, origin.clone().add(new Vector3(x, y, z)), thickness);
    }
  }

  for (const node of armorDocument.getRoot().listNodes()) {
    const name = node.getName();

    if (name.includes("state_01")) continue;

    let armor: Armor | undefined;
    let origin: Vector3 | undefined;

    if (name.startsWith("hull_")) {
      armor = tankModelDefinition.armor;
      origin = hullOrigin;
    } else if (name.startsWith(turretPrefix)) {
      armor = turretModelDefinition.armor;
      origin = turretWorldOrigin;
    } else if (name.startsWith(gunPrefix)) {
      armor = gunModelDefinition.armor;
      origin = gunWorldOrigin;
    }

    if (!armor || !origin) continue;

    const armorId = nameToArmorId(name);
    if (armorId === undefined) continue;

    const { thickness } = resolveArmor(armor, armorId);

    maxThickness = Math.max(maxThickness, thickness);
    minThickness = Math.min(minThickness, thickness);

    addMesh(node, name, origin, thickness);
  }

  // Wheels, tracks, and the gun barrel aren't "armor" - they live in the
  // regular render model, not the armor.glb - so they're not colored by a
  // thickness ratio the same way, but we still want them in the poster for
  // a complete-looking tank instead of a bare hull/turret/gun-mantlet.
  const gunNodeName = `gun_${gunModelDefinition.model_id.toString().padStart(2, "0")}`;

  for (const node of modelDocument.getRoot().listNodes()) {
    const name = node.getName();
    const isWheelOrTrack =
      name.startsWith("chassis_wheel_") || name.startsWith("chassis_track_");
    const isCurrentGun = gunModelDefinition.mask
      ? name.startsWith(gunNodeName)
      : name === gunNodeName;

    if (isWheelOrTrack) {
      addMesh(node, name, hullOrigin, trackModelDefinition.thickness);
    } else if (isCurrentGun) {
      addMesh(node, name, hullOrigin, gunModelDefinition.thickness);
    }
  }

  if (meshes.length === 0 || !Number.isFinite(maxThickness) || !Number.isFinite(minThickness)) {
    return undefined;
  }

  const center = bounds.getCenter(new Vector3());

  // Fit the camera to the bounding box's extent as actually seen from
  // CAMERA_DIRECTION, not its 3D bounding sphere - tanks are long and
  // narrow, not spherical, so sizing the shot off the sphere (the
  // worst-case diagonal in any direction) made elongated tanks render
  // much smaller than compact ones for the same apparent frame coverage.
  const forward = CAMERA_DIRECTION.clone().negate();
  const right = new Vector3().crossVectors(forward, WORLD_UP).normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();

  let maxRight = 0;
  let maxUp = 0;
  const corner = new Vector3();
  const offset = new Vector3();

  for (let i = 0; i < 8; i++) {
    corner.set(
      i & 1 ? bounds.max.x : bounds.min.x,
      i & 2 ? bounds.max.y : bounds.min.y,
      i & 4 ? bounds.max.z : bounds.min.z,
    );
    offset.subVectors(corner, center);

    maxRight = Math.max(maxRight, Math.abs(offset.dot(right)));
    maxUp = Math.max(maxUp, Math.abs(offset.dot(up)));
  }

  const verticalFov = (CAMERA_FOV_DEGREES * Math.PI) / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * (RENDER_WIDTH / RENDER_HEIGHT));
  const distanceForVertical = maxUp / Math.tan(verticalFov / 2);
  const distanceForHorizontal = maxRight / Math.tan(horizontalFov / 2);
  const fitDistance = Math.max(distanceForVertical, distanceForHorizontal) * CAMERA_MARGIN;
  const distance = fixedDistance ?? fitDistance;
  const position = center.clone().addScaledVector(CAMERA_DIRECTION, distance);

  return {
    meshes,
    fitDistance,
    maxThickness,
    minThickness,
    camera: {
      position: [position.x, position.y, position.z],
      target: [center.x, center.y, center.z],
      fov: CAMERA_FOV_DEGREES,
    },
  };
}
