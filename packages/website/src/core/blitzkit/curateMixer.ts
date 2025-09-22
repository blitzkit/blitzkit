import { awaitableModelDefinitions } from "../awaitables/modelDefinitions";
import { awaitableTankDefinitions } from "../awaitables/tankDefinitions";

const tankDefinitions = await awaitableTankDefinitions;
const modelDefinitions = await awaitableModelDefinitions;
const tanks = Object.values(tankDefinitions.tanks).filter((tank) => {
  const tankModel = modelDefinitions.models[tank.id];
  const turret = tank.turrets.at(-1)!;
  const turretModel = tankModel.turrets[turret.id];

  return tank.tier >= 10 && !turretModel.yaw;
});

export function curateMixer() {
  const hull = tanks[Math.floor(Math.random() * tanks.length)];
  const turretTank = tanks[Math.floor(Math.random() * tanks.length)];
  const turret =
    turretTank.turrets[Math.floor(Math.random() * turretTank.turrets.length)];
  const gunTank = tanks[Math.floor(Math.random() * tanks.length)];
  const gunTurret =
    gunTank.turrets[Math.floor(Math.random() * gunTank.turrets.length)];
  const gun = gunTurret.guns[Math.floor(Math.random() * gunTurret.guns.length)];

  return {
    hull: hull,
    turret: { tank: turretTank, turret: turret },
    gun: {
      tank: gunTank,
      turret: gunTurret,
      gun: gun,
    },
  };
}
