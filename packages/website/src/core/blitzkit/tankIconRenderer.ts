/// <reference types="@webgpu/types" />
import type { Document, Material, Node } from "@gltf-transform/core";
import { blueDark, orangeDark } from "@radix-ui/colors";
import { times } from "lodash-es";
import sharp from "sharp";
import { Box3, Color, Matrix4, PerspectiveCamera, Vector3 } from "three";
import { degToRad, lerp, radToDeg } from "three/src/math/MathUtils.js";

const RENDER_WIDTH = 1600;
const RENDER_HEIGHT = 1200;
const OUTPUT_SCALE = 0.5;
const SAMPLE_COUNT = 4;
const FOV = 35;
const ROOF_PERCENTILE = 0.995;
const ROOF_MARGIN = 0.1;
const COLOR_FORMAT = "rgba8unorm-srgb";
const DEPTH_FORMAT = "depth32float";
const VIEW_DIRECTION = new Vector3(-0.75, 1.2, 0.95).normalize();

const LIGHTS_COUNT = 3;
const LIGHT_ANGLE = degToRad(15);
const THETA_OFFSET = degToRad(180 - 45);
const LIGHT_DISTANCE = 20;
const LIGHT_HEIGHT_0 = 7;
const LIGHT_HEIGHT_1 = 10;
const INTENSITY_0 = 2 ** 6;
const INTENSITY_1 = 2 ** 3;
const HEMISPHERE_INTENSITY = 2 ** 0.7;
const NON_PBR_FACTOR = 2;
const LIGHT_TARGET = new Vector3();
const SKY_COLOR = new Color(blueDark.blue12);
const GROUND_COLOR = new Color(orangeDark.orange8);
const LIGHTS = times(LIGHTS_COUNT, (index) => {
  const x = index / (LIGHTS_COUNT - 1);
  const theta = 2 * Math.PI * (index / LIGHTS_COUNT) + THETA_OFFSET;

  return {
    position: new Vector3(
      -LIGHT_DISTANCE * Math.sin(theta),
      -LIGHT_DISTANCE * Math.cos(theta),
      lerp(LIGHT_HEIGHT_0, LIGHT_HEIGHT_1, x),
    ),
    intensity: lerp(INTENSITY_0, INTENSITY_1, x),
  };
});

const SHADOW_RESOLUTION = 2 ** 11;
const SHADOW_FORMAT = "depth32float";
const SCENE_UNIFORMS_SIZE = 16 * 4 + 3 * 4 * 4 + LIGHTS_COUNT * 24 * 4;
const SHADOW_UNIFORMS_SIZE = 20 * 4;

const MATERIAL_SHADER = /* wgsl */ `
struct MaterialUniforms {
  baseColorFactor: vec4f,
  parameters: vec4f,
};

@group(1) @binding(0) var<uniform> material: MaterialUniforms;
@group(1) @binding(1) var baseColor: texture_2d<f32>;
@group(1) @binding(2) var baseSampler: sampler;
@group(1) @binding(3) var occlusion: texture_2d<f32>;
@group(1) @binding(4) var metallicRoughness: texture_2d<f32>;
@group(1) @binding(5) var normalMap: texture_2d<f32>;

struct VertexInput {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
};

fn toDepthRange(clip: vec4f) -> vec4f {
  return vec4f(clip.x, clip.y, (clip.z + clip.w) * 0.5, clip.w);
}
`;

const SHADOW_SHADER = /* wgsl */ `
${MATERIAL_SHADER}

struct Shadow {
  matrix: mat4x4f,
  clipHeight: vec4f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) uv: vec2f,
};

@group(0) @binding(0) var<uniform> shadow: Shadow;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  output.position = toDepthRange(shadow.matrix * vec4f(input.position, 1.0));
  output.world = input.position;
  output.uv = input.uv;

  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) {
  let alpha = textureSample(baseColor, baseSampler, input.uv).a *
    material.baseColorFactor.a;

  if (alpha < material.parameters.x || input.world.z > shadow.clipHeight.x) {
    discard;
  }
}
`;

