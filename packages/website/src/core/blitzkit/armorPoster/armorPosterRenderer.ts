/// <reference types="@webgpu/types" />
import sharp from "sharp";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Matrix4,
  PerspectiveCamera,
  SRGBColorSpace,
} from "three";
import type { PosterPayload } from "./buildTankPosterPayload";
import { RENDER_HEIGHT, RENDER_WIDTH } from "./constants";

export interface ArmorPosterRenderer {
  render(payload: PosterPayload): Promise<Buffer>;
  close(): Promise<void>;
}

const COLOR_FORMAT = "rgba8unorm";
const DEPTH_FORMAT = "depth32float";
const SAMPLE_COUNT = 4;

/** position (3 floats) + rgba color (4 floats). */
const VERTEX_STRIDE = 7 * 4;

/** Edges of a mesh are outlined where adjacent faces differ by more than this. */
const EDGE_THRESHOLD_DEGREES = 45;
/** Outlines are the plate's own color, darkened, and partly transparent. */
const OUTLINE_DARKEN = 0.4;
const OUTLINE_ALPHA = 0.6;

/**
 * Flat, unlit colors only - everything the poster needs. Three.js and WebGPU
 * disagree on clip space depth (-w..w vs 0..w), so the vertex stage remaps z
 * and the CPU-side camera matrices stay exactly what three.js produces.
 */
const SHADER = /* wgsl */ `
struct Uniforms {
  viewProjection: mat4x4f,
};

struct VertexInput {
  @location(0) position: vec3f,
  @location(1) color: vec4f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  let clip = uniforms.viewProjection * vec4f(input.position, 1.0);

  output.position = vec4f(clip.x, clip.y, (clip.z + clip.w) * 0.5, clip.w);
  output.color = input.color;

  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return input.color;
}
`;

interface Geometry {
  vertices: number[];
  indices: number[];
}

/**
 * Appends one mesh to a shared vertex/index list. Every plate in a poster is
 * merged into a single draw so a render is two draw calls, not hundreds.
 */
function appendVertices(
  target: Geometry,
  positions: ArrayLike<number>,
  indices: ArrayLike<number>,
  [r, g, b]: [number, number, number],
  alpha: number,
) {
  const base = target.vertices.length / 7;

  for (let i = 0; i < positions.length; i += 3) {
    target.vertices.push(positions[i], positions[i + 1], positions[i + 2], r, g, b, alpha);
  }
  for (let i = 0; i < indices.length; i++) target.indices.push(base + indices[i]);
}

/**
 * Renders armor posters in-process with WebGPU (Dawn, via `bun-webgpu`) - no
 * browser, no WebGL, no child processes. It's a plain C ABI loaded through
 * Bun's FFI, so unlike NAN-based GL addons it works inside Bun itself.
 *
 * There is a single device and a single set of render targets, so renders
 * are queued and run one at a time; a render takes ~10-20ms against the
 * hundreds of ms the rest of the poster pipeline (GLB extraction, satori)
 * spends per tank, so there's nothing to gain from parallel devices.
 *
 * Needs a WebGPU adapter: Metal on macOS, Vulkan elsewhere. On a machine
 * without a GPU (e.g. a CI runner) a software Vulkan driver such as Mesa's
 * lavapipe (`mesa-vulkan-drivers`) has to be installed.
 */
