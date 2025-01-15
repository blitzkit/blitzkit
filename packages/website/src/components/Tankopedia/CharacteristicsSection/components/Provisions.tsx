import { availableProvisions } from '@blitzkit/core';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { awaitableProvisionDefinitions } from '../../../../core/awaitables/provisionDefinitions';
import { useLocale } from '../../../../hooks/useLocale';
import { Duel } from '../../../../stores/duel';
import { ProvisionsManager } from '../../../ProvisionsManager';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

const provisionDefinitions = await awaitableProvisionDefinitions;

export function Provisions() {
  const mutateDuel = Duel.useMutation();
  const { tank, gun } = Duel.use((state) => state.protagonist);
  const provisions = Duel.use((state) => state.protagonist.provisions);
  const provisionsList = availableProvisions(tank, gun, provisionDefinitions);
  const { strings } = useLocale();

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">
          {strings.website.tools.tankopedia.configuration.provisions.title}
        </Heading>
        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            mutateDuel((draft) => {
              draft.protagonist.provisions = [];
            });
          }}
        >
          {strings.website.tools.tankopedia.configuration.provisions.clear}
        </Button>
      </Flex>

      <ProvisionsManager
        provisions={provisionsList.map((provision) => provision.id)}
        selected={provisions}
        disabled={tank.max_provisions === provisions.length}
        onChange={(provisions) => {
          mutateDuel((draft) => {
            draft.protagonist.provisions = provisions;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
