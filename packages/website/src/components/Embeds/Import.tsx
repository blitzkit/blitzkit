import {
  AlertDialog,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import { parse } from "urlon";
import { useLocale } from "../../hooks/useLocale";
import { EmbedState } from "../../stores/embedState";

export function Import() {
  const importInput = useRef<HTMLInputElement>(null);
  const [showInvalidURLPrompt, setShowInvalidURLPrompt] = useState(false);
  const [showConfirmation, setConfirmation] = useState(false);
  const { strings } = useLocale();

  return (
    <>
      <Heading>
        {strings.website.tools.embed.configuration.import.title}
      </Heading>
      <Text size="2" color="gray" mb="2">
        {strings.website.tools.embed.configuration.import.description}
      </Text>

      <AlertDialog.Root
        open={showInvalidURLPrompt}
        onOpenChange={setShowInvalidURLPrompt}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>
            {strings.website.tools.embed.configuration.import.idiot_title}
          </AlertDialog.Title>
          <AlertDialog.Description>
            {strings.website.tools.embed.configuration.import.idiot_description}
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button>
                {strings.website.tools.embed.configuration.import.idiot_button}
              </Button>
            </AlertDialog.Cancel>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <Flex gap="2" mb="6">
        <TextField.Root
          variant="classic"
          ref={importInput}
          placeholder={strings.website.tools.embed.configuration.import.hint}
          style={{ flex: 1 }}
        />
        <Tooltip content="Applied!" open={showConfirmation}>
          <Button
            onClick={() => {
              if (!importInput.current) return;

              try {
                const url = new URL(importInput.current.value);
                const state = url.searchParams.get("state");
                if (state === null) throw undefined;
                const json = parse(state);

                EmbedState.mutate((draft) => {
                  Object.assign(draft, json);
                });

                importInput.current.value = "";
                setConfirmation(true);
                setTimeout(() => setConfirmation(false), 2000);
              } catch {
                setShowInvalidURLPrompt(true);
              }
            }}
          >
            {strings.website.tools.embed.configuration.import.apply}
          </Button>
        </Tooltip>
      </Flex>
    </>
  );
}