const SHADER = /* wgsl */ `
${MATERIAL_SHADER}

const RECIPROCAL_PI = 0.3183098861837907;
const SHADOW_BIAS = 0.0002;
const SHADOW_TEXEL = 1.0 / ${SHADOW_RESOLUTION}.0;

struct Light {
  position: vec4f,
  direction: vec4f,
  shadow: mat4x4f,
};

struct Scene {
  viewProjection: mat4x4f,
  camera: vec4f,
  sky: vec4f,
  ground: vec4f,
  lights: array<Light, ${LIGHTS_COUNT}>,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
};

@group(0) @binding(0) var<uniform> scene: Scene;
@group(0) @binding(1) var shadowMaps: texture_depth_2d_array;
@group(0) @binding(2) var shadowSampler: sampler_comparison;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  output.position = toDepthRange(
    scene.viewProjection * vec4f(input.position, 1.0),
  );
  output.world = input.position;
  output.normal = input.normal;
  output.uv = input.uv;

  return output;
}

fn shadowFactor(index: u32, world: vec3f) -> f32 {
  let clip = toDepthRange(scene.lights[index].shadow * vec4f(world, 1.0));
  let projected = clip.xyz / clip.w;
  let uv = vec2f(projected.x * 0.5 + 0.5, 0.5 - projected.y * 0.5);

  if (clip.w <= 0.0 || any(uv < vec2f(0.0)) || any(uv > vec2f(1.0))) {
    return 1.0;
  }

  var lit = 0.0;

  for (var x = -2; x <= 2; x++) {
    for (var y = -2; y <= 2; y++) {
      lit += textureSampleCompareLevel(
        shadowMaps,
        shadowSampler,
        uv + vec2f(f32(x), f32(y)) * SHADOW_TEXEL,
        index,
        projected.z - SHADOW_BIAS,
      );
    }
  }

  return lit / 25.0;
}

fn brdfGgx(
  lightDirection: vec3f,
  viewDirection: vec3f,
  normal: vec3f,
  specularColor: vec3f,
  roughness: f32,
) -> vec3f {
  let alpha = roughness * roughness;
  let alpha2 = alpha * alpha;
  let halfDirection = normalize(lightDirection + viewDirection);
  let dotNL = saturate(dot(normal, lightDirection));
  let dotNV = saturate(dot(normal, viewDirection));
  let dotNH = saturate(dot(normal, halfDirection));
  let dotVH = saturate(dot(viewDirection, halfDirection));
  let fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);
  let f = specularColor * (1.0 - fresnel) + vec3f(fresnel);
  let gv = dotNL * sqrt(alpha2 + (1.0 - alpha2) * dotNV * dotNV);
  let gl = dotNV * sqrt(alpha2 + (1.0 - alpha2) * dotNL * dotNL);
  let v = 0.5 / max(gv + gl, 1e-6);
  let denominator = dotNH * dotNH * (alpha2 - 1.0) + 1.0;
  let d = RECIPROCAL_PI * alpha2 / (denominator * denominator);

  return f * (v * d);
}

fn rrtAndOdtFit(color: vec3f) -> vec3f {
  let a = color * (color + 0.0245786) - 0.000090537;
  let b = color * (0.983729 * color + 0.4329510) + 0.238081;

  return a / b;
}

fn acesFilmic(color: vec3f) -> vec3f {
  let inputMatrix = mat3x3f(
    vec3f(0.59719, 0.07600, 0.02840),
    vec3f(0.35458, 0.90834, 0.13383),
    vec3f(0.04823, 0.01566, 0.83777),
  );
  let outputMatrix = mat3x3f(
    vec3f(1.60475, -0.10208, -0.00327),
    vec3f(-0.53108, 1.10813, -0.07276),
    vec3f(-0.07367, -0.00605, 1.07602),
  );

  return saturate(outputMatrix * rrtAndOdtFit(inputMatrix * (color / 0.6)));
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let base = textureSample(baseColor, baseSampler, input.uv) *
    material.baseColorFactor;
  let ambientOcclusion = textureSample(occlusion, baseSampler, input.uv).r;
  let metallicRoughnessTexel =
    textureSample(metallicRoughness, baseSampler, input.uv);
  let normalTexel = textureSample(normalMap, baseSampler, input.uv).xyz * 2.0 -
    1.0;
  let surfaceNormal = normalize(input.normal);
  let q0 = dpdx(input.world);
  let q1 = -dpdy(input.world);
  let st0 = dpdx(input.uv);
  let st1 = -dpdy(input.uv);
  let dxy = max(abs(dpdx(surfaceNormal)), abs(dpdy(surfaceNormal)));

  if (base.a < material.parameters.x || input.world.z > scene.camera.w) {
    discard;
  }

  let viewDirection = normalize(scene.camera.xyz - input.world);
  let faceDirection = select(
    -1.0,
    1.0,
    dot(surfaceNormal, viewDirection) >= 0.0,
  );
  let geometryNormal = surfaceNormal * faceDirection;
  var normal = geometryNormal;

  if (material.parameters.w != 0.0) {
    let q1perp = cross(q1, geometryNormal);
    let q0perp = cross(geometryNormal, q0);
    let t = q1perp * st0.x + q0perp * st1.x;
    let b = q1perp * st0.y + q0perp * st1.y;
    let determinant = max(dot(t, t), dot(b, b));
    let scale = select(inverseSqrt(determinant), 0.0, determinant == 0.0);
    let tbn = mat3x3f(
      t * scale * faceDirection,
      b * scale * faceDirection,
      geometryNormal,
    );
    let normalScale = vec2f(material.parameters.w, -material.parameters.w);

    normal = normalize(tbn * vec3f(normalTexel.xy * normalScale, normalTexel.z));
  }

  let metalness = material.parameters.y * metallicRoughnessTexel.b;
  let geometryRoughness = max(max(dxy.x, dxy.y), dxy.z);
  let roughness = min(
    max(material.parameters.z * metallicRoughnessTexel.g, 0.0525) +
      geometryRoughness,
    1.0,
  );
  let diffuseColor = base.rgb * (1.0 - metalness);
  let specularColor = mix(vec3f(0.04), base.rgb, metalness);
  var directDiffuse = vec3f(0.0);
  var directSpecular = vec3f(0.0);

  for (var index = 0u; index < ${LIGHTS_COUNT}u; index++) {
    let light = scene.lights[index];
    let toLight = light.position.xyz - input.world;
    let distance = length(toLight);
    let lightDirection = toLight / distance;
    let spot = smoothstep(
      light.direction.w,
      1.0,
      dot(lightDirection, light.direction.xyz),
    );

    if (spot <= 0.0) {
      continue;
    }

    let irradiance = saturate(dot(normal, lightDirection)) *
      light.position.w * spot / max(distance, 0.01) *
      shadowFactor(index, input.world);

    directDiffuse += irradiance * diffuseColor * RECIPROCAL_PI;
    directSpecular += irradiance * brdfGgx(
      lightDirection,
      viewDirection,
      normal,
      specularColor,
      roughness,
    );
  }

  let hemisphere = mix(scene.ground.rgb, scene.sky.rgb, 0.5 * normal.z + 0.5);
  let indirectDiffuse = hemisphere * diffuseColor * RECIPROCAL_PI *
    ambientOcclusion;

  return vec4f(
    acesFilmic(directDiffuse + directSpecular + indirectDiffuse),
    1.0,
  );
}
`;

