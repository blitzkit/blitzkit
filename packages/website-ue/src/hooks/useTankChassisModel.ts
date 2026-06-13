import { Tankopedia } from "../stores/tankopedia";
import { useProtagonist } from "./useProtagonist";
import { useTankModel } from "./useTankModel";

export function useTankChassisModel() {
  const tank = useProtagonist();
  const scene = useTankModel(`/models/tanks/${tank.id}/chassis.glb`);
  const isChassisDamaged = Tankopedia.use(
    (state) => state.protagonist.status.chassis_damaged,
  );

  // for (const child of scene.children) {
  //   if (child.name.endsWith("TrackCrashed")) {
  //     child.visible = isChassisDamaged;
  //   }

  //   if (child.name.startsWith("Track")) {
  //     child.visible = !isChassisDamaged;
  //   }
  // }

  console.log(scene);

  return scene;
}
