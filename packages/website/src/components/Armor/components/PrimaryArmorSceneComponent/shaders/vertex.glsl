precision mediump float;

#define USE_FOG

#include <fog_pars_vertex>

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  vViewPosition = mvPosition.xyz;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
