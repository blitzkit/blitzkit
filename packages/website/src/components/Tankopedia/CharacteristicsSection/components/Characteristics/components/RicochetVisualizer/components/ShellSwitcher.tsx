import { asset } from '@blitzkit/core';
import { Flex, IconButton, Tooltip } from '@radix-ui/themes';
import { useLocale } from '../../../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../../../stores/duel';

export function ShellSwitcher() {
  const gun = Duel.use((state) => state.protagonist.gun);
  const shell = Duel.use((state) => state.protagonist.shell);
  const mutateDuel = Duel.useMutation();
  const { unwrap } = useLocale();

  return (
    <Flex>
      {gun.gun_type!.value.base.shells.map((thisShell, shellIndex) => {
        const selected = thisShell.id === shell.id;

        return (
          <Tooltip content={unwrap(thisShell.name)} key={thisShell.id}>
            <IconButton
              size="3"
              color={selected ? undefined : 'gray'}
              variant={selected ? 'solid' : 'soft'}
              highContrast={selected}
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: shellIndex === 0 ? '50%' : 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius:
                  shellIndex === gun.gun_type!.value.base.shells.length - 1
                    ? '50%'
                    : 0,
                marginLeft: shellIndex === 0 ? 0 : -1,
              }}
              onClick={() => {
                mutateDuel((draft) => {
                  draft.protagonist.shell = thisShell;
                });
              }}
            >
              <img
                alt={unwrap(thisShell.name)}
                width={16}
                height={16}
                src={asset(`icons/shells/${thisShell.icon}.webp`)}
              />
            </IconButton>
          </Tooltip>
        );
      })}
    </Flex>
  );
}
