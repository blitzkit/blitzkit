import { alias } from "@blitzkit/core";
import { Flex, Heading } from "@radix-ui/themes";
import { api } from "../../core/blitzkit/api";
import { useLocale } from "../../hooks/useLocale";
import { Maps } from "../../stores/maps";

const mapDefinitions = await api.mapDefinitions();

export function MinimapSection() {
  const { strings, unwrap } = useLocale();
  const id = Maps.use((state) => state.id);

  return (
    <Flex direction="column" gap="4" align="center" px="4">
      <Heading size="6">{strings.website.tools.maps.minimap}</Heading>

      <img
        alt={unwrap(mapDefinitions.maps[id].name!)}
        src={alias("api", `/maps/${id}/icons/minimap.webp`)}
        draggable={false}
        style={{
          width: "100%",
          maxWidth: "32rem",
          aspectRatio: "1",
          borderRadius: "var(--radius-3)",
        }}
      />
    </Flex>
  );
}
