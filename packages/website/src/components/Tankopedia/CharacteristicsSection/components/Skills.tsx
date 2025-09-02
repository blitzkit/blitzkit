import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Popover,
  Text,
} from "@radix-ui/themes";
import { useLocale } from "../../../../hooks/useLocale";
import { Tankopedia } from "../../../../stores/tankopedia";
import { CrewSkillManager } from "../../../CrewSkillManager";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

export function Skills() {
  const skillLevels = Tankopedia.use((state) => state.skills);
  const { strings } = useLocale();

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Flex gap="2" align="center">
          <Heading size="4">
            {strings.website.tools.tankopedia.configuration.skills.title}
          </Heading>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="ghost">
                <InfoCircledIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content>
              <Flex direction="column" gap="2">
                <Text>
                  {strings.website.tools.tankopedia.configuration.skills.info}
                </Text>
              </Flex>
            </Popover.Content>
          </Popover.Root>
        </Flex>

        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            Tankopedia.mutate((draft) => {
              Object.keys(draft.skills).forEach((skill) => {
                draft.skills[skill] = 0;
              });
            });
          }}
        >
          {strings.website.tools.tankopedia.configuration.skills.clear}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            Tankopedia.mutate((draft) => {
              Object.keys(draft.skills).forEach((skill) => {
                draft.skills[skill] = 7;
              });
            });
          }}
        >
          {strings.website.tools.tankopedia.configuration.skills.maximize}
        </Button>
      </Flex>

      <CrewSkillManager
        skillLevels={skillLevels}
        onChange={(skills) => {
          Tankopedia.mutate((draft) => {
            draft.skills = skills;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
