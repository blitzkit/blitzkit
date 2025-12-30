import { availableProvisions } from "@blitzkit/core";
import { Button, Flex, Heading } from "@radix-ui/themes";
import { awaitableProvisionDefinitions } from "../../../../core/awaitables/provisionDefinitions";
import { useLocale } from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { ProvisionsManager } from "../../../ProvisionsManager";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

const provisionDefinitions = await awaitableProvisionDefinitions;

export function Provisions() {
  const { tank, gun } = Duel.use((state) => state.protagonist);
  const provisions = Duel.use((state) => state.protagonist.provisions);
  const provisionsList = availableProvisions(tank, gun, provisionDefinitions);
  const { strings } = useLocale();

  // FOR PROVISION LOGGING PURPOSES
  // 
  // console.log('ALL PROVISIONS:', Object.entries(provisionDefinitions.provisions).map(([id, p]) => ({
  //   id: Number(id),
  //   name: p.name,
  //   crew: p.crew,
  //   hasCrewBonus: !!p.crew
  // })));

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
            Duel.mutate((draft) => {
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
          Duel.mutate((draft) => {
            draft.protagonist.provisions = provisions;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
