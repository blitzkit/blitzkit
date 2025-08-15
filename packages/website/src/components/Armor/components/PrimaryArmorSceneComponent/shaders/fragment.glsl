precision mediump float;

#define USE_FOG

#include <fog_pars_fragment>

varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochet;
uniform float normalization;
uniform vec2 resolution;
uniform bool isExplosive;
uniform bool canSplash;
uniform float damage;
uniform float explosionRadius;
uniform bool greenPenetration;
uniform bool advancedHighlighting;
uniform bool opaque;
uniform mat4 inverseProjectionMatrix;

uniform highp sampler2D spacedArmorBuffer;
uniform highp sampler2D spacedArmorDepth;

const float HALF = 0.5;
const float EXPLOSION_DAMAGE_FACTOR = 1.1;
const float RANDOMIZATION_FACTOR = 0.05;
const float GREEN_VALUE = 0.392;

float getDistance(vec2 coord, float depth) {
  vec4 clipPos = vec4(coord * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 eyePos = inverseProjectionMatrix * clipPos;
  return length(eyePos.xyz / eyePos.w);
}

vec3 getPenetrationColor(bool isThreeCalibersRule, bool couldHaveRicochet) {
  if (advancedHighlighting && couldHaveRicochet) {
    return vec3(0.0, 1.0, isThreeCalibersRule ? 1.0 : 0.0);
  }

  return vec3(0.0, 1.0, 0.0);
}

void main() {
  #include <clipping_planes_fragment>

  vec2 screenCoord = gl_FragCoord.xy / resolution;
  vec4 spacedArmorData = texture2D(spacedArmorBuffer, screenCoord);
  bool isUnderSpacedArmor = spacedArmorData.a != 0.0;

  float viewDistance = length(vViewPosition);
  float angle = acos(dot(vNormal, -vViewPosition) / viewDistance);

  bool threeCalibersRule = caliber > thickness * 3.0 || isUnderSpacedArmor;
  bool couldHaveRicochet = angle >= ricochet;
  float penetrationChance = -1.0;
  float splashChance = 0.0;
  bool didRicochet = false;

  if (!threeCalibersRule && couldHaveRicochet) {
    penetrationChance = 0.0;
    didRicochet = true;
  } else {
    float thicknessRatio = thickness > 0.0 ? caliber / thickness : 0.0;
    bool twoCalibersRule = thicknessRatio > 2.0;
    float finalNorm = twoCalibersRule ? ((1.4 * normalization * caliber) / (2.0 * thickness)) : normalization;
    float finalThickness = thickness / cos(max(0.0, angle - finalNorm));

    float remainingPen = penetration;

    if (isUnderSpacedArmor) {
      float spacedArmorThickness = spacedArmorData.r * penetration;
      remainingPen -= spacedArmorThickness;

      if (isExplosive && remainingPen > 0.0) {
        float spacedDist = getDistance(screenCoord, texture2D(spacedArmorDepth, screenCoord).r);
        float primaryDist = getDistance(screenCoord, gl_FragCoord.z);
        float distFromArmor = primaryDist - spacedDist;

        if (canSplash) {
          float finalDamage = HALF * damage * (1.0 - distFromArmor / explosionRadius) - EXPLOSION_DAMAGE_FACTOR * (finalThickness + spacedArmorThickness);
          splashChance = step(0.0, finalDamage);
          penetrationChance = 0.0;

        } else {
          remainingPen -= HALF * remainingPen * distFromArmor;
        }
      }
    }

    if (penetrationChance < 0.0) {
      remainingPen = max(0.0, remainingPen);
      float delta = finalThickness - remainingPen;
      float randomization = remainingPen * RANDOMIZATION_FACTOR;
      penetrationChance = clamp(1.0 - (delta + randomization) / (2.0 * randomization), 0.0, 1.0);

      if (canSplash) {
        float splashDamage = HALF * damage - EXPLOSION_DAMAGE_FACTOR * finalThickness;
        splashChance = step(0.0, splashDamage);
      }
    }
  }

  float alpha = opaque ? 1.0 : HALF;
  vec3 baseColor = vec3(1.0, splashChance * GREEN_VALUE, 0.0);

  if (advancedHighlighting && didRicochet) {
    baseColor = vec3(1.0, baseColor.g, 1.0);
  }

  if (greenPenetration || advancedHighlighting) {
    float falling = -penetrationChance * penetrationChance + 1.0;
    float gaining = -(penetrationChance - 1.0) * (penetrationChance - 1.0) + 1.0;
    vec3 penColor = getPenetrationColor(threeCalibersRule, couldHaveRicochet);
    gl_FragColor = vec4(falling * baseColor + gaining * penColor, alpha);
  } else {
    gl_FragColor = vec4(baseColor, (1.0 - penetrationChance) * alpha);
  }

  #include <fog_fragment>
}