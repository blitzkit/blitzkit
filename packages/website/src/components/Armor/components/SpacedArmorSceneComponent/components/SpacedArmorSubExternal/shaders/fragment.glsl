precision mediump float;

#include <common>
#include <clipping_planes_pars_fragment>
#include <logdepthbuf_pars_fragment>

uniform float thickness;
uniform float penetration;

void main() {
  #include <clipping_planes_fragment>

  gl_FragColor = vec4(thickness / penetration, 0.0, 0.0, 1.0);

  #include <logdepthbuf_fragment>
}
