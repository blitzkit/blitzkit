import {
  AdditiveBlending,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  NoColorSpace,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
  type Camera,
  type MeshStandardMaterial,
  type Texture,
} from "three";
import type {
  ParticleBlending,
  ParticleEffectExtras,
  ParticleEmitterExtras,
  ParticleKeys,
  ParticleLayerExtras,
} from "./types";

// longest step simulated at once, so a stalled tab doesn't burst
const MAX_DELTA = 0.1;
// what the game plays effects at when nothing picks a level by distance
const DEFAULT_LOD = 1;
const BLENDINGS: ParticleBlending[] = ["normal", "additive", "alphaAdditive"];

const WORLD_DOWN = new Vector3(0, -1, 0);

const cameraPosition = new Vector3();
const effectPosition = new Vector3();
const drawnPosition = new Vector3();

interface Particle {
  age: number;
  life: number;
  size: number[];
  angle: Vector3;
  spin: Vector3;
  position: Vector3;
  velocity: Vector3;
}

function sample(keys: ParticleKeys | undefined, time: number) {
  if (!keys || keys.length === 0) return 1;
  if (time <= keys[0][0]) return keys[0][1];

  for (let index = 1; index < keys.length; index++) {
    const [time1, value1] = keys[index];

    if (time <= time1) {
      const [time0, value0, hold] = keys[index - 1];

      if (hold) return value0;

      return value0 + ((value1 - value0) * (time - time0)) / (time1 - time0);
    }
  }

  return keys.at(-1)![1];
}

function effectLod(distances: number[] | undefined, distance: number) {
  if (!distances) return DEFAULT_LOD;

  const index = distances.findIndex((maximum) => distance < maximum);

  return index === -1 ? distances.length : index;
}

// the range is how wide the whole cone is
function randomDirection(direction: Vector3, rangeDegrees: number) {
  const range = (rangeDegrees * Math.PI) / 180 / 2;
  const theta = Math.random() * range;
  const phi = Math.random() * Math.PI * 2;
  const axis =
    Math.abs(direction.z) < 0.99 ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0);
  const tangent = new Vector3().crossVectors(direction, axis).normalize();
  const bitangent = new Vector3().crossVectors(direction, tangent);

  return direction
    .clone()
    .multiplyScalar(Math.cos(theta))
    .addScaledVector(tangent, Math.sin(theta) * Math.cos(phi))
    .addScaledVector(bitangent, Math.sin(theta) * Math.sin(phi))
    .normalize();
}

// degrees, each axis varied either way, to radians
function randomAngles(base: number[], variation: number[]) {
  return new Vector3(
    ...base.map(
      (angle, index) =>
        ((angle + variation[index] * (Math.random() * 2 - 1)) * Math.PI) / 180,
    ),
  );
}

// circles lie across the emitter's x and y
function spawnOffset({ shape, radius, size }: ParticleEmitterExtras) {
  const angle = Math.random() * Math.PI * 2;

  switch (shape) {
    case "point":
      return new Vector3();

    case "rect":
      return new Vector3(
        ...size.map((extent) => (Math.random() - 0.5) * extent),
      );

    case "disc":
    case "circle": {
      const distance =
        shape === "disc" ? radius * Math.sqrt(Math.random()) : radius;

      return new Vector3(
        distance * Math.cos(angle),
        distance * Math.sin(angle),
        0,
      );
    }

    case "sphere":
      return new Vector3()
        .randomDirection()
        .multiplyScalar(radius * Math.cbrt(Math.random()));
  }
}

const vertexShader = /* glsl */ `
  attribute vec3 particlePosition;
  attribute vec2 particleSize;
  attribute vec4 particleColor;
  attribute vec3 particleAngle;
  uniform bool facing;
  uniform vec3 axisX;
  uniform vec3 axisY;
  uniform vec2 pivot;
  uniform bool fresnel;
  uniform float fresnelBias;
  uniform float fresnelPower;
  varying vec2 vUv;
  varying vec4 vColor;
  varying float vFresnel;

  void main() {
    vUv = uv;
    vColor = particleColor;
    vFresnel = 1.0;

    float c = cos(particleAngle.z);
    float s = sin(particleAngle.z);

    if (facing) {
      // the game turns an emitter-facing quad about its own axes like this
      vec3 sines = sin(particleAngle);
      vec3 cosines = cos(particleAngle);
      vec3 axisZ = cross(axisX, axisY);
      vec3 across =
        cosines.z * cosines.x * axisX -
        sines.z * cosines.x * axisY +
        sines.x * axisZ;
      vec3 up = -(
        (sines.z * cosines.y + sines.x * cosines.z * sines.y) * axisX +
        (cosines.z * cosines.y - sines.x * sines.y * sines.z) * axisY -
        sines.y * cosines.x * axisZ
      );
      vec2 corner = vec2(
        0.5 * (1.0 + pivot.x) - uv.x,
        uv.y - 0.5 + 0.5 * pivot.y
      ) * particleSize;
      vec4 mvPosition = modelViewMatrix * vec4(
        particlePosition + across * corner.x + up * corner.y,
        1.0
      );

      if (fresnel) {
        vec3 normal = normalize(normalMatrix * cross(across, up));
        float facingView = abs(dot(normal, normalize(-mvPosition.xyz)));

        // so quads fade out as they turn edge on
        vFresnel =
          fresnelBias + (1.0 - fresnelBias) * pow(facingView, fresnelPower);
      }

      gl_Position = projectionMatrix * mvPosition;
    } else {
      vec4 mvPosition = modelViewMatrix * vec4(particlePosition, 1.0);

      mvPosition.xy += vec2(
        position.x * c - position.y * s,
        position.x * s + position.y * c
      ) * particleSize;
      gl_Position = projectionMatrix * mvPosition;

      // a billboard always faces the camera
    }
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D sprite;
  uniform float intensity;
  uniform int blending;
  varying vec2 vUv;
  varying vec4 vColor;
  varying float vFresnel;

  void main() {
    vec4 texel = texture2D(sprite, vUv);
    vec4 color = texel * vColor;

    // plain additive ignores the particle's own alpha
    if (blending == 1) color.a = texel.a;

    gl_FragColor = vec4(color.rgb * intensity, color.a * vFresnel);
  }
`;

