import {
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  NoColorSpace,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  Vector4,
  type MeshStandardMaterial,
  type Object3D,
  type Texture,
} from "three";
import type {
  MapMaterialExtras,
  MapParticleEffect,
  MapParticleLayer,
} from "./extras";

interface Particle {
  age: number;
  life: number;
  size: number;
  angle: number;
  position: Vector3;
  velocity: Vector3;
}

function sampleKeyframes(keyframes: number[][] | undefined, time: number) {
  if (!keyframes || keyframes.length === 0) return 1;
  if (time <= keyframes[0][0]) return keyframes[0][1];

  for (let index = 1; index < keyframes.length; index++) {
    const [time1, value1] = keyframes[index];

    if (time <= time1) {
      const [time0, value0] = keyframes[index - 1];

      return value0 + ((value1 - value0) * (time - time0)) / (time1 - time0);
    }
  }

  return keyframes.at(-1)![1];
}

function randomDirection(direction: Vector3, rangeDegrees: number) {
  const range = (rangeDegrees * Math.PI) / 180;
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

function createLayerMesh(texture: Texture, layer: MapParticleLayer) {
  const capacity = Math.ceil(
    (layer.number + layer.numberVariation) *
      (layer.life + layer.lifeVariation) +
      8,
  );
  const geometry = new PlaneGeometry(1, 1);
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      sprite: { value: texture },
      color: { value: new Vector4(...layer.color) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 particlePosition;
      attribute float particleSize;
      attribute float particleAlpha;
      attribute float particleAngle;
      varying vec2 vUv;
      varying float vAlpha;

      void main() {
        vUv = uv;
        vAlpha = particleAlpha;

        vec4 mvPosition = modelViewMatrix * vec4(particlePosition, 1.0);
        float c = cos(particleAngle);
        float s = sin(particleAngle);

        mvPosition.xy += vec2(
          position.x * c - position.y * s,
          position.x * s + position.y * c
        ) * particleSize;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D sprite;
      uniform vec4 color;
      varying vec2 vUv;
      varying float vAlpha;

      void main() {
        vec4 texel = texture2D(sprite, vUv);

        gl_FragColor = vec4(texel.rgb * color.rgb, texel.a * color.a * vAlpha);
      }
    `,
  });
  const attributes = {
    particlePosition: new InstancedBufferAttribute(
      new Float32Array(capacity * 3),
      3,
    ),
    particleSize: new InstancedBufferAttribute(new Float32Array(capacity), 1),
    particleAlpha: new InstancedBufferAttribute(new Float32Array(capacity), 1),
    particleAngle: new InstancedBufferAttribute(new Float32Array(capacity), 1),
  };

  for (const [name, attribute] of Object.entries(attributes)) {
    geometry.setAttribute(name, attribute);
  }

  const mesh = new InstancedMesh(geometry, material, capacity);

  mesh.frustumCulled = false;
  mesh.count = 0;
  mesh.userData.reflect = false;

  return { mesh, attributes, capacity };
}

export function createParticleSystem(scene: Object3D) {
  let root: Object3D | undefined;
  const textures = new Map<string, Texture>();

  scene.traverse((object) => {
    if (object.userData.effects) root = object;

    if (object instanceof Mesh) {
      const material = object.material as MeshStandardMaterial;
      const extras = material.userData as MapMaterialExtras | undefined;

      if (extras?.kind === "particleSprite" && extras.sprite && material.map) {
        material.map.colorSpace = NoColorSpace;
        textures.set(extras.sprite, material.map);
        object.visible = false;
      }
    }
  });

  if (!root) return { update: () => {}, dispose: () => {} };

  const simulations: (() => void)[] = [];
  const updaters: ((delta: number) => void)[] = [];

  for (const effect of root.userData.effects as MapParticleEffect[]) {
    for (const emitter of effect.emitters) {
      const origin = new Vector3(...effect.position).add(
        new Vector3(...(emitter.offset ?? [0, 0, 0])),
      );
      const direction = new Vector3(...(emitter.direction ?? [0, 0, 1]));

      if (direction.lengthSq() === 0) direction.set(0, 0, 1);

      direction.normalize();

      for (const layer of emitter.layers) {
        const texture = textures.get(layer.sprite);

        if (!texture) continue;

        const { mesh, attributes, capacity } = createLayerMesh(texture, layer);
        const particles: Particle[] = [];
        let spawnAccumulator = 0;

        root.add(mesh);
        simulations.push(() => mesh.removeFromParent());
        updaters.push((delta) => {
          spawnAccumulator +=
            delta * (layer.number + layer.numberVariation * Math.random());

          while (spawnAccumulator >= 1 && particles.length < capacity) {
            spawnAccumulator -= 1;

            const spawnDirection = randomDirection(direction, emitter.range);
            const offset = new Vector3(
              Math.random() * 2 - 1,
              Math.random() * 2 - 1,
              Math.random() * 2 - 1,
            ).multiplyScalar(emitter.radius);

            particles.push({
              age: 0,
              life: layer.life + layer.lifeVariation * Math.random(),
              size: layer.size[0] + layer.sizeVariation[0] * Math.random(),
              angle:
                ((layer.angle +
                  layer.angleVariation * (Math.random() * 2 - 1)) *
                  Math.PI) /
                180,
              position: origin.clone().add(offset),
              velocity: spawnDirection.multiplyScalar(
                layer.velocity + layer.velocityVariation * Math.random(),
              ),
            });
          }

          for (let index = particles.length - 1; index >= 0; index--) {
            const particle = particles[index];

            particle.age += delta;

            if (particle.age >= particle.life) {
              particles.splice(index, 1);
              continue;
            }

            particle.position.addScaledVector(particle.velocity, delta);
          }

          particles.forEach((particle, index) => {
            const time = particle.age / particle.life;

            attributes.particlePosition.setXYZ(
              index,
              particle.position.x,
              particle.position.y,
              particle.position.z,
            );
            attributes.particleSize.setX(
              index,
              particle.size * sampleKeyframes(layer.sizeOverLife, time),
            );
            attributes.particleAlpha.setX(
              index,
              sampleKeyframes(layer.alphaOverLife, time),
            );
            attributes.particleAngle.setX(index, particle.angle);
          });

          for (const attribute of Object.values(attributes)) {
            attribute.needsUpdate = true;
          }

          mesh.count = particles.length;
        });
      }
    }
  }

  return {
    update(delta: number) {
      for (const updater of updaters) updater(Math.min(delta, 0.1));
    },
    dispose() {
      for (const dispose of simulations) dispose();
    },
  };
}
