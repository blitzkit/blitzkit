const SIZE = 2 ** 6;

export function SceneProps() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={-1}>
      <planeGeometry args={[SIZE, SIZE]} />
      <meshStandardMaterial
        transparent
        opacity={0.5}
        color="black"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
