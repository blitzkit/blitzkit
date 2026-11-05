precision mediump float;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);

  vViewPosition = vViewPosition4.xyz;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * vViewPosition4;
}