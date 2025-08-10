import { Canvas } from '@react-three/fiber';
import { awaitableModelDefinitions } from '../../../../../../../../core/awaitables/modelDefinitions';
import { useModel } from '../../../../../../../../hooks/useModel';
import { Duel } from '../../../../../../../../stores/duel';

const modelDefinitions = await awaitableModelDefinitions;

export function FlexibilityCanvas() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const turret = Duel.use((state) => state.protagonist.turret);

  const tankModel = modelDefinitions.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];

  const { gltf } = useModel(tank.id);

  const zoom = 60;
  const originY = tankModel.turret_origin.z + turretModel.gun_origin.z + 1.5;
  const originZ = tankModel.turret_origin.y + turretModel.gun_origin.y;

  console.log(originY, originZ);

  return (
    <Canvas
      frameloop="demand"
      orthographic
      camera={{
        zoom,
        position: [10, originZ, -originY],
        rotation: [0, Math.PI / 2, 0],
      }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[1, 1, 1]} intensity={8} />

      {/* <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </mesh> */}

      <group rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={gltf.scene} />
      </group>
    </Canvas>
  );
}
