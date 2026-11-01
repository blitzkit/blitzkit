import { alias, type MapDefinition } from "@blitzkit/core";
import { Text } from "@radix-ui/themes";
import { useLocale } from "../../../hooks/useLocale";
import { LinkI18n } from "../../LinkI18n";

export function MapCard({ map }: { map: MapDefinition }) {
  const { unwrap, locale } = useLocale();
  const name = unwrap(map.name!);

  return (
    <Text size="2" className="map-search-card">
      <LinkI18n
        locale={locale}
        className="link"
        underline="hover"
        href={`/maps/${map.slug}`}
      >
        <img
          alt={name}
          src={alias("api", `/maps/${map.id}/icons/big.webp`)}
          className="image"
          draggable={false}
        />
        <Text align="center" className="name">
          {name}
        </Text>
      </LinkI18n>
    </Text>
  );
}