export interface TankIconRenderer {
  render(document: Document, include: (name: string) => boolean): Promise<Buffer>;
}

let shared: Promise<TankIconRenderer> | undefined;

export function getTankIconRenderer() {
  shared ??= createTankIconRenderer();

  return shared;
}

async function createTankIconRenderer(): Promise<TankIconRenderer> {
  const name = "bun-webgpu";
  const { setupGlobals } = await import(/* @vite-ignore */ name);

  setupGlobals();

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) throw new Error("No WebGPU adapter available");

  const device = await adapter.requestDevice();
  const module = device.createShaderModule({ code: SHADER });
  const shadowModule = device.createShaderModule({ code: SHADOW_SHADER });
  const sceneLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: "depth", viewDimension: "2d-array" },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: { type: "comparison" },
      },
    ],
  });
  const shadowLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });
  const materialLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 4, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 5, visibility: GPUShaderStage.FRAGMENT, texture: {} },
    ],
  });
  const vertexBuffers: GPUVertexBufferLayout[] = [
    {
      arrayStride: 8 * 4,
      attributes: [
        { shaderLocation: 0, offset: 0, format: "float32x3" },
        { shaderLocation: 1, offset: 12, format: "float32x3" },
        { shaderLocation: 2, offset: 24, format: "float32x2" },
      ],
    },
  ];
  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [sceneLayout, materialLayout],
    }),
    vertex: { module, entryPoint: "vertexMain", buffers: vertexBuffers },
    fragment: {
      module,
      entryPoint: "fragmentMain",
      targets: [{ format: COLOR_FORMAT }],
    },
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthStencil: {
      format: DEPTH_FORMAT,
      depthWriteEnabled: true,
      depthCompare: "less-equal",
    },
    multisample: { count: SAMPLE_COUNT },
  });
  const shadowPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [shadowLayout, materialLayout],
    }),
    vertex: {
      module: shadowModule,
      entryPoint: "vertexMain",
      buffers: vertexBuffers,
    },
    fragment: {
      module: shadowModule,
      entryPoint: "fragmentMain",
      targets: [],
    },
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthStencil: {
      format: SHADOW_FORMAT,
      depthWriteEnabled: true,
      depthCompare: "less-equal",
    },
  });
  const size = [RENDER_WIDTH, RENDER_HEIGHT];
  const multisampled = device.createTexture({
    size,
    format: COLOR_FORMAT,
    sampleCount: SAMPLE_COUNT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  const depth = device.createTexture({
    size,
    format: DEPTH_FORMAT,
    sampleCount: SAMPLE_COUNT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  const resolved = device.createTexture({
    size,
    format: COLOR_FORMAT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
  const shadowMaps = device.createTexture({
    size: [SHADOW_RESOLUTION, SHADOW_RESOLUTION, LIGHTS_COUNT],
    format: SHADOW_FORMAT,
    usage:
      GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });
  const bytesPerRow = Math.ceil((RENDER_WIDTH * 4) / 256) * 256;
  const readback = device.createBuffer({
    size: bytesPerRow * RENDER_HEIGHT,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  const sceneBuffer = device.createBuffer({
    size: SCENE_UNIFORMS_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const sceneGroup = device.createBindGroup({
    layout: sceneLayout,
    entries: [
      { binding: 0, resource: { buffer: sceneBuffer } },
      {
        binding: 1,
        resource: shadowMaps.createView({ dimension: "2d-array" }),
      },
      {
        binding: 2,
        resource: device.createSampler({
          compare: "less-equal",
          magFilter: "linear",
          minFilter: "linear",
        }),
      },
    ],
  });
  const shadows = times(LIGHTS_COUNT, (index) => {
    const buffer = device.createBuffer({
      size: SHADOW_UNIFORMS_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    return {
      buffer,
      group: device.createBindGroup({
        layout: shadowLayout,
        entries: [{ binding: 0, resource: { buffer } }],
      }),
      view: shadowMaps.createView({
        dimension: "2d",
        baseArrayLayer: index,
        arrayLayerCount: 1,
      }),
    };
  });
  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "repeat",
    addressModeV: "repeat",
  });
  const white = await createTexture(
    new Uint8Array([255, 255, 255, 255]),
    1,
    1,
    "rgba8unorm",
  );
  const camera = new PerspectiveCamera(
    FOV,
    RENDER_WIDTH / RENDER_HEIGHT,
    0.1,
    1000,
  );
  const lightCamera = new PerspectiveCamera(
    radToDeg(2 * LIGHT_ANGLE),
    1,
    0.5,
    500,
  );

  camera.up.set(0, 0, 1);
  lightCamera.up.set(0, 0, 1);

  async function createTexture(
    data: Uint8Array,
    width: number,
    height: number,
    format: GPUTextureFormat,
  ) {
    const mipLevelCount = Math.floor(Math.log2(Math.max(width, height))) + 1;
    const texture = device.createTexture({
      size: [width, height],
      format,
      mipLevelCount,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    for (let mipLevel = 0; mipLevel < mipLevelCount; mipLevel++) {
      const levelWidth = Math.max(1, width >> mipLevel);
      const levelHeight = Math.max(1, height >> mipLevel);
      const level =
        mipLevel === 0
          ? data
          : await sharp(data, { raw: { width, height, channels: 4 } })
              .resize(levelWidth, levelHeight, { fit: "fill" })
              .raw()
              .toBuffer();

      device.queue.writeTexture(
        { texture, mipLevel },
        level as GPUAllowSharedBufferSource,
        { bytesPerRow: levelWidth * 4 },
        [levelWidth, levelHeight],
      );
    }

    return texture;
  }

  function upload(data: Float32Array | Uint32Array, usage: number) {
    const buffer = device.createBuffer({
      size: Math.max(16, data.byteLength),
      usage: usage | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(buffer, 0, data as GPUAllowSharedBufferSource);

    return buffer;
  }

  async function renderNow(
    document: Document,
    include: (name: string) => boolean,
  ) {
    const disposables: (GPUBuffer | GPUTexture)[] = [];
    const materialGroups = new Map<Material | null, GPUBindGroup>();
    const draws: {
      vertices: GPUBuffer;
      indices: GPUBuffer;
      count: number;
      group: GPUBindGroup;
    }[] = [];
    const bounds = new Box3();
    const heights: number[] = [];
    const point = new Vector3();
    const hasPbr = document
      .getRoot()
      .listMaterials()
      .some((material) => material.getMetallicRoughnessTexture() !== null);
    const lightFactor = hasPbr ? 1 : NON_PBR_FACTOR;

    async function loadTexture(
      image: Uint8Array | null | undefined,
      format: GPUTextureFormat,
    ) {
      if (!image) return white;

      const { data, info } = await sharp(image)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const texture = await createTexture(data, info.width, info.height, format);

      disposables.push(texture);

      return texture;
    }

    async function materialGroup(material: Material | null) {
      if (materialGroups.has(material)) return materialGroups.get(material)!;

      const baseColor = await loadTexture(
        material?.getBaseColorTexture()?.getImage(),
        "rgba8unorm-srgb",
      );
      const occlusion = await loadTexture(
        material?.getOcclusionTexture()?.getImage(),
        "rgba8unorm",
      );
      const metallicRoughness = await loadTexture(
        material?.getMetallicRoughnessTexture()?.getImage(),
        "rgba8unorm",
      );
      const normalImage = material?.getNormalTexture()?.getImage();
      const normal = await loadTexture(normalImage, "rgba8unorm");

      const uniforms = upload(
        new Float32Array([
          ...(material?.getBaseColorFactor() ?? [1, 1, 1, 1]),
          material?.getAlphaMode() === "MASK" ? material.getAlphaCutoff() : 0,
          material?.getMetallicFactor() ?? 1,
          material?.getRoughnessFactor() ?? 1,
          normalImage ? material!.getNormalScale() : 0,
        ]),
        GPUBufferUsage.UNIFORM,
      );
      const group = device.createBindGroup({
        layout: materialLayout,
        entries: [
          { binding: 0, resource: { buffer: uniforms } },
          { binding: 1, resource: baseColor.createView() },
          { binding: 2, resource: sampler },
          { binding: 3, resource: occlusion.createView() },
          { binding: 4, resource: metallicRoughness.createView() },
          { binding: 5, resource: normal.createView() },
        ],
      });

      disposables.push(uniforms);
      materialGroups.set(material, group);

      return group;
    }

    async function addNode(node: Node) {
      if (/_skin\d*$/.test(node.getName())) return;

      const mesh = node.getMesh();

      if (mesh) {
        const matrix = new Matrix4().fromArray(node.getWorldMatrix());
        const normalMatrix = new Matrix4().copy(matrix).invert().transpose();

        for (const primitive of mesh.listPrimitives()) {
          const positions = primitive.getAttribute("POSITION")?.getArray();
          const normals = primitive.getAttribute("NORMAL")?.getArray();
          const uvs = primitive.getAttribute("TEXCOORD_0")?.getArray();
          const indices = primitive.getIndices()?.getArray();

          if (!positions || !indices) continue;

          const count = positions.length / 3;
          const vertices = new Float32Array(count * 8);
          const normal = new Vector3();

          for (let index = 0; index < count; index++) {
            point.fromArray(positions, index * 3).applyMatrix4(matrix);
            bounds.expandByPoint(point);
            heights.push(point.z);

            if (normals) {
              normal
                .fromArray(normals, index * 3)
                .applyMatrix4(normalMatrix)
                .normalize();
            } else {
              normal.set(0, 0, 1);
            }

            vertices.set(
              [
                point.x,
                point.y,
                point.z,
                normal.x,
                normal.y,
                normal.z,
                uvs?.[index * 2] ?? 0,
                uvs?.[index * 2 + 1] ?? 0,
              ],
              index * 8,
            );
          }

          const vertexBuffer = upload(vertices, GPUBufferUsage.VERTEX);
          const indexBuffer = upload(
            new Uint32Array(indices),
            GPUBufferUsage.INDEX,
          );

          disposables.push(vertexBuffer, indexBuffer);
          draws.push({
            vertices: vertexBuffer,
            indices: indexBuffer,
            count: indices.length,
            group: await materialGroup(primitive.getMaterial()),
          });
        }
      }

      for (const child of node.listChildren()) await addNode(child);
    }

    for (const node of document.getRoot().listNodes()) {
      if (include(node.getName())) await addNode(node);
    }

    if (draws.length === 0) throw new Error("Nothing to render");

    heights.sort((a, b) => a - b);

    const roof = heights[Math.floor(heights.length * ROOF_PERCENTILE)];
    const clipHeight = roof + (roof - bounds.min.z) * ROOF_MARGIN;

    bounds.max.z = Math.min(bounds.max.z, clipHeight);

    const center = bounds.getCenter(new Vector3());
    const radius = bounds.getSize(new Vector3()).length() / 2;
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(
      (index) =>
        new Vector3(
          index & 1 ? bounds.max.x : bounds.min.x,
          index & 2 ? bounds.max.y : bounds.min.y,
          index & 4 ? bounds.max.z : bounds.min.z,
        ),
    );
    let distance = radius / Math.sin(((FOV / 2) * Math.PI) / 180);

    for (let iteration = 0; iteration < 4; iteration++) {
      camera.position.copy(center).addScaledVector(VIEW_DIRECTION, distance);
      camera.near = distance / 10;
      camera.far = distance * 10;
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      const extent = Math.max(
        ...corners.flatMap((corner) => {
          const projected = corner.clone().project(camera);

          return [Math.abs(projected.x), Math.abs(projected.y)];
        }),
      );

      distance *= extent / 0.95;
    }

    camera.position.copy(center).addScaledVector(VIEW_DIRECTION, distance);
    camera.near = distance / 10;
    camera.far = distance * 10;
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const viewProjection = new Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    const lightAngle = LIGHT_ANGLE * lightFactor;

    lightCamera.fov = radToDeg(2 * lightAngle);
    lightCamera.updateProjectionMatrix();

    const lights = LIGHTS.map((light, index) => {
      lightCamera.position.copy(light.position);
      lightCamera.lookAt(LIGHT_TARGET);
      lightCamera.updateMatrixWorld();

      const matrix = new Matrix4().multiplyMatrices(
        lightCamera.projectionMatrix,
        lightCamera.matrixWorldInverse,
      );

      device.queue.writeBuffer(
        shadows[index].buffer,
        0,
        new Float32Array([...matrix.elements, clipHeight, 0, 0, 0]),
      );

      return [
        ...light.position.toArray(),
        light.intensity,
        ...light.position.clone().sub(LIGHT_TARGET).normalize().toArray(),
        Math.cos(lightAngle),
        ...matrix.elements,
      ];
    });

    device.queue.writeBuffer(
      sceneBuffer,
      0,
      new Float32Array([
        ...viewProjection.elements,
        ...camera.position.toArray(),
        clipHeight,
        ...SKY_COLOR.toArray().map(
          (channel) => channel * HEMISPHERE_INTENSITY * lightFactor,
        ),
        0,
        ...GROUND_COLOR.toArray().map(
          (channel) => channel * HEMISPHERE_INTENSITY * lightFactor,
        ),
        0,
        ...lights.flat(),
      ]),
    );

    const encoder = device.createCommandEncoder();

    for (const shadow of shadows) {
      const shadowPass = encoder.beginRenderPass({
        colorAttachments: [],
        depthStencilAttachment: {
          view: shadow.view,
          depthClearValue: 1,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        },
      });

      shadowPass.setPipeline(shadowPipeline);
      shadowPass.setBindGroup(0, shadow.group);

      for (const draw of draws) {
        shadowPass.setBindGroup(1, draw.group);
        shadowPass.setVertexBuffer(0, draw.vertices);
        shadowPass.setIndexBuffer(draw.indices, "uint32");
        shadowPass.drawIndexed(draw.count);
      }

      shadowPass.end();
    }

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: multisampled.createView(),
          resolveTarget: resolved.createView(),
          clearValue: [0, 0, 0, 0],
          loadOp: "clear",
          storeOp: "discard",
        },
      ],
      depthStencilAttachment: {
        view: depth.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "discard",
      },
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, sceneGroup);

    for (const draw of draws) {
      pass.setBindGroup(1, draw.group);
      pass.setVertexBuffer(0, draw.vertices);
      pass.setIndexBuffer(draw.indices, "uint32");
      pass.drawIndexed(draw.count);
    }

    pass.end();
    encoder.copyTextureToBuffer(
      { texture: resolved },
      { buffer: readback, bytesPerRow, rowsPerImage: RENDER_HEIGHT },
      size,
    );
    device.queue.submit([encoder.finish()]);

    await readback.mapAsync(GPUMapMode.READ);

    const padded = new Uint8Array(readback.getMappedRange().slice(0));

    readback.unmap();
    disposables.forEach((disposable) => disposable.destroy());

    const pixels = Buffer.alloc(RENDER_WIDTH * RENDER_HEIGHT * 4);

    for (let y = 0; y < RENDER_HEIGHT; y++) {
      pixels.set(
        padded.subarray(y * bytesPerRow, y * bytesPerRow + RENDER_WIDTH * 4),
        y * RENDER_WIDTH * 4,
      );
    }

    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3];

      if (alpha === 0 || alpha === 255) continue;

      pixels[index] = Math.min(255, (pixels[index] * 255) / alpha);
      pixels[index + 1] = Math.min(255, (pixels[index + 1] * 255) / alpha);
      pixels[index + 2] = Math.min(255, (pixels[index + 2] * 255) / alpha);
    }

    const trimmed = await sharp(pixels, {
      raw: { width: RENDER_WIDTH, height: RENDER_HEIGHT, channels: 4 },
    })
      .trim()
      .png()
      .toBuffer({ resolveWithObject: true });

    return sharp(trimmed.data)
      .resize(Math.round(trimmed.info.width * OUTPUT_SCALE))
      .webp({ quality: 90 })
      .toBuffer();
  }

  let queue: Promise<unknown> = Promise.resolve();

  return {
    render(document, include) {
      const result = queue.then(() => renderNow(document, include));

      queue = result.catch(() => {});

      return result;
    },
  };
}
