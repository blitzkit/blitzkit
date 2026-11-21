import { useRef, useState } from "react";
import { parse } from "urlon";
import { useStrings } from "../../../hooks/useStrings";
import { EmbedState } from "../../../stores/embedState";
import { AlertDialog } from "../../AlertDialog";
import { Button } from "../../Button";
import { Heading } from "../../Heading";
import { Text } from "../../Text";
import { TextField } from "../../TextField";
import { Tooltip } from "../../Tooltip";
import styles from "./index.module.css";

export function Import() {
  const importInput = useRef<HTMLInputElement>(null);
  const [showInvalidURLPrompt, setShowInvalidURLPrompt] = useState(false);
  const [showConfirmation, setConfirmation] = useState(false);
  const strings = useStrings();

  return (
    <>
      <Heading size="3" weight="bold">
        {strings.embed.configuration.import.title}
      </Heading>
      <Text size="minor" lowContrast className={styles.description}>
        {strings.embed.configuration.import.description}
      </Text>

      <AlertDialog.Root
        open={showInvalidURLPrompt}
        onOpenChange={setShowInvalidURLPrompt}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <AlertDialog.Title>
              {strings.embed.configuration.import.idiot_title}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {strings.embed.configuration.import.idiot_description}
            </AlertDialog.Description>

            <AlertDialog.Actions>
              <AlertDialog.Cancel asChild>
                <Button>
                  {strings.embed.configuration.import.idiot_button}
                </Button>
              </AlertDialog.Cancel>
            </AlertDialog.Actions>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <div className={styles.row}>
        <TextField
          ref={importInput}
          placeholder={strings.embed.configuration.import.hint}
          className={styles.field}
        />
        <Tooltip
          tooltip={strings.embed.configuration.import.applied}
          open={showConfirmation}
        >
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
            {strings.embed.configuration.import.apply}
          </Button>
        </Tooltip>
      </div>
    </>
  );
}