export async function createArmorPosterRenderer(): Promise<ArmorPosterRenderer> {
  // Imported lazily so merely importing the poster route (e.g. while Vite
  // analyses it, or in `astro dev` before any poster is requested) never
  // loads the native library.
  const { setupGlobals } = await import("bun-webgpu");
  setupGlobals();

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error(
      "No WebGPU adapter available for armor posters - needs Metal (macOS) or a Vulkan driver (Linux; on GPU-less machines install a software one, e.g. mesa-vulkan-drivers)",
    );
  }

  const device = await adapter.requestDevice();
  const module = device.createShaderModule({ code: SHADER });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } },
    ],
  });
  const layout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const vertex: GPUVertexState = {
    module,
    entryPoint: "vertexMain",
    buffers: [
      {
        arrayStride: VERTEX_STRIDE,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32x4" },
        ],
      },
    ],
  };

  const trianglePipeline = device.createRenderPipeline({
    layout,
    vertex,
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

  const linePipeline = device.createRenderPipeline({
    layout,
    vertex,
    fragment: {
      module,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: COLOR_FORMAT,
          blend: {
            color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha" },
            alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
          },
        },
      ],
    },
    primitive: { topology: "line-list" },
    depthStencil: {
      format: DEPTH_FORMAT,
      depthWriteEnabled: false,
      depthCompare: "less-equal",
    },
    multisample: { count: SAMPLE_COUNT },
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

  // Texture -> buffer copies require each row to start on a 256 byte boundary.
  const bytesPerRow = Math.ceil((RENDER_WIDTH * 4) / 256) * 256;
  const readback = device.createBuffer({
    size: bytesPerRow * RENDER_HEIGHT,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  const uniformBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  const camera = new PerspectiveCamera(30, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 1000);

  function upload(data: Float32Array | Uint32Array, usage: number) {
    const buffer = device.createBuffer({
      size: Math.max(16, data.byteLength),
      usage: usage | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, data as GPUAllowSharedBufferSource);
    return buffer;
  }

  async function renderNow(payload: PosterPayload): Promise<Buffer> {
    const triangles: Geometry = { vertices: [], indices: [] };
    const lines: Geometry = { vertices: [], indices: [] };
    const linear = { r: 0, g: 0, b: 0 };

    for (const mesh of payload.meshes) {
      const color = new Color(mesh.color);
      color.getRGB(linear, SRGBColorSpace);
      appendVertices(
        triangles,
        mesh.positions,
        mesh.indices,
        [linear.r, linear.g, linear.b],
        1,
      );

      const geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(mesh.positions), 3),
      );
      geometry.setIndex(mesh.indices);

      const edges = new EdgesGeometry(geometry, EDGE_THRESHOLD_DEGREES);
      const edgePositions = edges.getAttribute("position");

      // Darken in three.js' working (linear) space, then encode to sRGB like
      // the framebuffer would, so outlines match the plate color's hue.
      color.multiplyScalar(OUTLINE_DARKEN).getRGB(linear, SRGBColorSpace);
      appendVertices(
        lines,
        edgePositions.array,
        Array.from({ length: edgePositions.count }, (_, i) => i),
        [linear.r, linear.g, linear.b],
        OUTLINE_ALPHA,
      );

      geometry.dispose();
      edges.dispose();
    }

    camera.fov = payload.camera.fov;
    camera.position.set(...payload.camera.position);
    camera.lookAt(...payload.camera.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const viewProjection = new Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      new Float32Array(viewProjection.elements),
    );

    const triangleVertices = upload(new Float32Array(triangles.vertices), GPUBufferUsage.VERTEX);
    const triangleIndices = upload(new Uint32Array(triangles.indices), GPUBufferUsage.INDEX);
    const lineVertices = upload(new Float32Array(lines.vertices), GPUBufferUsage.VERTEX);
    const lineIndices = upload(new Uint32Array(lines.indices), GPUBufferUsage.INDEX);

    const encoder = device.createCommandEncoder();
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

    pass.setBindGroup(0, bindGroup);

    pass.setPipeline(trianglePipeline);
    pass.setVertexBuffer(0, triangleVertices);
    pass.setIndexBuffer(triangleIndices, "uint32");
    pass.drawIndexed(triangles.indices.length);

    if (lines.indices.length > 0) {
      pass.setPipeline(linePipeline);
      pass.setVertexBuffer(0, lineVertices);
      pass.setIndexBuffer(lineIndices, "uint32");
      pass.drawIndexed(lines.indices.length);
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

    triangleVertices.destroy();
    triangleIndices.destroy();
    lineVertices.destroy();
    lineIndices.destroy();

    // Drop the row padding. Unlike WebGL, WebGPU's origin is top-left, so no
    // vertical flip is needed.
    const pixels = Buffer.alloc(RENDER_WIDTH * RENDER_HEIGHT * 4);
    for (let y = 0; y < RENDER_HEIGHT; y++) {
      pixels.set(
        padded.subarray(y * bytesPerRow, y * bytesPerRow + RENDER_WIDTH * 4),
        y * RENDER_WIDTH * 4,
      );
    }

    return sharp(pixels, {
      raw: { width: RENDER_WIDTH, height: RENDER_HEIGHT, channels: 4 },
    })
      .png()
      .toBuffer();
  }

  /**
   * Renders share one set of targets, so each waits for the previous one.
   * A failed render must not poison the queue for the ones behind it.
   */
  let queue: Promise<unknown> = Promise.resolve();

  return {
    render(payload) {
      const result = queue.then(() => renderNow(payload));
      queue = result.catch(() => {});

      return result;
    },

    async close() {
      await queue;

      multisampled.destroy();
      depth.destroy();
      resolved.destroy();
      readback.destroy();
      uniformBuffer.destroy();
      device.destroy();
    },
  };
}
