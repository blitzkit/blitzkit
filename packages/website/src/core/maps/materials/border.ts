import { DoubleSide, ShaderMaterial } from "three";

export function createBorderMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    vertexColors: true,
    vertexShader: /* glsl */ `
      varying vec4 vColor;

      void main() {
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec4 vColor;

      void main() {
        gl_FragColor = vColor;
      }
    `,
  });
}
