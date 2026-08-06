import {
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import type { PosterPayload } from "./buildTankPosterPayload";
import { RENDER_HEIGHT, RENDER_WIDTH } from "./constants";

const canvas = document.createElement("canvas");
canvas.width = RENDER_WIDTH;
canvas.height = RENDER_HEIGHT;
document.body.appendChild(canvas);

const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT, false);
renderer.setClearColor(0x000000, 0);

const camera = new PerspectiveCamera(30, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 1000);

(window as unknown as { renderArmorPoster: typeof renderArmorPoster }).renderArmorPoster =
  renderArmorPoster;

/**
 * Every render builds fresh BufferGeometry/Material instances (payloads
 * differ per tank, nothing to reuse) and three.js does NOT free the
 * underlying WebGL resources (GPU buffers, compiled shader programs) just
 * because the JS wrapper becomes unreachable - `.dispose()` must be called
 * explicitly, or they leak for the life of the page. Across ~700+ tanks x
 * ~30-60 meshes each, that leak compounds fast, especially under
 * SwiftShader software rendering where "GPU" memory is just system RAM.
 */
function disposeScene(scene: Scene): void {
  scene.traverse((object) => {
    if (object instanceof Mesh || object instanceof LineSegments) {
      object.geometry.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
}

function renderArmorPoster(payload: PosterPayload): string {
  const scene = new Scene();

  for (const meshPayload of payload.meshes) {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(meshPayload.positions), 3),
    );
    geometry.setIndex(meshPayload.indices);

    const color = new Color(meshPayload.color);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color }));
    scene.add(mesh);

    const outline = new LineSegments(
      new EdgesGeometry(geometry, 45),
      new LineBasicMaterial({
        color: color.clone().multiplyScalar(0.4),
        transparent: true,
        opacity: 0.6,
      }),
    );
    scene.add(outline);
  }

  camera.aspect = RENDER_WIDTH / RENDER_HEIGHT;
  camera.fov = payload.camera.fov;
  camera.position.set(...payload.camera.position);
  camera.lookAt(...payload.camera.target);
  camera.updateProjectionMatrix();

  renderer.clear();
  renderer.render(scene, camera);

  const dataUrl = canvas.toDataURL("image/png");

  disposeScene(scene);

  return dataUrl;
}
