import { alias } from "@blitzkit/core";
import { DownloadIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";

export function ModelDownloadButton() {
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const { strings } = useLocale();

  return (
    <Tooltip
      content={strings.website.tools.tankopedia.sandbox.model_download.name}
    >
      <IconButton asChild color="gray" size="2" variant="surface" highContrast>
        <a
          href={alias("api", `/tanks/${protagonistTank.id}/model.glb`)}
          download={`${protagonistTank.slug}.glb`}
        >
          <DownloadIcon />
        </a>
      </IconButton>
    </Tooltip>
  );
}
