import {
  MathUtils,
  Mesh,
  Raycaster,
  Vector3,
  type Intersection,
  type Object3D,
} from "three";

const SOLID_COLLISION_TYPES = new Set([3, 4, 6]);
const COLLISION_RADIUS = 1.5;
const SLIDE_ITERATIONS = 3;
const raycaster = new Raycaster();

export function collectColliders(scene: Object3D) {
  const colliders: Object3D[] = [];

  scene.traverse((object) => {
    if (!(object instanceof Mesh) || !object.visible) return;

    let current: Object3D | null = object;
    let collision: number | undefined;

    while (current) {
      if (current.userData.lod > 0) return;

      collision ??= current.userData.collision;
      current = current.parent;
    }

    if (collision !== undefined && SOLID_COLLISION_TYPES.has(collision)) {
      colliders.push(object);
    }
  });

  return colliders;
}

function isShown(hit: Intersection) {
  for (let current = hit.object.parent; current; current = current.parent) {
    if (!current.visible) return false;
  }

  return true;
}

export function blockMovement(
  colliders: Object3D[],
  from: Vector3,
  movement: Vector3,
) {
  const allowed = new Vector3();
  const origin = from.clone();
  const remaining = movement.clone();

  for (let iteration = 0; iteration < SLIDE_ITERATIONS; iteration++) {
    const distance = remaining.length();

    if (distance === 0) return allowed;

    const direction = remaining.clone().divideScalar(distance);

    raycaster.set(origin, direction);
    raycaster.far = distance + COLLISION_RADIUS;

    const hit = raycaster.intersectObjects(colliders, false).find(isShown);

    if (!hit?.face) return allowed.add(remaining);

    const normal = hit.face.normal
      .clone()
      .transformDirection(hit.object.matrixWorld);

    if (normal.dot(direction) > 0) normal.negate();

    const travel = direction
      .clone()
      .multiplyScalar(Math.max(0, hit.distance - COLLISION_RADIUS));

    allowed.add(travel);
    origin.add(travel);
    remaining.copy(direction.multiplyScalar(distance - travel.length()));
    remaining.addScaledVector(normal, -remaining.dot(normal));
  }

  return allowed;
}

export function createGroundSampler(scene: Object3D) {
  const terrain = scene.getObjectByName("terrain");
  const mesh =
    terrain instanceof Mesh
      ? terrain
      : terrain?.children.find((child) => child instanceof Mesh);

  if (!(mesh instanceof Mesh)) return null;

  const positions = mesh.geometry.getAttribute("position");
  const size = Math.round(Math.sqrt(positions.count));
  const minX = positions.getX(0);
  const minY = positions.getY(0);
  const maxX = positions.getX(size - 1);
  const maxY = positions.getY(positions.count - 1);

  return (x: number, z: number) => {
    const column = MathUtils.clamp(
      ((x - minX) / (maxX - minX)) * (size - 1),
      0,
      size - 1.001,
    );
    const row = MathUtils.clamp(
      ((-z - minY) / (maxY - minY)) * (size - 1),
      0,
      size - 1.001,
    );
    const column0 = Math.floor(column);
    const row0 = Math.floor(row);
    const fractionX = column - column0;
    const fractionY = row - row0;
    const height = (c: number, r: number) => positions.getZ(r * size + c);
    const top =
      height(column0, row0) * (1 - fractionX) +
      height(column0 + 1, row0) * fractionX;
    const bottom =
      height(column0, row0 + 1) * (1 - fractionX) +
      height(column0 + 1, row0 + 1) * fractionX;

    return top * (1 - fractionY) + bottom * fractionY;
  };
}
