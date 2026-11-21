precision mediump float;

varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochet;
uniform float normalization;

void main() {
  float angle = acos(dot(vNormal, -vViewPosition) / length(vViewPosition));

  bool threeCalibersRule = caliber > thickness * 3.0;
  if (!threeCalibersRule && angle >= ricochet) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    return;
  }

  bool twoCalibersRule = caliber > thickness * 2.0 && thickness > 0.0;
  float finalNormalization = twoCalibersRule ? ((1.4 * normalization * caliber) / (2.0 * thickness)) : normalization;
  float finalThickness = thickness / cos(max(0.0, angle - finalNormalization));

  gl_FragColor = vec4(finalThickness / penetration, 0.0, 0.0, 1.0);
}