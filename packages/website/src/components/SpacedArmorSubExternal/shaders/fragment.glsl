precision mediump float;

uniform float thickness;
uniform float penetration;

#include <clipping_planes_pars_fragment>

void main() {
  #include <clipping_planes_fragment>

  gl_FragColor = vec4(thickness / penetration, 0.0, 0.0, 1.0);
}