function createLayerMeshes(
  texture: Texture,
  layer: ParticleLayerExtras,
  capacity: number,
) {
  const attributes = {
    particlePosition: new InstancedBufferAttribute(
      new Float32Array(capacity * 3),
      3,
    ),
    particleSize: new InstancedBufferAttribute(
      new Float32Array(capacity * 2),
      2,
    ),
    particleColor: new InstancedBufferAttribute(
      new Float32Array(capacity * 4),
      4,
    ),
    particleAngle: new InstancedBufferAttribute(
      new Float32Array(capacity * 3),
      3,
    ),
  };
  const orientations = [
    ...(layer.billboard ? [undefined] : []),
    ...layer.facings,
  ];
  const meshes = orientations.map((axes) => {
    const geometry = new PlaneGeometry(1, 1);
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      blending:
        layer.blending === "normal" ? NormalBlending : AdditiveBlending,
      uniforms: {
        sprite: { value: texture },
        intensity: { value: 1 },
        blending: { value: BLENDINGS.indexOf(layer.blending) },
        facing: { value: axes !== undefined },
        axisX: { value: new Vector3(...(axes?.[0] ?? [1, 0, 0])) },
        axisY: { value: new Vector3(...(axes?.[1] ?? [0, 1, 0])) },
        pivot: { value: new Vector2(...layer.pivot) },
        fresnel: { value: layer.fresnel !== undefined },
        fresnelBias: { value: layer.fresnel?.bias ?? 0 },
        fresnelPower: { value: layer.fresnel?.power ?? 1 },
      },
      vertexShader,
      fragmentShader,
    });

    for (const [name, attribute] of Object.entries(attributes)) {
      geometry.setAttribute(name, attribute);
    }

    const mesh = new InstancedMesh(geometry, material, capacity);

    mesh.frustumCulled = false;
    mesh.count = 0;
    mesh.userData.reflect = false;
    // particles are light, not something to drag on
    mesh.raycast = () => {};

    return mesh;
  });

  return { meshes, attributes };
}

/**
 * plays the particle effects kept on nodes under `root`, each in the space of
 * its node so it follows the node around
 */
