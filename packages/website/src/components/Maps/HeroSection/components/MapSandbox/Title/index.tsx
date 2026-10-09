import { Flex, Heading } from "@radix-ui/themes";
import { api } from "../../../../../../core/blitzkit/api";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Maps } from "../../../../../../stores/maps";

const mapDefinitions = await api.mapDefinitions();

export function Title() {
  const { unwrap } = useLocale();
  const id = Maps.use((state) => state.id);
  const revealed = Maps.use((state) => state.revealed);
  const disturbed = Maps.use((state) => state.disturbed);
  const name = unwrap(mapDefinitions.maps[id].name!);
  const fontSize = revealed
    ? disturbed
      ? "1.5rem"
      : "2rem"
    : `min(12vh, ${75 / name.length}vw)`;

  return (
    <Flex
      position="absolute"
      align="center"
      justify="center"
      top={revealed ? (disturbed ? "3rem" : "6rem") : "50%"}
      left="50%"
      width="100%"
      height={revealed ? fontSize : "100%"}
      style={{
        pointerEvents: "none",
        transitionDuration: "1s",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Heading
        wrap="nowrap"
        style={{
          fontWeight: 900,
          userSelect: "none",
          fontSize,
          whiteSpace: "nowrap",
          opacity: revealed ? 1 : 0.5,
          transition: "font-size 1s, opacity 1s",
        }}
      >
        {name}
      </Heading>
    </Flex>
  );
}
