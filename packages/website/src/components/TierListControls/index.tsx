import { ReloadIcon, Share2Icon } from "@radix-ui/react-icons";
import { withLocale } from "../../hocs/withLocale";
import { useStrings } from "../../hooks/useStrings";
import { TierList } from "../../stores/tierList";
import { Button } from "../Button";
import { CopyButton } from "../CopyButton";
import styles from "./index.module.css";

export const TierListControls = withLocale(Content);

function Content() {
  const strings = useStrings();

  return (
    <div className={styles.controls}>
      <Button
        variant="soft"
        color="red"
        onClick={() => {
          TierList.set(TierList.initial);
        }}
      >
        <ReloadIcon />
        {strings.tier_list.reset}
      </Button>

      {/* The url is kept in sync with the rows */}
      <CopyButton variant="soft" copy={() => location.href}>
        <Share2Icon />
        {strings.tier_list.share}
      </CopyButton>
    </div>
  );
}