export function createParticleSystem(root: Object3D) {
  const textures = new Map<string, Texture>();
  const sources: Object3D[] = [];

  root.traverse((object) => {
    if (object.userData.particleEffect) sources.push(object);
    if (!(object instanceof Mesh)) return;

    const material = object.material as MeshStandardMaterial;
    const sprite = material.userData.particleSprite as string | undefined;

    if (sprite && material.map) {
      material.map.colorSpace = NoColorSpace;
      textures.set(sprite, material.map);
      object.visible = false;
    }
  });

  const meshes: InstancedMesh[] = [];
  const spaces: Object3D[] = [];
  const updaters: ((delta: number) => void)[] = [];
  let elapsed = 0;

  for (const source of sources) {
    const effect = source.userData.particleEffect as ParticleEffectExtras;
    let lod = DEFAULT_LOD;

    updaters.push(() => {
      source.getWorldPosition(effectPosition);
      lod = effectLod(
        effect.lodDistances,
        cameraPosition.distanceTo(effectPosition),
      );
    });

    for (const emitter of effect.emitters) {
      const space = new Object3D();
      const direction = new Vector3(...emitter.direction);

      space.position.fromArray(emitter.position);
      space.quaternion.fromArray(emitter.rotation);
      space.scale.fromArray(emitter.scale);
      source.add(space);
      spaces.push(space);

      if (direction.lengthSq() === 0) direction.set(0, 0, 1);

      direction.normalize();

      const toLocal = new Matrix4();
      const localDown = new Vector3();

      updaters.push(() => {
        space.updateWorldMatrix(true, false);
        toLocal.copy(space.matrixWorld).invert();
        localDown.copy(WORLD_DOWN).transformDirection(toLocal);
      });

      for (const layer of emitter.layers) {
        const texture = textures.get(layer.sprite);

        if (!texture) continue;

        const capacity = layer.single
          ? 1
          : Math.ceil(
              (layer.number + layer.numberVariation) *
                (layer.life + layer.lifeVariation) +
                8,
            );
        const layerMeshes = createLayerMeshes(texture, layer, capacity);
        const { attributes } = layerMeshes;
        const particles: Particle[] = [];
        // particles that don't follow the emitter live in world space
        const down = layer.inherit ? localDown : WORLD_DOWN;
        const winds = layer.forces.map(({ direction }) =>
          new Vector3(...direction).normalize(),
        );
        let spawnAccumulator = 0;

        space.add(...layerMeshes.meshes);
        meshes.push(...layerMeshes.meshes);
        updaters.push((delta) => {
          // the dead go first, so a lone particle respawns without a gap
          for (let index = particles.length - 1; index >= 0; index--) {
            const particle = particles[index];
            const { velocity } = particle;

            particle.age += delta;

            if (particle.age >= particle.life) {
              particles.splice(index, 1);
              continue;
            }

            layer.forces.forEach(({ type, strength }, forceIndex) => {
              if (type === "drag") {
                // a drag given as one value applies to every axis
                const [x, y = x, z = y] = strength;

                velocity.x *= Math.max(0, 1 - x * delta);
                velocity.y *= Math.max(0, 1 - y * delta);
                velocity.z *= Math.max(0, 1 - z * delta);
              } else {
                velocity.addScaledVector(
                  type === "gravity" ? down : winds[forceIndex],
                  strength[0] * delta,
                );
              }
            });

            particle.position.addScaledVector(velocity, delta);
            particle.angle.addScaledVector(particle.spin, delta);
          }

          if (elapsed >= effect.delay) {
            spawnAccumulator = layer.single
              ? 1
              : spawnAccumulator +
                delta * (layer.number + layer.numberVariation * Math.random());
          }

          while (spawnAccumulator >= 1 && particles.length < capacity) {
            spawnAccumulator -= 1;

            const position = spawnOffset(emitter);
            const velocity = randomDirection(
              direction,
              emitter.range,
            ).multiplyScalar(
              layer.velocity + layer.velocityVariation * Math.random(),
            );

            if (!layer.inherit) {
              velocity.add(position).applyMatrix4(space.matrixWorld);
              position.applyMatrix4(space.matrixWorld);
              velocity.sub(position);
            }

            particles.push({
              age: 0,
              life: layer.life + layer.lifeVariation * Math.random(),
              size: layer.size.map(
                (size, index) =>
                  size + layer.sizeVariation[index] * Math.random(),
              ),
              angle: randomAngles(layer.angle, layer.angleVariation),
              spin: randomAngles(layer.spin, layer.spinVariation),
              position,
              velocity,
            });
          }

          const visible = layer.lods[lod] ?? false;

          for (const mesh of layerMeshes.meshes) mesh.visible = visible;

          if (!visible) return;

          particles.forEach((particle, index) => {
            const time = particle.age / particle.life;
            const [width, height] = particle.size;
            const position = layer.inherit
              ? particle.position
              : drawnPosition.copy(particle.position).applyMatrix4(toLocal);

            attributes.particlePosition.setXYZ(
              index,
              position.x,
              position.y,
              position.z,
            );
            attributes.particleSize.setXY(
              index,
              width * sample(layer.sizeOverLife?.[0], time),
              height *
                sample(
                  layer.sizeOverLife?.[1] ?? layer.sizeOverLife?.[0],
                  time,
                ),
            );
            attributes.particleColor.setXYZW(
              index,
              layer.color[0] * sample(layer.colorOverLife?.[0], time),
              layer.color[1] * sample(layer.colorOverLife?.[1], time),
              layer.color[2] * sample(layer.colorOverLife?.[2], time),
              layer.color[3] *
                sample(layer.colorOverLife?.[3], time) *
                sample(layer.alphaOverLife, time),
            );
            attributes.particleAngle.setXYZ(
              index,
              particle.angle.x,
              particle.angle.y,
              particle.angle.z,
            );
          });

          for (const attribute of Object.values(attributes)) {
            attribute.needsUpdate = true;
          }

          for (const mesh of layerMeshes.meshes) mesh.count = particles.length;
        });
      }
    }
  }

  return {
    empty: sources.length === 0,
    update(delta: number, camera: Camera) {
      elapsed += delta;
      camera.getWorldPosition(cameraPosition);

      for (const updater of updaters) updater(Math.min(delta, MAX_DELTA));
    },
    /** scales how bright the particles are, like emissive intensity */
    setIntensity(intensity: number) {
      for (const mesh of meshes) {
        (mesh.material as ShaderMaterial).uniforms.intensity.value = intensity;
      }
    },
    dispose() {
      for (const mesh of meshes) {
        mesh.geometry.dispose();
        (mesh.material as ShaderMaterial).dispose();
      }

      for (const space of spaces) space.removeFromParent();
    },
  };
}
