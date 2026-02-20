import { Flex, Heading } from "@radix-ui/themes";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { Tracker } from "./components/Tracker";

export function Title() {
  const { unwrap } = useLocale();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const revealed = Tankopedia.use((state) => state.revealed);
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const name = unwrap(protagonist.name);
  const fontSize = revealed
    ? disturbed
      ? "1.5rem"
      : "2rem"
    : `min(12vh, ${75 / name.length}vw)`;

  return (
    <Flex
      onPointerDown={(event) => {
        event.preventDefault();

        Tankopedia.mutate((draft) => {
          draft.revealed = true;
        });
      }}
      direction="column"
      position="absolute"
      align="center"
      justify="center"
      top={revealed ? "-4rem" : "50%"}
      left="50%"
      width="100%"
      height={revealed ? fontSize : "100%"}
      style={{
        pointerEvents: revealed ? "none" : undefined,
        transitionDuration: "1s",
        transform: revealed
          ? "translate(-50%, -100%)"
          : "translate(-50%, -50%)",
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

      {!revealed && <Tracker fontSize={fontSize} />}
    </Flex>
  );
}
