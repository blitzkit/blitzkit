precision mediump float;

#define USE_FOG

#include <fog_pars_fragment>

void main() {
  float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
  gl_FragColor = vec4(0.5, 0.5, 0.5, fogFactor);
  gl_FragColor.rgb = mix(fogColor, gl_FragColor.rgb, fogFactor);
}