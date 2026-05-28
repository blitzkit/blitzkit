import { formatCompact } from "@blitzkit/core";
import type { StandardPrice } from "@protos/blitz_static_standard_price";
import type { StandardSinglePrice } from "@protos/blitz_static_standard_single_price";
import type { ComponentProps } from "react";
import { useLocale } from "../../hooks/useLocale";
import { classNames } from "../../ui/classNames";
import { Text } from "../Text";
import styles from "./index.module.css";
import { useStrings } from "../../hooks/useStrings";

interface PriceProps extends ComponentProps<"div"> {
  price?: StandardPrice;
}

export function Price({ price, className, ...props }: PriceProps) {
  const strings = useStrings();
  const normalized =
    price === undefined
      ? []
      : price.price_list.filter(
          (entry) =>
            entry.currency_price === undefined ||
            entry.currency_price.amount !== 0,
        );

  return (
    <div className={classNames(styles.price, className)} {...props}>
      {normalized.map((entry, index) => (
        <PriceEntry key={index} entry={entry} />
      ))}

      {price === undefined ||
        (normalized.length === 0 && (
          <Text className={styles.entry} lowContrast>
            {strings.price.free}
          </Text>
        ))}
    </div>
  );
}

interface PriceEntryProps {
  entry: StandardSinglePrice;
}

function PriceEntry({ entry }: PriceEntryProps) {
  if (entry.premium_time_price !== undefined) {
    throw new Error("Unsupported price type");
  }

  return (
    <>
      {entry.currency_price && (
        <PriceInternal
          icon={`/media/currencies/${entry.currency_price.currency_catalog_id}.webp`}
          value={entry.currency_price.amount}
        />
      )}

      {entry.stuff_price && (
        <PriceInternal
          icon={`/media/stuff/${entry.stuff_price.stuff_catalog_id}.webp`}
          value={entry.stuff_price.amount}
        />
      )}
    </>
  );
}

interface PriceInternalProps {
  icon: string;
  value: number;
}

function PriceInternal({ icon, value }: PriceInternalProps) {
  const locale = useLocale();

  return (
    <Text weight="light" lowContrast className={styles.entry}>
      <div className={styles.wrapper}>
        <img className={styles.icon} src={icon} />
        {formatCompact(locale, value)}
      </div>
    </Text>
  );
}
