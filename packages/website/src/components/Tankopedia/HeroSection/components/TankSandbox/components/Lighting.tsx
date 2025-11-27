import { HelpingSpotLight } from "../../../../../HelpingSpotLight";

export function Lighting() {
  return (
    <>
      <hemisphereLight
        position={[0, 1, 0]}
        color="#dadaff"
        groundColor="#856331"
        intensity={4}
      />

      <HelpingSpotLight
        debug
        position={[-6, 6, -10]}
        intensity={4}
        penumbra={1}
        castShadow
        color="#ffffff"
        decay={0}
      />

      <HelpingSpotLight
        debug
        position={[6, 6, -10]}
        intensity={1}
        penumbra={1}
        castShadow
        color="#ffffff"
        decay={0}
      />
    </>
  );
}
