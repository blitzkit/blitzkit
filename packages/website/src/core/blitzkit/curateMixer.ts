import { api } from "../../blitzkit/api";

const tankDefinitions = await api.tanks();
const modelDefinitions = await api.models();

const tanks = Object.values(tankDefinitions.tanks).filter((tank) => {
  const tankModel = modelDefinitions.models[tank.id];
  const turret = tank.turrets.at(-1)!;
  const turretModel = tankModel.turrets[turret.id];

  return !turretModel.yaw;
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
