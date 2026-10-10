import { UpdateIcon } from "@radix-ui/react-icons";
import { Button, Flex, Heading } from "@radix-ui/themes";
import { SKIN_NUMBER } from "../../../../../../constants/skinNumber";
import { api } from "../../../../../../core/blitzkit/api";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../../../../types/maybeSkeletonComponentProps";
import { SkinTracker } from "./components/SkinTracker";
import { Tracker } from "./components/Tracker";

const camouflageDefinitions = await api.camouflageDefinitions();

export function Title({ skeleton }: MaybeSkeletonComponentProps) {
  const { unwrap, strings } = useLocale();
  const modelRequested = Tankopedia.use((state) => state.modelRequested);
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const revealed = Tankopedia.use((state) => state.revealed);
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const skin = Tankopedia.use((state) => state.skin);
  const camouflage =
    skin === undefined ? undefined : camouflageDefinitions.camouflages[skin];
  const tankName = unwrap(protagonist.name!);
  const name = camouflage
    ? `${tankName} ${unwrap(camouflage.name!).replace("%(camo_num)", SKIN_NUMBER)}`
    : tankName;
  const fontSize = revealed
    ? disturbed
      ? "1.5rem"
      : "2rem"
    : `min(12vh, ${75 / name.length}vw)`;

  return (
    <Flex
      onPointerDown={(event) => {
        event.preventDefault();

        if (!modelRequested) return;

        Tankopedia.mutate((draft) => {
          draft.revealed = true;
        });
      }}
      direction="column"
      position="absolute"
      align="center"
      justify="center"
      top={revealed ? (disturbed ? "3rem" : "6rem") : "50%"}
      left="50%"
      width="100%"
      height={revealed ? fontSize : "100%"}
      style={{
        pointerEvents: revealed ? "none" : undefined,
        transitionDuration: "1s",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Heading
        style={{
          fontWeight: 900,
          userSelect: "none",
          pointerEvents: "none",
          fontSize,
          whiteSpace: "nowrap",
          opacity: revealed ? 1 : 0.5,
          letterSpacing: revealed || !revealed ? 0 : "-0.03em",
          transition: `
            letter-spacing 1.5s ${revealed ? "" : "cubic-bezier(0.81, -2, 0.68, 1)"},
            font-size 1s,
            -webkit-text-stroke 2s,
            opacity 1s
          `,
        }}
        wrap="nowrap"
      >
        {name}
      </Heading>

      {!skeleton && !revealed && modelRequested && (
        <Tracker fontSize={fontSize} />
      )}

      {!skeleton && revealed && <SkinTracker fontSize={fontSize} />}

      {!skeleton && !modelRequested && (
        <Flex
          position="absolute"
          left="50%"
          top="50%"
          width="min(100%, 16rem)"
          justify="center"
          style={{
            transform: `translate(-50%, calc(${fontSize} * 0.75 + var(--space-4) - 50%))`,
          }}
        >
          <Button
            variant="solid"
            highContrast
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.modelRequested = true;
              });
            }}
          >
            <UpdateIcon />
            {strings.website.tools.tankopedia.sandbox.load_model}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
