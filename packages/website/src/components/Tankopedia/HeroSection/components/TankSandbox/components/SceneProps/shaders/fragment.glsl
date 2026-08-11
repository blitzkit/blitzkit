varying vec3 vWorldPosition;
uniform float size;
uniform vec3 color;

void main() {
  vec3 scaled = vWorldPosition / size;
  float radius = length(scaled.xz);

  if(radius >= 1.0) {
    discard;
  }

  float a = 1.0 - radius;

  gl_FragColor = vec4(color, a);
}