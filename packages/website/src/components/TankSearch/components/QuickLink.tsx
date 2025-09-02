import { type TankDefinition } from "@blitzkit/core";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { Button, TextField } from "@radix-ui/themes";
import { useLocale } from "../../../hooks/useLocale";
import { TankFilters } from "../../../stores/tankFilters";
import { LinkI18n } from "../../LinkI18n";

interface QuickLinkProps {
  topResult?: TankDefinition;
}

export function QuickLink({ topResult }: QuickLinkProps) {
  const { locale, unwrap } = useLocale();
  const search = TankFilters.use((state) => state.search);
  const searching = TankFilters.use((state) => state.searching);

  if (!search || !topResult || searching) return null;

  return (
    <TextField.Slot>
      <LinkI18n locale={locale} href={`/tanks/${topResult.slug}`}>
        <Button variant="ghost">
          {unwrap(topResult.name)} <CaretRightIcon />
        </Button>
      </LinkI18n>
    </TextField.Slot>
  );
}
