#include <common>
#include <logdepthbuf_pars_vertex>

precision mediump float;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  vViewPosition = mvPosition.xyz;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * mvPosition;

  #include <logdepthbuf_vertex>
}
