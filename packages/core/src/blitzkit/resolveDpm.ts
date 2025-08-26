import {
  GunDefinition,
  GunDefinitionAutoReloader,
  ShellDefinition,
} from '../protos';

export function resolveDpm(
  gun: GunDefinition,
  shell: ShellDefinition,
  damageCoefficient = 1,
  reloadCoefficient = 1,
  intraClipCoefficient = 1,
) {
  const alpha = shell.armor_damage * damageCoefficient;
  let dps: number;

  if (gun.gun_type!.$case === 'regular') {
    dps = alpha / (reloadCoefficient * gun.gun_type!.value.reload);
  } else if (gun.gun_type!.$case === 'auto_loader') {
    const damage = alpha * gun.gun_type!.value.shell_count;
    let time = gun.gun_type!.value.clip_reload * reloadCoefficient;

    if (gun.burst) {
      time +=
        (gun.gun_type!.value.shell_count / gun.burst.count - 1) *
        gun.gun_type!.value.intra_clip *
        intraClipCoefficient;

      time +=
        (gun.gun_type!.value.shell_count / gun.burst.count) *
        (gun.burst.count - 1) *
        gun.burst.interval;
    } else {
      time +=
        (gun.gun_type!.value.shell_count - 1) *
        gun.gun_type!.value.intra_clip *
        intraClipCoefficient;
    }

    dps = damage / time;
  } else {
    const mostOptimalShell = gun.gun_type!.value.shell_reloads.reduce<null | {
      index: number;
      reload: number;
    }>((current, reloadRaw, index) => {
      const reload =
        reloadRaw * reloadCoefficient +
        (index > 0
          ? (gun.gun_type!.value as GunDefinitionAutoReloader).intra_clip *
            intraClipCoefficient
          : 0);

      if (current === null || reload < current.reload) {
        return { index, reload };
      }
      return current;
    }, null)!;

    dps = alpha / mostOptimalShell?.reload;
  }

  return dps * 60;
}
