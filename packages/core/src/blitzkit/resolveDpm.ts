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
    dps =
      (alpha * gun.gun_type!.value.shell_count) /
      (gun.gun_type!.value.clip_reload * reloadCoefficient +
        (gun.gun_type!.value.shell_count - 1) *
          gun.gun_type!.value.intra_clip *
          intraClipCoefficient);
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
