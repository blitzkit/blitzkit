import { ExternalLinkIcon, LoopIcon, TrashIcon } from '@radix-ui/react-icons';
import { Dialog, Flex, IconButton } from '@radix-ui/themes';
import { useState } from 'react';
import { awaitableProvisionDefinitions } from '../../core/awaitables/provisionDefinitions';
import { tankToCompareMember } from '../../core/blitzkit/tankToCompareMember';
import { useLocale } from '../../hooks/useLocale';
import { CompareEphemeral } from '../../stores/compareEphemeral';
import { LinkI18n } from '../LinkI18n';
import { TankSearch } from '../TankSearch';

interface TankControlProps {
  index: number;
  slug: string;
}

const provisionDefinitions = await awaitableProvisionDefinitions;

export function TankControl({ index, slug }: TankControlProps) {
  const { locale } = useLocale();
  const [switchTankDialogOpen, setSwitchTankDialogOpen] = useState(false);
  const mutateCompareEphemeral = CompareEphemeral.useMutation();

  return (
    <Flex gap="3" justify="center" style={{ width: '100%' }}>
      <IconButton
        variant="ghost"
        onClick={() => {
          mutateCompareEphemeral((draft) => {
            draft.members.splice(index, 1);
            draft.sorting = undefined;
          });
        }}
      >
        <TrashIcon />
      </IconButton>

      <Dialog.Root
        open={switchTankDialogOpen}
        onOpenChange={setSwitchTankDialogOpen}
      >
        <Dialog.Trigger>
          <IconButton variant="ghost">
            <LoopIcon />
          </IconButton>
        </Dialog.Trigger>

        <Dialog.Content>
          <Dialog.Title align="center">Switch tanks</Dialog.Title>

          <Flex gap="4" direction="column">
            <Flex
              direction="column"
              gap="4"
              style={{ flex: 1 }}
              justify="center"
            >
              <TankSearch
                compact
                onSelect={(tank) => {
                  mutateCompareEphemeral((draft) => {
                    draft.members[index] = tankToCompareMember(
                      tank,
                      provisionDefinitions,
                    );
                    draft.sorting = undefined;
                  });
                  setSwitchTankDialogOpen(false);
                }}
              />
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <LinkI18n locale={locale} href={`/tanks/${slug}`} target="_blank">
        <IconButton variant="ghost">
          <ExternalLinkIcon />
        </IconButton>
      </LinkI18n>
    </Flex>
  );
}
