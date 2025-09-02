import type { BlitzkitResponse, StarsInt } from "@blitzkit/core";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  Dialog,
  Flex,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { useState } from "react";
import { useLocale } from "../../../../../../hooks/useLocale";
import { App } from "../../../../../../stores/app";
import { Duel } from "../../../../../../stores/duel";
import { Stars } from "../../Stars";

export function VoteCaster() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const [easiness, setEasiness] = useState<StarsInt | null>(null);
  const [firepower, setFirepower] = useState<StarsInt | null>(null);
  const [maneuverability, setManeuverability] = useState<StarsInt | null>(null);
  const [survivability, setSurvivability] = useState<StarsInt | null>(null);
  // true = vote successful, false = vote failed, null = hide alert
  const [postVote, setPostVote] = useState<boolean | null>(null);
  // true = open, false = closed, null = casting
  const [showDialogue, setShowDialogue] = useState<boolean | null>(false);
  const { unwrap } = useLocale();

  return (
    <>
      <Dialog.Root open={showDialogue !== false} onOpenChange={setShowDialogue}>
        <Dialog.Trigger>
          <Button variant="surface">
            <PaperPlaneIcon /> Vote
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="23rem">
          <Dialog.Title>Voting for {unwrap(tank.name)}</Dialog.Title>

          <Flex direction="column" mt="4">
            <Flex align="center" justify="between">
              <Text>
                Easiness{" "}
                <Text color="gray" size="2">
                  {easiness === null ? "(empty)" : `(${easiness})`}
                </Text>
              </Text>
              <Stars stars={easiness} size="5" onCast={setEasiness} />
            </Flex>
            <Flex align="center" justify="between">
              <Text>
                Firepower{" "}
                <Text color="gray" size="2">
                  {firepower === null ? "(empty)" : `(${firepower})`}
                </Text>
              </Text>
              <Stars stars={firepower} size="5" onCast={setFirepower} />
            </Flex>
            <Flex align="center" justify="between">
              <Text>
                Maneuverability{" "}
                <Text color="gray" size="2">
                  {maneuverability === null
                    ? "(empty)"
                    : `(${maneuverability})`}
                </Text>
              </Text>
              <Stars
                stars={maneuverability}
                size="5"
                onCast={setManeuverability}
              />
            </Flex>
            <Flex align="center" justify="between">
              <Text>
                Survivability{" "}
                <Text color="gray" size="2">
                  {survivability === null ? "(empty)" : `(${survivability})`}
                </Text>
              </Text>
              <Stars stars={survivability} size="5" onCast={setSurvivability} />
            </Flex>
          </Flex>

          <Flex justify="end" mt="4" gap="2">
            <Dialog.Close>
              <Button variant="outline" color="red">
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              disabled={
                showDialogue === null ||
                (easiness === null &&
                  firepower === null &&
                  maneuverability === null &&
                  survivability === null)
              }
              onClick={() => {
                const { wargaming } = App.state.logins;

                if (!wargaming) {
                  return setShowDialogue(false);
                }

                setShowDialogue(null);

                fetch(
                  `/api/tank-voting/${tank.id}/cast?${
                    easiness === null ? "" : `easiness=${easiness}&`
                  }${firepower === null ? "" : `firepower=${firepower}&`}${
                    maneuverability === null
                      ? ""
                      : `maneuverability=${maneuverability}&`
                  }${
                    survivability === null
                      ? ""
                      : `survivability=${survivability}&`
                  }player=${wargaming.id}&token=${wargaming.token}`
                )
                  .then(
                    (response) => response.json() as Promise<BlitzkitResponse>
                  )
                  .then((json) => {
                    setShowDialogue(false);
                    setPostVote(json.status === "ok");

                    if (json.status === "error") {
                      console.error("vote failed", json);
                    }
                  });
              }}
            >
              {showDialogue === null ? <Spinner /> : <PaperPlaneIcon />} Vote
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root
        open={postVote !== null}
        onOpenChange={() => setPostVote(null)}
      >
        {postVote === true && (
          <AlertDialog.Content maxWidth="20rem">
            <AlertDialog.Title>Vote casted</AlertDialog.Title>
            <AlertDialog.Description>
              It may take a few minutes for it to show up.
            </AlertDialog.Description>

            <Flex justify="end" mt="4">
              <AlertDialog.Cancel>
                <Button>Okay</Button>
              </AlertDialog.Cancel>
            </Flex>
          </AlertDialog.Content>
        )}

        {postVote === false && (
          <AlertDialog.Content maxWidth="20rem">
            <AlertDialog.Title>Voting failed</AlertDialog.Title>
            <AlertDialog.Description>
              So sorry about this! If you're a nerd, feel free to check out the
              console.
            </AlertDialog.Description>

            <Flex justify="end" mt="4">
              <AlertDialog.Cancel>
                <Button>Gotcha</Button>
              </AlertDialog.Cancel>
            </Flex>
          </AlertDialog.Content>
        )}
      </AlertDialog.Root>
    </>
  );
}
