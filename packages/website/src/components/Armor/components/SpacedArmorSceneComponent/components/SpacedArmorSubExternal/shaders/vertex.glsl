precision mediump float;

#include <common>
#include <logdepthbuf_pars_vertex>

#include <clipping_planes_pars_vertex>

void main() {
  #include <begin_vertex>
  #include <project_vertex>
  #include <clipping_planes_vertex>
  #include <logdepthbuf_vertex>
}